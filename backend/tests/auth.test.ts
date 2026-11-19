import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { createHandler } from '../app/api/handler.ts';
import { hasWeChatAuth, readAuthConfig } from '../app/config.ts';
import { allowSessionForStatus } from '../app/auth/session-policy.ts';
import { mapWeChatProfileToUser } from '../app/auth/wechat-profile.ts';

const coreAuthEnv = {
  DATABASE_URL: 'postgres://wenxi:wenxi@127.0.0.1:5432/wenxi',
  BETTER_AUTH_SECRET: 'local-dev-better-auth-secret-key-32',
  BETTER_AUTH_URL: 'http://localhost:3000',
};

const completeAuthEnv = {
  ...coreAuthEnv,
  WECHAT_APP_ID: 'wx-test-app-id',
  WECHAT_APP_SECRET: 'wx-test-app-secret',
};

test('auth config is absent until every required value is valid', () => {
  assert.equal(readAuthConfig({}), null);
  assert.equal(readAuthConfig({ ...completeAuthEnv, BETTER_AUTH_SECRET: 'short' }), null);
  assert.equal(readAuthConfig({ ...completeAuthEnv, BETTER_AUTH_URL: 'not-a-url' }), null);
  const config = readAuthConfig(completeAuthEnv);
  assert.deepEqual(config, {
    databaseUrl: completeAuthEnv.DATABASE_URL,
    secret: completeAuthEnv.BETTER_AUTH_SECRET,
    baseURL: 'http://localhost:3000',
    wechatAppId: completeAuthEnv.WECHAT_APP_ID,
    wechatAppSecret: completeAuthEnv.WECHAT_APP_SECRET,
  });
});

test('auth config does not require WeChat credentials', () => {
  const config = readAuthConfig(coreAuthEnv);
  assert.deepEqual(config, {
    databaseUrl: coreAuthEnv.DATABASE_URL,
    secret: coreAuthEnv.BETTER_AUTH_SECRET,
    baseURL: 'http://localhost:3000',
    wechatAppId: null,
    wechatAppSecret: null,
  });
  assert.equal(config && hasWeChatAuth(config), false);
  const partial = readAuthConfig({ ...coreAuthEnv, WECHAT_APP_ID: 'wx-only-id' });
  assert.equal(partial?.wechatAppId, null);
  assert.equal(partial && hasWeChatAuth(partial), false);
});

test('WeChat profile mapping never marks email as verified', () => {
  const withoutUnion = mapWeChatProfileToUser({
    nickname: ' 阿信 ',
    headimgurl: 'https://example.com/avatar.png',
    openid: 'openid-1',
  }, 'wx-platform');
  assert.equal(withoutUnion.emailVerified, false);
  assert.equal(withoutUnion.name, '阿信');
  assert.equal(withoutUnion.wechatUnionid, undefined);
  assert.equal(withoutUnion.wechatPlatformId, undefined);

  const withUnion = mapWeChatProfileToUser({
    nickname: '',
    unionid: 'union-1',
    openid: 'openid-1',
  }, 'wx-platform');
  assert.equal(withUnion.emailVerified, false);
  assert.equal(withUnion.name, '微信用户');
  assert.equal(withUnion.wechatUnionid, 'union-1');
  assert.equal(withUnion.wechatPlatformId, 'wx-platform');
});

test('disabled users cannot create a session', () => {
  assert.equal(allowSessionForStatus('active'), true);
  assert.equal(allowSessionForStatus('disabled'), false);
  assert.equal(allowSessionForStatus(undefined), false);
});

test('login methods hide WeChat when credentials are absent', async (t) => {
  const { handler, close } = createHandler(coreAuthEnv);
  const server = createServer(handler);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.closeAllConnections();
      server.close((error) => error ? reject(error) : resolve());
    });
    await close();
  });
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const response = await fetch(`http://127.0.0.1:${address.port}/api/auth/login-methods`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    code: 0,
    data: { emailPassword: true, wechat: false },
    err: { msg: '' },
  });
});

test('auth routes return AUTH_NOT_CONFIGURED when env is missing', async (t) => {
  const { handler, close } = createHandler({});
  const server = createServer(handler);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.closeAllConnections();
      server.close((error) => error ? reject(error) : resolve());
    });
    await close();
  });
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const response = await fetch(`http://127.0.0.1:${address.port}/api/auth/get-session`);
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.deepEqual(body, { code: 40100, data: null, err: { msg: '登录服务未配置' } });
  assert.ok(response.headers.get('x-request-id'));
  const health = await fetch(`http://127.0.0.1:${address.port}/api/health`);
  assert.equal(health.status, 200);
});
