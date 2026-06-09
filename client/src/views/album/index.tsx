import { useEffect, useState, type Key } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setPlaylist, togglePlay, selectCurrentSong } from "../../store/songSlice";
import type { RootState } from "../../store/store";
import { Dropdown, Button, Label } from "@heroui/react";
import { Play, MoreVertical } from "lucide-react";
import server from "../../axios/server";
import PageLoading from "../../components/pageLoading";
import TrackIndex from "../../components/trackIndex";
import styles from "./index.module.scss";

interface AlbumDetailResponse {
  message: string; album: {
    id: number; title: string; coverUrl: string|null; releaseDate: string|null; artistId: number;
    artist: { id: number; name: string; avatar: string|null; bio: string|null };
    songs: { id: number; title: string; duration: number; filePath: string; coverUrl: string|null; playCount: number; lyricPath: string|null; albumId: number|null; artists: {id:number;name:string}[] }[];
  };
}
type Album = AlbumDetailResponse["album"];

export default function Album() {
  const { id } = useParams(); const dispatch = useDispatch();
  const [album, setAlbum] = useState<Album|null>(null); const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<number|null>(null);
  const { isPlaying } = useSelector((state: RootState) => state.player);
  const currentSong = useSelector(selectCurrentSong);

  useEffect(() => { if(!id)return; server.get<any,AlbumDetailResponse>(`/api/song/album/${id}`).then(({album})=>setAlbum(album)).finally(()=>setLoading(false)); }, [id]);

  const fmtDur = (s:number) => { const m=Math.floor(s/60); return `${m}:${String(s%60).padStart(2,"0")}`; };
  const toPL = () => album?album.songs.map(s=>({id:s.id,title:s.title,duration:s.duration,filePath:s.filePath,coverUrl:s.coverUrl,playCount:s.playCount,lyricPath:s.lyricPath,artist:s.artists.map(a=>a.name).join("/")})):[];

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
