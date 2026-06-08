import { useEffect, useState, type Key } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setPlaylist,
  togglePlay,
  selectCurrentSong,
} from "../../store/songSlice";
import type { RootState } from "../../store/store";
import { Dropdown, Button, Label } from "@heroui/react";

import server from "../../axios/server";
import PageLoading from "../../components/pageLoading";
import TrackIndex from "../../components/trackIndex";
import styles from "./index.module.scss";

interface AlbumDetailResponse {
  message: string;
  album: {
    id: number;
    title: string;
    coverUrl: string | null;
    releaseDate: string | null;
    artistId: number;
    artist: {
      id: number;
      name: string;
      avatar: string | null;
      bio: string | null;
    };
    songs: {
      id: number;
      title: string;
      duration: number;
      filePath: string;
      coverUrl: string | null;
      playCount: number;
      lyricPath: string | null;
      albumId: number | null;
      artists: {
        id: number;
        name: string;
      }[];
    }[];
  };
}

type Album = AlbumDetailResponse["album"];

export default function Album() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredSongId, setHoveredSongId] = useState<number | null>(null);
  const { isPlaying } = useSelector((state: RootState) => state.player);
  const currentSong = useSelector(selectCurrentSong);

  useEffect(() => {
    if (!id) return;
    server
      .get<any, AlbumDetailResponse>(`/api/song/album/${id}`)
      .then(({ album }) => {
        setAlbum(album);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // 格式化时长
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const toPlaylist = () => {
    if (!album) return [];
    return album.songs.map((s) => ({
      id: s.id,
      title: s.title,
      duration: s.duration,
      filePath: s.filePath,
      coverUrl: s.coverUrl,
      playCount: s.playCount,
      lyricPath: s.lyricPath,
      artist: s.artists.map((a) => a.name).join("/"),
    }));
  };

  const handlePlayAll = () => {
    if (!album) return;
    dispatch(
      setPlaylist({
        list: toPlaylist(),
        startIndex: 0,
      }),
    );
  };

  // 播放 / 暂停单曲
  const handleTrackToggle = (index: number, songId: number) => {
    if (!album) return;
    if (currentSong?.id === songId) {
      dispatch(togglePlay());
      return;
    }
    dispatch(
      setPlaylist({
        list: toPlaylist(),
        startIndex: index,
      }),
    );
  };

  if (loading) return <PageLoading />;
  if (!album) return <div className={styles.emptyState}>Album not found</div>;

  const handleAction = (key: Key) => {
    switch (key) {
      default:
        break;
    }
  };

  return (
    <div className={styles.albumBox}>
      {/* Header */}
      <div className={styles.header}>
        <img
          src={album.coverUrl ?? ""}
          alt={album.title}
          className={styles.cover}
        />
        <div className={styles.info}>
          <div>
            <h1 className={styles.title}>{album.title}</h1>
            <p className={styles.artist}>{album.artist.name}</p>
          </div>
          {album.artist.bio && (
            <p className={styles.bio}>{album.artist.bio}</p>
          )}
          <p className={styles.release}>
            {album.releaseDate
              ? new Date(album.releaseDate).toLocaleDateString()
              : "Release date unknown"}
            {" · "}
            {album.songs.length} songs
          </p>
        </div>
      </div>

      {/* Play All Button */}
      <div className={styles.actions}>
        <button onClick={handlePlayAll} className={styles.playAllBtn}>
          <span className="material-symbols-outlined">play_arrow</span>
          Play All
        </button>
      </div>

      {/* Track List */}
      <div className={styles.songList}>
        {album.songs.map((song, index) => {
          const isActive = currentSong?.id === song.id;

          return (
            <div
              key={song.id}
              className={`${styles.songItem} ${isActive ? styles.active : ""}`}
              onMouseEnter={() => setHoveredSongId(song.id)}
              onMouseLeave={() => setHoveredSongId(null)}
              onClick={() => handleTrackToggle(index, song.id)}
            >
              <TrackIndex
                index={index}
                isActive={isActive}
                isPlaying={isActive && isPlaying}
                hovered={hoveredSongId === song.id}
                onToggle={() => handleTrackToggle(index, song.id)}
              />
              <div className={styles.songInfo}>
                <p className={styles.songTitle}>{song.title}</p>
                <p className={styles.songArtist}>
                  {song.artists.map((a) => a.name).join("/")}
                </p>
              </div>

              <span className={styles.duration}>
                {formatDuration(song.duration)}
              </span>

              <div onClick={(e) => e.stopPropagation()}>
                <Dropdown>
                  <Button isIconOnly variant="tertiary" aria-label="More">
                    <span className="material-symbols-outlined">more_vert</span>
                  </Button>
                  <Dropdown.Popover>
                    <Dropdown.Menu onAction={handleAction}>
                      <Dropdown.Item id="copy" textValue="Copy">
                        <Label>Add to playlist</Label>
                      </Dropdown.Item>
                      <Dropdown.Item id="share" textValue="Share">
                        <Label>Share</Label>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
