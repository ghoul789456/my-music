import { PauseFill, PlayFill } from "@gravity-ui/icons";
import styles from "./index.module.scss";

interface TrackIndexProps {
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  hovered?: boolean;
  onToggle: () => void;
}

export default function TrackIndex({
  index,
  isActive,
  isPlaying,
  hovered = false,
  onToggle,
}: TrackIndexProps) {
  const showPause = isActive && isPlaying;
  const showBars = isActive && isPlaying && !hovered;
  const showAction = hovered;
  const showNum = !showBars && !showAction;

  return (
    <div className={styles.indexCell}>
      <span
        className={styles.indexNum}
        style={{ opacity: showNum ? 1 : 0 }}
      >
        {index + 1}
      </span>

      <button
        type="button"
        className={styles.indexAction}
        style={{ opacity: showAction ? 1 : 0 }}
        aria-label={showPause ? "暂停" : "播放"}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        {showPause ? <PauseFill /> : <PlayFill />}
      </button>

      <span
        className={styles.playingBars}
        style={{ opacity: showBars ? 1 : 0 }}
        aria-hidden={!showBars}
      >
        <span />
        <span />
        <span />
      </span>
    </div>
  );
}
