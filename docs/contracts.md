# HTTP 契约

唯一已实现接口：GET /api/health（无需鉴权），200 返回 `{"status":"ok","service":"wenxi-api"}`；支持 HEAD，无响应体。这是进程存活检查，不代表数据库或外部服务可用。

其他方法返回 405 并附带 Allow: GET, HEAD；未知路径返回 404。错误格式：`{"error":{"code":"NOT_FOUND","message":"接口不存在"},"requestId":"服务端生成的 UUID"}`。每个响应包含 X-Request-Id 和 Cache-Control: no-store。

登录（含微信）、题目 CRUD、复习评分与调度、导入、统计、AI 均未实现。实现前确定认证、输入校验、数据归属和持久化契约；原型的本地数据结构不是已承诺的生产接口。
