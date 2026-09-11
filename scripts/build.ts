import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { loadData } from '../src/data/loader';
loadData();
const require = createRequire(import.meta.url);
const packagePath = require.resolve('astro/package.json');
const astroPackage = JSON.parse(readFileSync(packagePath, 'utf8'));
const entry = typeof astroPackage.bin === 'string' ? astroPackage.bin : astroPackage.bin.astro;
execFileSync(process.execPath,[resolve(dirname(packagePath),entry),'build'],{stdio:'inherit',env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'}});
let revision: string|null=null;
try {revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();} catch {}
writeFileSync('dist/build.json',JSON.stringify({revision,built_at:new Date().toISOString(),repository:'hammer/china-ai-observatory'})+'\n');
