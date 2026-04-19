import React, { type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import styles from "./index.module.scss";

interface PathType {
  id: string;
  name: string;
  path: string;
  element: ReactNode;
}

interface SidebarProps {
  paths: PathType[];
}

export default function Sidebar({ paths }: SidebarProps) {
  return (
    <div className={styles.sideBar}>
      {paths.map((path) => (
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
