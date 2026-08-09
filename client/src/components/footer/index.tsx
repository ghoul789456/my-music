import { useEffect, useRef, useState, useMemo, type Key } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  togglePlay, nextSong, prevSong, selectCurrentSong,
  setVolume, setMode, setCurrentTime, removeSong, removeAllSong, setCurrentIndex,
} from "../../store/songSlice";
import type { RootState } from "../../store/store";
import { Button, Spinner, Slider, Popover, Dropdown, Label } from "@heroui/react";
import {
  ChevronDown, MoreVertical, Heart, SkipBack, Play, Pause, SkipForward,
  Shuffle, Repeat, Repeat1, Volume2, VolumeX, ListMusic, Trash2,
} from "lucide-react";
import server from "../../axios/server";
import img from "../../assets/song.png";
import styles from "./index.module.scss";

interface FooterProps { isOpen: boolean; onClose: () => void; }
interface MeResponse { message: string; lyric?: string; }

export default function Footer({ isOpen, onClose }: FooterProps) {
  const lyricRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();
  const { isPlaying, volume, mode, isLoading, currentTime, playlist, currentIndex } = useSelector((state: RootState) => state.player);
  const currentSong = useSelector(selectCurrentSong);
  const [lyric, setLyric] = useState("");

  useEffect(() => {
    if (!currentSong?.id) return;
    setLyric("");
    (async () => { const res = await getLyric(Number(currentSong.id)); if (res != null) setLyric(res); })();
  }, [currentSong?.id]);

  const getLyric = async (id: number) => { const res = await server.get<any, MeResponse>(`/api/song/${id}/lyric`); return res.lyric; };

  const parseLyric = (lyric: string) => {
    const lines = lyric.split("\n").map(l => l.trim()).filter(Boolean);
    const result: { time: number; text: string; translation: string }[] = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i]; const m = line.match(/\[(\d+):(\d+\.\d+)\]/);
      if (!m) { i++; continue; }
      const time = Number(m[1]) * 60 + Number(m[2]);
      const text = line.replace(/\[\d+:\d+\.\d+\]/g, "").trim();
      if (!text) { i++; continue; }
      if (/[一-鿿]/.test(text)) { i++; continue; }
      let translation = "";
      if (i + 1 < lines.length) {
        const next = lines[i + 1]; const nm = next.match(/\[(\d+):(\d+\.\d+)\]/);
        if (nm) {
          const nt = Number(nm[1]) * 60 + Number(nm[2]); const ntxt = next.replace(/\[\d+:\d+\.\d+\]/g, "").trim();
          if (nt === time && /[一-鿿]/.test(ntxt)) { translation = ntxt; i++; }
        }
      }
      result.push({ time, text, translation }); i++;
    }
    return result;
  };

  const parsedLyrics = useMemo(() => parseLyric(lyric), [lyric]);
  const currentLyric = useMemo(() => {
    if (!parsedLyrics.length) return 0;

    const index = parsedLyrics.findIndex((item, idx) => {
      const next = parsedLyrics[idx + 1];

      return (
        currentTime >= item.time &&
        (!next || currentTime < next.time)
      );
    });

    return index === -1 ? 0 : index;
  }, [parsedLyrics, currentTime]);

  useEffect(() => {
    const c = lyricRef.current;
    if (!c) return;
    const lines = c.querySelectorAll(`.${styles.lyricLine}`);
    const active = lines[currentLyric] as HTMLElement;
    if (!active) return;

    c.scrollTo({
      top: active.offsetTop - c.offsetTop - c.clientHeight / 2 + active.clientHeight / 2,
      behavior: "smooth",
    });
  }, [currentLyric]);
  const handleModeChange = () => { const modes: ("loop" | "single" | "shuffle")[] = ["loop", "single", "shuffle"]; dispatch(setMode(modes[(modes.indexOf(mode) + 1) % modes.length])); };
  const modeIcons: Record<string, React.ReactNode> = { loop: <Repeat size={18} />, single: <Repeat1 size={18} />, shuffle: <Shuffle size={18} /> };
  const lastV = useRef(0.5);
  const handleMute = () => { if (volume === 0) dispatch(setVolume(lastV.current)); else { lastV.current = volume; dispatch(setVolume(0)); } };
  const fmt = (s: number) => { const m = Math.floor(s / 60); return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`; };
  const clearAll = () => dispatch(removeAllSong());
  const handleAction = (key: Key) => { if (key === "delete-song") dispatch(removeSong(currentIndex)); };

  if (!currentSong) return null;

  return (
    <div className={`${styles.foot} ${isOpen ? styles.active : ""}`}>
      {/* <div className={styles.bgLayer}><div className={styles.bgOverlay} /><img className={styles.bgImage} src={currentSong?.coverUrl || img} alt="" /></div> */}

      <nav className={styles.topBar}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="收起"><ChevronDown size={24} /></button>
      </nav>

      <div className={styles.playerMain}>
        <section className={styles.artSection}>
          <div className={styles.artWrapper}><img className={styles.artImage} src={currentSong?.coverUrl || img} alt="" /></div>
          <div className={styles.songMeta}>
            <div className={styles.metaRow}>
              <div>
                <h1 className={styles.songTitle}>{currentSong?.title || "未知歌曲"}</h1>
                <p className={styles.songArtist}>{currentSong?.artist || "未知艺人"}</p>
              </div>
              <button className={styles.favBtn} aria-label="喜欢"><Heart size={24} fill="#e66c78" color="#e66c78" /></button>
            </div>
          </div>
        </section>

        <section className={styles.lyricSection}>
          <div className={styles.lyricBox} ref={lyricRef}>
            <div className={styles.lyricPlaceholder} />
            {parsedLyrics.length > 0 ? parsedLyrics.map((item, idx) => {
              if (!item) return null; const isActive = idx === currentLyric;
              return <p key={idx} className={`${styles.lyricLine} ${isActive ? styles.lyricActive : ""}`}>{item.text}{item.translation && <span className={styles.lyricTranslation}>{item.translation}</span>}</p>;
            }) : <p className={styles.lyricEmpty}>暂无歌词</p>}
            <div className={styles.lyricPlaceholder} />
          </div>
        </section>
      </div>

      <footer className={styles.controlBar}>
        <div className={styles.controlInner}>
          <div className={styles.progressWrapper}>
            <span className={styles.progressTime}>{fmt(currentTime)}</span>
            <div className={styles.progressTrack}>
              <Slider aria-label="播放进度" className={styles.progressSlider} value={[currentTime]} minValue={0} maxValue={currentSong?.duration || 1} step={1}
                onChange={val => dispatch(setCurrentTime(Array.isArray(val) ? val[0] : val))}>
                <Slider.Track className={styles.pgTrack}><Slider.Fill className={styles.pgFill} /><Slider.Thumb className={styles.pgThumb} /></Slider.Track>
              </Slider>
            </div>
            <span className={styles.progressTime}>{fmt(currentSong?.duration || 0)}</span>
          </div>

          <div className={styles.controlsRow}>
            <div className={styles.controlLeft}>
              <button className={styles.ctrlIcon} onClick={handleModeChange} aria-label="切换播放模式">{modeIcons[mode]}</button>
            </div>
            <div className={styles.controlCenter}>
              <button className={styles.bigSkip} onClick={() => dispatch(prevSong())} aria-label="上一首"><SkipBack size={28} fill="#fff" /></button>
              <button className={styles.bigPlay} onClick={() => dispatch(togglePlay())} disabled={isLoading} aria-label={isPlaying ? "暂停" : "播放"}>
                {isLoading ? <Spinner size="sm" /> : isPlaying ? <Pause size={28} fill="#000" color="#000" /> : <Play size={28} fill="#000" color="#000" />}
              </button>
              <button className={styles.bigSkip} onClick={() => dispatch(nextSong())} aria-label="下一首"><SkipForward size={28} fill="#fff" /></button>
            </div>
            <div className={styles.controlRight}>
              <button className={styles.ctrlIcon} onClick={handleMute} aria-label={volume === 0 ? "取消静音" : "静音"}>{volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
              <Popover>
                <Popover.Trigger><button className={styles.ctrlIcon} aria-label="播放列表"><ListMusic size={20} /></button></Popover.Trigger>
                <Popover.Content placement="top" className={styles.playListBox}>
                  <Popover.Dialog>
                    <Popover.Heading>
                      <div className={styles.listHeader}><p className={styles.listName}>播放列表</p><button onClick={clearAll} className={styles.delBtn}><Trash2 size={14} />清空</button></div>
                    </Popover.Heading>
                    <div className={styles.songLists}>
                      {playlist.length ? playlist.map((item, idx) => (
                        <div className={styles.songItem} key={item.id}>
                          <div className={styles.plItem} onClick={() => { if (currentSong?.id === item.id) dispatch(togglePlay()); else dispatch(setCurrentIndex(idx)); }}>
                            <div className={styles.plCover}><img src={item.coverUrl || img} alt="" /></div>
                            <div className={styles.plText}>
                              <p className={styles.plTitle}>{item.title}</p>
                              <p className={styles.plArtist}>{item.artist}</p>
                            </div>
                          </div>
                          <Dropdown>
                            <Button isIconOnly variant="tertiary" aria-label="更多操作"><MoreVertical size={16} /></Button>
                            <Dropdown.Popover><Dropdown.Menu onAction={handleAction}><Dropdown.Item id="delete-song" variant="danger"><Label>移除</Label></Dropdown.Item></Dropdown.Menu></Dropdown.Popover>
                          </Dropdown>
                        </div>
                      )) : '暂无歌曲'}
                    </div>
                  </Popover.Dialog>
                </Popover.Content>
              </Popover>
            </div>
            <div className={styles.controlMobileExtra}>
              <button className={styles.ctrlIcon} aria-label="喜欢"><Heart size={20} /></button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
