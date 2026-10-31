/* Run node tests/cp033_semantic_regression.js — full 139-market pair sweep. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),ctx={RadarBrowserEngine:{date:x=>x,norm:x=>String(x).toLowerCase()}};
ctx.globalThis=ctx;ctx.window=ctx;vm.createContext(ctx);
for(const f of ['catalog_mobile.js','cp033_semantic.js','cp033_joint.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
const raw=JSON.parse(fs.readFileSync(path.join(root,'catalog139.json'),'utf8'));
const markets=Array.isArray(raw)?raw:raw.markets,settle=ctx.RadarMobileCatalog.settle,conflict=ctx.RadarCP033Semantic.conflict;
assert.equal(markets.length,139);
let blocked=0,allowed=0;
for(let i=0;i<markets.length;i++)for(let j=i+1;j<markets.length;j++)conflict(markets[i],markets[j],settle)?blocked++:allowed++;
assert.equal(blocked+allowed,9591);
for(const [a,b,want] of [['GG1p5','GG2p5',true],['W_H','W_HD',true],['BTTS_Y','BTTS_N',true],['GG1p5','CG8p5',false],['W_H','CG8p5',false]])assert.equal(conflict({id:a},{id:b},settle),want,a+' '+b);
const rows=Array.from({length:120},(_,i)=>({Date:'2026-01-01',FTHG:i%5,FTAG:i%4,HTHG:i%3,HTAG:i%2,HS:7+i%13,AS:8+i%9,HST:1+i%5,AST:1+i%4,HF:9+i%10,AF:10+i%8,HC:2+i%9,AC:2+i%7,HY:i%4,AY:i%3}));
const result=ctx.RadarCP033Joint.build(rows,markets,settle,'2026-02-01',{minSample:20,coreSize:3,satCount:3});
assert.equal(result.status,'EXPERIMENTAL_JOINT_SEARCH');
for(const stage of result.stages)for(let i=0;i<stage.ids.length;i++)for(let j=i+1;j<stage.ids.length;j++)assert.equal(conflict({id:stage.ids[i]},{id:stage.ids[j]},settle),false);
console.log(JSON.stringify({status:'PASS',markets:139,pairs:blocked+allowed,blocked,allowed,core:result.core.ids,sat:result.sat.map(x=>x.ids)}));
