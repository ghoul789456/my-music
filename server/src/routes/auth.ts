import { Router,Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});


// 注册接口
router.post('/register', async (req: Request, res: Response) => {
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
    if (existingUser.email === email) {
      return res.status(400).json({ message: '该邮箱已被注册' });
    }
    if (existingUser.username === username) {
      return res.status(400).json({ message: '该用户名已被占用' });
    }
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

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

  // 1. 基础校验
  if (!email || !password) {
    return res.status(400).json({ message: '请填写邮箱和密码' });
  }

  try {
    // 2. 只根据邮箱查找用户
    // 注意：不要在数据库查询里比对密码，因为数据库里存的是加密后的密文
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    // 3. 用户不存在的校验
    if (!user) {
      return res.status(401).json({ message: '用户不存在或密码错误' });
    }

    // 4. 比对密码 (关键步骤！)
    // 使用 bcrypt.compare 将前端传来的明文 password 
    // 与数据库里的 user.password (哈希值) 进行比对
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: '用户不存在或密码错误' });
    }

    // 5. 登录成功，生成 Token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 6. 返回结果（不包含密码）
    res.status(200).json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('登录报错:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

export default router;