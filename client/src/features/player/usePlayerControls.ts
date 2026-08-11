import {
  cycleMode,
  nextSong,
  prevSong,
  removeAllSong,
  removeSongById,
  selectCurrentSong,
  setCurrentIndex,
  setCurrentTime,
  setVolume,
  toggleMute,
  togglePlay,
} from "../../store/songSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

export function usePlayerControls() {
  const dispatch = useAppDispatch();
  const player = useAppSelector((state) => state.player);
  const currentSong = useAppSelector(selectCurrentSong);

  return {
    ...player,
    currentSong,
    actions: {
      togglePlay: () => dispatch(togglePlay()),
      next: () => dispatch(nextSong()),
      previous: () => dispatch(prevSong()),
      cycleMode: () => dispatch(cycleMode()),
      toggleMute: () => dispatch(toggleMute()),
      setVolume: (value: number) => dispatch(setVolume(value)),
      seek: (value: number) => dispatch(setCurrentTime(value)),
      clearQueue: () => dispatch(removeAllSong()),
      removeFromQueue: (songId: number) => dispatch(removeSongById(songId)),
      playAt: (index: number) => dispatch(setCurrentIndex(index)),
    },
  };
}
