import sys;import os;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from common import *
tot={}
for t in PROP:
  R=rows(t);o=[]
  for lo,hi in [(800,1000),(900,1100),(700,1000)]:
    for e in [.1,.25,.4]:
      f=fit(feats2(R,lo,hi,e));k=f"{lo}-{hi} e{e}";o.append((k,f["nll"]));tot[k]=tot.get(k,0)+f["nll"]
  print(t,o)
print(sorted((round(v,1),k) for k,v in tot.items())[:6])
