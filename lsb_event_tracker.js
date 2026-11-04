/* LSB-LIVE event tracker v1: signals, subsequent goals, and final settlement. */
(function(g){'use strict';
const parse=s=>{const m=/^(\d+)-(\d+)$/.exec(String(s||''));return m?[+m[1],+m[2]]:null};
const key=x=>String(x.match||'').trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ')+'|'+String(x.time||'').slice(0,10);
const sameSession=(a,b)=>{const name=x=>String(x.match||'').trim().toLocaleLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/\\s+/g,' ');const t=Date.parse(a.time),u=Date.parse(b.time);return name(a)===name(b)&&Number.isFinite(t)&&Number.isFinite(u)&&u>=t&&u-t<=8*3600000};
const goals=(a,b)=>{const x=parse(a),y=parse(b);return x&&y&&y[0]>=x[0]&&y[1]>=x[1]?[y[0]-x[0],y[1]-x[1]]:null};
function evaluate(signal,events=[]){
 const relevant=events.filter(e=>sameSession(signal,e)&&e.type==='goal'&&Number.isFinite(+e.minute)&&String(e.time||'')>String(signal.time||'')).sort((a,b)=>String(a.time).localeCompare(String(b.time)));
 let latest=signal.score,used=0,invalid=0;
 for(const e of relevant){if(!goals(latest,e.score)){invalid++;continue}latest=e.score;used++}
 const finalEvents=events.filter(e=>sameSession(signal,e)&&e.type==='final'&&String(e.time||'')>=String(signal.time||'')).sort((a,b)=>String(a.time).localeCompare(String(b.time)));
 const final=finalEvents.length?finalEvents[finalEvents.length-1].score:signal.final||'';
 if(final&&goals(latest,final)===null)return {status:'conflict',reason:'Final score precedes observed goals'};
 const progress=goals(signal.score,latest);
 if(!progress)return {status:'conflict',reason:'Invalid goal progression'};
 const required=signal.market==='remaining_over_1_5'?2:1;
 const counted=signal.market==='home_remaining_over_0_5'?progress[0]:progress[0]+progress[1];
 const finalProgress=final?goals(signal.score,final):null;
 if(final&&!finalProgress)return {status:'conflict',reason:'Final score lower than entry'};
 const won=finalProgress&&(signal.market==='home_remaining_over_0_5'?finalProgress[0]:finalProgress[0]+finalProgress[1])>=required;
 return {status:final?(won?'win':'loss'):'live',counted,required,remaining:Math.max(0,required-counted),latest,final:final||null,goalEvents:used,invalidEvents:invalid};
}
function validateEvent(e){return e&&['goal','final'].includes(e.type)&&typeof e.match==='string'&&e.match.trim()&&typeof e.time==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d/.test(e.time)&&Number.isInteger(+e.minute)&&+e.minute>=0&&+e.minute<=130&&parse(e.score)}
g.LSBEventTracker={parse,key,goals,evaluate,validateEvent};
})(typeof window!=='undefined'?window:globalThis);
