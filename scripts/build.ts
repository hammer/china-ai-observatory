import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { loadData } from '../src/data/loader';
loadData();
execFileSync(process.execPath,['node_modules/astro/astro.js','build'],{stdio:'inherit',env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'}});
let revision: string|null=null;
try {revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();} catch {}
writeFileSync('dist/build.json',JSON.stringify({revision,built_at:new Date().toISOString(),repository:'hammer/china-ai-observatory'})+'\n');
