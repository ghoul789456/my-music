import "./index.scss";

interface MusicItemProps {
  title: string;
  img: string;
  type: string;
}

const MusicItem = ({ title, img, type }: MusicItemProps) => (
  <div className="music-item">
    <img
      alt={title}
      src={img}
      className={`item-image ${type === "singer" ? "rounded-full" : "rounded-xl"}`}
    />
    <p className="item-name">{title}</p>{" "}
    {/* 建议把这里的 name 替换为传入的 title */}
  </div>
);

export default MusicItem;
