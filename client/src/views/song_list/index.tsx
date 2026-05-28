import styles from "./index.module.scss";

export default function Playlist() {
  return (
    <div className={styles.pageBox}>
      <h2 className={styles.title}>歌单</h2>
      <p className={styles.empty}>暂无歌单内容</p>
    </div>
  );
}

