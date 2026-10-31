import sys;import os;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from common import *
tot={}
for t in PROP:
  R=rows(t);out=[]
  for mode,kw in [("lin",{}),("k2",{}),("fill",dict(lo=800,hi=1000)),("fill",dict(lo=700,hi=900)),("fill",dict(lo=900,hi=1100)),("fill",dict(lo=850,hi=850.1))]:
    X=feats(R,mode,**kw);f=fit(X);key=mode+str(kw.get("lo",""))+"-"+str(kw.get("hi",""));out.append((key,f["nll"]));tot[key]=tot.get(key,0)+f["nll"]
  print(t,len(R),out)
print("TOT",{k:round(v,1) for k,v in tot.items()})
