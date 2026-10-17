/* RADAR Matrix v15 DIVERSITY SHADOW. No changes to canonical selector. */
(function(g){'use strict';
const FAMILY=id=>id.startsWith('BTTS')?'BTTS':id.startsWith('WC_')?'CORNERS_RESULT':id.startsWith('WT_')?'CARDS_RESULT':id.startsWith('W_')?'RESULT':/^(GO[12])/.test(id)?'GOALS_HALF':({S:'SHOTS_ON_TARGET',R:'SHOTS',F:'FOULS',C:'CORNERS',T:'CARDS',G:'GOALS'})[id[0]]||'OTHER';
function search(rows,home,away,cutoff,markets,options={}){
 const norm=g.RadarBrowserEngine.norm,date=g.RadarBrowserEngine.date,settle=g.RadarMobileCatalog.settle;
 if(!Array.isArray(markets)||markets.length!==139||new Set(markets.map(m=>m.id)).size!==139)throw Error('Se requieren los 139 mercados únicos');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(cutoff))throw Error('Fecha de corte inválida');
 if(!home||!away||norm(home)===norm(away))throw Error('Equipos no válidos');
 const pools=[rows.filter(r=>date(r.Date)&&date(r.Date)<cutoff&&norm(r.HomeTeam)===norm(home)),rows.filter(r=>date(r.Date)&&date(r.Date)<cutoff&&norm(r.AwayTeam)===norm(away))].map(a=>a.sort((x,y)=>date(x.Date).localeCompare(date(y.Date))));
 const parts=pools.map(p=>{const n=Math.floor(p.length*.8);return [p.slice(0,n),p.slice(n)]});
 const minTrain=options.minTrain??15,minTest=options.minTest??5,minCoverage=.8,width=options.width??50;
 if(parts.some(([a,b])=>a.length<minTrain||b.length<minTest))return {status:'INSUFFICIENT_CONTEXT_ROWS',counts:parts.map(p=>p.map(x=>x.length))};
 const train=parts.map(p=>p[0].map(r=>markets.map(m=>settle(r,m.id))));
 const test=parts.map(p=>p[1].map(r=>markets.map(m=>settle(r,m.id))));
 function stats(seq,cohorts){return cohorts.map(rows=>{let n=0,hits=0;for(const row of rows){if(seq.some(i=>row[i]===null))continue;n++;if(seq.every(i=>row[i]===true))hits++}return {n,hits,rate:n?hits/n:null}})}
 function evaluate(seq){const tr=stats(seq,train);if(tr.some((s,i)=>s.n<minTrain||s.n<Math.ceil(train[i].length*minCoverage)))return null;return tr}
 // Reject logical implications and historical zero-increment legs on identical evaluable cohorts.
 function marginal(seq,idx){const all=[...seq,idx],newStats=evaluate(all);if(!newStats)return null;const old=stats(seq,train.map(rows=>rows.filter(row=>all.every(i=>row[i]!==null))));
  const drops=newStats.map((v,k)=>old[k].hits?1-v.hits/old[k].hits:0);
  if(old.some(x=>x.hits<5)||drops.some(d=>d<.025||d>.60))return null;
  return {newStats,drops};
 }
 function score(tr,drops,seq){const rates=tr.map(x=>x.rate),floor=Math.min(...rates),geo=Math.sqrt(rates[0]*rates[1]);const marginalMean=drops.reduce((a,b)=>a+b,0)/drops.length;
  const distinct=new Set(seq.map(i=>FAMILY(markets[i].id))).size;
  return geo*.52+floor*.18+marginalMean*.20+distinct/seq.length*.10;
 }
 let beam=[{seq:[],score:0}],scanned=0;const choices={};
 for(let depth=1;depth<=6;depth++){
  const next=[];
  for(const state of beam)for(let i=0;i<markets.length;i++){
   if(state.seq.includes(i))continue;
   const family=FAMILY(markets[i].id);
   // One market per family: prevents threshold nesting and very close substitutions.
   if(state.seq.some(j=>FAMILY(markets[j].id)===family))continue;
   const check=marginal(state.seq,i);if(!check)continue;
   const seq=[...state.seq,i],s=score(check.newStats,check.drops,seq);
   next.push({seq,score:s,train:check.newStats,drops:check.drops});scanned++;
  }
  next.sort((a,b)=>b.score-a.score||a.seq.join(',').localeCompare(b.seq.join(',')));
  // Keep diverse beams, not only permutations of identical market sets.
  const seen=new Set(),distinct=[];for(const x of next){const key=[...x.seq].sort((a,b)=>a-b).join(',');if(seen.has(key))continue;seen.add(key);distinct.push(x);if(distinct.length>=width)break;}
  beam=distinct;if(!beam.length)break;
  if(depth>=3){choices[depth]=beam.slice(0,5).map(x=>({ids:x.seq.map(i=>markets[i].id),labels:x.seq.map(i=>markets[i].label),train:x.train,holdout:stats(x.seq,test),lastMarginal:x.drops,score:x.score}));}
 }
 return {status:Object.keys(choices).length?'EXPLORATORY_SHADOW':'NO_ADMISSIBLE_DIVERSE_CHAIN',choices,scanned,counts:parts.map(p=>p.map(x=>x.length)),rules:{maxOneMarketPerFamily:true,minMarginalDrop:.025,maxMarginalDrop:.60,minCoverage,selection:'training_only',holdout:'display_only',odds:false,calibrated:false,globalOptimality:false}};
}
g.RadarDiversityV15={search,family:FAMILY};
})(typeof window!=='undefined'?window:globalThis);
