import { useRef } from 'react'

import { useSelector, useDispatch } from "react-redux";
import {
  togglePlay, nextSong, prevSong, selectCurrentSong,
  setVolume, setMode,setCurrentTime
} from "../../store/songSlice";
import type { RootState } from "../../store/store";
import { Button, Spinner } from "@heroui/react";
import {
  PauseFill, PlayFill, BackwardStepFill, ForwardStepFill,
  VolumeLowFill, VolumeXmarkFill, ListUl
} from '@gravity-ui/icons';
import { Repeat, Repeat1, Shuffle } from "lucide-react";
import AudioController from '../audio'
import styles from "./index.module.scss";

export default function Footer() {
  const dispatch = useDispatch();

  const { isPlaying, volume, mode, isLoading, currentTime } = useSelector(
    (state: RootState) => state.player
  );
  const currentSong = useSelector(selectCurrentSong);

  if (!currentSong) return null;

  // 2. 处理模式切换逻辑
  const handleModeChange = () => {
    const modes: ("loop" | "single" | "shuffle")[] = ["loop", "single", "shuffle"];
    const nextMode = modes[(modes.indexOf(mode) + 1) % modes.length];
    dispatch(setMode(nextMode));
  };

  // 3. 根据模式选择图标
  const modeIconMap = {
    loop: <Repeat />,
    single: <Repeat1 />,
    shuffle: <Shuffle />
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



  return (
    <div className={styles.foot}>
      <AudioController />
      <div className={styles.songInfo}>
        <div className={styles.cover}>
          <img
            src={currentSong.coverUrl || '/default-cover.png'}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/default-cover.png";
            }}
          />
        </div>
        <div className={styles.text}>
          <p className={styles.title}>{currentSong.title}</p>
          <p className={styles.artist}>{currentSong.artist || "未知歌手"}</p>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.buttons}>
          <Button isIconOnly variant="tertiary" onClick={handleModeChange}>
            {modeIcon}
          </Button>

          <Button isIconOnly variant="tertiary" onClick={() => dispatch(prevSong())}>
            <BackwardStepFill />
          </Button>

          <Button
            isIconOnly
            variant="tertiary"
            isDisabled={isLoading}
            onClick={() => dispatch(togglePlay())}
          >
            {isLoading ? <Spinner size="sm" color="current" /> : (isPlaying ? <PauseFill /> : <PlayFill />)}
          </Button>

          <Button isIconOnly variant="tertiary" onClick={() => dispatch(nextSong())}>
            <ForwardStepFill />
          </Button>
        </div>


        <input
          type="range"
          className={styles.progressBar}
          min={0}
          max={currentSong.duration || 0}
          value={currentTime}
          onChange={(e) => dispatch(setCurrentTime(Number(e.target.value)))}
        />
      </div>

      <div className={styles.extra}>
        <Button isIconOnly variant="tertiary"><ListUl /></Button>
        <div className={styles.volumeContainer}>
          <Button
            isIconOnly
            variant="tertiary"
            onClick={handleMute}
          >
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