import { execFileSync } from 'node:child_process';
import { parse } from 'yaml';
export interface FieldChange { field: string; before: string; after: string }
export interface FileChange { path: string; status: string; title: string; fields: FieldChange[] }
export interface Change { sha: string; date: string; subject: string; files: FileChange[] }
function flat(value: any, prefix='', output: Record<string,string>={}): Record<string,string> {
  if (Array.isArray(value)) output[prefix]=JSON.stringify(value);
  else if(value && typeof value==='object') for(const [k,v] of Object.entries(value)) flat(v,prefix?`${prefix}.${k}`:k,output);
  else output[prefix]=value==null?'—':String(value);
  return output;
}
export function fieldChanges(before: unknown, after: unknown): FieldChange[] {
  const a=flat(before),b=flat(after);
  return [...new Set([...Object.keys(a),...Object.keys(b)])].filter(k=>a[k]!==b[k]).map(field=>({field,before:a[field]??'—',after:b[field]??'—'}));
}
export function getChanges(cwd=process.cwd()): Change[] {
  const git=(args:string[])=>execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:8*1024*1024});
  let log:string; try {log=git(['log','-40','--format=%H%x09%cs%x09%s','--','data/']);} catch{return [];}
  const commits=log.trim().split('\n').filter(Boolean).map(line=>{
    const [sha,date,...subjectParts]=line.split('\t');
    const files=git(['diff-tree','--root','--no-commit-id','--name-status','-r',sha!,'--','data/']).trim().split('\n').filter(Boolean).map(row=>{
      const [status,path]=row.split('\t');
      return {path:path!,status:status!};
    });
    return {sha:sha!,date:date!,subject:subjectParts.join('\t'),files};
  });
  const refs=commits.flatMap(c=>c.files.flatMap(f=>[`${c.sha}^:${f.path}`,`${c.sha}:${f.path}`]));
  if(!refs.length) return commits.map(c=>({...c,files:[]}));
  // One process reads all snapshots instead of two git-show processes per file.
  // Batch sizes are byte counts, so decode YAML only after slicing the Buffer.
  const batch=execFileSync('git',['cat-file','--batch'],{cwd,input:refs.join('\n')+'\n',stdio:['pipe','pipe','pipe'],maxBuffer:32*1024*1024});
  const snapshots=new Map<string,any>();
  const parsed=new Map<string,any>();
  let offset=0;
  for(const ref of refs) {
    const end=batch.indexOf(10,offset);
    if(end<0) throw new Error('Incomplete Git snapshot response');
    const header=batch.subarray(offset,end).toString('utf8');offset=end+1;
    if(header.endsWith(' missing')) {snapshots.set(ref,null);continue;}
    const match=/^([a-f0-9]+) blob (\d+)$/.exec(header);
    if(!match) throw new Error('Unexpected Git snapshot response');
    const [,object,sizeText]=match;const size=Number(sizeText);
    if(offset+size>=batch.length||batch[offset+size]!==10) throw new Error('Incomplete Git snapshot contents');
    if(!parsed.has(object!)) {
      try {parsed.set(object!,parse(batch.subarray(offset,offset+size).toString('utf8')));}catch{parsed.set(object!,null);}
    }
    snapshots.set(ref,parsed.get(object!));offset+=size+1;
  }
  return commits.map(c=>({...c,files:c.files.map(f=>{
    const before=snapshots.get(`${c.sha}^:${f.path}`),after=snapshots.get(`${c.sha}:${f.path}`);
    return {...f,title:after?.name??after?.title??before?.name??before?.title??f.path,fields:f.status==='M'?fieldChanges(before,after):[]};
  })}));
}
