import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { handler } from '../app/api/handler.ts';
import { readConfig } from '../app/config.ts';

test('HTTP health, HEAD, unsupported methods and missing routes', async (t) => {
  const server = createServer(handler);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise<void>((resolve, reject) => { server.closeAllConnections(); server.close(error => error ? reject(error) : resolve()); }));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  const response = await fetch(`${base}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok', service: 'wenxi-api' });
  assert.ok(response.headers.get('x-request-id'));
  const head = await fetch(`${base}/api/health`, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  const post = await fetch(`${base}/api/health`, { method: 'POST' });
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('allow'), 'GET, HEAD');
  const missing = await fetch(`${base}/api/missing`);
  assert.equal(missing.status, 404);
  assert.match(await missing.text(), /"code":"NOT_FOUND"/);
});
test('invalid ports fail at startup', () => {
  for (const PORT of ['', 'abc', '0', '65536', '1.5']) assert.throws(() => readConfig({ PORT }));
  assert.equal(readConfig({}).port, 3001);
});
