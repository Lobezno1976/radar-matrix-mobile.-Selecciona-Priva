"""CP-033 joint-frequency reference implementation, aligned to cp033_joint.js."""
from cp033_semantic import conflict as semantic_conflict
def build(rows, markets, settle, cutoff, options=None):
    o=options or {}
    minimum=o.get('minSample',20);core=o.get('coreSize',3);sat=o.get('satCount',3)
    if not (2<=core<=4 and 0<=sat<=3):raise ValueError('Invalid CORE/SAT size')
    data=[r for r in rows if str(r['Date'])<str(cutoff)]
    matrix=[[settle(r,m['id']) for r in data] for m in markets]
    candidates=[]
    for i,m in enumerate(markets):
        values=[v for v in matrix[i] if v is not None]
        n=len(values);hits=sum(v is True for v in values)
        if n>=minimum:candidates.append(dict(index=i,id=m['id'],n=n,frequency=hits/n))
    candidates=sorted(candidates,key=lambda x:(-x['frequency'],-x['n'],x['id']))[:o.get('maxCandidates',40)]
    conflict=o.get('conflicts') or (lambda a,b:semantic_conflict(a,b,settle))
    prices=o.get('verifiedJointOdds',{})
    def evaluate(indices):
        ids=[markets[i]['id'] for i in indices];n=hits=0
        for k in range(len(data)):
            vals=[matrix[i][k] for i in indices]
            if any(v is None for v in vals):continue
            n+=1
            if all(v is True for v in vals):hits+=1
        q=prices.get('|'.join(sorted(ids)))
        odds=float(q['odds']) if q and q.get('verified') is True and float(q.get('odds',0))>1 else None
        freq=hits/n if n else None
        return dict(indices=indices,ids=ids,n=n,hits=hits,frequency=freq,verifiedJointOdds=odds,ev=freq*odds-1 if odds is not None and freq is not None else None)
    def ranking(x):
        ev=x['ev']
        return (ev is None,-ev if ev is not None else 0,-x['frequency'],-x['n'],'|'.join(x['ids']))
    beam=[dict(indices=[])];stages=[];examined=0
    for depth in range(1,core+sat+1):
        unique={}
        for parent in beam:
            for c in candidates:
                i=c['index']
                if i in parent['indices'] or any(conflict(markets[j],markets[i]) for j in parent['indices']):continue
                ids=sorted(parent['indices']+[i],key=lambda j:markets[j]['id'])
                v=evaluate(ids);examined+=1
                if v['n']<minimum:continue
                key='|'.join(v['ids'])
                if key not in unique or ranking(v)<ranking(unique[key]):unique[key]=v
        ranked=sorted(unique.values(),key=ranking)
        if not ranked:return dict(version='CP033_V0_2',status='NO_ADMISSIBLE_CHAIN',depth=depth,stages=stages,examined=examined)
        best=ranked[0];stages.append({k:v for k,v in best.items() if k!='indices'})
        beam=[best] if depth>=core else ranked[:o.get('beamWidth',100)]
    return dict(version='CP033_V0_2',status='EXPERIMENTAL_JOINT_SEARCH',core=stages[core-1],sat=stages[core:core+sat],stages=stages,examined=examined,optimalityProven=False,frequencyType='historical_joint',priceRequirement='verified_joint_quote')
