import { Card } from "@heroui/react";
import Swiperbox from "../../components/swiper";
import styles from "./index.module.scss";

export default function Home() {
  return (
    <div className={styles.homeBox}>
      <Swiperbox />
      <div className={styles.listItem}>
        <div>
          <Card className={styles.singerList}>
            <Card.Content>
              <p>热播歌曲</p>
            </Card.Content>
            <Card.Content className={styles.singerBox}>
              <div className={styles.singerItem}>
                <img
                  alt="NEO Home Robot"
                  aria-hidden="true"
                  className="w-24 h-24 object-cover rounded-xl"
                  src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/neo1.jpeg"
                />
                <p>name</p>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
      <div className={styles.listItem}>
        <div>
          <Card className={styles.singerList}>
            <Card.Content>
              <p>当红歌手</p>
            </Card.Content>
            <Card.Content className={styles.singerBox}>
              <div className={styles.singerItem}>
                <img
                  alt="NEO Home Robot"
                  aria-hidden="true"
                  className="w-24 h-24 object-cover rounded-full"
                  src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/neo1.jpeg"
                />
                <p>name</p>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
      <div className={styles.listItem}>
        <div>
          <Card className={styles.singerList}>
            <Card.Content>
              <p>热门专辑</p>
            </Card.Content>
            <Card.Content className={styles.singerBox}>
              <div className={styles.singerItem}>
                <img
                  alt="NEO Home Robot"
                  aria-hidden="true"
                  className="w-24 h-24 object-cover rounded-xl"
                  src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/neo1.jpeg"
                />
                <p>name</p>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
      <div className={styles.listItem}>
        <div>
          <Card className={styles.singerList}>
            <Card.Content>
              <p>精选排行榜</p>
            </Card.Content>
            <Card.Content className={styles.singerBox}>
              <div className={styles.singerItem}>
                <img
                  alt="NEO Home Robot"
                  aria-hidden="true"
                  className="w-24 h-24 object-cover rounded-xl"
                  src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/neo1.jpeg"
                />
                <p>name</p>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
}
