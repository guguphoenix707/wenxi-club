import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { test } from 'node:test';
import { createHandler } from '../app/api/handler.ts';
import { API_CODE, failureMessage } from '../app/api/error-messages.ts';
import { normalizeApiJson } from '../app/api/error-response.ts';

test('library auth errors become the business envelope', () => {
  const raw = JSON.stringify({
    code: 'INVALID_EMAIL_OR_PASSWORD',
    message: 'Invalid email or password',
  });
  assert.equal(normalizeApiJson(401, raw), JSON.stringify({
    code: API_CODE.VALIDATION,
    data: null,
    err: { msg: failureMessage('INVALID_EMAIL_OR_PASSWORD') },
  }));
});

test('rate limit responses use 40009', () => {
  const raw = JSON.stringify({ message: 'Too many requests. Please try again later.' });
  assert.equal(normalizeApiJson(429, raw), JSON.stringify({
    code: API_CODE.RATE_LIMIT,
    data: null,
    err: { msg: failureMessage('TOO_MANY_REQUESTS') },
  }));
});

test('successful auth JSON is wrapped with code 0', () => {
  assert.equal(normalizeApiJson(200, 'null'), JSON.stringify({
    code: API_CODE.OK,
    data: null,
    err: { msg: '' },
  }));
  assert.equal(normalizeApiJson(200, JSON.stringify({ success: true })), JSON.stringify({
    code: API_CODE.OK,
    data: { success: true },
    err: { msg: '' },
  }));
});

test('an envelope that is already normalized is left unchanged', () => {
  const raw = JSON.stringify({
    code: API_CODE.SERVER,
    data: null,
    err: { msg: failureMessage('AUTH_FAILED') },
  });
  assert.equal(normalizeApiJson(500, raw), null);
});

test('redirects and non-json bodies are left unchanged', () => {
  assert.equal(normalizeApiJson(302, ''), null);
  assert.equal(normalizeApiJson(500, 'not-json'), null);
});

test('sign-in validation errors leave the server as a business failure', async (t) => {
  const { handler, close } = createHandler({
    DATABASE_URL: 'postgres://wenxi:wenxi@127.0.0.1:5432/wenxi',
    BETTER_AUTH_SECRET: 'local-dev-better-auth-secret-key-32',
    BETTER_AUTH_URL: 'http://localhost:3000',
  });
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
  const response = await fetch(`http://127.0.0.1:${address.port}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' },
    body: JSON.stringify({}),
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    code: API_CODE.VALIDATION,
    data: null,
    err: { msg: failureMessage('VALIDATION_ERROR') },
  });
});
