/* RADAR price reference: The Odds API. Public client must NEVER hold an API key. */
(function(g){'use strict';
const SOURCE='The Odds API',BOOKMAKER='bet365';
function normalize(record){
 if(!record||typeof record!=='object')throw Error('Invalid quote record');
 const odds=Number(record.odds);
 if(!Number.isFinite(odds)||odds<=1)throw Error('Invalid decimal odds');
 const legs=Array.isArray(record.legs)?[...new Set(record.legs.map(String))].sort():[];
 if(!legs.length)throw Error('Missing exact market IDs');
 return {source:SOURCE,bookmaker:record.bookmaker||null,match:record.match||null,legs,odds,
  market:record.market||null,selection:record.selection||null,
  observedAt:record.observedAt||null,available:record.available===true,
  verified:record.verified===true&&record.available===true&&record.joint===true&&record.source===SOURCE,
  joint:record.joint===true};
}
function jointQuotes(records){
 const quotes={};for(const raw of records||[]){const r=normalize(raw);
 if(!r.verified||!r.bookmaker||!r.match||!r.observedAt)continue;
 const key=r.legs.join('|');quotes[key]={odds:r.odds,verified:true,available:true,source:r.source,bookmaker:r.bookmaker,match:r.match,observedAt:r.observedAt};
 }return quotes;
}
async function fetchFromProxy(endpoint,{signal}={}){
 if(typeof endpoint!=='string'||!endpoint.trim())return {status:'NOT_CONFIGURED',source:SOURCE,records:[]};
 const url=new URL(endpoint,location.href);
 if(url.protocol!=='https:')throw Error('Odds proxy must use HTTPS');
 const response=await fetch(url.href,{signal,cache:'no-store',credentials:'omit'});
 if(!response.ok)throw Error('Odds proxy HTTP '+response.status);
 const payload=await response.json();
 if(!Array.isArray(payload.records))throw Error('Odds proxy response requires records array');
 return {status:'RECEIVED_UNVERIFIED',source:SOURCE,records:payload.records.map(normalize)};
}
g.RadarOddsAPIReference={SOURCE,BOOKMAKER,normalize,jointQuotes,fetchFromProxy};
})(typeof window!=='undefined'?window:globalThis);
