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
 for(let p of provider){let dt=parseDate(p.date),key=dt+'|'+normalize(p.home)+'|'+normalize(p.away);if(!dt||!p.home||!p.away||p.home_goals===null||p.away_goals===null||p.home_goals===''||p.away_goals===''){skipped++;continue}let r={Date:dt,HomeTeam:p.home,AwayTeam:p.away};for(let [to,from] of Object.entries({FTHG:'home_goals',FTAG:'away_goals',HS:'home_shots',AS:'away_shots',HST:'home_sot',AST:'away_sot',HC:'home_corners',AC:'away_corners',HY:'home_cards',AY:'away_cards',HF:'home_fouls',AF:'away_fouls',HTHG:'home_ht_goals',HTAG:'away_ht_goals'})){if(p[from]!==undefined&&p[from]!==null&&String(p[from]).trim()!=='')r[to]=p[from]}
 let old=map.get(key);if(old){if(number(old,'FTHG')!==null&&number(r,'FTHG')!==null&&(number(old,'FTHG')!==number(r,'FTHG')||number(old,'FTAG')!==number(r,'FTAG'))){conflicts++;continue}for(let k of required){if(number(old,k)===null&&number(r,k)!==null)old[k]=r[k]}}else{map.set(key,r);added++}}
 return {rows:[...map.values()],added,skipped,conflicts};}
function select(rows,home,away,cutoff,markets,opts={}){if(normalize(home)===normalize(away))throw Error('Equipos idénticos');let minTrain=opts.minTrain??15,minTest=opts.minTest??5,width=opts.width??40;
 let pools=[rows.filter(r=>parseDate(r.Date)<cutoff&&normalize(r.HomeTeam)===normalize(home)),rows.filter(r=>parseDate(r.Date)<cutoff&&normalize(r.AwayTeam)===normalize(away))].map(a=>a.sort((x,y)=>parseDate(x.Date).localeCompare(parseDate(y.Date))));
 let split=pools.map(a=>{let k=Math.floor(a.length*.8);return [a.slice(0,k),a.slice(k)]});
 let matrix=split.map(parts=>parts.map(part=>part.map(r=>markets.map(m=>settle(r,m.id))).filter(vals=>vals.every(v=>v!==null))));
 let counts=matrix.map(parts=>({train:parts[0].length,holdout:parts[1].length}));if(counts.some(x=>x.train<minTrain||x.holdout<minTest))return {status:'INSUFFICIENT_COMPLETE_CASES',counts,catalog_count:markets.length};
 const training=matrix.map(x=>x[0]);let evalSeq=(seq,samples)=>samples.map(sample=>{let hits=sample.filter(row=>seq.every(i=>row[i]===true)).length;return {hits,n:sample.length,pct:Math.round(100000*hits/sample.length)/1000}});
 let beam=[[]],examined=0;for(let depth=1;depth<=6;depth++){let next=[];for(let seq of beam){let old=evalSeq(seq,training);for(let i=0;i<markets.length;i++){if(seq.includes(i))continue;let cand=[...seq,i],v=evalSeq(cand,training);if(v.every((x,j)=>x.hits===old[j].hits))continue;examined++;let rates=v.map(x=>x.hits/x.n);next.push({cand,score:Math.min(...rates),sum:rates[0]+rates[1]})}}next.sort((a,b)=>b.score-a.score||b.sum-a.sum||a.cand.join(',').localeCompare(b.cand.join(',')));beam=next.slice(0,width).map(x=>x.cand);if(!beam.length)return {status:'NO_NONREDUNDANT_CHAIN',depth,counts}}
 let seq=beam[0],variants=[3,4,5,6].map((n,i)=>({name:['CORE','SAT1','SAT2','SAT3'][i],legs:seq.slice(0,n).map(j=>markets[j]),train_by_context:evalSeq(seq.slice(0,n),training),holdout_by_context:evalSeq(seq.slice(0,n),matrix.map(x=>x[1]))}));return {status:'MOBILE_139_BEAM',variants,counts,catalog_count:markets.length,extensions_examined:examined,nested:true,calibrated:false,match_joint_probability:null,global_optimum_proven:false}}
async function loadCatalog(){let r=await fetch('./catalog139.json');if(!r.ok)throw Error('Catálogo HTTP '+r.status);return r.json()}
g.RadarMobileCatalog={settle,merge,select,loadCatalog,required};})(typeof window!=='undefined'?window:globalThis);
