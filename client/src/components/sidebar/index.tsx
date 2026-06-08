import React, { type ReactNode } from "react";
import { NavLink } from "react-router-dom";
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

const NAV_ICONS: Record<string, string> = {
  home: "home",
  playlist: "library_music",
  myLike: "favorite",
  profile: "person",
};

const NAV_LABELS: Record<string, string> = {
  home: "首页",
  playlist: "音乐库",
  myLike: "我的喜欢",
  profile: "个人资料",
};

export default function Sidebar({ paths }: SidebarProps) {
  const menuItems = paths.filter((item) => !item.hidden);

  return (
    <aside className={styles.sideBar}>
      {/* 品牌 Logo */}
      <div className={styles.brand}>
        <div className={styles.logoBox}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            width="40"
            height="40"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="var(--primary, #605e5c)"
              strokeWidth="2"
              fill="none"
              opacity="0.2"
            />
            <rect x="38" y="35" width="6" height="30" rx="3" fill="var(--primary, #605e5c)" />
            <rect x="47" y="30" width="6" height="40" rx="3" fill="var(--primary, #605e5c)" />
            <rect x="56" y="40" width="6" height="20" rx="3" fill="var(--primary, #605e5c)" />
          </svg>
        </div>
      </div>

      {/* 导航 */}
      <nav className={styles.nav}>
        {menuItems.map((path) => (
          <NavLink
            className={({ isActive }) =>
              isActive
                ? `${styles.navItem} ${styles.navActive}`
                : styles.navItem
            }
            key={path.id}
            to={path.path}
          >
            {({ isActive }) => (
              <>
                <span
                  className={`material-symbols-outlined ${styles.navIcon}`}
                  style={{
                    fontVariationSettings: isActive
                      ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
                      : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                  }}
                >
                  {NAV_ICONS[path.id] || "music_note"}
                </span>
                <span className={styles.navLabel}>
                  {NAV_LABELS[path.id] || path.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 底部占位 */}
      <div className={styles.footer} />
    </aside>
  );
}
