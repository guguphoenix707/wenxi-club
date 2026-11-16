import { PASSWORD_MIN_LENGTH } from '../auth/email.ts';

export const ERROR_MESSAGES = {
  AUTH_NOT_CONFIGURED: '登录服务未配置',
  AUTH_FAILED: '登录服务暂时不可用',
  METHOD_NOT_ALLOWED: '请求方法不支持',
  NOT_FOUND: '接口不存在',
  INVALID_EMAIL: '请输入有效邮箱',
  INVALID_EMAIL_OR_PASSWORD: '邮箱或密码不正确，请重试；新用户请先注册。',
  INVALID_OTP: '验证码不正确或已过期',
  INVALID_OTP_TYPE: '不支持该验证码类型',
  OTP_EXPIRED: '验证码不正确或已过期',
  TOO_MANY_ATTEMPTS: '验证码尝试次数过多，请重新获取',
  TOO_MANY_REQUESTS: '请求过于频繁，请稍后再试',
  EMAIL_NOT_VERIFIED: '请先完成邮箱验证后再登录。',
  PASSWORD_TOO_SHORT: `密码至少 ${PASSWORD_MIN_LENGTH} 位`,
  PASSWORD_TOO_LONG: '密码过长',
  INVALID_PASSWORD: `密码至少 ${PASSWORD_MIN_LENGTH} 位`,
  USER_ALREADY_EXISTS: '该邮箱已注册，请切换到密码登录。',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: '该邮箱已注册，请切换到密码登录。',
  FAILED_TO_CREATE_USER: '无法创建账号',
  FAILED_TO_CREATE_SESSION: '无法创建登录状态',
  VALIDATION_ERROR: '请求参数不正确',
} as const;

export type ErrorCode = keyof typeof ERROR_MESSAGES;

export function userFacingMessage(code: string) {
  if (code in ERROR_MESSAGES) return ERROR_MESSAGES[code as ErrorCode];
  return undefined;
}

export function errorEnvelope(code: ErrorCode) {
  return { error: { code, message: ERROR_MESSAGES[code] } };
}
