"""
I quattordici ambienti del Méridien, descritti come dati e costruiti in codice.

Ogni funzione riceve il modulo `meridien` come `m` e restituisce il dizionario
della camera. La regola della luce vale per tutti: **una sorgente calda
dominante**, il resto è riflesso freddo dalla pioggia o dal mare. Chi aggiunge
un ambiente aggiunge una funzione qui e una riga in `AMBIENTI`.
"""

import math

# ── guscio condiviso ────────────────────────────────────────────────────────


def guscio(m, larghezza=9.0, profondita=7.6, altezza=4.6, pavimento=None, pareti=None,
           soffitto=None):
    scena = m.bpy.context.scene
    m.cielo(scena, "night", 0.34)
    pezzi = m.stanza(
        larghezza,
        profondita,
        altezza,
        pavimento or m.materiale_marmo(),
        pareti or m.materiale_intonaco(tinta="night"),
        soffitto or m.materiale_intonaco("soffitto", tinta="ink", ruvidita=0.95),
    )
    return pezzi


def misure_inquadratura(profondita, lente=28.0, arretramento=1.1, altezza_occhi=1.78):
    """
    Quanto devono essere larga e alta la stanza perché riempia il quadro.

    Il vuoto nero agli angoli non è mancanza di luce: è la stanza che finisce
    prima dell'inquadratura. Al muro di fondo la camera vede una finestra alta
    e larga quanto dice l'ottica, e se le pareti sono più corte di così, oltre
    non c'è nulla da illuminare.

    Qui il conto si fa una volta e le stanze si adeguano, invece di scoprire a
    render finito che mancava un metro di soffitto.
    """
    distanza = profondita + arretramento
    mezza_larghezza = distanza * (18.0 / lente)
    mezza_altezza = mezza_larghezza * 9.0 / 16.0
    larghezza = mezza_larghezza * 1.98
    altezza = altezza_occhi + mezza_altezza + 0.2
    return round(larghezza, 1), round(altezza, 1)


def sguardo(m, profondita=7.6, altezza_occhi=1.78, lente=28.0, inclinazione=1.6):
    """La camera del Méridien: in piedi, appena inclinata verso il pavimento."""
    scena = m.bpy.context.scene
    return m.camera(
        scena,
        (0, -(profondita / 2 + 1.1), altezza_occhi),
        (0, profondita / 2 - 0.4, inclinazione),
        lente,
    )


def punto_schermo(fx, fy, distanza, profondita, lente=28.0, altezza_occhi=1.78,
                  mira=1.6, arretramento=1.1, da=None, verso=None):
    """
    La posizione nello spazio di un punto che deve **apparire** dove dico io.

    Piazzare gli arredi a occhio e poi scoprire a render finito che tre
    hotspot su otto sono usciti dal quadro è un giro inutile: vicino alla
    camera il tronco di visione è strettissimo, e un metro di spostamento
    laterale conta come dieci in fondo alla stanza.

    Qui il problema si rovescia. Si dice dove il punto deve cadere sullo
    schermo — `fx` e `fy` da -1 a 1, zero al centro — e a che distanza dalla
    camera, e la funzione restituisce le coordinate del mondo. La composizione
    diventa una scelta, non una scoperta.
    """
    import mathutils

    camera = mathutils.Vector(da or (0.0, -(profondita / 2 + arretramento), altezza_occhi))
    bersaglio = mathutils.Vector(verso or (0.0, profondita / 2 - 0.4, mira))
    avanti = (bersaglio - camera).normalized()
    # la camera non ha rollio e guarda lungo +y: la destra è esattamente +x
    destra = mathutils.Vector((1.0, 0.0, 0.0))
    su = destra.cross(avanti).normalized() * -1.0

    mezza = 18.0 / lente
    centro = camera + avanti * distanza
    posizione = centro + destra * (fx * distanza * mezza) + su * (fy * distanza * mezza * 9.0 / 16.0)
    return (round(posizione.x, 2), round(posizione.y, 2), round(posizione.z, 2))


def cornicione(m, larghezza, profondita, altezza, mat):
    """Fascia di ottone lungo le pareti: taglia il muro e raccoglie la luce."""
    m.blocco("cornice_fondo", (0, profondita / 2 - 0.07, altezza * 0.62), (larghezza, 0.06, 0.09), mat)
    m.blocco("cornice_sx", (-larghezza / 2 + 0.07, 0, altezza * 0.62), (0.06, profondita, 0.09), mat)
    m.blocco("cornice_dx", (larghezza / 2 - 0.07, 0, altezza * 0.62), (0.06, profondita, 0.09), mat)


def colonne(m, quante, larghezza, profondita, altezza, mat, arretramento=1.2):
    for i in range(quante):
        x = -larghezza / 2 + arretramento + i * ((larghezza - 2 * arretramento) / max(1, quante - 1))
        m.cilindro(f"colonna_{i}", (x, profondita / 2 - 1.0, altezza / 2), 0.22, altezza, mat)


def finestra_pioggia(m, x, y, z, larghezza, altezza, mat_vetro, mat_telaio, ruotata=False):
    """Una finestra con la notte dietro: il vetro prende la luce della stanza."""
    rot = (0, 0, math.pi / 2) if ruotata else (0, 0, 0)
    spessore = 0.06
    m.blocco("vetro", (x, y, z), (larghezza, spessore, altezza), mat_vetro, rot)
    m.blocco("telaio_sup", (x, y, z + altezza / 2), (larghezza + 0.14, 0.12, 0.1), mat_telaio, rot)
    m.blocco("telaio_inf", (x, y, z - altezza / 2), (larghezza + 0.14, 0.12, 0.1), mat_telaio, rot)
    m.blocco("montante", (x, y, z), (0.07, 0.1, altezza), mat_telaio, rot)


# ── 1. hall ─────────────────────────────────────────────────────────────────


def hall(m):
    P = 7.8
    L, H = misure_inquadratura(P, lente=28.0)
    ottone = m.materiale_ottone()
    legno = m.materiale_legno(tinta="plum")
    guscio(
        m, L, P, H,
        pavimento=m.materiale_scacchiera(scala=5.0),
        pareti=m.materiale_intonaco(tinta="petrol", ruvidita=0.7),
    )
    cornicione(m, L, P, H, ottone)

    # bancone della portineria
    m.blocco("bancone", (0, P / 2 - 2.2, 0.55), (5.2, 0.8, 1.1), legno)
    m.blocco("piano_bancone", (0, P / 2 - 2.2, 1.13), (5.5, 0.95, 0.07), m.materiale_marmo("piano", "marble", "plum", 3.0))
    m.blocco("zoccolo_ottone", (0, P / 2 - 2.62, 0.12), (5.2, 0.04, 0.24), ottone)

    # quadro delle chiavi: griglia di caselle, ognuna con la sua ombra
    casella = m.materiale_tinta_piatta("casella", "ink", 0.8)
    m.blocco("quadro", (0, P / 2 - 0.14, 2.5), (5.0, 0.16, 1.9), legno)
    for riga in range(5):
        for col in range(12):
            x = -2.3 + col * 0.42
            z = 1.75 + riga * 0.38
            m.blocco(f"casella_{riga}_{col}", (x, P / 2 - 0.24, z), (0.36, 0.02, 0.32), casella)
            if (riga * 12 + col) % 3 != 0:
                m.blocco(f"chiave_{riga}_{col}", (x, P / 2 - 0.26, z - 0.06), (0.03, 0.02, 0.16), ottone)

    # gli orologi delle capitali
    quadrante = m.materiale_tinta_piatta("quadrante", "ivory", 0.35)
    for i in range(5):
        x = -3.4 + i * 1.7
        m.cilindro(f"orologio_{i}", (x, P / 2 - 0.2, 3.95), 0.34, 0.1, ottone, (math.pi / 2, 0, 0))
        m.cilindro(f"quadrante_{i}", (x, P / 2 - 0.26, 3.95), 0.29, 0.02, quadrante, (math.pi / 2, 0, 0))
        ang = (i * 1.1) % math.pi
        m.blocco(f"lancetta_{i}", (x + math.cos(ang) * 0.09, P / 2 - 0.28, 3.95 + math.sin(ang) * 0.09),
                 (0.19, 0.01, 0.015), m.materiale_tinta_piatta(f"ago{i}", "ink", 0.5), (0, ang, 0))

    colonne(m, 2, L, P, H, m.materiale_marmo("colonna", "marble", "ink", 2.0), 0.9)

    # tappeto rosso e valigie
    m.blocco("tappeto", (0, -0.6, 0.012), (2.4, 5.4, 0.02), m.materiale_velluto("tappeto", "lacquer_deep"))
    valigia = m.materiale_legno("cuoio", tinta="lacquer_deep", scala=8.0)
    m.blocco("valigia_1", (2.6, 0.4, 0.22), (0.72, 0.34, 0.44), valigia)
    m.blocco("valigia_2", (2.72, 0.25, 0.62), (0.6, 0.3, 0.36), valigia)
    m.blocco("campanello", (-2.2, P / 2 - 2.55, 1.22), (0.14, 0.14, 0.1), ottone)
    m.blocco("registro", (1.6, P / 2 - 2.5, 1.19), (0.6, 0.44, 0.05), m.materiale_tinta_piatta("carta", "ivory_dim", 0.9))

    # centralino: la scatola nera con le spine, sul lato del bancone
    m.blocco("centralino", (-1.5, P / 2 - 2.5, 1.32), (0.5, 0.36, 0.3), m.materiale_tinta_piatta("bachelite", "ink", 0.45))
    m.cilindro("cornetta", (-1.5, P / 2 - 2.75, 1.5), 0.05, 0.28, m.materiale_tinta_piatta("cornetta", "ink", 0.4), (0, math.pi / 2, 0))
    for i in range(6):
        m.cilindro(f"spina_{i}", (-1.68 + i * 0.07, P / 2 - 2.62, 1.46), 0.014, 0.05, ottone, lati=8)

    # porta d'ingresso: arretrata verso il fondo, dove il tronco di visione è
    # abbastanza largo da contenerla
    m.blocco("stipite_ingresso", (L / 2 - 0.7, 3.0, 1.35), (0.14, 2.3, 2.7), ottone)
    m.blocco("vetro_ingresso", (L / 2 - 0.74, 3.0, 1.35), (0.06, 2.0, 2.4), m.materiale_vetro())

    # carrello delle consegne
    m.blocco("carrello", (-2.3, -0.7, 0.34), (1.2, 0.7, 0.08), ottone)
    for cx, cy in ((-2.8, -1.0), (-1.8, -1.0), (-2.8, -0.4), (-1.8, -0.4)):
        m.cilindro(f"rotella_{cx}_{cy}", (cx, cy, 0.09), 0.09, 0.05, m.materiale_tinta_piatta(f"rot{cx}{cy}", "ink", 0.7), (0, math.pi / 2, 0), lati=12)
    m.cilindro("montante_carrello", (-1.8, -0.7, 1.0), 0.03, 1.3, ottone)
    m.blocco("baule", (-2.3, -0.7, 0.62), (0.9, 0.5, 0.48), valigia)

    # l'oggetto fuori posto: un guanto solo, in mezzo al tappeto
    m.blocco("guanto", (0.5, 0.1, 0.03), (0.22, 0.1, 0.03), m.materiale_tinta_piatta("guanto", "ivory", 0.85), (0, 0, 0.6))

    # luce: una lampada calda sul bancone domina, il resto è riflesso
    m.luce_area("chiave", (0, P / 2 - 3.0, 3.9), 560, 3.4, "brass_soft", (0, 0, 0))
    m.luce_punto("quadro", (0, P / 2 - 1.2, 3.4), 150, "brass")
    # lampada da banco: una sorgente che si vede, non solo che illumina
    m.cilindro("lampada_banco", (-2.2, P / 2 - 2.55, 1.44), 0.14, 0.2,
               m.materiale_emissivo("paralume_banco", "brass_soft", 12.0), lati=18)
    m.cilindro("stelo_banco", (-2.2, P / 2 - 2.55, 1.28), 0.02, 0.3, ottone)
    m.luce_punto("banco", (-2.2, P / 2 - 2.55, 1.44), 60, "brass_soft", 0.1)
    # velatura sul cornicione: toglie il nero dalle pareti alte
    m.luce_area("cornicione", (0, 0.4, H - 0.35), 130, 7.0, "ivory_dim", (math.pi, 0, 0))
    m.luce_area("ingresso", (L / 2 + 1.2, 3.0, 1.9), 140, 2.4, "rain", (0, -math.pi / 2, 0))
    m.luce_area("riempimento", (0, -P / 2 - 0.5, 2.8), 90, 6.0, "rain", (math.pi / 2.4, 0, 0))
    cam = sguardo(m, P, 1.78, 28.0, 1.6)
    return cam, {
        "bancone": (0, P / 2 - 2.6, 1.2),
        "registro": (1.6, P / 2 - 2.5, 1.24),
        "orologio": (0, P / 2 - 0.26, 3.95),
        "telefono": (-1.5, P / 2 - 2.6, 1.45),
        "porta": (L / 2 - 0.84, 3.0, 1.5),
        "valigia": (2.66, 0.32, 0.5),
        "consegna": (-2.3, -0.7, 0.75),
        "oggetto": (0.5, 0.1, 0.1),
    }


