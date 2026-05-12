import { useRef, useState } from "react";

import { useSelector, useDispatch } from "react-redux";
import {
  togglePlay,
  nextSong,
  prevSong,
  selectCurrentSong,
  setVolume,
  setMode,
  setCurrentTime,
} from "../../store/songSlice";
import type { RootState } from "../../store/store";
import { Button, Spinner, Slider, Popover, Avatar } from "@heroui/react";
import {
  PauseFill,
  PlayFill,
  BackwardStepFill,
  ForwardStepFill,
  VolumeLowFill,
  VolumeXmarkFill,
  ListUl,
  TrashBin,
  Ellipsis
} from "@gravity-ui/icons";
import { Repeat, Repeat1, Shuffle } from "lucide-react";
import AudioController from "../audio";
import styles from "./index.module.scss";
import img from "../../assets/song.png";

export default function Footer() {
  const dispatch = useDispatch();

  const { isPlaying, volume, mode, isLoading, currentTime, playlist } = useSelector(
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

  console.log("playlist", playlist);

  return (
    <div className={styles.foot}>
      <AudioController />
      <div className={styles.songInfo}>
        <div className={styles.cover}>
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
          <Popover.Content placement="top">
            <Popover.Dialog>
              <Popover.Heading>
                <div className={styles.listHeader}>
                  <p>播放列表</p>
                  <button className={styles.delBtn}>
                    <TrashBin />
                    <p>清空列表</p>
                  </button>
                </div>
              </Popover.Heading>
<div className={styles.songLists}>
  {playlist.map((item, index) => {

                return (
                  <div className={styles.songItem}>
                    <div className={styles.songInfo} key={item.id}>
                      <div className={styles.cover}>
                        <img src={item.coverUrl || img} />
                      </div>
                      <div className={styles.text}>
                        <p className={styles.title}>{item.title}</p>
                        <p className={styles.artist}>{item.artist}</p>
                      </div>
                    </div>
                    <Button isIconOnly variant="tertiary">
                      <Ellipsis />
                    </Button>
                  </div>
                )
              })}
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
