import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ensurePagesProject } from '../scripts/pages-project';

const account = 'a'.repeat(32);
const token = 'test-secret-token';
const project = { name: 'china-ai-observatory', production_branch: 'main' };
const ok = (result = project) => Response.json({ success: true, result });
const error = (status: number, message = 'Service unavailable') => Response.json({ success: false, errors: [{ code: 1234, message }] }, { status, headers: { 'cf-ray': 'example-ray' } });
function fixture(responses: (Response | Error)[]) {
  const calls: string[] = [];
  const delays: number[] = [];
  const request: typeof fetch = async (url, init) => {
    assert.ok(String(url).startsWith(`https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects`));
    assert.equal((init?.headers as Record<string, string>).Authorization, `Bearer ${token}`);
    calls.push(init?.method ?? 'GET');
    assert.ok(responses.length, 'Unexpected additional API request');
    const response = responses.shift()!;
    if (response instanceof Error) throw response;
    return response;
  };
  return { calls, delays, dependencies: { fetch: request, sleep: async (ms: number) => { delays.push(ms); } } };
}
test('ambiguous create failure rechecks before creating again', async () => {
  const f = fixture([error(404), error(500), ok()]);
  await ensurePagesProject(account, token, f.dependencies);
  assert.deepEqual(f.calls, ['GET', 'POST', 'GET']);
  assert.deepEqual(f.delays, [1000]);
});
test('persistent creation failures stop with redacted API diagnostics', async () => {
  const f = fixture([error(404), error(500), error(404), error(500), error(404), error(500, `Failure ${token} ${account}\n::warning::test`)]);
  await assert.rejects(ensurePagesProject(account, token, f.dependencies), (e: Error) => {
    assert.match(e.message, /HTTP 500.*1234:.*example-ray/);
    assert.match(e.message, /Stopped after 3 attempts/);
    assert.ok(!e.message.includes(token) && !e.message.includes(account) && !e.message.includes('\n'));
    return true;
  });
  assert.equal(f.calls.length, 6);
});
test('authorization failures never trigger creation or retries', async () => {
  const f = fixture([error(403, 'Not authorized')]);
  await assert.rejects(ensurePagesProject(account, token, f.dependencies), /HTTP 403.*Not authorized/);
  assert.deepEqual(f.calls, ['GET']);
  assert.deepEqual(f.delays, []);
});
test('transient reads and network failures retry without creating', async () => {
  const f = fixture([error(429), new Error(`transport includes ${token}`), ok()]);
  await ensurePagesProject(account, token, f.dependencies);
  assert.deepEqual(f.calls, ['GET', 'GET', 'GET']);
});
test('successful creation validates the returned project before upload', async () => {
  const f = fixture([error(404), ok({ ...project, production_branch: 'other' })]);
  await assert.rejects(ensurePagesProject(account, token, f.dependencies), /different production branch/);
});
test('an existing project connected to another repository is rejected', async () => {
  const f = fixture([Response.json({ success: true, result: { ...project, source: { config: { owner: 'someone-else', repo_name: 'other' } } } })]);
  await assert.rejects(ensurePagesProject(account, token, f.dependencies), /another repository/);
});
test('HTML error pages never appear in diagnostics', async () => {
  const f = fixture([new Response(`<html>${token}</html>`, { status: 403 })]);
  await assert.rejects(ensurePagesProject(account, token, f.dependencies), (e: Error) => {
    assert.match(e.message, /HTTP 403/);
    assert.ok(!e.message.includes(token) && !e.message.includes('<html>'));
    return true;
  });
});