# ── 2. sala da ballo ────────────────────────────────────────────────────────


def sala_ballo(m):
    P = 8.4
    L, H = misure_inquadratura(P, lente=30.0, altezza_occhi=1.8)
    ottone = m.materiale_ottone()
    guscio(
        m, L, P, H,
        pavimento=m.materiale_legno("parquet", tinta="plum", scala=9.0),
        pareti=m.materiale_intonaco(tinta="plum", ruvidita=0.75),
    )
    cornicione(m, L, P, H, ottone)

    # palco in fondo, con tendaggio
    m.blocco("palco", (0, P / 2 - 1.4, 0.35), (7.0, 2.6, 0.7), m.materiale_legno("assi", tinta="plum", scala=14.0))
    velluto = m.materiale_velluto("sipario", "lacquer_deep")
    for i in range(9):
        x = -3.6 + i * 0.9
        m.cilindro(f"piega_{i}", (x, P / 2 - 0.25, 2.9), 0.26, 4.2, velluto, lati=10)

    # lampadario a cascata
    vetro = m.materiale_vetro()
    luce_mat = m.materiale_emissivo("gocce", "brass_soft", 9.0)
    m.cilindro("stelo", (0, -0.4, 5.05), 0.05, 0.9, ottone)
    for anello, (raggio, quota, quanti) in enumerate([(1.15, 4.4, 16), (0.82, 3.95, 12), (0.5, 3.6, 8)]):
        m.cilindro(f"anello_{anello}", (0, -0.4, quota), raggio, 0.05, ottone, lati=48)
        for i in range(quanti):
            a = (i / quanti) * math.tau
            m.sfera(f"goccia_{anello}_{i}", (math.cos(a) * raggio, -0.4 + math.sin(a) * raggio, quota - 0.22), 0.075,
                    luce_mat if i % 2 == 0 else vetro)

    colonne(m, 4, L, P, H, m.materiale_marmo("colonna", "marble", "plum", 2.0), 1.0)

    # tavolini e coppe
    marmo = m.materiale_marmo("tavolo", "marble", "ink", 4.0)
    for i, (x, y) in enumerate([(-4.1, -1.4), (4.1, -1.2), (-3.6, 1.6), (3.8, 1.8)]):
        m.cilindro(f"tavolo_{i}", (x, y, 0.72), 0.46, 0.06, marmo)
        m.cilindro(f"gamba_{i}", (x, y, 0.36), 0.06, 0.72, ottone)
        m.cilindro(f"coppa_{i}", (x + 0.16, y + 0.1, 0.83), 0.05, 0.16, vetro)

    m.luce_area("chiave", (0, -0.4, 4.7), 438, 2.4, "brass_soft")
    m.luce_area("palco", (0, P / 2 - 2.0, 4.6), 131, 3.0, "lacquer")
    m.luce_area("riempimento", (0, -P / 2 - 0.6, 3.0), 47, 6.0, "rain", (math.pi / 2.4, 0, 0))
    # gli arredi che devono essere raggiungibili si posano dove li voglio vedere
    def pt(fx, fy, d):
        return punto_schermo(fx, fy, d, P, 30.0, 1.80, 2.0)

    p_spartiti = pt(0.52, -0.06, 7.4)
    m.cilindro("leggio", (p_spartiti[0], p_spartiti[1], p_spartiti[2] - 0.55), 0.02, 1.1, ottone)
    m.blocco("spartito_palco", p_spartiti, (0.46, 0.3, 0.02),
             m.materiale_tinta_piatta("carta_musica", "ivory", 0.85), (0.7, 0, 0))

    p_porta = pt(-0.82, 0.02, 8.6)
    m.blocco("porta_servizio", (p_porta[0], p_porta[1], 1.25), (1.1, 0.18, 2.5),
             m.materiale_legno("porta_ballo", tinta="plum", scala=6.0))

    p_tavolo = pt(-0.6, 0.42, 6.4)
    m.cilindro("tavolo_vicino", (p_tavolo[0], p_tavolo[1], 0.74), 0.48, 0.06, marmo)
    m.cilindro("gamba_vicino", (p_tavolo[0], p_tavolo[1], 0.37), 0.06, 0.74, ottone)
    p_bicchieri = (p_tavolo[0] + 0.18, p_tavolo[1] + 0.1, 0.86)
    m.cilindro("coppa_vicina", p_bicchieri, 0.05, 0.17, vetro)

    p_consegna = pt(0.64, 0.4, 6.2)
    m.blocco("vassoio", (p_consegna[0], p_consegna[1], 0.78), (0.62, 0.44, 0.03), ottone)
    m.cilindro("gamba_vassoio", (p_consegna[0], p_consegna[1], 0.39), 0.05, 0.78, ottone)

    p_oggetto = pt(0.14, 0.0, 7.2)
    m.blocco("maschera", (p_oggetto[0], p_oggetto[1], 0.04), (0.26, 0.14, 0.06),
             m.materiale_tinta_piatta("maschera_caduta", "brass_soft", 0.4), (0, 0, 0.5))

    cam = sguardo(m, P, 1.80, 30.0, 2.0)
    return cam, {
        "lampadario": pt(0.0, -0.52, 7.2),
        "tavolo": (p_tavolo[0], p_tavolo[1], 0.78),
        "bicchieri": p_bicchieri,
        "spartiti": p_spartiti,
        "porta": (p_porta[0], p_porta[1], 1.5),
        "consegna": (p_consegna[0], p_consegna[1], 0.82),
        "oggetto": (p_oggetto[0], p_oggetto[1], 0.1),
    }


# ── 3. suite 404 ────────────────────────────────────────────────────────────


