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
  removeAllSong,
} from "../../store/songSlice";
import type { RootState } from "../../store/store";
import { Button, Spinner, Slider, Popover, Dropdown, Label } from "@heroui/react";
import AudioController from "../audio";
import styles from "./index.module.scss";
import img from "../../assets/song.png";

interface PlayerProps {
  onExpand: () => void;
}

export default function MiniPlayer({ onExpand }: PlayerProps) {
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

  // 根据模式选择 Material Symbol
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

  if (!currentSong) {
    return (
      <div className={styles.emptyBar}>
        <AudioController />
        <p className={styles.emptyText}>No track selected</p>
      </div>
    );
  }

  return (
    <div className={styles.miniPlayer}>
      <AudioController />

      {/* Left: Song Info */}
      <div className={styles.songSection}>
        <div className={styles.cover} onClick={onExpand}>
          <img src={currentSong?.coverUrl || img} alt={currentSong?.title} />
        </div>
        <div className={styles.songText}>
          <p className={styles.title}>{currentSong?.title}</p>
          <p className={styles.artist}>{currentSong?.artist}</p>
        </div>
        <button className={`material-symbols-outlined ${styles.likeBtn}`} aria-label="Like">
          favorite
        </button>
      </div>

      {/* Center: Controls + Progress */}
      <div className={styles.controlSection}>
        <div className={styles.buttons}>
          <button
            className={`material-symbols-outlined ${styles.ctrlBtn}`}
            onClick={handleModeChange}
            aria-label="Mode"
          >
            {modeIcons[mode]}
          </button>

          <button
            className={`material-symbols-outlined ${styles.ctrlBtn} ${styles.skipBtn}`}
            onClick={() => dispatch(prevSong())}
            aria-label="Previous"
          >
            skip_previous
          </button>

          <button
            className={styles.playBtn}
            onClick={() => dispatch(togglePlay())}
            aria-label={isPlaying ? "Pause" : "Play"}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner size="sm" color="current" />
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: "1.75rem" }}>
                {isPlaying ? "pause" : "play_arrow"}
              </span>
            )}
          </button>

          <button
            className={`material-symbols-outlined ${styles.ctrlBtn} ${styles.skipBtn}`}
            onClick={() => dispatch(nextSong())}
            aria-label="Next"
          >
            skip_next
          </button>

          <button
            className={`material-symbols-outlined ${styles.ctrlBtn}`}
            onClick={handleModeChange}
            aria-label="Repeat Mode"
          >
            {modeIcons[mode]}
          </button>
        </div>

        <div className={styles.progressRow}>
          <span className={styles.timeLabel}>{formatTime(currentTime)}</span>
          <Slider
            className={styles.progressBar}
            value={[currentTime]}
            minValue={0}
            maxValue={currentSong?.duration || 1}
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
          <span className={styles.timeLabel}>
            {formatTime(currentSong?.duration || 0)}
          </span>
        </div>
      </div>

      {/* Right: Extras */}
      <div className={styles.extraSection}>
        <Popover>
          <Popover.Trigger aria-label="Playlist">
            <Button isIconOnly variant="tertiary" className={styles.ghostBtn}>
              <span className="material-symbols-outlined">queue_music</span>
            </Button>
          </Popover.Trigger>
          <Popover.Content placement="top" className={styles.playListBox}>
            <Popover.Dialog>
              <Popover.Heading>
                <div className={styles.listHeader}>
                  <p className={styles.listName}>Playlist</p>
                  <button
                    onClick={clearSongList}
                    aria-label="Clear"
                    className={styles.delBtn}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                      delete
                    </span>
                    <p className={styles.listDel}>Clear</p>
                  </button>
                </div>
              </Popover.Heading>
              <div className={styles.songLists}>
                {playlist.length !== 0
                  ? playlist.map((item, index) => (
                      <div className={styles.songItem} key={item.id}>
                        <div className={styles.playlistSong}>
                          <div className={styles.psCover}>
                            <img src={item.coverUrl || img} alt={item.title} />
                          </div>
                          <div className={styles.psText}>
                            <p className={styles.psTitle}>{item.title}</p>
                            <p className={styles.psArtist}>{item.artist}</p>
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

        <div className={styles.volumeContainer}>
          <button
            className={`material-symbols-outlined ${styles.ghostBtn}`}
            onClick={handleMute}
            aria-label="Volume"
          >
            {volume === 0 ? "volume_off" : "volume_up"}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => dispatch(setVolume(Number(e.target.value)))}
            className={styles.volumeSlider}
          />
        </div>
      </div>
    </div>
  );
}
