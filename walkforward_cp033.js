/* Walk-forward: freeze selection before each completed fixture; no future leakage. */
(function(g){'use strict';
function evaluate(rows,markets,opts={}){
 const settle=g.RadarMobileCatalog.settle,run=g.RadarCP033Adapter.run,norm=g.RadarCP033Adapter.normalize;
 const cutoff=String(opts.cutoff||'9999-12-31'),limit=Math.max(1,Math.min(300,Number(opts.limit)||10));
 const dated=rows.filter(r=>/^\d{4}-\d{2}-\d{2}$/.test(String(r.Date))&&r.Date<cutoff&&Number.isInteger(Number(r.FTHG))&&Number.isInteger(Number(r.FTAG))&&String(r.FTHG).trim()!==''&&String(r.FTAG).trim()!=='').sort((a,b)=>b.Date.localeCompare(a.Date));
 const seen=new Set(),fixtures=[];
 for(const r of dated){const key=r.Date+'|'+norm(r.HomeTeam)+'|'+norm(r.AwayTeam);if(seen.has(key))continue;seen.add(key);fixtures.push(r);if(fixtures.length>=limit)break}
 const records=[],totals={},marketUsage={};
 for(const row of fixtures){let prediction;try{prediction=run(rows,row.HomeTeam,row.AwayTeam,row.Date,markets,{diversifyFamilies:true,minTheoreticalOdds:opts.minTheoreticalOdds??1.125,lineRetention:opts.lineRetention??0.70})}catch(e){records.push({date:row.Date,match:row.HomeTeam+' – '+row.AwayTeam,status:'ERROR',detail:e.message});continue}
 if(!prediction.variants){records.push({date:row.Date,match:row.HomeTeam+' – '+row.AwayTeam,status:prediction.status||'NO_SELECTION'});continue}
 for(const v of prediction.variants){const outcomes=(v.legs||[]).map(l=>settle(row,l.id));const result=outcomes.some(x=>x===null||x===undefined)?'UNKNOWN':outcomes.every(Boolean)?'HIT':'MISS';const key=v.name;const t=totals[key]??={hit:0,miss:0,unknown:0,predicted:0};t.predicted++;for(const l of v.legs||[]){const id=l.id;marketUsage[id]=(marketUsage[id]||0)+1}if(result==='HIT')t.hit++;else if(result==='MISS')t.miss++;else t.unknown++;records.push({date:row.Date,match:row.HomeTeam+' – '+row.AwayTeam,branch:key,result,ids:v.legs.map(l=>l.id),historical:v.joint_frequency})}
 }
 return {status:'WALK_FORWARD_DESCRIPTIVE',fixtures:fixtures.length,records,totals,marketUsage,cutoff,limit,method:'Each selection uses rows strictly before fixture date; results scored on that fixture; missing statistics UNKNOWN'};
}
g.RadarWalkForward={evaluate};
})(typeof window!=='undefined'?window:globalThis);
