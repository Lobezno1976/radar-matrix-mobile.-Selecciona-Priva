import unittest
from cp033_joint import build
class CP033Contract(unittest.TestCase):
 def test_nested_and_cutoff(self):
  markets=[dict(id=c,group=c) for c in 'ABCDE']
  rows=[dict(Date='2026-01-01',i=i) for i in range(50)]+[dict(Date='2026-03-01',i=0)]
  def settle(r,id):
   return id=='A' or r['i']%dict(B=9,C=8,D=7,E=6)[id]!=0
  result=build(rows,markets,settle,'2026-02-01',dict(minSample=10,coreSize=2,satCount=2))
  self.assertEqual(result['core']['ids'],['A','B'])
  self.assertEqual([x['ids'] for x in result['sat']],[['A','B','C'],['A','B','C','E']])
  self.assertEqual(result['examined'],30)
if __name__=='__main__':unittest.main()
