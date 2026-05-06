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

const RESOURCE_PATH = "C:/Users/DGZ/Desktop/resource";

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
    const result = results.find((item: any) => {
      const a = normalize(item.artistName || "");
      const t = normalize(item.trackName || "");
      const queryArtist = normalize(mainArtist); // 用 mainArtist 而不是完整 artist

      return (
        (a.includes(queryArtist) || queryArtist.includes(a)) &&
        (t.includes(normalize(title)) || normalize(title).includes(t))
      );
    });

    if (!result) return null;

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
    const res = await fetch(
      `https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}&limit=1`,
    );
    const data = await res.json();
    const artist = data.data?.[0];

    if (!artist?.picture_xl) return null;

    const fileName = `artist_${artistName.replace(/[^a-zA-Z0-9]/g, "_")}.jpg`;
    const savePath = path.join(RESOURCE_PATH, fileName);

    if (!fs.existsSync(savePath)) {
      await downloadImage(artist.picture_xl, savePath);
      console.log(`🎤 歌手图片已保存: ${fileName}`);
    }

    return fileName;
  } catch (err: any) {
    console.warn(`⚠️ Deezer 获取歌手图片失败 [${artistName}]:`, err.message);
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
    // 4️⃣ 封面
    // =========================
    const pic = metadata.common.picture?.[0];
    console.log(
      "🖼️ 内嵌封面:",
      pic ? `${pic.format}, ${pic.data?.length} bytes` : "无",
    );
    if (pic?.data) {
      coverFileName = `${baseName}.jpg`;
      fs.writeFileSync(path.join(RESOURCE_PATH, coverFileName), pic.data);
    }

    // =========================
    // 5️⃣ iTunes 补全
    // =========================
    if (!album && artist !== "Unknown Artist") {
      const info = await fetchSongInfo(artist, title);
      console.log("🍎 iTunes 结果:", info);
      if (info) {
        // title = info.title || title;
        // artist = info.artist || artist;
        album = info.album || album;

        if (!coverFileName && info.cover) {
          coverFileName = `${baseName}.jpg`;
          await downloadImage(
            info.cover,
            path.join(RESOURCE_PATH, coverFileName),
          );
        }
      }

      await new Promise((r) => setTimeout(r, 200));
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
        update: {},
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
