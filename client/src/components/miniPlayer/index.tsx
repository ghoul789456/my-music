import { useRef, useState, type Key } from "react";

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
import { Button, Spinner, Slider, Popover, Avatar, Dropdown, Label } from "@heroui/react";
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
  Person
} from "@gravity-ui/icons";
import { Repeat, Repeat1, Shuffle } from "lucide-react";
import AudioController from "../audio";
import styles from "./index.module.scss";
import img from "../../assets/song.png";
interface PlayerProps {
  onExpand: () => void;
}
export default function MiniPlayer({ onExpand }: PlayerProps) {
  const dispatch = useDispatch();

  const { isPlaying, volume, mode, isLoading, currentTime, playlist, currentIndex } = useSelector(
    (state: RootState) => state.player,
  );
  const currentSong = useSelector(selectCurrentSong);

  // if (!currentSong) return null;

  // 2. 处理模式切换逻辑
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
    <div className={`${styles.miniPlayer}`} >
      <AudioController />
     
        <div className={styles.songInfo}>
          <div className={styles.cover} onClick={onExpand}>
            <img src={currentSong?.coverUrl || img} />
          </div>
          <div className={styles.text}>
            <p className={styles.title}>{currentSong?.title}</p>
            <p className={styles.artist}>{currentSong?.artist}</p>
          </div>
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


  );
}
