import { useState, type Key } from "react";
import { Avatar, Dropdown, Label } from "@heroui/react";
import { useNavigate } from "react-router";
import { clearSession } from "../../features/auth/session";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/userSlice";
import styles from "./index.module.css";

export default function UserMenu() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { userInfo, isLoggedIn } = useAppSelector((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (isLoggedIn) setIsOpen(open);
    else navigate("/auth");
  };

  const handleAction = (key: Key) => {
    if (key === "profile") {
      navigate("/profile");
      return;
    }

    if (key === "logout") {
      clearSession();
      dispatch(logout());
      setIsOpen(false);
      navigate("/auth");
    }
  };

  return (
    <Dropdown isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Dropdown.Trigger aria-label="打开用户菜单">
        <Avatar className={`${styles.avatar} ${styles.avatarWrap}`}>
          <Avatar.Image alt="" src={userInfo?.avatar || ""} />
          <Avatar.Fallback>{userInfo?.username?.[0] || "U"}</Avatar.Fallback>
        </Avatar>
      </Dropdown.Trigger>
      <Dropdown.Popover className={styles.popover}>
        <div className={styles.popInfo}>
          <Avatar size="md">
            <Avatar.Image alt="" src={userInfo?.avatar || ""} />
            <Avatar.Fallback>{userInfo?.username?.[0] || "U"}</Avatar.Fallback>
          </Avatar>
          <div>
            <p className={styles.popName}>{userInfo?.username || "未登录"}</p>
            <p className={styles.popEmail}>{userInfo?.email || ""}</p>
          </div>
        </div>
        <Dropdown.Menu onAction={handleAction}>
          <Dropdown.Item id="profile" textValue="个人资料">
            <Label>个人资料</Label>
          </Dropdown.Item>
          <Dropdown.Item id="logout" variant="danger" textValue="退出登录">
            <Label>退出登录</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
