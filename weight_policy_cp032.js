/* CP-032 weighting policy v1. Training 2024/25, holdout 2025/26.
   Historical frequencies are descriptive. Policy changes only the experimental audit,
   never the frozen CORE/SAT engine. No future games may enter any calculation. */
(function(g){'use strict';
const WINDOWS=[0,3,5,10,15,20];
const WEIGHTS={
 'G:total':[.1123,.2694,.3811,.0395,.1893,.0084],
 'G:home':[.1595,.6711,.0251,.0006,.0971,.0466],
 'G:away':[0,0,0,0,0,1],
 'C:total':[.2367,.1857,.0183,.0143,.4374,.1076],
};
const METHODS={'G:total':'raw','G:home':'raw','G:away':'raw','C:total':'uniform','C:home':'raw','C:away':'raw','T:total':'uniform','T:home':'optimized','T:away':'optimized','R:total':'uniform','S:total':'uniform','F:total':'optimized'};
function season(value){if(value==null)return null;const m=String(value).match(/(20\d\d|19\d\d)/);if(!m)return null;const year=+m[1];if(/^\d{4}-\d\d-\d\d/.test(String(value))){const month=+String(value).slice(5,7);return year-(month<7?1:0);}if(/^\d\d\/\d\d\/(19|20)\d\d/.test(String(value))){const month=+String(value).slice(3,5);return year-(month<7?1:0);}return year;}
function dateValue(x){const d=new Date(x);return Number.isFinite(d.getTime())?d.getTime():NaN;}
function rowSeason(row){return Number.isInteger(+row.season)?+row.season:season(row.Date);}
function filtered(rows,cutoff){const limit=dateValue(cutoff);if(!Number.isFinite(limit))throw Error('Fecha de corte inválida');return rows.filter(r=>dateValue(r.Date)<limit);}
function score(rows,market,base,settle,cutoff,method,weights){
 const selected=filtered(rows,cutoff),current=season(cutoff),windowScores=[];
 for(let i=0;i<WINDOWS.length;i++){
  const n=WINDOWS[i];let yes=0,total=0;
  for(const row of selected){
   const s=rowSeason(row);if(s===null||s>current|| (n===0?s!==current:s<current-n))continue;
   const v=settle(row,market.id),b=base.map(x=>settle(row,x.id));if(v===null||b.some(x=>x===null)||!b.every(Boolean))continue;
   total++;if(v)yes++;
  }
  windowScores.push({n,yes,total,rate:total?yes/total:null});
 }
 let yes=0,total=0;
 for(const row of selected){
  const s=rowSeason(row);if(s===null||s<current-20||s>current)continue;
  const v=settle(row,market.id),b=base.map(x=>settle(row,x.id));if(v===null||b.some(x=>x===null)||!b.every(Boolean))continue;
  total++;if(v)yes++;
 }
 const raw=total?yes/total:null;
 const w=method==='uniform'?WINDOWS.map(()=>1/6):(weights||WINDOWS.map(()=>1/6));
 let numerator=0,denominator=0;
 for(let i=0;i<w.length;i++){if(windowScores[i].rate!==null&&w[i]>0){numerator+=w[i]*windowScores[i].rate;denominator+=w[i];}}
 const weighted=denominator?numerator/denominator:null;
 return {frequency:method==='raw'?raw:weighted,raw,weighted,baseHits:total,jointHits:yes,windowScores,method};
}
function choose(group,rows,cutoff,settle,base,market,options={}){
 const policy=METHODS[group]||'raw',method=options.method||policy;
 if(!['raw','uniform','optimized'].includes(method))throw Error('Método desconocido');
 const w=WEIGHTS[group];
 // Never claim optimization when no trained weights exist.
 const effective=method==='optimized'&&!w?'uniform':method;
 return {...score(rows,market,base,settle,cutoff,effective,w),requestedMethod:method};
}
function recalibrationStatus(rows,cutoff){
 const current=season(cutoff),played=filtered(rows,cutoff).filter(r=>rowSeason(r)===current).length;
 // At 19 rounds (190 league matches) recalibration is due, not automatically approved.
 return {season:current,played,midseasonDue:played>=190,applied:false,reason:'Se requiere optimización retrospectiva y validación fuera de muestra antes de cambiar pesos'};
}
g.RadarWeightPolicy={WINDOWS,WEIGHTS,METHODS,season,filtered,score,choose,recalibrationStatus};
})(typeof window!=='undefined'?window:globalThis);
