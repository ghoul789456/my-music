import styles from "./index.module.scss";

export default function MyLike() {
  return (
    <div className={styles.pageBox}>
      <h2 className={styles.title}>我的喜欢</h2>
      <p className={styles.empty}>暂无收藏歌曲</p>
    </div>
  );
}

