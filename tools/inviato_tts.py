# DYNASTY TV – voci dell'inviato a bordo campo e del pubblico con Kokoro (TTS neurale open source, gratis, gira su GitHub).
# Uso: python tools/inviato_tts.py <testo.json> <cartella_uscita>
# testo.json: {"clips":[{"id","lang":"i"|"a"|"b","voice","speed","text"}]} -> <id>.wav (24 kHz)
import json,sys,os,numpy as np,soundfile as sf
from kokoro import KPipeline
src,out=sys.argv[1],sys.argv[2];os.makedirs(out,exist_ok=True)
T=json.load(open(src,encoding="utf8"));P={}
for c in T["clips"]:
    if c["lang"] not in P:P[c["lang"]]=KPipeline(lang_code=c["lang"])
    try:
        a=np.concatenate([np.asarray(r.audio) for r in P[c["lang"]](c["text"],voice=c["voice"],speed=c["speed"],split_pattern=None)])
        sf.write(f"{out}/{c['id']}.wav",a,24000);print(c["id"],round(len(a)/24000,2))
    except Exception as e:print("ERRORE",c["id"],e)
