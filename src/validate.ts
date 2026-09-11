import { loadData } from './data/loader';
const data = loadData();
console.log(`Validated ${data.companies.length} companies, ${data.sources.length} sources, ${data.news.length} news events, ${data.outputs.length} outputs and ${data.briefings.length} briefings.`);
