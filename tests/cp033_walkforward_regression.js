/* CP-033: per-fixture chronological regression; no future data in training. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const g={RadarBrowserEngine:{date:x=>x,norm:x=>String(x).toLowerCase()}};
g.window=g;g.globalThis=g;vm.createContext(g);
for(const f of ['catalog_mobile.js','cp033_semantic.js','cp033_joint.js','cp033_adapter.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),g,{filename:f});
const markets=JSON.parse(fs.readFileSync(path.join(root,'catalog139.json'),'utf8'));
const rows=[];
for(let i=0;i<220;i++){
 const d=new Date(Date.UTC(2025,0,1+i)).toISOString().slice(0,10);
 rows.push({Date:d,HomeTeam:i%2?'Barcelona':'Real Madrid',AwayTeam:i%2?'Atlético':'Sevilla',
 FTHG:i%5,FTAG:i%3,HTHG:i%3,HTAG:i%2,HS:10+i%11,AS:8+i%9,HST:2+i%6,AST:1+i%5,
 HC:4+i%7,AC:3+i%6,HY:i%4,AY:i%3,HF:11+i%8,AF:10+i%9});
}
const checks=[];
for(const cutoff of ['2025-03-01','2025-05-01','2025-07-01']){
 const args=[rows,'Barcelona','Atlético',cutoff,markets,{minSample:10,coreSize:2,satCount:1}];
 const before=g.RadarCP033Adapter.run(...args);
 const future=rows.filter(r=>r.Date>=cutoff).map(r=>({...r,FTHG:90,FTAG:90,HS:90,AS:90,HC:90,AC:90}));
 const after=g.RadarCP033Adapter.run([...rows.filter(r=>r.Date<cutoff),...future],...args.slice(1));
 const shape=x=>JSON.stringify({status:x.status,context_rows:x.context_rows,variants:x.variants?.map(v=>({ids:v.legs.map(l=>l.id),n:v.joint_n,hits:v.joint_hits,f:v.joint_frequency}))});
 assert.equal(shape(before),shape(after),'future-data leakage at '+cutoff);
 assert.equal(before.context_rows,rows.filter(r=>r.Date<cutoff&&(r.HomeTeam==='Barcelona'||r.AwayTeam==='Atlético')).length);
 checks.push({cutoff,status:before.status,context_rows:before.context_rows});
}
console.log(JSON.stringify({status:'PASS',checks}));
