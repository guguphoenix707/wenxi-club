import { APIError, createAuthEndpoint, formCsrfMiddleware } from 'better-auth/api';
import { setSessionCookie } from 'better-auth/cookies';
import type { BetterAuthPlugin } from 'better-auth';
import * as z from 'zod';
import type { Mailer } from '../mail/index.ts';
import { failureMessage, type ErrorCode } from '../api/error-messages.ts';
import {
  OTP_EXPIRES_IN_SECONDS,
  OTP_LENGTH,
  OTP_RESEND_INTERVAL_SECONDS,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  createdAtFromVerification,
  generateOtp,
  hashOtp,
  isValidEmail,
  nicknameFromEmail,
  otpIdentifier,
  shouldSkipSendingOtp,
  verifyAndConsumeOtp,
} from './email.ts';

const sendBodySchema = z.object({
  email: z.string(),
  type: z.enum(['email-verification', 'sign-in', 'forget-password', 'change-email']).optional(),
});

const registerBodySchema = z.object({
  email: z.string(),
  password: z.string(),
  otp: z.string(),
});

function authError(
  status: 'BAD_REQUEST' | 'FORBIDDEN' | 'UNAUTHORIZED' | 'UNPROCESSABLE_ENTITY',
  code: ErrorCode,
) {
  return APIError.from(status, { code, message: failureMessage(code) });
}

function invalidEmail() {
  return authError('BAD_REQUEST', 'INVALID_EMAIL');
}

export function createEmailAuthPlugin(options: {
  mailer: Mailer;
}): BetterAuthPlugin {
  return {
    id: 'wenxi-email-otp',
    endpoints: {
      sendVerificationOTP: createAuthEndpoint('/email-otp/send-verification-otp', {
        method: 'POST',
        body: sendBodySchema,
        use: [formCsrfMiddleware],
      }, async (ctx) => {
        const email = ctx.body.email.trim().toLowerCase();
        if (!isValidEmail(email)) throw invalidEmail();
        if (ctx.body.type && ctx.body.type !== 'email-verification') {
          throw authError('BAD_REQUEST', 'INVALID_OTP_TYPE');
        }
        const identifier = otpIdentifier(email);
        const found = await ctx.context.internalAdapter.findUserByEmail(email);
        const existing = await ctx.context.internalAdapter.findVerificationValue(identifier);
        const lastCreatedAt = existing ? createdAtFromVerification({
          value: existing.value,
          expiresAt: existing.expiresAt,
          createdAt: existing.createdAt,
        }) : null;
        if (shouldSkipSendingOtp({
          userVerified: Boolean(found?.user.emailVerified),
          lastCreatedAt,
        })) {
          return ctx.json({ success: true });
        }
        const otp = generateOtp();
        const stored = `${await hashOtp(otp)}:0`;
        await ctx.context.internalAdapter.deleteVerificationByIdentifier(identifier);
        await ctx.context.internalAdapter.createVerificationValue({
          identifier,
          value: stored,
          expiresAt: new Date(Date.now() + OTP_EXPIRES_IN_SECONDS * 1000),
        });
        try {
          await options.mailer.sendTransactionalEmail({
            to: email,
            templateId: 'email-otp',
            variables: { otp },
          });
        } catch (error) {
          await ctx.context.internalAdapter.deleteVerificationByIdentifier(identifier);
          throw error;
        }
        return ctx.json({ success: true });
      }),
      registerEmail: createAuthEndpoint('/email/register', {
        method: 'POST',
        body: registerBodySchema,
        requireHeaders: true,
        use: [formCsrfMiddleware],
      }, async (ctx) => {
        const email = ctx.body.email.trim().toLowerCase();
        const password = ctx.body.password;
        const otp = ctx.body.otp.trim();
        if (!isValidEmail(email)) throw invalidEmail();
        if (password.length < PASSWORD_MIN_LENGTH) throw authError('BAD_REQUEST', 'PASSWORD_TOO_SHORT');
        if (password.length > PASSWORD_MAX_LENGTH) throw authError('BAD_REQUEST', 'PASSWORD_TOO_LONG');
        if (!new RegExp(`^\\d{${OTP_LENGTH}}$`).test(otp)) throw authError('BAD_REQUEST', 'INVALID_OTP');
        const found = await ctx.context.internalAdapter.findUserByEmail(email);
        if (found?.user.emailVerified) throw authError('UNPROCESSABLE_ENTITY', 'USER_ALREADY_EXISTS');
        const otpResult = await verifyAndConsumeOtp(ctx.context.internalAdapter, email, otp);
        if (otpResult === 'too-many') throw authError('FORBIDDEN', 'TOO_MANY_ATTEMPTS');
        if (otpResult !== 'ok') throw authError('BAD_REQUEST', 'INVALID_OTP');
        const hash = await ctx.context.password.hash(password);
        let user = found?.user;
        if (!user) {
          user = await ctx.context.internalAdapter.createUser({
            email,
            name: nicknameFromEmail(email),
            emailVerified: true,
          }, { method: 'email-password' });
          if (!user) throw authError('UNPROCESSABLE_ENTITY', 'FAILED_TO_CREATE_USER');
          await ctx.context.internalAdapter.linkAccount({
            userId: user.id,
            providerId: 'credential',
            accountId: user.id,
            password: hash,
          });
        } else {
          await ctx.context.internalAdapter.updateUser(user.id, { emailVerified: true });
          const credential = await ctx.context.internalAdapter.findCredentialAccount(user.id);
          if (credential) await ctx.context.internalAdapter.updatePassword(user.id, hash);
          else {
            await ctx.context.internalAdapter.createAccount({
              userId: user.id,
              providerId: 'credential',
              accountId: user.id,
              password: hash,
            });
          }
          user = {
            ...user,
            emailVerified: true,
          };
        }
        const session = await ctx.context.internalAdapter.createSession(user.id);
        if (!session) throw authError('UNAUTHORIZED', 'FAILED_TO_CREATE_SESSION');
        await setSessionCookie(ctx, { session, user });
        return ctx.json({
          token: session.token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
            image: user.image ?? null,
          },
        });
      }),
    },
    rateLimit: [{
      pathMatcher(path) {
        return path === '/email-otp/send-verification-otp';
      },
      window: OTP_RESEND_INTERVAL_SECONDS,
      max: 3,
    }],
  };
}
