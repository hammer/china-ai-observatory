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
  const content=(ref:string,path:string)=>{try{return parse(git(['show',`${ref}:${path}`]));}catch{return null;}};
  return log.trim().split('\n').filter(Boolean).map(line=>{
    const [sha,date,...subjectParts]=line.split('\t');
    const files=git(['diff-tree','--root','--no-commit-id','--name-status','-r',sha!,'--','data/']).trim().split('\n').filter(Boolean).map(row=>{
      const [status,path]=row.split('\t'); const before=content(`${sha}^`,path!); const after=content(sha!,path!);
      return {path:path!,status:status!,title:after?.name??after?.title??before?.name??before?.title??path!,fields:status==='M'?fieldChanges(before,after):[]};
    });
    return {sha:sha!,date:date!,subject:subjectParts.join('\t'),files};
  });
}
