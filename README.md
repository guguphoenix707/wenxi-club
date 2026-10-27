# 面试温习社 · 生产工程

参考原型 `/Users/xin/Documents/wenxi-house` 初始化的独立生产工程骨架。技术栈：Next.js / React / TypeScript + Node.js；npm workspaces 统一依赖。

## 开始开发

需要 Node.js 24（可执行 `nvm use`）。

```sh
npm ci
npm run dev
```

前端 http://localhost:3000，后端 http://127.0.0.1:3001。默认配置无需环境文件；需要修改时参考前后端 .env.example。前端同源 `/api/health` 转发到后端。

```sh
npm run check
npm run build
# 生产运行需要两个进程（两个终端或进程管理器）
npm run start:backend
npm start
```

`npm run dev:frontend`、`npm run dev:backend` 可单独启动服务。

## 当前范围

已实现五个页面入口、响应式导航、错误/加载/404 边界、API 健康检查、配置校验、进程退出处理、类型检查和基础服务测试。题库、温习、导入、统计页面明确标识为待接入；未复制原型模拟记录。

尚未实现用户与微信登录、数据库持久化、温习算法、业务 API、AI 调用、支付和上线配置。本工程是生产开发起点，不代表已经可上线运营。

结构见 [docs/project-structure.md](docs/project-structure.md)，接口见 [docs/contracts.md](docs/contracts.md)，协作约定见 [AGENTS.md](AGENTS.md)。
