export function readConfig(env: NodeJS.ProcessEnv = process.env) {
  const port = Number(env.PORT ?? 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer between 1 and 65535');
  return { host: env.HOST ?? '127.0.0.1', port };
}

export type AuthConfig = {
  databaseUrl: string;
  secret: string;
  baseURL: string;
  wechatAppId: string | null;
  wechatAppSecret: string | null;
};

export function hasWeChatAuth(config: AuthConfig) {
  return Boolean(config.wechatAppId && config.wechatAppSecret);
}

export function readAuthConfig(env: NodeJS.ProcessEnv = process.env): AuthConfig | null {
  const databaseUrl = env.DATABASE_URL?.trim() ?? '';
  const secret = env.BETTER_AUTH_SECRET?.trim() ?? '';
  const rawBaseURL = env.BETTER_AUTH_URL?.trim() ?? '';
  const wechatAppId = env.WECHAT_APP_ID?.trim() ?? '';
  const wechatAppSecret = env.WECHAT_APP_SECRET?.trim() ?? '';
  if (!databaseUrl || !secret || !rawBaseURL) return null;
  if (secret.length < 32) return null;
  try {
    const parsed = new URL(rawBaseURL);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    const wechatConfigured = Boolean(wechatAppId && wechatAppSecret);
    return {
      databaseUrl,
      secret,
      baseURL: parsed.origin,
      wechatAppId: wechatConfigured ? wechatAppId : null,
      wechatAppSecret: wechatConfigured ? wechatAppSecret : null,
    };
  } catch {
    return null;
  }
}
