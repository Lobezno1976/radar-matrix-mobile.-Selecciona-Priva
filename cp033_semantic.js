/* CP-033 semantic constraints: same axis, implication, contradiction, equivalence. */
(function(g){'use strict';
function axis(id){
 const m=/^(SG|SL|SA[GL]|SH[GL]|RG|RL|RA[GL]|RH[GL]|FG|FL|FA[GL]|FH[GL]|CG|CL|CA[GL]|CH[GL]|TG|TL|TA[GL]|TH[GL]|GG|GL|GA[GL]|GH[GL]|GO[12][GL])(\d+)p5$/.exec(id);
 if(m){const c=m[1],f=c[0],period=c.startsWith('GO')?c.slice(0,3):'FT',side=c.startsWith('GO')?'total':c.length===2?'total':c[1]==='H'?'home':'away';return f+':'+period+':'+side;}
 if(id.startsWith('BTTS_')||id.startsWith('W_'))return 'G:FT:total';
 if(id.startsWith('WC_'))return 'C:FT:total';
 if(id.startsWith('WT_'))return 'T:FT:total';
 return null;
}
function conflict(a,b,settle){
 const x=a.id,y=b.id;if(x===y)return true;
 const ax=axis(x),ay=axis(y);
 if(!ax||ax!==ay)return false;
 // Same numerical axis: alternative lines are competing choices, not extra legs.
 const numeric=/\d+p5$/;
 if(numeric.test(x)&&numeric.test(y))return true;
 // Enumerate full scores in bounded domain to test special/numeric logical relations.
 const family=ax[0];if(!['G','C','T'].includes(family)||!ax.includes(':FT:'))return false;
 const max=family==='G'?12:25;
 let both=0,onlyX=0,onlyY=0;
 for(let h=0;h<=max;h++)for(let v=0;v<=max;v++){
  const r={FTHG:h,FTAG:v,HC:h,AC:v,HY:h,AY:v};
  const p=settle(r,x),q=settle(r,y);
  if(p===null||q===null||p===undefined||q===undefined)return false;
  if(p&&q)both++;else if(p)onlyX++;else if(q)onlyY++;
 }
 return both===0||onlyX===0||onlyY===0;
}
g.RadarCP033Semantic={axis,conflict};
})(typeof window!=='undefined'?window:globalThis);
