import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  nextSong,
  setCurrentTime,
  selectCurrentSong,
} from "../../store/songSlice";

const AudioController = () => {
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const dispatch = useDispatch();

  const { isPlaying, volume, currentTime } = useSelector(
    (state: any) => state.player,
  );
  const currentSong = useSelector(selectCurrentSong);

  // 切歌
  useEffect(() => {
    const audio = audioRef.current;
    if (!currentSong) {
      audio.pause();
      audio.src = "";
      return;
    }
    if (currentSong.filePath) {
      audio.src = currentSong.filePath;
      audio.load();
      if (isPlaying) {
        audio.play().catch(() => {});
      }
    }
  }, [currentSong]); // isPlaying 故意不加，切歌逻辑独立处理

  // 播放/暂停控制
  useEffect(() => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // ✅ 新增：timeupdate → 同步进度到 store
  useEffect(() => {
    const audio = audioRef.current;
    const handleTimeUpdate = () => {
      dispatch(setCurrentTime(audio.currentTime));
    };
    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
  }, [dispatch]);

  // ✅ 新增：store currentTime 变化 → seek audio（用户拖动进度条）
  useEffect(() => {
    const audio = audioRef.current;
    if (Math.abs(audio.currentTime - currentTime) > 1) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);

  // 播放结束 → 下一首
  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => dispatch(nextSong());
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [dispatch]);

  // 音量
  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  return null;
};

export default AudioController;
