import { useCallback, useEffect, useState } from "react";
import server from "../../axios/server";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { setPlaylist } from "../../store/songSlice";
import { ArrowUpRight, Play } from "lucide-react";
import SingerCard from "../../components/card";
import AnimationTypes from "../../components/skeleton";
import Aurora from "../../components/reactbits/Aurora";
import defaultCover from "../../assets/default.jpg";
import styles from "./index.module.scss";

interface Song {
  id: number;
  title: string;
  duration: number;
  filePath: string;
  coverUrl: string | null;
  playCount: number | null;
  lyricPath?: string | null;
  artists: { id: number; name: string }[];
}

interface Album {
  id: number;
  title: string;
  coverUrl: string | null;
  artist: { name: string };
}

interface Artist {
  id: number;
  name: string;
  avatar: string | null;
}

interface HomeHotResponse {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
}

interface DisplayItem {
  id: string;
  primary: string;
  secondary: string;
  url: string;
}

export default function Home() {
  const [list, setList] = useState<DisplayItem[]>([]);
  const [albumList, setAlbumList] = useState<DisplayItem[]>([]);
  const [artistList, setArtistList] = useState<DisplayItem[]>([]);
  const [rawSongs, setRawSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadHomeData = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const { songs, albums, artists } = await server.get<unknown, HomeHotResponse>("/api/song/hot");
      setRawSongs(songs);
      setList(songs.map(s => ({ id: String(s.id), primary: s.title, secondary: s.artists.map(a => a.name).join("/"), url: s.coverUrl || defaultCover })));
      setAlbumList(albums.map(a => ({ id: String(a.id), primary: a.title, secondary: a.artist.name, url: a.coverUrl || defaultCover })));
      setArtistList(artists.map(a => ({ id: String(a.id), primary: a.name, secondary: "艺人", url: a.avatar || defaultCover })));
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const dispatch = useDispatch();
  const hasContent = list.length > 0 || artistList.length > 0 || albumList.length > 0;
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
          <section className={styles.hero} aria-labelledby="home-hero-title">
            <div className={styles.heroEffect}>
              <Aurora colorStops={["#0a3e46", "#55c0ae", "#dda265"]} amplitude={0.72} blend={0.66} speed={0.28} />
            </div>
            <div className={styles.heroShade} />
            <div className={styles.heroContent}>
              <div className={styles.heroCopy}>
                <p className={styles.eyebrow}>CURATED FOR THIS MOMENT</p>
                <h1 id="home-hero-title" className={styles.heroTitle}>
                  让声音，留在<br />恰到好处的光里。
                </h1>
                <p className={styles.heroDescription}>
                  从熟悉的旋律开始，进入一组为此刻精心挑选的声音。
                </p>
                <div className={styles.heroActions}>
                  <button
                    type="button"
                    className={styles.primaryAction}
                    onClick={() => list[0] && handlePlay(list[0].id)}
                    disabled={!list.length}
                  >
                    <Play size={17} fill="currentColor" />
                    播放今日精选
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryAction}
                    onClick={() => navigate("/playlist")}
                  >
                    浏览曲库
                    <ArrowUpRight size={17} />
                  </button>
                </div>
              </div>

              <div className={styles.featuredArt} aria-label={list[0] ? `今日精选：${list[0].primary}` : "今日精选"}>
                <div className={styles.artFrame}>
                  <img src={list[0]?.url || defaultCover} alt="" className={styles.artImage} />
                </div>
                <div className={styles.artMeta}>
                  <span>EDITOR'S PICK · 01</span>
                  <strong>{list[0]?.primary || "今日精选"}</strong>
                  <small>{list[0]?.secondary || "My Music"}</small>
                </div>
              </div>
            </div>
          </section>

          {loadError ? (
            <div className={styles.errorState} role="status">
              <div className={styles.errorIcon}>!</div>
              <h2 className={styles.errorTitle}>暂时无法加载推荐音乐</h2>
              <p className={styles.errorText}>请检查服务是否已启动，或稍后再试。</p>
              <button className={styles.retryButton} onClick={loadHomeData}>重试</button>
            </div>
          ) : !hasContent ? (
            <div className={styles.errorState} role="status">
              <div className={styles.errorIcon}>♪</div>
              <h2 className={styles.errorTitle}>暂无推荐内容</h2>
              <p className={styles.errorText}>歌曲同步完成后，推荐音乐会显示在这里。</p>
            </div>
          ) : (
            <>

              {/* 为你推荐 — 网格布局 */}
              {list.length > 0 && (
                <SingerCard
                  title="为你推荐"
                  list={list.slice(0, 12)}
                  layout="scroll"
                  size="lg"
                  onCardClick={() => {}}
                  onPlayClick={(item) => handlePlay(item.id)}
                />
              )}

              {/* 当红艺人 — 横向滚动 + 圆形 */}
              {artistList.length > 0 && (
                <SingerCard title="当红艺人" list={artistList.slice(0, 12)} isRound layout="scroll" size="lg"
                  onCardClick={() => { }} onPlayClick={() => { }} />
              )}

              {/* 精选专辑 — 横向滚动 + 大尺寸 */}
              {albumList.length > 0 && (
                <SingerCard title="精选专辑" list={albumList.slice(0, 12)} layout="scroll" size="lg"
                  onCardClick={(item) => navigate(`/album/${item.id}`)} onPlayClick={() => { }} />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
