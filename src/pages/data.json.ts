import { getData } from '../data/loader';
export function GET() { return new Response(JSON.stringify(getData()), { headers: { 'Content-Type': 'application/json; charset=utf-8' } }); }
