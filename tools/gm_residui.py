import re,json,math
import sys
A=sys.argv[1] if len(sys.argv)>1 else '/mnt/user-data/attachments/'
V=json.load(open('/tmp/gm_vals.json'))
s=open('/home/claude/dynasty-league/index.html',encoding='utf-8').read()
G=json.loads(re.search(r'const GM_GUSTI=(\{.*?\});\n',s).group(1))
TAG=re.compile(r" \[[^\]]*\]")
pp=lambda x:[(m.group(1).strip(),m.group(4)) for m in re.finditer(r"([^+()]+?) \((\d+), (\d+)a, ([GFC])\)",TAG.sub("",x))]
F={'TUR':['3c61f126'],'SPI':['f0973993','a7918679'],'PEA':['3402d834'],'FOX':['e2635bc9']}
for t,fs in F.items():
  g=G[t];res={}
  for f in fs:
    for l in open(A+f+'-attachment.txt',encoding='utf-8'):
      m=re.match(r"\d+\. \[(SÌ|NO|MOD)\] \w+ dà (.+?) → riceve (.+?) \(da \w+\)(.*?)· Δ",l)
      if not m: continue
      give=pp(m.group(2));get=pp(m.group(3));y=1 if m.group(1)=='SÌ' else 0
      vg=sum(V.get(n,{}).get('v',0) for n,_ in give);vr=sum(V.get(n,{}).get('v',0) for n,_ in get)
      ag=lambda L:sum(V.get(n,{}).get('v',0)*V.get(n,{}).get('e',26) for n,_ in L)/max(1,sum(V.get(n,{}).get('v',0) for n,_ in L))
      d=(vr-vg)/max(vg,vr,1)*100
      z=d-g['age']*(ag(get)-ag(give))-g['req']+sum(g['role'].get(r,0) for _,r in get)/len(get)
      p=1/(1+math.exp(-z/(g.get('sc') or 12.5)))
      for n,_ in give: r=res.setdefault(n,[0,0,0,0]);r[0]+=1;r[1]+=y;r[2]+=y-p;r[3]+=d
  out=sorted([(n,c,a,round(rs,2),round(sd/c)) for n,(c,a,rs,sd) in res.items() if c>=3],key=lambda x:x[3])
  print(t);[print('  ',x) for x in out]

# --- applica: bonus giocatore dai residui (cessioni), solo dove manca
s=open('/home/claude/dynasty-league/index.html',encoding='utf-8').read()
m=re.search(r'const GM_GUSTI=(\{.*?\});\n',s);G=json.loads(m.group(1));log={}
for t,fs in F.items():
  g=G[t];res={}
  for f in fs:
    for l in open(A+f+'-attachment.txt',encoding='utf-8'):
      mm=re.match(r"\d+\. \[(SÌ|NO|MOD)\] \w+ dà (.+?) → riceve (.+?) \(da \w+\)(.*?)· Δ",l)
      if not mm: continue
      give=pp(mm.group(2));get=pp(mm.group(3));y=1 if mm.group(1)=='SÌ' else 0
      vg=sum(V.get(n,{}).get('v',0) for n,_ in give);vr=sum(V.get(n,{}).get('v',0) for n,_ in get)
      ag=lambda L:sum(V.get(n,{}).get('v',0)*V.get(n,{}).get('e',26) for n,_ in L)/max(1,sum(V.get(n,{}).get('v',0) for n,_ in L))
      d=(vr-vg)/max(vg,vr,1)*100;z=d-g['age']*(ag(get)-ag(give))-g['req']+sum(g['role'].get(r,0) for _,r in get)/len(get)
      p=1/(1+math.exp(-z/(g.get('sc') or 12.5)))
      for n,_ in give: r=res.setdefault(n,[0,0]);r[0]+=1;r[1]+=y-p
  for n,(c,rs) in res.items():
    if c<4 or n in g['pl'] or V.get(n,{}).get('v',0)<300: continue
    v=-max(-10,min(10,rs/c/0.2*(g.get('sc') or 12.5)*0.5))
    if abs(v)>=3: g['pl'][n]=round(v);log.setdefault(t,{})[n]=round(v)
s=s[:m.start(1)]+json.dumps(G,ensure_ascii=False)+s[m.end(1):];open('/home/claude/dynasty-league/index.html','w',encoding='utf-8').write(s)
print(log)
