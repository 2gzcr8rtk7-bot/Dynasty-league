#!/usr/bin/env python3
"""(1565) Verifica gli SCONTRINI SCOMMESSE del Centro scommesse Dreamers (codici DRSC1...).
Uso:  python3 tools/scontrini.py "<codice DRSC1...>" "<codice>" ...
      python3 tools/scontrini.py file.txt [altro.txt ...]     # prende tutti i codici DRSC1 che trova nei file (anche chat WhatsApp esportate)
      python3 tools/scontrini.py -                            # legge da standard input
      aggiungi -v per vedere i movimenti uno per uno;
      aggiungi --registra per salvare in tools/scontrini_registro.json il telefono e l'ultimo scontrino di ogni squadra REGOLARE
      (così la volta dopo basta passare gli scontrini nuovi: un telefono diverso o un buco rispetto al registro viene segnalato).
Passare TUTTI gli scontrini di una squadra insieme (anche di più squadre: il verdetto è per squadra).
Controlla: firma dello scontrino, catena delle firme di ogni movimento, contatori consecutivi (buchi = scontrino mancante,
sovrapposizioni = registro riportato indietro), firma precedente (ph) = ultima firma dello scontrino prima (lh), saldi coerenti
(saldo dopo = prima + pagato - puntato), un solo telefono per squadra, nessuna ripartenza (apertura nuova = dati cancellati),
saldo cambiato fuori dalle scommesse (righe A), esiti senza giocata, esiti doppi, orari all'indietro, numero di giocate.
ONESTÀ: il segreto è anche nell'app, quindi un programmatore deciso può falsificare una catena: questo scopre i trucchi alla portata di tutti.
"""
import sys, json, base64, re, datetime, os
REG = os.environ.get("SCONTRINI_REG") or os.path.join(os.path.dirname(os.path.abspath(__file__)), "scontrini_registro.json")

SCSEC = "dr|duc|scontrini|v1|Zp4#"; SCK2 = "#k9|sc|m2"
D36 = "0123456789abcdefghijklmnopqrstuvwxyz"
NOMI = {"0": "apertura", "P": "giocata", "M": "multipla", "S": "esito", "I": "incasso", "R": "premio", "A": "SALDO CAMBIATO"}


def b36(n):
    o = ""
    while n:
        o = D36[n % 36] + o; n //= 36
    return o or "0"


def h32(s):
    """FNV-1a a 32 bit sulle unità UTF-16, come h32() in index.html (charCodeAt)."""
    h = 2166136261; b = s.encode("utf-16-le")
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8); h = (h * 16777619) & 0xFFFFFFFF
    return b36(h)


def h64(s): return h32(SCSEC + s) + h32(s + SCK2)


def jsnum(v):
    return str(int(v)) if isinstance(v, (int, float)) and float(v).is_integer() else str(v)


def sig(ph, dev, x):
    return h64("|".join([ph, dev] + [jsnum(v) if isinstance(v, (int, float)) else str(v) for v in x[:8]]))


def xor(b):
    x = int(h32(SCSEC), 36) & 0x7FFFFFFF; o = bytearray(len(b))
    for i, c in enumerate(b):
        x = (x * 1103515245 + 12345) & 0x7FFFFFFF; o[i] = c ^ ((x >> 16) & 255)
    return bytes(o)


def leggi(code):
    m = re.match(r"^DRSC1\.([A-Za-z0-9+/=]+)\.([a-z0-9]+)$", re.sub(r"\s+", "", code))
    if not m: return None, "codice non valido"
    try: j = xor(base64.b64decode(m.group(1))).decode("utf-8")
    except Exception: return None, "codice rovinato (non si decodifica)"
    if h64(j) != m.group(2): return None, "FIRMA NON VALIDA: scontrino modificato o copiato male"
    return json.loads(j), ""


def dt(t): return datetime.datetime.fromtimestamp(t, datetime.timezone(datetime.timedelta(hours=1))).strftime("%d/%m %H:%M")


def codici(args):
    out = []
    for a in args:
        if a == "-": txt = sys.stdin.read()
        else:
            try: txt = open(a, encoding="utf-8").read()
            except OSError: txt = a
        out += re.findall(r"DRSC1\.[A-Za-z0-9+/=\s]+?\.[a-z0-9]+", txt)
    return [re.sub(r"\s+", "", c) for c in out]


