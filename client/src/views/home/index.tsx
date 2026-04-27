import { Card, Button } from "@heroui/react";
import { PlayFill } from '@gravity-ui/icons';
import Swiperbox from "../../components/swiper";
import SingerCard from '../../components/card'
import styles from "./index.module.scss";

export default function Home() {

  const handleOpenList = () => { }

  const handlePlay = () => { }
  return (
    <div className={styles.homeBox}>
      <Swiperbox />
      <div className={styles.listItem}>
        <div>
          <SingerCard
            title="热播歌曲"
            list={[
              { id: '1', name: '1', url: 'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/neo1.jpeg' },
              { id: '2', name: '2', url: 'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/neo1.jpeg' }
            ]}
            onCardClick={() => {
              console.log('打开详情');
            }}
            onPlayClick={() => {
              console.log('播放');
            }}
          />
        </div>
      </div>
      <div className={styles.listItem}>
        <div>

          <SingerCard
            title="当红歌手"
            list={[
              { id: '1', name: '周杰伦', url: 'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/neo1.jpeg' },
              { id: '2', name: '林俊杰', url: 'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/neo1.jpeg' }
            ]}
            isRound={true}
            onCardClick={() => {
              console.log('打开详情');
            }}
            onPlayClick={() => {
              console.log('播放');
            }}
          />

        </div>
      </div>
      <div className={styles.listItem}>
        <div>
          <SingerCard
            title="热门专辑"
            list={[
              { id: '1', name: '1', url: 'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/neo1.jpeg' },
              { id: '2', name: '2', url: 'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/neo1.jpeg' }
            ]}
            onCardClick={() => {
              console.log('打开详情');
            }}
            onPlayClick={() => {
              console.log('播放');
            }}
          />
        </div>
      </div>
      <div className={styles.listItem}>
        <div>
          
          <SingerCard
            title="精选排行榜"
            list={[
              { id: '1', name: '1', url: 'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/neo1.jpeg' },
              { id: '2', name: '2', url: 'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/neo1.jpeg' }
            ]}
            onCardClick={() => {
              console.log('打开详情');
            }}
            onPlayClick={() => {
              console.log('播放');
            }}
          />
        </div>
      </div>
    </div>
  );
}
