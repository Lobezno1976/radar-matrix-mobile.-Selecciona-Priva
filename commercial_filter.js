/* RADAR v9 SHADOW: denominadores de contraste compartidos con motor; 30% exploratorio. */
(function(g){'use strict';
const groups=new Set(['GG','GL','GHG','GHL','GAG','GAL','CG','CL','CHG','CHL','CAG','CAL','TG','TL','THG','THL','TAG','TAL']);
function parts(id){const m=/^([A-Z]+)(\d+)p5$/.exec(id);if(!m||!groups.has(m[1]))return null;return {group:m[1],line:Number(m[2])+.5,over:m[1].endsWith('G')};}
function contexts(rows,home,away,cutoff,catalog){
 const norm=g.RadarBrowserEngine.norm,date=g.RadarBrowserEngine.date;
 return [rows.filter(r=>date(r.Date)&&date(r.Date)<cutoff&&norm(r.HomeTeam)===norm(home)),rows.filter(r=>date(r.Date)&&date(r.Date)<cutoff&&norm(r.AwayTeam)===norm(away))].map(a=>{
  a.sort((x,y)=>date(x.Date).localeCompare(date(y.Date)));
  const holdout=a.slice(Math.floor(a.length*.8));
  return holdout.filter(row=>catalog.every(m=>g.RadarMobileCatalog.settle(row,m.id)!==null));
 });
}
function rates(samples,legs){return samples.map(sample=>{let n=0,hits=0;for(const row of sample){const vals=legs.map(l=>g.RadarMobileCatalog.settle(row,l.id));if(vals.some(v=>v===null))continue;n++;if(vals.every(Boolean))hits++;}return {hits,n,pct:n?Math.round(100000*hits/n)/1000:null};});}
function propose(rows,home,away,cutoff,catalog,variants,maxRelativeLoss=.30){
 const samples=contexts(rows,home,away,cutoff,catalog),floor=1-maxRelativeLoss;
 return variants.map(v=>{
  const adjusted=v.legs.slice(),changes=[],original=rates(samples,v.legs);
  const globalOK=trial=>{const r=rates(samples,trial);return original.every((base,i)=>base.n>0&&base.hits>0&&r[i].n===base.n&&r[i].hits<=base.hits&&r[i].hits/base.hits+1e-12>=floor)};
  for(let j=0;j<v.legs.length;j++){
   const source=v.legs[j],part=parts(source.id);if(!part)continue;
   const candidates=catalog.filter(m=>{const q=parts(m.id);return q&&q.group===part.group&&(part.over?q.line>part.line:q.line<part.line)}).sort((a,b)=>{const x=parts(a.id).line,y=parts(b.id).line;return part.over?y-x:x-y});
   const before=rates(samples,adjusted.slice(0,j+1));
   for(const candidate of candidates){
    if(adjusted.some((x,k)=>k!==j&&x.id===candidate.id))continue;
    const after=rates(samples,adjusted.slice(0,j).concat(candidate));
    const localOK=before.every((x,i)=>x.n>0&&x.hits>0&&after[i].n===x.n&&after[i].hits<=x.hits&&after[i].hits/x.hits+1e-12>=floor);
    const trial=adjusted.slice();trial[j]=candidate;
    if(localOK&&globalOK(trial)&&after.some((x,i)=>x.hits<before[i].hits)){
     adjusted[j]=candidate;changes.push({from:source.label,to:candidate.label});break;
    }
   }
  }
  if(!globalOK(adjusted))return {name:v.name,legs:v.legs.slice(),changes:[],original,adjustedRates:original,lossLimit:maxRelativeLoss,rollback:true,samples:'holdout común de casos completos de 139 mercados; exploración no calibrada'};
  return {name:v.name,legs:adjusted,changes,original,adjustedRates:rates(samples,adjusted),lossLimit:maxRelativeLoss,rollback:false,samples:'holdout común de casos completos de 139 mercados; exploración no calibrada'};
 });
}

g.RadarCommercialFilter={propose,parts,rates};
})(typeof window!=='undefined'?window:globalThis);
