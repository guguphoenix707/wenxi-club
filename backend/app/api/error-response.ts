import type { ServerResponse } from 'node:http';
import { API_CODE, failureOf } from './error-messages.ts';

function asRecord(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function isBusinessEnvelope(value: unknown) {
  const record = asRecord(value);
  if (!record || typeof record.code !== 'number' || !('data' in record)) return false;
  const err = asRecord(record.err);
  return Boolean(err && typeof err.msg === 'string');
}

function failureBody(value: unknown, status: number) {
  const record = asRecord(value);
  const nested = record ? asRecord(record.error) : null;
  const source = nested ?? record;
  const stringCode = source && typeof source.code === 'string'
    ? source.code
    : status === 429 ? 'TOO_MANY_REQUESTS' : '';
  const message = source && typeof source.message === 'string' ? source.message : '';
  const known = stringCode ? failureOf(stringCode) : undefined;
  if (known) return { code: known.code, data: null, err: { msg: known.msg } };
  if (!message.trim()) return null;
  return { code: API_CODE.SERVER, data: null, err: { msg: message } };
}

export function normalizeApiJson(status: number, raw: string) {
  if (status >= 300 && status < 400) return null;
  if (!raw.trim()) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (isBusinessEnvelope(parsed)) return null;
  const next = status >= 400
    ? failureBody(parsed, status)
    : { code: API_CODE.OK, data: parsed, err: { msg: '' } };
  if (!next) return null;
  const encoded = JSON.stringify(next);
  return encoded === raw ? null : encoded;
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
    const rewritten = normalizeApiJson(res.statusCode, raw.toString('utf8'));
    return end(rewritten === null ? raw : Buffer.from(rewritten), done);
  }) as typeof res.end;
}
