Prisma 7 + PostgreSQL 后端初始化指南 (2026版)
本项目后端采用 Node.js (tsx) + Prisma 7 + PostgreSQL 架构，并使用驱动适配器（Driver Adapters）模式以增强兼容性。

1. 环境准备与安装
首先，确保已安装 Node.js，然后在项目根目录执行以下命令：

核心依赖
Bash
# Web 框架与加密工具
npm install express jsonwebtoken bcryptjs dotenv

# Prisma 核心及 PostgreSQL 驱动适配器
npm install @prisma/client @prisma/adapter-pg pg
开发依赖
Bash
# TS 运行环境与类型定义
npm install -D typescript tsx @types/node @types/express @types/jsonwebtoken @types/bcryptjs @types/pg 

# Prisma 命令行工具与配置增强
npm install -D prisma @prisma/config
2. 初始化配置
2.1 Prisma 初始化
Bash
npx prisma init
2.2 创建 Prisma 配置文件
在根目录创建 prisma.config.ts（Prisma 7 新规范）：

TypeScript
import 'dotenv/config';
import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
2.3 配置环境变量 .env
代码段
DATABASE_URL="postgresql://postgres:你的密码@localhost:5432/数据库名?schema=public"
JWT_SECRET="你的随机密钥"
3. 数据库建模与同步
3.1 编写 Schema
编辑 prisma/schema.prisma：

代码段
generator client {
  provider = "prisma-client-js"
  // 注意：不要在这里写 output 路径，保持默认即可
}

datasource db {
  provider = "postgresql"
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  username  String   @unique
  password  String
  createdAt DateTime @default(now())
}
3.2 同步指令
Bash
# 1. 生成数据库迁移文件并更新表结构
npx prisma migrate dev --name init

# 2. 生成本地 TypeScript 类型库 (关键步骤)
npx prisma generate
4. 后端代码集成
4.1 数据库客户端单例 (src/db.ts)
TypeScript
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// Prisma 7 必须通过 adapter 实例化以支持 pg 驱动
export const prisma = new PrismaClient({ adapter });
4.2 启动脚本配置 (package.json)
JSON
"scripts": {
  "dev": "tsx watch src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js"
}
5. 常见问题排查 (FAQ)
Error: Cannot find module '.prisma/client/default'

原因：未执行 npx prisma generate 或 generator 中设置了错误的 output。

Connection timeout expired

原因：PostgreSQL 服务未启动，或防火墙拦截了 5432 端口。尝试将 localhost 改为 127.0.0.1。

Unknown property 'datasource'...

原因：Prisma 7 构造函数校验极其严格，必须确保通过 adapter 方式传入连接，或者使用 datasources: { db: { url: ... } } 格式。

用户名是什么？

默认通常是 postgres。