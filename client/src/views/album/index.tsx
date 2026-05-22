import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setPlaylist } from '../../store/songSlice';
import server from '../../axios/server';
import PageLoading from '../../components/pageLoading';
import styles from './index.module.scss';

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

type Album = AlbumDetailResponse['album'];

export default function Album() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    server.get<any, AlbumDetailResponse>(`/api/song/album/${id}`).then(({ album }) => {
      setAlbum(album);
    }).finally(() => {
      setLoading(false);
    });
  }, [id]);

  // 格式化时长 180 => 3:00
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // 播放全部
  const handlePlayAll = () => {
    if (!album) return;
    dispatch(setPlaylist({
      list: album.songs.map(s => ({
        id: s.id,
        title: s.title,
        duration: s.duration,
        filePath: s.filePath,
        coverUrl: s.coverUrl,
        playCount: s.playCount,
        lyricPath: s.lyricPath,
        artist: s.artists.map(a => a.name).join('/'),
      })),
      startIndex: 0,
    }));
  };

  // 播放单曲
  const handlePlayOne = (index: number) => {
    if (!album) return;
    dispatch(setPlaylist({
      list: album.songs.map(s => ({
        id: s.id,
        title: s.title,
        duration: s.duration,
        filePath: s.filePath,
        coverUrl: s.coverUrl,
        playCount: s.playCount,
        lyricPath: s.lyricPath,
        artist: s.artists.map(a => a.name).join('/'),
      })),
      startIndex: index,
    }));
  };

  if (loading) return <PageLoading />;
  if (!album) return <div>专辑不存在</div>;

  return (
    <div className={styles.albumBox}>
      {/* 顶部信息 */}
      <div className={styles.header}>
        <img src={album.coverUrl ?? ''} alt={album.title} className={styles.cover} />
        <div className={styles.info}>
          <div>
            <p className={styles.title}>{album.title}</p>
            <p className={styles.artist}>{album.artist.name}</p>
          </div>
          <p className={styles.release}>
            {album.releaseDate
              ? new Date(album.releaseDate).toLocaleDateString()
              : '未知发行时间'}
            · {album.songs.length} 首歌曲
          </p>
        </div>
      </div>

      {/* 播放全部 */}
      <div className={styles.actions}>
        <button onClick={handlePlayAll}>▶ 播放全部</button>
      </div>

      {/* 曲目列表 */}
      <div className={styles.songList}>
        {album.songs.map((song, index) => (
          <div key={song.id} className={styles.songItem} onClick={() => handlePlayOne(index)}>
            <span className={styles.index}>{index + 1}</span>
            <div className={styles.songInfo}>
              <p className={styles.songTitle}>{song.title}</p>
              <p className={styles.songArtist}>{song.artists.map(a => a.name).join('/')}</p>
            </div>
            <span className={styles.duration}>{formatDuration(song.duration)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}