import React, { useEffect } from "react";
import { Avatar, Card, Button } from "@heroui/react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../store/store";
import styles from "./index.module.scss";
export default function Profile() {
  const { userInfo, isLoggedIn } = useSelector(
    (state: RootState) => state.user,
  );
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth");
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className={styles.profileContainer}>
      <div className={styles.information}>
        <Avatar size="lg" className={styles.avatarBox}>
          <Avatar.Image
            alt="user"
            src={
              userInfo?.avatar ||
              "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg"
            }
          />
          <Avatar.Fallback>{userInfo?.username || ""}</Avatar.Fallback>
        </Avatar>
        <div className={styles.briefIntroduction}>
          <p className={styles.userName}>{userInfo?.username || "未登录"}</p>
          <div className={styles.box}>
            <span className={styles.attention} data-count="128">
              关注
            </span>
            <span className={styles.fans} data-count="99">
              粉丝
            </span>
          </div>
          <p className={styles.introduction}>
            <div className="flex items-center text-default-500">
              {/* SVG 图标 */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>

              {/* 邮箱文本 */}
              <span>{userInfo?.email || "example@mail.com"}</span>
            </div>
          </p>
        </div>
        <Button size="sm" variant="primary">
          编辑资料
        </Button>
      </div>

      <div className="songList">
        <Card className={styles.singerList}>
          <Card.Content>
            <p>我的歌单</p>
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
  );
}
