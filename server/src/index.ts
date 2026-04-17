import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config'; // 确保在实例化前加载了 .env
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// 注册接口
app.post('/api/register', async (req: Request, res: Response) => {
  const { email, username, password } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

  // 1. 基础校验
  if (!email || !username || !password) {
    return res.status(400).json({ message: '请填写所有必填字段' });
  }

  try {
    // 2. 检查用户是否已存在
    //相当于select * from user where email='email' or username= 'username' limit 1
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });
    /** // prisma语法
    1.查询
    SELECT * FROM user; => await prisma.user.findMany()
    带条件
    SELECT * FROM user WHERE email = 'a@qq.com'; => 
    await prisma.user.findMany({
        where: { email: 'a@qq.com' }
    })
    查一个
    SELECT * FROM user WHERE id = 1 LIMIT 1; =>
    await prisma.user.findFirst({
        where: { id: 1 }
    })

    2.插入
    INSERT INTO user (email, username) VALUES ('a@qq.com', 'tom'); =>
    await prisma.user.create({
        data: {
            email: 'a@qq.com',
            username: 'tom'
        }
    })

    3.更新
    UPDATE user SET username = 'jack' WHERE id = 1; =>
    await prisma.user.update({
        where: { id: 1 },
        data: { username: 'jack' }
    })
    
    4.删除
    DELETE FROM user WHERE id = 1; =>
    await prisma.user.delete({
        where: { id: 1 }
    })*/

    if (existingUser) {
      return res.status(400).json({ message: '邮箱或用户名已被占用' });
    }

    // 3. 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. 存入数据库
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
      // 5. 体验 Prisma 的便捷：选择性返回字段，不要把密码发回给前端
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true
      }
    });
    //6.创建用户成功后，生成 Token
    const token = jwt.sign(
      { userId: user.id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '7d' } // 设置过期时间，比如 7 天
    );

    res.status(201).json({
      message: '注册成功',
      user,
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务已启动：http://localhost:${PORT}`);
});