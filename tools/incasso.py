#!/usr/bin/env python3
"""Verifica (e registra) uno scontrino INCASSO del Centro scommesse Dreamers.
Uso:  python3 tools/incasso.py "<codice DRINC2...>"            # solo verifica
      python3 tools/incasso.py "<codice DRINC2...>" --registra # verifica + scrive nel registro
Controlla: firma (non modificato), ID mai usato, massimo 5 crediti/anno per squadra.
Se tutto ok stampa cosa fare: aggiungere `cr` crediti a CREDITI[sq] in index.html e annotarlo in NOTE_SVILUPPO.md.
"""
import sys,json,base64,re,os
SEC="dr|duc|incasso|v1|Qx7!"; MAXY=5
REG=os.path.join(os.path.dirname(os.path.abspath(__file__)),"incassi_registro.json")
def h32(s):
    h=2166136261
    for ch in s.encode("utf-16-le").decode("utf-16-le"):
        for u in ch.encode("utf-16-le")[::2] if False else [ord(ch)]:
            h^=u; h=(h*16777619)&0xFFFFFFFF
    n=h; d="0123456789abcdefghijklmnopqrstuvwxyz"; o=""
    while n: o=d[n%36]+o; n//=36
    return o or "0"
def leggi(code):
    m=re.match(r"^DRINC2\.([A-Za-z0-9+/=]+)\.([a-z0-9]+)$",re.sub(r"\s+","",code.strip()))
    if not m: return None,"Codice non valido."
    raw=base64.b64decode(m.group(1)); j=raw.decode("utf-8")
    if h32(SEC+j)!=m.group(2): return None,"FIRMA NON VALIDA: scontrino modificato."
    return json.loads(j),""
def main():
    if len(sys.argv)<2: print(__doc__); return 2
    p,err=leggi(sys.argv[1])
    if err: print("RIFIUTATO:",err); return 1
    reg=json.load(open(REG)) if os.path.exists(REG) else []
    if any(x["id"]==p["id"] for x in reg): print("RIFIUTATO: scontrino GIÀ USATO (ID %s)."%p["id"].upper()); return 1
    gia=sum(x["cr"] for x in reg if x["sq"]==p["sq"] and x["y"]==p["y"])
    if gia+p["cr"]>MAXY: print("RIFIUTATO: %s ha già %d crediti incassati nel %s, il massimo è %d."%(p["sq"],gia,p["y"],MAXY)); return 1
    print("VALIDO · squadra %s · %d crediti (%d gettoni) · anno %s · ID %s"%(p["sq"],p["cr"],p["tk"],p["y"],p["id"].upper()))
    print("Già incassati quest'anno da %s: %d → dopo: %d su %d"%(p["sq"],gia,gia+p["cr"],MAXY))
    if "--registra" in sys.argv:
        reg.append({"id":p["id"],"sq":p["sq"],"cr":p["cr"],"y":p["y"],"ts":p["ts"]}); json.dump(reg,open(REG,"w"),indent=1)
        print("REGISTRATO. Ora: CREDITI[\"%s\"] += %d in index.html (+ nota in NOTE_SVILUPPO.md, bump CACHE), poi conferma a Francesco."%(p["sq"],p["cr"]))
    return 0
sys.exit(main())
