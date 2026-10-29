# 结构与边界

- frontend/index.html：SPA 的 HTML 入口与基础元信息。
- frontend/src/main.tsx：React 挂载入口。
- frontend/src/router.tsx：React Router 的集中路由映射与错误边界。
- frontend/src/pages：今日总览、温习、添加题目、导入、统计页面，以及错误、404 页面。
- frontend/src/components：导航与展示组件。
- frontend/src/styles：全局设计变量与基础样式。
- frontend/src/features：业务模块，按实际功能逐步实现。
- frontend/src/lib/api：前端 HTTP 边界。
- backend/app/api：HTTP 路由与响应。
- backend/app/service：业务编排。
- backend/app/repository：数据库访问。
- backend/app/contracts：接口结构与校验。
- backend/app/ai：内部模型能力。
- backend/tests：服务测试。
- db：迁移与种子数据。
- eval：AI 评估。
- scripts：本地开发进程管理。

采用 npm workspaces，根目录维护唯一 package-lock.json。应用使用 Vite + React Router SPA，不依赖 Next.js、vinext、Sites 托管元数据或 Cloudflare 构建插件。产品介绍页以后独立在构建时生成静态 HTML。前后端通过 HTTP 隔离，不为占位模块引入 shared 包、ORM 或模型 SDK。

开发与本地预览由 Vite 代理 `/api`；生产环境托管 frontend/dist，由 Web 服务器代理 API 并配置页面路径回退，独立运行 Node.js 后端。

根 src/index.ts 是初始化前的 IDE 示例，保留但不参与当前构建，可在确认后删除。
