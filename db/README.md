# 目录职责

PostgreSQL 16。`migrations/` 放版本化 SQL，`seeds/` 放脱敏开发数据。不在应用启动时改表。

本地库：

```sh
npm run db:up
```

复制 `backend/.env.example` 为 `backend/.env` 后执行迁移：

```sh
npm run db:migrate
```

脚本按文件名顺序执行 `db/migrations/*.sql`，并在 `schema_migrations` 记录已执行版本。当前只有 Better Auth 四张表：`users`、`auth_sessions`、`auth_accounts`、`auth_verifications`。业务表尚未建立。
