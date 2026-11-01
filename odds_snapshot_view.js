(function(g){'use strict';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\b(cf|fc|club|de|la)\b/g,'').replace(/[^a-z0-9]/g,'');
function findEvent(snapshot,home,away){
 const events=Array.isArray(snapshot?.events)?snapshot.events:[];
 const h=norm(home),a=norm(away);
 const matches=events.filter(e=>norm(e.home_team)===h&&norm(e.away_team)===a);
 return matches.length===1?matches[0]:null;
}
function marketFor(id,event){
 if(!event)return null;
 if(id==='W_H'||id==='W_D'||id==='W_A')return {key:'h2h',name:id==='W_H'?event.home_team:id==='W_A'?event.away_team:'Draw',point:null};
 const m=/^GG(\d+)p5$/.exec(id)||/^GL(\d+)p5$/.exec(id);
 if(m)return {key:'totals',name:id.startsWith('GG')?'Over':'Under',point:Number(m[1])+.5};
 return null;
}
function quote(snapshot,event,id){
 const target=marketFor(id,event);if(!target)return null;
 const found=[];
 for(const book of event.bookmakers||[])for(const market of book.markets||[]){
 if(market.key!==target.key)continue;
 for(const outcome of market.outcomes||[])if(outcome.name===target.name&&(target.point===null||Number(outcome.point)===target.point)&&Number.isFinite(Number(outcome.price))&&Number(outcome.price)>1)found.push({bookmaker:book.title,bookmakerKey:book.key,odds:Number(outcome.price),updatedAt:market.last_update||book.last_update});
 }
 found.sort((a,b)=>b.odds-a.odds);
 return found.find(x=>x.bookmakerKey==='bet365')||found[0]||null;
}
async function load(url='./data/odds_snapshot.json'){
 try{const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);
 const data=await response.json();if(data.source!=='The Odds API'||!Array.isArray(data.events))throw Error('Invalid snapshot');
 return {status:'AVAILABLE',data};
 }catch(e){return {status:'UNAVAILABLE',error:String(e.message||e)}}
}
g.RadarOddsSnapshot={norm,findEvent,marketFor,quote,load};
})(typeof window!=='undefined'?window:globalThis);
