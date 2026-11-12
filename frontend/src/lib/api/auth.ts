import { createAuthClient } from 'better-auth/client';
import { emailOTPClient } from 'better-auth/client/plugins';

export class AuthNotConfiguredError extends Error {
  constructor() {
    super('登录服务未配置');
    this.name = 'AuthNotConfiguredError';
  }
}

export type LoginMethods = {
  emailPassword: boolean;
  wechat: boolean;
};

type AuthErrorShape = {
  status?: number;
  statusCode?: number;
  code?: string;
  message?: string;
  error?: { code?: string; message?: string };
};

function asErrorShape(error: unknown): AuthErrorShape | null {
  if (!error || typeof error !== 'object') return null;
  return error as AuthErrorShape;
}

function errorCode(error: unknown) {
  const shape = asErrorShape(error);
  return shape?.error?.code ?? shape?.code;
}

function errorMessage(error: unknown) {
  const shape = asErrorShape(error);
  return shape?.error?.message ?? shape?.message;
}

function isUnconfiguredError(error: unknown) {
  if (error instanceof AuthNotConfiguredError) return true;
  const shape = asErrorShape(error);
  if (!shape) return false;
  return shape.status === 503
    || shape.statusCode === 503
    || errorCode(error) === 'AUTH_NOT_CONFIGURED';
}

async function assertConfigured(response: Response) {
  if (response.status !== 503) return;
  const body = await response.clone().json().catch(() => null);
  const code = body && typeof body === 'object' && 'error' in body
    ? (body as { error?: { code?: string } }).error?.code
    : undefined;
  if (code === 'AUTH_NOT_CONFIGURED') throw new AuthNotConfiguredError();
  throw new Error('登录服务暂时不可用');
}

export function mapAuthMessage(error: unknown, fallback: string) {
  const code = errorCode(error);
  const message = errorMessage(error);
  if (code === 'INVALID_EMAIL_OR_PASSWORD') return '邮箱或密码不正确，请重试；新用户请先注册。';
  if (code === 'USER_ALREADY_EXISTS' || code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
    return '该邮箱已注册，请切换到密码登录。';
  }
  if (code === 'INVALID_OTP' || code === 'OTP_EXPIRED') return '验证码不正确或已过期';
  if (code === 'TOO_MANY_ATTEMPTS') return '验证码尝试次数过多，请重新获取';
  if (code === 'EMAIL_NOT_VERIFIED') return '请先完成邮箱验证后再登录。';
  if (code === 'PASSWORD_TOO_SHORT' || code === 'INVALID_PASSWORD') return '密码至少 8 位';
  if (code === 'INVALID_EMAIL') return '请输入有效邮箱';
  if (typeof message === 'string' && message.trim()) return message;
  return fallback;
}

export const authClient = createAuthClient({
  basePath: '/api/auth',
  plugins: [emailOTPClient()],
  fetchOptions: {
    retry: 0,
    timeout: 10_000,
  },
});

export async function getBrowserSession() {
  const response = await fetch('/api/auth/get-session', { credentials: 'include' });
  await assertConfigured(response);
  if (!response.ok) throw new Error('无法读取登录状态');
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text) as { user?: unknown } | null;
}

export async function getLoginMethods(): Promise<LoginMethods> {
  const response = await fetch('/api/auth/login-methods', { credentials: 'include' });
  await assertConfigured(response);
  if (!response.ok) throw new Error('无法读取登录方式');
  return await response.json() as LoginMethods;
}

export async function sendEmailOtp(email: string) {
  const { error } = await authClient.emailOtp.sendVerificationOtp({
    email,
    type: 'email-verification',
  });
  if (error) {
    if (isUnconfiguredError(error)) throw new AuthNotConfiguredError();
    throw new Error(mapAuthMessage(error, '验证码发送失败，请稍后重试'));
  }
}

export async function registerWithEmail(input: { email: string; password: string; otp: string }) {
  const response = await fetch('/api/auth/email/register', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  await assertConfigured(response);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(mapAuthMessage(body, '注册失败，请稍后重试'));
  }
}

export async function signInWithEmail(input: { email: string; password: string }) {
  const { error } = await authClient.signIn.email({
    email: input.email,
    password: input.password,
    rememberMe: true,
  });
  if (error) {
    if (isUnconfiguredError(error)) throw new AuthNotConfiguredError();
    throw new Error(mapAuthMessage(error, '邮箱或密码不正确，请重试；新用户请先注册。'));
  }
}

export async function startWeChatSignIn() {
  const { data, error } = await authClient.signIn.social({
    provider: 'wechat',
    callbackURL: '/',
    errorCallbackURL: '/login',
    disableRedirect: true,
  });
  if (error) {
    if (isUnconfiguredError(error)) throw new AuthNotConfiguredError();
    throw new Error('无法开始微信登录');
  }
  if (!data?.url) throw new Error('未返回授权地址');
  return data.url;
}
