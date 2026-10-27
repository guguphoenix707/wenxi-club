# 结构与边界

- frontend/src/app：今日总览、温习、添加题目、导入、统计路由，以及加载、错误、404 边界。
- frontend/src/components：导航与展示组件。
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

采用 npm workspaces，根目录维护唯一 package-lock.json。沿用原型分层，但使用标准 Next.js 运行，不依赖 vinext、Sites 托管元数据或 Cloudflare 构建插件。前后端通过 HTTP 隔离，不为占位模块引入 shared 包、ORM 或模型 SDK。

根 src/index.ts 是初始化前的 IDE 示例，保留但不参与当前构建，可在确认后删除。
