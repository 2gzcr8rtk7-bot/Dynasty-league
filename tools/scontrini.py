#!/usr/bin/env python3
"""(1565) Verifica gli SCONTRINI SCOMMESSE del Centro scommesse Dreamers.
Due tipi: SCONTRINO INIZIALE (codice DRSI1…, uno per squadra/telefono) e SCONTRINO FINALE (DRSF1…, cumulativo: tutto dall'iniziale ad adesso).
Uso:  python3 tools/scontrini.py file.txt [altri.txt]        # testi incollati (anche chat WhatsApp esportate): controlla anche il riassunto
      python3 tools/scontrini.py "<codice>" "<codice>" ...    # solo codici (il riassunto non si può controllare)
      python3 tools/scontrini.py -                            # legge da standard input
      -v            stampa i movimenti uno per uno
      --registra    salva in tools/scontrini_registro.json l'iniziale delle squadre REGOLARI:
                    la volta dopo basta il finale; un iniziale nuovo o di un altro telefono viene segnalato.
Per ogni squadra: iniziale + finale (se ci sono più finali si usa il più lungo e gli altri devono esserne l'inizio).
Controlla: firma del codice, firma del riassunto (scontrino modificato/incompleto dopo la copia), impronta, stesso telefono e squadra,
contatore che parte dall'iniziale senza buchi, catena delle firme dalla firma iniziale, saldi (dopo = prima + pagati − puntati),
saldo cambiato fuori dalle scommesse o registro manomesso (righe A), esiti abbinati a una sola giocata (niente esiti doppi
o di giocate mai fatte), giocate aperte coerenti (nessuna sparita), numero di giocate, ripartenze (più iniziali = dati cancellati o secondo telefono).
ONESTÀ: il segreto è anche nell'app, quindi un programmatore deciso può falsificare una catena: questo scopre i trucchi alla portata di tutti.
"""
import sys, json, base64, re, datetime, os, zlib

SCSEC = "dr|duc|scontrini|v1|Zp4#"; SCK2 = "#k9|sc|m2"
REG = os.environ.get("SCONTRINI_REG") or os.path.join(os.path.dirname(os.path.abspath(__file__)), "scontrini_registro.json")
D36 = "0123456789abcdefghijklmnopqrstuvwxyz"
NOMI = {"0": "apertura", "P": "giocata", "M": "multipla", "S": "esito", "I": "incasso", "R": "premio", "A": "ANOMALIA"}
CODE_RE = re.compile(r"(DRS[IF]1)\.([jz])([A-Za-z0-9+/]+)\.([a-z0-9]+)")


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


def js(v): return str(int(v)) if isinstance(v, (int, float)) and not isinstance(v, bool) and float(v).is_integer() else str(v)


def sig(ph, dev, x): return h64("|".join([ph, dev] + [js(v) for v in x[:8]]))


def norm(t): return "\n".join(l for l in (re.sub(r"\s+", " ", l).strip() for l in t.split("\n")) if l)


def xor(b):
    x = int(h32(SCSEC), 36) & 0x7FFFFFFF; o = bytearray(len(b))
    for i, c in enumerate(b):
        x = (x * 1103515245 + 12345) & 0x7FFFFFFF; o[i] = c ^ ((x >> 16) & 255)
    return bytes(o)


def dt(t): return datetime.datetime.fromtimestamp(t, datetime.timezone(datetime.timedelta(hours=1))).strftime("%d/%m %H:%M")


def decodifica(pf, z, b64, firma):
    try:
        raw = xor(base64.b64decode(b64 + "=" * (-len(b64) % 4)))
        j = (zlib.decompress(raw, -15) if z == "z" else raw).decode("utf-8")
    except Exception: return None, "codice rovinato o tagliato (non si decodifica)"
    if h64(j) != firma: return None, "FIRMA NON VALIDA: codice modificato o copiato male"
    p = json.loads(j)
    if p.get("k") != ("I" if pf == "DRSI1" else "F"): return None, "tipo di scontrino incoerente"
    return p, ""


def unisci(t):
    """un codice spezzato su più righe (copia da immagine o da chat) torna intero"""
    # si uniscono solo le righe successive fatte tutte di caratteri del codice (non vuote e che non iniziano un altro codice)
    return re.sub(r"DRS[IF]1\.[A-Za-z0-9+/.]+(?:[ \t]*\n(?!DRS)[A-Za-z0-9+/.]+(?=[ \t]*(?:\n|$)))*", lambda k: re.sub(r"\s", "", k.group(0)), t)


