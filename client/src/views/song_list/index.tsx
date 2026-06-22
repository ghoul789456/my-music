import { ListMusic } from "lucide-react";
import styles from "./index.module.scss";

export default function Playlist() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.emptyState}>
        <ListMusic size={56} color="var(--muted)" opacity={0.35} />
        <h2 className={styles.heading}>还没有收藏歌曲</h2>
        <p className={styles.subtext}>播放或收藏的歌曲会出现在这里。</p>
      </div>
    </div>
  );
}
