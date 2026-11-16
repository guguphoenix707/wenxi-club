import { ApiContractError, requestJson, type ApiResult } from './client';

export type LoginMethods = {
  emailPassword: boolean;
  wechat: boolean;
};

export type BrowserSession = {
  user?: unknown;
} | null;

function isLoginMethods(value: unknown): value is LoginMethods {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record.emailPassword === 'boolean' && typeof record.wechat === 'boolean';
}

function isBrowserSession(value: unknown): value is BrowserSession {
  return value === null || (typeof value === 'object' && !Array.isArray(value));
}

function authorizationUrl(value: unknown) {
  if (!value || typeof value !== 'object') return null;
  const url = (value as { url?: unknown }).url;
  return typeof url === 'string' && url ? url : null;
}

async function requestAuth(input: RequestInfo | URL, init?: RequestInit) {
  return requestJson(input, { credentials: 'include', ...init });
}

export async function getBrowserSession(): Promise<ApiResult<BrowserSession>> {
  const result = await requestAuth('/api/auth/get-session');
  if (!result.ok) return result;
  if (!isBrowserSession(result.data)) throw new ApiContractError('服务响应无法识别');
  return { ok: true, data: result.data };
}

export async function getLoginMethods(): Promise<ApiResult<LoginMethods>> {
  const result = await requestAuth('/api/auth/login-methods');
  if (!result.ok) return result;
  if (!isLoginMethods(result.data)) throw new ApiContractError('服务响应无法识别');
  return { ok: true, data: result.data };
}

export async function sendEmailOtp(email: string) {
  return requestAuth('/api/auth/email-otp/send-verification-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, type: 'email-verification' }),
  });
}

export async function registerWithEmail(input: { email: string; password: string; otp: string }) {
  return requestAuth('/api/auth/email/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function signInWithEmail(input: { email: string; password: string }) {
  return requestAuth('/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, rememberMe: true }),
  });
}

export async function startWeChatSignIn(): Promise<ApiResult<string>> {
  const result = await requestAuth('/api/auth/sign-in/social', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'wechat',
      callbackURL: '/',
      errorCallbackURL: '/login',
      disableRedirect: true,
    }),
  });
  if (!result.ok) return result;
  const url = authorizationUrl(result.data);
  if (!url) throw new ApiContractError('服务响应无法识别');
  return { ok: true, data: url };
3}
