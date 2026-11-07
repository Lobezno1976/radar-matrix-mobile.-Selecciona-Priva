/* Isolated CP-033 historical reconciliation; CP-032 untouched. */
(function(g){'use strict';
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const key=r=>[String(r.Date).slice(0,10),norm(r.HomeTeam),norm(r.AwayTeam)].join('|');
function reconcile(existing,incoming,source,at){
 const rows=existing.map(x=>({...x})),lookup=new Map(rows.map((r,i)=>[key(r),i])),events=[],conflicts=[];
 for(const item of incoming){
  const k=key(item),score=[item.FTHG,item.FTAG];
  if(!item.Date||!item.HomeTeam||!item.AwayTeam||score.some(x=>x===null||x===undefined||x===''||!Number.isInteger(Number(x))||Number(x)<0)){events.push({key:k,action:'INVALID',source,at});continue}
  const i=lookup.get(k);
  if(i===undefined){lookup.set(k,rows.length);rows.push({...item});events.push({key:k,action:'ADDED',source,at});continue}
  const patch={},fields=[];
  for(const [field,value] of Object.entries(item)){
   if(value===null||value===undefined||value==='')continue;
   if(rows[i][field]===null||rows[i][field]===undefined||rows[i][field]===''){patch[field]=value;fields.push(field)}
   else if(String(rows[i][field])!==String(value))conflicts.push({key:k,field,stored:rows[i][field],incoming:value,source,at});
  }
  if(fields.length){rows[i]={...rows[i],...patch};events.push({key:k,action:'ENRICHED',fields,source,at})}
  else events.push({key:k,action:'UNCHANGED',source,at});
 }
 return {rows,events,conflicts};
}
function fromProvider(p,parseDate){
 const r={Date:parseDate(p.date),HomeTeam:p.home,AwayTeam:p.away};
 const fields={FTHG:'home_goals',FTAG:'away_goals',HS:'home_shots',AS:'away_shots',HST:'home_sot',AST:'away_sot',HC:'home_corners',AC:'away_corners',HY:'home_cards',AY:'away_cards',HF:'home_fouls',AF:'away_fouls',HTHG:'home_ht_goals',HTAG:'away_ht_goals'};
 for(const [target,field] of Object.entries(fields)){const v=p[field];if(v!==null&&v!==undefined&&String(v).trim()!=='')r[target]=v}
 return r;
}
function audit(rows,fixtures,season,at){
 const rounds=Array.from({length:38},(_,i)=>({season,round:i+1,expected:10,finalized:0,missing:10,duplicates:0,complete:false,checkedAt:at})),seen=new Set(),existing=new Set(rows.map(key));
 for(const f of fixtures){
  const n=Number(f.round??f.matchday??f.jornada);if(!Number.isInteger(n)||n<1||n>38)continue;
  const r={Date:f.date??f.Date,HomeTeam:f.home??f.HomeTeam,AwayTeam:f.away??f.AwayTeam},k=key(r),x=rounds[n-1];
  if(seen.has(k)){x.duplicates++;continue}seen.add(k);if(existing.has(k))x.finalized++;
 }
 for(const x of rounds){x.missing=Math.max(0,10-x.finalized);x.complete=x.finalized===10&&x.duplicates===0}
 return rounds;
}
g.RadarCP033Journal={reconcile,audit,key,fromProvider};
})(typeof window!=='undefined'?window:globalThis);
