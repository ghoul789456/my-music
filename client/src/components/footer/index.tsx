import { useEffect, useRef, useState, useMemo, type Key } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  togglePlay,
  nextSong,
  prevSong,
  selectCurrentSong,
  setVolume,
  setMode,
  setCurrentTime,
  removeSong,
  removeAllSong,
  setCurrentIndex,
} from "../../store/songSlice";
import type { RootState } from "../../store/store";
import { Button, Spinner, Slider, Popover, Dropdown, Label } from "@heroui/react";
import server from "../../axios/server";
import AudioController from "../audio";
import img from "../../assets/song.png";
import styles from "./index.module.scss";

interface FooterProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MeResponse {
  message: string;
  lyric?: string;
}

export default function Footer({ isOpen, onClose }: FooterProps) {
  const lyricRef = useRef<HTMLDivElement | null>(null);

  const dispatch = useDispatch();

  const {
    isPlaying,
    volume,
    mode,
    isLoading,
    currentTime,
    playlist,
    currentIndex,
  } = useSelector((state: RootState) => state.player);
  const currentSong = useSelector(selectCurrentSong);

  const [lyric, setLyric] = useState("");

  useEffect(() => {
    if (!currentSong?.id) return;
    setLyric("");
    const fetchLyric = async () => {
      const res = await getLyric(Number(currentSong.id));
      if (res == null) return;
      setLyric(res);
    };
    fetchLyric();
  }, [currentSong?.id]);

  // 获取歌词
  const getLyric = async (id: number) => {
    const res = await server.get<any, MeResponse>(`/api/song/${id}/lyric`);
    return res.lyric;
  };

  // 解析歌词
  const parseLyric = (lyric: string) => {
    const lines = lyric
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const result: { time: number; text: string; translation: string }[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const firstMatch = line.match(/\[(\d+):(\d+\.\d+)\]/);
      if (!firstMatch) {
        i++;
        continue;
      }

      const time = Number(firstMatch[1]) * 60 + Number(firstMatch[2]);
      const text = line.replace(/\[\d+:\d+\.\d+\]/g, "").trim();

      if (!text) {
        i++;
        continue;
      }

      // 是中文行就跳过（会在下面作为译文被消费掉）
      if (/[一-龥]/.test(text)) {
        i++;
        continue;
      }

      // 看下一行是否是同时间戳的中文译文
      let translation = "";
      if (i + 1 < lines.length) {
        const next = lines[i + 1];
        const nextMatch = next.match(/\[(\d+):(\d+\.\d+)\]/);
        if (nextMatch) {
          const nextTime = Number(nextMatch[1]) * 60 + Number(nextMatch[2]);
          const nextText = next.replace(/\[\d+:\d+\.\d+\]/g, "").trim();
          if (nextTime === time && /[一-龥]/.test(nextText)) {
            translation = nextText;
            i++; // 译文行已消费
          }
        }
      }

      result.push({ time, text, translation });
      i++;
    }

    return result;
  };

  const parsedLyrics = useMemo(() => {
    return parseLyric(lyric);
  }, [lyric]);

  const currentLyric = useMemo(() => {
    return parsedLyrics.findIndex((item, index) => {
      if (!item) return false;
      const next = parsedLyrics[index + 1];
      return currentTime >= item.time && (!next || currentTime < next.time);
    });
  }, [parsedLyrics, currentTime]);

  useEffect(() => {
    const container = lyricRef.current;
    const activeLine = container?.querySelector(`.${styles.lyricActive}`) as HTMLElement;

    if (container && activeLine) {
      const targetScroll =
        activeLine.offsetTop - container.clientHeight / 2 + activeLine.clientHeight / 2;
      container.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  }, [currentLyric]);

  // 处理模式切换逻辑
  const handleModeChange = () => {
    const modes: ("loop" | "single" | "shuffle")[] = ["loop", "single", "shuffle"];
    const nextMode = modes[(modes.indexOf(mode) + 1) % modes.length];
    dispatch(setMode(nextMode));
  };

  const modeIcons: Record<string, string> = {
    loop: "repeat",
    single: "repeat_one",
    shuffle: "shuffle",
  };

  const lastVolumeRef = useRef(0.5);

  const handleMute = () => {
    if (volume === 0) {
      dispatch(setVolume(lastVolumeRef.current));
    } else {
      lastVolumeRef.current = volume;
      dispatch(setVolume(0));
    }
  };

  // 格式化秒数为 mm:ss
  const formatTime = (seconds: number) => {
    const s = Math.floor(seconds);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, "0")}`;
  };

  // 清空播放列表
  const clearSongList = () => {
    dispatch(removeAllSong());
  };

  const handleAction = (key: Key) => {
    switch (key) {
      case "delete-song":
        dispatch(removeSong(currentIndex));
        break;
      default:
        break;
    }
  };

  return (
    <div className={`${styles.foot} ${isOpen ? styles.active : ""}`}>
      <AudioController />

      {/* Immersive Background */}
      <div className={styles.bgLayer}>
        <div className={styles.bgOverlay} />
        <img
          className={styles.bgImage}
          src={currentSong?.coverUrl || img}
          alt=""
        />
      </div>

      {/* Top Close Bar — 移动端 + 桌面端 */}
      <nav className={styles.topBar}>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="收起"
        >
          <span className="material-symbols-outlined">keyboard_arrow_down</span>
        </button>
        <div className={styles.topBarInfo}>
          <p className={styles.topBarLabel}>正在播放</p>
        </div>
        <button className={styles.closeBtn} aria-label="更多">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className={styles.playerMain}>
        {/* Left: Album Art */}
        <section className={styles.artSection}>
          <div className={styles.artWrapper}>
            <img
              className={styles.artImage}
              src={currentSong?.coverUrl || img}
              alt={currentSong?.title || "Album art"}
            />
          </div>
          <div className={styles.songMeta}>
            <div className={styles.metaRow}>
              <div>
                <h1 className={styles.songTitle}>
                  {currentSong?.title || "No Track"}
                </h1>
                <p className={styles.songArtist}>
                  {currentSong?.artist || "Unknown Artist"}
                </p>
              </div>
              <button
                className={`material-symbols-outlined ${styles.favBtn}`}
                aria-label="收藏"
              >
                favorite
              </button>
            </div>
          </div>
        </section>

        {/* Right: Lyrics (Desktop) */}
        <section className={styles.lyricSection}>
          <div className={styles.lyricBox} ref={lyricRef}>
            <div className={styles.lyricPlaceholder} />
            {parsedLyrics.length > 0
              ? parsedLyrics.map((item, index) => {
                  if (!item) return null;
                  const isActive = index === currentLyric;
                  return (
                    <p
                      key={index}
                      className={`${styles.lyricLine} ${isActive ? styles.lyricActive : ""}`}
                    >
                      {item.text}
                      {item.translation && (
                        <span className={styles.lyricTranslation}>
                          {item.translation}
                        </span>
                      )}
                    </p>
                  );
                })
              : <p className={styles.lyricEmpty}>暂无歌词</p>}
            <div className={styles.lyricPlaceholder} />
          </div>
        </section>
      </main>

      {/* Bottom Controls */}
      <footer className={styles.controlBar}>
        <div className={styles.controlInner}>
          {/* Progress */}
          <div className={styles.progressWrapper}>
            <span className={styles.progressTime}>{formatTime(currentTime)}</span>
            <div className={styles.progressTrack}>
              <Slider
                className={styles.progressSlider}
                value={[currentTime]}
                minValue={0}
                maxValue={currentSong?.duration || 1}
                step={1}
                onChange={(val) => {
                  const time = Array.isArray(val) ? val[0] : val;
                  dispatch(setCurrentTime(time));
                }}
              >
                <Slider.Track className={styles.pgTrack}>
                  <Slider.Fill className={styles.pgFill} />
                  <Slider.Thumb className={styles.pgThumb} />
                </Slider.Track>
              </Slider>
            </div>
            <span className={styles.progressTime}>
              {formatTime(currentSong?.duration || 0)}
            </span>
          </div>

          {/* Controls Row */}
          <div className={styles.controlsRow}>
            {/* Desktop extras */}
            <div className={styles.controlLeft}>
              <button
                className={`material-symbols-outlined ${styles.ctrlIcon}`}
                onClick={handleModeChange}
                aria-label="Mode"
              >
                {modeIcons[mode]}
              </button>
            </div>

            {/* Main Buttons */}
            <div className={styles.controlCenter}>
              <button
                className={`material-symbols-outlined ${styles.bigSkip}`}
                onClick={() => dispatch(prevSong())}
                aria-label="Previous"
              >
                skip_previous
              </button>

              <button
                className={styles.bigPlay}
                onClick={() => dispatch(togglePlay())}
                aria-label={isPlaying ? "Pause" : "Play"}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner size="sm" color="current" />
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: "2.5rem" }}>
                    {isPlaying ? "pause" : "play_arrow"}
                  </span>
                )}
              </button>

              <button
                className={`material-symbols-outlined ${styles.bigSkip}`}
                onClick={() => dispatch(nextSong())}
                aria-label="Next"
              >
                skip_next
              </button>
            </div>

            {/* Desktop extras */}
            <div className={styles.controlRight}>
              <button
                className={`material-symbols-outlined ${styles.ctrlIcon}`}
                onClick={handleMute}
                aria-label="Volume"
              >
                {volume === 0 ? "volume_off" : "volume_up"}
              </button>
              <button
                className={`material-symbols-outlined ${styles.ctrlIcon}`}
                aria-label="Lyrics"
              >
                lyrics
              </button>

              <Popover>
                <Popover.Trigger>
                  <button
                    className={`material-symbols-outlined ${styles.ctrlIcon}`}
                    aria-label="Playlist"
                  >
                    queue_music
                  </button>
                </Popover.Trigger>
                <Popover.Content placement="top" className={styles.playListBox}>
                  <Popover.Dialog>
                    <Popover.Heading>
                      <div className={styles.listHeader}>
                        <p className={styles.listName}>Playlist</p>
                        <button onClick={clearSongList} aria-label="Clear" className={styles.delBtn}>
                          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
                          Clear
                        </button>
                      </div>
                    </Popover.Heading>
                    <div className={styles.songLists}>
                      {playlist.length !== 0
                        ? playlist.map((item, index) => (
                            <div className={styles.songItem} key={item.id}>
                              <div
                                className={styles.plItem}
                                onClick={() => {
                                  if (currentSong?.id === item.id) {
                                    dispatch(togglePlay());
                                  } else {
                                    dispatch(setCurrentIndex(index));
                                  }
                                }}
                              >
                                <div className={styles.plCover}>
                                  <img src={item.coverUrl || img} alt={item.title} />
                                </div>
                                <div className={styles.plText}>
                                  <p className={styles.plTitle}>{item.title}</p>
                                  <p className={styles.plArtist}>{item.artist}</p>
                                </div>
                              </div>
                              <Dropdown>
                                <Button isIconOnly variant="tertiary" aria-label="More">
                                  <span className="material-symbols-outlined">more_vert</span>
                                </Button>
                                <Dropdown.Popover>
                                  <Dropdown.Menu onAction={handleAction}>
                                    <Dropdown.Item id="delete-song" textValue="Delete" variant="danger">
                                      <Label>Remove</Label>
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown.Popover>
                              </Dropdown>
                            </div>
                          ))
                        : "No songs in queue"}
                    </div>
                  </Popover.Dialog>
                </Popover.Content>
              </Popover>
            </div>

            {/* Mobile favorite */}
            <div className={styles.controlMobileExtra}>
              <button
                className={`material-symbols-outlined ${styles.ctrlIcon}`}
                aria-label="Favorite"
              >
                favorite
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
