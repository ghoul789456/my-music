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
  removeAllSong
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

    const fetchLyric = async () => {
      const res = await getLyric(Number(currentSong.id));
      if (!res) return
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
    return lyric
      .split("\n")
      .map((line) => {
        // 找到这一行第一个时间戳
        const firstMatch = line.match(/\[(\d+):(\d+\.\d+)\]/);
        if (!firstMatch) return null;

        const min = Number(firstMatch[1]);
        const sec = Number(firstMatch[2]);

        // 把这一行所有的时间戳标记去掉，剩下的就是完整歌词文本
        const text = line.replace(/\[\d+:\d+\.\d+\]/g, "").trim();

        if (!text) return null; // 纯空行跳过

        return {
          time: min * 60 + sec,
          text,
        };
      })
      .filter(Boolean);
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
        <Button isIconOnly variant="tertiary" onClick={onClose}>
          <ChevronDown />
        </Button>
      </div>
      <div className={styles.main}>
        <div>
          <img src={currentSong?.coverUrl || img} alt="cover" />
        </div>
        <div className={styles.lyricBox} ref={lyricRef}>
          {parsedLyrics.map((item, index) => {
            if (!item) return null
            const isActive = index === currentLyric;

            return (
              <p
                key={index}
                className={`${styles.line} ${isActive ? styles.active : ""
                  }`}
              >
                {item.text}
              </p>
            );
          })}
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
            <Button isIconOnly variant="tertiary" onClick={handleModeChange} >
              {modeIcon}
            </Button>

            <Button
              isIconOnly
              variant="tertiary"
              onClick={() => dispatch(prevSong())}
            >
              <BackwardStepFill />
            </Button>

            <Button
              isIconOnly
              variant="tertiary"
              isDisabled={isLoading}
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
              <Button isIconOnly variant="tertiary">
                <ListUl />
              </Button>
            </Popover.Trigger>
            <Popover.Content placement="top" className={styles.playListBox}>
              <Popover.Dialog>
                <Popover.Heading>
                  <div className={styles.listHeader}>
                    <p className={styles.listName}>播放列表</p>
                    <button onClick={clearSongList} className={styles.delBtn}>
                      <TrashBin />
                      <p className={styles.listDel}>清空</p>
                    </button>
                  </div>
                </Popover.Heading>
                <div className={styles.songLists}>
                  {playlist.length !== 0 ? playlist.map((item, index) => {
                    return (
                      <div className={styles.songItem} key={item.id}>
                        <div className={styles.songInfo} >
                          <div className={styles.cover}>
                            <img src={item.coverUrl || img} />
                          </div>
                          <div className={styles.text}>
                            <p className={styles.title}>{item.title}</p>
                            <p className={styles.artist}>{item.artist}</p>
                          </div>
                        </div>

                        <Dropdown>
                          <Button isIconOnly variant="tertiary">
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
            <Button isIconOnly variant="tertiary" onClick={handleMute}>
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
