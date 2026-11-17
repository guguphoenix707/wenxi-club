# 后端

Node.js 24 + TypeScript，使用 node:http。dev 使用 Node 原生类型擦除，build 使用 tsc 输出 dist，生产启动运行编译后的 JS。

根目录 `npm run dev:backend`；默认绑定 127.0.0.1:3001。复制 `.env.example` 为 `.env` 配置。容器运行时设置 `HOST=0.0.0.0`。

已实现：

- `GET /api/health`
- 配置齐全时的 Better Auth 邮箱注册/登录（`/api/auth/*`）
- 可选的微信网站登录

登录需要 PostgreSQL，以及 `BETTER_AUTH_URL` 指向浏览器源。微信凭据可选。缺核心配置时健康检查仍可用，`/api/auth/*` 返回 `AUTH_NOT_CONFIGURED`。进程启动不执行迁移。当前验证码邮件走日志实现。
