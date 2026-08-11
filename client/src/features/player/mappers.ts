import type { SongDto } from "../music/types";
import type { PlayerSong } from "./types";

export function toPlayerSong(song: SongDto): PlayerSong {
  return {
    id: song.id,
    title: song.title,
    duration: song.duration,
    filePath: song.filePath,
    coverUrl: song.coverUrl,
    playCount: song.playCount,
    artist: song.artists.map((artist) => artist.name).join("/"),
    lyricPath: song.lyricPath ?? null,
  };
}
