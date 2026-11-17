export type ApiError = {
  code: string;
  message: string;
};

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

export class ApiContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

const REQUEST_TIMEOUT_MS = 20_000;

type Envelope = {
  code: number;
  data: unknown;
  err: { msg: string };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readEnvelope(value: unknown): Envelope | null {
  if (!isRecord(value) || typeof value.code !== 'number' || !('data' in value) || !isRecord(value.err)) return null;
  if (typeof value.err.msg !== 'string') return null;
  return { code: value.code, data: value.data, err: { msg: value.err.msg } };
}

async function readBody(response: Response) {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiContractError('服务响应无法识别');
  }
}

export async function requestJson(input: RequestInfo | URL, init?: RequestInit): Promise<ApiResult<unknown>> {
  let response: Response;
  try {
    response = await fetch(input, {
      ...init,
      signal: init?.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') throw new ApiContractError('请求超时');
    throw new ApiContractError('网络请求失败');
  }
  const body = await readBody(response);
  if (response.ok) return { ok: true, data: body };
  const error = readApiError(body);
  if (!error) throw new ApiContractError('服务响应无法识别');
  return { ok: false, error };
}
