import server from "../../axios/server";
import type {
  AlbumDetailResponse,
  HomeHotResponse,
  LyricsResponse,
} from "./types";

export const musicApi = {
  getHomeHot: () =>
    server.get<HomeHotResponse, HomeHotResponse>("/api/song/hot"),

  getAlbum: (id: string) =>
    server.get<AlbumDetailResponse, AlbumDetailResponse>(
      `/api/song/album/${id}`,
    ),

  getLyrics: (songId: number, signal?: AbortSignal) =>
    server.get<LyricsResponse, LyricsResponse>(`/api/song/${songId}/lyric`, {
      signal,
    }),
};
