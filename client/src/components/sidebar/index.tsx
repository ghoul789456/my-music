import React, { type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Heart, House, Music } from "lucide-react";
import styles from "./index.module.scss";

interface PathType {
  id: string;
  name: string;
  path: string;
  element: ReactNode;
  hidden?: boolean;
}

interface SidebarProps {
  paths: PathType[];
}

const NAV_ICONS: Record<string, React.ReactNode> = {
  home: <House size={22} />,
  playlist: <Music size={22} />,
  myLike: <Heart size={22} />,
};

const NAV_LABELS: Record<string, string> = {
  home: "首页",
  playlist: "歌曲",
  myLike: "我的喜欢",
};

export default function Sidebar({ paths }: SidebarProps) {
  const menuItems = paths.filter((item) => !item.hidden);

  return (
    <>
      <aside className={styles.sideBar}>
        {/* 主导航 */}
        <nav className={styles.nav}>
          <p className={styles.sectionLabel}>浏览</p>
          {menuItems.map((path) => (
            <NavLink
              className={({ isActive }) =>
                isActive ? `${styles.navItem} ${styles.navActive}` : styles.navItem
              }
              key={path.id}
              to={path.path}
            >
              <span className={styles.navIcon}>
                {NAV_ICONS[path.id] || <Music size={22} />}
              </span>
              <span className={styles.navLabel}>
                {NAV_LABELS[path.id] || path.name}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* 底部 CTA 按钮（无订阅功能） */}
        {/* <div className={styles.footer}>
          <button className={styles.ctaBtn}>
            升级订阅
          </button>
        </div> */}
      </aside>

      <nav className={styles.mobileNav} aria-label="主导航">
        {menuItems.map((path) => (
          <NavLink
            className={({ isActive }) =>
              isActive ? `${styles.mobileNavItem} ${styles.mobileNavActive}` : styles.mobileNavItem
            }
            key={path.id}
            to={path.path}
          >
            <span className={styles.mobileNavIcon}>
              {NAV_ICONS[path.id] || <Music size={22} />}
            </span>
            <span className={styles.mobileNavLabel}>
              {NAV_LABELS[path.id] || path.name}
            </span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
