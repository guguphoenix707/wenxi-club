# 目录职责

浏览器通过同源 `/api` 访问后端。`client.ts` 的 `requestJson` 是唯一的响应入口：`code` 为 0 时返回 `data`，否则 reject `ApiError`，`message` 即后端的 `err.msg`。网络失败和超时也 reject 成这一种错误。`auth.ts` 只取出各接口要消费的数据。
