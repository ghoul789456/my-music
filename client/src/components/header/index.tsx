import { useState, type Key } from "react";
import {
  Avatar,
  Dropdown,
  Label,
  Button,
} from "@heroui/react";
import { useTheme } from "../../contexts/ThemeContext";
import styles from "./index.module.css";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { type RootState, type AppDispatch } from "../../store/store";
import { logout } from "../../store/userSlice";

export default function Header() {
  const { isDark, setTheme } = useTheme();

  const navigate = useNavigate();
  const goHome = () => navigate("/");

  const { userInfo, isLoggedIn } = useSelector(
    (state: RootState) => state.user,
  );
  const dispatch = useDispatch<AppDispatch>();

  const [isOpen, setIsOpen] = useState(false);
  const handleOpenChange = (open: boolean) => {
    if (isLoggedIn) {
      setIsOpen(open);
    } else {
      navigate("/auth");
      setIsOpen(false);
    }
  };

  const handleAction = (key: Key) => {
    switch (key) {
      case "logout":
        localStorage.removeItem("auth_data");
        dispatch(logout());
        break;
      case "profile":
        navigate("/profile");
        break;
      case "setting":
        break;
      default:
        break;
    }
  };

  const backup = () => navigate(-1);

  const [searchValue, setSearchValue] = useState("");

  return (
    <>
      {/* 移动端头部 */}
      <header className={`${styles.header} md:hidden`}>
        {/* 简易 Logo */}
        <div className={styles.mobileLogo} onClick={goHome} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && goHome()}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="32" height="32">
            <rect x="38" y="35" width="6" height="30" rx="3" fill="var(--primary, #605e5c)" />
            <rect x="47" y="30" width="6" height="40" rx="3" fill="var(--primary, #605e5c)" />
            <rect x="56" y="40" width="6" height="20" rx="3" fill="var(--primary, #605e5c)" />
          </svg>
        </div>
        <div className={styles.headerRight}>
          <button className="material-symbols-outlined" style={{ color: "var(--on-surface-variant)" }} aria-label="通知">
            notifications
          </button>
          <Dropdown isOpen={isOpen} onOpenChange={handleOpenChange}>
            <Dropdown.Trigger>
              <div className={styles.avatarTrigger}>
                <Avatar aria-label="用户" className={styles.avatarBtn}>
                  <Avatar.Image
                    alt="用户头像"
                    src={userInfo?.avatar || "https://lh3.googleusercontent.com/aida-public/default-avatar.png"}
                  />
                  <Avatar.Fallback>{userInfo?.username?.[0] || "U"}</Avatar.Fallback>
                </Avatar>
              </div>
            </Dropdown.Trigger>
            <Dropdown.Popover className={styles.userPopover}>
              <div className={styles.popoverUserInfo}>
                <Avatar size="md" aria-label="用户">
                  <Avatar.Image alt="用户头像" src={userInfo?.avatar || "https://lh3.googleusercontent.com/aida-public/default-avatar.png"} />
                  <Avatar.Fallback delayMs={600}>{userInfo?.username}</Avatar.Fallback>
                </Avatar>
                <div className={styles.popoverUserText}>
                  <p className={styles.popoverUserName}>{userInfo?.username || "未登录"}</p>
                  <p className={styles.popoverUserEmail}>{userInfo?.email || ""}</p>
                </div>
              </div>
              <Dropdown.Menu onAction={handleAction}>
                <Dropdown.Item id="profile" textValue="Profile"><Label>个人资料</Label></Dropdown.Item>
                <Dropdown.Item id="settings" textValue="Settings"><Label>设置</Label></Dropdown.Item>
                <Dropdown.Item id="logout" textValue="Logout" variant="danger"><Label>退出登录</Label></Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </header>

      {/* 桌面端头部 */}
      <header className={`${styles.header} hidden md:flex`}>
        {/* 左侧占位 */}
        <div className={styles.desktopLeft} />

        {/* 右侧 */}
        <div className={styles.headerRight}>
          <button className={`material-symbols-outlined ${styles.iconBtn}`} aria-label="通知">
            notifications
          </button>

          <button
            className={`material-symbols-outlined ${styles.iconBtn}`}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="切换主题"
          >
            {isDark ? "light_mode" : "dark_mode"}
          </button>

          {/* 分隔 + 头像 */}
          <div className={styles.userSection}>
            <Dropdown isOpen={isOpen} onOpenChange={handleOpenChange}>
              <Dropdown.Trigger>
                <div className={styles.avatarTrigger}>
                  <Avatar aria-label="用户" className={styles.avatarBtn}>
                    <Avatar.Image
                      alt="用户头像"
                      src={userInfo?.avatar || "https://lh3.googleusercontent.com/aida-public/default-avatar.png"}
                    />
                    <Avatar.Fallback>{userInfo?.username?.[0]?.toUpperCase() || "U"}</Avatar.Fallback>
                  </Avatar>
                </div>
              </Dropdown.Trigger>
              <Dropdown.Popover className={styles.userPopover}>
                <div className={styles.popoverUserInfo}>
                  <Avatar size="md" aria-label="用户">
                    <Avatar.Image alt="用户头像" src={userInfo?.avatar || "https://lh3.googleusercontent.com/aida-public/default-avatar.png"} />
                    <Avatar.Fallback delayMs={600}>{userInfo?.username}</Avatar.Fallback>
                  </Avatar>
                  <div className={styles.popoverUserText}>
                    <p className={styles.popoverUserName}>{userInfo?.username || "未登录"}</p>
                    <p className={styles.popoverUserEmail}>{userInfo?.email || ""}</p>
                  </div>
                </div>
                <Dropdown.Menu onAction={handleAction}>
                  <Dropdown.Item id="profile" textValue="Profile"><Label>个人资料</Label></Dropdown.Item>
                  <Dropdown.Item id="settings" textValue="Settings"><Label>设置</Label></Dropdown.Item>
                  <Dropdown.Item id="logout" textValue="Logout" variant="danger"><Label>退出登录</Label></Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          </div>
        </div>
      </header>
    </>
  );
}
