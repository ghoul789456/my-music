export type PlaybackMode = "loop" | "single" | "shuffle";

export interface PlayerSong {
  id: number;
  title: string;
  duration: number;
  filePath: string | null;
  coverUrl: string | null;
  playCount: number | null;
  artist: string;
  lyricPath: string | null;
}
