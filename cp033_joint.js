/* CP-033 v0.2: deterministic joint-frequency CORE/SAT search. No implied bookmaker odds. */
(function(g){'use strict';
function build(rows,markets,settle,cutoff,options={}){
 const minSample=options.minSample??20,coreSize=options.coreSize??3,satCount=options.satCount??3;
 const maxCandidates=options.maxCandidates??40,beamWidth=options.beamWidth??100;
 if(!Number.isInteger(coreSize)||coreSize<2||coreSize>4||!Number.isInteger(satCount)||satCount<0||satCount>3)throw Error('Invalid CORE/SAT size');
 const valid=rows.filter(r=>String(r.Date)<String(cutoff));
 const evaluated=markets.map(m=>valid.map(r=>settle(r,m.id)));
 const individual=markets.map((m,i)=>{let n=0,hits=0;for(const x of evaluated[i])if(x!==null&&x!==undefined){n++;if(x===true)hits++;}return {id:m.id,index:i,n,hits,frequency:n?hits/n:null};});
 const eligible=individual.filter(x=>x.n>=minSample).sort((a,b)=>b.frequency-a.frequency||b.n-a.n||a.id.localeCompare(b.id)).slice(0,maxCandidates);
 const conflicts=options.conflicts||((a,b)=>a.group&&b.group&&a.group===b.group);
 const odds=options.verifiedJointOdds||{};
 function evaluate(indices){
  let n=0,hits=0;
  for(let k=0;k<valid.length;k++){
   if(indices.some(i=>evaluated[i][k]===null||evaluated[i][k]===undefined))continue;
   n++;if(indices.every(i=>evaluated[i][k]===true))hits++;
  }
  const frequency=n?hits/n:null;
  const ids=indices.map(i=>markets[i].id),key=ids.slice().sort().join('|');
  const quote=odds[key],price=quote&&quote.verified===true&&Number.isFinite(Number(quote.odds))&&Number(quote.odds)>1?Number(quote.odds):null;
  return {ids,n,hits,frequency,verifiedJointOdds:price,ev:frequency!==null&&price!==null?frequency*price-1:null};
 }
 function cmp(a,b){
  if(a.ev!==null&&b.ev!==null&&a.ev!==b.ev)return b.ev-a.ev;
  if((a.ev===null)!==(b.ev===null))return a.ev===null?1:-1;
  return b.frequency-a.frequency||b.n-a.n||a.ids.join('|').localeCompare(b.ids.join('|'));
 }
 let beam=[{indices:[],ids:[],n:0,hits:0,frequency:1,ev:null}],stages=[],examined=0;
 const depthLimit=coreSize+satCount;
 for(let depth=1;depth<=depthLimit;depth++){
  const next=[];
  for(const parent of beam)for(const candidate of eligible){
   const i=candidate.index;
   if(parent.indices.includes(i))continue;
   if(parent.indices.some(j=>conflicts(markets[j],markets[i])))continue;
   const indices=[...parent.indices,i].sort((a,b)=>markets[a].id.localeCompare(markets[b].id));
   const result=evaluate(indices);examined++;
   if(result.n<minSample)continue;
   next.push({...result,indices});
  }
  const unique=new Map();
  for(const x of next){const key=x.ids.join('|');const prev=unique.get(key);if(!prev||cmp(x,prev)<0)unique.set(key,x);}
  const ranked=[...unique.values()].sort(cmp);
  if(!ranked.length)return {version:'CP033_V0_2',status:'NO_ADMISSIBLE_CHAIN',depth,stages,examined};
  const best=ranked[0];stages.push({depth,...best,indices:undefined});
  beam=ranked.slice(0,beamWidth);
 }
 const core=stages[coreSize-1],sat=stages.slice(coreSize,coreSize+satCount);
 return {version:'CP033_V0_2',status:'EXPERIMENTAL_JOINT_SEARCH',core,sat,stages,examined,optimalityProven:false,frequencyType:'historical_joint',priceRequirement:'verified_joint_quote'};
}
g.RadarCP033Joint={build};
})(typeof window!=='undefined'?window:globalThis);
