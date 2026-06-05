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

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
};

type ItunesResult = {
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  artworkUrl100?: string;
  releaseDate?: string;
  collectionId?: number;
  wrapperType?: string;
  kind?: string;
};

type SongInfo = {
  title: string | undefined;
  artist: string | undefined;
  album: string | undefined;
  cover: string | undefined;
  releaseDate: Date | null;
};

// ===============================
// 🎯 工具函数
// ===============================
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalize(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, "");
}

function namesMatch(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

function isPlaceholderImage(url: string): boolean {
  const u = url.toLowerCase();
  return (
    !u ||
    u.includes("artist//") ||
    u.includes("000000-80-0-0") ||
    u.includes("default") ||
    u.endsWith("/artist//120x120-000000-80-0-0.jpg")
  );
}

function upgradeArtworkUrl(url: string, size = 500): string {
  return url
    .replace("100x100bb", `${size}x${size}bb`)
    .replace("100x100", `${size}x${size}`);
}

function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

function parseReleaseDateFromMetadata(metadata: mm.IAudioMetadata): Date | null {
  const common = metadata.common;
  if (isDate(common.date) && !isNaN(common.date.getTime())) {
    return common.date;
  }
  if (typeof common.year === "number" && common.year > 1900) {
    return new Date(common.year, 0, 1);
  }
  return null;
}

function parseItunesReleaseDate(value?: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

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
  } catch {
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
// 🎯 网络请求
// ===============================
async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: FETCH_HEADERS });
    if (!res.ok) {
      console.warn(`HTTP ${res.status}: ${url}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`请求失败: ${url} — ${msg}`);
    return null;
  }
}

async function fetchFromItunes(
  query: string,
  extraParams = "",
): Promise<ItunesResult[]> {
  const urls = [
    `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=15&${extraParams}`,
    `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=15&country=CN&${extraParams}`,
    `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=15&country=JP&${extraParams}`,
  ];

  for (const url of urls) {
    const data = await fetchJson<{ results?: ItunesResult[] }>(url);
    if (data?.results?.length) return data.results;
    await sleep(200);
  }
  return [];
}

function pickBestItunesMatch(
  results: ItunesResult[],
  artist: string,
  title?: string,
  album?: string,
): ItunesResult | null {
  if (!results.length) return null;

  const scored = results.map((item) => {
    let score = 0;
    if (title && namesMatch(item.trackName || "", title)) score += 3;
    if (namesMatch(item.artistName || "", artist)) score += 3;
    if (album && namesMatch(item.collectionName || "", album)) score += 2;
    if (item.artworkUrl100) score += 1;
    if (item.releaseDate) score += 1;
    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  return best && best.score > 0 ? best.item : results[0] ?? null;
}

// ===============================
// 🎯 iTunes 歌曲 / 专辑信息
// ===============================
async function fetchSongInfo(
  artist: string,
  title: string,
  albumHint?: string | null,
): Promise<SongInfo | null> {
  try {
    const mainArtist = (
      artist.split(/,|&|\/|、|\+|feat\.?|ft\.?/i)[0] ?? artist
    ).trim();

    const results = await fetchFromItunes(
      `${mainArtist} ${title}`,
      "media=music",
    );
    if (!results.length) return null;

    const result = pickBestItunesMatch(
      results,
      mainArtist,
      title,
      albumHint ?? undefined,
    );
    if (!result) return null;

    return {
      title: result.trackName,
      artist: result.artistName,
      album: result.collectionName,
      cover: result.artworkUrl100
        ? upgradeArtworkUrl(result.artworkUrl100)
        : undefined,
      releaseDate: parseItunesReleaseDate(result.releaseDate),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log("❌ iTunes 歌曲查询失败:", msg);
    return null;
  }
}

async function fetchAlbumReleaseDate(
  artist: string,
  album: string,
): Promise<Date | null> {
  const mainArtist = (
    artist.split(/,|&|\/|、|\+|feat\.?|ft\.?/i)[0] ?? artist
  ).trim();

  // 1. 按专辑名搜索
  const albumResults = await fetchFromItunes(
    `${mainArtist} ${album}`,
    "entity=album&media=music",
  );
  const albumHit = albumResults.find(
    (r) =>
      namesMatch(r.collectionName || "", album) &&
      namesMatch(r.artistName || "", mainArtist),
  );
  if (albumHit?.releaseDate) {
    return parseItunesReleaseDate(albumHit.releaseDate);
  }

  // 2. 从歌曲搜索结果里取同专辑的 releaseDate
  const trackResults = await fetchFromItunes(
    `${mainArtist} ${album}`,
    "media=music",
  );
  const trackHit = trackResults.find(
    (r) =>
      namesMatch(r.collectionName || "", album) &&
      namesMatch(r.artistName || "", mainArtist) &&
      r.releaseDate,
  );
  if (trackHit?.releaseDate) {
    return parseItunesReleaseDate(trackHit.releaseDate);
  }

  // 3. lookup by collectionId（最准确）
  const collectionId = albumHit?.collectionId ?? trackHit?.collectionId;
  if (collectionId) {
    const lookup = await fetchJson<{ results?: ItunesResult[] }>(
      `https://itunes.apple.com/lookup?id=${collectionId}&entity=album`,
    );
    const detail = lookup?.results?.find((r) => r.wrapperType === "collection");
    if (detail?.releaseDate) {
      return parseItunesReleaseDate(detail.releaseDate);
    }
  }

  return null;
}

