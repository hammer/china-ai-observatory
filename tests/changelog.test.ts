import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,mkdirSync,writeFileSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { getChanges } from '../src/lib/changelog';
test('changelog reads real additions and before/after data from Git, excluding prose-only commits',()=>{
  const cwd=mkdtempSync(join(tmpdir(),'observatory-history-'));
  const git=(...args:string[])=>execFileSync('git',args,{cwd,stdio:'pipe'});
  const commit=(message:string)=>{git('add','.');git('commit','-m',message);};
  try {
    git('init','-b','main');git('config','user.name','Test');git('config','user.email','test@example.invalid');
    mkdirSync(join(cwd,'data/companies'),{recursive:true});
    const file=join(cwd,'data/companies/example.yaml');
    writeFileSync(file,'name: Example\nkey_fact:\n  value: Prototype\n');commit('Record prototype');
    writeFileSync(file,'name: Example\nkey_fact:\n  value: Qualified delivery\n');commit('Record qualified delivery');
    writeFileSync(join(cwd,'README.md'),'Documentation update');commit('Update docs');
    const changes=getChanges(cwd);
    assert.equal(changes.length,2);assert.equal(changes[0]?.subject,'Record qualified delivery');
    assert.deepEqual(changes[0]?.files[0]?.fields,[{field:'key_fact.value',before:'Prototype',after:'Qualified delivery'}]);
    assert.equal(changes[1]?.files[0]?.status,'A');assert.equal(changes[1]?.files[0]?.title,'Example');
    assert.match(changes[0]!.sha,/^[0-9a-f]{40}$/);
  } finally {rmSync(cwd,{recursive:true,force:true});}
});
test('batched snapshots preserve UTF-8 boundaries, additions, deletions and missing parents',()=>{
  const cwd=mkdtempSync(join(tmpdir(),'observatory-unicode-history-'));
  const git=(...args:string[])=>execFileSync('git',args,{cwd,stdio:'pipe'});
  const commit=(message:string)=>{git('add','.');git('commit','-m',message);};
  try {
    git('init','-b','main');git('config','user.name','Test');git('config','user.email','test@example.invalid');
    mkdirSync(join(cwd,'data/companies'),{recursive:true});
    const first=join(cwd,'data/companies/first.yaml'),second=join(cwd,'data/companies/second.yaml');
    writeFileSync(first,'name: 中芯国际\nstatus: 原型\n');
    writeFileSync(second,'name: 华为\nstatus: 原型\n');commit('Initial records');
    writeFileSync(first,'name: 中芯国际\nstatus: 量产\n');
    rmSync(second);commit('Update and remove');
    const changes=getChanges(cwd);
    assert.equal(changes.length,2);
    assert.deepEqual(changes[0]!.files.map(f=>({title:f.title,status:f.status,fields:f.fields})),[
      {title:'中芯国际',status:'M',fields:[{field:'status',before:'原型',after:'量产'}]},
      {title:'华为',status:'D',fields:[]},
    ]);
    assert.deepEqual(changes[1]!.files.map(f=>({title:f.title,status:f.status})),[{title:'中芯国际',status:'A'},{title:'华为',status:'A'}]);
  } finally {rmSync(cwd,{recursive:true,force:true});}
});
