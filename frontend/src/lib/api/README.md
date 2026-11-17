# 目录职责

浏览器通过同源 `/api` 访问后端。`client.ts` 的 `requestJson` 是唯一的响应入口：`code` 为 0 时返回 `data`，否则 reject `ApiError`，`message` 即后端的 `err.msg`。读不到 `msg` 时用常量兜底句，`code` 原样附上。超时 reject `TimeoutError`，其他网络失败 reject `NetworkError`。提示文案在 `src/constants/error-messages.ts`。`auth.ts` 只取出各接口要消费的数据。
