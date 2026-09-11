import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse,serialize,rowMatches,effectiveState } from '../src/lib/filters/state';
import type { FilterDimension } from '../src/lib/filters/types';
const dims: FilterDimension[]=[
  {key:'layer',label:'Layer',kind:'multi',rowAttr:'layers',options:[{slug:'memory',label:'Memory',count:2},{slug:'accelerators',label:'Accelerators',count:2}]},
  {key:'stage',label:'Stage',kind:'single',rowAttr:'stage',options:[{slug:'Commercial',label:'Commercial',count:2}]},
  {key:'peak',label:'Peak',kind:'range',rowAttr:'peak'},
];
test('shared filters combine OR within dimensions and AND across them',()=>{
  const state=parse(new URLSearchParams('layer=memory,accelerators&stage=Commercial&peak=1-3'),dims);
  assert.ok(rowMatches({layers:'networking,memory',stage:'Commercial',peak:'2'},state,dims));
  assert.ok(!rowMatches({layers:'memory',stage:'Research',peak:'2'},state,dims));
  assert.ok(!rowMatches({layers:'memory',stage:'Commercial'},state,dims));
  assert.ok(!rowMatches({layers:'memory',stage:'Commercial',peak:'Infinity'},state,dims));
  assert.equal(serialize(parse(serialize(state,dims),dims),dims).toString(),serialize(state,dims).toString());
});
test('unknown options are discarded and out-of-scope dimensions are suspended',()=>{
  const scoped: FilterDimension[]=[...dims,{key:'hbm',label:'HBM',kind:'range',rowAttr:'hbm',visibleWhen:{dim:'layer',values:['memory']}}];
  const state=parse(new URLSearchParams('layer=accelerators,unknown&hbm=8-'),scoped);
  assert.equal(serialize(effectiveState(state,scoped),scoped).toString(),'layer=accelerators');
});