// ===============================
// 🎯 歌手头像（多源回退）
// ===============================
async function saveArtistImageFile(
  artistName: string,
  imageUrl: string,
): Promise<string | null> {
  if (isPlaceholderImage(imageUrl)) return null;

  const fileName = `artist_${artistName.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, "_")}.jpg`;
  const savePath = path.join(RESOURCE_PATH, fileName);

  if (!fs.existsSync(savePath)) {
    try {
      await downloadImage(imageUrl, savePath);
      console.log(`🎤 歌手头像已保存: ${fileName}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`❌ 下载歌手头像失败 [${artistName}]:`, msg);
      return null;
    }
  }
  return fileName;
}

async function fetchArtistImageFromDeezer(
  artistName: string,
): Promise<string | null> {
  const data = await fetchJson<{
    data?: { name: string; picture_xl?: string; picture_big?: string }[];
  }>(
    `https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}&limit=8`,
  );

  const candidates = data?.data ?? [];
  const match =
    candidates.find((a) => namesMatch(a.name, artistName)) ?? candidates[0];
  const imageUrl = match?.picture_xl || match?.picture_big;
  if (!imageUrl || isPlaceholderImage(imageUrl)) return null;

  return saveArtistImageFile(artistName, imageUrl);
}

async function fetchArtistImageFromItunes(
  artistName: string,
): Promise<string | null> {
  const results = await fetchFromItunes(
    artistName,
    "entity=musicArtist&media=music",
  );

  const match =
    results.find((r) => namesMatch(r.artistName || "", artistName)) ??
    results[0];
  const imageUrl = match?.artworkUrl100;
  if (!imageUrl || isPlaceholderImage(imageUrl)) return null;

  return saveArtistImageFile(artistName, upgradeArtworkUrl(imageUrl));
}

async function fetchArtistImageFromAudioDB(
  artistName: string,
): Promise<string | null> {
  const data = await fetchJson<{
    artists?: { strArtist?: string; strArtistThumb?: string }[] | null;
  }>(
    `https://www.theaudiodb.com/api/v1/json/2/search.php?s=${encodeURIComponent(artistName)}`,
  );

  const artists = data?.artists;
  if (!artists?.length) return null;

  const match =
    artists.find((a) => namesMatch(a.strArtist || "", artistName)) ??
    artists[0];
  const imageUrl = match?.strArtistThumb;
  if (!imageUrl || isPlaceholderImage(imageUrl)) return null;

  return saveArtistImageFile(artistName, imageUrl);
}

/** 用歌曲搜索结果里的艺术家名再搜一次（日韩艺人常有效） */
async function fetchArtistImageViaTrackSearch(
  artistName: string,
): Promise<string | null> {
  const results = await fetchFromItunes(artistName, "media=music&limit=5");
  const hit = results.find((r) => namesMatch(r.artistName || "", artistName));
  if (!hit?.artworkUrl100) return null;
  return saveArtistImageFile(artistName, upgradeArtworkUrl(hit.artworkUrl100));
}

async function fetchArtistImage(artistName: string): Promise<string | null> {
  const sources = [
    () => fetchArtistImageFromDeezer(artistName),
    () => fetchArtistImageFromItunes(artistName),
    () => fetchArtistImageFromAudioDB(artistName),
    () => fetchArtistImageViaTrackSearch(artistName),
  ];

  for (const trySource of sources) {
    const fileName = await trySource();
    if (fileName) return fileName;
    await sleep(250);
  }

  console.warn(`⚠️ 所有来源均未找到歌手头像: ${artistName}`);
  return null;
}

// ===============================
// 🎯 歌手简介（TheAudioDB + Wikipedia 中文）
// ===============================
async function fetchBioFromAudioDB(
  artistName: string,
): Promise<string | null> {
  const data = await fetchJson<{
    artists?: {
      strArtist?: string;
      strBiographyCN?: string;
      strBiographyEN?: string;
    }[] | null;
  }>(
    `https://www.theaudiodb.com/api/v1/json/2/search.php?s=${encodeURIComponent(artistName)}`,
  );

  const artists = data?.artists;
  if (!artists?.length) return null;

  const match =
    artists.find((a) => namesMatch(a.strArtist || "", artistName)) ??
    artists[0];

  // 优先中文简介
  const bio = match?.strBiographyCN || match?.strBiographyEN || null;
  if (bio && bio.length > 20) {
    console.log(`📝 TheAudioDB 获取到简介: ${artistName} (${bio.length} 字符)`);
    return bio;
  }
  return null;
}

async function fetchBioFromWikipedia(
  artistName: string,
): Promise<string | null> {
  try {
    // 1. 搜索中文维基百科
    const searchData = await fetchJson<{
      query?: { search?: { pageid: number; title: string }[] };
    }>(
      `https://zh.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(artistName)}&format=json&origin=*`,
    );

    const searchResults = searchData?.query?.search;
    if (!searchResults?.length) return null;

    // 找到名称匹配的页面
    const match =
      searchResults.find((r) => namesMatch(r.title, artistName)) ??
      searchResults[0];
    if (!match) return null;
    const pageId = match.pageid;

    // 2. 获取页面摘要
    const extractData = await fetchJson<{
      query?: { pages?: Record<string, { extract?: string }> };
    }>(
      `https://zh.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&pageids=${pageId}&format=json&origin=*`,
    );

    const pages = extractData?.query?.pages;
    if (!pages) return null;

    const page = pages[String(pageId)];
    const extract = page?.extract;

    if (extract && extract.length > 20) {
      // 清理参考标记 [1] [2] 等
      const cleaned = extract.replace(/\[\d+\]/g, "").trim();
      console.log(
        `📝 Wikipedia 获取到简介: ${artistName} (${cleaned.length} 字符)`,
      );
      return cleaned;
    }
    return null;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`⚠️ Wikipedia 查询失败 [${artistName}]: ${msg}`);
    return null;
  }
}

