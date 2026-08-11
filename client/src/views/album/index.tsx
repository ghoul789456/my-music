import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { setPlaylist, togglePlay, selectCurrentSong } from "../../store/songSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { Dropdown, Button, Label } from "@heroui/react";
import { Play, MoreVertical } from "lucide-react";
import { musicApi } from "../../features/music/api";
import type { AlbumDetailDto } from "../../features/music/types";
import { toPlayerSong } from "../../features/player/mappers";
import PageLoading from "../../components/pageLoading";
import TrackIndex from "../../components/trackIndex";
import styles from "./index.module.scss";

export default function Album() {
  const { id } = useParams(); const dispatch = useAppDispatch();
  const [album, setAlbum] = useState<AlbumDetailDto|null>(null); const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<number|null>(null);
  const { isPlaying } = useAppSelector((state) => state.player);
  const currentSong = useAppSelector(selectCurrentSong);

  useEffect(() => {
    if (!id) return;
    let active = true;
    musicApi
      .getAlbum(id)
      .then((response) => {
        if (active) setAlbum(response.album);
      })
      .catch(() => {
        if (active) setAlbum(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id]);

  const fmtDur = (s:number) => { const m=Math.floor(s/60); return `${m}:${String(s%60).padStart(2,"0")}`; };
  const toPL = () => album ? album.songs.map(toPlayerSong) : [];

  const playAll = () => { if(!album)return; dispatch(setPlaylist({list:toPL(),startIndex:0})); };
  const toggle = (idx:number,sid:number) => { if(!album)return; if(currentSong?.id===sid) dispatch(togglePlay()); else dispatch(setPlaylist({list:toPL(),startIndex:idx})); };

  if(loading) return <PageLoading/>;
  if(!album) return <div className={styles.emptyState}>专辑不存在</div>;

  return (
    <div className={styles.albumBox}>
      <div className={styles.header}>
        <img src={album.coverUrl??""} alt={album.title} className={styles.cover}/>
        <div className={styles.info}>
          <h1 className={styles.title}>{album.title}</h1>
          <p className={styles.artist}>{album.artist.name}</p>
          {album.artist.bio&&<p className={styles.bio}>{album.artist.bio}</p>}
          <p className={styles.release}>{album.releaseDate?new Date(album.releaseDate).toLocaleDateString():"未知发行日"} · {album.songs.length} 首</p>
        </div>
      </div>
      <div className={styles.actions}>
        <button onClick={playAll} className={styles.playAllBtn}><Play size={18} fill="#fff" color="#fff"/> 播放全部</button>
      </div>
      <div className={styles.songList}>
        {album.songs.map((song,idx)=>{const isActive=currentSong?.id===song.id;
          return (
            <div key={song.id} className={`${styles.songItem} ${isActive?styles.active:""}`}
              onMouseEnter={()=>setHoveredId(song.id)} onMouseLeave={()=>setHoveredId(null)}
              onClick={()=>toggle(idx,song.id)}>
              <TrackIndex index={idx} isActive={isActive} isPlaying={isActive&&isPlaying} hovered={hoveredId===song.id} onToggle={()=>toggle(idx,song.id)}/>
              <div className={styles.songInfo}><p className={styles.songTitle}>{song.title}</p><p className={styles.songArtist}>{song.artists.map(a=>a.name).join("/")}</p></div>
              <span className={styles.duration}>{fmtDur(song.duration)}</span>
              <div onClick={e=>e.stopPropagation()}>
                <Dropdown>
                  <Button isIconOnly variant="tertiary" aria-label="更多"><MoreVertical size={16}/></Button>
                  <Dropdown.Popover><Dropdown.Menu><Dropdown.Item id="add"><Label>加入歌单</Label></Dropdown.Item></Dropdown.Menu></Dropdown.Popover>
                </Dropdown>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
