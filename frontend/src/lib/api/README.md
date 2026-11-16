# 目录职责

浏览器通过同源 `/api` 访问后端。`client.ts` 的 `requestJson` 是唯一的响应处理入口：成功返回要消费的数据，失败返回 `{ code, message }`。`message` 直接展示。响应无法识别、超时或网络失败时才抛出。登录接口放在 `auth.ts`，不再按错误码翻译文案。
