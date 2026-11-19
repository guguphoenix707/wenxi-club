import { FALLBACK_MESSAGE, NETWORK_MESSAGE, TIMEOUT_MESSAGE } from '@/constants/error-messages';

export class ApiError extends Error {
  readonly code: unknown;

  constructor(message: string, code: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

export class TimeoutError extends Error {
  constructor(message = TIMEOUT_MESSAGE) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class NetworkError extends Error {
  constructor(message = NETWORK_MESSAGE) {
    super(message);
    this.name = 'NetworkError';
  }
}

const REQUEST_TIMEOUT_MS = 20_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readMessage(value: unknown) {
  if (!isRecord(value) || !isRecord(value.err) || typeof value.err.msg !== 'string') {
    return FALLBACK_MESSAGE;
  }
  const message = value.err.msg.trim();
  return message || FALLBACK_MESSAGE;
}

async function readBody(response: Response) {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function isTimeout(error: unknown) {
  return error instanceof Error && error.name === 'TimeoutError';
}

export async function requestJson(input: RequestInfo | URL, init?: RequestInit): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(input, {
      ...init,
      signal: init?.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (isTimeout(error)) throw new TimeoutError();
    throw new NetworkError();
  }

  const body = await readBody(response);
  const code = isRecord(body) && 'code' in body ? body.code : null;
  if (code === 0) return isRecord(body) ? body.data : null;
  throw new ApiError(readMessage(body), code);
}
