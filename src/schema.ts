import { z } from 'zod';

export const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => {
  const d = new Date(v + 'T00:00:00Z');
  return Number.isFinite(d.valueOf()) && d.toISOString().slice(0, 10) === v;
}, 'Expected a real calendar date');
export const sourceIds = z.array(slug);
export const evidence = z.enum(['primary', 'reported', 'vendor', 'measured', 'standardized']);
const fact = z.object({ label: z.string().min(1), value: z.string().min(1), evidence, as_of: date, source_ids: sourceIds.min(1) }).strict();
export const companySchema = z.object({
  slug, name: z.string().min(1), chinese_name: z.string(), layers: z.array(slug).min(1), counterparts: z.array(z.string()),
  priority: z.number().int().min(1).max(3), stage: z.enum(['Commercial','Scaling','Development','Research']),
  role: z.string(), assessment: z.string(), key_fact: fact, facts: z.array(fact), watch_for: z.array(z.string()),
  source_ids: sourceIds.min(1), reviewed_at: date,
}).strict();
export const sourceSchema = z.object({
  slug, title: z.string().min(1), publisher: z.string(),
  url: z.string().url().refine(v => /^https?:\/\//.test(v), 'HTTP(S) sources only'),
  kind: z.enum(['primary','reporting','independent','vendor-study','standardized']),
  published_at: date.nullable(), reviewed_at: date,
}).strict();
export const layerSchema = z.object({ slug, name: z.string(), reference: z.string(), status: z.enum(['Bottleneck','Developing','Competitive']), assessment: z.string(), source_ids: sourceIds }).strict();
export const newsSchema = z.object({
  slug, published_at: date, event_date: date.nullable(), title: z.string(), summary: z.string(), impact: z.string(),
  companies: z.array(slug), source_ids: sourceIds.min(1), evidence, added_at: date, correction_of: slug.nullable(),
}).strict();
export const cadenceSchema = z.enum(['weekly','monthly','quarterly']);
export type Cadence = z.infer<typeof cadenceSchema>;
export const briefingSchema = z.object({
  slug, cadence: cadenceSchema, period_start: date, period_end: date, through_date: date, published_at: date,
  status: z.enum(['period-to-date','complete']), title: z.string(), summary: z.string(),
  sections: z.array(z.object({ heading: z.string(), body: z.string(), source_ids: sourceIds }).strict()).min(1),
  news_ids: z.array(slug), source_ids: sourceIds.min(1), coverage_note: z.string().min(1),
  correction_of: slug.optional(),
}).strict();
export const outputSchema = z.object({
  slug, type: z.literal('accelerator'), name: z.string(), vendor: z.string(), region: z.enum(['China','Outside China']),
  as_of: date, bf16_pflops: z.number().finite().positive(), hbm_tbps: z.number().finite().positive(),
  source_ids: sourceIds.min(1), note: z.string().min(1),
}).strict();
export const benchmarkSchema = z.object({
  headline: z.string(), assessment: z.string(), reviewed_at: date,
  comparison: z.object({ title: z.string(), date: z.string(), evidence, source_ids: sourceIds.min(1),
    rows: z.array(z.object({ metric: z.string(), china: z.string(), outside: z.string() }).strict()), caveats: z.string().min(1),
  }).strict(),
  studies: z.array(z.object({ title: z.string(), evidence, date: z.string(), finding: z.string(), source_ids: sourceIds.min(1) }).strict()),
}).strict();
export const overviewSchema = z.object({
  thesis: z.string(), description: z.string(), as_of: date,
  sovereignty: z.array(z.object({ title: z.string(), body: z.string() }).strict()),
  forecasts: z.array(z.object({ area: z.string(), horizon: z.string(), view: z.string(), confidence: z.string(), source_ids: sourceIds }).strict()),
  change_mind: z.array(z.string()),
}).strict();
export const stateSchema = z.object({
  schema_version: z.literal(2), baseline_date: date, last_research_at: date, last_automated_run_at: date.nullable(),
  last_run_status: z.enum(['baseline','updated','no-material-change','partial','failed']), coverage: z.string(), timezone: z.literal('Europe/London'),
  runs: z.array(z.object({ date, status: z.enum(['updated','no-material-change','partial','failed']), companies: z.array(slug), summary: z.string(), source_ids: sourceIds }).strict()),
}).strict();
export type Company = z.infer<typeof companySchema>;
export type Source = z.infer<typeof sourceSchema>;
export type News = z.infer<typeof newsSchema>;
export type Briefing = z.infer<typeof briefingSchema>;
export type Output = z.infer<typeof outputSchema>;
