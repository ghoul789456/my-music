import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { nextSong, togglePlay } from "../../store/songSlice"; // 你的切片路径
import { selectCurrentSong } from "../../store/songSlice";

const AudioController = () => {
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const dispatch = useDispatch();

  const { isPlaying, volume } = useSelector((state: any) => state.player);
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
  }, [currentSong]);

  // 播放控制
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // 播放结束
  useEffect(() => {
    const audio = audioRef.current;

    const handleEnded = () => {
      dispatch(nextSong());
    };

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