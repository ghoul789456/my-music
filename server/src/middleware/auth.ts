import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // 格式通常是 "Bearer TOKEN"

  if (!token) return res.status(401).json({ message: '请先登录' });

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Token 已失效' });
    
    // 把解析出来的用户信息挂载到 req 上，方便后面的业务逻辑使用
    (req as any).user = user; 
    next();
  });
};