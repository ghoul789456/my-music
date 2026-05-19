import { useEffect, useState } from "react";
import server from "../../axios/server";

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

  return (
    <div className={styles.homeBox}>
      {/*<Swiperbox />*/}
      <div className={styles.listItem}>
        <div>
          {
            list.length > 0 ? <SingerCard
              title="热播歌曲"
              list={list}
              onCardClick={() => {
                console.log("打开详情");
              }}
              onPlayClick={(item: any) => {
                handlePlay(item.id);
              }}
            /> : <AnimationTypes count={6} />
          }

        </div>
      </div>
      <div className={styles.listItem}>
        <div>

          {
            artistList.length > 0 ? <SingerCard
              title="当红歌手"
              list={artistList}
              isRound={true}
              onCardClick={() => {
                console.log("打开详情");
              }}
              onPlayClick={() => {
                console.log("播放");
              }}
            /> : <AnimationTypes isRound count={6} />
          }

        </div>
      </div>
      <div className={styles.listItem}>
        <div>
          {
            albumList.length > 0 ? <SingerCard
              title="热门专辑"
              list={albumList}
              onCardClick={() => {
                console.log("打开详情");
              }}
              onPlayClick={() => {
                console.log("播放");
              }}
            /> : <AnimationTypes count={6} />
          }



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
    </div>
  );
}
