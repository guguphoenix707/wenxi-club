# 后端

Node.js 24 + TypeScript，使用 node:http 初始化服务。dev 使用 Node 原生类型擦除，build 使用 tsc 输出 dist，生产启动运行编译后的 JS。

根目录 npm run dev:backend；默认绑定 127.0.0.1:3001。可复制 .env.example 为 .env 配置。容器运行时设置 HOST=0.0.0.0。现阶段仅实现健康检查，不含认证、业务接口或数据库。
