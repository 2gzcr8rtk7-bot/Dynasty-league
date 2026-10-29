# DYNASTY TV – voce dell'inviato a bordo campo con Kokoro (TTS neurale open source, gratis, gira su GitHub).
# Uso: python tools/inviato_tts.py <testo.json> <cartella_uscita>
# testo.json: {"voci":[["im_nicola",1.08]], "frasi":[...]} -> per ogni voce: <voce>.wav e <voce>.json (inizio/fine di ogni frase)
import json,sys,os,numpy as np,soundfile as sf
from kokoro import KPipeline
src,out=sys.argv[1],sys.argv[2];os.makedirs(out,exist_ok=True)
T=json.load(open(src,encoding="utf8"));SR=24000
pipe=KPipeline(lang_code="i")
for voce,vel in T["voci"]:
    parts,tim,t=[],[],0.0
    for i,fr in enumerate(T["frasi"]):
        a=np.concatenate([np.asarray(r.audio) for r in pipe(fr,voice=voce,speed=vel,split_pattern=None)])
        pausa=np.zeros(int(SR*(0.18 if i<len(T["frasi"])-1 else 0.05)),dtype=np.float32)
        tim.append([round(t,2),round(t+len(a)/SR,2)]);parts+= [a,pausa];t+=(len(a)+len(pausa))/SR
    sf.write(f"{out}/{voce}.wav",np.concatenate(parts),SR)
    json.dump({"frasi":T["frasi"],"tempi":tim,"durata":round(t,2)},open(f"{out}/{voce}.json","w"),ensure_ascii=False)
    print(voce,round(t,1),"s")
