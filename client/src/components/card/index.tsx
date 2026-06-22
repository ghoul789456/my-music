import { Play } from "lucide-react";
import styles from "./index.module.scss";

interface SingerItem { id: string; url: string; primary: string; secondary: string; }
interface SingerCardProps {
  title: string;
  list: SingerItem[];
  isRound?: boolean;
  layout?: "scroll" | "grid";   // 横向滚动 or 网格
  size?: "sm" | "md" | "lg";     // 卡片大小
  onCardClick?: (item: SingerItem) => void;
  onPlayClick?: (item: SingerItem) => void;
}

export default function SingerCard({
  title, list, isRound = false, layout = "scroll", size = "md",
  onCardClick, onPlayClick,
}: SingerCardProps) {
  return (
    <div className={styles.cardSection}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div
        className={`${layout === "grid" ? styles.gridContainer : styles.scrollContainer}`}
      >
        {list.map((item) => (
          <div
            key={item.id}
            className={`${styles.card} ${styles[size]}`}
            onClick={() => onCardClick?.(item)}
          >
            <div className={`${styles.imgWrapper} ${styles[size]}`}>
              <img
                alt={item.primary}
                src={item.url}
                className={`${styles.cardImg} ${isRound ? styles.round : styles.square}`}
              />
              <div className={styles.playOverlay}>
                <button
                  className={styles.playCircle}
                  onClick={(e) => { e.stopPropagation(); onPlayClick?.(item); }}
                  aria-label="播放"
                >
                  <Play size={size === "sm" ? 16 : 20} fill="#fff" color="#fff" />
                </button>
              </div>
            </div>
            <p className={styles.cardTitle}>{item.primary}</p>
            <p className={styles.cardSub}>{item.secondary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
