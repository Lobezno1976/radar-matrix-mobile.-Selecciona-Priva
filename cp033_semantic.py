"""CP-033 semantic market constraints (Python parity with cp033_semantic.js)."""
import re
PAT=re.compile(r'^(SG|SL|SA[GL]|SH[GL]|RG|RL|RA[GL]|RH[GL]|FG|FL|FA[GL]|FH[GL]|CG|CL|CA[GL]|CH[GL]|TG|TL|TA[GL]|TH[GL]|GG|GL|GA[GL]|GH[GL]|GO[12][GL])(\d+)p5$')
def axis(id):
 m=PAT.fullmatch(id)
 if m:
  c=m.group(1);period=c[:3] if c.startswith('GO') else 'FT'
  side='total' if c.startswith('GO') or len(c)==2 else 'home' if c[1]=='H' else 'away'
  return f'{c[0]}:{period}:{side}'
 if id.startswith(('BTTS_','W_')):return 'G:FT:total'
 if id.startswith('WC_'):return 'C:FT:total'
 if id.startswith('WT_'):return 'T:FT:total'
 return None
def conflict(a,b,settle):
 x,y=a['id'],b['id']
 if x==y:return True
 ax,ay=axis(x),axis(y)
 if not ax or not ay or ax[0]!=ay[0]:return False
 if ':GO' in ax or ':GO' in ay:return ax==ay
 if re.search(r'\d+p5
 family=ax[0]
 if family not in 'GCT' or ':FT:' not in ax or ':FT:' not in ay:return False
 maximum=12 if family=='G' else 25
 both=only_x=only_y=0
 for h in range(maximum+1):
  for v in range(maximum+1):
   r=dict(FTHG=h,FTAG=v,HC=h,AC=v,HY=h,AY=v)
   p,q=settle(r,x),settle(r,y)
   if p is None or q is None:return False
   if p and q:both+=1
   elif p:only_x+=1
   elif q:only_y+=1
 return both==0 or only_x==0 or only_y==0
,x) and re.search(r'\d+p5
 family=ax[0]
 if family not in 'GCT' or ':FT:' not in ax:return False
 maximum=12 if family=='G' else 25
 both=only_x=only_y=0
 for h in range(maximum+1):
  for v in range(maximum+1):
   r=dict(FTHG=h,FTAG=v,HC=h,AC=v,HY=h,AY=v)
   p,q=settle(r,x),settle(r,y)
   if p is None or q is None:return False
   if p and q:both+=1
   elif p:only_x+=1
   elif q:only_y+=1
 return both==0 or only_x==0 or only_y==0
,y) and ax==ay:return True
 family=ax[0]
 if family not in 'GCT' or ':FT:' not in ax:return False
 maximum=12 if family=='G' else 25
 both=only_x=only_y=0
 for h in range(maximum+1):
  for v in range(maximum+1):
   r=dict(FTHG=h,FTAG=v,HC=h,AC=v,HY=h,AY=v)
   p,q=settle(r,x),settle(r,y)
   if p is None or q is None:return False
   if p and q:both+=1
   elif p:only_x+=1
   elif q:only_y+=1
 return both==0 or only_x==0 or only_y==0
