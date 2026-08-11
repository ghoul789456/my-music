import { useEffect, useState } from "react";
import { musicApi } from "../music/api";

export function useLyrics(songId?: number) {
  const [result, setResult] = useState<{
    songId: number;
    lyric: string;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    if (!songId) return;

    const controller = new AbortController();
    musicApi
      .getLyrics(songId, controller.signal)
      .then((response) => {
        setResult({ songId, lyric: response.lyric ?? "", error: null });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResult({ songId, lyric: "", error: "歌词加载失败" });
        }
      });

    return () => controller.abort();
  }, [songId]);

  if (!songId || result?.songId !== songId) {
    return { lyric: "", error: null };
  }

  return { lyric: result.lyric, error: result.error };
}
