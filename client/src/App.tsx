import { type ReactNode, useEffect, useState, lazy, Suspense } from "react";
import {
  Route,
  Routes,
  Outlet,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { logout, setLoginInfo, setUserInfo } from "./store/userSlice.ts";
import { removeAllSong } from "./store/songSlice.ts";
import { useAppDispatch, useAppSelector } from "./store/hooks.ts";
import { authApi } from "./features/auth/api.ts";
import { clearSession, readSession, saveSession } from "./features/auth/session.ts";
import type {
  LoginCredentials,
  RegisterCredentials,
} from "./features/auth/types.ts";

import Header from "./components/header";
import Sidebar from "./components/sidebar";
import Footer from "./components/footer";
import MiniPlayer from "./components/miniPlayer";
import AudioController from "./components/audio";
import LoginPrompt from "./components/loginPrompt";
//懒加载子组件
const Home = lazy(() => import('./views/home'));
const Playlist = lazy(() => import('./views/song_list'));
const MyLike = lazy(() => import('./views/my-like'));
const Profile = lazy(() => import('./views/personal_center'));
const Auth = lazy(() => import('./views/auth/'));
const PageLoading  = lazy(() => import('./components/pageLoading'));
const Album  = lazy(() => import('./views/album'));

import "./App.css";
interface PathType {
  id: string;
  name: string;
  path: string;
  element: ReactNode;
  hidden?: boolean;
}
interface MainLayoutProps {
  paths: PathType[];
  isFooterOpen: boolean;  // 新增：把状态传进来
  setIsFooterOpen: (open: boolean) => void; // 新增
}
const MainLayout = ({ paths, isFooterOpen, setIsFooterOpen }: MainLayoutProps) => (
  <div className="appContainer">
    <Header />
    <main>
      <Sidebar paths={paths} />
      {/* Suspense用于处理异步操作的中间状态，避免手动管理加载逻辑，fallback用于当子组件未准备好时显示的内容 */}
      <Suspense fallback={
       <PageLoading/>
      }>
        <Outlet />
      </Suspense>
    </main>
    {/* 这里使用传进来的状态 */}
    <MiniPlayer onExpand={() => setIsFooterOpen(true)} />
    <Footer isOpen={isFooterOpen} onClose={() => setIsFooterOpen(false)} />
    <AudioController />
  </div>
);
function App() {

  const [isFooterOpen, setIsFooterOpen] = useState(false);



  const paths: PathType[] = [
    {
      id: "home",
      name: "首页",
      path: "/",
      element: <Home />,
    },
    {
      id: "playlist",
      name: "歌曲",
      path: "/playlist",
      element: <Playlist />,
    },
    {
      id: "myLike",
      name: "我的喜欢",
      path: "/myLike",
      element: <MyLike />,
    },
    {
      id: "profile",
      name: "个人资料",
      path: "/profile",
      element: <Profile />,
      hidden: true,
    },
    {
      id: "album",
      name: "专辑页",
      path: "/album/:id",
      element: <Album />,
      hidden: true,
    },
  ];


  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) dispatch(removeAllSong());
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    if (!readSession()) return;

    authApi
      .getCurrentUser()
      .then((response) => dispatch(setUserInfo(response.user)))
      .catch(() => {
        clearSession();
        dispatch(logout());
      });
  }, [dispatch]);

  const handleLogin = async (data: LoginCredentials) => {
    try {
      const res = await authApi.login(data);
      saveSession(res.token, res.user.id);
      dispatch(
        setLoginInfo({
          user: res.user,
          token: res.token,
        }),
      );

      navigate("/");
    } catch {
      throw new Error("邮箱或密码错误");
    }
  };

  const handleRegister = async (data: RegisterCredentials) => {
    try {
      const res = await authApi.register(data);
      saveSession(res.token, res.user.id);
      dispatch(
        setLoginInfo({
          user: res.user,
          token: res.token,
        }),
      );
      navigate("/");
    } catch {
      throw new Error("注册失败，请稍后再试");
    }
  };

  return (
    <>
      <Routes>
      {/* 登录页完全独立 */}
      <Route
        path="/auth"
        element={
          <Suspense fallback={
            <PageLoading/>
          }>
            <Auth onLogin={handleLogin} onRegister={handleRegister} />
          </Suspense>
        }
      />

      {/* 不写 path 属性时，这个路由就变成了一个纯粹的容器。它不参与 URL 匹配，它会“无条件”地包裹住它内部的所有子路由，当子路由（如 /home）被匹配到时，React Router 会先渲染父级的 element（即 MainLayout），然后把匹配到的子组件（如 Home）填充到 MainLayout 中 <Outlet /> 出现的位置 */}
      <Route element={
        <MainLayout
          paths={paths}
          isFooterOpen={isFooterOpen}
          setIsFooterOpen={setIsFooterOpen}
        />
      }>
        {paths.map((p) => (
          <Route key={p.id} path={p.path} element={p.element} />
        ))}
        {/* 根路径重定向等 */}
        <Route path="/" element={<Navigate to="/home" replace />} />
      </Route>
      </Routes>
      <LoginPrompt />
    </>
  );
}

export default App;
