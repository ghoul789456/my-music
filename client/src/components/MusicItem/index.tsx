import styles from "./index.module.scss";

interface MusicItemProps {
  title: string;
  img: string;
  type: string;
}

const MusicItem = ({ title, img, type }: MusicItemProps) => (
  <div className={styles.musicItem}>
    <img
      alt={title}
      src={img}
      className={`${styles.itemImage} ${type === "singer" ? "rounded-full" : "rounded-xl"}`}
    />
    <p className={styles.itemName}>{title}</p>
  </div>
);

export default MusicItem;
