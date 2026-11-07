/* CP-033 historical candidate comparison: all supported markets, no synthetic odds. */
(function(g){'use strict';
const norm=s=>g.RadarCP033Adapter.normalize(s);
const date=s=>g.RadarBrowserEngine.date(s);
function compare(rows,home,away,cutoff,markets,odds={}){
 const end=date(cutoff);if(!end)throw Error('Fecha de corte no válida');
 const season=Number(end.slice(0,4))-(Number(end.slice(5,7))<7?1:0);
 const start=y=>y+'-07-01';
 const historic=rows.filter(r=>{const d=date(r.Date);return d&&d<end&&d>=start(season-20)});
 const recent=historic.filter(r=>date(r.Date)>=start(season-3));
 const contexts={h2h:historic.filter(r=>norm(r.HomeTeam)===norm(home)&&norm(r.AwayTeam)===norm(away)),
 home:historic.filter(r=>norm(r.HomeTeam)===norm(home)),
 away:historic.filter(r=>norm(r.AwayTeam)===norm(away)),
 h2h3:recent.filter(r=>norm(r.HomeTeam)===norm(home)&&norm(r.AwayTeam)===norm(away)),
 home3:recent.filter(r=>norm(r.HomeTeam)===norm(home)),
 away3:recent.filter(r=>norm(r.AwayTeam)===norm(away))};
 function count(sample,id){let n=0,hits=0;for(const row of sample){let v=g.RadarMobileCatalog.settle(row,id);if(v===null||v===undefined)continue;n++;if(v)hits++}return {n,hits,pct:n?100*hits/n:null}}
 return markets.map(m=>{const stats=Object.fromEntries(Object.entries(contexts).map(([k,v])=>[k,count(v,m.id)]));
 const q=Object.prototype.hasOwnProperty.call(odds,m.id)?Number(odds[m.id]):NaN;const price=Number.isFinite(q)&&q>1?q:null;
 const threshold=price?100/price:null;
 const rates=['home','away'].map(k=>stats[k].pct).filter(v=>v!==null);
 const recentRates=['home3','away3'].map(k=>stats[k].pct).filter(v=>v!==null);
 const minLong=rates.length?Math.min(...rates):null;
 const minRecent=recentRates.length?Math.min(...recentRates):null;
 return {id:m.id,label:m.label,stats,odds:price,threshold,minLong,minRecent,edge:threshold===null||minLong===null?null:minLong-threshold,
 status:price===null?'SIN_CUOTA':minLong===null?'SIN_DATOS':minLong>threshold&&minRecent!==null&&minRecent>threshold?'SUPERA_UMBRAL_HISTORICO':'NO_SUPERA_UMBRAL'};
 });
}
function lineAxis(id){
 const m=/^([A-Z]+[0-9]*[GL])(\d+)p5$/.exec(id);
 if(!m)return null;
 const prefix=m[1],direction=prefix.slice(-1);
 if(direction!=='G'&&direction!=='L')return null;
 return {axis:prefix.slice(0,-1),direction,line:Number(m[2])+0.5};
}
function lineFrontier(compared){
 const groups=new Map();
 for(const x of compared){
  const parsed=lineAxis(x.id);if(!parsed)continue;
  if(!groups.has(parsed.axis))groups.set(parsed.axis,[]);
  groups.get(parsed.axis).push({...x,line:parsed.line,direction:parsed.direction});
 }
 return [...groups].map(([axis,items])=>({
  axis,lines:items.sort((a,b)=>a.line-b.line||a.direction.localeCompare(b.direction)).map(x=>({
   id:x.id,label:x.label,line:x.line,direction:x.direction,
   stats:x.stats,odds:x.odds,threshold:x.threshold,
   minLong:x.minLong,minRecent:x.minRecent,
   historicalEdge:x.edge
  }))
 }));
}
function govern(rows,home,away,cutoff,markets,odds={},options={}){
 const minLong=options.minLong??20,minRecent=options.minRecent??10;
 const compared=compare(rows,home,away,cutoff,markets,odds);
 const frontier=lineFrontier(compared);
 const min=(x,keys,n)=>keys.every(k=>x.stats[k].n>=n)?Math.min(...keys.map(k=>x.stats[k].pct)):null;
 const key=id=>lineAxis(id)?.axis||'SPECIAL:'+id;
 const ranked=compared.map(x=>{
  const long=min(x,['home','away'],minLong),recent=min(x,['home3','away3'],minRecent);
  const reliable=long!==null&&recent!==null;
  const historicalScore=reliable?0.65*long+0.35*recent:null;
  const edge=x.threshold===null?null:historicalScore===null?null:historicalScore-x.threshold;
  const admissible=reliable&&(x.threshold===null||edge>0);
  return {...x,long,recent,historicalScore,edge,admissible,reason:!reliable?'MUESTRA_INSUFICIENTE':x.threshold!==null&&edge<=0?'SIN_VENTAJA_HISTORICA':'CANDIDATO_HISTORICO'};
 }).sort((a,b)=>(b.admissible?1:0)-(a.admissible?1:0)||((b.edge??b.historicalScore??-1)-(a.edge??a.historicalScore??-1))||a.id.localeCompare(b.id));
 const chosen=new Map(),rejected=[];
 for(const x of ranked){if(!x.admissible){rejected.push(x);continue}const axis=key(x.id);if(chosen.has(axis)){rejected.push({...x,reason:'LINEA_ALTERNATIVA'});continue}chosen.set(axis,x)}
 const ids=new Set([...chosen.values()].map(x=>x.id));
 return {markets:markets.filter(m=>ranked.some(x=>x.id===m.id&&x.admissible)),comparison:ranked,frontier,chosen:[...chosen.values()],rejected,policy:'20T_3T_ALL_ADMISSIBLE_LINES_TO_JOINT',priced:ranked.filter(x=>x.odds!==null).length};
}
g.RadarCP033Comparison={compare,govern,lineAxis,lineFrontier};
})(typeof window!=='undefined'?window:globalThis);
