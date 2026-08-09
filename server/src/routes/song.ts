import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import fs from "fs/promises";
import path from "path";

const router = Router();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

const BASE_URL = process.env.STATIC_BASE_URL || "http://localhost:3000/static";
// 获取热门歌曲、专辑、歌手接口
router.get("/hot", async (req: Request, res: Response) => {
  try {
    const [songs, albums, artists] = await Promise.all([
      prisma.song.findMany({
        orderBy: { playCount: "desc" },
        take: 20,
        include: {
          artists: { select: { name: true } },
        },
      }),
      prisma.album.findMany({
        take: 20,
        include: {
          artist: { select: { name: true } },
          songs: { select: { playCount: true } },
        },
      }),
      prisma.artist.findMany({
        take: 20,
        orderBy: {
          playCount: "desc",
        },
      }),
    ]);
    //专辑排序
    const sortedAlbums = albums.sort((a, b) => {
      const aTotal = a.songs.reduce((sum, s) => sum + s.playCount, 0);
      const bTotal = b.songs.reduce((sum, s) => sum + s.playCount, 0);
      return bTotal - aTotal;
    });
    const formattedAlbums = sortedAlbums.map((album) => ({
      ...album,
      coverUrl: album.coverUrl ? `${BASE_URL}/${album.coverUrl}` : null,
    }));
    // 后端统一处理图片和音频的可读 URL
    const formattedSongs = songs.map((song) => ({
      ...song,
      coverUrl: song.coverUrl ? `${BASE_URL}/${song.coverUrl}` : null,
      filePath: `${BASE_URL}/${song.filePath}`,
    }));
    const formattedArtists = artists.map((artist) => ({
      ...artist,
      avatar: artist.avatar ? `${BASE_URL}/${artist.avatar}` : null,
    }));
    res.json({
      songs: formattedSongs,
      albums: formattedAlbums,
      artists: formattedArtists,
    });
  } catch (e) {
    res.status(500).json({ message: "获取失败" });
  }
});

const resourcePath =
  process.env.RESOURCE_PATH || "C:/Users/DGZ/Desktop/resource";
// 获取歌词接口
router.get("/:id/lyric", async (req: Request, res: Response) => {
  try {
    const songId = req.params.id;

    const song = await prisma.song.findFirst({
      where: {
        id: Number(songId),
      },
    });

    if (!song?.lyricPath) {
      return res.json({
        lyric: "",
      });
    }

    // 拼接完整歌词路径
    const lyricFilePath = path.join(resourcePath, song.lyricPath);

    const lyric = await fs.readFile(lyricFilePath, "utf-8");

    res.json({
      message: "获取成功",
      lyric,
    });
  } catch (e) {
    console.log(e);

    res.status(500).json({
      message: "获取失败",
    });
  }
});

// 获取专辑接口
router.get("/album/:id", async (req: Request, res: Response) => {
  try {
    const albumId = req.params.id;

    const albumlist = await prisma.album.findUnique({
      where: {
        id: Number(albumId),
      },
      include: {
        artist: true, // 歌手信息
        songs: {
          // 专辑下的歌曲
          include: {
            artists: true, // 每首歌关联的歌手
          },
        },
      },
    });

    if (!albumlist) {
      return res.status(404).json({ message: "专辑不存在" });
    }
    const album = {
      ...albumlist,
      coverUrl: albumlist.coverUrl ? `${BASE_URL}/${albumlist.coverUrl}` : null,
    };

    res.json({
      message: "获取成功",
      album,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "获取失败" });
  }
});

export default router;
