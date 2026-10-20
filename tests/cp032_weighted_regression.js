/* Run: node tests/cp032_weighted_regression.js
   Deterministic synthetic regression; private historical dataset is not published. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const context={console,globalThis:null};
context.globalThis=context;context.window=context;
context.RadarBrowserEngine={date:x=>x,norm:x=>String(x).toLowerCase()};
vm.createContext(context);
for(const f of ['weight_policy_cp032.js','bidirectional_selector.js','catalog_mobile.js'])
 vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context,{filename:f});
const policy=context.RadarWeightPolicy,cat=context.RadarMobileCatalog;
assert.equal(policy.season('15/08/2025'),2025);
assert.equal(policy.season('2026-02-10'),2025);
const a=[{Date:'10/10/2025',v:1},{Date:'11/10/2025',v:0},{Date:'20/10/2025',v:1}];
assert.equal(policy.filtered(a,'2025-10-19').length,2);
const p=policy.score(a,{id:'x'},[],r=>!!r.v,'2025-10-19','raw');
assert.equal(p.frequency,.5);
const rows=[];
for(let year=2018;year<=2025;year++)for(let i=0;i<38;i++){
 const date=year+'-'+String(8+Math.floor(i/10)).padStart(2,'0')+'-'+String(i%10+1).padStart(2,'0');
 rows.push({Date:date,HomeTeam:'A',AwayTeam:'B',FTHG:i%3,FTAG:i%2,HTHG:0,HTAG:0,HS:7+i%13,AS:8+i%9,HST:1+i%5,AST:1+i%4,HF:9+i%10,AF:10+i%8,HC:2+i%9,AC:2+i%7,HY:i%4,AY:i%3});
}
const markets=['GG0p5','GL5p5','CG0p5','CL30p5','TG0p5','TL15p5','RG0p5','RL80p5','SG0p5','SL30p5','FG0p5','FL80p5','BTTS_Y','W_HD','W_DA'].map(id=>({id}));
const legacy=cat.select(rows,'A','B','2026-01-01',markets,{useWeights:false,minTrain:10,minTest:3,width:20});
const weighted=cat.select(rows,'A','B','2026-01-01',markets,{useWeights:true,minTrain:10,minTest:3,width:20});
for(const [label,result] of [['legacy',legacy],['weighted',weighted]]){
 assert.equal(result.variants.length,4,label);
 assert.deepEqual(Array.from(result.variants,v=>v.legs.length),[3,4,5,6],label);
 assert.deepEqual(Array.from(result.variants,v=>v.name),['CORE','SAT1','SAT2','SAT3'],label);
 assert.equal(result.variants.every(v=>v.train_by_context.length===2&&v.holdout_by_context.length===2),true,label);
}
assert.equal(legacy.weighting_applied,false);
assert.equal(weighted.weighting_applied,true);
assert.equal(policy.recalibrationStatus(Array.from({length:190},()=>({Date:'10/10/2025'})),'2025-10-19').midseasonDue,true);
assert.equal(policy.recalibrationStatus(rows,'2025-10-19').applied,false);
console.log('CP-032 regression: PASS (synthetic, 4 variants, date cutoff, legacy fallback)');
