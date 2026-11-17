import { createServer } from 'node:http';
import { createHandler } from './api/handler.ts';
import { readConfig } from './config.ts';

const { host, port } = readConfig();
const { handler, close } = createHandler();
const server = createServer({ requestTimeout: 30_000, headersTimeout: 15_000 }, handler);
server.on('error', (error) => { console.error('API server failed:', error.message); process.exitCode = 1; });
server.listen(port, host, () => console.log(`API listening at http://${host}:${port}`));
// Ctrl+C（SIGINT）或进程管理器停止（SIGTERM）时先停止接新请求，等现有请求结束后关闭数据库连接。
// 10 秒内没停完就断开剩余连接并退出。unref 避免这个定时器单独把进程留住。
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    server.close(() => {
      void close().finally(() => process.exit(0));
    });
    setTimeout(() => { server.closeAllConnections(); process.exit(1); }, 10_000).unref();
  });
}
