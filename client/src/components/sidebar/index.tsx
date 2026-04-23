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

export default function Sidebar({ paths }: SidebarProps) {
  const menuItems = paths.filter((item) => !item.hidden);
  return (
    <div className={styles.sideBar}>
      {menuItems.map((path) => (
        <NavLink
          className={({ isActive }) =>
            isActive ? `${styles.navItem} ${styles.navActive}` : styles.navItem
          }
          key={path.id}
          to={path.path}
        >
          {path.name}
        </NavLink>
      ))}
    </div>
  );
}