def leggi_testi(args):
    """[[codice, gruppi, (blocco, impronta) o None]]: il blocco va dalla riga «🧾 SCONTRINO …» alla riga prima di «Impronta: …»"""
    out = []; rotti = []
    for a in args:
        if a == "-": txt = sys.stdin.read()
        elif os.path.isfile(a): txt = open(a, encoding="utf-8").read()
        else: txt = a
        txt = txt.replace("\r\n", "\n").replace("\r", "\n")
        nuovi = [[m.group(0), m.groups(), None] for m in CODE_RE.finditer(unisci(txt))]
        for h in re.finditer(r"🧾 SCONTRINO (INIZIALE|FINALE)", txt):
            resto = txt[h.start():]
            mc = CODE_RE.search(unisci(resto))
            if not mc: continue
            mi = re.search(r"\n[^\n]*Impronta:\s*([A-Za-z0-9]+)", resto)
            pos = resto.find(mc.group(0)[:16])
            tb = (resto[:mi.start()], mi.group(1)) if mi and (pos < 0 or mi.start() < pos) else (None, None)
            for o in nuovi:
                if o[0] == mc.group(0) and o[2] is None: o[2] = tb; break
        out += nuovi
        # pezzi di codice che non sono un codice intero = scontrino tagliato
        interi = {o[0] for o in nuovi}
        for m in re.finditer(r"DRS[IF]1\.[A-Za-z0-9+/.]*", unisci(txt)):
            if not any(m.group(0) in c for c in interi): rotti.append(m.group(0)[:28] + "…")
    return out, rotti


