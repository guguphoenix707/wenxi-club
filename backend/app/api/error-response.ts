import type { ServerResponse } from 'node:http';
import { userFacingMessage } from './error-messages.ts';

type ErrorFields = {
  code: string;
  message: string;
};

function asRecord(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function readFields(value: unknown, status: number): ErrorFields | null {
  const record = asRecord(value);
  if (!record) return status === 429 ? { code: 'TOO_MANY_REQUESTS', message: '' } : null;
  const nested = asRecord(record.error);
  const source = nested ?? record;
  const code = typeof source.code === 'string'
    ? source.code
    : status === 429 ? 'TOO_MANY_REQUESTS' : '';
  const message = typeof source.message === 'string' ? source.message : '';
  if (!code) return null;
  return { code, message };
}

export function normalizeErrorJson(status: number, raw: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  const fields = readFields(parsed, status);
  if (!fields) return null;
  const message = userFacingMessage(fields.code) ?? fields.message;
  if (!message.trim()) return null;
  const next = JSON.stringify({ error: { code: fields.code, message } });
  return next === raw ? null : next;
}

function asBuffer(chunk: unknown) {
  if (typeof chunk === 'string') return Buffer.from(chunk);
  if (Buffer.isBuffer(chunk)) return chunk;
  if (chunk instanceof Uint8Array) return Buffer.from(chunk);
  return Buffer.from(String(chunk));
}

function asCallback(value: unknown) {
  return typeof value === 'function' ? value as () => void : undefined;
}

export function installErrorBodyRewrite(res: ServerResponse) {
  const chunks: Buffer[] = [];
  const writeHead = res.writeHead.bind(res);
  const end = res.end.bind(res);

  // writeHead 的重载无法用一个函数字面量实现，这里只在发出响应头前去掉原 Content-Length。
  res.writeHead = ((...args: Parameters<ServerResponse['writeHead']>) => {
    res.removeHeader('content-length');
    return writeHead(...args);
  }) as typeof res.writeHead;

  res.write = ((chunk: unknown, encoding?: unknown, callback?: unknown) => {
    if (chunk !== undefined && chunk !== null && typeof chunk !== 'function') chunks.push(asBuffer(chunk));
    const done = typeof encoding === 'function' ? encoding : callback;
    asCallback(done)?.();
    return true;
  }) as typeof res.write;

  res.end = ((chunk?: unknown, encoding?: unknown, callback?: unknown) => {
    const done = asCallback(chunk) ?? asCallback(encoding) ?? asCallback(callback);
    const replacement = chunk !== undefined && typeof chunk !== 'function';
    if (!res.headersSent && replacement) chunks.length = 0;
    if (replacement) chunks.push(asBuffer(chunk));
    const raw = Buffer.concat(chunks);
    const rewritten = res.statusCode >= 400 ? normalizeErrorJson(res.statusCode, raw.toString('utf8')) : null;
    return end(rewritten === null ? raw : Buffer.from(rewritten), done);
  }) as typeof res.end;
}
