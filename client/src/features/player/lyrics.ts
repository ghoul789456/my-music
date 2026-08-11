export interface LyricLine {
  time: number;
  text: string;
  translation: string;
}

export function parseLyrics(lyric: string): LyricLine[] {
  const lines = lyric.split("\n").map((line) => line.trim()).filter(Boolean);
  const result: LyricLine[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const match = line.match(/\[(\d+):(\d+\.\d+)\]/);
    if (!match) {
      index += 1;
      continue;
    }

    const time = Number(match[1]) * 60 + Number(match[2]);
    const text = line.replace(/\[\d+:\d+\.\d+\]/g, "").trim();
    if (!text || /[一-鿿]/.test(text)) {
      index += 1;
      continue;
    }

    let translation = "";
    const next = lines[index + 1];
    if (next) {
      const nextMatch = next.match(/\[(\d+):(\d+\.\d+)\]/);
      if (nextMatch) {
        const nextTime = Number(nextMatch[1]) * 60 + Number(nextMatch[2]);
        const nextText = next.replace(/\[\d+:\d+\.\d+\]/g, "").trim();
        if (nextTime === time && /[一-鿿]/.test(nextText)) {
          translation = nextText;
          index += 1;
        }
      }
    }

    result.push({ time, text, translation });
    index += 1;
  }

  return result;
}
