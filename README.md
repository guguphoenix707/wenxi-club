# 面试温习社 · 生产工程

参考原型 `/Users/xin/Documents/wenxi-house` 初始化的独立生产工程骨架，使用 React / TypeScript + Node.js；npm workspaces 统一依赖。

## 架构决策

- 应用：Vite + React Router SPA，承载今日总览、添加题目、温习、统计等应用内功能。
- 产品介绍页：单独在构建时生成静态 HTML，部署到公开地址。
- 后端：独立 Node.js API，统一承载业务，供 Web 和未来小程序使用。

产品介绍页的搜索收录需求由介绍页自身解决，不因此将应用内页面改为 Next.js。

当前应用已使用 Vite + React Router，路由映射集中在 `frontend/src/router.tsx`。产品介绍页尚未实现。

## 开始开发

需要 Node.js 24（可执行 `nvm use`）。

```sh
npm ci
npm run dev
```

前端 http://localhost:3000，后端 http://127.0.0.1:3001。默认配置无需环境文件；需要修改时参考前后端 .env.example。开发与本地预览时，Vite 将同源 `/api` 请求转发到后端。

```sh
npm run check
npm run build
# 本地预览构建结果，需要另行启动后端
npm run start:backend
npm run preview
```

`npm run dev:frontend`、`npm run dev:backend` 可单独启动服务。`npm start` 是本地预览的兼容入口，不用于生产部署。

生产环境托管 `frontend/dist` 静态资源，并单独运行 Node.js 后端；由 Web 服务器将 `/api` 请求转发至后端，将应用页面路径回退到 `index.html`。配置示例见 [frontend/README.md](frontend/README.md)。

## 当前范围

已实现五个页面入口、响应式导航、错误/加载/404 边界、API 健康检查、配置校验、进程退出处理、类型检查和基础服务测试。题库、温习、导入、统计页面明确标识为待接入；未复制原型模拟记录。

尚未实现用户与微信登录、数据库持久化、温习算法、业务 API、AI 调用、支付和上线配置。本工程是生产开发起点，不代表已经可上线运营。

结构见 [docs/project-structure.md](docs/project-structure.md)，接口见 [docs/contracts.md](docs/contracts.md)，协作约定见 [AGENTS.md](AGENTS.md)。
