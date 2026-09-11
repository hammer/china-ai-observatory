/** One-time, lossless field migration from the original JSON research baseline. */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { stringify } from 'yaml';

const source = process.argv[2];
if (!source) throw new Error('Usage: npx tsx scripts/migrate-legacy.ts /path/to/original/content');
function snake(value: any): any {
  if (Array.isArray(value)) return value.map(snake);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([k,v]) => [k.replace(/[A-Z]/g, c => '_' + c.toLowerCase()), snake(v)]));
}
const read = (name: string) => JSON.parse(readFileSync(join(source, name + '.json'), 'utf8'));
function put(path: string, data: unknown) {
  const target = join('data', path + '.yaml');
  mkdirSync(target.slice(0, target.lastIndexOf('/')), { recursive: true });
  writeFileSync(target, stringify(data, { lineWidth: 110 }));
}
const counts: Record<string, number> = {};
for (const name of ['companies', 'sources', 'news', 'briefings']) {
  const records = read(name); counts[name] = records.length;
  for (const record of records) {
    const data = snake(record); data.slug = data.id; delete data.id;
    if (name === 'companies') { data.layers = data.layer_ids; delete data.layer_ids; }
    if (name === 'news') { data.companies = data.company_ids; delete data.company_ids; }
    const path = name === 'briefings' ? `${name}/${data.cadence}/${data.slug}` : `${name}/${data.slug}`;
    put(path, data);
  }
}
put('layers', read('layers').map((r: any) => { const { id, ...rest } = snake(r); return { slug: id, ...rest }; }));
put('overview', snake(read('overview')));
const benchmarks = snake(read('benchmarks'));
for (const spec of benchmarks.specs) {
  const { id, ...rest } = spec;
  const vendor = spec.vendor.toLowerCase();
  put(`outputs/${vendor}/${id}`, { slug: id, type: 'accelerator', as_of: benchmarks.reviewed_at, ...rest });
}
counts.outputs = benchmarks.specs.length;
delete benchmarks.specs;
put('benchmarks', benchmarks);
const oldState = snake(read('state'));
put('research-state', {
  schema_version: 2, baseline_date: oldState.baseline_date, last_research_at: oldState.last_research_at,
  last_automated_run_at: null, last_run_status: 'baseline', coverage: oldState.coverage,
  timezone: 'Europe/London', runs: [],
});
mkdirSync('docs', { recursive: true });
writeFileSync('docs/migration-baseline.json', JSON.stringify({
  baseline_date: oldState.baseline_date, counts,
  original_sha256: Object.fromEntries(['companies','sources','news','briefings','layers','overview','benchmarks','state'].map(name => [name + '.json', createHash('sha256').update(readFileSync(join(source, name + '.json'))).digest('hex')])),
  note: 'Record identities, facts, dates, citations and historical briefings retained. Operational hosting and scheduler state intentionally separated from research data.'
}, null, 2) + '\n');
