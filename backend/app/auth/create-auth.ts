import { betterAuth } from 'better-auth';
import { toNodeHandler } from 'better-auth/node';
import { Pool } from 'pg';
import type { AuthConfig } from '../config.ts';
import { hasWeChatAuth } from '../config.ts';
import { createLogMailer, type Mailer } from '../mail/index.ts';
import { createEmailAuthPlugin } from './email-auth-plugin.ts';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from './email.ts';
import { allowSessionForStatus } from './session-policy.ts';
import { mapWeChatProfileToUser } from './wechat-profile.ts';

export function createAuthRuntime(config: AuthConfig, dependencies: { mailer?: Mailer } = {}) {
  const pool = new Pool({ connectionString: config.databaseUrl, max: 10 });
  const mailer = dependencies.mailer ?? createLogMailer();
  const wechatEnabled = hasWeChatAuth(config);
  const auth = betterAuth({
    appName: 'wenxi-club',
    baseURL: config.baseURL,
    basePath: '/api/auth',
    secret: config.secret,
    database: pool,
    trustedOrigins: [new URL(config.baseURL).origin],
    advanced: {
      database: { generateId: 'uuid' },
      useSecureCookies: new URL(config.baseURL).protocol === 'https:',
      defaultCookieAttributes: {
        sameSite: 'lax',
        httpOnly: true,
      },
    },
    user: {
      modelName: 'users',
      fields: {
        name: 'nickname',
        image: 'avatar_url',
        emailVerified: 'email_verified',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      additionalFields: {
        status: {
          type: ['active', 'disabled'],
          required: true,
          defaultValue: 'active',
          input: false,
        },
        wechatUnionid: {
          type: 'string',
          required: false,
          input: true,
          fieldName: 'wechat_unionid',
        },
        wechatPlatformId: {
          type: 'string',
          required: false,
          input: true,
          fieldName: 'wechat_platform_id',
        },
        lastLoginAt: {
          type: 'date',
          required: false,
          input: false,
          fieldName: 'last_login_at',
        },
      },
    },
    session: {
      modelName: 'auth_sessions',
      fields: {
        userId: 'user_id',
        expiresAt: 'expires_at',
        ipAddress: 'ip_address',
        userAgent: 'user_agent',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    },
    account: {
      modelName: 'auth_accounts',
      fields: {
        userId: 'user_id',
        accountId: 'account_id',
        providerId: 'provider_id',
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        idToken: 'id_token',
        accessTokenExpiresAt: 'access_token_expires_at',
        refreshTokenExpiresAt: 'refresh_token_expires_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      accountLinking: {
        trustedProviders: wechatEnabled ? ['wechat'] : [],
        disableImplicitLinking: true,
      },
    },
    verification: {
      modelName: 'auth_verifications',
      fields: {
        expiresAt: 'expires_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: PASSWORD_MIN_LENGTH,
      maxPasswordLength: PASSWORD_MAX_LENGTH,
      requireEmailVerification: true,
      autoSignIn: false,
    },
    emailVerification: {
      autoSignInAfterVerification: true,
    },
    socialProviders: wechatEnabled && config.wechatAppId && config.wechatAppSecret
      ? {
        wechat: {
          clientId: config.wechatAppId,
          clientSecret: config.wechatAppSecret,
          lang: 'cn',
          overrideUserInfoOnSignIn: true,
          mapProfileToUser: (profile) => {
            const mapped = mapWeChatProfileToUser(profile, config.wechatAppId as string);
            return {
              name: mapped.name,
              image: mapped.image,
              wechatUnionid: mapped.wechatUnionid,
              wechatPlatformId: mapped.wechatPlatformId,
            };
          },
        },
      }
      : {},
    disabledPaths: [
      '/sign-up/email',
      '/request-password-reset',
      '/reset-password',
      '/forget-password',
    ],
    plugins: [createEmailAuthPlugin({ mailer })],
    databaseHooks: {
      session: {
        create: {
          before: async (session) => {
            const result = await pool.query<{ status: string }>(
              'SELECT status FROM users WHERE id = $1',
              [session.userId],
            );
            if (!allowSessionForStatus(result.rows[0]?.status)) return false;
            return { data: session };
          },
          after: async (session) => {
            await pool.query(
              'UPDATE users SET last_login_at = now(), updated_at = now() WHERE id = $1',
              [session.userId],
            );
          },
        },
      },
    },
  });
  return {
    handler: toNodeHandler(auth),
    close: () => pool.end(),
  };
}
