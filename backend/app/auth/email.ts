import { randomInt, timingSafeEqual } from 'node:crypto';

export const OTP_LENGTH = 6;
export const OTP_EXPIRES_IN_SECONDS = 300;
export const OTP_RESEND_INTERVAL_SECONDS = 60;
export const OTP_ALLOWED_ATTEMPTS = 3;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type VerificationRecord = {
  value: string;
  expiresAt: Date;
  createdAt?: Date;
};

export type VerificationStore = {
  findVerificationValue(identifier: string): Promise<VerificationRecord | null>;
  updateVerificationByIdentifier(identifier: string, data: { value: string }): Promise<unknown>;
  deleteVerificationByIdentifier(identifier: string): Promise<unknown>;
};

export function isValidEmail(value: string) {
  return value.length <= 254 && EMAIL_PATTERN.test(value);
}

export function nicknameFromEmail(email: string) {
  const local = email.split('@')[0]?.trim() ?? '';
  return local || '用户';
}

export function otpIdentifier(email: string) {
  return `email-verification-otp-${email}`;
}

export function generateOtp() {
  return String(randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, '0');
}

export async function hashOtp(otp: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(otp));
  return Buffer.from(digest).toString('base64url');
}

export function canResendOtp(createdAt: Date, now = new Date()) {
  return now.getTime() - createdAt.getTime() >= OTP_RESEND_INTERVAL_SECONDS * 1000;
}

export function shouldSkipSendingOtp(input: {
  userVerified: boolean;
  lastCreatedAt: Date | null;
  now?: Date;
}) {
  if (input.userVerified) return true;
  if (!input.lastCreatedAt) return false;
  return !canResendOtp(input.lastCreatedAt, input.now);
}

export function splitAtLastColon(value: string) {
  const index = value.lastIndexOf(':');
  if (index === -1) return [value, ''] as const;
  return [value.slice(0, index), value.slice(index + 1)] as const;
}

export function createdAtFromVerification(record: VerificationRecord) {
  if (record.createdAt) return record.createdAt;
  return new Date(record.expiresAt.getTime() - OTP_EXPIRES_IN_SECONDS * 1000);
}

function equal(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function verifyAndConsumeOtp(
  store: VerificationStore,
  email: string,
  otp: string,
): Promise<'ok' | 'invalid' | 'expired' | 'too-many'> {
  const identifier = otpIdentifier(email);
  const record = await store.findVerificationValue(identifier);
  if (!record) return 'invalid';
  if (record.expiresAt < new Date()) {
    await store.deleteVerificationByIdentifier(identifier);
    return 'expired';
  }
  const [stored, attemptsRaw] = splitAtLastColon(record.value);
  const attempts = Number.parseInt(attemptsRaw || '0', 10);
  if (Number.isFinite(attempts) && attempts >= OTP_ALLOWED_ATTEMPTS) {
    await store.deleteVerificationByIdentifier(identifier);
    return 'too-many';
  }
  if (!equal(stored, await hashOtp(otp))) {
    await store.updateVerificationByIdentifier(identifier, {
      value: `${stored}:${(Number.isFinite(attempts) ? attempts : 0) + 1}`,
    });
    return 'invalid';
  }
  await store.deleteVerificationByIdentifier(identifier);
  return 'ok';
}
