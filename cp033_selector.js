/* CP-033 v0.1 — núcleo determinista de evaluación individual, sin sustituir CP-032. */
(function(g){'use strict';
function score(rows,market,settle,cutoff,quote){
 if(typeof settle!=='function')throw Error('settle requerido');
 const eligible=rows.filter(r=>String(r.Date)<String(cutoff));
 let n=0,hits=0;
 for(const r of eligible){const x=settle(r,market.id);if(x===null||x===undefined)continue;n++;if(x===true)hits++;}
 const frequency=n?hits/n:null;
 const odds=quote&&quote.verified===true&&Number.isFinite(Number(quote.odds))&&Number(quote.odds)>1?Number(quote.odds):null;
 return {id:market.id,n,hits,frequency,breakEvenOdds:frequency>0?1/frequency:null,verifiedOdds:odds,ev:frequency!==null&&odds!==null?frequency*odds-1:null};
}
function rank(candidates,{minSample=20}={}){
 return candidates.filter(x=>x.n>=minSample&&x.frequency!==null).slice().sort((a,b)=>{
  const ae=a.ev,be=b.ev;
  if(ae!==null&&be!==null&&ae!==be)return be-ae;
  // No mezclar EV calculado y no calculado como si fueran magnitudes comparables.
  if((ae===null)!==(be===null))return ae===null?1:-1;
  return b.frequency-a.frequency||b.n-a.n||a.id.localeCompare(b.id);
 });
}
function selectAlternatives(rows,markets,settle,cutoff,quotes={},options={}){
 const scored=markets.map(m=>score(rows,m,settle,cutoff,quotes[m.id]));
 const groups=new Map();
 for(const s of scored){
  const market=markets.find(m=>m.id===s.id);
  const group=market.redundancyGroup||market.group||s.id;
  if(!groups.has(group))groups.set(group,[]);
  groups.get(group).push(s);
 }
 const selected=[],discarded=[];
 for(const [group,items] of groups){
  const ranked=rank(items,options);
  if(!ranked.length){discarded.push(...items.map(x=>({...x,reason:'INSUFFICIENT_SAMPLE'})));continue;}
  selected.push({...ranked[0],group});
  discarded.push(...items.filter(x=>x.id!==ranked[0].id).map(x=>({...x,reason:'ALTERNATIVE_NOT_SELECTED',group})));
 }
 return {version:'CP033_V0_1',status:'INDIVIDUAL_RANKING_ONLY',selected:rank(selected,{minSample:options.minSample??20}),discarded,scored};
}
g.RadarCP033={score,rank,selectAlternatives};
})(typeof window!=='undefined'?window:globalThis);
