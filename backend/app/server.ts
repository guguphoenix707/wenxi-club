import { createServer } from 'node:http';
import { handler } from './api/handler.ts';
import { readConfig } from './config.ts';
const { host, port } = readConfig();
const server = createServer({ requestTimeout: 30_000, headersTimeout: 15_000 }, handler);
server.on('error', (error) => { console.error('API server failed:', error.message); process.exitCode = 1; });
server.listen(port, host, () => console.log(`API listening at http://${host}:${port}`));
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => { server.closeAllConnections(); process.exit(1); }, 10_000).unref();
  });
}
