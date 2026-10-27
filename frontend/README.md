# 前端

React 19 + 标准 Next.js App Router。src/app 是路由，src/components 是通用展示组件，src/features 是业务模块，src/lib/api 是接口边界。CSS 使用全局变量和按需 CSS Modules。

根目录 npm run dev:frontend；前端默认 3000 端口。复制 .env.example 为 .env.local 可配置服务端 API_ORIGIN。/api 请求由 Next.js 转发至后端，不向浏览器暴露内部地址。API_ORIGIN 在构建时解析，变更部署地址后需重新构建。
