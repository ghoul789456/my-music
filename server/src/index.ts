import express from 'express';
import 'dotenv/config'; // 确保在实例化前加载了 .env
import authRoutes from './routes/auth.js';
import cors from 'cors'
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cors())
// 注册接口
app.use('/api/auth', authRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务已启动：http://localhost:${PORT}`);
});