import { randomUUID } from 'node:crypto';
import type { RequestListener } from 'node:http';

export const handler: RequestListener = (req, res) => {
  const requestId = randomUUID();
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Request-Id', requestId);
  const path = req.url?.split('?')[0];
  if (path === '/api/health') {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.statusCode = 405;
      res.setHeader('Allow', 'GET, HEAD');
      res.end(JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED', message: '请求方法不支持' }, requestId }));
      return;
    }
    res.end(req.method === 'HEAD' ? undefined : JSON.stringify({ status: 'ok', service: 'wenxi-api' }));
    return;
  }
  res.statusCode = 404;
  res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: '接口不存在' }, requestId }));
};
