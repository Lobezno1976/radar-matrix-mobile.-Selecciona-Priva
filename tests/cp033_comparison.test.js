const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ctx={};ctx.window=ctx;
ctx.RadarBrowserEngine={norm:s=>String(s).toLowerCase(),date:s=>String(s).slice(0,10)};
ctx.RadarCP033Adapter={normalize:s=>String(s).toLowerCase()};
ctx.RadarMobileCatalog={settle:(r,id)=>id==='CG7p5'?(r.HC+r.AC)>7.5:id==='CL11p5'?(r.HC+r.AC)<11.5:null};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','cp033_comparison.js'),'utf8'),ctx);
const rows=[
 {Date:'2024-10-01',HomeTeam:'Valencia',AwayTeam:'Real Madrid',HC:5,AC:4},
 {Date:'2025-10-01',HomeTeam:'Valencia',AwayTeam:'Real Madrid',HC:2,AC:4},
 {Date:'2026-10-01',HomeTeam:'Valencia',AwayTeam:'Real Madrid',HC:6,AC:7},
 {Date:'2026-12-01',HomeTeam:'Valencia',AwayTeam:'Real Madrid',HC:0,AC:0}
];
const markets=[{id:'CG7p5',label:'Más de 7,5 córners'},{id:'CL11p5',label:'Menos de 11,5 córners'}];
const r=ctx.RadarCP033Comparison.compare(rows,'Valencia','Real Madrid','2026-11-07',markets,{'CG7p5':1.2});
assert.equal(r.length,2);assert.equal(r[0].stats.h2h.n,3);assert.equal(r[0].stats.h2h.hits,2);
assert.equal(r[1].stats.h2h.hits,2);assert.equal(r[0].stats.h2h3.n,3);
assert.ok(Math.abs(r[0].threshold-83.333333333)<0.0001);
assert.equal(r[0].status,'NO_SUPERA_UMBRAL');
assert.equal(r[1].status,'SIN_CUOTA');
const gate=ctx.RadarCP033Comparison.govern(rows,'Valencia','Real Madrid','2026-11-07',markets,{'CG7p5':1.2},{minLong:2,minRecent:2});
assert.equal(gate.markets.length,1);
assert.equal(gate.markets[0].id,'CL11p5');
const priced=ctx.RadarCP033Comparison.govern(rows,'Valencia','Real Madrid','2026-11-07',markets,{'CG7p5':1.2,'CL11p5':1.2},{minLong:2,minRecent:2});
assert.equal(priced.markets.length,0);
console.log('CP-033 comparison: PASS (20T, 3T, cutoff, real odds, no invented odds)');
