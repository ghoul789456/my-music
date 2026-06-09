import { useEffect, useState } from "react";
import server from "../../axios/server";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { setPlaylist } from "../../store/songSlice";
import SingerCard from "../../components/card";
import AnimationTypes from "../../components/skeleton";
import styles from "./index.module.scss";

export default function Home() {
  interface Song { id: number; title: string; duration: number; filePath: string; coverUrl: string | null; playCount: number | null; lyricPath?: string | null; artists: { id: number; name: string }[]; }
  interface Album { id: number; title: string; coverUrl: string | null; artist: { name: string }; }
  interface Artist { id: number; name: string; avatar: string | null; }
  interface HomeHotResponse { songs: Song[]; albums: Album[]; artists: Artist[]; }

  const [list, setList] = useState<any[]>([]);
  const [albumList, setAlbumList] = useState<any[]>([]);
  const [artistList, setArtistList] = useState<any[]>([]);
  const [rawSongs, setRawSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    server.get<any, HomeHotResponse>("/api/song/hot").then(({ songs, albums, artists }) => {
      setRawSongs(songs);
      setList(songs.map(s => ({ id: String(s.id), primary: s.title, secondary: s.artists.map(a => a.name).join("/"), url: s.coverUrl })));
      setAlbumList(albums.map(a => ({ id: String(a.id), primary: a.title, secondary: a.artist.name, url: a.coverUrl })));
      setArtistList(artists.map(a => ({ id: String(a.id), primary: a.name, secondary: "艺人", url: a.avatar })));
      setLoading(false);
    });
  }, []);

  const dispatch = useDispatch();
  const handlePlay = (id: string) => {
    const index = rawSongs.findIndex(s => String(s.id) === id);
    if (index === -1) return;
    dispatch(setPlaylist({
      list: rawSongs.map(s => ({ id: s.id, title: s.title, duration: s.duration, filePath: s.filePath, coverUrl: s.coverUrl, playCount: s.playCount, artist: s.artists.map(a => a.name).join("/"), lyricPath: s.lyricPath })),
      startIndex: index,
    }));
  };

  const navigate = useNavigate();

  return (
    <div className={styles.homeContainer}>
      {loading ? <AnimationTypes /> : (
        <>
          {/* 为你推荐 — 网格布局 */}
          <SingerCard
            title="为你推荐"
            list={list.slice(0, 12)}
            layout="scroll"
            size="lg"
            onCardClick={() => {}}
            onPlayClick={(item: any) => handlePlay(item.id)}
          />

          {/* 当红艺人 — 横向滚动 + 圆形 */}
          <SingerCard title="当红艺人" list={artistList.slice(0, 12)} isRound layout="scroll" size="lg"
            onCardClick={() => { }} onPlayClick={() => { }} />

          {/* 精选专辑 — 横向滚动 + 大尺寸 */}
          <SingerCard title="精选专辑" list={albumList.slice(0, 12)} layout="scroll" size="lg"
            onCardClick={(item) => navigate(`/album/${item.id}`)} onPlayClick={() => { }} />
        </>
      )}
    </div>
  );
}
