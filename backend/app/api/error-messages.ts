import { PASSWORD_MIN_LENGTH } from '../auth/email.ts';

export const API_CODE = {
  OK: 0,
  VALIDATION: 10000,
  TOKEN_EXPIRED: 40001,
  RATE_LIMIT: 40009,
  NOT_OPEN: 40100,
  SERVER: 50000,
} as const;

const FAILURES = {
  AUTH_NOT_CONFIGURED: { code: API_CODE.NOT_OPEN, msg: '登录服务未配置' },
  AUTH_FAILED: { code: API_CODE.SERVER, msg: '登录服务暂时不可用' },
  METHOD_NOT_ALLOWED: { code: API_CODE.SERVER, msg: '请求方法不支持' },
  NOT_FOUND: { code: API_CODE.SERVER, msg: '接口不存在' },
  INVALID_EMAIL: { code: API_CODE.VALIDATION, msg: '请输入有效邮箱' },
  INVALID_EMAIL_OR_PASSWORD: { code: API_CODE.VALIDATION, msg: '邮箱或密码不正确，请重试；新用户请先注册。' },
  INVALID_OTP: { code: API_CODE.VALIDATION, msg: '验证码不正确或已过期' },
  INVALID_OTP_TYPE: { code: API_CODE.VALIDATION, msg: '不支持该验证码类型' },
  OTP_EXPIRED: { code: API_CODE.VALIDATION, msg: '验证码不正确或已过期' },
  TOO_MANY_ATTEMPTS: { code: API_CODE.VALIDATION, msg: '验证码尝试次数过多，请重新获取' },
  TOO_MANY_REQUESTS: { code: API_CODE.RATE_LIMIT, msg: '请求过于频繁' },
  EMAIL_NOT_VERIFIED: { code: API_CODE.VALIDATION, msg: '请先完成邮箱验证后再登录。' },
  PASSWORD_TOO_SHORT: { code: API_CODE.VALIDATION, msg: `密码至少 ${PASSWORD_MIN_LENGTH} 位` },
  PASSWORD_TOO_LONG: { code: API_CODE.VALIDATION, msg: '密码过长' },
  INVALID_PASSWORD: { code: API_CODE.VALIDATION, msg: `密码至少 ${PASSWORD_MIN_LENGTH} 位` },
  USER_ALREADY_EXISTS: { code: API_CODE.VALIDATION, msg: '该邮箱已注册，请切换到密码登录。' },
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: { code: API_CODE.VALIDATION, msg: '该邮箱已注册，请切换到密码登录。' },
  FAILED_TO_CREATE_USER: { code: API_CODE.SERVER, msg: '无法创建账号' },
  FAILED_TO_CREATE_SESSION: { code: API_CODE.SERVER, msg: '无法创建登录状态' },
  VALIDATION_ERROR: { code: API_CODE.VALIDATION, msg: '请求参数不正确' },
} as const;

export type ErrorCode = keyof typeof FAILURES;

export function failureOf(code: string) {
  if (code in FAILURES) return FAILURES[code as ErrorCode];
  return undefined;
}

export function failureMessage(code: ErrorCode) {
  return FAILURES[code].msg;
}

export function successEnvelope(data: unknown) {
  return { code: API_CODE.OK, data, err: { msg: '' } };
}

export function errorEnvelope(code: ErrorCode) {
  const failure = FAILURES[code];
  return { code: failure.code, data: null, err: { msg: failure.msg } };
}
