import { Heart } from "lucide-react";
import styles from "./index.module.scss";

export default function MyLike() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.emptyState}>
        <Heart size={56} color="var(--brand-bright)" opacity={0.35} />
        <h2 className={styles.heading}>还没有喜欢的歌曲</h2>
        <p className={styles.subtext}>点亮喜欢后，它们会集中放在这里。</p>
      </div>
    </div>
  );
}
