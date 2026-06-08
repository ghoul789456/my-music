import styles from "./index.module.scss";

export default function Playlist() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.emptyState}>
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "4rem", color: "var(--muted)", opacity: 0.3 }}
        >
          queue_music
        </span>
        <h2 className={styles.heading}>Your Library</h2>
        <p className={styles.subtext}>
          Songs and albums you save will appear here.
        </p>
      </div>
    </div>
  );
}
