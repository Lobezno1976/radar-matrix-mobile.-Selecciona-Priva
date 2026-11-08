/* CP-033: coverage-aware market gate and observed ranges. No imputed data. */
(function(g){'use strict';
const EXCLUDED_PREFIXES=['FIRST_GOAL','FIRST_CORNER','FIRST_CARD','CORNER_1H','CARD_1H','C1H_','T1H_'];
function eligible(m){
 const id=String(m&&m.id||'');
 if(!id)return false;
 if(EXCLUDED_PREFIXES.some(p=>id.toUpperCase().startsWith(p)))return false;
 if(/^(?:(?:GO[12][GL]|SG|SL|SA[GL]|SH[GL]|RG|RL|RA[GL]|RH[GL]|FG|FL|FA[GL]|FH[GL]|CG|CL|CA[GL]|CH[GL]|TG|TL|TA[GL]|TH[GL]|GG|GL|GA[GL]|GH[GL])\d+p5|BTTS_[YN]|W_(?:HA|HD|DA|H|A|D|H1|H2|H3P|A1|A2|A3P)|WC_[HAD]|WT_[HAD])$/i.test(id))return true;
 return false;
}
function filter(markets){return markets.filter(eligible)}
function num(row,key){const v=row[key];if(v===undefined||v===null||String(v).trim()==='')return null;const n=Number(v);return Number.isFinite(n)&&n>=0?n:null}
const AXES={
 'Tiros totales':['HS','AS'],'Tiros local':['HS'],'Tiros visitante':['AS'],
 'A puerta totales':['HST','AST'],'A puerta local':['HST'],'A puerta visitante':['AST'],
 'Córners totales':['HC','AC'],'Córners local':['HC'],'Córners visitante':['AC'],
 'Faltas totales':['HF','AF'],'Faltas local':['HF'],'Faltas visitante':['AF'],
 'Amarillas totales':['HY','AY'],'Amarillas local':['HY'],'Amarillas visitante':['AY'],
 'Goles totales':['FTHG','FTAG'],'Goles local':['FTHG'],'Goles visitante':['FTAG'],
 'Goles 1T':['HTHG','HTAG']
};
function summarize(rows){
 return Object.entries(AXES).map(([market,keys])=>{
  const values=rows.map(r=>keys.map(k=>num(r,k))).filter(v=>v.every(x=>x!==null)).map(v=>v.reduce((a,b)=>a+b,0)).sort((a,b)=>a-b);
  const n=values.length,median=n?(values[Math.floor((n-1)/2)]+values[Math.floor(n/2)])/2:null;
  return {market,n,min:n?values[0]:null,max:n?values[n-1]:null,mean:n?values.reduce((a,b)=>a+b,0)/n:null,median};
 });
}
function windows(rows,home,away,cutoff){
 const aliases={'valencia cf':'valencia','real madrid cf':'real madrid','athletic club':'ath bilbao','athletic':'ath bilbao','real sociedad':'sociedad','atletico madrid':'ath madrid','at madrid':'ath madrid','fc barcelona':'barcelona','real betis':'betis','rayo vallecano':'vallecano','rcd espanyol':'espanol'};
 const norm=s=>{const n=String(s||'').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').trim();return aliases[n]||n;};
 const date=s=>{const t=String(s||'').trim();if(t.length>=10&&t[4]==='-'&&t[7]==='-')return t.slice(0,10);const parts=t.split('/');if(parts.length===3&&parts[2].length>=4)return parts[2].slice(0,4)+'-'+parts[1].padStart(2,'0')+'-'+parts[0].padStart(2,'0');return '';};
 const before=rows.filter(r=>date(r.Date)&&date(r.Date)<String(cutoff));
 const season=Number(String(cutoff).slice(0,4))-(Number(String(cutoff).slice(5,7))<7?1:0);
 const start=year=>String(year)+'-07-01';
 const last3=before.filter(r=>date(r.Date)>=start(season-3)&&date(r.Date)<start(season));
 const current=before.filter(r=>date(r.Date)>=start(season));
 const subsets={h2h:before.filter(r=>date(r.Date)>=start(season-3)&&norm(r.HomeTeam)===norm(home)&&norm(r.AwayTeam)===norm(away)),
 home3:last3.filter(r=>norm(r.HomeTeam)===norm(home)),away3:last3.filter(r=>norm(r.AwayTeam)===norm(away)),
 homeCurrent:current.filter(r=>norm(r.HomeTeam)===norm(home)),awayCurrent:current.filter(r=>norm(r.AwayTeam)===norm(away))};
 return Object.fromEntries(Object.entries(subsets).map(([key,value])=>[key,summarize(value)]));
}

// Independent full-catalog audit. Does not apply the legacy eligibility filter.
function auditAll(rows,markets,settle,cutoff,options={}){
 const expectedCatalog=options.expectedCatalog??764,minSample=options.minSample??20;
 if(!Array.isArray(rows)||!Array.isArray(markets)||typeof settle!=='function'||!Number.isInteger(minSample)||minSample<1)throw Error('Invalid coverage inputs');
 const ids=new Set(),valid=rows.filter(r=>String(r.Date)<String(cutoff));
 const items=markets.map(m=>{
  if(!m||typeof m.id!=='string'||ids.has(m.id))throw Error('Missing or duplicate market ID');
  ids.add(m.id);let n=0,hits=0,missingRows=0;
  for(const r of valid){const v=settle(r,m.id);
   if(v===null||v===undefined){missingRows++;continue;}
   if(typeof v!=='boolean')throw Error('Invalid settlement for '+m.id);
   n++;if(v)hits++;
  }
  const status=n===0?'PENDIENTE_FUENTE':n<minSample?'MUESTRA_INSUFICIENTE':'CALCULABLE';
  return {id:m.id,status,n,hits,frequency:status==='CALCULABLE'?hits/n:null,missingRows};
 });
 const counts={CALCULABLE:0,MUESTRA_INSUFICIENTE:0,PENDIENTE_FUENTE:0};
 for(const item of items)counts[item.status]++;
 return {expectedCatalog,catalogCount:markets.length,catalogComplete:markets.length===expectedCatalog,
  validHistoricalRows:valid.length,counts,coveragePct:markets.length?100*counts.CALCULABLE/markets.length:0,
  fullCatalogCoveragePct:100*counts.CALCULABLE/expectedCatalog,items};
}
g.RadarCP033Coverage={eligible,filter,summarize,windows,auditAll,excluded:EXCLUDED_PREFIXES};
})(typeof window!=='undefined'?window:globalThis);
