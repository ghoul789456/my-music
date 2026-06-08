import { useEffect, useState } from "react";
import server from "../../axios/server";
import { useNavigate } from "react-router";

import { useDispatch } from "react-redux";
import { setCurrentIndex, setPlaylist } from "../../store/songSlice";
import SingerCard from "../../components/card";
import AnimationTypes from "../../components/skeleton";
import styles from "./index.module.scss";

export default function Home() {
  interface Song {
    id: number;
    title: string;
    duration: number;
    filePath: string;
    coverUrl: string | null;
    playCount: number | null;
    lyricPath?: string | null;
    artists: {
      id: number;
      name: string;
    }[];
  }

  interface Album {
    id: number;
    title: string;
    coverUrl: string | null;
    artist: {
      name: string;
    };
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

  const [list, setList] = useState<any[]>([]);
  const [albumList, setAlbumList] = useState<any[]>([]);
  const [artistList, setArtistList] = useState<any[]>([]);
  const [rawSongs, setRawSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    server.get<any, HomeHotResponse>("/api/song/hot").then((res) => {
      const { songs, albums, artists } = res;
      setRawSongs(songs);

      setList(
        songs.map((s) => ({
          id: String(s.id),
          primary: s.title,
          secondary: s.artists.map((a) => a.name).join("/"),
          url: s.coverUrl,
        })),
      );

      setAlbumList(
        albums.map((a) => ({
          id: String(a.id),
          primary: a.title,
          secondary: a.artist.name,
          url: a.coverUrl,
        })),
      );

      setArtistList(
        artists.map((a) => ({
          id: String(a.id),
          primary: a.name,
          secondary: "Artist",
          url: a.avatar,
        })),
      );
      setLoading(false);
    });
  }, []);

  const dispatch = useDispatch();
  const handlePlay = (id: string) => {
    const index = rawSongs.findIndex((s) => String(s.id) === id);
    if (index === -1) return;

    dispatch(
      setPlaylist({
        list: rawSongs.map((s) => ({
          id: s.id,
          title: s.title,
          duration: s.duration,
          filePath: s.filePath,
          coverUrl: s.coverUrl,
          playCount: s.playCount,
          artist: s.artists.map((a) => a.name).join("/"),
          lyricPath: s.lyricPath,
        })),
        startIndex: index,
      }),
    );
  };

  const navigate = useNavigate();

  return (
    <div className={styles.homeContainer}>
      {loading ? (
        <AnimationTypes />
      ) : (
        <>
          {/* Hero Section */}
          <section className={styles.hero}>
            <div className={styles.heroBg} />
            <div className={styles.heroGradient} />
            <div className={styles.heroContent}>
              <span className={styles.heroTag}>为你推荐</span>
              <h2 className={styles.heroTitle}>
                晨间共鸣：原声精选
              </h2>
              <p className={styles.heroDesc}>
                用纯粹的弦音与木质共鸣开启你的一天。专为专注与清醒而策划。
              </p>
              <button
                className={styles.heroBtn}
                onClick={() => {
                  if (rawSongs.length > 0) {
                    handlePlay(String(rawSongs[0].id));
                  }
                }}
              >
                <span className="material-symbols-outlined">play_arrow</span>
                立即收听
              </button>
            </div>
          </section>

          {/* Hot Songs */}
          <SingerCard
            title="热播歌曲"
            list={list}
            onCardClick={() => {}}
            onPlayClick={(item: any) => {
              handlePlay(item.id);
            }}
          />

          {/* Artists */}
          <SingerCard
            title="当红歌手"
            list={artistList}
            isRound={true}
            onCardClick={() => {}}
            onPlayClick={() => {}}
          />

          {/* Albums */}
          <SingerCard
            title="热门专辑"
            list={albumList}
            onCardClick={(item) => {
              navigate(`/album/${item.id}`);
            }}
            onPlayClick={() => {}}
          />

          {/* Made For You Bento Grid */}
          <section className={styles.bentoSection}>
            <h3 className={styles.bentoHeading}>为你打造</h3>
            <div className={styles.bentoGrid}>
              {/* Large featured card */}
              <div className={styles.bentoLarge}>
                <img
                  className={styles.bentoLargeImg}
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgF2Bix3IyANq-RrWw3HlrhKkKV2QIyKr-Uv-Hl0Uxnkp4Bmn_HhMTXasOomEVd9AfALenRt7iqPs_IrKyG7D-Ewx6wBgLRqQhLIMFtRZ137lUH49cRNz4dVcUukYfz2tGHZEUSNNgkUYzNM9oxf5gp8V11ebz_AZ1Mx-fTYKTjLIuNqNZH9QDTJY292I97fkmEYoBLNcRSn8L3-fgXUh1RWd_goWuHvaRaEe1Dltuj1W5XHRSjOE3Gf75AQ-eTFuJaw-eIAKzWiMf"
                  alt="Morning Brew"
                />
                <div className={styles.bentoLargeOverlay} />
                <div className={styles.bentoLargeContent}>
                  <p className={styles.bentoTag}>每日精选</p>
                  <h4 className={styles.bentoLargeTitle}>晨间咖啡</h4>
                  <p className={styles.bentoLargeDesc}>
                    原声民谣和轻器乐，伴你醒来。
                  </p>
                </div>
              </div>

              {/* Small card 1 */}
              <div className={styles.bentoCard}>
                <div className={styles.bentoCardTop}>
                  <div className={styles.bentoIconBox}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      favorite
                    </span>
                  </div>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </div>
                <div>
                  <h4 className={styles.bentoCardTitle}>喜欢的音乐</h4>
                  <p className={styles.bentoCardDesc}>
                    {rawSongs.length} 首你喜爱的歌曲
                  </p>
                </div>
              </div>

              {/* Small card 2 */}
              <div className={`${styles.bentoCard} ${styles.bentoAlt}`}>
                <div className={styles.bentoCardTop}>
                  <div className={styles.bentoIconBoxAlt}>
                    <span className="material-symbols-outlined">history</span>
                  </div>
                </div>
                <div>
                  <h4 className={styles.bentoCardTitleAlt}>回忆混音</h4>
                  <p className={styles.bentoCardDescAlt}>
                    过去一年的热门歌曲
                  </p>
                </div>
              </div>

              {/* Wide card */}
              <div className={styles.bentoWide}>
                <div className={styles.bentoWideImg}>
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAljgoqk4xo_1pnEcwesOZcJEDICxl_L0YrsKynOTmKTRLfFoBrCCDhaJEqugNHOQ8JkM3d542AamgJOm5LyZBZFklLp7ERt_yZw4ZaVfuTxFXvMbrUR3_hJVZhQqtdB_JXmdFffllXazg2ZIF8GX2ds2559KQuBKQd0QXWt7SsmjJd73xyzr3yz0nWOfM2drBf3Wx-Bjco5AXPYC0sMbkRwXbVpQfRWFQ6PFAMk2y_8F5Kyq6rd9E4W-IV7KX-uzzrc_jxdz-Ao0Oi"
                    alt="Discover"
                  />
                </div>
                <div>
                  <p className={styles.bentoTag}>私人电台</p>
                  <h4 className={styles.bentoCardTitle}>发现新原声</h4>
                  <p className={styles.bentoCardDesc}>
                    根据你最近的收听习惯推荐。
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
