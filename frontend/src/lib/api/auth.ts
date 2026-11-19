import { FALLBACK_MESSAGE } from '@/constants/error-messages';
import { ApiError, requestJson } from './client';

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

function requestAuth(input: RequestInfo | URL, init?: RequestInit) {
  return requestJson(input, { credentials: 'include', ...init });
}

export async function getBrowserSession(): Promise<BrowserSession> {
  const data = await requestAuth('/api/auth/get-session');
  if (!isBrowserSession(data)) throw new ApiError(FALLBACK_MESSAGE);
  return data;
}

export async function getLoginMethods(): Promise<LoginMethods> {
  const data = await requestAuth('/api/auth/login-methods');
  if (!isLoginMethods(data)) throw new ApiError(FALLBACK_MESSAGE);
  return data;
}

export async function sendEmailOtp(email: string) {
  await requestAuth('/api/auth/email-otp/send-verification-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, type: 'email-verification' }),
  });
}

export async function registerWithEmail(input: { email: string; password: string; otp: string }) {
  await requestAuth('/api/auth/email/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function signInWithEmail(input: { email: string; password: string }) {
  await requestAuth('/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, rememberMe: true }),
  });
}

export async function startWeChatSignIn() {
  const data = await requestAuth('/api/auth/sign-in/social', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'wechat',
      callbackURL: '/',
      errorCallbackURL: '/login',
      disableRedirect: true,
    }),
  });
  const url = authorizationUrl(data);
  if (!url) throw new ApiError(FALLBACK_MESSAGE);
  return url;
}
