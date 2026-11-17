import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createAuthRuntime } from '../auth/create-auth.ts';
import { hasWeChatAuth, readAuthConfig } from '../config.ts';
import { installErrorBodyRewrite } from './error-response.ts';
import { errorEnvelope, successEnvelope } from './error-messages.ts';

function sendJson(
  res: ServerResponse,
  status: number,
  body: unknown,
  requestId: string,
  extra?: Record<string, string>,
) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Request-Id', requestId);
  if (extra) {
    for (const [name, value] of Object.entries(extra)) res.setHeader(name, value);
  }
  res.end(JSON.stringify(body));
}

function requestPath(req: IncomingMessage) {
  return req.url?.split('?')[0] ?? '';
}

export function createHandler(env: NodeJS.ProcessEnv = process.env) {
  const authConfig = readAuthConfig(env);
  let authRuntime: ReturnType<typeof createAuthRuntime> | null = null;

  const handler = (req: IncomingMessage, res: ServerResponse) => {
    const requestId = randomUUID();
    const path = requestPath(req);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Request-Id', requestId);

    if (path === '/api/auth' || path.startsWith('/api/auth/')) {
      if (!authConfig) {
        sendJson(res, 503, errorEnvelope('AUTH_NOT_CONFIGURED'), requestId);
        return;
      }
      if (path === '/api/auth/login-methods') {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          sendJson(res, 405, errorEnvelope('METHOD_NOT_ALLOWED'), requestId, { Allow: 'GET, HEAD' });
          return;
        }
        const methods = { emailPassword: true, wechat: hasWeChatAuth(authConfig) };
        if (req.method === 'HEAD') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end();
          return;
        }
        sendJson(res, 200, successEnvelope(methods), requestId);
        return;
      }
      if (!authRuntime) authRuntime = createAuthRuntime(authConfig);
      installErrorBodyRewrite(res);
      void Promise.resolve(authRuntime.handler(req, res)).catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'unknown';
        console.error('Auth request failed:', requestId, message);
        if (!res.headersSent) {
          sendJson(res, 500, errorEnvelope('AUTH_FAILED'), requestId);
        }
      });
      return;
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (path === '/api/health') {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        sendJson(res, 405, errorEnvelope('METHOD_NOT_ALLOWED'), requestId, { Allow: 'GET, HEAD' });
        return;
      }
      res.end(req.method === 'HEAD' ? undefined : JSON.stringify({ status: 'ok', service: 'wenxi-api' }));
      return;
    }
    sendJson(res, 404, errorEnvelope('NOT_FOUND'), requestId);
  };

  return {
    handler,
    close: () => authRuntime?.close() ?? Promise.resolve(),
  };
}
