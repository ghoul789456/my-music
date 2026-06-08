import express from "express";
import "dotenv/config"; // 确保在实例化前加载了 .env
import authRoutes from "./routes/auth.js";
import songRoutes from "./routes/song.js";
import cors from "cors";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//允许浏览器访问c盘文件
app.use("/static", express.static("C:/Users/15175/Desktop/resource"));

// 注册接口
app.use("/api/auth", authRoutes);
app.use("/api/song", songRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务已启动：http://localhost:${PORT}`);
});
