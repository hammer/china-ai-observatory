import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { globSync } from 'glob';
import { parse } from 'yaml';
import { z } from 'zod';
import { companySchema, sourceSchema, newsSchema, briefingSchema, layerSchema, outputSchema, benchmarkSchema, overviewSchema, stateSchema } from '../schema';

function yaml<T extends z.ZodTypeAny>(root: string, file: string, schema: T): z.infer<T> {
  try { return schema.parse(parse(readFileSync(resolve(root, file), 'utf8'))); }
  catch (e) { throw new Error(`${file}: ${e instanceof Error ? e.message : e}`); }
}
function records<T extends z.ZodTypeAny>(root: string, pattern: string, schema: T): z.infer<T>[] {
  const files = globSync(pattern, { cwd: root }).sort();
  const seen = new Set<string>();
  return files.map(file => {
    const item = yaml(root, file, schema);
    if (item.slug !== basename(file, '.yaml')) throw new Error(`${file}: slug must match filename`);
    if (seen.has(item.slug)) throw new Error(`${file}: duplicate slug ${item.slug}`);
    seen.add(item.slug); return item;
  });
}
export function loadData(root = process.cwd()) {
  const data = {
    companies: records(root,'data/companies/*.yaml',companySchema),
    sources: records(root,'data/sources/*.yaml',sourceSchema),
    news: records(root,'data/news/*.yaml',newsSchema).sort((a,b) => b.published_at.localeCompare(a.published_at)),
    briefings: records(root,'data/briefings/*/*.yaml',briefingSchema).sort((a,b) => b.published_at.localeCompare(a.published_at)),
    outputs: records(root,'data/outputs/*/*.yaml',outputSchema),
    layers: yaml(root,'data/layers.yaml',z.array(layerSchema)),
    benchmarks: yaml(root,'data/benchmarks.yaml',benchmarkSchema),
    overview: yaml(root,'data/overview.yaml',overviewSchema),
    state: yaml(root,'data/research-state.yaml',stateSchema),
  };
  const sourceSet = new Set(data.sources.map(s => s.slug));
  const companySet = new Set(data.companies.map(s => s.slug));
  const layerSet = new Set(data.layers.map(s => s.slug));
  const newsMap = new Map(data.news.map(n => [n.slug, n]));
  const briefingMap = new Map(data.briefings.map(b => [b.slug,b]));
  const today = new Date().toISOString().slice(0,10);
  function references(value: any, context: string): void {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach((v,i) => references(v,`${context}[${i}]`)); return; }
    for (const [key,v] of Object.entries(value)) {
      if (key === 'source_ids') for (const id of v as string[]) if (!sourceSet.has(id)) throw new Error(`${context}: unknown source ${id}`);
      if (['reviewed_at','as_of','published_at','added_at','through_date','last_research_at','baseline_date','last_automated_run_at'].includes(key) && typeof v === 'string' && v > today) throw new Error(`${context}: future observation date ${v}`);
      references(v,`${context}.${key}`);
    }
  }
  references(data,'data');
  if (layerSet.size !== data.layers.length) throw new Error('Duplicate layer slug');
  for (const company of data.companies) for (const layer of company.layers) if (!layerSet.has(layer)) throw new Error(`${company.slug}: unknown layer ${layer}`);
  for (const run of data.state.runs) for (const c of run.companies) if (!companySet.has(c)) throw new Error(`Run: unknown company ${c}`);
  for (const news of data.news) {
    for (const c of news.companies) if (!companySet.has(c)) throw new Error(`${news.slug}: unknown company ${c}`);
    if (news.correction_of && (!newsMap.has(news.correction_of) || news.correction_of === news.slug)) throw new Error(`${news.slug}: invalid correction target`);
    if (news.added_at < news.published_at) throw new Error(`${news.slug}: added before publication`);
  }
  for (const report of data.briefings) {
    if (!(report.period_start <= report.through_date && report.through_date <= report.period_end && report.through_date <= report.published_at)) throw new Error(`${report.slug}: invalid covered interval`);
    if (report.status === 'complete' && (report.through_date !== report.period_end || report.published_at <= report.period_end)) throw new Error(`${report.slug}: a complete report must be published after its fully closed period`);
    const start = new Date(report.period_start + 'T00:00:00Z');
    const end = new Date(report.period_end + 'T00:00:00Z');
    if (report.cadence === 'weekly' && (start.getUTCDay() !== 1 || +end - +start !== 6 * 86400000)) throw new Error(`${report.slug}: week must be Monday–Sunday`);
    if (report.cadence !== 'weekly') {
      const months = report.cadence === 'monthly' ? 1 : 3;
      const expectedEnd = new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth()+months,0)).toISOString().slice(0,10);
      if (start.getUTCDate() !== 1 || expectedEnd !== report.period_end || (months === 3 && start.getUTCMonth()%3 !== 0)) throw new Error(`${report.slug}: invalid calendar period`);
    }
    if (report.correction_of && (!briefingMap.has(report.correction_of) || report.correction_of === report.slug)) throw new Error(`${report.slug}: invalid correction target`);
    for (const id of report.news_ids) {
      const news = newsMap.get(id);
      if (!news || news.published_at < report.period_start || news.published_at > report.through_date) throw new Error(`${report.slug}: news ${id} outside covered interval`);
    }
  }
  return data;
}
export type ObservatoryData = ReturnType<typeof loadData>;
let cached: ObservatoryData | undefined;
export function getData(): ObservatoryData {
  // Same build cache / development refresh convention as hammer/labs.
  if (import.meta.env?.DEV) cached = undefined;
  return cached ??= loadData();
}