def suite(m):
    P = 7.2
    L, H = misure_inquadratura(P, lente=40.0, altezza_occhi=1.7)
    ottone = m.materiale_ottone()
    legno = m.materiale_legno(tinta="plum", scala=5.0)
    guscio(
        m, L, P, H,
        pavimento=m.materiale_velluto("moquette", "plum"),
        pareti=m.materiale_intonaco(tinta="night", ruvidita=0.85),
    )

    # letto
    m.blocco("base_letto", (-2.1, P / 2 - 2.4, 0.28), (2.3, 3.2, 0.56), legno)
    m.blocco("materasso", (-2.1, P / 2 - 2.4, 0.68), (2.2, 3.1, 0.26), m.materiale_tinta_piatta("lenzuolo", "ivory", 0.92))
    m.blocco("testiera", (-2.1, P / 2 - 0.95, 1.1), (2.4, 0.16, 1.5), m.materiale_velluto("capitonne", "petrol"))
    m.blocco("cuscino", (-2.6, P / 2 - 1.3, 0.9), (0.8, 0.44, 0.2), m.materiale_tinta_piatta("cuscino", "ivory", 0.95))

    # scrivania, dove è stato trovato
    m.blocco("scrivania", (2.3, P / 2 - 2.0, 0.72), (2.0, 0.8, 0.06), legno)
    for sx in (-0.85, 0.85):
        m.blocco(f"gamba{sx}", (2.3 + sx, P / 2 - 2.0, 0.36), (0.07, 0.7, 0.72), ottone)
    m.blocco("carte", (2.5, P / 2 - 2.05, 0.77), (0.42, 0.3, 0.02), m.materiale_tinta_piatta("carta", "ivory_dim", 0.9))
    m.blocco("tagliacarte", (1.85, P / 2 - 2.2, 0.77), (0.26, 0.03, 0.01), ottone, (0, 0, 0.4))

    # abat-jour: l'unica luce accesa
    paralume = m.materiale_emissivo("paralume", "brass_soft", 5.0)
    m.cilindro("stelo_lampada", (2.9, P / 2 - 2.35, 0.95), 0.03, 0.4, ottone)
    m.cilindro("paralume", (2.9, P / 2 - 2.35, 1.24), 0.19, 0.24, paralume, lati=20)

    # comodino con la chiave
    m.blocco("comodino", (-0.55, P / 2 - 1.5, 0.3), (0.5, 0.44, 0.6), legno)
    m.blocco("chiave", (-0.55, P / 2 - 1.5, 0.63), (0.11, 0.03, 0.02), ottone, (0, 0, 0.3))

    # finestra battuta dalla pioggia, sulla parete di destra
    _pf = punto_schermo(0.78, -0.28, 7.8, P, 40.0, 1.70, 1.5)
    finestra_pioggia(m, _pf[0] + 0.35, _pf[1], _pf[2], 1.8, 1.5, m.materiale_vetro(), ottone, ruotata=True)

    # poltrona
    _pv = punto_schermo(-0.3, 0.36, 6.2, P, 40.0, 1.70, 1.5)
    m.blocco("poltrona", (_pv[0], _pv[1] + 0.5, 0.42), (1.0, 0.95, 0.84), m.materiale_velluto("poltrona", "petrol_lit"))
    m.blocco("schienale", (_pv[0], _pv[1] + 0.95, 0.95), (1.0, 0.2, 0.9), m.materiale_velluto("schienale", "petrol_lit"))
    m.blocco("vassoio_suite", (_pv[0], _pv[1], 0.62), (0.5, 0.36, 0.03), ottone)
    m.cilindro("piede_vassoio", (_pv[0], _pv[1], 0.31), 0.04, 0.62, ottone)

    m.luce_area("chiave", (2.9, P / 2 - 2.35, 1.5), 81, 0.5, "brass_soft")
    m.luce_area("finestra", (_pf[0] + 1.4, _pf[1], _pf[2]), 90, 2.2, "rain", (0, -math.pi / 2, 0))
    m.luce_punto("corridoio", (-2.4, -P / 2 + 0.9, 2.2), 34, "brass")
    def pt(fx, fy, d):
        return punto_schermo(fx, fy, d, P, 40.0, 1.70, 1.5)

    # armadio, cassettone, sveglia e telefono: la stanza deve poter essere frugata
    p_armadio = pt(-0.72, -0.1, 7.6)
    m.blocco("armadio", (p_armadio[0], p_armadio[1], 1.15), (1.1, 0.7, 2.3), legno)
    m.blocco("anta_sx", (p_armadio[0] - 0.27, p_armadio[1] - 0.36, 1.15), (0.5, 0.05, 2.2), legno)
    m.blocco("anta_dx", (p_armadio[0] + 0.27, p_armadio[1] - 0.36, 1.15), (0.5, 0.05, 2.2), legno)
    m.sfera("pomo_armadio", (p_armadio[0], p_armadio[1] - 0.4, 1.2), 0.035, ottone)

    p_cassetto = pt(0.7, 0.34, 6.6)
    m.blocco("cassettone", (p_cassetto[0], p_cassetto[1], 0.42), (1.0, 0.6, 0.84), legno)
    for i in range(3):
        m.blocco(f"cassetto_{i}", (p_cassetto[0], p_cassetto[1] - 0.32, 0.16 + i * 0.26), (0.92, 0.05, 0.22), legno)
        m.blocco(f"maniglia_{i}", (p_cassetto[0], p_cassetto[1] - 0.36, 0.16 + i * 0.26), (0.28, 0.03, 0.03), ottone)

    m.cilindro("sveglia", (-0.55, P / 2 - 1.5, 0.72), 0.09, 0.05,
               m.materiale_tinta_piatta("sveglia", "ivory", 0.35), (math.pi / 2, 0, 0), lati=20)

    p_telefono = pt(0.4, 0.02, 7.2)
    m.blocco("telefono_suite", (p_telefono[0], p_telefono[1], 0.83), (0.3, 0.22, 0.14),
             m.materiale_tinta_piatta("bachelite_suite", "ink", 0.45))
    m.blocco("mensola_tel", (p_telefono[0], p_telefono[1], 0.74), (0.5, 0.4, 0.05), legno)
    for sx in (-0.2, 0.2):
        m.blocco(f"gamba_tel{sx}", (p_telefono[0] + sx, p_telefono[1], 0.37), (0.05, 0.05, 0.74), ottone)

    p_porta = pt(-0.78, 0.0, 6.4)
    m.blocco("porta_suite", (p_porta[0], p_porta[1], 1.15), (0.16, 1.0, 2.3), legno)
    m.sfera("pomo_porta", (p_porta[0] + 0.12, p_porta[1] - 0.3, 1.05), 0.05, ottone)

    cam = sguardo(m, P, 1.70, 40.0, 1.5)
    return cam, {
        "porta": (p_porta[0], p_porta[1], 1.3),
        "finestra": pt(0.78, -0.28, 7.8),
        "armadio": (p_armadio[0], p_armadio[1] - 0.4, 1.5),
        "cassetto": (p_cassetto[0], p_cassetto[1] - 0.36, 0.55),
        "telefono": (p_telefono[0], p_telefono[1], 0.9),
        "orologio": (-0.55, P / 2 - 1.56, 0.72),
        "consegna": pt(-0.3, 0.36, 6.2),
        "oggetto": pt(0.16, 0.2, 7.0),
    }


# ── 4. terrazza ─────────────────────────────────────────────────────────────


def terrazza(m):
    L, P, H = 12.0, 8.0, 4.0
    scena = m.bpy.context.scene
    m.cielo(scena, "night", 0.14)
    ottone = m.materiale_ottone()

    m.piano("pavimento", (0, 0, 0), (L, P), m.materiale_piastrelle("lastre", "marble", "ink", 5.0))
    # il mare: un piano immenso, quasi nero, appena mosso
    mare = m.materiale_tinta_piatta("mare", "ink", 0.06)
    m.piano("mare", (0, 26, -1.6), (90, 60), mare)

    # ringhiera
    m.blocco("parapetto", (0, P / 2 - 0.2, 0.5), (L, 0.28, 1.0), m.materiale_marmo("parapetto", "marble", "ink", 3.0))
    m.blocco("corrimano", (0, P / 2 - 0.2, 1.06), (L, 0.36, 0.08), ottone)
    for i in range(18):
        x = -L / 2 + 0.5 + i * (L - 1.0) / 17
        m.cilindro(f"balaustro_{i}", (x, P / 2 - 0.2, 0.62), 0.055, 0.85, ottone)

    # faro lontano
    m.cilindro("faro", (-13.0, 40.0, 3.0), 1.1, 9.0, m.materiale_tinta_piatta("torre", "ink", 0.8))
    m.sfera("lanterna", (-13.0, 40.0, 8.0), 1.0, m.materiale_emissivo("lanterna", "brass_soft", 26.0))

    # vasi e sedute
    for i, x in enumerate((-4.6, 4.6)):
        m.cilindro(f"vaso_{i}", (x, P / 2 - 1.8, 0.35), 0.5, 0.7, m.materiale_marmo(f"vaso{i}", "marble", "petrol", 4.0))
        for f in range(7):
            a = (f / 7) * math.tau
            m.cilindro(f"foglia_{i}_{f}", (x + math.cos(a) * 0.3, P / 2 - 1.8 + math.sin(a) * 0.3, 1.25),
                       0.05, 1.2, m.materiale_tinta_piatta(f"foglia{i}{f}", "petrol", 0.8),
                       (math.cos(a) * 0.4, math.sin(a) * 0.4, 0))



    # lampioni dell'albergo, alle spalle
    for x in (-5.4, 5.4):
        m.cilindro(f"palo{x}", (x, -P / 2 + 0.8, 1.4), 0.07, 2.8, ottone)
        m.sfera(f"globo{x}", (x, -P / 2 + 0.8, 2.9), 0.24, m.materiale_emissivo(f"globo{x}", "brass_soft", 12.0))

    m.luce_area("chiave", (-5.4, -P / 2 + 0.8, 2.9), 69, 0.6, "brass_soft")
    m.luce_area("chiave2", (5.4, -P / 2 + 0.8, 2.9), 69, 0.6, "brass_soft")
    m.luce_area("mare", (0, 24.0, 6.0), 131, 30.0, "rain", (math.pi / 2.2, 0, 0))
    def pt(fx, fy, d):
        return punto_schermo(fx, fy, d, P, 30.0, 1.72, 1.6)

    # orologio dell'albergo, porta a vetri, carrello del servizio, tavolino
    p_orologio = pt(-0.66, -0.42, 8.4)
    m.cilindro("orologio_terrazza", p_orologio, 0.36, 0.12, ottone, (math.pi / 2, 0, 0))
    m.cilindro("quadrante_terrazza", (p_orologio[0], p_orologio[1] - 0.06, p_orologio[2]), 0.3, 0.02,
               m.materiale_tinta_piatta("quadrante_est", "ivory", 0.35), (math.pi / 2, 0, 0))

    p_porta = pt(0.68, -0.02, 8.0)
    m.blocco("porta_terrazza", (p_porta[0], p_porta[1], 1.25), (1.5, 0.14, 2.5), m.materiale_vetro())
    m.blocco("telaio_terrazza", (p_porta[0], p_porta[1] - 0.05, 1.25), (1.7, 0.08, 2.7), ottone)

    p_tavolo = pt(-0.34, 0.3, 6.8)
    m.blocco("tavolino", (p_tavolo[0], p_tavolo[1], 0.7), (1.1, 1.1, 0.06),
             m.materiale_marmo("tavolino", "marble", "ink", 3.0))
    m.cilindro("piede", (p_tavolo[0], p_tavolo[1], 0.35), 0.09, 0.7, ottone)
    p_bicchieri = (p_tavolo[0] - 0.2, p_tavolo[1] + 0.1, 0.82)
    m.cilindro("calice", p_bicchieri, 0.05, 0.18, m.materiale_vetro())

    p_consegna = pt(0.3, 0.32, 6.4)
    m.blocco("carrello_terrazza", (p_consegna[0], p_consegna[1], 0.72), (0.9, 0.6, 0.05), ottone)
    m.cilindro("piede_carrello", (p_consegna[0], p_consegna[1], 0.36), 0.04, 0.72, ottone)

    p_oggetto = pt(-0.2, 0.02, 8.6)
    m.blocco("fazzoletto", (p_oggetto[0], p_oggetto[1], 0.02), (0.3, 0.26, 0.01),
             m.materiale_tinta_piatta("lino", "ivory", 0.9), (0, 0, 0.4))

    cam = sguardo(m, P, 1.72, 30.0, 1.6)
    return cam, {
        "ringhiera": (0, P / 2 - 0.2, 1.1),
        "tavolo": (p_tavolo[0], p_tavolo[1], 0.75),
        "bicchieri": p_bicchieri,
        "porta": (p_porta[0], p_porta[1], 1.5),
        "orologio": p_orologio,
        "consegna": (p_consegna[0], p_consegna[1], 0.78),
        "oggetto": (p_oggetto[0], p_oggetto[1], 0.06),
    }


# ── 5. piscina vuota ────────────────────────────────────────────────────────


