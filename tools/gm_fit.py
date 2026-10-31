#!/usr/bin/env python3
"""Taratura dei gusti dei GM (GM_GUSTI) dai report dell'Allenamento IA. Vedi tools/PROCEDURA_REPORT_GM.md.

  python3 tools/gm_fit.py vals                      # esporta i valori/crediti di ADESSO dall'app -> /tmp/gm_vals.json
  python3 tools/gm_fit.py proposte REPORT.txt [...] # «Proposte di scambio»: req, age, sc, ruoli (logistica)
  python3 tools/gm_fit.py confronto REPORT.txt      # «Confronto giocatori»: bonus per giocatore (logit ordinale)
  python3 tools/gm_fit.py valutazione REPORT.txt    # «Valutazione giocatori»: Δ voto (decili) e sconti infortuni

Regole fisse (31/10/2026): si usano SEMPRE i valori di adesso (non quelli scritti nel report); bonus giocatore =
logit/beta/2 (crediti ~ valore^2) × min(1, apparizioni/8), tetto ±12, scartati i giocatori sotto 40 crediti.
"""
import sys, re, json, math, itertools
VALS = "/tmp/gm_vals.json"
TAG = re.compile(r" \[[^\]]*\]")

def vals():
    from playwright.sync_api import sync_playwright
    import os
    url = "file://" + os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "index.html"))
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(); pg.route("https://**", lambda r: r.abort())
        pg.goto(url); pg.wait_for_timeout(1500)
        d = pg.evaluate("(()=>{const o={};Object.keys(ROSTER).forEach(t=>ROSTER[t].forEach(p=>{const n=p[0];o[n]={v:valOf(n)||0,c:Math.round(iaP(n)/VAL_CR),e:Math.round(eta(n)*10)/10,r:ruoloDi(n),t}}));return o})()")
        json.dump(d, open(VALS, "w"), ensure_ascii=False); print(len(d), "giocatori ->", VALS)

def V():
    return json.load(open(VALS))

def proposte(files):
    Vv = V(); rows = []
    pp = lambda s: [(m.group(1).strip(), int(m.group(2)), int(m.group(3)), m.group(4)) for m in re.finditer(r"([^+()]+?) \((\d+), (\d+)a, ([GFC])\)", TAG.sub("", s))]
    for f in files:
        for l in open(f, encoding="utf-8"):
            m = re.match(r"\d+\. \[(SÌ|NO|MOD)\] \w+ dà (.+?) → riceve (.+?) \(da \w+\)(.*?)· Δ", l)
            if not m: continue
            fx = lambda L: [(a, Vv[a]["v"] if a in Vv else b, c, d) for a, b, c, d in L]
            rows.append(dict(y=1 if m.group(1) == "SÌ" else 0, give=fx(pp(m.group(2))), get=fx(pp(m.group(3)))))
    def feats(r):
        vg = sum(x[1] for x in r["give"]); vr = sum(x[1] for x in r["get"])
        ag = lambda P: sum(x[1] * x[2] for x in P) / max(1, sum(x[1] for x in P))
        return (vr - vg) / max(vg, vr, 1) * 100, ag(r["get"]) - ag(r["give"])
    F = [feats(r) for r in rows]
    def nll(req, age, sc, role={"G": 0, "F": 0, "C": 0}):
        s = 0
        for r, (d, da) in zip(rows, F):
            g = d - age * da - req + sum(role[x[3]] for x in r["get"]) / len(r["get"])
            p = min(max(1 / (1 + math.exp(-g / sc)), 1e-6), 1 - 1e-6)
            s -= r["y"] * math.log(p) + (1 - r["y"]) * math.log(1 - p)
        return s
    _, q, a, c = min(((nll(q, a, c), q, a, c) for q in range(-5, 31) for a in [x / 4 for x in range(0, 17)] for c in [8, 10, 12.5, 15, 18, 22]))
    acc = sum((1 if d - a * da - q > 0 else 0) == r["y"] for r, (d, da) in zip(rows, F)) / len(rows)
    _, G, Fo, C = min((nll(q, a, c, {"G": G, "F": Fo, "C": C}) + .02 * (G * G + Fo * Fo + C * C), G, Fo, C) for G, Fo, C in itertools.product(range(-6, 7, 2), repeat=3))
    print(json.dumps(dict(risposte=len(rows), accettati=sum(r["y"] for r in rows), req=q, age=a, sc=c, role={"G": G, "F": Fo, "C": C}, accuratezza=round(acc, 2))))

