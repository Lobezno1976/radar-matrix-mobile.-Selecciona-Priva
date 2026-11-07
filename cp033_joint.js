/* CP-033 v0.2: deterministic joint-frequency CORE/SAT search. No implied bookmaker odds. */
(function(g){'use strict';
function build(rows,markets,settle,cutoff,options={}){
 const minSample=options.minSample??20,coreSize=options.coreSize??3,satCount=options.satCount??3;
 const maxCandidates=options.maxCandidates??40,beamWidth=options.beamWidth??100;
 if(!Number.isInteger(coreSize)||coreSize<2||coreSize>4||!Number.isInteger(satCount)||satCount<0||satCount>3)throw Error('Invalid CORE/SAT size');
 const valid=rows.filter(r=>String(r.Date)<String(cutoff));
 const evaluated=markets.map(m=>valid.map(r=>settle(r,m.id)));
 const individual=markets.map((m,i)=>{let n=0,hits=0;for(const x of evaluated[i])if(x!==null&&x!==undefined){n++;if(x===true)hits++;}return {id:m.id,index:i,n,hits,frequency:n?hits/n:null};});
 const rankedAll=individual.filter(x=>x.n>=minSample).sort((a,b)=>b.frequency-a.frequency||b.n-a.n||a.id.localeCompare(b.id));
 const minTheoreticalOdds=options.minTheoreticalOdds??1.125;
 const priceEligible=rankedAll.filter(x=>x.frequency>0&&1/x.frequency+1e-12>=minTheoreticalOdds);
 const family=id=>id.startsWith('BTTS')?'BTTS':id.startsWith('W_')?'RESULTADO':id.startsWith('WC_')?'CORNERS_RESULTADO':id.startsWith('WT_')?'TARJETAS_RESULTADO':id.startsWith('GO')?'GOLES_PERIODOS':({S:'TIROS_PUERTA',R:'REMATES',F:'FALTAS',C:'CORNERS',T:'TARJETAS',G:'GOLES'}[id[0]]||'OTROS');
 const families={};for(const x of individual){const f=family(x.id),v=families[f]??={total:0,eligible:0,withoutData:0};v.total++;if(x.n>=minSample)v.eligible++;if(!x.n)v.withoutData++}
 // Compare neighboring thresholds BEFORE selecting the candidate pool.
 // Over: +1/+2; under: -1/-2. Never add both as separate legs.
 const parseLine=id=>{const m=/^([A-Z]+)(\d+)p5$/.exec(id);return m?{prefix:m[1],step:Number(m[2]),over:m[1].endsWith('G')}:null};
 const byId=new Map(priceEligible.map(x=>[x.id,x]));
 const axes=new Map();
 for(const x of priceEligible){const p=parseLine(x.id);if(!p)continue;const axis=p.prefix.replace(/[GL]$/,'');const key=axis+':'+(p.prefix.length===2?'total':p.prefix.includes('H')?'home':'away');if(!axes.has(key))axes.set(key,[]);axes.get(key).push({...x,line:p});}
 const minimumRetention=options.lineRetention??0.70;
 const selected=new Map(),lineComparisons=[];
 for(const [axis,items] of axes){
   const ranked=items.slice().sort((a,b)=>b.frequency-a.frequency||a.id.localeCompare(b.id));
   const baseline=ranked[0];if(!baseline)continue;
   const p=baseline.line;const tests=[baseline];
   for(const delta of [1,2]){
     const id=p.prefix+(p.step+(p.over?delta:-delta))+'p5';
     const candidate=byId.get(id);
     if(candidate)tests.push({...candidate,line:parseLine(id)});
   }
   const admissible=tests.filter(x=>x.n>=minSample&&x.frequency>=baseline.frequency*minimumRetention);
   const winner=admissible.sort((a,b)=>Math.abs(b.line.step-p.step)-Math.abs(a.line.step-p.step)||b.frequency-a.frequency)[0]||baseline;
   selected.set(winner.id,winner);
   lineComparisons.push({axis,baseline:baseline.id,selected:winner.id,options:tests.map(x=>({id:x.id,n:x.n,frequency:x.frequency})),retention:minimumRetention});
 }
 // Keep all special markets, plus the selected threshold for each numerical axis.
 for(const x of priceEligible)if(!parseLine(x.id))selected.set(x.id,x);
 const linePool=[...selected.values()].sort((a,b)=>b.frequency-a.frequency||b.n-a.n||a.id.localeCompare(b.id));
 let eligible;
 if(options.diversifyFamilies===true){
  const perFamily=new Map(),pool=[];
  for(const x of linePool){const f=family(x.id),used=perFamily.get(f)||0;if(used>=Math.max(2,Math.ceil(maxCandidates/10)))continue;pool.push(x);perFamily.set(f,used+1)}
  eligible=pool.slice(0,maxCandidates);
  const chosen=new Set(eligible.map(x=>x.id));
  for(const x of linePool){if(eligible.length>=maxCandidates)break;if(!chosen.has(x.id)){eligible.push(x);chosen.add(x.id)}}
 }else eligible=linePool.slice(0,maxCandidates);
 const audit={minTheoreticalOdds,excludedByTheoreticalOdds:rankedAll.length-priceEligible.length,priceEligibleCount:priceEligible.length,catalogCount:markets.length,evaluatedCount:individual.length,eligibleCount:rankedAll.length,candidateCount:eligible.length,excludedBySample:individual.length-rankedAll.length,excludedByCandidateLimit:rankedAll.length-eligible.length,families,lineSelection:'NEIGHBOR_PLUS_MINUS_1_2_BEFORE_BEAM',lineRetention:minimumRetention,lineComparisons,diversified:options.diversifyFamilies===true,diversityRule:options.diversifyFamilies===true?'CORE_ONE_PER_FAMILY_AND_MAX_TWO_PER_CHAIN':'NONE'};
 const conflicts=options.conflicts||(g.RadarCP033Semantic?((a,b)=>g.RadarCP033Semantic.conflict(a,b,settle)):null);
 if(!conflicts)throw Error('CP033 semantic module not loaded');
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
 const depthLimit=options.compareCoreSizes===false?coreSize:4;
 for(let depth=1;depth<=depthLimit;depth++){
  const next=[];
  for(const parent of beam)for(const candidate of eligible){
   const i=candidate.index;
   if(parent.indices.includes(i))continue;
   if(parent.indices.some(j=>conflicts(markets[j],markets[i])))continue;
   if(options.diversifyFamilies===true){const counts={};for(const j of parent.indices){const f=family(markets[j].id);counts[f]=(counts[f]||0)+1;}const f=family(markets[i].id);if((counts[f]||0)>=1&&depth<=coreSize)continue;if((counts[f]||0)>=2)continue;}
   const indices=[...parent.indices,i].sort((a,b)=>markets[a].id.localeCompare(markets[b].id));
   const result=evaluate(indices);examined++;
   if(result.n<minSample)continue;
   next.push({...result,indices});
  }
  const unique=new Map();
  for(const x of next){const key=x.ids.join('|');const prev=unique.get(key);if(!prev||cmp(x,prev)<0)unique.set(key,x);}
  const ranked=[...unique.values()].sort(cmp);
  if(!ranked.length){if(depth<=2)return {version:'CP033_V0_2',status:'NO_ADMISSIBLE_CHAIN',depth,stages,examined,audit};break;}
  const best=ranked[0];stages.push({depth,...best,indices:undefined});
  beam=ranked.slice(0,beamWidth);
 }
 // Compare complete CORE depths 2..4 instead of forcing one size.
 const coreOptions=stages.filter(x=>x.depth>=2).map(x=>{
   const independent=x.ids.reduce((p,id)=>p*(individual.find(v=>v.id===id)?.frequency??0),1);
   const sensitivity=x.ids.map(removed=>{
     const kept=x.ids.filter(id=>id!==removed);
     const result=evaluate(kept.map(id=>markets.findIndex(m=>m.id===id)));
     return {removed,remainingIds:kept,hits:result.hits,n:result.n,frequency:result.frequency,
       frequencyGain:result.frequency===null||x.frequency===null?null:result.frequency-x.frequency};
   });
   return {...x,independenceProduct:independent,independenceGap:x.frequency-independent,
     breakEvenOdds:x.frequency>0?1/x.frequency:null,removalSensitivity:sensitivity};
 });
 // Verified prices determine economic ranking; otherwise compare observed frequencies only.
 coreOptions.sort((a,b)=>cmp(a,b));
 const core=coreOptions[0],sat=[];
 // SAT branches are independent extensions of the same frozen CORE.
 if(core&&satCount){
  const coreIds=new Set(core.ids),coreIndices=core.ids.map(id=>markets.findIndex(m=>m.id===id));
  const extensions=[];
  for(const candidate of eligible){
   if(coreIds.has(candidate.id))continue;
   if(coreIndices.some(j=>conflicts(markets[j],markets[candidate.index])))continue;
   if(options.diversifyFamilies===true){
    const counts={};for(const j of coreIndices){const f=family(markets[j].id);counts[f]=(counts[f]||0)+1;}
    if((counts[family(candidate.id)]||0)>=2)continue;
   }
   const result=evaluate([...coreIndices,candidate.index]);examined++;
   if(result.n>=minSample)extensions.push(result);
  }
  extensions.sort(cmp);
  const seenFamilies=new Set();
  for(const ext of extensions){
   const extra=ext.ids.find(id=>!coreIds.has(id)),f=family(extra);
   if(seenFamilies.has(f))continue;
   sat.push(ext);seenFamilies.add(f);
   if(sat.length===satCount)break;
  }
 }

 return {version:'CP033_V0_2',status:'EXPERIMENTAL_JOINT_SEARCH',satStructure:'INDEPENDENT_CORE_PLUS_ONE',core,coreOptions,sat,stages,examined,audit,optimalityProven:false,frequencyType:'historical_joint',priceRequirement:'verified_joint_quote'};
}
function preselect(rows,markets,settle,cutoff,options={}){
 const valid=rows.filter(r=>String(r.Date)<String(cutoff)),minimum=options.minTheoreticalOdds??1.125,retention=options.lineRetention??0.70;
 const eligible=markets.map(m=>{let n=0,hits=0;for(const r of valid){const v=settle(r,m.id);if(v===null||v===undefined)continue;n++;if(v)hits++;}return {id:m.id,n,frequency:n?hits/n:0};}).filter(x=>x.n>=(options.minSample??20)&&x.frequency>0&&1/x.frequency+1e-12>=minimum);
 const byId=new Map(eligible.map(x=>[x.id,x])),groups=new Map(),selected=[];
 for(const x of eligible){const m=/^([A-Z]+)(\d+)p5$/.exec(x.id);if(!m){selected.push(x);continue}const key=m[1];if(!groups.has(key))groups.set(key,[]);groups.get(key).push(x)}
 for(const [prefix,items] of groups){items.sort((a,b)=>b.frequency-a.frequency);const base=items[0],p=/^(.*?)(\d+)p5$/.exec(base.id),step=Number(p[2]),over=prefix.endsWith('G');const candidates=[base,...[1,2].map(d=>byId.get(prefix+(step+(over?d:-d))+'p5')).filter(Boolean)];const acceptable=candidates.filter(x=>x.frequency>=base.frequency*retention);selected.push(acceptable[acceptable.length-1]||base)}
 return selected.sort((a,b)=>b.frequency-a.frequency).slice(0,options.maxCandidates??40);
}
g.RadarCP033Joint={build,preselect};
})(typeof window!=='undefined'?window:globalThis);
