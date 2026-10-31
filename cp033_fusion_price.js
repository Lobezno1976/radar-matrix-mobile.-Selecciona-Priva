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
g.RadarCP033FusionPrice={assess};
})(typeof window!=='undefined'?window:globalThis);
