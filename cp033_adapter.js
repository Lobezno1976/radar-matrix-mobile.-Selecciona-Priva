/* CP-033 first canonical baseline adapter. CP-032 remains selectable for rollback. */
(function(g){'use strict';
function norm(s){
 const raw=String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const aliases={
 'real betis balompie':'betis','real betis':'betis','malaga cf':'malaga','villarreal cf':'villarreal',
 'rcd espanyol de barcelona':'espanyol','rcd espanyol':'espanyol','elche cf':'elche','valencia cf':'valencia',
 'athletic club':'ath bilbao','athletic bilbao':'ath bilbao','real sociedad de futbol':'sociedad','real sociedad':'sociedad',
 'levante ud':'levante','club atletico de madrid':'at madrid','atletico madrid':'at madrid',
 'rc deportivo la coruna':'deportivo','deportivo la coruna':'deportivo','ca osasuna':'osasuna',
 'fc barcelona':'barcelona','deportivo alaves':'alaves','getafe cf':'getafe','sevilla fc':'sevilla',
 'real racing club de santander':'racing santander','racing santander':'racing santander',
 'real madrid cf':'real madrid','rayo vallecano de madrid':'rayo vallecano','rc celta de vigo':'celta',
 'celta vigo':'celta'
 };
 return aliases[raw]||raw;
}
function run(rows,home,away,cutoff,markets,opts={}){
 if(norm(home)===norm(away))throw Error('Equipos idénticos');
 const context=rows.filter(r=>String(r.Date)<String(cutoff)&&(norm(r.HomeTeam)===norm(home)||norm(r.AwayTeam)===norm(away)));
 const gate=opts.historicalGate===false?null:g.RadarCP033Comparison.govern(rows,home,away,cutoff,markets,opts.verifiedMarketOdds||{},opts.gateOptions||{});
 const admitted=gate?gate.markets:markets;
 if(gate&&admitted.length<2)return {status:'NO_HISTORICAL_CANDIDATES',version:'CP033_GOVERNED_1',context_rows:context.length,comparison:gate.comparison,audit:{catalogCount:markets.length,governedCount:admitted.length,gatePolicy:gate.policy}};
 const result=g.RadarCP033Joint.build(context,admitted,g.RadarMobileCatalog.settle,cutoff,{
  minSample:opts.minSample??20,coreSize:opts.coreSize??3,satCount:opts.satCount??3,
  maxCandidates:opts.maxCandidates??40,beamWidth:opts.beamWidth??100,
  verifiedJointOdds:opts.verifiedJointOdds||{},diversifyFamilies:opts.diversifyFamilies!==false,
  minTheoreticalOdds:opts.minTheoreticalOdds??1.125,lineRetention:opts.lineRetention??0.70
 });
 if(result.status!=='EXPERIMENTAL_JOINT_SEARCH')return {status:result.status,version:'CP033_GOVERNED_1',comparison:gate?.comparison,context_rows:context.length,home_rows:rows.filter(r=>String(r.Date)<String(cutoff)&&norm(r.HomeTeam)===norm(home)).length,away_rows:rows.filter(r=>String(r.Date)<String(cutoff)&&norm(r.AwayTeam)===norm(away)).length,details:result,audit:result.audit};
 const index=new Map(admitted.map(m=>[m.id,m]));
 const variants=[result.core,...result.sat].map((s,i)=>({
  name:['CORE','SAT1','SAT2','SAT3'][i],legs:s.ids.map(id=>index.get(id)),
  joint_hits:s.hits,joint_n:s.n,joint_frequency:s.frequency,
  independence_product:s.independenceProduct??null,independence_gap:s.independenceGap??null,
  break_even_odds:s.breakEvenOdds??null,removal_sensitivity:s.removalSensitivity??[],
  train_by_context:[{hits:s.hits,n:s.n,pct:s.frequency===null?null:Math.round(s.frequency*100000)/1000}],
  holdout_by_context:[],verified_joint_odds:s.verifiedJointOdds,ev:s.ev
 }));
 return {status:'CP033_GOVERNED_1',version:'CP033_V0_2',variants,comparison:gate?.comparison,
  core_comparison:result.coreOptions.map(x=>({ids:x.ids,legs:x.ids.length,hits:x.hits,n:x.n,frequency:x.frequency,independence_product:x.independenceProduct,independence_gap:x.independenceGap,break_even_odds:x.breakEvenOdds,verified_joint_odds:x.verifiedJointOdds,ev:x.ev,removal_sensitivity:x.removalSensitivity})),
  context_rows:context.length,extensions_examined:result.examined,audit:{...result.audit,originalCatalogCount:markets.length,governedCount:admitted.length,gatePolicy:gate?.policy},
  historical_only:true,calibrated:false,global_optimum_proven:false,
  economic_validation:false,context_policy:'home_local_or_away_visitor_union'};
}
g.RadarCP033Adapter={run,normalize:norm};
})(typeof window!=='undefined'?window:globalThis);
