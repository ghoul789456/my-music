import { Card } from "@heroui/react";
import Swiperbox from "../../components/swiper";
import MusicItem from "../../components/MusicItem"; // 引入新组件
import "./index.scss";
const sections = [
  { id: 1, title: "热播歌曲", type: "album" },
  { id: 2, title: "当红歌手", type: "singer" },
  { id: 3, title: "热门专辑", type: "album" },
  { id: 4, title: "精选排行榜", type: "album" },
];

export default function Home() {
  return (
    <div className="main-box">
      <Swiperbox />
      {sections.map((section) => (
        <div key={section.id} className="list-item">
          <Card className="singer-list">
            <Card.Header>
              <h3 className="section-title">{section.title}</h3>
            </Card.Header>
            <Card.Content className="singer-box">
              <MusicItem
                title={section.title}
                type={section.type}
                img="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/neo1.jpeg"
              />
            </Card.Content>
          </Card>
        </div>
      ))}
    </div>
  );
}
