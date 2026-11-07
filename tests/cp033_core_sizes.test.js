const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ctx={};ctx.window=ctx;
ctx.RadarCP033Semantic={conflict:(a,b)=>a.id===b.id};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','cp033_joint.js'),'utf8'),ctx);
const markets=['AA','BB','CC','DD'].map(id=>({id}));
const rows=Array.from({length:40},(_,i)=>({Date:'2025-01-01',AA:i<36,BB:i<32,CC:i<28,DD:i<24}));
const r=ctx.RadarCP033Joint.build(rows,markets,(row,id)=>row[id],'2026-11-07',{minSample:20,coreSize:3,satCount:0,minTheoreticalOdds:1,diversifyFamilies:false});
assert.equal(r.status,'EXPERIMENTAL_JOINT_SEARCH');
assert.deepEqual(Array.from(r.coreOptions.map(x=>x.ids.length)).sort(),[2,3,4]);
for(const x of r.coreOptions){assert.equal(x.n,40);assert.equal(x.removalSensitivity.length,x.ids.length);assert.ok(x.independenceProduct>=0&&x.independenceProduct<=1);assert.ok(Math.abs(x.breakEvenOdds-1/x.frequency)<1e-10);}
assert.equal(r.core.ids.length,2);
console.log('CP-033 CORE 2/3/4 regression PASS');
