(function(g){'use strict';
const required=['FTHG','FTAG','HTHG','HTAG','HS','AS','HST','AST','HF','AF','HC','AC','HY','AY'];
function number(r,k){let v=r[k];if(v===undefined||v===null||String(v).trim()==='')return null;let n=Number(v);return Number.isInteger(n)&&n>=0?n:null}
function settle(r,id){let m=/^(SG|SL|SA[GL]|SH[GL]|RG|RL|FG|FL|CG|CL|CA[GL]|CH[GL]|TG|TL|TA[GL]|TH[GL]|GG|GL|GA[GL]|GH[GL]|GO[12][GL])(\d+)p5$/.exec(id);
 if(m){let code=m[1],limit=Number(m[2])+.5;
  if(code.startsWith('GO')){let v=['HTHG','HTAG','FTHG','FTAG'].map(k=>number(r,k));if(v.some(x=>x===null)||v[0]>v[2]||v[1]>v[3])return null;let x=code[2]==='1'?v[0]+v[1]:v[2]+v[3]-v[0]-v[1];return code.endsWith('G')?x>limit:x<limit}
  let fields={S:['HST','AST'],R:['HS','AS'],F:['HF','AF'],C:['HC','AC'],T:['HY','AY'],G:['FTHG','FTAG']}[code[0]];
  let keys=(['SG','SL','RG','RL','FG','FL','CG','CL','TG','TL','GG','GL'].includes(code))?fields:[fields[code[1]==='H'?0:1]];
  let vals=keys.map(k=>number(r,k));if(vals.some(v=>v===null))return null;let val=vals.reduce((a,b)=>a+b,0);return code.endsWith('G')?val>limit:val<limit;
 }
 let codes=['BTTS_Y','BTTS_N','W_HA','W_HD','W_DA','W_H','W_A','W_D','W_H1','W_H2','W_H3P','W_A1','W_A2','W_A3P','WC_H','WC_A','WC_D','WT_H','WT_A','WT_D'];if(!codes.includes(id))throw Error('Mercado no reconocido: '+id);
 let fields=id.startsWith('WC_')?['HC','AC']:id.startsWith('WT_')?['HY','AY']:['FTHG','FTAG'];let [a,b]=fields.map(k=>number(r,k));if(a===null||b===null)return null;let d=a-b;
 return ({BTTS_Y:a>0&&b>0,BTTS_N:a===0||b===0,W_HA:d!==0,W_HD:d>=0,W_DA:d<=0,W_H:d>0,W_A:d<0,W_D:d===0,W_H1:d===1,W_H2:d===2,W_H3P:d>=3,W_A1:d===-1,W_A2:d===-2,W_A3P:d<=-3,WC_H:d>0,WC_A:d<0,WC_D:d===0,WT_H:d>0,WT_A:d<0,WT_D:d===0})[id];}
function parseDate(s){return g.RadarBrowserEngine.date(s)}
function normalize(s){return g.RadarBrowserEngine.norm(s)}
function merge(historical,provider){let map=new Map(historical.map(r=>[parseDate(r.Date)+'|'+normalize(r.HomeTeam)+'|'+normalize(r.AwayTeam),r]));let added=0,skipped=0,conflicts=0;
 for(let p of provider){let dt=parseDate(p.date),key=dt+'|'+normalize(p.home)+'|'+normalize(p.away);if(!dt||!p.home||!p.away){skipped++;continue}let r={Date:dt,HomeTeam:p.home,AwayTeam:p.away};for(let [to,from] of Object.entries({FTHG:'home_goals',FTAG:'away_goals',HS:'home_shots',AS:'away_shots',HST:'home_sot',AST:'away_sot',HC:'home_corners',AC:'away_corners',HY:'home_cards',AY:'away_cards',HF:'home_fouls',AF:'away_fouls',HTHG:'home_ht_goals',HTAG:'away_ht_goals'})){if(p[from]!==undefined&&p[from]!==null&&String(p[from]).trim()!=='')r[to]=p[from]}
 let old=map.get(key);if(old){if(number(old,'FTHG')!==null&&number(r,'FTHG')!==null&&(number(old,'FTHG')!==number(r,'FTHG')||number(old,'FTAG')!==number(r,'FTAG'))){conflicts++;continue}for(let k of required){if(number(old,k)===null&&number(r,k)!==null)old[k]=r[k]}}else{map.set(key,r);added++}}
 return {rows:[...map.values()],added,skipped,conflicts};}
function marketGroup(id){
 const m=/^(SG|SL|SA[GL]|SH[GL]|RG|RL|FG|FL|CG|CL|CA[GL]|CH[GL]|TG|TL|TA[GL]|TH[GL]|GG|GL|GA[GL]|GH[GL]|GO[12][GL])(\d+)p5$/.exec(id);
 if(!m)return null;
 const code=m[1];const family=code[0];const period=code.startsWith('GO')?code.slice(0,3):'FT';
 const side=code.startsWith('GO')?'total':(['SG','SL','RG','RL','FG','FL','CG','CL','TG','TL','GG','GL'].includes(code)?'total':code[1]==='H'?'home':'away');
 return family+':'+period+':'+side;
}
function specialDomain(id){return id.startsWith('W_')?'W':id.startsWith('WC_')?'WC':id.startsWith('WT_')?'WT':id.startsWith('BTTS_')?'BTTS':null}
function specialConflict(a,b){
 const domain=specialDomain(a);if(!domain||domain!==specialDomain(b))return false;
 // Resultado, córners y tarjetas: diferencia -6..+6 cubre los umbrales exactos y 3+.
 // BTTS: dos estados exhaustivos (sí/no). No se descartan relaciones parciales.
 const outcomes=domain==='BTTS'?[0,1]:[-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6];
 const hits=id=>outcomes.map(d=>{
  if(domain==='BTTS')return id==='BTTS_Y'?d===1:d===0;
  const r={FTHG:Math.max(d,0),FTAG:Math.max(-d,0),HC:Math.max(d,0),AC:Math.max(-d,0),HY:Math.max(d,0),AY:Math.max(-d,0)};
  return settle(r,id);
 });
 const x=hits(a),y=hits(b);let xy=0,xOnly=0,yOnly=0;
 for(let k=0;k<outcomes.length;k++){if(x[k]&&y[k])xy++;else if(x[k])xOnly++;else if(y[k])yOnly++}
 return xy===0||xOnly===0||yOnly===0;
}
// Contraste semántico transversal: sólo pares con al menos un mercado especial.
// Se conservan las alternativas de distinta familia cuando ambas aportan información.
function semanticConflict(a,b){
 const domain=id=>id.startsWith('W_')||id.startsWith('BTTS_')?'G':id.startsWith('WC_')?'C':id.startsWith('WT_')?'T':null;
 const da=domain(a),db=domain(b);
 if(!da&&!db)return false;
 const family=da||db;
 if(da&&db&&da!==db)return false;
 const numeric=id=>marketGroup(id);
 for(const id of [a,b])if(!domain(id)){
  const group=numeric(id);
  if(!group||!group.startsWith(family+':FT:'))return false;
 }
 let intersection=0,onlyA=0,onlyB=0;
 const max=family==='G'?8:16;
 for(let h=0;h<=max;h++)for(let v=0;v<=max;v++){
  const row={FTHG:h,FTAG:v,HC:h,AC:v,HY:h,AY:v};
  const x=settle(row,a),y=settle(row,b);
  if(x===null||y===null)return false;
  if(x&&y)intersection++;else if(x)onlyA++;else if(y)onlyB++;
 }
 return intersection===0||onlyA===0||onlyB===0;
}
function redundantMarkets(seq,markets){
 const seen=new Set(),special=[],priorIds=[];
 for(const i of seq){
  const id=markets[i].id,group=marketGroup(id);
  if(group&&seen.has(group))return true;
  if(group)seen.add(group);
  for(const prior of priorIds)if(semanticConflict(prior,id))return true;
  if(specialDomain(id)){for(const prior of special)if(specialConflict(prior,id))return true;special.push(id)}
  priorIds.push(id);
 }
 return false;
}
function select(rows,home,away,cutoff,markets,opts={}){
 if(normalize(home)===normalize(away))throw Error('Equipos idénticos');
 const minTrain=opts.minTrain??15,minTest=opts.minTest??5,width=opts.width??40,minCoverage=opts.minCoverage??0.8;
 if(!Number.isInteger(width)||width<1||minCoverage<=0||minCoverage>1)throw Error('Parámetros de búsqueda inválidos');
 const pools=[rows.filter(r=>parseDate(r.Date)&&parseDate(r.Date)<cutoff&&normalize(r.HomeTeam)===normalize(home)),rows.filter(r=>parseDate(r.Date)&&parseDate(r.Date)<cutoff&&normalize(r.AwayTeam)===normalize(away))].map(a=>a.sort((x,y)=>parseDate(x.Date).localeCompare(parseDate(y.Date))));
 const split=pools.map(a=>{const k=Math.floor(a.length*.8);return [a.slice(0,k),a.slice(k)]});
 const matrix=split.map(parts=>parts.map(part=>part.map(r=>markets.map(m=>settle(r,m.id)))));
 const available=matrix.map(parts=>({train:parts[0].length,holdout:parts[1].length}));
 const complete=matrix.map(parts=>({train:parts[0].filter(v=>v.every(x=>x!==null)).length,holdout:parts[1].filter(v=>v.every(x=>x!==null)).length}));
 const counts=available;
 if(available.some(x=>x.train<minTrain||x.holdout<minTest))return {status:'INSUFFICIENT_CONTEXT_ROWS',counts,complete_case_counts:complete,catalog_count:markets.length};
 const evalSeq=(seq,samples)=>samples.map(sample=>{let hits=0,n=0;for(const row of sample){if(seq.some(i=>row[i]===null))continue;n++;if(seq.every(i=>row[i]===true))hits++;}return {hits,n,pct:n?Math.round(100000*hits/n)/1000:null};});
 const training=matrix.map(x=>x[0]),holdout=matrix.map(x=>x[1]);
 const policy=opts.weightPolicy||g.RadarWeightPolicy;
 const weighted=opts.useWeights===true&&!!policy;
 const rowWeights=weighted?split.map(parts=>markets.map(m=>{
   const id=m.id,parsed=g.RadarBidirectionalSelector&&g.RadarBidirectionalSelector.parse(id);
   const family=parsed?parsed.group:id.startsWith('WC_')?'C:total':id.startsWith('WT_')?'T:total':'G:total';
   const method=policy.METHODS[family]||'raw',vec=policy.WEIGHTS[family];
   const weights=method==='optimized'&&vec?vec:method==='uniform'||method==='optimized'?policy.WINDOWS.map(()=>1/6):null;
   const current=policy.season(cutoff),train=parts[0];
   const years=train.map(row=>policy.season(parseDate(row.Date)));
   const totals=policy.WINDOWS.map(n=>years.filter(y=>y!==null&&(n===0?y===current:y>=current-n&&y<=current)).length);
   return years.map(y=>{
     if(y===null||y>current||y<current-20)return 0;
     if(!weights)return 1;
     let w=0;for(let k=0;k<weights.length;k++){const n=policy.WINDOWS[k];if(totals[k]&&(n===0?y===current:y>=current-n))w+=weights[k]/totals[k];}
     return w;
   });
 })):null;
 const rankRates=seq=>{
   if(!weighted)return evalSeq(seq,training).map(x=>x.hits/x.n);
   return training.map((sample,j)=>{
     let yes=0,total=0;
     for(let k=0;k<sample.length;k++){
       if(seq.some(i=>sample[k][i]===null))continue;
       const weight=seq.map(i=>rowWeights[j][i][k]).reduce((a,b)=>a+b,0)/seq.length;total+=weight;if(seq.every(i=>sample[k][i]===true))yes+=weight;
     }
     return total?yes/total:0;
   });
 };
 const admissible=seq=>{const tr=evalSeq(seq,training),te=evalSeq(seq,holdout);return tr.every((v,j)=>v.n>=minTrain&&v.n>=Math.ceil(available[j].train*minCoverage)&&te[j].n>=minTest&&te[j].n>=Math.ceil(available[j].holdout*minCoverage));};
 let beam=[[]],examined=0,chosen=null,stageScores=[];
 for(let depth=1;depth<=6;depth++){
  const next=[];
  for(const seq of beam){
   for(let i=0;i<markets.length;i++){
    if(seq.includes(i))continue;
    const cand=[...seq,i];if(redundantMarkets(cand,markets)||!admissible(cand))continue;
    const v=evalSeq(cand,training);
    // Comparar la reducción de aciertos sobre EXACTAMENTE la misma cohorte evaluable.
    // No se confunde una fila ausente con un fallo del mercado.
    if(seq.length&&v.every((x,j)=>{
     let oldHits=0;for(const row of training[j])if(cand.every(k=>row[k]!==null)&&seq.every(k=>row[k]===true))oldHits++;
     return x.hits===oldHits;
    }))continue;
    examined++;const rates=rankRates(cand);
    next.push({cand,score:Math.min(...rates),sum:rates[0]+rates[1]});
   }
  }
  // Price-aware selection: compare admissible alternatives before pruning redundant markets.
  // Without verified odds, retain historical-frequency ordering; never infer profitability.
  const price=opts.verifiedOdds||null;
  const priced=seq=>{
    if(!price)return null;
    const ids=seq.map(i=>markets[i].id);
    const quotes=ids.map(id=>price[id]);
    if(quotes.some(q=>!q||!Number.isFinite(Number(q.odds))||Number(q.odds)<=1||q.verified!==true))return null;
    // Joint decimal odds are not the product of correlated legs: require an executable quote.
    const key=ids.join('|'),joint=opts.verifiedJointOdds?.[key];
    if(!joint||joint.verified!==true||!Number.isFinite(Number(joint.odds))||Number(joint.odds)<=1)return null;
    return Number(joint.odds);
  };
  const valueOf=c=>{
    const odds=priced(c.cand);
    return odds===null?null:c.score*odds-1;
  };
  next.sort((a,b)=>{
    const va=valueOf(a),vb=valueOf(b);
    if(va!==null&&vb!==null&&va!==vb)return vb-va;
    // Never rank unpriced alternatives as if they had a verified EV.
    return b.score-a.score||b.sum-a.sum||a.cand.join(',').localeCompare(b.cand.join(','));
  });
  if(!next.length)return {status:'NO_ADMISSIBLE_CHAIN',depth,counts,complete_case_counts:complete,catalog_count:markets.length,min_coverage:minCoverage};
  if(depth<3){beam=next.slice(0,width).map(x=>x.cand);continue;}
  chosen=next[0].cand;stageScores.push({depth,score:next[0].score});beam=[chosen];
 }
 const variants=[3,4,5,6].map((n,i)=>{const ids=chosen.slice(0,n);return {name:['CORE','SAT1','SAT2','SAT3'][i],legs:ids.map(j=>markets[j]),train_by_context:evalSeq(ids,training),holdout_by_context:evalSeq(ids,holdout)};});
 return {status:'MOBILE_139_BEAM_SHADOW_V11',variants,counts,complete_case_counts:complete,catalog_count:markets.length,extensions_examined:examined,nested:true,calibrated:false,match_joint_probability:null,global_optimum_proven:false,stageScores,complete_case_139:false,min_coverage:minCoverage,weighting_applied:weighted};
}
async function loadCatalog(){let r=await fetch('./catalog139.json');if(!r.ok)throw Error('Catálogo HTTP '+r.status);return r.json()}
g.RadarMobileCatalog={settle,merge,select,loadCatalog,required,marketGroup,redundantMarkets};})(typeof window!=='undefined'?window:globalThis);
