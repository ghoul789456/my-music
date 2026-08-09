import { useState, type Key } from "react";
import { Avatar, Dropdown, Label } from "@heroui/react";
import { Search, Bell } from "lucide-react";
import styles from "./index.module.css";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { type RootState, type AppDispatch } from "../../store/store";
import { logout } from "../../store/userSlice";

export default function Header() {
  const navigate = useNavigate();
  const { userInfo, isLoggedIn } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const handleMobileOpenChange = (open: boolean) => {
    if (isLoggedIn) setIsMobileOpen(open);
    else { navigate("/auth"); }
  };

  const handleDesktopOpenChange = (open: boolean) => {
    if (isLoggedIn) setIsDesktopOpen(open);
    else { navigate("/auth"); }
  };

  const handleAction = (key: Key) => {
    console.log("key");

    switch (key) {
      case "logout": localStorage.removeItem("auth_data"); dispatch(logout()); break;
      case "profile": navigate("/profile"); break;
      default: break;
    }
  };

  const [searchValue, setSearchValue] = useState("");

  return (
    <>
      {/* 移动端 */}
      <header className={`${styles.header} ${styles.mobileOnly}`}>
        <span className={styles.mobileTitle}>MY MUSIC</span>
        <div className={styles.actions}>
          <Dropdown isOpen={isMobileOpen} onOpenChange={handleMobileOpenChange}>
            <Dropdown.Trigger aria-label="打开用户菜单">
              <Avatar className={`${styles.avatar} ${styles.avatarWrap}`}>
                <Avatar.Image alt="" src={userInfo?.avatar || ""} />
                <Avatar.Fallback>{userInfo?.username?.[0] || "U"}</Avatar.Fallback>
              </Avatar>
            </Dropdown.Trigger>
            <Dropdown.Popover className={styles.popover}>
              <div className={styles.popInfo}>
                <Avatar size="md"><Avatar.Image alt="" src={userInfo?.avatar || ""} /><Avatar.Fallback>{userInfo?.username?.[0]}</Avatar.Fallback></Avatar>
                <div>
                  <p className={styles.popName}>{userInfo?.username || "未登录"}</p>
                  <p className={styles.popEmail}>{userInfo?.email || ""}</p>
                </div>
              </div>
              <Dropdown.Menu onAction={handleAction}>
                <Dropdown.Item id="profile"><Label>个人资料</Label></Dropdown.Item>
                <Dropdown.Item id="logout" variant="danger" textValue="退出登录"><Label>退出登录</Label></Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </header>

      {/* 桌面端 */}
      <header className={`${styles.header} ${styles.desktopOnly}`}>
        <div className={styles.brand}>
          <div className={styles.brandText}>
            <p className={styles.brandTitle}>MY MUSIC</p>
            <p className={styles.brandSub}>PRIVATE LISTENING</p>
          </div>
        </div>

        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="音乐搜索"
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.iconBtn} aria-label="通知">
            <Bell size={20} />
          </button>
          <Dropdown isOpen={isDesktopOpen} onOpenChange={handleDesktopOpenChange}>
            <Dropdown.Trigger aria-label="打开用户菜单">
              <Avatar className={`${styles.avatar} ${styles.avatarWrap}`}>
                <Avatar.Image alt="" src={userInfo?.avatar || ""} />
                <Avatar.Fallback>{userInfo?.username?.[0] || "U"}</Avatar.Fallback>
              </Avatar>
            </Dropdown.Trigger>
            <Dropdown.Popover className={styles.popover}>
              <div className={styles.popInfo}>
                <Avatar size="md"><Avatar.Image alt="" src={userInfo?.avatar || ""} /><Avatar.Fallback>{userInfo?.username?.[0]}</Avatar.Fallback></Avatar>
                <div>
                  <p className={styles.popName}>{userInfo?.username || "未登录"}</p>
                  <p className={styles.popEmail}>{userInfo?.email || ""}</p>
                </div>
              </div>
              <Dropdown.Menu onAction={handleAction}>

                <Dropdown.Item id="profile" textValue="个人资料">
                  <Label>个人资料</Label>
                </Dropdown.Item>
                <Dropdown.Item id="logout" variant="danger" textValue="退出登录"><Label>退出登录</Label></Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </header>
    </>
  );
}