def piscina(m):
    P = 8.6
    L, H = misure_inquadratura(P, lente=32.0, altezza_occhi=1.76)
    ottone = m.materiale_ottone()
    piastrella = m.materiale_piastrelle("piastrelle", "petrol", "marble", 16.0)
    guscio(m, L, P, H, pavimento=m.materiale_piastrelle("bordo", "marble", "ivory_dim", 10.0),
           pareti=m.materiale_piastrelle("parete", "petrol_lit", "marble", 12.0))

    # la vasca: pareti interne e fondo, scavata sotto il livello del bordo
    vx, vy, vz = 6.4, 4.6, 1.7
    m.blocco("fondo_vasca", (0, 0.4, -vz), (vx, vy, 0.12), piastrella)
    m.blocco("vasca_fondo", (0, 0.4 + vy / 2, -vz / 2), (vx, 0.12, vz), piastrella)
    m.blocco("vasca_sx", (-vx / 2, 0.4, -vz / 2), (0.12, vy, vz), piastrella)
    m.blocco("vasca_dx", (vx / 2, 0.4, -vz / 2), (0.12, vy, vz), piastrella)
    m.blocco("vasca_vicino", (0, 0.4 - vy / 2, -vz / 2), (vx, 0.12, vz), piastrella)

    # riga scura del livello dell'acqua che non c'è più
    m.blocco("livello", (0, 0.4 + vy / 2 - 0.07, -0.35), (vx, 0.02, 0.06), m.materiale_tinta_piatta("alga", "petrol", 0.9))

    # scaletta
    for lato in (-1, 1):
        x = lato * 1.1
        m.cilindro(f"montante_{lato}", (x, 2.2, -0.5), 0.05, 2.4, ottone)
        for g in range(3):
            m.cilindro(f"gradino_{lato}_{g}", (x, 2.2, -0.35 - g * 0.42), 0.03, 0.6, ottone,
                       (0, math.pi / 2, 0))

    # una scarpa sul fondo: l'oggetto fuori posto
    m.blocco("scarpa", (0.9, 3.1, -vz + 0.16), (0.26, 0.1, 0.1), m.materiale_tinta_piatta("cuoio", "lacquer_deep", 0.4), (0, 0, 0.7))
    m.blocco("tacco", (0.79, 3.1, -vz + 0.09), (0.05, 0.05, 0.12), m.materiale_tinta_piatta("tacco", "ink", 0.4))

    # lettini
    for i, x in enumerate((-4.0, -4.0, 4.0)):
        y = -2.4 + i * 1.6
        m.blocco(f"lettino_{i}", (x, y, 0.32), (0.7, 1.9, 0.1), m.materiale_tinta_piatta(f"telo{i}", "ivory_dim", 0.9))
        m.cilindro(f"telaio_{i}", (x, y, 0.16), 0.04, 1.8, ottone, (math.pi / 2, 0, 0))

    m.luce_area("chiave", (0, 0.4, H - 0.3), 219, 4.0, "petrol_lit")
    m.luce_punto("bordo", (-3.4, -2.0, 3.0), 50, "brass_soft")
    m.luce_area("riflesso", (0, -P / 2 - 0.4, 2.0), 38, 5.0, "rain", (math.pi / 2.4, 0, 0))
    # orologio da bordo vasca, griglia di ventilazione, finestra alta, cesta
    m.cilindro("orologio_piscina", (-2.6, P / 2 - 0.2, 3.0), 0.32, 0.1, ottone, (math.pi / 2, 0, 0))
    m.cilindro("quadrante_piscina", (-2.6, P / 2 - 0.26, 3.0), 0.27, 0.02,
               m.materiale_tinta_piatta("quadrante_pisc", "ivory", 0.35), (math.pi / 2, 0, 0))
    m.blocco("griglia", (2.9, P / 2 - 0.16, 3.1), (0.9, 0.08, 0.6), m.materiale_acciaio())
    for i in range(6):
        m.blocco(f"lamella_{i}", (2.9, P / 2 - 0.22, 2.87 + i * 0.09), (0.86, 0.03, 0.04), m.materiale_acciaio())
    finestra_pioggia(m, 0.6, P / 2 - 0.14, 3.2, 2.2, 1.0, m.materiale_vetro(), ottone)


    def pt(fx, fy, d):
        return punto_schermo(fx, fy, d, P, 32.0, 1.76, 1.0)

    p_consegna = pt(-0.62, 0.2, 7.0)
    m.blocco("cesta_bordo", (p_consegna[0], p_consegna[1], 0.3), (0.7, 0.7, 0.6),
             m.materiale_legno("vimini_bordo", tinta="brass", scala=18.0))

    cam = sguardo(m, P, 1.76, 32.0, 1.0)
    return cam, {
        "scaletta": (1.1, 2.2, -0.2),
        "oggetto": (0.9, 3.1, -vz + 0.2),
        "orologio": (-2.6, P / 2 - 0.3, 3.0),
        "ventilazione": (2.9, P / 2 - 0.24, 3.1),
        "finestra": (0.6, P / 2 - 0.2, 3.2),
        "consegna": (p_consegna[0], p_consegna[1], 0.62),
    }


# ── 6. cucina ───────────────────────────────────────────────────────────────


def cucina(m):
    P = 7.4
    L, H = misure_inquadratura(P, lente=38.0, altezza_occhi=1.72)
    acciaio = m.materiale_acciaio()
    guscio(m, L, P, H,
           pavimento=m.materiale_piastrelle("cotto", "ivory_dim", "ink", 9.0),
           pareti=m.materiale_piastrelle("bianche", "marble", "ivory_dim", 14.0))

    # banconi
    m.blocco("bancone_fondo", (0, P / 2 - 0.9, 0.46), (7.6, 0.9, 0.92), acciaio)
    m.blocco("piano_fondo", (0, P / 2 - 0.9, 0.94), (7.8, 1.0, 0.05), acciaio)
    m.blocco("isola", (0, -0.6, 0.46), (4.4, 1.3, 0.92), acciaio)
    m.blocco("piano_isola", (0, -0.6, 0.94), (4.6, 1.45, 0.05), acciaio)

    # rastrelliera con pentole appese
    m.blocco("rastrelliera", (0, -0.6, 2.5), (4.0, 0.06, 0.06), m.materiale_ottone())
    for i in range(9):
        x = -1.8 + i * 0.45
        m.cilindro(f"gancio_{i}", (x, -0.6, 2.36), 0.012, 0.28, m.materiale_ottone())
        r = 0.14 + (i % 3) * 0.05
        m.cilindro(f"pentola_{i}", (x, -0.6, 2.12 - r * 0.4), r, r * 0.9, acciaio, lati=20)

    # orologio a muro
    m.cilindro("orologio", (2.9, P / 2 - 0.2, 2.9), 0.32, 0.08, acciaio, (math.pi / 2, 0, 0))
    m.cilindro("quadrante", (2.9, P / 2 - 0.26, 2.9), 0.27, 0.02, m.materiale_tinta_piatta("bianco", "ivory", 0.4), (math.pi / 2, 0, 0))

    # cassette e bottiglie
    for i in range(4):
        m.blocco(f"cassetta_{i}", (-3.6, -2.2 + i * 0.1, 0.2 + i * 0.34), (0.7, 0.5, 0.32),
                 m.materiale_legno(f"cassa{i}", tinta="plum", scala=12.0))
    vetro = m.materiale_vetro()
    for i in range(6):
        m.cilindro(f"bottiglia_{i}", (-1.6 + i * 0.3, -0.6, 1.12), 0.045, 0.32, vetro, lati=14)

    # lampade industriali
    for x in (-2.6, 0, 2.6):
        m.cilindro(f"cappello{x}", (x, 0.4, 3.2), 0.28, 0.2, acciaio, lati=20)
        m.sfera(f"bulbo{x}", (x, 0.4, 3.05), 0.09, m.materiale_emissivo(f"bulbo{x}", "ivory", 14.0))
        m.luce_punto(f"luce{x}", (x, 0.4, 3.0), 180, "ivory")

    m.luce_area("riempimento", (0, -P / 2 - 0.4, 2.4), 28, 4.0, "rain", (math.pi / 2.4, 0, 0))
    # cappa di aspirazione, porta a battente, carrello di servizio, coltello
    m.blocco("cappa", (0, P / 2 - 1.0, 2.6), (3.2, 1.2, 0.5), acciaio)
    for i in range(7):
        m.blocco(f"feritoia_{i}", (-1.35 + i * 0.45, P / 2 - 1.55, 2.42), (0.34, 0.04, 0.12), acciaio)
    def pt(fx, fy, d):
        return punto_schermo(fx, fy, d, P, 38.0, 1.72, 1.5)

    p_porta = pt(-0.74, -0.04, 7.6)
    m.blocco("porta_cucina", (p_porta[0], p_porta[1], 1.15), (1.1, 0.16, 2.3), acciaio)
    m.blocco("oblo", (p_porta[0], p_porta[1] - 0.1, 1.65), (0.5, 0.06, 0.5), m.materiale_vetro())
    p_consegna = pt(0.66, 0.26, 6.8)
    m.blocco("carrello_cucina", (p_consegna[0], p_consegna[1], 0.74), (0.9, 0.6, 0.05), acciaio)
    m.cilindro("piede_cucina", (p_consegna[0], p_consegna[1], 0.37), 0.04, 0.74, acciaio)
    m.blocco("coltello", (0.4, -0.6, 1.0), (0.3, 0.04, 0.02), acciaio, (0, 0, 0.35))

    cam = sguardo(m, P, 1.72, 38.0, 1.5)
    return cam, {
        "tavolo": (0, -0.6, 1.0),
        "orologio": (2.9, P / 2 - 0.3, 2.9),
        "bicchieri": (-1.3, -0.6, 1.2),
        "porta": (p_porta[0], p_porta[1], 1.5),
        "ventilazione": (0, P / 2 - 1.55, 2.45),
        "consegna": (p_consegna[0], p_consegna[1], 0.8),
        "oggetto": (0.4, -0.6, 1.05),
    }


# ── 7. corridoio ────────────────────────────────────────────────────────────


