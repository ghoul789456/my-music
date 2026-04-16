import React, { type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import "./index.scss";
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
    <div className="sideBar">
      {paths.map((path) => (
        <NavLink
          className={({ isActive }) =>
            isActive ? "nav-item nav-active" : "nav-item"
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
