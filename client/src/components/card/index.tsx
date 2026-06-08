import React from "react";
import styles from "./index.module.scss";

// 定义 Props 接口
interface SingerItem {
  id: string;
  url: string;
  primary: string;
  secondary: string;
}

interface SingerCardProps {
  title: string;
  list: SingerItem[];
  isRound?: boolean;
  onCardClick?: (item: SingerItem) => void;
  onPlayClick?: (item: SingerItem) => void;
}

export default function SingerCard({
  title,
  list,
  isRound = false,
  onCardClick,
  onPlayClick,
}: SingerCardProps) {
  return (
    <div className={styles.cardSection}>
      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <div>
          <h3 className={styles.sectionTitle}>{title}</h3>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div className={styles.scrollContainer}>
        {list.map((item) => (
          <div
            key={item.id}
            className={styles.card}
            onClick={() => onCardClick?.(item)}
          >
            {/* Image Wrapper */}
            <div className={styles.imgWrapper}>
              <img
                alt={item.primary}
                src={item.url}
                className={`${styles.cardImg} ${
                  isRound ? styles.imgRound : styles.imgRounded
                }`}
              />

              {/* Hover Play Overlay */}
              <div className={styles.playOverlay}>
                <button
                  className={styles.playCircle}
                  aria-label="Play"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayClick?.(item);
                  }}
                >
                  <span className="material-symbols-outlined">
                    play_arrow
                  </span>
                </button>
              </div>
            </div>

            {/* Text */}
            <p className={styles.cardTitle}>{item.primary}</p>
            <p className={styles.cardSub}>{item.secondary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
