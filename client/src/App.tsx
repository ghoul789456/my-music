import {type ReactNode} from 'react'
import { Route, Routes, NavLink } from "react-router-dom";
import Header from "./components/header";
import Sidebar from "./components/sidebar";
import Home from "./views/home/index";
import Playlist from "./views/song_list";
import MyLike from "./views/my-like";
import "./App.css";
function App() {
   interface PathType {
    id: string,
    name: string,
    path: string,
    element: ReactNode,
}
  const paths: PathType[] = [
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
    {
      id: "myLike",
      name: "我的喜欢",
      path: "/myLike",
      element: <MyLike />
    },
  ];
 
return (
  <div className="container">
    <Header />
    <main>
      <Sidebar paths={paths} />
      <Routes>
        {paths.map((path) => (
          <Route key={path.id} path={path.path} element={path.element}></Route>
        ))}
      </Routes>
    </main>
  </div>
);

}

export default App;