def confronto(f):
    import numpy as np
    from scipy.optimize import minimize
    Vv = V(); G = {"poco meglio": 1, "meglio": 2, "molto meglio": 3}; rows = []
    for l in open(f, encoding="utf-8"):
        l = TAG.sub("", l)
        m = re.match(r"\d+\. (.+?) \((\d+)a, \w, nostri \d+ cr\) vs (.+?) \((\d+)a, \w, nostri \d+ cr\) → (PARI|(.+?) (poco meglio|molto meglio|meglio)) ·", l)
        if not m or m.group(1) not in Vv or m.group(3) not in Vv: continue
        a, b = m.group(1), m.group(3)
        y = 0 if m.group(5) == "PARI" else (G[m.group(7)] if m.group(6) == a else -G[m.group(7)])
        rows.append((a, b, y))
    names = sorted({x for r in rows for x in r[:2]}); ix = {n: i for i, n in enumerate(names)}
    X = np.array([math.log(max(Vv[a]["c"], 5) / max(Vv[b]["c"], 5)) for a, b, y in rows]); E = np.array([Vv[a]["e"] - Vv[b]["e"] for a, b, y in rows])
    Y = np.array([y for a, b, y in rows]); A = np.array([ix[a] for a, b, y in rows]); B = np.array([ix[b] for a, b, y in rows])
    sig = lambda z: 1 / (1 + np.exp(-np.clip(z, -40, 40)))
    def un(w):
        c1 = math.exp(w[2]); c2 = c1 + math.exp(w[3]); c3 = c2 + math.exp(w[4]); return w[0], w[1], c1, c2, c3, w[5:]
    def nll(w):
        beta, age, c1, c2, c3, th = un(w); z = beta * X - age * E + th[A] - th[B]
        cuts = np.array([-np.inf, -c3, -c2, -c1, c1, c2, c3, np.inf]); k = Y + 3
        return -np.sum(np.log(np.clip(sig(cuts[k + 1] - z) - sig(cuts[k] - z), 1e-9, 1))) + np.sum(th ** 2)
    r = minimize(nll, np.r_[3, 0, math.log(.4), math.log(.8), math.log(1.5), np.zeros(len(names))], method="L-BFGS-B", options={"maxiter": 5000, "maxfun": 200000})
    beta, age, *_ , th = un(r.x)
    cnt = {n: 0 for n in names}
    for a, b, y in rows: cnt[a] += 1; cnt[b] += 1
    pl = {}
    for n in names:
        if Vv[n]["c"] < 40: continue
        v = max(-12, min(12, 100 * th[ix[n]] / beta / 2 * min(1, cnt[n] / 8)))
        if abs(v) >= 3: pl[n] = round(v)
    print(json.dumps(dict(confronti=len(rows), eta_per_anno=round(100 * age / beta / 2, 2), pl=dict(sorted(pl.items(), key=lambda x: x[1]))), ensure_ascii=False))

def valutazione(f):
    out = []
    for l in open(f, encoding="utf-8"):
        m = re.match(r"\d+\. (.+?)(?: \[[^\]]*\])? \(\w+, \w, (\d+)a, calc \d+\) → GM (\d+)/10 vs noi (\d+)(?: · rischio inf\. (\d+)/10, sconto (\d+)%)?", l)
        if m: out.append(dict(n=m.group(1), delta=int(m.group(3)) - int(m.group(4)), rischio=m.group(5) and int(m.group(5)), sconto=m.group(6) and int(m.group(6))))
    print(json.dumps(out, ensure_ascii=False))

if __name__ == "__main__":
    c = sys.argv[1]
    if c == "vals": vals()
    elif c == "proposte": proposte(sys.argv[2:])
    elif c == "confronto": confronto(sys.argv[2])
    elif c == "valutazione": valutazione(sys.argv[2])
