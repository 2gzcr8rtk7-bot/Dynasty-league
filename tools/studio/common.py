"""(823) Studio a ritroso dei report dei GM. Uso: python3 tools/gm_fit.py vals, poi python3 tools/studio/confronta_modelli.py (quale modo di contare i pacchetti spiega meglio le risposte) e python3 tools/studio/rifai_profili.py (rifà i profili GM_GUSTI da tutti i report: scrive /tmp/gm_profili_nuovi.json).
I report stanno nella cartella degli allegati (D): aggiornare PROP/CONF/VALU con i nuovi file.
"""
import re,json,math
V=json.load(open('/tmp/gm_vals.json'))
D="/mnt/user-data/attachments/a3e7d39f-3d0f-5d62-b890-22c077c1b996/"
TAG=re.compile(r" \[[^\]]*\]")
pp=lambda x:[(m.group(1).strip(),int(m.group(2)),m.group(4)) for m in re.finditer(r"([^+()]+?) \((\d+), (\d+)a, ([GFC])\)",TAG.sub("",x))]
PROP={"TUR":["3c61f126"],"SPI":["f0973993","a7918679"],"PEA":["3402d834"],"FOX":["e2635bc9"],"DUC":["9244913d"]}
CONF={"DOL":"dd56150f","SPI":"c1ae20d5","PEA":"d7a2a67c","FOX":"81bc22b4","DUC":"99b9ce50"}
VALU={"DOL":"a020c5be","SPI":"5cb19b0c","FOX":"2d7219cf","DUC":"9d536ca9"}
def val(n,rep=None): return V[n]["v"] if n in V else (rep or 400)
def pts(n,rep=None): return V[n]["c"] if n in V else (val(n,rep)/1000)**1.4*1000/3.6
def rows(t):
  R=[]
  for f in PROP.get(t,[]):
    for l in open(D+f+"-attachment.txt",encoding="utf-8"):
      m=re.match(r"\d+\. \[(SÌ|NO|MOD)\] \w+ dà (.+?) → riceve (.+?) \(da \w+\)(.*?)· Δ",l)
      if m and m.group(1)!="MOD": R.append((1 if m.group(1)=="SÌ" else 0,[(n,r) for n,v,r in pp(m.group(2))],[(n,r) for n,v,r in pp(m.group(3))]))
  return R
def wF(n,lo,hi):
  v=val(n);return 0 if v<=lo else 1 if v>=hi else (v-lo)/(hi-lo)
def sides(g,r,mode,lo=800,hi=1000):
  """valore dei due lati; mode: lin, k2, fill"""
  if mode=="lin": return sum(pts(n) for n,_ in g),sum(pts(n) for n,_ in r),None
  if mode=="k2":
    def pk(L):
      ps=sorted([pts(n) for n,_ in L],reverse=True);return sum(p*(p/ps[0])**2 for p in ps) if ps and ps[0]>0 else 0
    return pk(g),pk(r),None
  star=any(wF(n,lo,hi)>0 for n,_ in g+r)
  W={n:(wF(n,lo,hi) if star else 1) for n,_ in g+r}
  return sum(pts(n)*W[n] for n,_ in g),sum(pts(n)*W[n] for n,_ in r),W
def age(L,W=None):
  s=sum(pts(n)*(W[n] if W else 1) for n,_ in L) or 1
  return sum(pts(n)*(W[n] if W else 1)*V.get(n,{}).get("e",26) for n,_ in L)/s
def feats(R,mode,**k):
  X=[]
  for y,g,r in R:
    vg,vr,W=sides(g,r,mode,**k)
    if W is not None and vg+vr==0: vg,vr,W=sides(g,r,"lin")
    X.append(((vr-vg)/max(vg,vr,1)*100,age(r,W)-age(g,W),r,y,g,W))
  return X
def nll(X,q,a,c,role):
  s=0
  for d,da,r,y,g,W in X:
    z=d-a*da-q+sum(role[x[1]] for x in r)/len(r);p=min(max(1/(1+math.exp(-z/c)),1e-6),1-1e-6);s-=y*math.log(p)+(1-y)*math.log(1-p)
  return s
def fit(X,grid=True):
  best=None
  for q in range(-5,41,1):
    for a in [x/4 for x in range(0,17)]:
      for c in [8,10,12.5,15,18,22,28]:
        s=nll(X,q,a,c,{"G":0,"F":0,"C":0})
        if best is None or s<best[0]:best=(s,q,a,c)
  s,q,a,c=best;import itertools
  bb=min(((nll(X,q,a,c,{"G":G,"F":F,"C":C})+.02*(G*G+F*F+C*C),G,F,C) for G,F,C in itertools.product(range(-6,7,2),repeat=3)))
  return dict(nll=round(s,1),req=q,age=a,sc=c,role={"G":bb[1],"F":bb[2],"C":bb[3]})
def sides2(g,r,lo,hi,eps):
  star=any(wF(n,lo,hi)>0 for n,_ in g+r)
  W={n:((eps+(1-eps)*wF(n,lo,hi)) if star else 1) for n,_ in g+r}
  return sum(pts(n)*W[n] for n,_ in g),sum(pts(n)*W[n] for n,_ in r),W
def feats2(R,lo,hi,eps):
  X=[]
  for y,g,r in R:
    vg,vr,W=sides2(g,r,lo,hi,eps)
    X.append(((vr-vg)/max(vg,vr,1)*100,age(r,W)-age(g,W),r,y,g,W))
  return X