def corridoio(m):
    L, P, H = 3.6, 16.0, 4.2
    ottone = m.materiale_ottone()
    guscio(m, L, P, H,
           pavimento=m.materiale_scacchiera("rombi", "lacquer_deep", "plum", 9.0),
           pareti=m.materiale_intonaco(tinta="plum", ruvidita=0.8))

    legno = m.materiale_legno("porta", tinta="plum", scala=6.0)
    numero = m.materiale_tinta_piatta("numero", "brass_soft", 0.3, 1.0)
    for i in range(6):
        y = -P / 2 + 2.4 + i * 2.5
        for lato in (-1, 1):
            x = lato * (L / 2 - 0.12)
            m.blocco(f"porta_{i}_{lato}", (x, y, 1.05), (0.1, 0.95, 2.1), legno)
            m.blocco(f"stipite_{i}_{lato}", (x - lato * 0.02, y, 1.12), (0.06, 1.12, 2.28), ottone)
            m.blocco(f"targa_{i}_{lato}", (x - lato * 0.07, y + 0.3, 1.7), (0.02, 0.16, 0.1), numero)
            m.sfera(f"pomo_{i}_{lato}", (x - lato * 0.1, y - 0.32, 1.02), 0.05, ottone)

        # applique fra una porta e l'altra
        if i < 5:
            ym = y + 1.25
            for lato in (-1, 1):
                x = lato * (L / 2 - 0.18)
                m.cilindro(f"applique_{i}_{lato}", (x, ym, 2.15), 0.09, 0.26,
                           m.materiale_emissivo(f"app{i}{lato}", "brass_soft", 7.0), lati=16)
                m.luce_punto(f"luce_{i}_{lato}", (x - lato * 0.2, ym, 2.15), 45, "brass_soft")

    m.blocco("battiscopa_sx", (-L / 2 + 0.1, 0, 0.09), (0.05, P, 0.18), ottone)
    m.blocco("battiscopa_dx", (L / 2 - 0.1, 0, 0.09), (0.05, P, 0.18), ottone)

    # in fondo, una finestra sulla tempesta
    finestra_pioggia(m, 0, P / 2 - 0.14, 1.7, 1.6, 1.8, m.materiale_vetro(), ottone)
    m.luce_area("tempesta", (0, P / 2 + 1.4, 1.9), 94, 2.2, "rain", (math.pi / 2, 0, 0))
    # telefono di servizio, griglia d'aerazione, quadretto, carrello, guanto
    m.blocco("telefono_corr", (-L / 2 + 0.16, -2.0, 1.4), (0.16, 0.28, 0.36),
             m.materiale_tinta_piatta("bachelite_corr", "ink", 0.45))
    m.cilindro("cornetta_corr", (-L / 2 + 0.3, -2.0, 1.58), 0.05, 0.26,
               m.materiale_tinta_piatta("cornetta_corr", "ink", 0.4), (math.pi / 2, 0, 0))
    m.blocco("griglia_corr", (L / 2 - 0.14, 0.6, 2.6), (0.06, 0.8, 0.5), ottone)
    for i in range(5):
        m.blocco(f"lamella_corr_{i}", (L / 2 - 0.19, 0.6, 2.42 + i * 0.09), (0.04, 0.76, 0.04), ottone)
    m.blocco("quadretto", (L / 2 - 0.14, -1.4, 1.7), (0.05, 0.7, 0.5), ottone)
    m.blocco("stampa", (L / 2 - 0.19, -1.4, 1.7), (0.03, 0.6, 0.4),
             m.materiale_tinta_piatta("stampa", "ivory_dim", 0.8))
    m.blocco("carrello_corr", (0.7, 1.6, 0.5), (0.8, 1.2, 0.06), ottone)
    m.cilindro("montante_corr", (1.0, 1.6, 0.9), 0.03, 0.9, ottone)
    m.blocco("biancheria", (0.7, 1.6, 0.72), (0.7, 1.0, 0.4),
             m.materiale_tinta_piatta("lenzuola", "ivory", 0.95))
    m.blocco("guanto_corr", (-0.5, -1.0, 0.03), (0.22, 0.1, 0.03),
             m.materiale_tinta_piatta("guanto_corr", "lacquer", 0.6), (0, 0, 0.8))

    cam = sguardo(m, P, 1.68, 30.0, 1.6)
    return cam, {
        "porta": (-L / 2 + 0.3, 0.15, 1.05),
        "ventilazione": (L / 2 - 0.3, 0.6, 2.6),
        "telefono": (-L / 2 + 0.35, -2.0, 1.5),
        "quadro": (L / 2 - 0.3, -1.4, 1.7),
        "consegna": (0.7, 1.6, 0.8),
        "oggetto": (-0.5, -1.0, 0.08),
    }


# ── 8. camerini ─────────────────────────────────────────────────────────────


def camerino(m):
    P = 6.2
    L, H = misure_inquadratura(P, lente=45.0, altezza_occhi=1.66)
    ottone = m.materiale_ottone()
    legno = m.materiale_legno(tinta="plum", scala=5.0)
    guscio(m, L, P, H,
           pavimento=m.materiale_legno("assito", tinta="plum", scala=11.0),
           pareti=m.materiale_intonaco(tinta="petrol", ruvidita=0.8))

    # specchio con le lampadine
    m.blocco("cornice_specchio", (0, P / 2 - 0.16, 1.9), (2.6, 0.1, 1.7), legno)
    m.blocco("specchio", (0, P / 2 - 0.22, 1.9), (2.3, 0.03, 1.45),
             m.materiale_tinta_piatta("vetro_specchio", "#B8C6D2", 0.04, 1.0))
    bulbo = m.materiale_emissivo("bulbo", "ivory", 16.0)
    for i in range(14):
        if i < 5:
            x, z = -1.35 + i * 0.675, 2.82
        elif i < 9:
            x, z = 1.35, 2.5 - (i - 5) * 0.42
        else:
            x, z = -1.35 + (13 - i) * 0.675, 1.0
        m.sfera(f"bulbo_{i}", (x, P / 2 - 0.3, z), 0.06, bulbo)

    m.blocco("tavolo_trucco", (0, P / 2 - 0.75, 0.78), (2.5, 0.6, 0.06), legno)
    for sx in (-1.1, 1.1):
        m.blocco(f"gamba{sx}", (sx, P / 2 - 0.75, 0.39), (0.06, 0.5, 0.78), ottone)
    for i in range(5):
        m.cilindro(f"boccetta_{i}", (-0.8 + i * 0.36, P / 2 - 0.72, 0.87), 0.035, 0.12, m.materiale_vetro(), lati=12)

    # stampelle con gli abiti
    m.cilindro("asta", (-2.2, -0.6, 2.1), 0.03, 3.4, ottone, (math.pi / 2, 0, 0))
    for i, tinta in enumerate(("lacquer", "petrol_lit", "ivory_dim", "plum", "brass")):
        y = -1.9 + i * 0.62
        m.blocco(f"abito_{i}", (-2.2, y, 1.35), (0.5, 0.14, 1.3), m.materiale_velluto(f"abito{i}", tinta))
        m.cilindro(f"gancio_{i}", (-2.2, y, 2.06), 0.012, 0.16, ottone)



    m.luce_area("chiave", (0, P / 2 - 1.0, 2.2), 94, 1.8, "ivory")
    m.luce_punto("abiti", (-2.4, -0.6, 2.8), 22, "brass_soft")
    def pt(fx, fy, d):
        return punto_schermo(fx, fy, d, P, 45.0, 1.66, 1.5)

    p_armadio = pt(0.72, -0.06, 6.8)
    m.blocco("armadio_cam", (p_armadio[0], p_armadio[1], 1.15), (0.9, 0.7, 2.3), legno)
    m.blocco("anta_cam", (p_armadio[0], p_armadio[1] - 0.38, 1.15), (0.8, 0.04, 2.2),
             m.materiale_tinta_piatta("specchio_anta", "#B8C6D2", 0.05, 1.0))

    p_cassetto = pt(0.6, 0.34, 6.0)
    m.blocco("cassettiera", (p_cassetto[0], p_cassetto[1], 0.4), (0.8, 0.6, 0.8), legno)
    for i in range(3):
        m.blocco(f"cassetto_cam_{i}", (p_cassetto[0], p_cassetto[1] - 0.32, 0.14 + i * 0.26), (0.72, 0.05, 0.22), legno)
        m.blocco(f"maniglia_cam_{i}", (p_cassetto[0], p_cassetto[1] - 0.36, 0.14 + i * 0.26), (0.22, 0.03, 0.03), ottone)

    p_consegna = pt(-0.66, 0.3, 6.0)
    m.blocco("vassoio_cam", (p_consegna[0], p_consegna[1], 0.76), (0.5, 0.36, 0.03), ottone)
    m.cilindro("piede_cam", (p_consegna[0], p_consegna[1], 0.38), 0.04, 0.76, ottone)

    p_spartiti = pt(-0.3, 0.16, 6.6)
    m.blocco("sedia_spartiti", (p_spartiti[0], p_spartiti[1], 0.23), (0.5, 0.5, 0.46), legno)
    m.blocco("spartito_cam", (p_spartiti[0], p_spartiti[1], 0.48), (0.4, 0.3, 0.01),
             m.materiale_tinta_piatta("spartito_cam", "ivory", 0.9), (0, 0, 0.5))

    p_oggetto = pt(0.16, 0.2, 6.4)
    m.blocco("sgabello_cam", (p_oggetto[0], p_oggetto[1], 0.44), (0.44, 0.44, 0.06), legno)
    for a in range(4):
        ax = p_oggetto[0] + (0.16 if a % 2 else -0.16)
        ay = p_oggetto[1] + (0.16 if a < 2 else -0.16)
        m.cilindro(f"zampa_{a}", (ax, ay, 0.22), 0.025, 0.44, ottone)
    m.blocco("guanto_cam", (p_oggetto[0], p_oggetto[1], 0.49), (0.2, 0.1, 0.03),
             m.materiale_tinta_piatta("guanto_cam", "lacquer", 0.6), (0, 0, 0.4))

    cam = sguardo(m, P, 1.66, 45.0, 1.5)
    return cam, {
        "specchio": (0, P / 2 - 0.3, 1.9),
        "spartiti": (p_spartiti[0], p_spartiti[1], 0.5),
        "armadio": (p_armadio[0], p_armadio[1] - 0.4, 1.5),
        "cassetto": (p_cassetto[0], p_cassetto[1] - 0.36, 0.5),
        "bicchieri": (-0.44, P / 2 - 0.78, 0.93),
        "consegna": (p_consegna[0], p_consegna[1], 0.8),
        "oggetto": (p_oggetto[0], p_oggetto[1], 0.52),
    }


# ── 9. passaggi di servizio ─────────────────────────────────────────────────


def passaggio(m):
    L, P, H = 4.0, 12.0, 4.0
    acciaio = m.materiale_acciaio()
    cemento = m.materiale_intonaco("cemento", tinta="ink", ruvidita=0.95)
    guscio(m, L, P, H, pavimento=cemento, pareti=cemento,
           soffitto=m.materiale_intonaco("solaio", tinta="ink", ruvidita=0.98))

    # tubi lungo il soffitto
    for i, (x, r) in enumerate([(-1.2, 0.11), (-0.9, 0.07), (1.0, 0.14), (1.35, 0.06)]):
        m.cilindro(f"tubo_{i}", (x, 0, 3.0 - i * 0.07), r, P, acciaio, (math.pi / 2, 0, 0), lati=16)
        for g in range(5):
            m.cilindro(f"staffa_{i}_{g}", (x, -P / 2 + 1.5 + g * 2.4, 3.0 - i * 0.07), r + 0.03, 0.08, acciaio, (math.pi / 2, 0, 0), lati=16)

    # scala a chiocciola in fondo
    for g in range(14):
        a = g * 0.42
        m.blocco(f"gradino_{g}", (0.9 + math.cos(a) * 0.75, P / 2 - 1.6 + math.sin(a) * 0.75, 0.18 + g * 0.19),
                 (0.8, 0.28, 0.05), acciaio, (0, 0, a))
    m.cilindro("anima", (0.9, P / 2 - 1.6, 1.4), 0.09, 2.8, acciaio)

    # quadro elettrico e luce d'emergenza
    m.blocco("quadro", (-L / 2 + 0.16, 1.2, 1.6), (0.14, 1.1, 1.3), acciaio)
    for i in range(4):
        m.blocco(f"leva_{i}", (-L / 2 + 0.28, 0.85 + i * 0.24, 1.9), (0.06, 0.05, 0.16), m.materiale_tinta_piatta(f"lev{i}", "lacquer", 0.4))

    for i in range(3):
        y = -P / 2 + 2.5 + i * 4.0
        m.blocco(f"plafoniera_{i}", (0, y, 3.2), (0.34, 0.2, 0.1), m.materiale_emissivo(f"emerg{i}", "petrol_lit", 12.0))
        m.luce_punto(f"emergenza_{i}", (0, y, 3.05), 70, "petrol_lit")

    m.luce_punto("porta", (0, -P / 2 + 0.4, 2.4), 19, "brass")
    # porta antincendio, presa d'aria, cassetta degli attrezzi, straccio
    m.blocco("porta_passaggio", (L / 2 - 0.16, -1.8, 1.1), (0.14, 1.1, 2.2), acciaio)
    m.blocco("maniglione", (L / 2 - 0.3, -1.8, 1.1), (0.06, 0.9, 0.08), m.materiale_ottone())
    m.blocco("presa_aria", (-L / 2 + 0.14, -0.2, 2.7), (0.06, 1.0, 0.6), acciaio)
    for i in range(6):
        m.blocco(f"lamella_pass_{i}", (-L / 2 + 0.19, -0.2, 2.48 + i * 0.09), (0.04, 0.96, 0.04), acciaio)
    m.blocco("cassetta", (-1.1, 2.4, 0.22), (0.6, 0.34, 0.44), m.materiale_tinta_piatta("cassetta", "lacquer_deep", 0.5))
    m.blocco("coperchio", (-1.1, 2.4, 0.46), (0.62, 0.36, 0.05), acciaio)
    m.blocco("straccio", (0.6, 0.4, 0.03), (0.34, 0.26, 0.05), m.materiale_tinta_piatta("straccio", "ivory_dim", 0.95), (0, 0, 0.6))

    cam = sguardo(m, P, 1.70, 28.0, 1.7)
    return cam, {
        "scaletta": (0.9, P / 2 - 1.6, 1.4),
        "ventilazione": (-L / 2 + 0.3, -0.2, 2.7),
        "porta": (L / 2 - 0.3, -1.8, 1.3),
        "cassetto": (-1.1, 2.4, 0.4),
        "consegna": (-1.1, 2.4, 0.55),
        "oggetto": (0.6, 0.4, 0.08),
    }


