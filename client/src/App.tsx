import { type ReactNode, useEffect } from "react";
import {
  Route,
  Routes,
  NavLink,
  Outlet,
  Navigate,
  useNavigate,
} from "react-router-dom";
import server from "./axios/server";
import { useDispatch, useSelector } from "react-redux";
import { setLoginInfo, setUserInfo } from "./store/userSlice.ts";

import Header from "./components/header/index";
import Sidebar from "./components/sidebar/index";
import Footer from "./components/footer/index";
import Home from "./views/home/index";
import Playlist from "./views/song_list/index";
import MyLike from "./views/my-like/index";
import Auth, {
  type LoginCredentials,
  type RegisterCredentials,
} from "./views/auth/index";
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
  const navigate = useNavigate();

  const dispatch = useDispatch();

  // 1.用户信息返回的数据结构
  interface MeResponse {
    message: string;
    user: {
      id: number;
      username: string;
      email: string;
      avatar: string | null;
    };
  }
  useEffect(() => {
    const authData = localStorage.getItem("auth_data");
    if (authData) {
      const { token, userId, expiry } = JSON.parse(authData);

      // 检查是否过期
      if (Date.now() < expiry) {
        server
          .get<any, MeResponse>("/api/auth/me", {
            params: { id: userId },
          })
          .then((res) => {
            dispatch(setUserInfo(res.user)); // 把获取到的最新用户信息存入 Redux
          })
          .catch(() => {
            localStorage.removeItem("auth_data"); // 请求失败说明 token 失效
          });
      }
    }
  }, [dispatch]);

  // 1. 定义后端返回的数据结构
  interface LoginResponse {
    message: string;
    token: string;
    user: {
      id: number;
      username: string;
      email: string;
      avatar: string | null;
    };
  }
  // 处理登录
  const handleLogin = async (data: LoginCredentials) => {
    console.log("正在提交登录请求:", data);
    try {
      const { email, password } = data;

      /* <any, LoginResponse> 泛型，Axios的post方法的前两个参数：第一个指的是你发给后端的数据类型（即 request.data）。填 any 意味着：“我发给后端的东西随便什么类型都行，不需要 TS 帮我检查”。
       第二个指的是请求执行完后，最终返回给你的 res 的类型。填 LoginResponse是告诉ts已经返回的是response.data，不是response， 意味着：“我已经知道拦截器把壳剥掉了，最终拿到的 res 就是我定义的那个包含 token 的对象”。*/
      const res = await server.post<any, LoginResponse>("/api/auth/login", {
        email,
        password,
      });
      console.log("res", res);

      const loginInfo = {
        token: res.token,
        userId: res.user.id,
        expiry: Date.now() + 7 * 24 * 60 * 60 * 1000, // 当前时间 + 7天的毫秒数
      };
      localStorage.setItem("auth_data", JSON.stringify(loginInfo));
      dispatch(
        setLoginInfo({
          user: {
            ...res.user,
          },
          token: res.token,
        }),
      );

      navigate("/");
    } catch (error) {
      throw new Error("邮箱或密码错误");
    }
  };
  //注册返回的数据结构
  interface RegisterResponse {
    message: string;
    token: string;
    user: {
      id: number;
      username: string;
      email: string;
    };
  }

  // 处理注册
  const handleRegister = async (data: RegisterCredentials) => {
    console.log("正在提交注册请求:", data);
    // 同样对接你的注册 API
    try {
      const res = await server.post<any, RegisterResponse>(
        "/api/auth/register",
        data,
      );
      console.log("res", res);
      const loginInfo = {
        token: res.token,
        userId: res.user.id,
        expiry: Date.now() + 7 * 24 * 60 * 60 * 1000, // 当前时间 + 7天的毫秒数
      };
      localStorage.setItem("auth_data", JSON.stringify(loginInfo));
      navigate("/");
    } catch (err) {
      throw new Error("邮箱或密码错误");
    }
  };

  return (
    <Routes>
      {/* 登录页完全独立 */}
      <Route
        path="/auth"
        element={<Auth onLogin={handleLogin} onRegister={handleRegister} />}
      />

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
