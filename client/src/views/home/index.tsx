import { useEffect, useState } from "react";
import server from "../../axios/server";
import { useNavigate } from "react-router";

import { useDispatch } from "react-redux";
import { setCurrentIndex, setPlaylist } from "../../store/songSlice";
import Swiperbox from "../../components/swiper";
import SingerCard from "../../components/card";
import AnimationTypes from "../../components/skeleton"
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
          secondary: "艺人",
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

  const navigate=useNavigate()

  return (
    <div className={styles.homeBox}>
      {loading ? (
        <AnimationTypes />
      ) : (
        <>
          {/*<Swiperbox />*/}
          <div className={styles.listItem}>
            <div>
              <SingerCard
                title="热播歌曲"
                list={list}
                onCardClick={() => {
                  console.log("打开详情");
                }}
                onPlayClick={(item: any) => {
                  handlePlay(item.id);
                }}
              />
            </div>
          </div>
          <div className={styles.listItem}>
            <div>
              <SingerCard
                title="当红歌手"
                list={artistList}
                isRound={true}
                onCardClick={() => {
                  console.log("打开详情");
                }}
                onPlayClick={() => {
                  console.log("播放");
                }}
              />

            </div>
          </div>
          <div className={styles.listItem}>
            <div>
              <SingerCard
                title="热门专辑"
                list={albumList}
                onCardClick={(item) => {
                  navigate(`/album/${item.id}`)
                }}
                onPlayClick={() => {
                  console.log("播放");
                }}
              />


            </div>
          </div>
          <div className={styles.listItem}>
            <div>

              <SingerCard
                title="精选排行榜"
                list={[
                  {
                    id: "1",
                    primary: "1",
                    url: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/neo1.jpeg",
                    secondary: "艺人",
                  },
                  {
                    id: "2",
                    primary: "2",
                    url: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/neo1.jpeg",
                    secondary: "艺人",
                  },
                ]}
                onCardClick={() => {
                  console.log("打开详情");
                }}
                onPlayClick={() => {
                  console.log("播放");
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
