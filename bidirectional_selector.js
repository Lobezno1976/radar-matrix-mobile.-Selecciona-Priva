/* CP-032: bidirectional comparison, independent of frozen selector.
   Historical frequencies only. Null values are excluded, not counted as misses. */
(function(g){'use strict';
const families={S:['HST','AST'],R:['HS','AS'],F:['HF','AF'],C:['HC','AC'],T:['HY','AY'],G:['FTHG','FTAG']};
function parse(id){
 const m=/^(SG|SL|SHG|SHL|SAG|SAL|RG|RL|RHG|RHL|RAG|RAL|FG|FL|FHG|FHL|FAG|FAL|CG|CL|CHG|CHL|CAG|CAL|TG|TL|THG|THL|TAG|TAL|GG|GL|GHG|GHL|GAG|GAL)(\d+)p5$/.exec(id);
 if(!m)return null;
 const code=m[1],type=code[0],side=code.endsWith('G')?'over':'under',scope=code.length===2?'total':code[1]==='H'?'home':'away';
 return {type,scope,side,line:Number(m[2])+.5,group:type+':'+scope};
}
function score(rows,market,base=[],settle){
 let eligible=0,baseHits=0,jointHits=0;
 for(const row of rows){
  const v=settle(row,market.id),b=base.map(m=>settle(row,m.id));
  if(v===null||b.some(x=>x===null))continue;
  eligible++;
  if(b.every(Boolean)){baseHits++;if(v)jointHits++;}
 }
 return {eligible,baseHits,jointHits,frequency:baseHits?jointHits/baseHits:null};
}
function compare(rows,catalog,base=[],opts={}){
 const settle=opts.settle||(g.RadarMobileCatalog&&g.RadarMobileCatalog.settle);
 if(typeof settle!=='function')throw Error('Falta evaluador de mercados');
 const minSample=opts.minSample??20;
 const groups=new Map();
 for(const market of catalog){
  const p=parse(market.id);if(!p)continue;
  const entry={...market,...p,...score(rows,market,base,settle)};
  if(!groups.has(p.group))groups.set(p.group,[]);
  groups.get(p.group).push(entry);
 }
 const output=[];
 for(const [group,items] of groups){
  const ranked=items.filter(x=>x.baseHits>=minSample).sort((a,b)=>b.frequency-a.frequency||b.baseHits-a.baseHits||a.id.localeCompare(b.id));
  const over=ranked.find(x=>x.side==='over')||null,under=ranked.find(x=>x.side==='under')||null;
  output.push({group,over,under,best:ranked[0]||null,comparedBoth:!!(over&&under),eligibleAlternatives:ranked.length});
 }
 return {groups:output,base:base.map(x=>x.id),minSample,method:'conditional historical joint frequency; descriptive, not prospective'};
}
g.RadarBidirectionalSelector={parse,score,compare};
})(typeof window!=='undefined'?window:globalThis);