# ── 10. sala macchine ───────────────────────────────────────────────────────


def quadro(m):
    P = 6.4
    L, H = misure_inquadratura(P, lente=40.0, altezza_occhi=1.7)
    acciaio = m.materiale_acciaio()
    cemento = m.materiale_intonaco("cemento", tinta="ink", ruvidita=0.96)
    guscio(m, L, P, H, pavimento=cemento, pareti=cemento)

    # il quadro elettrico che dà il nome alla stanza
    m.blocco("armadio", (0, P / 2 - 0.5, 1.5), (5.0, 0.7, 2.6), acciaio)
    m.blocco("frontale", (0, P / 2 - 0.86, 1.5), (4.8, 0.05, 2.4), m.materiale_tinta_piatta("pannello", "ink", 0.5))

    quadrante = m.materiale_tinta_piatta("contatore", "ivory", 0.3)
    for riga in range(2):
        for i in range(6):
            x = -1.9 + i * 0.76
            z = 2.25 - riga * 0.62
            m.cilindro(f"contatore_{riga}_{i}", (x, P / 2 - 0.9, z), 0.16, 0.04, quadrante, (math.pi / 2, 0, 0), lati=20)
            m.cilindro(f"ghiera_{riga}_{i}", (x, P / 2 - 0.89, z), 0.18, 0.03, m.materiale_ottone(), (math.pi / 2, 0, 0), lati=20)

    leva_rossa = m.materiale_tinta_piatta("leva", "lacquer", 0.35)
    for i in range(7):
        x = -1.9 + i * 0.63
        m.blocco(f"base_leva_{i}", (x, P / 2 - 0.9, 0.85), (0.14, 0.06, 0.1), acciaio)
        alto = i % 3 != 1
        m.blocco(f"leva_{i}", (x, P / 2 - 0.98, 0.85 + (0.16 if alto else -0.04)), (0.05, 0.05, 0.3), leva_rossa,
                 (0.5 if alto else -0.5, 0, 0))

    # motori e tubi
    m.cilindro("motore", (-2.6, -1.2, 0.55), 0.55, 1.1, acciaio, lati=24)
    m.cilindro("volano", (-2.6, -1.9, 0.75), 0.42, 0.1, m.materiale_ottone(), (math.pi / 2, 0, 0), lati=32)
    m.cilindro("condotto", (2.4, 0, 2.9), 0.24, P, acciaio, (math.pi / 2, 0, 0), lati=16)

    # una lampada nuda: l'ombra lunga della direzione artistica
    m.sfera("lampadina", (-0.6, -1.6, 2.7), 0.08, m.materiale_emissivo("nuda", "brass_soft", 22.0))
    m.cilindro("filo", (-0.6, -1.6, 3.15), 0.008, 0.9, m.materiale_tinta_piatta("filo", "ink", 0.9))
    m.luce_punto("nuda", (-0.6, -1.6, 2.7), 62, "brass_soft", 0.06)
    m.luce_punto("spia", (1.8, P / 2 - 1.0, 1.6), 8, "lacquer")

    # orologio di servizio, armadietto con cassetti, porta di ferro, chiave inglese
    m.cilindro("orologio_quadro", (-2.4, P / 2 - 0.2, 2.6), 0.3, 0.08, acciaio, (math.pi / 2, 0, 0))
    m.cilindro("quadrante_quadro", (-2.4, P / 2 - 0.25, 2.6), 0.25, 0.02,
               m.materiale_tinta_piatta("quadrante_q", "ivory", 0.35), (math.pi / 2, 0, 0))
    def pt(fx, fy, d):
        return punto_schermo(fx, fy, d, P, 40.0, 1.70, 1.5)

    p_cassetto = pt(0.68, 0.2, 6.4)
    m.blocco("armadietto", (p_cassetto[0], p_cassetto[1], 0.7), (0.8, 0.6, 1.4), acciaio)
    for i in range(3):
        m.blocco(f"cassetto_q_{i}", (p_cassetto[0], p_cassetto[1] - 0.32, 0.25 + i * 0.42), (0.72, 0.05, 0.36), acciaio)
        m.blocco(f"maniglia_q_{i}", (p_cassetto[0], p_cassetto[1] - 0.36, 0.25 + i * 0.42), (0.24, 0.03, 0.03), m.materiale_ottone())

    p_porta = pt(-0.72, -0.02, 7.0)
    m.blocco("porta_ferro", (p_porta[0], p_porta[1], 1.1), (1.0, 0.14, 2.2), acciaio)
    m.blocco("maniglione_q", (p_porta[0] + 0.4, p_porta[1] - 0.1, 1.1), (0.08, 0.06, 0.5), m.materiale_ottone())

    p_consegna = pt(-0.5, 0.26, 6.6)
    m.blocco("cassa_utensili", (p_consegna[0], p_consegna[1], 0.24), (0.7, 0.45, 0.48),
             m.materiale_tinta_piatta("cassa_ut", "lacquer_deep", 0.5))
    m.blocco("coperchio_ut", (p_consegna[0], p_consegna[1], 0.5), (0.72, 0.47, 0.05), acciaio)

    p_oggetto = pt(0.1, 0.14, 7.2)
    m.blocco("chiave_inglese", (p_oggetto[0], p_oggetto[1], 0.03), (0.32, 0.06, 0.03), acciaio, (0, 0, 0.5))

    cam = sguardo(m, P, 1.70, 40.0, 1.5)
    return cam, {
        "quadro": (0, P / 2 - 0.95, 1.6),
        "orologio": (-2.4, P / 2 - 0.3, 2.6),
        "cassetto": (p_cassetto[0], p_cassetto[1] - 0.36, 0.7),
        "porta": (p_porta[0], p_porta[1], 1.4),
        "consegna": (p_consegna[0], p_consegna[1], 0.55),
        "oggetto": (p_oggetto[0], p_oggetto[1], 0.08),
    }


# ── 11. bar ─────────────────────────────────────────────────────────────────


def bar(m):
    P = 6.8
    L, H = misure_inquadratura(P, lente=38.0, altezza_occhi=1.7)
    ottone = m.materiale_ottone()
    legno = m.materiale_legno("noce", tinta="plum", scala=4.0)
    guscio(m, L, P, H,
           pavimento=m.materiale_scacchiera("pavimento_bar", "ink", "plum", 7.0),
           pareti=m.materiale_velluto("parete_bar", "lacquer_deep"))

    # bancone
    m.blocco("bancone", (0, 0.9, 0.58), (6.2, 0.9, 1.16), legno)
    m.blocco("piano", (0, 0.9, 1.19), (6.5, 1.1, 0.07), m.materiale_marmo("piano_bar", "ink", "marble", 3.0))
    m.blocco("poggiapiedi", (0, 0.3, 0.22), (6.2, 0.06, 0.06), ottone)

    # scaffale delle bottiglie, retroilluminato
    m.blocco("scaffale", (0, P / 2 - 0.3, 1.9), (5.6, 0.4, 2.4), legno)
    m.blocco("fondo_illuminato", (0, P / 2 - 0.48, 1.9), (5.2, 0.04, 2.2), m.materiale_emissivo("fondale", "brass_soft", 2.4))
    vetro = m.materiale_vetro()
    for r in range(3):
        for i in range(16):
            x = -2.4 + i * 0.32
            z = 1.1 + r * 0.72
            m.cilindro(f"bott_{r}_{i}", (x, P / 2 - 0.4, z + 0.16), 0.045, 0.32, vetro, lati=12)

    # sgabelli
    for i in range(5):
        x = -2.4 + i * 1.2
        m.cilindro(f"seduta_{i}", (x, 0.0, 0.74), 0.22, 0.09, m.materiale_velluto(f"sed{i}", "petrol"))
        m.cilindro(f"stelo_{i}", (x, 0.0, 0.37), 0.05, 0.74, ottone)
        m.cilindro(f"base_{i}", (x, 0.0, 0.03), 0.24, 0.05, ottone, lati=24)

    # bicchieri sul bancone
    for i, x in enumerate((-1.4, -1.1, 1.7)):
        m.cilindro(f"calice_{i}", (x, 0.7, 1.31), 0.05, 0.17, vetro, lati=14)

    m.luce_area("chiave", (0, P / 2 - 1.0, 3.1), 100, 4.0, "brass_soft")
    m.luce_area("bancone", (0, 0.9, 2.9), 75, 3.0, "brass")
    m.luce_area("riempimento", (0, -P / 2 - 0.4, 2.2), 25, 4.0, "rain", (math.pi / 2.4, 0, 0))
    def pt(fx, fy, d):
        return punto_schermo(fx, fy, d, P, 38.0, 1.70, 1.5)

    p_telefono = pt(-0.66, -0.06, 7.4)
    m.blocco("mensola_bar", (p_telefono[0], p_telefono[1], 1.2), (0.6, 0.34, 0.05), legno)
    m.blocco("telefono_bar", (p_telefono[0], p_telefono[1], 1.34), (0.3, 0.22, 0.14),
             m.materiale_tinta_piatta("bachelite_bar", "ink", 0.45))
    m.blocco("registro_bar", (2.0, 0.8, 1.24), (0.5, 0.36, 0.04),
             m.materiale_tinta_piatta("registro_bar", "ivory_dim", 0.9))

    p_tavolo = pt(-0.56, 0.3, 6.4)
    m.cilindro("tavolino_bar", (p_tavolo[0], p_tavolo[1], 0.7), 0.42, 0.06,
               m.materiale_marmo("tav_bar", "marble", "ink", 3.0))
    m.cilindro("piede_bar", (p_tavolo[0], p_tavolo[1], 0.35), 0.06, 0.7, ottone)
    p_oggetto = (p_tavolo[0] + 0.15, p_tavolo[1], 0.75)
    m.blocco("chiave_bar", p_oggetto, (0.11, 0.03, 0.02), ottone, (0, 0, 0.4))

    p_consegna = pt(0.6, 0.3, 6.4)
    m.blocco("vassoio_bar", (p_consegna[0], p_consegna[1], 0.76), (0.5, 0.36, 0.03), ottone)
    m.cilindro("piede_vass", (p_consegna[0], p_consegna[1], 0.38), 0.04, 0.76, ottone)

    cam = sguardo(m, P, 1.70, 38.0, 1.5)
    return cam, {
        "bancone": (0, 0.4, 1.24),
        "bicchieri": (-1.4, 0.7, 1.4),
        "telefono": (p_telefono[0], p_telefono[1], 1.42),
        "registro": (2.0, 0.8, 1.28),
        "tavolo": (p_tavolo[0], p_tavolo[1], 0.75),
        "consegna": (p_consegna[0], p_consegna[1], 0.82),
        "oggetto": (p_oggetto[0], p_oggetto[1], 0.79),
    }


