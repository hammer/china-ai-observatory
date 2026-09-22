import { setTimeout } from 'node:timers/promises';
import { projectName } from './deploy-config';

type Dependencies = { fetch?: typeof fetch; sleep?: (ms: number) => Promise<unknown> };
type Envelope = {
  success?: boolean;
  errors?: { code?: number; message?: string }[];
  result?: { name?: string; production_branch?: string; source?: { config?: { owner?: string; repo_name?: string } } };
};

// Re-read before every create attempt: a failed POST may still have created the project.
export async function ensurePagesProject(accountId: string, token: string, dependencies: Dependencies = {}) {
  const request = dependencies.fetch ?? fetch;
  const sleep = dependencies.sleep ?? setTimeout;
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const sanitize = (value: string) => value.split(token).join('[redacted]')
    .split(accountId).join('[account]').replace(/[\r\n\x00-\x1f\x7f]/g, ' ').slice(0, 500);
  const transient = (status: number) => status === 429 || status >= 500;
  async function call(method: 'GET' | 'POST') {
    let response: Response;
    try {
      response = await request(method === 'GET' ? `${endpoint}/${projectName}` : endpoint, {
        method, headers, signal: AbortSignal.timeout(30_000),
        ...(method === 'POST' ? { body: JSON.stringify({ name: projectName, production_branch: 'main' }) } : {}),
      });
    } catch {
      // Do not include arbitrary transport exceptions, which can contain request credentials.
      return { status: 0, ok: false, body: {} as Envelope, error: `${method} Pages project request failed or timed out.`, retry: true };
    }
    let body: Envelope = {};
    try { body = await response.json() as Envelope; } catch { /* Never print HTML/raw response bodies. */ }
    const codes = Array.isArray(body?.errors) ? body.errors.slice(0, 3).map(e =>
      `${typeof e.code === 'number' ? e.code : 'unknown'}: ${typeof e.message === 'string' ? sanitize(e.message) : 'No error message'}`).join('; ') : '';
    const ray = response.headers.get('cf-ray');
    return {
      status: response.status, ok: response.ok && body?.success === true, body,
      error: `${method} Pages project request failed (HTTP ${response.status})${codes ? ` — ${codes}` : ''}${ray ? ` [Cloudflare Ray ID: ${sanitize(ray)}]` : ''}.`,
      retry: transient(response.status) || (method === 'POST' && response.status === 409),
    };
  }
  function verify(body: Envelope) {
    const project = body.result;
    if (project?.name !== projectName) throw new Error('Cloudflare returned an unexpected Pages project. Deployment stopped.');
    if (project.production_branch !== 'main') throw new Error('Existing Pages project uses a different production branch. Review its configuration first.');
    const source = project.source?.config;
    if (source && (source.owner !== 'hammer' || source.repo_name !== projectName)) throw new Error('Existing Pages project is connected to another repository.');
  }
  let lastError = '';
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt) await sleep(1000 * 2 ** (attempt - 1));
    const existing = await call('GET');
    if (existing.ok) { verify(existing.body); return; }
    if (existing.status !== 404) {
      if (!existing.retry) throw new Error(existing.error);
      lastError = existing.error;
      continue;
    }
    const created = await call('POST');
    if (created.ok) { verify(created.body); return; }
    if (!created.retry) throw new Error(created.error);
    lastError = created.error;
  }
  throw new Error(`${lastError} Stopped after 3 attempts. Check Cloudflare status and the error code above; do not broaden token permissions based on an HTTP 500 alone.`);
}
