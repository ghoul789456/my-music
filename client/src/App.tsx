import { type ReactNode } from "react";
import { Route, Routes, NavLink, Outlet, Navigate } from "react-router-dom";
import Header from "./components/header/index";
import Sidebar from "./components/sidebar/index";
import Footer from "./components/footer/index";
import Home from "./views/home/index";
import Playlist from "./views/song_list/index";
import MyLike from "./views/my-like/index";
import Auth from "./views/auth/index";
import "./App.css";
function App() {
  interface PathType {
    id: string;
    name: string;
    path: string;
    element: ReactNode;
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
      element: <MyLike />,
    },
  ];
  interface MainLayoutProps {
    paths: PathType[];
    children?: React.ReactNode;
  }

  const MainLayout = ({ paths }: MainLayoutProps) => (
    <div className="container">
      <Header />
      <main>
        <Sidebar paths={paths} />
        {/* 嵌套路由用Outlet */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );

  return (
    <Routes>
      {/* 登录页完全独立 */}
      <Route path="/auth" element={<Auth />} />

      {/* 不写 path 属性时，这个路由就变成了一个纯粹的容器。它不参与 URL 匹配，它会“无条件”地包裹住它内部的所有子路由，当子路由（如 /home）被匹配到时，React Router 会先渲染父级的 element（即 MainLayout），然后把匹配到的子组件（如 Home）填充到 MainLayout 中 <Outlet /> 出现的位置 */}
      <Route element={<MainLayout paths={paths} />}>
        {paths.map((p) => (
          <Route key={p.id} path={p.path} element={p.element} />
        ))}
        {/* 根路径重定向等 */}
        <Route path="/" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