def controlla_scontrino(p):
    """righe complete [n,t,ty,id,st,py,bal,inf] + problemi interni allo scontrino"""
    pr = []; R = []; ph = p["ph"]; b = p.get("b0"); n = p["n0"]
    for i, e in enumerate(p["e"]):
        x = [n + i] + list(e)
        R.append(x + [sig(ph, p["dev"], x)]); ph = R[-1][8]
        if x[2] != "0" and b is not None and x[6] != b + x[5] - x[4]:
            pr.append("saldo incoerente al movimento %d (%s): %s + %s - %s ≠ %s" % (x[0], NOMI.get(x[2], x[2]), b, x[5], x[4], x[6]))
        b = x[6]
    if ph != p["lh"]: pr.append("catena delle firme ROTTA negli scontrini %d–%d (movimenti cambiati, tolti o riordinati)" % (p["n0"], p["n1"]))
    if p["n0"] + len(p["e"]) - 1 != p["n1"]: pr.append("contatore incoerente nello scontrino %d–%d" % (p["n0"], p["n1"]))
    if R and b != p["b1"]: pr.append("saldo finale dello scontrino (%s) diverso dall'ultimo movimento (%s)" % (p["b1"], b))
    return R, pr


def main():
    args = [a for a in sys.argv[1:] if a not in ("-v", "--registra")]; verb = "-v" in sys.argv
    reg = json.load(open(REG, encoding="utf-8")) if os.path.exists(REG) else {}
    if not args: print(__doc__); return 2
    C = codici(args)
    if not C: print("Nessun codice DRSC1 trovato."); return 2
    sq = {}; bad = []; vis = set()
    for c in C:
        if c in vis: continue
        vis.add(c); p, err = leggi(c)
        if err: bad.append((c[:24] + "…", err)); continue
        sq.setdefault(p["sq"], []).append(p)
    for c, err in bad: print("❌ SCARTATO %s: %s" % (c, err))
    devsq = {}
    for t, L in sq.items():
        for p in L: devsq.setdefault(p["dev"], set()).add(t)
    tutto_ok = not bad
    for t in sorted(sq):
        L = sq[t]; pr = []; info = []
        devs = sorted({p["dev"] for p in L})
        if len(devs) > 1: pr.append("%d telefoni/registri diversi per la stessa squadra (%s): dati cancellati e ripartito, o secondo telefono" % (len(devs), ", ".join(devs)))
        for d in devs:
            if len(devsq[d]) > 1: pr.append("il telefono %s ha stampato scontrini per più squadre (%s)" % (d, ", ".join(sorted(devsq[d]))))
        R0 = reg.get(t)
        if R0:
            if R0["dev"] not in devs: pr.append("telefono/registro %s diverso da quello già registrato per la squadra (%s): dati cancellati o secondo telefono" % (", ".join(devs), R0["dev"]))
            else:
                mine = [p for p in L if p["dev"] == R0["dev"]]; n0 = min(p["n0"] for p in mine)
                if n0 > R0["n1"] + 1: pr.append("MANCANO gli scontrini dopo l'ultimo registrato (%d movimenti non consegnati)" % (n0 - R0["n1"] - 1))
                elif n0 == R0["n1"] + 1 and min(mine, key=lambda p: p["n0"])["ph"] != R0["lh"]: pr.append("il primo scontrino nuovo non si aggancia all'ultimo registrato")
        tot = {"P": 0, "M": 0, "v": 0, "p": 0, "x": 0, "st": 0, "py": 0, "R": 0, "I": 0}
        for d in devs:
            S = sorted([p for p in L if p["dev"] == d], key=lambda p: (p["n0"], p["ts"]))
            righe = []; prev = None; aperture = 0
            for p in S:
                R, pi = controlla_scontrino(p); pr += pi
                if p.get("al"): pr.append("lo scontrino %s è marcato «registro alterato» dall'app" % dt(p["ts"]))
                if prev:
                    if p["n0"] == prev["n0"] and p["n1"] == prev["n1"] and p["lh"] == prev["lh"]: info.append("scontrino doppio ignorato"); continue
                    if p["n0"] <= prev["n1"]: pr.append("scontrini SOVRAPPOSTI (%s e %s): il registro è stato riportato indietro (backup/copia dei dati) e rigiocato" % (dt(prev["ts"]), dt(p["ts"])))
                    elif p["n0"] > prev["n1"] + 1: pr.append("MANCA uno scontrino tra %s e %s (%d movimenti non consegnati)" % (dt(prev["ts"]), dt(p["ts"]), p["n0"] - prev["n1"] - 1))
                    else:
                        if p["ph"] != prev["lh"]: pr.append("lo scontrino del %s non si aggancia al precedente (firma diversa)" % dt(p["ts"]))
                        if p.get("b0") != prev["b1"]: pr.append("saldo di partenza %s ≠ saldo finale dello scontrino prima %s" % (p.get("b0"), prev["b1"]))
                    if p["ts"] < prev["ts"]: pr.append("orari all'indietro tra gli scontrini")
                elif p["ph"] != "0" and not (R0 and R0["dev"] == d): pr.append("mancano gli scontrini iniziali del telefono %s (il primo consegnato non parte dall'apertura del registro)" % d)
                prev = p; righe += R
            ap = [x for x in righe if x[2] == "0"]; t0 = ap[0][1] if ap else None
            if ap and ap[0][6] != 1000: info.append("registro aperto con saldo %s e %s giocate già fatte (registro nato dopo, o dati di prima)" % (ap[0][6], ap[0][7][1:].split(" ")[0]))
            if any("illeggibile" in x[7] for x in ap): pr.append("registro ricreato perché illeggibile (dati toccati a mano)")
            for i in range(1, len(righe)):
                if righe[i][1] < righe[i - 1][1] - 120: pr.append("orario all'indietro al movimento %d" % righe[i][0]); break
            gioc = {}; esiti = {}
            for x in righe:
                ty = x[2]
                if ty in "PM": gioc[x[3]] = x; tot[ty] += 1
                if ty in "RI": tot[ty] += 1
                if ty == "S":
                    if x[3] in esiti: pr.append("esito pagato due volte per la giocata %s" % x[3])
                    esiti[x[3]] = x; tot[x[7][:1]] = tot.get(x[7][:1], 0) + 1
                    if x[3] not in gioc:
                        try: tid = int(x[3][:8], 36) // 1000
                        except ValueError: tid = None
                        if t0 is None or tid is None or tid >= t0: pr.append("esito di una giocata mai registrata (%s, %s)" % (x[3], x[7][2:40]))
                if ty == "A":
                    if "manomesso" in x[7] or "illeggibile" in x[7]: pr.append("REGISTRO DELLE SCOMMESSE RITOCCATO A MANO (scoperto dall'app il %s)" % dt(x[1]))
                    else: pr.append("SALDO CAMBIATO FUORI DALLE SCOMMESSE il %s: %s (%s)%s" % (dt(x[1]), x[7], ("+%d" % x[5]) if x[5] else ("-%d" % x[4]), " → saldo %d" % x[6]))
                if ty == "A" and x[6] == 1000: pr.append("saldo riportato a 1.000 (ripartenza)")
                tot["st"] += x[4]; tot["py"] += x[5]
                if verb: print("   %s %d %s %-9s %6s %6s → %6s  %s" % (d, x[0], dt(x[1]), NOMI.get(ty, ty), "-%d" % x[4] if x[4] else "", "+%d" % x[5] if x[5] else "", x[6], x[7]))
            if len(ap) > 1: pr.append("registro aperto %d volte" % len(ap))
            if prev and ap:
                g0 = int(re.match(r"g(\d+)", ap[0][7]).group(1)) if re.match(r"g(\d+)", ap[0][7]) else None
                if g0 is not None and prev.get("g") is not None and prev["g"] != g0 + sum(1 for x in righe if x[2] in "PM"):
                    pr.append("numero di giocate sul telefono (%d) diverso da quelle sugli scontrini (%d + %d iniziali): giocate cancellate o non registrate" % (prev["g"], sum(1 for x in righe if x[2] in "PM"), g0))
            aperte = [k for k in gioc if k not in esiti]
            info.append("telefono %s: %d scontrini, movimenti %s, saldo %s → %s, %d giocate aperte" % (d, len(S), len(righe), S[0].get("b0") if S[0].get("b0") is not None else (ap[0][6] if ap else "?"), S[-1]["b1"], len(aperte)))
        pr = list(dict.fromkeys(pr))
        print("\n%s %s" % ("✅ REGOLARE" if not pr else "⚠ SOSPETTO", t))
        print("   giocate %d singole + %d multiple · esiti: %d vinte, %d perse, %d rimborsate · puntati %d, pagati %d%s" % (tot["P"], tot["M"], tot.get("v", 0), tot.get("p", 0), tot.get("x", 0), tot["st"], tot["py"], (" · premi ritirati %d" % tot["R"] if tot["R"] else "") + (" · incassi %d" % tot["I"] if tot["I"] else "")))
        for x in info: print("   ·", x)
        for x in pr: print("   ⚠", x)
        tutto_ok = tutto_ok and not pr
        if "--registra" in sys.argv:
            if pr: print("   (non registrato: prima chiarire i problemi)")
            elif len(devs) == 1:
                u = max(L, key=lambda p: p["n1"])
                if not R0 or u["n1"] > R0["n1"]: reg[t] = {"dev": devs[0], "n1": u["n1"], "lh": u["lh"], "b1": u["b1"], "ts": u["ts"]}; print("   REGISTRATO fino al movimento dello scontrino del %s" % dt(u["ts"]))
    if "--registra" in sys.argv: json.dump(reg, open(REG, "w", encoding="utf-8"), indent=1)
    return 0 if tutto_ok else 1


sys.exit(main())
