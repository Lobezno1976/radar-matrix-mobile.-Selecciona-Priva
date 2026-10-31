/* node tests/cp033_contract.js */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ctx={};ctx.globalThis=ctx;ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../cp033_selector.js'),'utf8'),ctx);
const engine=ctx.RadarCP033;
const rows=[{Date:'2026-01-01',v:2},{Date:'2026-01-02',v:1},{Date:'2026-01-03',v:2},{Date:'2026-02-01',v:9}];
const settle=(r,id)=>id==='A'?r.v>=1:id==='B'?r.v>=2:null;
const markets=[{id:'A',group:'same'},{id:'B',group:'same'}];
let x=engine.selectAlternatives(rows,markets,settle,'2026-01-31',{'A':{odds:1.1,verified:true},'B':{odds:2.0,verified:true}},{minSample:2});
assert.equal(x.selected[0].id,'B');assert.equal(x.selected[0].n,3);assert.equal(x.discarded.length,1);
x=engine.selectAlternatives(rows,markets,settle,'2026-01-31',{}, {minSample:2});
assert.equal(x.selected[0].id,'A');assert.equal(x.selected[0].ev,null);
assert.equal(engine.score(rows,{id:'A'},settle,'2026-01-31',{}).hits,3);
console.log('CP033 contract: PASS (synthetic, individual ranking only)');
