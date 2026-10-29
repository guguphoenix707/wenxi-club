# 前端

React 19 + TypeScript + Vite + React Router SPA。`src/main.tsx` 是浏览器入口，`src/router.tsx` 集中配置路由，`src/pages` 是路由页面，`src/components` 是通用展示组件，`src/features` 是业务模块，`src/lib/api` 是接口边界。CSS 使用全局变量和按需 CSS Modules。

## 路由

| URL | 页面文件（相对 src/pages） |
| --- | --- |
| `/` | `dashboard.tsx` |
| `/questions/new` | `questions/new.tsx` |
| `/review` | `review.tsx` |
| `/import` | `import.tsx` |
| `/stats` | `stats.tsx` |
| 其他路径 | `not-found.tsx` |

页面通过 React.lazy 按需加载；共享布局提供导航、加载状态和滚动恢复，React Router 提供错误边界。

## 本地运行

根目录 `npm run dev:frontend`；前端默认 3000 端口。复制 `.env.example` 为 `.env.local` 可配置 `API_ORIGIN`（默认 `http://127.0.0.1:3001`）。开发与本地预览时，Vite 将同源 `/api` 请求转发至后端。`API_ORIGIN` 只供 Vite 进程使用，不注入浏览器；修改后重启开发或预览进程即可。

`npm run build -w frontend` 生成 `frontend/dist`；根目录 `npm run preview`（或兼容命令 `npm start`）仅用于本地预览，需要另行启动后端。Vite 预览服务器不作为生产服务器。

## 生产部署

托管 `dist` 静态资源，由 Web 服务器代理 `/api`，其他应用路径回退到 `index.html`，以支持直接访问或刷新 `/questions/new` 等路径。Vite 的代理配置不会随静态文件部署，生产环境不读取前端的 `API_ORIGIN`。

Nginx 示例（替换站点目录及后端地址）：

```nginx
server {
    listen 80;
    root /srv/wenxi-club/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /assets/ {
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

产品介绍页以后独立生成静态 HTML 并部署到公开地址，不与应用路由耦合。
