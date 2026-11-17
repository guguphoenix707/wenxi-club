# HTTP 契约

通用约定：未知路径返回 404。应用 JSON（含 `/api/auth` 的 JSON 响应，不含重定向）统一为 `{ "code": number, "data": ..., "err": { "msg": "..." } }`。`code` 为 0 表示成功，`data` 是调用方要消费的数据，`err.msg` 为空字符串。`code` 非 0 表示业务不成功，`data` 为 null，`err.msg` 是展示文案。文案由服务端维护，客户端不按 `code` 另备文案表。`err.stack` 的类型尚未规定。同一次请求的标识只放在响应头 `X-Request-Id`，不写入 JSON。由本服务直接返回的 JSON 响应包含 `X-Request-Id` 和 `Cache-Control: no-store`。`/api/health` 仍是进程存活检查，不使用这套 JSON。微信回调等重定向保持原状态码，不包进这套 JSON。

## 业务 JSON

题目 CRUD、复习评分与调度、导入、统计、AI 尚未实现。登录 JSON 与这些接口使用同一套 `code` / `data` / `err`。

- 0：成功
- 10000：正常业务校验失败
- 40000–49999：鉴权失败。40001 表示 token 失效；40009 表示请求过于频繁；40100 表示暂未开通或暂无权限
- 50000–59999：服务端错误
  - 500100：AI 额度不够

## 超时

普通业务请求，后端默认 10 秒，前端默认 20 秒。上传尚未涉及：后端默认 30 秒，前端暂不设限。

## GET /api/health

无需鉴权。200 返回 `{"status":"ok","service":"wenxi-api"}`；支持 HEAD，无响应体。其他方法返回 405 并附带 `Allow: GET, HEAD`。这是进程存活检查，不代表数据库或登录可用。

## /api/auth/*

鉴权由 Better Auth 1.7.14 提供，挂载在 `/api/auth`。浏览器只请求同源路径；开发环境由 Vite 把 `/api` 代理到后端。

核心配置为 `DATABASE_URL`、`BETTER_AUTH_SECRET`、`BETTER_AUTH_URL`。缺任何一项，或密钥短于 32 字符、URL 无效时，进程仍可启动；此时任意 `/api/auth/*` 返回 503：

`{"code":40100,"data":null,"err":{"msg":"登录服务未配置"}}`

`WECHAT_APP_ID` 与 `WECHAT_APP_SECRET` 成对可选。只配其中一个时视为未启用微信。邮箱密码登录不依赖微信凭据。

`BETTER_AUTH_URL` 必须是浏览器源。本地为 `http://localhost:3000`。禁用用户（`users.status=disabled`）不能创建新会话。

### GET /api/auth/login-methods

无需会话。200 返回：

`{"code":0,"data":{"emailPassword":true,"wechat":false},"err":{"msg":""}}`

`wechat` 为 true 当且仅当微信凭据成对配置。

### 邮箱注册

发码不创建 `users`。同一邮箱 60 秒内重复发码仍返回成功，但不重复发信。已验证邮箱同样返回成功且不发信。验证码 6 位数字，5 分钟过期，最多 3 次校验。当前发信实现写日志；上线再接腾讯云 SES。

- `POST /api/auth/email-otp/send-verification-otp`，JSON `{"email":"...","type":"email-verification"}`。只接受 `email-verification`。成功时 `code` 为 0，`data` 为 `{"success":true}`。
- `POST /api/auth/email/register`，JSON `{"email":"...","password":"...","otp":"..."}`。校验验证码后创建已验证用户（昵称为邮箱 `@` 前一段）、凭证账户和会话 cookie。密码 8–128 位。

已注册邮箱返回 `code` 10000，文案为「该邮箱已注册，请切换到密码登录。」。验证码错误或过期同样是 10000，文案为「验证码不正确或已过期」。请求过于频繁返回 40009，文案为「请求过于频繁」。

默认 `POST /api/auth/sign-up/email` 关闭，避免绕过验证码建号。不提供验证码登录、找回密码。

### 邮箱登录

- `POST /api/auth/sign-in/email`，JSON `{"email":"...","password":"..."}`。未验证邮箱不能建会话。邮箱或密码不正确时 `code` 为 10000。

### 会话

- `GET /api/auth/get-session`：读取当前会话。无会话时 `code` 为 0，`data` 为 null。

### 微信（可选）

配置了微信凭据后：

- `POST /api/auth/sign-in/social`，`provider=wechat`，`disableRedirect=true`：写入 OAuth state，返回微信 `qrconnect` 授权 URL。前端只使用该 URL 的 `appid`、`redirect_uri`、`state`、`scope` 嵌入官方 `WxLogin`。
- `GET /api/auth/callback/wechat`：用微信 `code` 换令牌和资料，创建或匹配 `users` / `auth_accounts`，写入 `auth_sessions`，设置会话 cookie，再跳到 `callbackURL`（登录页使用 `/`）。

微信不返回邮箱。该版本会写入未验证占位邮箱 `{unionid 或 openid}@wechat.placeholder.invalid`，`email_verified=false`。登录页不展示该占位邮箱。回调为 `http://localhost:3000/api/auth/callback/wechat`。微信开放平台授权回调域通常不接受 `localhost`，没有已登记域名时不能完成真实扫码。

原型的本地数据结构不是已承诺的生产接口。
