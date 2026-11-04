/* LSB-LIVE Telegram export adapter v1. Conservative: only explicit signals; no invented odds or stakes. */
(function(g){'use strict';
function plain(t){return typeof t==='string'?t:Array.isArray(t)?t.map(x=>typeof x==='string'?x:(x&&x.text)||'').join(''):''}
function parseMessage(msg){
 const text=plain(msg.text),clean=text.replace(/\u00a0/g,' ');
 if(!/LIVE/i.test(clean)||!/(?:m[aá]s de|over)\s*[01][.,][05]/i.test(clean))return {status:'skip',reason:'No explicit LIVE goal signal'};
 const marketText=(clean.match(/(?:✅|mercado\s*[:\-])[^\n]*/i)||[])[0]||'';
 const line=marketText||clean;
 const n=(line.match(/(?:m[aá]s de|over)\s*([01])[.,]([05])/i)||[]);
 if(!n.length)return {status:'review',reason:'Market not identified',text:clean};
 const threshold=Number(n[1]+'.'+n[2]);
 const home=/\b(local|home|equipo local)\b/i.test(line);
 const remaining=/resto del partido|restantes?|remaining/i.test(line);
 if(!remaining)return {status:'review',reason:'Unclear whether total or remaining goals',text:clean};
 const market=home&&threshold===0.5?'home_remaining_over_0_5':!home&&threshold===0.5?'remaining_over_0_5':!home&&threshold===1.5?'remaining_over_1_5':null;
 const minute=(clean.match(/(?:minuto|minute)\s*[:：]?\s*(\d{1,3})/i)||[])[1];
 const match=(clean.match(/(?:👕|partido\s*[:：])\s*([^\n]+?)\s*[:：]\s*(\d+)\s*[-–]\s*(\d+)/i)||[]);
 const odds=(clean.match(/cuota\s*(?:LIVE|en vivo)?\s*[:：]?\s*(\d+(?:[.,]\d+)?)/i)||[])[1];
 if(!market||!minute||!match.length||!odds||!msg.date)return {status:'review',reason:'Missing or ambiguous market, minute, teams, score, odds or date',text:clean};
 const teams=match[1].trim();if(!/\s[-–]\s/.test(teams))return {status:'review',reason:'Teams not separated',text:clean};
 const price=Number(odds.replace(',','.'));if(price<=1||!Number.isFinite(price))return {status:'review',reason:'Invalid odds',text:clean};
 const date=String(msg.date).replace(' ','T').slice(0,16);
 const record={match:teams,time:date,minute:Number(minute),score:match[2]+'-'+match[3],market,odds:price,stake:0,final:'',source:'telegram',source_id:String(msg.id||'')};
 return {status:'ok',record};
}
function parseExport(data){if(!data||!Array.isArray(data.messages))throw Error('Expected Telegram Desktop JSON with messages array');const records=[],review=[];let skipped=0;for(const msg of data.messages){const x=parseMessage(msg);if(x.status==='ok')records.push(x.record);else if(x.status==='review')review.push({id:msg.id||'',reason:x.reason,text:x.text});else skipped++}return {records,review,skipped}}
g.LSBTelegramAdapter={parseMessage,parseExport};
})(typeof window!=='undefined'?window:globalThis);
