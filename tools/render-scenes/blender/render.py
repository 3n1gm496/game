"""
Entrata del render. Si invoca così:

    blender -b --python render.py -- --ambiente=hall --uscita=/percorso [--campioni=96] [--larghezza=1600]

Costruisce l'ambiente richiesto, lo renderizza una volta sola con Cycles su CPU
e ne ricava i livelli di parallasse dal passaggio di profondità.
"""

import sys
import time
from pathlib import Path

# Blender non mette la cartella dello script nel percorso dei moduli
CARTELLA = Path(__file__).resolve().parent
if str(CARTELLA) not in sys.path:
    sys.path.insert(0, str(CARTELLA))

import json  # noqa: E402
import bpy  # noqa: E402
from bpy_extras.object_utils import world_to_camera_view  # noqa: E402
import meridien as m  # noqa: E402
from ambienti import AMBIENTI, PROFONDITA  # noqa: E402

m.bpy = bpy


def argomento(nome, predefinito=None):
    prefisso = f"--{nome}="
    for a in sys.argv:
        if a.startswith(prefisso):
            return a[len(prefisso):]
    return predefinito


def main():
    chiave = argomento("ambiente")
    if chiave not in AMBIENTI:
        print(f"AMBIENTE_SCONOSCIUTO {chiave}")
        sys.exit(1)

    uscita = Path(argomento("uscita", "/tmp/meridien-render")) / chiave
    uscita.mkdir(parents=True, exist_ok=True)
    campioni = int(argomento("campioni", "96"))
    larghezza = int(argomento("larghezza", "1600"))
    altezza = int(round(larghezza * 9 / 16))

    m.scena_vuota()
    scena = bpy.context.scene

    inizio = time.time()
    esito = AMBIENTI[chiave](m)
    cam, punti = esito if isinstance(esito, tuple) else (esito, {})
    costruzione = time.time() - inizio

    m.imposta_render(scena, larghezza, altezza, campioni, uscita)
    vicino, lontano = PROFONDITA[chiave]
    m.compositore_a_livelli(scena, uscita, vicino, lontano)

    # Dove finiscono davvero gli hotspot.
    #
    # Prima le percentuali erano scritte a mano e la scena doveva inseguirle;
    # ora è la scena a dettarle. Si proietta il punto 3D nella vista della
    # camera e si ottiene la posizione esatta sullo schermo: nessuno deve più
    # indovinare, e spostare un mobile aggiorna il suo punto da solo.
    # la matrice della camera va ricalcolata: è stata ruotata a mano dopo la
    # creazione, e senza questo aggiornamento la proiezione userebbe la posa
    # iniziale invece di quella vera
    bpy.context.view_layer.update()

    proiezioni = {}
    for nome, posizione in punti.items():
        v = world_to_camera_view(scena, cam, m.Vector(posizione))
        proiezioni[nome] = {
            "x": round(v.x * 100, 1),
            "y": round((1.0 - v.y) * 100, 1),
            "davanti": v.z > 0,
        }
    (uscita / "hotspot.json").write_text(json.dumps(proiezioni, indent=2), encoding="utf-8")
    fuori = [n for n, p in proiezioni.items() if not p["davanti"] or not (2 <= p["x"] <= 98 and 2 <= p["y"] <= 98)]
    if fuori:
        print(f"HOTSPOT_FUORI_QUADRO {chiave} {' '.join(fuori)}")

    oggetti = len([o for o in scena.objects if o.type == "MESH"])
    luci = len([o for o in scena.objects if o.type == "LIGHT"])
    print(f"COSTRUITO {chiave} · {oggetti} oggetti · {luci} luci · {costruzione:.1f}s")

    # è un'opzione senza valore: `argomento` cerca `--nome=`, qui basta esserci
    if "--solo-proiezione" in sys.argv:
        # serve a mettere a punto inquadratura e arredi senza aspettare Cycles
        print(f"SOLO_PROIEZIONE {chiave}")
        return

    inizio = time.time()
    bpy.ops.render.render(write_still=False)
    print(f"RESO {chiave} {time.time() - inizio:.1f}s")

    # I nodi di uscita numerano i file col fotogramma: si rinominano una volta
    # sola qui, invece di insegnare al gioco un altro schema di nomi.
    for percorso in sorted(uscita.glob("*0001.png")):
        pulito = uscita / (percorso.name.replace("-0001", "").replace("0001", ""))
        percorso.replace(pulito)
        print(f"SCRITTO {pulito.name}")


main()
