import axios from "axios";
import { clearSession, readSession } from "../features/auth/session";

const server = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});
const whiteList = ["/login", "/register"];
// 请求拦截器
server.interceptors.request.use((config) => {
  const url = config.url || "";
  const isWhiteListed = whiteList.some((path) => url.includes(path));
  
  if (!isWhiteListed) {
    const session = readSession();
    if (session) config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

// 响应拦截器
server.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 检查是否有响应对象（网络断开时 error.response 是没有值的）
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          clearSession();
          if (window.location.pathname !== "/auth") {
            window.location.assign("/auth");
          }
          break;
        case 403:
          console.error("权限不足");
          break;
        case 500:
          console.error("服务器错误");
          break;
        default:
          console.error("其他错误：", error.response.data.message);
      }
    } else {
      // 处理断网或请求超时
      console.error("网络错误或请求超时");
    }
    // 必须返回 reject，否则业务代码里的 .catch 就捕获不到错误了
    return Promise.reject(error);
  },
);
export default server;
