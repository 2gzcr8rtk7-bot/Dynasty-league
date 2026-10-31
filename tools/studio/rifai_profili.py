import sys,subprocess,json,re,math;import os;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from common import *
s=open("/home/claude/dynasty-league/index.html",encoding="utf-8").read()
OLD=json.loads(re.search(r"const GM_GUSTI=(\{.*?\});\n",s).group(1))
STAR=lambda n:val(n)>=1000
FILL=lambda n:val(n)<900
def kw(L):
  ps={n:pts(n) for n,_ in L};mx=max(ps.values()) if ps else 1;return {n:p*(p/mx)**2 for n,p in ps.items()}
def credit(g,r):
  """quota di merito per ogni giocatore: se nello scambio c'e' almeno un giocatore da 1000+, i riempitivi (<900) non prendono nulla"""
  anyS=any(STAR(n) for n,_ in g+r);out={}
  for side in (g,r):
    L=[(n,x) for n,x in side if not(anyS and FILL(n))] or ([] if anyS else side)
    if not L: continue
    w=kw(L);sw=sum(w.values()) or 1
    for n in w: out[n]=w[n]/sw
  return out
NEW={};LOG={}
for t in ["TUR","SPI","DOL","PEA","FOX","DUC"]:
  o=OLD[t];prof=dict(role=o.get("role",{"G":0,"F":0,"C":0}),age=o.get("age",0),req=o.get("req",10),sc=o.get("sc",15))
  src={};npro=0
  R=rows(t)
  if R:
    X=feats(R,"k2");f=fit(X);prof.update(req=f["req"],age=f["age"],sc=f["sc"],role=f["role"]);npro=len(R)
    res={}
    for d,da,r,y,g,W in X:
      z=d-f["age"]*da-f["req"]+sum(f["role"][x[1]] for x in r)/len(r);p=1/(1+math.exp(-z/f["sc"]));cr=credit(g,r)
      for n,q in cr.items():
        if q<=0:continue
        sgn=1 if any(n==x for x,_ in r) else -1
        a=res.setdefault(n,[0,0]);a[0]+=q;a[1]+=sgn*(y-p)*q
    pl={}
    for n,(c,rs) in res.items():
      if c<2.5 or val(n)<300:continue
      v=max(-10,min(10,rs/c/0.2*f["sc"]*0.5))*min(1,c/6)
      if abs(v)>=3: pl[n]=round(v,1)
    src["prop"]=pl
  if t in CONF:
    j=json.loads(subprocess.run(["python3","/home/claude/dynasty-league/tools/gm_fit.py","confronto",D+CONF[t]+"-attachment.txt"],capture_output=True,text=True).stdout)
    src["conf"]=j["pl"];nconf=j["confronti"]
  else: nconf=0
  nval=0
  if t in VALU:
    pl={}
    for l in open(D+VALU[t]+"-attachment.txt",encoding="utf-8"):
      m=re.match(r"\d+\. (.+?)(?: \[[^\]]*\])? \(\w+, \w, \d+a, calc \d+\) → GM (\d+)/10 vs noi (\d+)",l)
      if m:
        nval+=1;n=m.group(1);d=int(m.group(2))-int(m.group(3))
        if d and val(n)>=900: pl[n]=max(-12,min(12,d*4))
    src["val"]=pl
  allk=set(k for v in src.values() for k in v);pl={}
  for n in allk:
    xs=[v[n] for v in src.values() if n in v];m=sum(xs)/len(xs)
    if abs(m)>=2.5: pl[n]=round(m,1)
  prof["pl"]=pl;prof["n"]=min(150,round(npro+.25*nconf+.5*nval));NEW[t]=prof;LOG[t]=dict(nprop=npro,nconf=nconf,nval=nval,src={k:len(v) for k,v in src.items()})
# correzioni dichiarate da Francesco
d=NEW["DUC"]["pl"]
for k in ["Amen Thompson","Matas Buzelis","Brayden Burries","Immanuel Quickley"]:d.pop(k,None)
for k in ["Hannes Steinbach","Kyshawn George","Dyson Daniels","Sergio De Larrea"]:d[k]=-6
for k in ["Scottie Barnes","Brandon Ingram","Cade Cunningham","Cooper Flagg"]:d[k]=max(d.get(k,0),8)
NEW["SPI"]["pl"]["Cameron Boozer"]=12;NEW["SPI"]["pl"]["Stephon Castle"]=12
NEW["TUR"]["pl"]["Derik Queen"]=10
json.dump(NEW,open("/tmp/gm_profili_nuovi.json","w"),ensure_ascii=False)
for t in NEW:
  o=OLD[t];n=NEW[t]
  print(t,LOG[t],"\n  vecchio req",o.get("req"),"age",o.get("age"),"sc",o.get("sc"),"n",o.get("n"),"role",o.get("role"),"pl",len(o["pl"]),"\n  nuovo   req",n["req"],"age",n["age"],"sc",n["sc"],"n",n["n"],"role",n["role"],"pl",len(n["pl"]))
  print("   +",sorted([(k,v) for k,v in n["pl"].items() if v>0],key=lambda x:-x[1])[:10]);print("   -",sorted([(k,v) for k,v in n["pl"].items() if v<0],key=lambda x:x[1])[:10])
