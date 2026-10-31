import sys;import os;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from common import *
RR={t:rows(t) for t in PROP};res=[]
for trade in [False,True]:
  for a in [1000,1100,1200]:
    for span in [100,200,300]:
      for kmax in [2,3,4,6]:
        tot=0;per={}
        for t,R in RR.items():
          f=fit(feats3(R,a,span,kmax,trade));tot+=f["nll"];per[t]=f["nll"]
        res.append((round(tot,1),trade,a,span,kmax,per))
res.sort(key=lambda x:x[0])
for r in res[:8]:print(r)
print("k2 fisso: 182.2")
