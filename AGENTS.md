# 项目开发约定

- 先读 README.md、docs/project-structure.md 和目标目录的 design/rule.md。
- 原型在 /Users/xin/Documents/wenxi-house，仅作为产品与视觉参考；生产代码在本仓库。
- 不使用 Ant Design，不复制原型的模拟数据或 localStorage 作为正式数据层。
- TypeScript strict；保持高内聚、低耦合，按需求新增抽象和依赖。
- 前端不得导入后端内部代码或读取私密凭证；权限与归属在服务端校验。
- 不覆盖用户改动，不擅自提交、推送或发布。
- 接口变更同步 docs/contracts.md；数据库变更提供迁移；AI 变更补充评估。
- 完成后运行 npm run check 和 npm run build，如实说明未完成能力和验证限制。
