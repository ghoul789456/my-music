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
  setCurrentIndex
} from "../../store/songSlice";
import type { RootState } from "../../store/store";
import { Button, Spinner, Slider, Popover, Dropdown, Label } from "@heroui/react";
import {
  PauseFill,
  PlayFill,
  BackwardStepFill,
  ForwardStepFill,
  VolumeLowFill,
  VolumeXmarkFill,
  ListUl,
  TrashBin,
  Ellipsis,
  Plus,
  ArrowShapeTurnUpRight,
  MusicNote,
  Person,
  ChevronDown
} from "@gravity-ui/icons";
import { Repeat, Repeat1, Shuffle } from "lucide-react";
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
  lyric?: string
}
export default function Footer({ isOpen, onClose }: FooterProps) {

  const lyricRef = useRef<HTMLDivElement | null>(null)


  const dispatch = useDispatch();

  const { isPlaying, volume, mode, isLoading, currentTime, playlist, currentIndex } = useSelector(
    (state: RootState) => state.player,
  );
  const currentSong = useSelector(selectCurrentSong);

  const [lyric, setLyric] = useState("");
  useEffect(() => {
    if (!currentSong?.id) return;
    setLyric("");
    const fetchLyric = async () => {
      const res = await getLyric(Number(currentSong.id));
      if (res == null) return;
      console.log("res", res);

      setLyric(res);
    };

    fetchLyric();
  }, [currentSong?.id]);

  //获取歌词
  const getLyric = async (id: number) => {
    const res = await server.get<any, MeResponse>(`/api/song/${id}/lyric`);
    console.log("歌词接口返回", res);
    return res.lyric;
  };
  //解析歌词
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
      if (!firstMatch) { i++; continue; }

      const time = Number(firstMatch[1]) * 60 + Number(firstMatch[2]);
      const text = line.replace(/\[\d+:\d+\.\d+\]/g, "").trim();

      if (!text) { i++; continue; }

      // 是中文行就跳过（会在下面作为译文被消费掉）
      if (/[\u4e00-\u9fa5]/.test(text)) { i++; continue; }

      // 看下一行是否是同时间戳的中文译文
      let translation = "";
      if (i + 1 < lines.length) {
        const next = lines[i + 1];
        const nextMatch = next.match(/\[(\d+):(\d+\.\d+)\]/);
        if (nextMatch) {
          const nextTime = Number(nextMatch[1]) * 60 + Number(nextMatch[2]);
          const nextText = next.replace(/\[\d+:\d+\.\d+\]/g, "").trim();
          if (nextTime === time && /[\u4e00-\u9fa5]/.test(nextText)) {
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
      if (!item) return null
      const next = parsedLyrics[index + 1];

      return (
        currentTime >= item.time &&
        (!next || currentTime < next.time)
      );
    });
  }, [parsedLyrics, currentTime]);


  useEffect(() => {
    const container = lyricRef.current;
    const activeLine = container?.querySelector(`.${styles.active}`) as HTMLElement;

    if (container && activeLine) {
      const targetScroll =
        activeLine.offsetTop - container.clientHeight / 2 + activeLine.clientHeight / 2;

      container.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  }, [currentLyric]);

  // 处理模式切换逻辑
  const handleModeChange = () => {
    const modes: ("loop" | "single" | "shuffle")[] = [
      "loop",
      "single",
      "shuffle",
    ];
    const nextMode = modes[(modes.indexOf(mode) + 1) % modes.length];
    dispatch(setMode(nextMode));
  };

  // 3. 根据模式选择图标
  const modeIconMap = {
    loop: <Repeat />,
    single: <Repeat1 />,
    shuffle: <Shuffle />,
  };

  const modeIcon = modeIconMap[mode];

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
  //情况播放列表
  const clearSongList = () => {
    dispatch(removeAllSong())
  }
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
      <div className={styles.header}>
        <Button isIconOnly variant="tertiary" onClick={onClose} aria-label="折叠">
          <ChevronDown />
        </Button>
      </div>
      <div className={styles.main}>
        <div>
          <img src={currentSong?.coverUrl || img} alt="cover" />
        </div>
        <div className={styles.lyricBox} ref={lyricRef}>
          {/* 顶部垫片：把第一行歌词挤到容器正中间 */}
          <div className={styles.placeholder} />

          {parsedLyrics.length > 0 ? parsedLyrics.map((item, index) => {
            if (!item) return null;
            const isActive = index === currentLyric;

            return (
              <p
                key={index}
                className={`${styles.line} ${isActive ? styles.active : ""}`}
              >
                {item.text}
                {item.translation && (
                  <span className={styles.translation}>{item.translation}</span>
                )}
              </p>
            );
          }) : '暂无歌词'}

          {/* 底部垫片：把最后一行歌词也能滚到容器正中间 */}
          <div className={styles.placeholder} />
        </div>

      </div>
      <div className={styles.footer}>

        <AudioController />

        <div className={styles.songInfo}>
          <p className={styles.title}>{currentSong?.title}</p>
          <p className={styles.artist}>{currentSong?.artist}</p>
        </div>

        <div className={styles.controls}>
          <div className={styles.buttons}>
            <Button isIconOnly variant="tertiary" onClick={handleModeChange} aria-label="循环模式">
              {modeIcon}
            </Button>

            <Button
              isIconOnly
              variant="tertiary"
              aria-label="上一首"
              onClick={() => dispatch(prevSong())}
            >
              <BackwardStepFill />
            </Button>

            <Button
              isIconOnly
              variant="tertiary"
              isDisabled={isLoading}
              aria-label="播放"
              onClick={() => dispatch(togglePlay())}
            >
              {isLoading ? (
                <Spinner size="sm" color="current" />
              ) : isPlaying ? (
                <PauseFill />
              ) : (
                <PlayFill />
              )}
            </Button>

            <Button
              isIconOnly
              variant="tertiary"
              aria-label="下一首"
              onClick={() => dispatch(nextSong())}
            >
              <ForwardStepFill />
            </Button>
          </div>

          <div className={styles.progressRow}>
            <p className={styles.timeLabel}>{formatTime(currentTime)}</p>
            <Slider
              className={`${styles.progressBar}`}
              value={[currentTime]}
              minValue={0}
              maxValue={currentSong?.duration || 0}
              step={1}
              onChange={(val) => {
                const time = Array.isArray(val) ? val[0] : val;
                dispatch(setCurrentTime(time));
              }}
            >
              <Slider.Track className={styles.sliderTrack}>
                <Slider.Fill className={styles.sliderFill} />
                <Slider.Thumb className={styles.sliderThumb} />
              </Slider.Track>
            </Slider>
            <p className={styles.timeLabel}>
              {formatTime(currentSong?.duration || 0)}
            </p>
          </div>
        </div>

        <div className={styles.extra}>


          <Popover>
            <Popover.Trigger aria-label="song lists">
              <Button isIconOnly variant="tertiary" aria-label="播放列表">
                <ListUl />
              </Button>
            </Popover.Trigger>
            <Popover.Content placement="top" className={styles.playListBox}>
              <Popover.Dialog>
                <Popover.Heading>
                  <div className={styles.listHeader}>
                    <p className={styles.listName}>播放列表</p>
                    <button onClick={clearSongList} className={styles.delBtn} aria-label="清空">
                      <TrashBin />
                      <p className={styles.listDel}>清空</p>
                    </button>
                  </div>
                </Popover.Heading>
                <div className={styles.songLists}>
                  {playlist.length !== 0 ? playlist.map((item, index) => {
                    return (
                      <div className={styles.songItem} key={item.id}>
                        <div className={styles.song} >
                          <div className={styles.cover} onClick={() => {
                            if (currentSong?.id === item.id) {
                              dispatch(togglePlay());   // 点当前歌 → 暂停/播放
                            } else {
                              dispatch(setCurrentIndex(index));  // 点其他歌 → 切换
                            }
                          }}>
                            <img src={item.coverUrl || img} />
                            <div className={styles.playOverlay}>
                              {
                                isPlaying && currentSong?.id === item.id ? (
                                  <PauseFill className={styles.icon} />
                                ) : (
                                  <PlayFill className={styles.icon} />
                                )
                              }
                            </div>
                          </div>
                          <div className={styles.text}>
                            <p className={styles.title}>{item.title}</p>
                            <p className={styles.artist}>{item.artist}</p>
                          </div>
                        </div>

                        <Dropdown>
                          <Button isIconOnly variant="tertiary" aria-label="加入歌单">
                            <Ellipsis />
                          </Button>
                          <Dropdown.Popover>
                            <Dropdown.Menu onAction={handleAction}>
                              <Dropdown.SubmenuTrigger>
                                <Dropdown.Item id="add-list" textValue="New file">
                                  <Plus className="size-4 shrink-0 text-muted" />
                                  <Label>加入歌单</Label>
                                  <Dropdown.SubmenuIndicator />
                                </Dropdown.Item>
                                <Dropdown.Popover>
                                  <Dropdown.Menu>
                                    <Dropdown.Item id="whatsapp" textValue="WhatsApp">
                                      <Label>喜欢的音乐</Label>
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown.Popover>
                              </Dropdown.SubmenuTrigger>

                              <Dropdown.Item id="check-album" textValue="Open file">
                                <MusicNote className="size-4 shrink-0 text-muted" />
                                <Label>查看专辑</Label>
                              </Dropdown.Item>
                              <Dropdown.Item id="check-singer" textValue="Open file">
                                <Person className="size-4 shrink-0 text-muted" />
                                <Label>查看歌手</Label>
                              </Dropdown.Item>

                              <Dropdown.Item id="share-song" textValue="Save file">
                                <ArrowShapeTurnUpRight className="size-4 shrink-0 text-muted" />
                                <Label>分享歌曲</Label>
                              </Dropdown.Item>
                              <Dropdown.Item id="delete-song" textValue="Delete file" variant="danger">
                                <TrashBin className="size-4 shrink-0 text-danger" />
                                <Label>删除歌曲</Label>
                              </Dropdown.Item>


                            </Dropdown.Menu>
                          </Dropdown.Popover>
                        </Dropdown>


                      </div>
                    )
                  }) : '暂无播放列表'}
                </div>

              </Popover.Dialog>
            </Popover.Content>
          </Popover>



          <div className={styles.volumeContainer}>
            <Button isIconOnly variant="tertiary" onClick={handleMute} aria-label="音量">
              {volume === 0 ? <VolumeXmarkFill /> : <VolumeLowFill />}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => dispatch(setVolume(Number(e.target.value)))}
            />
          </div>
        </div>



      </div>
    </div>

  );
}
