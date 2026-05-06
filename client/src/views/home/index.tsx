import { useEffect, useState } from "react";
import { Card, Button } from "@heroui/react";
import { PlayFill } from "@gravity-ui/icons";
import server from "../../axios/server";

import { useDispatch } from "react-redux";
import { playSong } from "../../store/songSlice";
import Swiperbox from "../../components/swiper";
import SingerCard from "../../components/card";
import styles from "./index.module.scss";

export default function Home() {
  interface Song {
    id: number;
    title: string;
    duration: number;
    filePath: string;
    coverUrl: string | null;
    playCount: number | null;
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
  const handleSinglePlay = (id: string) => {
    // 根据 ID 找到对应的原始歌曲数据
    const target = rawSongs.find((s) => String(s.id) === id);
    if (target) {
      dispatch(
        playSong({
          id: target.id,
          title: target.title,
          duration: target.duration,
          filePath: target.filePath,
          coverUrl: target.coverUrl,
          playCount: target.playCount,
          artist: target.artists.map((a) => a.name).join("/"),
        }),
      );
    }
  };

  return (
    <div className={styles.homeBox}>
      <Swiperbox />
      <div className={styles.listItem}>
        <div>
          <SingerCard
            title="热播歌曲"
            list={list}
            onCardClick={() => {
              console.log("打开详情");
            }}
            onPlayClick={(item: any) => {
              handleSinglePlay(item.id);
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
