import { useRef, type Key } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  togglePlay, nextSong, prevSong, selectCurrentSong,
  setVolume, setMode, setCurrentTime, removeSong, removeAllSong,
} from "../../store/songSlice";
import type { RootState } from "../../store/store";
import { Spinner, Popover, Dropdown, Label, Button } from "@heroui/react";
import {
  Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Repeat1,
  Heart, Volume2, VolumeX, ListMusic, MoreVertical, Trash2,
} from "lucide-react";
import AudioController from "../audio";
import img from "../../assets/song.png";
import styles from "./index.module.scss";

interface PlayerProps { onExpand: () => void; }

export default function MiniPlayer({ onExpand }: PlayerProps) {
  const dispatch = useDispatch();
  const { isPlaying, volume, mode, isLoading, currentTime, playlist, currentIndex } =
    useSelector((state: RootState) => state.player);
  const currentSong = useSelector(selectCurrentSong);

  const handleModeChange = () => {
    const modes: ("loop" | "single" | "shuffle")[] = ["loop", "single", "shuffle"];
    dispatch(setMode(modes[(modes.indexOf(mode) + 1) % modes.length]));
  };

  const modeIcons: Record<string, React.ReactNode> = {
    loop: <Repeat size={17} />,
    single: <Repeat1 size={17} />,
    shuffle: <Shuffle size={17} />,
  };

  const lastVolumeRef = useRef(0.5);
  const handleMute = () => {
    if (volume === 0) dispatch(setVolume(lastVolumeRef.current));
    else { lastVolumeRef.current = volume; dispatch(setVolume(0)); }
  };

  const clearAll = () => dispatch(removeAllSong());
  const handleAction = (key: Key) => { if (key === "delete-song") dispatch(removeSong(currentIndex)); };

  if (!currentSong) {
    return (
      // <div className={styles.emptyBar}>
      //   <AudioController />
      //   <span>未在播放</span>
      // </div>
      <></>
    );
  }

  const pct = currentSong?.duration ? (currentTime / currentSong.duration) * 100 : 0;

  return (
    <div className={styles.miniPlayer}>
      <AudioController />

      {/* 顶部进度条 */}
      <div className={styles.progressTrack}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          dispatch(setCurrentTime(((e.clientX - rect.left) / rect.width) * (currentSong?.duration || 1)));
        }}>
        <div className={styles.progressFill} style={{ width: `${pct}%` }}>
          <div className={styles.progressThumb} />
        </div>
      </div>

      <div className={styles.inner}>
        {/* 左侧：歌曲信息 */}
        <div className={styles.songSection}>
          <div className={styles.cover} onClick={onExpand}>
            <img src={currentSong?.coverUrl || img} alt="" />
          </div>
          <div className={styles.songText}>
            <p className={styles.title}>{currentSong?.title}</p>
            <p className={styles.artist}>{currentSong?.artist}</p>
          </div>
          <button className={styles.heartBtn} aria-label="喜欢">
            <Heart size={18} fill="#b4233c" color="#b4233c" />
          </button>
        </div>

        {/* 中间：控制 */}
        <div className={styles.controlSection}>
          <button className={styles.ctrlBtn} onClick={handleModeChange} aria-label="模式">
            {modeIcons[mode]}
          </button>
          <button className={styles.ctrlBtn} onClick={() => dispatch(prevSong())} aria-label="上一首">
            <SkipBack size={22} fill="#fff" />
          </button>
          <button className={styles.playBtn} onClick={() => dispatch(togglePlay())} disabled={isLoading} aria-label="播放">
            {isLoading ? <Spinner size="sm" /> :
              isPlaying ? <Pause size={20} fill="#000" color="#000" /> : <Play size={20} fill="#000" color="#000" />
            }
          </button>
          <button className={styles.ctrlBtn} onClick={() => dispatch(nextSong())} aria-label="下一首">
            <SkipForward size={22} fill="#fff" />
          </button>
          <button className={styles.ctrlBtn} onClick={handleModeChange} aria-label="循环">
            {modeIcons[mode]}
          </button>
        </div>

        {/* 右侧：音量 + 列表 */}
        <div className={styles.extraSection}>
          <Popover>
            <Popover.Trigger>
              <Button isIconOnly variant="tertiary" className={styles.ghostBtn} aria-label="播放列表">
                <ListMusic size={18} />
              </Button>
            </Popover.Trigger>
            <Popover.Content placement="top" className={styles.popover}>
              <Popover.Dialog>
                <Popover.Heading>
                  <div className={styles.listHead}>
                    <p className={styles.listName}>播放列表</p>
                    <button onClick={clearAll} className={styles.clearBtn}>
                      <Trash2 size={14} /> 清空
                    </button>
                  </div>
                </Popover.Heading>
                <div className={styles.listBody}>
                  {playlist.length ? playlist.map((item) => (
                    <div className={styles.listItem} key={item.id}>
                      <div className={styles.listSong}>
                        <div className={styles.listCover}><img src={item.coverUrl || img} alt="" /></div>
                        <div className={styles.listText}>
                          <p className={styles.listTitle}>{item.title}</p>
                          <p className={styles.listArtist}>{item.artist}</p>
                        </div>
                      </div>
                      <Dropdown>
                        <Button isIconOnly variant="tertiary" aria-label="更多"><MoreVertical size={16} /></Button>
                        <Dropdown.Popover>
                          <Dropdown.Menu onAction={handleAction}>
                            <Dropdown.Item id="delete-song" variant="danger"><Label>移除</Label></Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown.Popover>
                      </Dropdown>
                    </div>
                  )) : '暂无歌曲'}
                </div>
              </Popover.Dialog>
            </Popover.Content>
          </Popover>

          <div className={styles.volWrap}>
            <button className={styles.ghostBtn} onClick={handleMute} aria-label="音量">
              {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input type="range" min="0" max="1" step="0.01" value={volume}
              onChange={(e) => dispatch(setVolume(Number(e.target.value)))} className={styles.volSlider} />
          </div>
        </div>
      </div>
    </div>
  );
}