def main():
    args = [a for a in sys.argv[1:] if a not in ("-v", "--registra")]; verb = "-v" in sys.argv
    if not args: print(__doc__); return 2
    reg = json.load(open(REG, encoding="utf-8")) if os.path.exists(REG) else {}
    C, rotti = leggi_testi(args)
    if not C and not rotti: print("Nessun codice DRSI1/DRSF1 trovato."); return 2
    sq = {}; bad = [(r, "SCONTRINO MODIFICATO/INCOMPLETO: codice tagliato o rovinato") for r in rotti]; vis = set()
    for code, (pf, z, b64, firma), tb in C:
        if code in vis: continue
        vis.add(code); p, err = decodifica(pf, z, b64, firma)
        if err: bad.append((code[:28] + "…", err)); continue
        p["_fp"] = firma[:6].upper(); p["_pr"] = []; p["_info"] = []
        if tb is None or tb[0] is None: p["_info"].append("scontrino %s dato solo come codice: riassunto non controllato" % p["_fp"])
        else:
            blocco, fp = tb
            if h64(norm(blocco)) != p.get("sh"): p["_pr"].append("SCONTRINO MODIFICATO/INCOMPLETO (%s): il riassunto incollato non è quello stampato" % p["_fp"])
            if (fp or "").upper() != p["_fp"]: p["_pr"].append("impronta del testo (%s) diversa da quella del codice (%s)" % (fp, p["_fp"]))
        if p["k"] == "F" and p.get("ne") != len(p.get("e", [])): p["_pr"].append("scontrino finale incompleto (%s): movimenti %d su %s" % (p["_fp"], len(p.get("e", [])), p.get("ne")))
        sq.setdefault(p["sq"], []).append(p)
    for c, err in bad: print("⚠ SCARTATO %s: %s" % (c, err))
    tutto_ok = not bad
    for t in sorted(sq):
        L = sq[t]; pr = []; info = []
        for p in L: pr += p["_pr"]; info += p["_info"]
        INI = [p for p in L if p["k"] == "I"]; FIN = [p for p in L if p["k"] == "F"]
        R0 = reg.get(t)
        devi = sorted({p["dev"] for p in INI})
        if len(devi) > 1: pr.append("%d scontrini iniziali da telefoni/registri diversi (%s): dati cancellati e ripartito, o secondo telefono" % (len(devi), ", ".join(devi)))
        elif len(INI) > 1 and len({p["n"] for p in INI}) > 1: pr.append("più scontrini iniziali dallo stesso telefono con punti di partenza diversi")
        if R0 and INI and any(p["dev"] != R0["dev"] or p["n"] != R0["n"] for p in INI): pr.append("scontrino iniziale NUOVO rispetto a quello già registrato (%s): ripartenza o secondo telefono" % R0["dev"])
        ini = None
        if INI:
            f0 = max(FIN, key=lambda p: p["ne"]) if FIN else None
            ini = next((p for p in INI if f0 and p["dev"] == f0["dev"]), INI[0])
        elif R0: ini = dict(R0, k="I", sq=t); info.append("scontrino iniziale preso dal registro (%s)" % dt(R0["ts"]))
        if not ini: pr.append("MANCA lo scontrino iniziale: senza non si può controllare il punto di partenza")
        if ini and ini.get("al"): pr.append("prima dell'iniziale il saldo era già stato cambiato fuori dalle scommesse")
        tot = {"P": 0, "M": 0, "v": 0, "p": 0, "x": 0, "st": 0, "py": 0, "R": 0, "I": 0}
        if ini and not FIN: info.append("nessuno scontrino finale: solo l'iniziale %s (saldo di partenza %s, telefono %s)" % (ini.get("_fp", ""), ini["b"], ini["dev"]))
        if ini and FIN:
            for p in FIN:
                if p["dev"] != ini["dev"]: pr.append("scontrino finale %s di un ALTRO telefono/registro (%s) rispetto all'iniziale (%s)" % (p["_fp"], p["dev"], ini["dev"]))
            F = [p for p in FIN if p["dev"] == ini["dev"]]
            for p in F:
                if p["n0"] != ini["n"] + 1 or p["ih"] != ini["h"]: pr.append("il finale %s non parte dall'iniziale (contatore o firma diversi)" % p["_fp"])
                if p["b0"] != ini["b"]: pr.append("saldo di partenza del finale %s (%s) diverso dall'iniziale (%s)" % (p["_fp"], p["b0"], ini["b"]))
            if F:
                M = max(F, key=lambda p: (p["ne"], p["ts"]))
                # catena del più lungo, con la firma dopo ogni movimento
                hs = []; ph = M["ih"]; b = M["b0"]; R = []
                for i, e in enumerate(M["e"]):
                    x = [M["n0"] + i] + list(e); ph = sig(ph, M["dev"], x); hs.append(ph); R.append(x)
                    if x[2] != "0" and x[6] != b + x[5] - x[4]: pr.append("saldo incoerente al movimento %d (%s): %s + %s − %s ≠ %s" % (i + 1, NOMI.get(x[2], x[2]), b, x[5], x[4], x[6]))
                    if i and x[1] < R[-2][1] - 120: pr.append("orario all'indietro al movimento %d" % (i + 1))
                    b = x[6]
                if ph != M["lh"]: pr.append("catena delle firme ROTTA nel finale %s (movimenti cambiati, tolti o riordinati)" % M["_fp"])
                if b != M["b1"]: pr.append("saldo finale (%s) diverso dall'ultimo movimento (%s)" % (M["b1"], b))
                for p in F:
                    if p is M: continue
                    k = p["ne"]; pre = M["e"][:k] == p["e"] and (hs[k - 1] if k else M["ih"]) == p["lh"]
                    if not pre: pr.append("il finale %s (%s) NON è l'inizio del finale più lungo %s: registro riportato indietro (backup/copia dei dati) e rigiocato" % (p["_fp"], dt(p["ts"]), M["_fp"]))
                    elif p["ts"] > M["ts"] and k < M["ne"]: pr.append("il finale %s è stampato DOPO %s ma è più corto: registro riportato indietro" % (p["_fp"], M["_fp"]))
                # giocate ed esiti: l'id di una giocata è il suo contatore; "x…" = giocata già aperta all'iniziale
                gioc = {}; esiti = {}; ap0 = {str(a[0]): a[1] for a in ini.get("ap", [])}
                for x in R:
                    ty = x[2]
                    if ty in "PM": gioc[str(x[0])] = x; tot[ty] += 1
                    if ty in "RI": tot[ty] += 1
                    if ty == "0": pr.append("registro RIAPERTO dopo l'iniziale (ripartenza)")
                    if ty == "S":
                        k = x[3]; tot[x[7][:1]] = tot.get(x[7][:1], 0) + 1
                        if k in esiti: pr.append("esito pagato DUE VOLTE per la stessa giocata (%s)" % x[7][2:60])
                        elif k not in gioc and k not in ap0: pr.append("esito di una giocata MAI REGISTRATA (%s, %s)" % (x[7][2:60], ("+%d" % x[5]) if x[5] else "0"))
                        esiti[k] = x
                    if ty == "A":
                        if "manomesso" in x[7] or "illeggibile" in x[7]: pr.append("REGISTRO DELLE SCOMMESSE RITOCCATO A MANO (scoperto dall'app il %s)" % dt(x[1]))
                        else: pr.append("SALDO CAMBIATO FUORI DALLE SCOMMESSE il %s: %s (%s) → saldo %d" % (dt(x[1]), x[7], ("+%d" % x[5]) if x[5] else ("-%d" % x[4]), x[6]))
                        if x[6] == 1000: pr.append("saldo riportato a 1.000 (ripartenza)")
                    tot["st"] += x[4]; tot["py"] += x[5]
                    if verb: print("   %s %d %s %-9s %6s %6s → %6s  %s" % (M["dev"], x[0], dt(x[1]), NOMI.get(ty, ty), "-%d" % x[4] if x[4] else "", "+%d" % x[5] if x[5] else "", x[6], x[7]))
                if M.get("al") and not any(x[2] == "A" for x in R): pr.append("il finale %s è marcato «registro alterato» dall'app" % M["_fp"])
                lis = {str(a[0]): a[1] for a in M.get("ap", [])}
                for k, st in lis.items():
                    if k in esiti: pr.append("tra le aperte c'è una giocata già chiusa (%s)" % esiti[k][7][2:50])
                    elif k not in gioc and k not in ap0: pr.append("tra le aperte c'è una giocata mai registrata")
                    elif k in gioc and gioc[k][4] != st: pr.append("puntata diversa tra la giocata e la lista delle aperte (%s)" % gioc[k][7][:50])
                for k, x in list(gioc.items()) + [(k, None) for k in ap0]:
                    if k not in esiti and k not in lis: pr.append("giocata SPARITA: %s non è più tra le aperte e non ha esito" % (x[7][:60] if x else "giocata già aperta all'iniziale"))
                if M.get("g") is not None and ini.get("g") is not None and M["g"] != ini["g"] + tot["P"] + tot["M"]:
                    pr.append("numero di giocate sul telefono (%d) diverso da iniziale + scontrino (%d + %d): giocate cancellate o aggiunte a mano" % (M["g"], ini["g"], tot["P"] + tot["M"]))
                info.append("telefono %s · iniziale %s (%s) · finale %s (%s) · %d movimenti · saldo %s → %s · %d aperte" % (ini["dev"], ini.get("_fp", "dal registro"), dt(ini["ts"]), M["_fp"], dt(M["ts"]), M["ne"], M["b0"], M["b1"], len(lis)))
        pr = list(dict.fromkeys(pr))
        print("\n%s %s" % ("⚠ SOSPETTO" if pr else "⚠ DA RIVEDERE (ci sono scontrini scartati, vedi sopra)" if bad else "✅ REGOLARE", t))
        print("   giocate %d singole + %d multiple · esiti: %d vinte, %d perse, %d rimborsate · puntati %d, pagati %d%s%s" % (tot["P"], tot["M"], tot.get("v", 0), tot.get("p", 0), tot.get("x", 0), tot["st"], tot["py"], " · premi %d" % tot["R"] if tot["R"] else "", " · incassi %d" % tot["I"] if tot["I"] else ""))
        for x in dict.fromkeys(info): print("   ·", x)
        for x in pr: print("   ⚠", x)
        tutto_ok = tutto_ok and not pr
        if "--registra" in sys.argv:
            if pr or not ini: print("   (non registrato: prima chiarire i problemi)")
            elif not R0 or R0.get("dev") == ini["dev"]:
                reg[t] = {k: ini[k] for k in ("dev", "n", "h", "b", "ts", "g", "ap") if k in ini}; print("   REGISTRATO l'iniziale %s" % ini.get("_fp", ""))
    if bad: print("\n⚠ ATTENZIONE: %d scontrini scartati (vedi sopra): i verdetti per squadra non li comprendono, chiedere il testo intero." % len(bad))
    if "--registra" in sys.argv: json.dump(reg, open(REG, "w", encoding="utf-8"), indent=1)
    return 0 if tutto_ok else 1


sys.exit(main())
