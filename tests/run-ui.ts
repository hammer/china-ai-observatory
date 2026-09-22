import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { spawn } from 'node:child_process';
const root=resolve('dist');
const types:Record<string,string>={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
  try {
    let file=resolve(root,'.'+decodeURIComponent(new URL(req.url!,'http://localhost').pathname));
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    if((await stat(file)).isDirectory()) file=resolve(file,'index.html');
    res.setHeader('Content-Type',types[extname(file)]??'application/octet-stream');res.end(await readFile(file));
  } catch {res.writeHead(404);res.end('Not found');}
});
await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));
const address=server.address() as {port:number};
try {
  // Independent suites have separate browser processes and share only static files.
  // Wait for both to finish before closing the server, even if one fails.
  const results=await Promise.allSettled(['filter-smoke.ts','mobile-smoke.ts'].map(script=>new Promise<void>((resolve,reject)=>{
    const proc=spawn(process.execPath,['--import','tsx',`tests/${script}`],{stdio:'inherit',env:{...process.env,TEST_BASE_URL:`http://127.0.0.1:${address.port}`}});
    proc.on('error',reject);proc.on('exit',code=>code===0?resolve():reject(new Error(`${script} exited ${code}`)));
  })));
  const failure=results.find(result=>result.status==='rejected');
  if(failure?.status==='rejected') throw failure.reason;
} finally {server.close();}
