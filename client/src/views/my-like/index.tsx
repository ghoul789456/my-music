import styles from "./index.module.scss";

export default function MyLike() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.emptyState}>
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: "4rem",
            color: "var(--secondary)",
            opacity: 0.3,
          }}
        >
          favorite
        </span>
        <h2 className={styles.heading}>Liked Songs</h2>
        <p className={styles.subtext}>
          Songs you heart will show up here.
        </p>
      </div>
    </div>
  );
}
