import express from "express";
import "dotenv/config"; // 确保在实例化前加载了 .env
import authRoutes from "./routes/auth.js";
import songRoutes from "./routes/song.js";
import cors from "cors";
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const RESOURCE_PATH =
  process.env.RESOURCE_PATH || "C:/Users/15175/Desktop/resource";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//允许浏览器访问c盘文件
app.use("/static", express.static(RESOURCE_PATH));

// 注册接口
app.use("/api/auth", authRoutes);
app.use("/api/song", songRoutes);

app.listen(PORT, () => {
  console.log(`服务已启动：http://localhost:${PORT}`);
});
