export interface ArtistDto {
  id: number;
  name: string;
  avatar?: string | null;
  bio?: string | null;
}

export interface SongDto {
  id: number;
  title: string;
  duration: number;
  filePath: string | null;
  coverUrl: string | null;
  playCount: number | null;
  lyricPath?: string | null;
  artists: ArtistDto[];
}

export interface AlbumSummaryDto {
  id: number;
  title: string;
  coverUrl: string | null;
  artist: Pick<ArtistDto, "name">;
}

export interface AlbumDetailDto {
  id: number;
  title: string;
  coverUrl: string | null;
  releaseDate: string | null;
  artistId: number;
  artist: ArtistDto;
  songs: SongDto[];
}

export interface HomeHotResponse {
  songs: SongDto[];
  albums: AlbumSummaryDto[];
  artists: ArtistDto[];
}

export interface AlbumDetailResponse {
  message: string;
  album: AlbumDetailDto;
}

export interface LyricsResponse {
  message: string;
  lyric?: string;
}
