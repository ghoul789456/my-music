import React from 'react';
import { Card, Button } from "@heroui/react";
import { PlayFill } from '@gravity-ui/icons';
import styles from "./index.module.scss";

// 定义 Props 接口
interface SingerItem {
  id: string;
  name: string;
  url: string;
}
interface SingerCardProps {
  title: string;
  list: SingerItem[];
  isRound?: boolean;
  onCardClick?: (item: SingerItem) => void;
  onPlayClick?: (item: SingerItem) => void;
}

export default function  SingerCard({
  title,
  list,
  isRound = false,
  onCardClick,
  onPlayClick
}: SingerCardProps) {
  return (
    <Card className={styles.singerList}>
      <Card.Content>
        <p>{title}</p>
      </Card.Content>

      <Card.Content className={styles.singerBox}>
        {list.map((item) => (
          <div
            key={item.id}
            className={styles.singerItem}
            onClick={() => onCardClick?.(item)}
          >
            <div className={styles.singerImgWrapper}>
              <img
                alt={item.name}
                src={item.url}
                className={`object-cover ${
                  isRound ? 'rounded-full' : 'rounded-xl'
                }`}
              />

              <Button
                isIconOnly
                variant="tertiary"
                className={styles.playBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayClick?.(item);
                }}
              >
                <PlayFill />
              </Button>
            </div>

            <p className={styles.singerName}>{item.name}</p>
          </div>
        ))}
      </Card.Content>
    </Card>
  );
}