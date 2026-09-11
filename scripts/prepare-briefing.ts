import { completePeriod } from '../src/lib/periods';
import { cadenceSchema } from '../src/schema';
import { loadData } from '../src/data/loader';
const args=process.argv.slice(2);
function value(key: string) { const index=args.indexOf(key); if(index<0 || !args[index+1]) throw new Error('Usage: npm run briefing -- --cadence weekly|monthly|quarterly --as-of YYYY-MM-DD'); return args[index+1]!; }
const data=loadData();
const period=completePeriod(cadenceSchema.parse(value('--cadence')),value('--as-of'));
const news=data.news.filter(n=>n.published_at>=period.period_start&&n.published_at<=period.period_end);
const sourceIds=new Set(news.flatMap(n=>n.source_ids));
console.log(JSON.stringify({...period,status:'complete',already_published:data.briefings.some(b=>b.cadence===period.cadence&&b.period_start===period.period_start&&b.status==='complete'),baseline_date:data.state.baseline_date,coverage_warning:period.period_start<data.state.baseline_date?'Period begins before systematic coverage. Research and disclose remaining gaps.':null,news,sources:data.sources.filter(s=>sourceIds.has(s.slug)),instruction:'Context only. Write a sourced synthesis; do not infer an uneventful industry from an empty archive.'},null,2));
