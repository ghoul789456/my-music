import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

import * as mm from "music-metadata";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const RESOURCE_PATH = "C:/Users/15175/Desktop/resource";

// ===============================
// 🎯 ffprobe 获取准确时长
// ===============================
function getDuration(filePath: string): number {
  try {
    const result = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
    );

    const duration = parseFloat(result.toString().trim());
    return isNaN(duration) ? 0 : duration;
  } catch (err) {
    console.warn("ffprobe 失败:", filePath);
    return 0;
  }
}

// ===============================
// 🎯 歌手解析
// ===============================
function parseArtists(str: string): string[] {
  return str
    .replace(/\b(feat\.?|ft\.?|featuring)\b/gi, ",")
    .split(/,|&|\/|、|\+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// ===============================
// 🎯 iTunes 补全
// ===============================
async function fetchSongInfo(artist: string, title: string) {
  try {
    const mainArtist = (
      artist.split(/,|&|\/|、|\+|feat\.?|ft\.?/i)[0] ?? artist
    ).trim();

    const results = await fetchFromItunes(`${mainArtist} ${title}`);
    if (!results || results.length === 0) return null;
    const result = results.find((item: any) => {
      const a = normalize(item.artistName || "");
      const queryArtist = normalize(mainArtist);
      return a.includes(queryArtist) || queryArtist.includes(a);
    }) || results[0]; // <--- 兜底：如果没匹配到，直接用搜索结果的第一项


    return {
      title: result.trackName,
      artist: result.artistName,
      album: result.collectionName,
      cover: result.artworkUrl100?.replace("100x100", "500x500"),
    };
  } catch (err: any) {
    console.log("❌ iTunes 查询失败:", err.message);
    return null;
  }
}
async function fetchArtistImage(artistName: string): Promise<string | null> {
  try {
    // 1. 优先使用 Deezer，因为它的歌手图是专门的写真，不是专辑封面
    // 接口：https://api.deezer.com/search/artist?q=歌手名
    const url = `https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}&limit=1`;

    const res = await fetch(url, {
      headers: {
        // 有些 API 喜欢识别浏览器身份，加上这个更稳
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) throw new Error(`Deezer API error: ${res.status}`);

    const data = await res.json();
    const artistData = data.data?.[0];

    // 2. 检查拿到的结果是否匹配（防止搜错人）
    if (artistData && artistData.picture_xl) {
      const imageUrl = artistData.picture_xl;
      const fileName = `artist_${artistName.replace(/[^a-zA-Z0-9]/g, "_")}.jpg`;
      const savePath = path.join(RESOURCE_PATH, fileName);

      if (!fs.existsSync(savePath)) {
        await downloadImage(imageUrl, savePath);
        console.log(`🎤 真正歌手写真已保存: ${fileName}`);
      }
      return fileName;
    }

    // 3. 降级方案：如果 Deezer 没搜到，尝试 iTunes 的 musicArtist 实体
    // 注意：iTunes 的 musicArtist 只有在极少数情况下提供视图，所以这里建议返回 null 或默认头像
    console.warn(`⚠️ Deezer 未找到歌手写真: ${artistName}`);
    return null;

  } catch (err: any) {
    console.error(`❌ 获取歌手图片失败 [${artistName}]:`, err.message);
    return null;
  }
}
function normalize(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}
async function fetchFromItunes(query: string) {
  const urls = [
    `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=10&media=music`,
    `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=10&media=music&country=JP`,
  ];

  for (const url of urls) {
    const res = await fetch(url);
    const data = await res.json();
    if (data.results?.length > 0) return data.results;
  }
  return [];
}
// ===============================
// 🎯 下载封面
// ===============================
async function downloadImage(url: string, savePath: string) {
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(savePath, buffer);
}

// ===============================
// 🚀 主逻辑
// ===============================
async function scanAndSync() {
  const files = fs.readdirSync(RESOURCE_PATH).filter((f) => f.endsWith(".mp3"));

  for (const file of files) {
    const existing = await prisma.song.findUnique({
      where: { filePath: file },
    });
    if (existing) {
      console.log("⏭️ 已存在，跳过:", file);
      continue;
    }
    const fullPath = path.join(RESOURCE_PATH, file);
    const baseName = file.replace(".mp3", "");

    console.log("\n====================");
    console.log("📁 处理:", file);

    // =========================
    // 1️⃣ ffprobe 获取时长（主）
    // =========================
    let duration = getDuration(fullPath);

    // =========================
    // 2️⃣ metadata 获取标签
    // =========================
    const buffer = fs.readFileSync(fullPath);
    const metadata = await mm.parseBuffer(buffer, "audio/mpeg", {
      duration: true,
    });

    console.log("🎧 metadata:", {
      duration: metadata.format.duration,
      codec: metadata.format.codec,
    });

    // ffprobe 优先
    if (!duration || duration < 10) {
      duration = metadata.format.duration || 0;
    }

    // ❗过滤坏文件
    if (duration < 10) {
      console.warn("❌ 跳过异常文件:", file);
      continue;
    }

    // =========================
    // 3️⃣ 基础信息
    // =========================
    let title = metadata.common.title || "";
    let artist =
      metadata.common.artist ||
      metadata.common.albumartist ||
      metadata.common.artists?.[0] ||
      "";

    let album = metadata.common.album || null;

    if (!title || !artist) {
      const parts = baseName.split(" - ");
      if (parts.length === 2) {
        artist = artist || parts[0] || "";
        title = title || parts[1] || "";
      }
    }

    title = title || baseName;
    artist = artist || "Unknown Artist";

    let coverFileName: string | null = null;

    // =========================
    // 4️⃣ 封面（尝试提取内嵌）
    // =========================
    const pic = metadata.common.picture?.[0];
    if (pic?.data) {
      coverFileName = `${baseName}.jpg`;
      fs.writeFileSync(path.join(RESOURCE_PATH, coverFileName), pic.data);
      console.log("💾 已从内嵌元数据保存封面");
    }

    // =========================
    // 5️⃣ 补全逻辑（重点修改）
    // =========================
    // 只要本地没图，就去网上找
    if (!coverFileName && artist !== "Unknown Artist") {
      console.log(`🔍 正在为 ${title} 寻找在线封面...`);
      const info = await fetchSongInfo(artist, title);

      if (info && info.cover) {
        console.log(`🌐 发现 iTunes 封面: ${info.cover}`);
        coverFileName = `${baseName}.jpg`;
        try {
          await downloadImage(info.cover, path.join(RESOURCE_PATH, coverFileName));
          console.log("✅ 下载并保存成功");
        } catch (err) {
          console.error("❌ 下载封面图片失败:", err);
        }
      } else {
        console.warn("⚠️ iTunes 未匹配到结果或无封面URL");
      }
    }

    // =========================
    // 6️⃣ Artist
    // =========================
    const artistList = parseArtists(artist);

    // 每个歌手都单独获取图片
    const artistImages = await Promise.all(
      artistList.map((name) => fetchArtistImage(name)),
    );

    const artistRecords = await Promise.all(
      artistList.map((name, index) =>
        prisma.artist.upsert({
          where: { name },
          update: {
            ...(artistImages[index] ? { avatar: artistImages[index] } : {}),
          },
          create: {
            name,
            avatar: artistImages[index] ?? null,
          },
        }),
      ),
    );
    const mainArtist = artistRecords[0];

    // =========================
    // 7️⃣ Album
    // =========================
    let dbAlbum = null;

    if (album && mainArtist) {
      dbAlbum = await prisma.album.upsert({
        where: {
          title_artistId: {
            title: album,
            artistId: mainArtist.id,
          },
        },
        update: {coverUrl: coverFileName},
        create: {
          title: album,
          artistId: mainArtist.id,
          coverUrl: coverFileName,
        },
      });
    }

    // =========================
    // 8️⃣ 歌词
    // =========================
    const lrcFile = file.replace(".mp3", ".lrc");
    const hasLrc = fs.existsSync(path.join(RESOURCE_PATH, lrcFile));

    // =========================
    // 9️⃣ Song 入库
    // =========================
    await prisma.song.upsert({
      where: { filePath: file }, // 需要在 schema 里给 filePath 加 @unique
      update: {
        title,
        duration: Math.round(duration),
        coverUrl: coverFileName,
        albumId: dbAlbum?.id || null,
        lyricPath: hasLrc ? lrcFile : null,
      },
      create: {
        title,
        duration: Math.round(duration),
        filePath: file,
        lyricPath: hasLrc ? lrcFile : null,
        artists: {
          connect: artistRecords.map((a) => ({ id: a.id })),
        },
        albumId: dbAlbum?.id || null,
        coverUrl: coverFileName,
      },
    });
    console.log(`✅ 完成: ${title} - ${artist} (${album || "无专辑"})`);
  }
}

scanAndSync();
