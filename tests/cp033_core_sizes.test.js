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
// Numeric lines must not appear as two legs on the same measurement axis.
const semantic={};semantic.window=semantic;
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','cp033_semantic.js'),'utf8'),semantic);
for(const [a,b] of [['CG7p5','CL11p5'],['SHG1p5','SHG2p5'],['GO1G0p5','GO1L1p5'],['GO2G0p5','GO2L2p5']]){
 assert.equal(semantic.RadarCP033Semantic.conflict({id:a},{id:b},()=>null),true,a+' / '+b);
}
assert.equal(semantic.RadarCP033Semantic.conflict({id:'GO1G0p5'},{id:'GO2G0p5'},()=>null),false);
const quantitative=['CG7p5','CL11p5','SG4p5','SL30p5','GO1G0p5','GO1L1p5'].map(id=>({id}));
const quantitativeRows=Array.from({length:40},(_,i)=>({Date:'2025-01-01',HC:4+i%7,AC:2+i%4,HS:8+i%5,AS:7+i%6,H1:1,A1:i%2}));
const settle=(row,id)=>{
 const m=/^([A-Z]+[0-9]*[GL])(\\d+)p5$/.exec(id);
 if(!m)return null;
 const values={C:row.HC+row.AC,S:row.HS+row.AS,GO1:row.H1+row.A1};
 const prefix=m[1],direction=prefix.slice(-1),axis=prefix.slice(0,-1);
 const value=values[axis];return value===undefined?null:direction==='G'?value>Number(m[2])+0.5:value<Number(m[2])+0.5;
};
const qr=ctx.RadarCP033Joint.build(quantitativeRows,quantitative,settle,'2026-11-07',{
 minSample:20,coreSize:3,satCount:0,minTheoreticalOdds:1,diversifyFamilies:false,
 conflicts:(a,b)=>semantic.RadarCP033Semantic.conflict(a,b,settle)
});
assert.equal(qr.status,'EXPERIMENTAL_JOINT_SEARCH');
for(const opt of qr.coreOptions)for(let i=0;i<opt.ids.length;i++)for(let j=i+1;j<opt.ids.length;j++)
 assert.equal(semantic.RadarCP033Semantic.conflict({id:opt.ids[i]},{id:opt.ids[j]},settle),false);
assert.ok(qr.audit.lineComparisons.some(x=>x.axis.startsWith('GO1')));
console.log('CP-033 CORE 2/3/4 + nonredundant quantitative lines regression PASS');
