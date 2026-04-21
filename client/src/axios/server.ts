import axios from "axios";

const server = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});
const whiteList = ["/login", "/register"];

const authData = JSON.parse(localStorage.getItem("auth_data") || "{}");
if (authData.expiry && Date.now() > authData.expiry) {
  localStorage.removeItem("auth_data");
  // 引导去登录
  window.location.href = "/auth";
}
// 请求拦截器
server.interceptors.request.use(
  (config) => {
    console.log("config", config.url);
    const url = config.url || "";
    const isWhiteListed = whiteList.some((path) => url.includes(path));
    if (!isWhiteListed) {
      //注入 Token,用于把token放在请求头中发给后端
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器
server.interceptors.response.use(
  (response) => {
    console.log("response", response.data);
    return response.data;
  },
  (error) => {
    // 检查是否有响应对象（网络断开时 error.response 是没有值的）
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          // 精准打击：只有 401 才清理并跳登录
          console.error("身份过期或无效");
          localStorage.removeItem("token");
          window.location.href = "/auth";
          break;
        case 403:
          // 提示用户权限不足，但不删 Token
          alert("你没有权限访问该功能");
          break;
        case 500:
          alert("服务器打瞌睡了，请稍后再试");
          break;
        default:
          console.error("其他错误：", error.response.data.message);
      }
    } else {
      // 处理断网或请求超时
      alert("网络好像断了，检查一下网络设置吧");
    }
    // 必须返回 reject，否则业务代码里的 .catch 就捕获不到错误了
    return Promise.reject(error);
  },
);
export default server;
