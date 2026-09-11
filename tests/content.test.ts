import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse, stringify } from 'yaml';
import { loadData } from '../src/data/loader';
import { completePeriod } from '../src/lib/periods';
import { date } from '../src/schema';
import { requireOwnerCredentials } from '../scripts/deploy-config';

test('the research corpus resolves all references and retains the baseline',()=>{
  const d=loadData(); const baseline=JSON.parse(readFileSync('docs/migration-baseline.json','utf8'));
  for(const key of ['companies','sources','news','briefings','outputs'] as const) assert.ok(d[key].length>=baseline.counts[key]);
  assert.ok(d.benchmarks.comparison.caveats.includes('INT8'));
  assert.ok(d.benchmarks.assessment.includes('independent'));
});
test('loader rejects unsupported facts and dangling citations',()=>{
  const root=mkdtempSync(join(tmpdir(),'observatory-data-'));
  try {
    cpSync('data',join(root,'data'),{recursive:true});
    const original=loadData(root).companies[0]!;
    const path=join(root,'data/companies',original.slug+'.yaml');
    const company=parse(readFileSync(path,'utf8'));company.key_fact.source_ids=['source-does-not-exist'];
    writeFileSync(path,stringify(company)); assert.throws(()=>loadData(root),/unknown source/);
    company.key_fact.source_ids=original.key_fact.source_ids;company.key_fact.evidence='independently-verified-because-vendor-says-so';
    writeFileSync(path,stringify(company));assert.throws(()=>loadData(root),/evidence/);
  } finally {rmSync(root,{recursive:true,force:true});}
});
test('complete periods handle year rollover, leap February, and Sundays',()=>{
  assert.deepEqual(completePeriod('weekly','2026-09-13'),{slug:'weekly-2026-08-31-complete',cadence:'weekly',period_start:'2026-08-31',period_end:'2026-09-06',through_date:'2026-09-06'});
  assert.equal(completePeriod('weekly','2026-09-14').period_end,'2026-09-13');
  assert.equal(completePeriod('monthly','2024-03-01').period_end,'2024-02-29');
  assert.equal(completePeriod('quarterly','2027-01-01').period_start,'2026-10-01');
  assert.equal(completePeriod('quarterly','2026-09-30').period_end,'2026-06-30');
  assert.equal(completePeriod('quarterly','2026-10-01').period_end,'2026-09-30');
  assert.equal(date.safeParse('2026-02-30').success,false);
});
test('deployment cannot pick an implicit or email-based account',()=>{
  assert.throws(()=>requireOwnerCredentials({}),/account ID/);
  assert.throws(()=>requireOwnerCredentials({CLOUDFLARE_ACCOUNT_ID:'owner@example.com',CLOUDFLARE_API_TOKEN:'test'}),/account ID/);
  assert.throws(()=>requireOwnerCredentials({CLOUDFLARE_ACCOUNT_ID:'a'.repeat(32)}),/TOKEN/);
  assert.equal(requireOwnerCredentials({CLOUDFLARE_ACCOUNT_ID:'a'.repeat(32),CLOUDFLARE_API_TOKEN:'test'}).accountId,'a'.repeat(32));
});
