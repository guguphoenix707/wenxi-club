# HTTP 契约

通用约定：未知路径返回 404。错误格式：`{"error":{"code":"...","message":"..."}}`。同一次请求的标识只放在响应头 `X-Request-Id`，不写入 JSON。由本服务直接返回的 JSON 响应包含 `X-Request-Id` 和 `Cache-Control: no-store`。Better Auth 处理的 `/api/auth/*` 成功响应遵循该库的 cookie、重定向和 JSON 形状。

## GET /api/health

无需鉴权。200 返回 `{"status":"ok","service":"wenxi-api"}`；支持 HEAD，无响应体。其他方法返回 405 并附带 `Allow: GET, HEAD`。这是进程存活检查，不代表数据库或微信登录可用。

## /api/auth/*

微信网站登录由 Better Auth 1.7.14 提供，挂载在 `/api/auth`。浏览器只请求同源路径；开发环境由 Vite 把 `/api` 代理到后端。

配置项为 `DATABASE_URL`、`BETTER_AUTH_SECRET`、`BETTER_AUTH_URL`、`WECHAT_APP_ID`、`WECHAT_APP_SECRET`。缺任何一项，或密钥短于 32 字符、URL 无效时，进程仍可启动；此时任意 `/api/auth/*` 返回 503：

`{"error":{"code":"AUTH_NOT_CONFIGURED","message":"登录服务未配置"}}`

配置齐全后：

- `POST /api/auth/sign-in/social`，`provider=wechat`，`disableRedirect=true`：写入 OAuth state，返回微信 `qrconnect` 授权 URL。前端只使用该 URL 的 `appid`、`redirect_uri`、`state`、`scope` 嵌入官方 `WxLogin`。
- `GET /api/auth/callback/wechat`：用微信 `code` 换令牌和资料，创建或匹配 `users` / `auth_accounts`，写入 `auth_sessions`，设置会话 cookie，再跳到 `callbackURL`（登录页使用 `/`）。
- `GET /api/auth/get-session`：读取当前会话。

微信不返回邮箱。该版本会写入未验证占位邮箱 `{unionid 或 openid}@wechat.placeholder.invalid`，`email_verified=false`。登录页不展示邮箱。禁用用户（`users.status=disabled`）不能创建新会话。

`BETTER_AUTH_URL` 必须是浏览器源。本地为 `http://localhost:3000`，回调为 `http://localhost:3000/api/auth/callback/wechat`。微信开放平台授权回调域通常不接受 `localhost`，没有已登记域名时不能完成真实扫码。

题目 CRUD、复习评分与调度、导入、统计、AI 尚未实现。原型的本地数据结构不是已承诺的生产接口。
