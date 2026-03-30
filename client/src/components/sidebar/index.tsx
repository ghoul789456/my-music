import React from "react";
import { Route, Routes, NavLink } from "react-router-dom";
import Home from "../../views/home";
import Playlist from "../../views/song_list";
import MyLike from "../../views/my-like";
import "./index.css";
export default function Sidebar() {
  const paths = [
    {
      id: "home",
      name: "首页",
      path: "/",
      element: <Home />,
    },
    {
      id: "playlist",
      name: "歌单",
      path: "/playlist",
      element: <Playlist />,
    },
    { id: "my-like", name: "我的喜欢", path: "/my-like", element: <MyLike /> },
  ];

  return (
    <div className="sideBar">
      {paths.map((path) => (
        <NavLink key={path.id} to={path.path}>
          {path.name}
        </NavLink>
      ))}
      <Routes>
        {paths.map((path) => (
          <Route key={path.id} path={path.path} element={path.element}>
            {path.name}
          </Route>
        ))}
      </Routes>
    </div>
  );
}
