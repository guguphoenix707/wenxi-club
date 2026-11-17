import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLogMailer } from '../app/mail/index.ts';
import {
  canResendOtp,
  hashOtp,
  isValidEmail,
  nicknameFromEmail,
  otpIdentifier,
  shouldSkipSendingOtp,
  verifyAndConsumeOtp,
  type VerificationRecord,
  type VerificationStore,
} from '../app/auth/email.ts';

test('nickname is the email local part', () => {
  assert.equal(nicknameFromEmail('xin@example.com'), 'xin');
  assert.equal(nicknameFromEmail('  @example.com'), '用户');
});

test('email and otp helpers', () => {
  assert.equal(isValidEmail('xin@example.com'), true);
  assert.equal(isValidEmail('not-an-email'), false);
  assert.equal(otpIdentifier('xin@example.com'), 'email-verification-otp-xin@example.com');
  assert.equal(canResendOtp(new Date(Date.now() - 59_000)), false);
  assert.equal(canResendOtp(new Date(Date.now() - 60_000)), true);
  assert.equal(shouldSkipSendingOtp({ userVerified: true, lastCreatedAt: null }), true);
  assert.equal(shouldSkipSendingOtp({ userVerified: false, lastCreatedAt: null }), false);
});

test('log mailer writes template and recipient', async () => {
  const lines: string[] = [];
  const mailer = createLogMailer((line) => lines.push(line));
  await mailer.sendTransactionalEmail({
    to: 'xin@example.com',
    templateId: 'email-otp',
    variables: { otp: '123456' },
  });
  assert.equal(lines.length, 1);
  assert.match(lines[0] ?? '', /email-otp/);
  assert.match(lines[0] ?? '', /xin@example.com/);
});

test('hashed OTP is verified then consumed', async () => {
  const identifier = otpIdentifier('xin@example.com');
  const store = new Map<string, VerificationRecord>();
  const adapter: VerificationStore = {
    async findVerificationValue(id) {
      return store.get(id) ?? null;
    },
    async updateVerificationByIdentifier(id, data) {
      const current = store.get(id);
      if (current) store.set(id, { ...current, value: data.value });
    },
    async deleteVerificationByIdentifier(id) {
      store.delete(id);
    },
  };
  store.set(identifier, {
    value: `${await hashOtp('123456')}:0`,
    expiresAt: new Date(Date.now() + 60_000),
  });
  assert.equal(await verifyAndConsumeOtp(adapter, 'xin@example.com', '000000'), 'invalid');
  assert.equal(await verifyAndConsumeOtp(adapter, 'xin@example.com', '123456'), 'ok');
  assert.equal(await verifyAndConsumeOtp(adapter, 'xin@example.com', '123456'), 'invalid');
});
