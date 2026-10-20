/* Execute in browser console after loading catalog_mobile.js and bidirectional_selector.js. */
(function(){
 const api=globalThis.RadarBidirectionalSelector,settle=globalThis.RadarMobileCatalog.settle;
 const assert=(x,msg)=>{if(!x)throw Error('FAIL: '+msg)};
 const ids=['CG7p5','CL11p5','GG1p5','GL3p5','CHG2p5','CHL8p5','BTTS_Y'];
 const rows=[
  {HC:8,AC:7,FTHG:1,FTAG:1},
  {HC:3,AC:4,FTHG:2,FTAG:0},
  {HC:5,AC:5,FTHG:1,FTAG:1},
  {HC:'',AC:3,FTHG:1,FTAG:0}
 ];
 assert(api.parse('CG7p5').side==='over','parse over');
 assert(api.parse('CL11p5').side==='under','parse under');
 assert(api.parse('CHG2p5').scope==='home','home corners');
 assert(api.parse('GO1G0p5')===null,'first-half excluded');
 const cat=ids.map(id=>({id,label:id}));
 const result=api.compare(rows,cat,[],{settle,minSample:2});
 const corners=result.groups.find(x=>x.group==='C:total');
 assert(corners&&corners.comparedBoth,'compare both corner directions');
 assert(corners.over.jointHits===2&&corners.over.baseHits===3,'over count excludes missing');
 assert(corners.under.jointHits===2&&corners.under.baseHits===3,'under count excludes missing');
 const conditional=api.compare(rows,cat,[{id:'GG1p5'}],{settle,minSample:2}).groups.find(x=>x.group==='C:total');
 assert(conditional.over.baseHits===3&&conditional.over.jointHits===2,'conditional denominator');
 assert(api.compare(rows,cat,[],{settle,minSample:10}).groups.find(x=>x.group==='C:total').best===null,'minimum sample');
 console.log('CP-032 bidirectional smoke tests PASS');
})();
