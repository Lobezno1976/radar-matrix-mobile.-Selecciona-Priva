/* CP-033 first canonical baseline adapter. CP-032 remains selectable for rollback. */
(function(g){'use strict';
function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();}
function run(rows,home,away,cutoff,markets,opts={}){
 if(norm(home)===norm(away))throw Error('Equipos idénticos');
 const context=rows.filter(r=>String(r.Date)<String(cutoff)&&(norm(r.HomeTeam)===norm(home)||norm(r.AwayTeam)===norm(away)));
 const result=g.RadarCP033Joint.build(context,markets,g.RadarMobileCatalog.settle,cutoff,{
  minSample:opts.minSample??20,coreSize:opts.coreSize??3,satCount:opts.satCount??3,
  maxCandidates:opts.maxCandidates??40,beamWidth:opts.beamWidth??100,
  verifiedJointOdds:opts.verifiedJointOdds||{}
 });
 if(result.status!=='EXPERIMENTAL_JOINT_SEARCH')return {status:result.status,version:'CP033_CANONICAL_BASELINE_1',context_rows:context.length,details:result};
 const index=new Map(markets.map(m=>[m.id,m]));
 const variants=[result.core,...result.sat].map((s,i)=>({
  name:['CORE','SAT1','SAT2','SAT3'][i],legs:s.ids.map(id=>index.get(id)),
  joint_hits:s.hits,joint_n:s.n,joint_frequency:s.frequency,
  train_by_context:[{hits:s.hits,n:s.n,pct:s.frequency===null?null:Math.round(s.frequency*100000)/1000}],
  holdout_by_context:[],verified_joint_odds:s.verifiedJointOdds,ev:s.ev
 }));
 return {status:'CP033_CANONICAL_BASELINE_1',version:'CP033_V0_2',variants,
  context_rows:context.length,extensions_examined:result.examined,
  historical_only:true,calibrated:false,global_optimum_proven:false,
  economic_validation:false,context_policy:'home_local_or_away_visitor_union'};
}
g.RadarCP033Adapter={run};
})(typeof window!=='undefined'?window:globalThis);
