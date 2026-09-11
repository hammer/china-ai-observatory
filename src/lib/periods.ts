import { cadenceSchema, date, type Cadence } from '../schema';
const iso = (d: Date) => d.toISOString().slice(0,10);
export function completePeriod(cadence: Cadence, asOf: string) {
  cadenceSchema.parse(cadence); date.parse(asOf);
  const now = new Date(asOf + 'T00:00:00Z');
  let start: Date, end: Date;
  if (cadence === 'weekly') {
    const thisMonday = new Date(+now - ((now.getUTCDay()+6)%7)*86400000);
    start = new Date(+thisMonday - 7*86400000); end = new Date(+thisMonday - 86400000);
  } else {
    const span = cadence === 'monthly' ? 1 : 3;
    const month = cadence === 'monthly' ? now.getUTCMonth() : Math.floor(now.getUTCMonth()/3)*3;
    start = new Date(Date.UTC(now.getUTCFullYear(),month-span,1));
    end = new Date(Date.UTC(now.getUTCFullYear(),month,0));
  }
  return { slug: `${cadence}-${iso(start)}-complete`, cadence, period_start: iso(start), period_end: iso(end), through_date: iso(end) };
}