# ── 12. palco ───────────────────────────────────────────────────────────────


def palco(m):
    P = 7.6
    L, H = misure_inquadratura(P, lente=32.0, altezza_occhi=1.72)
    ottone = m.materiale_ottone()
    guscio(m, L, P, H,
           pavimento=m.materiale_legno("assito_palco", tinta="plum", scala=16.0),
           pareti=m.materiale_intonaco(tinta="ink", ruvidita=0.9))

    # sipario aperto ai lati
    velluto = m.materiale_velluto("sipario", "lacquer_deep")
    for lato in (-1, 1):
        for i in range(6):
            x = lato * (L / 2 - 0.5 - i * 0.34)
            m.cilindro(f"piega_{lato}_{i}", (x, P / 2 - 1.4, 3.0), 0.32, 5.6, velluto, lati=10)
    m.blocco("mantovana", (0, P / 2 - 1.4, 5.4), (L, 0.5, 1.2), velluto)

    # fondale
    m.blocco("fondale", (0, P / 2 - 0.3, 2.8), (8.0, 0.08, 5.0), m.materiale_velluto("fondale", "petrol"))

    # microfono al centro
    m.cilindro("asta_mic", (0, -0.4, 0.75), 0.025, 1.5, ottone)
    m.cilindro("base_mic", (0, -0.4, 0.03), 0.22, 0.06, ottone, lati=24)
    m.sfera("capsula", (0, -0.4, 1.56), 0.07, m.materiale_acciaio())

    # leggii e sgabello dell'orchestra
    for i, x in enumerate((-2.6, -1.6, 2.0, 3.0)):
        m.cilindro(f"leggio_{i}", (x, 1.0, 0.6), 0.02, 1.2, ottone)
        m.blocco(f"piano_leggio_{i}", (x, 1.05, 1.2), (0.42, 0.3, 0.02), m.materiale_tinta_piatta(f"sp{i}", "ivory", 0.85), (0.7, 0, 0))

    # occhi di bue
    for x in (-2.4, 2.4):
        m.cilindro(f"faro{x}", (x, -P / 2 + 0.6, 5.2), 0.2, 0.4, m.materiale_acciaio(), (1.1, 0, 0), lati=20)
    m.luce_area("occhio_sx", (-2.4, -P / 2 + 0.8, 5.0), 219, 0.5, "ivory", (0.95, 0, 0))
    m.luce_area("occhio_dx", (2.4, -P / 2 + 0.8, 5.0), 131, 0.5, "brass_soft", (0.95, 0, 0))
    m.luce_area("ribalta", (0, -1.6, 0.12), 50, 6.0, "brass_soft")
    def pt(fx, fy, d):
        return punto_schermo(fx, fy, d, P, 32.0, 1.72, 2.0)

    p_porta = pt(-0.78, 0.0, 7.6)
    m.blocco("porta_scena", (p_porta[0], p_porta[1], 1.2), (1.0, 0.16, 2.4),
             m.materiale_legno("porta_palco", tinta="plum", scala=6.0))

    p_tavolo = pt(0.62, 0.34, 6.4)
    m.blocco("tavolino_quinta", (p_tavolo[0], p_tavolo[1], 0.72), (0.9, 0.6, 0.06),
             m.materiale_legno("tav_quinta", tinta="plum", scala=8.0))
    for sx in (-0.38, 0.38):
        m.cilindro(f"gamba_q{sx}", (p_tavolo[0] + sx, p_tavolo[1], 0.36), 0.04, 0.72, ottone)
    p_bicchieri = (p_tavolo[0] - 0.1, p_tavolo[1] + 0.05, 0.86)
    m.cilindro("caraffa", p_bicchieri, 0.08, 0.22, m.materiale_vetro(), lati=16)

    p_consegna = pt(-0.34, 0.36, 6.0)
    m.blocco("cassa_scena", (p_consegna[0], p_consegna[1], 0.26), (0.8, 0.5, 0.52),
             m.materiale_legno("cassa_scena", tinta="plum", scala=14.0))

    p_oggetto = pt(0.1, 0.12, 7.4)
    m.blocco("guanto_palco", (p_oggetto[0], p_oggetto[1], 0.03), (0.2, 0.09, 0.03),
             m.materiale_tinta_piatta("guanto_palco", "ivory", 0.85), (0, 0, 0.4))

    cam = sguardo(m, P, 1.72, 32.0, 2.0)
    return cam, {
        "spartiti": (-1.6, 1.05, 1.2),
        "bicchieri": p_bicchieri,
        "porta": (p_porta[0], p_porta[1], 1.4),
        "tavolo": (p_tavolo[0], p_tavolo[1], 0.76),
        "consegna": (p_consegna[0], p_consegna[1], 0.56),
        "oggetto": (p_oggetto[0], p_oggetto[1], 0.08),
    }


# ── 13. sala di registrazione ───────────────────────────────────────────────


def registrazione(m):
    P = 6.6
    L, H = misure_inquadratura(P, lente=42.0, altezza_occhi=1.68)
    acciaio = m.materiale_acciaio()
    legno = m.materiale_legno("compensato", tinta="plum", scala=7.0)
    guscio(m, L, P, H,
           pavimento=m.materiale_velluto("moquette_studio", "ink"),
           pareti=m.materiale_intonaco(tinta="plum", ruvidita=0.9))

    # pannelli fonoassorbenti a rilievo
    for i in range(9):
        for j in range(4):
            x = -3.6 + i * 0.9
            z = 1.2 + j * 0.62
            sporgenza = 0.06 + ((i + j) % 3) * 0.04
            m.blocco(f"pannello_{i}_{j}", (x, P / 2 - 0.14 - sporgenza / 2, z), (0.82, sporgenza, 0.56),
                     m.materiale_velluto(f"pan{i}{j}", "petrol" if (i + j) % 2 else "plum"))

    # banco di regia
    m.blocco("banco", (0, -0.4, 0.72), (3.6, 1.1, 0.1), legno)
    m.blocco("frontale_banco", (0, -0.92, 0.36), (3.6, 0.06, 0.72), legno)
    m.blocco("mixer", (0, -0.3, 0.82), (2.6, 0.7, 0.1), m.materiale_tinta_piatta("mixer", "ink", 0.5), (0.18, 0, 0))
    for r in range(3):
        for i in range(14):
            m.cilindro(f"manopola_{r}_{i}", (-1.15 + i * 0.18, -0.5 + r * 0.2, 0.9 + r * 0.035), 0.026, 0.03,
                       m.materiale_ottone(), lati=10)
    for i in range(10):
        m.blocco(f"cursore_{i}", (-0.9 + i * 0.2, -0.05, 0.9), (0.03, 0.14, 0.02),
                 m.materiale_tinta_piatta(f"cur{i}", "ivory_dim", 0.5))

    # registratore a bobine
    m.blocco("registratore", (2.5, 1.0, 0.9), (1.2, 0.6, 0.16), acciaio, (0.25, 0, 0))
    for i, x in enumerate((2.15, 2.85)):
        m.cilindro(f"bobina_{i}", (x, 0.95, 1.04), 0.24, 0.04, m.materiale_tinta_piatta(f"bob{i}", "ivory_dim", 0.6),
                   (math.pi / 2 - 0.25, 0, 0), lati=28)
        m.cilindro(f"mozzo_{i}", (x, 0.94, 1.05), 0.06, 0.06, m.materiale_ottone(), (math.pi / 2 - 0.25, 0, 0), lati=16)
    m.blocco("tavolo_reg", (2.5, 1.0, 0.4), (1.4, 0.7, 0.8), legno)

    # vetro verso la sala d'incisione
    m.blocco("telaio_vetro", (-2.6, P / 2 - 0.2, 1.9), (2.4, 0.1, 1.5), acciaio)
    m.blocco("vetro_regia", (-2.6, P / 2 - 0.26, 1.9), (2.2, 0.03, 1.35), m.materiale_vetro())
    m.blocco("luce_dietro", (-2.6, P / 2 + 0.6, 1.9), (2.2, 0.06, 1.35), m.materiale_emissivo("oltre", "petrol_lit", 2.0))

    # la spia rossa «in onda»
    m.blocco("spia", (0, P / 2 - 0.2, 2.9), (0.5, 0.08, 0.18), m.materiale_emissivo("in_onda", "lacquer", 9.0))

    m.luce_area("chiave", (0, -0.6, 2.9), 81, 2.2, "brass_soft")
    m.luce_punto("registratore", (2.5, 0.6, 2.4), 28, "ivory")
    m.luce_punto("in_onda", (0, P / 2 - 0.6, 2.9), 12, "lacquer")
    def pt(fx, fy, d):
        return punto_schermo(fx, fy, d, P, 42.0, 1.68, 1.5)

    p_telefono = pt(-0.34, 0.16, 6.8)
    m.blocco("telefono_reg", (p_telefono[0], p_telefono[1], 0.86), (0.28, 0.2, 0.13),
             m.materiale_tinta_piatta("bachelite_reg", "ink", 0.45))

    p_cassetto = pt(0.7, 0.28, 6.4)
    m.blocco("cassettiera_reg", (p_cassetto[0], p_cassetto[1], 0.45), (0.8, 0.6, 0.9), legno)
    for i in range(3):
        m.blocco(f"cassetto_reg_{i}", (p_cassetto[0], p_cassetto[1] - 0.32, 0.16 + i * 0.29), (0.72, 0.05, 0.25), legno)
        m.blocco(f"maniglia_reg_{i}", (p_cassetto[0], p_cassetto[1] - 0.36, 0.16 + i * 0.29), (0.24, 0.03, 0.03), m.materiale_ottone())

    p_spartiti = pt(-0.68, 0.06, 6.8)
    m.cilindro("leggio_reg", (p_spartiti[0], p_spartiti[1], p_spartiti[2] - 0.6), 0.02, 1.2, m.materiale_ottone())
    m.blocco("spartito_reg", p_spartiti, (0.42, 0.3, 0.02),
             m.materiale_tinta_piatta("carta_reg", "ivory", 0.85), (0.7, 0, 0))

    p_oggetto = pt(0.14, 0.1, 7.2)
    m.cilindro("nastro_perso", (p_oggetto[0], p_oggetto[1], 0.03), 0.16, 0.03,
               m.materiale_tinta_piatta("nastro_perso", "ivory_dim", 0.6), lati=24)

    p_consegna = pt(0.44, -0.02, 7.4)
    m.blocco("vassoio_reg", (p_consegna[0], p_consegna[1], 0.98), (0.5, 0.36, 0.03), m.materiale_ottone())
    m.cilindro("piede_reg", (p_consegna[0], p_consegna[1], 0.49), 0.04, 0.98, m.materiale_ottone())

    cam = sguardo(m, P, 1.68, 42.0, 1.5)
    return cam, {
        "bobina": (2.15, 0.95, 1.04),
        "finestra": (-2.6, P / 2 - 0.3, 1.9),
        "telefono": (p_telefono[0], p_telefono[1], 0.93),
        "cassetto": (p_cassetto[0], p_cassetto[1] - 0.36, 0.55),
        "spartiti": p_spartiti,
        "consegna": (p_consegna[0], p_consegna[1], 1.02),
        "oggetto": (p_oggetto[0], p_oggetto[1], 0.06),
    }


