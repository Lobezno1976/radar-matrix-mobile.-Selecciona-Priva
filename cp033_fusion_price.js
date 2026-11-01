/* CP-033 FUSION experimental: price gate; no synthetic bookmaker quotes. */
(function(g){'use strict';
function ids(x){return [...new Set(x||[])].sort();}
function quote(q){return q&&q.verified===true&&Number.isFinite(q.odds)&&q.odds>1&&q.available===true?q.odds:null;}
function assess({core,pbase,union,frequencies={},quotes={},maxLegs=6}){
 const variants={CORE:ids(core),PBASE_V2:ids(pbase),FUSION:ids(union||[...core,...pbase])};
 const result={status:'EXPERIMENTAL_PRICE_COMPARISON',variants:{},bestVerified:null,reason:null};
 for(const [name,legs] of Object.entries(variants)){
  const key=legs.join('|'),p=frequencies[name],q=quote(quotes[key]);
  const valid=Number.isInteger(p?.hits)&&Number.isInteger(p?.n)&&p.n>0&&p.hits>=0&&p.hits<=p.n;
  const f=valid?p.hits/p.n:null;
  const permitted=legs.length<=maxLegs;
  result.variants[name]={legs,quote:q,quoteVerified:q!==null,frequency:f,n:valid?p.n:null,hits:valid?p.hits:null,breakeven:f>0?1/f:null,retrospectiveEV:permitted&&q!==null&&f!==null?f*q-1:null,eligible:permitted&&q!==null&&f!==null};
 }
 const candidates=Object.entries(result.variants).filter(([,v])=>v.eligible);
 if(!candidates.length){result.status='NO_VERIFIED_JOINT_PRICE';result.reason='No verified available joint quote and historical frequency for a permitted variant';return result;}
 candidates.sort((a,b)=>b[1].retrospectiveEV-a[1].retrospectiveEV||a[1].legs.length-b[1].legs.length||a[0].localeCompare(b[0]));
 result.bestVerified=candidates[0][0];result.reason='Highest retrospective EV among verified available quotes; not a forecast or staking recommendation';return result;
}
function rank({proposals=[],quotes={},minSample=20}={}) {
 const seen=new Set(),out=[];
 for(const proposal of proposals){
  const legs=ids(proposal.legs);
  if(!legs.length)continue;
  const key=legs.join('|');
  if(seen.has(key))continue;seen.add(key);
  const hits=proposal.hits,n=proposal.n;
  const valid=Number.isInteger(hits)&&Number.isInteger(n)&&n>=minSample&&hits>=0&&hits<=n;
  const f=valid?hits/n:null,q=quote(quotes[key]);
  const ev=f!==null&&q!==null?f*q-1:null;
  out.push({name:proposal.name||'PROPUESTA',legs,hits:valid?hits:null,n:valid?n:null,frequency:f,breakeven:f>0?1/f:null,verifiedJointOdds:q,retrospectiveEV:ev,status:!valid?'INSUFFICIENT_HISTORY':q===null?'PRICE_NOT_VERIFIED':'VERIFIED_HISTORICAL_EV'});
 }
 out.sort((a,b)=>{
  const av=a.retrospectiveEV,bv=b.retrospectiveEV;
  if(av!==null&&bv!==null)return bv-av||b.frequency-a.frequency;
  if(av!==null)return -1;if(bv!==null)return 1;
  return (b.frequency??-1)-(a.frequency??-1)||a.name.localeCompare(b.name);
 });
 return {status:out.some(x=>x.retrospectiveEV!==null)?'VERIFIED_PRICE_RANKING':'HISTORICAL_ONLY',proposals:out,priced:out.filter(x=>x.retrospectiveEV!==null).length};
}
g.RadarCP033FusionPrice={assess,rank};
})(typeof window!=='undefined'?window:globalThis);