async function fetchArtistBio(artistName: string): Promise<string | null> {
  // 1. 先尝试 TheAudioDB
  const audioDbBio = await fetchBioFromAudioDB(artistName);
  if (audioDbBio) return audioDbBio;

  await sleep(200);

  // 2. 回退到 Wikipedia 中文
  const wikiBio = await fetchBioFromWikipedia(artistName);
  if (wikiBio) return wikiBio;

  console.warn(`⚠️ 未找到歌手简介: ${artistName}`);
  return null;
}

// ===============================
// 🎯 下载封面
// ===============================
async function downloadImage(url: string, savePath: string) {
  const res = await fetch(url, { headers: FETCH_HEADERS });
  if (!res.ok) throw new Error(`下载失败 HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 500) throw new Error("图片过小，可能无效");
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

    let duration = getDuration(fullPath);

    const buffer = fs.readFileSync(fullPath);
    const metadata = await mm.parseBuffer(buffer, "audio/mpeg", {
      duration: true,
    });

    console.log("🎧 metadata:", {
      duration: metadata.format.duration,
      codec: metadata.format.codec,
      date: metadata.common.date,
      year: metadata.common.year,
    });

    if (!duration || duration < 10) {
      duration = metadata.format.duration || 0;
    }

    if (duration < 10) {
      console.warn("❌ 跳过异常文件:", file);
      continue;
    }

    let title = metadata.common.title || "";
    let artist =
      metadata.common.artist ||
      metadata.common.albumartist ||
      metadata.common.artists?.[0] ||
      "";

    let album = metadata.common.album || null;
    let releaseDate = parseReleaseDateFromMetadata(metadata);

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

    const pic = metadata.common.picture?.[0];
    if (pic?.data) {
      coverFileName = `${baseName}.jpg`;
      fs.writeFileSync(path.join(RESOURCE_PATH, coverFileName), pic.data);
      console.log("💾 已从内嵌元数据保存封面");
    }

    let onlineInfo: SongInfo | null = null;
    if (artist !== "Unknown Artist") {
      console.log(`🔍 在线补全: ${artist} - ${title}`);
      onlineInfo = await fetchSongInfo(artist, title, album);
      await sleep(300);

      if (onlineInfo) {
        if (!album && onlineInfo.album) album = onlineInfo.album;
        if (!releaseDate && onlineInfo.releaseDate) {
          releaseDate = onlineInfo.releaseDate;
          console.log(`📅 从歌曲信息获取发行日: ${releaseDate.toISOString().slice(0, 10)}`);
        }
      }
    }

    if (!coverFileName && onlineInfo?.cover) {
      console.log(`🌐 发现 iTunes 封面: ${onlineInfo.cover}`);
      coverFileName = `${baseName}.jpg`;
      try {
        await downloadImage(
          onlineInfo.cover,
          path.join(RESOURCE_PATH, coverFileName),
        );
        console.log("✅ 封面下载成功");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("❌ 下载封面失败:", msg);
        coverFileName = null;
      }
    } else if (!coverFileName && artist !== "Unknown Artist") {
      console.warn("⚠️ 未找到可用封面");
    }

    const artistList = parseArtists(artist);

    // 并行获取每个歌手的头像和简介
    const artistMeta = await Promise.all(
      artistList.map(async (name) => {
        const existing = await prisma.artist.findUnique({ where: { name } });
        const avatar = existing?.avatar
          ? existing.avatar
          : await fetchArtistImage(name);
        const bio = existing?.bio
          ? existing.bio
          : await fetchArtistBio(name);
        return { name, avatar, bio };
      }),
    );

    const artistRecords = await Promise.all(
      artistMeta.map(({ name, avatar, bio }) =>
        prisma.artist.upsert({
          where: { name },
          update: {
            ...(avatar ? { avatar } : {}),
            ...(bio ? { bio } : {}),
          },
          create: {
            name,
            avatar: avatar ?? null,
            bio: bio ?? null,
          },
        }),
      ),
    );
    const mainArtist = artistRecords[0];

    if (album && !releaseDate) {
      console.log(`📅 查询专辑发行日: ${album}`);
      const fetched = await fetchAlbumReleaseDate(artist, album);
      if (fetched) {
        releaseDate = fetched;
        console.log(`📅 专辑发行日: ${releaseDate.toISOString().slice(0, 10)}`);
      } else {
        console.warn(`⚠️ 未找到专辑发行日: ${album}`);
      }
      await sleep(300);
    }

    let dbAlbum = null;

    if (album && mainArtist) {
      dbAlbum = await prisma.album.upsert({
        where: {
          title_artistId: {
            title: album,
            artistId: mainArtist.id,
          },
        },
        update: {
          ...(coverFileName ? { coverUrl: coverFileName } : {}),
          ...(releaseDate ? { releaseDate } : {}),
        },
        create: {
          title: album,
          artistId: mainArtist.id,
          coverUrl: coverFileName,
          releaseDate,
        },
      });
    }

    const lrcFile = file.replace(".mp3", ".lrc");
    const hasLrc = fs.existsSync(path.join(RESOURCE_PATH, lrcFile));

    await prisma.song.upsert({
      where: { filePath: file },
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

    const dateStr = releaseDate
      ? releaseDate.toISOString().slice(0, 10)
      : "未知";
    console.log(`✅ 完成: ${title} - ${artist} (${album || "无专辑"}, 发行: ${dateStr})`);
  }

  await prisma.$disconnect();
  await pool.end();
}

scanAndSync().catch((err) => {
  console.error(err);
  process.exit(1);
});
