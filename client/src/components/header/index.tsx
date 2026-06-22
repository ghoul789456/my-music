import { useState, type Key } from "react";
import { Avatar, Dropdown, Label, Modal } from "@heroui/react";
import { Check, MonitorCog, Moon, Search, Bell, Settings, Sun } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import styles from "./index.module.css";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { type RootState, type AppDispatch } from "../../store/store";
import { logout } from "../../store/userSlice";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { userInfo, isLoggedIn } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
      <Modal isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <Modal.Backdrop className={styles.settingsBackdrop}>
          <Modal.Container>
            <Modal.Dialog className={styles.settingsDialog}>
              <Modal.Header className={styles.settingsHeader}>
                <div className={styles.settingsTitleWrap}>
                  <span className={styles.settingsIcon}>
                    <Settings size={18} />
                  </span>
                  <div>
                    <Modal.Heading className={styles.settingsTitle}>设置</Modal.Heading>
                    <p className={styles.settingsSubtitle}>调整播放器的基础偏好</p>
                  </div>
                </div>
              </Modal.Header>
              <Modal.Body className={styles.settingsBody}>
                <section className={styles.settingSection}>
                  <div className={styles.sectionHead}>
                    <MonitorCog size={18} />
                    <h3>通用设置</h3>
                  </div>
                  <div className={styles.settingRow}>
                    <div>
                      <p className={styles.settingLabel}>更改主题色</p>
                      <p className={styles.settingHint}>选择浅色或深色界面</p>
                    </div>
                    <div className={styles.themeOptions} role="radiogroup" aria-label="更改主题色">
                      <button
                        type="button"
                        className={`${styles.themeOption} ${theme === "light" ? styles.themeOptionActive : ""}`}
                        onClick={() => setTheme("light")}
                        role="radio"
                        aria-checked={theme === "light"}
                      >
                        <span className={`${styles.themeSwatch} ${styles.lightSwatch}`} />
                        <Sun size={16} />
                        <span>浅色</span>
                        {theme === "light" && <Check size={15} className={styles.themeCheck} />}
                      </button>
                      <button
                        type="button"
                        className={`${styles.themeOption} ${theme === "dark" ? styles.themeOptionActive : ""}`}
                        onClick={() => setTheme("dark")}
                        role="radio"
                        aria-checked={theme === "dark"}
                      >
                        <span className={`${styles.themeSwatch} ${styles.darkSwatch}`} />
                        <Moon size={16} />
                        <span>深色</span>
                        {theme === "dark" && <Check size={15} className={styles.themeCheck} />}
                      </button>
                    </div>
                  </div>
                </section>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* 移动端 */}
      <header className={`${styles.header} ${styles.mobileOnly}`}>
        <span className={styles.mobileTitle}>Music</span>
        <div className={styles.actions}>
          <button className={styles.iconBtn} aria-label="设置" onClick={() => setIsSettingsOpen(true)}>
            <Settings size={20} />
          </button>
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
        {/* Logo */}
        <div className={styles.brand}>
          <div className={styles.logo}>M</div>
          <div className={styles.brandText}>
            <h1 className={styles.brandTitle}>Music Premium</h1>
            <p className={styles.brandSub}>聆听无限</p>
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
          <button className={styles.iconBtn} aria-label="设置" onClick={() => setIsSettingsOpen(true)}>
            <Settings size={20} />
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
