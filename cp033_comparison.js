/* CP-033 historical candidate comparison: all supported markets, no synthetic odds. */
(function(g){'use strict';
const norm=s=>g.RadarBrowserEngine.norm(s);
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
 const q=Number(odds[m.id]);const price=Number.isFinite(q)&&q>1?q:null;
 const threshold=price?100/price:null;
 const rates=['home','away'].map(k=>stats[k].pct).filter(v=>v!==null);
 const recentRates=['home3','away3'].map(k=>stats[k].pct).filter(v=>v!==null);
 const minLong=rates.length?Math.min(...rates):null;
 const minRecent=recentRates.length?Math.min(...recentRates):null;
 return {id:m.id,label:m.label,stats,odds:price,threshold,minLong,minRecent,edge:threshold===null||minLong===null?null:minLong-threshold,
 status:price===null?'SIN_CUOTA':minLong===null?'SIN_DATOS':minLong>threshold&&minRecent!==null&&minRecent>threshold?'SUPERA_UMBRAL_HISTORICO':'NO_SUPERA_UMBRAL'};
 });
}
g.RadarCP033Comparison={compare};
})(typeof window!=='undefined'?window:globalThis);