# ── 14. facciata ────────────────────────────────────────────────────────────


def facciata(m):
    """L'unico esterno: notte, pioggia, e l'albergo che aspetta."""
    scena = m.bpy.context.scene
    m.cielo(scena, "night", 0.25)
    ottone = m.materiale_ottone()
    marmo = m.materiale_marmo("facciata", "marble", "ink", 1.2)

    # strada bagnata: quasi uno specchio
    m.piano("strada", (0, 0, 0), (60, 40), m.materiale_tinta_piatta("asfalto_bagnato", "ink", 0.09))
    m.blocco("marciapiede", (0, 6.0, 0.09), (34, 5.0, 0.18), m.materiale_marmo("lastre", "marble", "ink", 3.0))

    # corpo dell'albergo
    m.blocco("corpo", (0, 12.0, 9.0), (26.0, 9.0, 18.0), marmo)
    m.blocco("basamento", (0, 7.4, 1.6), (26.0, 0.6, 3.2), m.materiale_marmo("basamento", "marble", "plum", 2.0))

    # finestre illuminate, a scacchiera irregolare
    caldo = m.materiale_emissivo("finestra_accesa", "brass_soft", 2.6)
    spento = m.materiale_tinta_piatta("finestra_spenta", "ink", 0.2)
    for piano_n in range(5):
        for i in range(11):
            x = -10.5 + i * 2.1
            z = 4.6 + piano_n * 2.7
            accesa = (i * 7 + piano_n * 3) % 5 < 3
            m.blocco(f"fin_{piano_n}_{i}", (x, 7.42, z), (1.1, 0.08, 1.7), caldo if accesa else spento)
            m.blocco(f"cornice_{piano_n}_{i}", (x, 7.46, z), (1.3, 0.06, 1.9), ottone)

    # pensilina e porta girevole
    m.blocco("pensilina", (0, 5.4, 4.0), (9.0, 4.6, 0.24), m.materiale_velluto("tenda", "petrol"))
    for sx in (-4.0, 4.0):
        m.cilindro(f"palo_pens{sx}", (sx, 3.3, 2.0), 0.09, 4.0, ottone)
    m.cilindro("tamburo", (0, 7.2, 1.6), 1.7, 3.2, m.materiale_vetro(), lati=32)
    for i in range(4):
        a = i * math.pi / 2 + 0.4
        m.blocco(f"anta_{i}", (math.cos(a) * 0.85, 7.2 + math.sin(a) * 0.85, 1.6), (1.7, 0.06, 3.1), ottone, (0, 0, a))
    m.cilindro("cerchio_alto", (0, 7.2, 3.24), 1.75, 0.1, ottone, lati=40)

    # insegna al neon
    m.blocco("insegna_fondo", (0, 7.3, 13.6), (11.0, 0.3, 1.9), m.materiale_tinta_piatta("insegna", "ink", 0.6))
    m.blocco("insegna", (0, 7.12, 13.6), (10.2, 0.12, 1.2), m.materiale_emissivo("neon", "brass_soft", 16.0))
    m.blocco("cornice_insegna", (0, 7.08, 13.6), (10.7, 0.06, 1.55), ottone)

    # un ombrello rovesciato sull'asfalto: l'oggetto fuori posto
    p_ombrello = punto_schermo(0.2, -0.06, 19.6, 0.0, 34.0, da=(0, -13.5, 4.3), verso=(0, 7.0, 5.4))
    m.blocco("ombrello", (p_ombrello[0], p_ombrello[1], 0.06), (0.9, 0.34, 0.12),
             m.materiale_tinta_piatta("ombrello_fac", "ink", 0.5), (0, 0, 0.7))
    m.cilindro("manico_ombrello", (p_ombrello[0] + 0.6, p_ombrello[1], 0.06), 0.025, 0.5,
               m.materiale_legno("manico", tinta="plum", scala=20.0), (0, math.pi / 2, 0))

    # palme piegate dal vento
    for i, x in enumerate((-12.5, 12.5, -15.5)):
        m.cilindro(f"tronco_{i}", (x, 4.0, 2.6), 0.22, 5.2, m.materiale_legno(f"tronco{i}", tinta="plum", scala=20.0),
                   (0.16, 0, 0))
        for f in range(7):
            a = (f / 7) * math.tau
            m.cilindro(f"palma_{i}_{f}", (x + math.cos(a) * 1.1, 4.0 + math.sin(a) * 1.1 + 0.9, 5.4),
                       0.07, 2.4, m.materiale_tinta_piatta(f"fronda{i}{f}", "petrol", 0.85),
                       (math.cos(a) * 1.1 + 0.3, math.sin(a) * 1.1, 0))

    # un'automobile ferma sotto la pioggia
    m.blocco("auto", (7.0, 2.2, 0.72), (4.4, 1.8, 0.9), m.materiale_tinta_piatta("carrozzeria", "lacquer_deep", 0.12, 0.6))
    m.blocco("abitacolo", (7.2, 2.2, 1.42), (2.4, 1.7, 0.62), m.materiale_vetro())
    for wx, wy in ((5.4, 1.4), (5.4, 3.0), (8.6, 1.4), (8.6, 3.0)):
        m.cilindro(f"ruota_{wx}_{wy}", (wx, wy, 0.34), 0.34, 0.22, m.materiale_tinta_piatta(f"gom{wx}{wy}", "ink", 0.8),
                   (0, math.pi / 2, 0), lati=20)

    # luci: l'insegna domina, la pensilina raccoglie, il faro pulsa in fondo
    m.luce_area("insegna", (0, 6.4, 13.6), 812, 8.0, "brass_soft", (math.pi / 2, 0, 0))
    m.luce_area("pensilina", (0, 5.4, 3.7), 281, 5.0, "brass", (math.pi, 0, 0))
    m.luce_area("cielo", (0, -12.0, 22.0), 219, 40.0, "rain", (math.pi / 3.2, 0, 0))
    m.luce_punto("faro_lontano", (-26.0, 34.0, 12.0), 938, "rain", 2.0)

    # la facciata ha la sua camera: il punto di vista è in mezzo alla strada,
    # più basso e più lontano di quello degli interni
    DA, VERSO = (0, -13.5, 4.3), (0, 7.0, 5.4)

    def pt(fx, fy, d):
        return punto_schermo(fx, fy, d, 0.0, 34.0, da=DA, verso=VERSO)

    # cabina telefonica, bagagli sotto la pensilina, carrello del facchino
    p_telefono = pt(-0.62, 0.26, 17.5)
    m.blocco("cabina", (p_telefono[0], p_telefono[1], 1.3), (1.1, 1.1, 2.6),
             m.materiale_tinta_piatta("cabina", "lacquer_deep", 0.35))
    m.blocco("vetro_cabina", (p_telefono[0], p_telefono[1] - 0.54, 1.5), (0.9, 0.06, 1.6), m.materiale_vetro())
    m.blocco("tetto_cabina", (p_telefono[0], p_telefono[1], 2.68), (1.3, 1.3, 0.16), ottone)
    m.sfera("luce_cabina", (p_telefono[0], p_telefono[1], 2.4), 0.1, m.materiale_emissivo("luce_cab", "ivory", 8.0))

    valigia_mat = m.materiale_legno("cuoio_fac", tinta="lacquer_deep", scala=8.0)
    p_valigia = pt(0.44, 0.3, 17.0)
    m.blocco("baule_fac", (p_valigia[0], p_valigia[1], 0.5), (1.1, 0.6, 0.7), valigia_mat)
    m.blocco("valigia_fac", (p_valigia[0] + 0.9, p_valigia[1] - 0.1, 0.3), (0.8, 0.4, 0.5), valigia_mat)

    p_consegna = pt(-0.26, 0.22, 17.5)
    m.blocco("carrello_fac", (p_consegna[0], p_consegna[1], 0.4), (1.4, 0.8, 0.1), ottone)
    m.cilindro("montante_fac", (p_consegna[0] + 0.6, p_consegna[1], 1.1), 0.04, 1.4, ottone)

    cam = m.camera(scena, DA, VERSO, 34.0)
    return cam, {
        "porta": (0, 5.6, 1.8),
        "finestra": (-6.3, 7.42, 7.3),
        "valigia": (p_valigia[0], p_valigia[1], 0.9),
        "telefono": (p_telefono[0], p_telefono[1] - 0.6, 1.6),
        "consegna": (p_consegna[0], p_consegna[1], 0.6),
        "oggetto": (p_ombrello[0], p_ombrello[1], 0.1),
    }


# ── registro ────────────────────────────────────────────────────────────────

AMBIENTI = {
    "hall": hall,
    "sala-ballo": sala_ballo,
    "suite": suite,
    "terrazza": terrazza,
    "piscina": piscina,
    "cucina": cucina,
    "corridoio": corridoio,
    "camerino": camerino,
    "passaggio": passaggio,
    "quadro": quadro,
    "bar": bar,
    "palco": palco,
    "registrazione": registrazione,
    "facciata": facciata,
}

# distanza minima e massima dalla camera, per la divisione in livelli
PROFONDITA = {
    "hall": (1.5, 11.0),
    "sala-ballo": (1.5, 12.0),
    "suite": (1.5, 10.0),
    "terrazza": (1.5, 45.0),
    "piscina": (1.5, 12.0),
    "cucina": (1.5, 10.5),
    "corridoio": (1.5, 19.0),
    "camerino": (1.5, 9.0),
    "passaggio": (1.5, 15.0),
    "quadro": (1.5, 9.5),
    "bar": (1.5, 9.5),
    "palco": (1.5, 11.0),
    "registrazione": (1.5, 9.5),
    "facciata": (6.0, 60.0),
}
