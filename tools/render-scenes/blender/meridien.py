"""
Libreria di costruzione degli ambienti del Méridien per Blender.

Le stanze non si modellano a mano: si descrivono. Ogni ambiente è un dizionario
di parametri — dimensioni, materiali, arredi, luci — e questa libreria lo
traduce in geometria, materiali procedurali e illuminazione Cycles.

Perché così: quattordici ambienti modellati a mano sarebbero quattordici file
binari impossibili da rivedere in una diff e da modificare senza riaprire un
editor grafico. Descritti, sono quattordici pagine di dati, versionabili come il
resto del progetto, e un cambio di palette si propaga a tutti in un render.

Materiali **procedurali**, nessuna texture fotografica: il progetto dichiara che
ogni asset nasce nel repository, e questo mantiene la promessa. Cycles con luci
vere ottiene da rumore e voronoi un marmo più convincente di molte fotografie.

Unità: metri. Il pavimento è a z=0.
"""

import math
import bpy
from mathutils import Vector

# ── palette, la stessa di ART_DIRECTION.md ──────────────────────────────────

def srgb(hex_str, alpha=1.0):
    """Converte un colore esadecimale sRGB nello spazio lineare di Blender."""
    h = hex_str.lstrip("#")
    canale = [int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4)]
    lineare = []
    for c in canale:
        lineare.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return (lineare[0], lineare[1], lineare[2], alpha)


PALETTE = {
    "ink": "#0B1220",
    "night": "#111C2E",
    "petrol": "#14413F",
    "petrol_lit": "#1E5E58",
    "lacquer": "#B5261E",
    "lacquer_deep": "#7E1712",
    "brass": "#C9A227",
    "brass_soft": "#E0C365",
    "ivory": "#F2E9D8",
    "ivory_dim": "#CDC2AE",
    "rain": "#5C7FA3",
    "marble": "#DCD6C8",
    "plum": "#3A2440",
}


# ── utilità di scena ────────────────────────────────────────────────────────

def scena_vuota():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


def _nuovo_materiale(nome):
    mat = bpy.data.materials.new(nome)
    mat.use_nodes = True
    nodi = mat.node_tree.nodes
    collegamenti = mat.node_tree.links
    nodi.clear()
    uscita = nodi.new("ShaderNodeOutputMaterial")
    uscita.location = (600, 0)
    principale = nodi.new("ShaderNodeBsdfPrincipled")
    principale.location = (300, 0)
    collegamenti.new(principale.outputs["BSDF"], uscita.inputs["Surface"])
    return mat, nodi, collegamenti, principale


def imperfezione(nodi, link, bsdf, forza=0.28, scala=9.0):
    """
    Nessuna superficie è uniforme.

    Una ruvidità costante è la firma inconfondibile del 3D fatto in fretta: il
    riflesso resta identico su tutta la faccia, e il cervello lo legge come
    plastica. Basta increspare la ruvidità con un rumore a bassa frequenza —
    polvere, impronte, l'usura di sessant'anni di ospiti — perché il riflesso
    respiri e la superficie diventi materia.

    Modula la ruvidità **esistente** invece di sostituirla: il marmo resta
    lucido, il velluto resta opaco, entrambi smettono di essere perfetti.
    """
    base = bsdf.inputs["Roughness"].default_value

    rumore = nodi.new("ShaderNodeTexNoise")
    rumore.location = (-520, -420)
    rumore.inputs["Scale"].default_value = scala
    rumore.inputs["Detail"].default_value = 6.0
    rumore.inputs["Roughness"].default_value = 0.55

    intervallo = nodi.new("ShaderNodeMapRange")
    intervallo.location = (-280, -420)
    intervallo.inputs["From Min"].default_value = 0.25
    intervallo.inputs["From Max"].default_value = 0.75
    intervallo.inputs["To Min"].default_value = max(0.02, base * (1.0 - forza))
    intervallo.inputs["To Max"].default_value = min(1.0, base * (1.0 + forza) + 0.04)
    intervallo.clamp = True

    link.new(rumore.outputs["Fac"], intervallo.inputs["Value"])
    link.new(intervallo.outputs["Result"], bsdf.inputs["Roughness"])


def imperfezione_ovunque(forza=0.26):
    """
    Applica l'imperfezione a ogni materiale che non abbia già una ruvidità
    pilotata da una texture.

    Si fa in un passaggio unico a scena costruita, invece che dentro ognuna
    delle dieci funzioni di materiale: così vale anche per i materiali aggiunti
    domani, e nessuno se ne dimentica.
    """
    toccati = 0
    for mat in bpy.data.materials:
        if not mat.use_nodes:
            continue
        nodi = mat.node_tree.nodes
        link = mat.node_tree.links
        bsdf = next((n for n in nodi if n.type == "BSDF_PRINCIPLED"), None)
        if bsdf is None:
            continue
        if bsdf.inputs["Roughness"].is_linked:
            continue
        imperfezione(nodi, link, bsdf, forza=forza)
        toccati += 1
    return toccati


def _coordinate(nodi, scala=1.0):
    """
    Coordinate nello **spazio del mondo**, non normalizzate all'oggetto.

    Le coordinate d'oggetto vanno da -1 a 1 sui limiti della mesh, qualunque sia
    la mesh: un palazzo di ventisei metri e un fermacarte ricevono la stessa
    densità di pattern. Il risultato si vedeva — la facciata dell'albergo usciva
    coperta di macchie da lontano, come una pelliccia di dalmata, mentre la
    stessa pietra su una colonna sembrava marmo.

    Con la posizione nel mondo la scala ha un significato fisico: `scala` è il
    numero di ripetizioni **per metro**, ed è la stessa su ogni superficie del
    Méridien. Un pavimento a scacchi da quaranta centimetri si scrive 2.5, e
    resta di quaranta centimetri sia nella hall sia in cucina.
    """
    coord = nodi.new("ShaderNodeNewGeometry")
    coord.location = (-900, 0)
    mappa = nodi.new("ShaderNodeMapping")
    mappa.location = (-700, 0)
    mappa.inputs["Scale"].default_value = (scala, scala, scala)
    return coord, mappa


# ── materiali procedurali ───────────────────────────────────────────────────

def materiale_marmo(nome="marmo", base="marble", vena="ink", scala=0.55):
    """Marmo: rumore stirato in una direzione produce venature credibili."""
    mat, nodi, link, bsdf = _nuovo_materiale(nome)
    coord, mappa = _coordinate(nodi, scala)
    link.new(coord.outputs["Position"], mappa.inputs["Vector"])
    mappa.inputs["Scale"].default_value = (scala, scala * 0.2, scala * 1.15)

    rumore = nodi.new("ShaderNodeTexNoise")
    rumore.location = (-500, 0)
    rumore.inputs["Scale"].default_value = 3.2
    rumore.inputs["Detail"].default_value = 8.0
    rumore.inputs["Roughness"].default_value = 0.62
    link.new(mappa.outputs["Vector"], rumore.inputs["Vector"])

    rampa = nodi.new("ShaderNodeValToRGB")
    rampa.location = (-260, 0)
    rampa.color_ramp.elements[0].position = 0.42
    rampa.color_ramp.elements[0].color = srgb(PALETTE[base])
    rampa.color_ramp.elements[1].position = 0.62
    rampa.color_ramp.elements[1].color = srgb(PALETTE[vena])
    link.new(rumore.outputs["Fac"], rampa.inputs["Fac"])
    link.new(rampa.outputs["Color"], bsdf.inputs["Base Color"])

    bsdf.inputs["Roughness"].default_value = 0.16
    bsdf.inputs["Specular IOR Level"].default_value = 0.6
    return mat


def materiale_scacchiera(nome="scacchi", chiaro="marble", scuro="ink", scala=2.6):
    mat, nodi, link, bsdf = _nuovo_materiale(nome)
    coord, mappa = _coordinate(nodi, scala)
    link.new(coord.outputs["Position"], mappa.inputs["Vector"])

    dama = nodi.new("ShaderNodeTexChecker")
    dama.location = (-460, 0)
    dama.inputs["Color1"].default_value = srgb(PALETTE[chiaro])
    dama.inputs["Color2"].default_value = srgb(PALETTE[scuro])
    dama.inputs["Scale"].default_value = 1.0
    link.new(mappa.outputs["Vector"], dama.inputs["Vector"])
    link.new(dama.outputs["Color"], bsdf.inputs["Base Color"])

    # il marmo lucido riflette: è ciò che fa brillare il pavimento della hall
    bsdf.inputs["Roughness"].default_value = 0.12
    return mat


def materiale_legno(nome="legno", tinta="plum", scala=1.6):
    mat, nodi, link, bsdf = _nuovo_materiale(nome)
    coord, mappa = _coordinate(nodi, scala)
    link.new(coord.outputs["Position"], mappa.inputs["Vector"])

    onde = nodi.new("ShaderNodeTexWave")
    onde.location = (-500, 0)
    onde.wave_type = "BANDS"
    # bande larghe, molto distorte: è così che si legge una fibra, non una
    # lamiera. Bande fitte e regolari davano un'ondulazione da capannone.
    onde.inputs["Scale"].default_value = 0.6
    onde.inputs["Distortion"].default_value = 14.0
    onde.inputs["Detail"].default_value = 6.0
    onde.inputs["Detail Scale"].default_value = 2.2
    link.new(mappa.outputs["Vector"], onde.inputs["Vector"])

    rampa = nodi.new("ShaderNodeValToRGB")
    rampa.location = (-260, 0)
    rampa.color_ramp.elements[0].color = srgb(PALETTE[tinta])
    rampa.color_ramp.elements[1].color = srgb("#3A2620")
    link.new(onde.outputs["Fac"], rampa.inputs["Fac"])
    link.new(rampa.outputs["Color"], bsdf.inputs["Base Color"])

    bsdf.inputs["Roughness"].default_value = 0.34
    return mat


def materiale_ottone(nome="ottone", tinta="brass"):
    mat, nodi, link, bsdf = _nuovo_materiale(nome)
    bsdf.inputs["Base Color"].default_value = srgb(PALETTE[tinta])
    bsdf.inputs["Metallic"].default_value = 1.0
    bsdf.inputs["Roughness"].default_value = 0.26
    return mat


def materiale_velluto(nome="velluto", tinta="petrol"):
    """Velluto: il colore si accende sui bordi, dove la peluria prende luce."""
    mat, nodi, link, bsdf = _nuovo_materiale(nome)
    bsdf.inputs["Base Color"].default_value = srgb(PALETTE[tinta])
    bsdf.inputs["Roughness"].default_value = 0.92
    if "Sheen Weight" in bsdf.inputs:
        bsdf.inputs["Sheen Weight"].default_value = 0.65
        bsdf.inputs["Sheen Roughness"].default_value = 0.4
        bsdf.inputs["Sheen Tint"].default_value = srgb(PALETTE["ivory_dim"])
    return mat


def materiale_intonaco(nome="intonaco", tinta="night", ruvidita=0.86):
    mat, nodi, link, bsdf = _nuovo_materiale(nome)
    coord, mappa = _coordinate(nodi, 1.4)
    link.new(coord.outputs["Position"], mappa.inputs["Vector"])

    rumore = nodi.new("ShaderNodeTexNoise")
    rumore.location = (-460, -200)
    rumore.inputs["Scale"].default_value = 60.0
    rumore.inputs["Detail"].default_value = 2.0
    link.new(mappa.outputs["Vector"], rumore.inputs["Vector"])

    urto = nodi.new("ShaderNodeBump")
    urto.location = (-120, -220)
    urto.inputs["Strength"].default_value = 0.08
    link.new(rumore.outputs["Fac"], urto.inputs["Height"])
    link.new(urto.outputs["Normal"], bsdf.inputs["Normal"])

    bsdf.inputs["Base Color"].default_value = srgb(PALETTE[tinta])
    bsdf.inputs["Roughness"].default_value = ruvidita
    return mat


def materiale_piastrelle(nome="piastrelle", tinta="petrol", fuga="marble", scala=5.0):
    mat, nodi, link, bsdf = _nuovo_materiale(nome)
    coord, mappa = _coordinate(nodi, scala)
    link.new(coord.outputs["Position"], mappa.inputs["Vector"])

    mattoni = nodi.new("ShaderNodeTexBrick")
    mattoni.location = (-460, 0)
    mattoni.inputs["Color1"].default_value = srgb(PALETTE[tinta])
    mattoni.inputs["Color2"].default_value = srgb(PALETTE[tinta])
    mattoni.inputs["Mortar"].default_value = srgb(PALETTE[fuga])
    mattoni.inputs["Scale"].default_value = 1.0
    mattoni.inputs["Mortar Size"].default_value = 0.015
    mattoni.offset = 0.0
    mattoni.squash = 1.0
    link.new(mappa.outputs["Vector"], mattoni.inputs["Vector"])
    link.new(mattoni.outputs["Color"], bsdf.inputs["Base Color"])

    bsdf.inputs["Roughness"].default_value = 0.2
    return mat


def materiale_acciaio(nome="acciaio"):
    mat, nodi, link, bsdf = _nuovo_materiale(nome)
    bsdf.inputs["Base Color"].default_value = srgb("#9AA3AA")
    bsdf.inputs["Metallic"].default_value = 1.0
    bsdf.inputs["Roughness"].default_value = 0.38
    return mat


def materiale_vetro(nome="vetro"):
    mat, nodi, link, bsdf = _nuovo_materiale(nome)
    bsdf.inputs["Base Color"].default_value = srgb(PALETTE["rain"])
    bsdf.inputs["Transmission Weight"].default_value = 1.0
    bsdf.inputs["Roughness"].default_value = 0.08
    bsdf.inputs["IOR"].default_value = 1.45
    return mat


def materiale_emissivo(nome="luce", tinta="brass_soft", forza=6.0):
    mat = bpy.data.materials.new(nome)
    mat.use_nodes = True
    nodi = mat.node_tree.nodes
    link = mat.node_tree.links
    nodi.clear()
    uscita = nodi.new("ShaderNodeOutputMaterial")
    emiss = nodi.new("ShaderNodeEmission")
    emiss.inputs["Color"].default_value = srgb(PALETTE[tinta])
    emiss.inputs["Strength"].default_value = forza
    link.new(emiss.outputs["Emission"], uscita.inputs["Surface"])
    return mat


def materiale_tinta_piatta(nome, tinta, ruvidita=0.6, metallo=0.0):
    mat, nodi, link, bsdf = _nuovo_materiale(nome)
    colore = srgb(PALETTE[tinta]) if tinta in PALETTE else srgb(tinta)
    bsdf.inputs["Base Color"].default_value = colore
    bsdf.inputs["Roughness"].default_value = ruvidita
    bsdf.inputs["Metallic"].default_value = metallo
    return mat


# ── geometria ───────────────────────────────────────────────────────────────

def smussa(ob, larghezza=0.012, segmenti=2):
    """
    Lo smusso: il singolo dettaglio che distingue un oggetto da una scatola.

    Nessuno spigolo del mondo reale è perfetto. Un bordo vivo non riflette
    nulla, resta una linea nera e legge come «primitiva 3D»; uno smusso anche
    di un centimetro raccoglie una scia di luce, e quella scia è ciò che il
    nostro occhio usa per dire «è un mobile». È il rapporto qualità/costo più
    alto di tutta la pipeline: due segmenti, un millimetro di modificatore, e
    quattordici stanze smettono di sembrare fatte di cartone.

    `harden_normals` evita che lo smusso sporchi l'ombreggiatura delle facce
    piatte, che è il difetto tipico di chi lo applica alla cieca.
    """
    mod = ob.modifiers.new(name="smusso", type="BEVEL")
    mod.width = larghezza
    mod.segments = segmenti
    mod.limit_method = "ANGLE"
    mod.angle_limit = math.radians(40)
    # `harden_normals` richiede l'ombreggiatura morbida: da Blender 4.1 non
    # esiste più `use_auto_smooth`, si passa dallo shade_smooth per angolo
    try:
        mod.harden_normals = True
        bpy.ops.object.shade_auto_smooth(angle=math.radians(35))
    except (AttributeError, RuntimeError):
        mod.harden_normals = False
    return ob


def blocco(nome, posizione, dimensioni, materiale=None, rotazione=(0, 0, 0), smusso=True):
    """Un parallelepipedo. È il mattone di tutto: mobili, cornici, gradini."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=posizione, rotation=rotazione)
    ob = bpy.context.object
    ob.name = nome
    # `primitive_cube_add(size=1)` produce un cubo di **lato** uno, con i
    # vertici a ±0.5: la scala è già la dimensione finale. Dividere per due —
    # come si fa quando si parte da un cubo di lato due — dimezzava ogni
    # volume. Le pareti uscivano larghe metà del pavimento e alte metà della
    # stanza, ed è da lì che venivano i vuoti neri agli angoli
    # dell'inquadratura, che per settimane sono stati corretti spostando la
    # camera invece di sistemare la geometria.
    ob.scale = dimensioni
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if materiale:
        ob.data.materials.append(materiale)
    if smusso:
        piu_corto = min(dimensioni)
        smussa(ob, min(0.014, max(0.002, piu_corto * 0.12)))
    return ob


def cilindro(nome, posizione, raggio, altezza, materiale=None, rotazione=(0, 0, 0), lati=32):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=lati, radius=raggio, depth=altezza, location=posizione, rotation=rotazione
    )
    ob = bpy.context.object
    ob.name = nome
    bpy.ops.object.shade_smooth()
    if materiale:
        ob.data.materials.append(materiale)
    smussa(ob, min(0.01, max(0.002, min(raggio, altezza) * 0.08)))
    return ob


def sfera(nome, posizione, raggio, materiale=None):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=raggio, location=posizione, segments=24, ring_count=12)
    ob = bpy.context.object
    ob.name = nome
    bpy.ops.object.shade_smooth()
    if materiale:
        ob.data.materials.append(materiale)
    return ob


def piano(nome, posizione, dimensioni, materiale=None, rotazione=(0, 0, 0)):
    bpy.ops.mesh.primitive_plane_add(size=1, location=posizione, rotation=rotazione)
    ob = bpy.context.object
    ob.name = nome
    ob.scale = (dimensioni[0], dimensioni[1], 1)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if materiale:
        ob.data.materials.append(materiale)
    return ob


def stanza(larghezza, profondita, altezza, mat_pavimento, mat_pareti, mat_soffitto=None):
    """
    Il guscio: pavimento, parete di fondo, due laterali, soffitto.

    Manca la quarta parete — quella dietro la camera. È la scatola aperta del
    teatro, e serve a far entrare la luce da dove sta lo spettatore.
    """
    mezza_l = larghezza / 2
    pezzi = {}
    pezzi["pavimento"] = piano("pavimento", (0, 0, 0), (larghezza, profondita), mat_pavimento)
    pezzi["fondo"] = blocco(
        "parete_fondo", (0, profondita / 2, altezza / 2), (larghezza, 0.12, altezza), mat_pareti
    )
    pezzi["sinistra"] = blocco(
        "parete_sinistra", (-mezza_l, 0, altezza / 2), (0.12, profondita, altezza), mat_pareti
    )
    pezzi["destra"] = blocco(
        "parete_destra", (mezza_l, 0, altezza / 2), (0.12, profondita, altezza), mat_pareti
    )
    if mat_soffitto:
        pezzi["soffitto"] = blocco(
            "soffitto", (0, 0, altezza), (larghezza, profondita, 0.12), mat_soffitto
        )
    return pezzi


# ── luci ────────────────────────────────────────────────────────────────────

def _colore_luce(tinta, purezza=0.42):
    """
    Il colore di una sorgente, non quello di un oggetto.

    I token della palette sono pensati per superfici dipinte: usati tali e
    quali come luce danno un giallo al neon e un blu da discoteca. Una
    lampadina a incandescenza è quasi bianca con una punta d'ambra, e questa
    miscela verso il bianco è ciò che la rende credibile.
    """
    base = srgb(PALETTE[tinta])[:3]
    return tuple(c * purezza + (1.0 - purezza) for c in base)


def luce_area(nome, posizione, energia, dimensione, tinta="brass_soft", rotazione=(0, 0, 0)):
    bpy.ops.object.light_add(type="AREA", location=posizione, rotation=rotazione)
    ob = bpy.context.object
    ob.name = nome
    ob.data.energy = energia
    ob.data.size = dimensione
    ob.data.color = _colore_luce(tinta)
    return ob


def luce_punto(nome, posizione, energia, tinta="brass_soft", raggio=0.2):
    bpy.ops.object.light_add(type="POINT", location=posizione)
    ob = bpy.context.object
    ob.name = nome
    ob.data.energy = energia
    ob.data.shadow_soft_size = raggio
    ob.data.color = _colore_luce(tinta)
    return ob


def cielo(scena, tinta="ink", forza=0.16):
    """
    Il mondo è quasi nero.

    Fuori è notte e piove: se l'ambiente illuminasse, le ombre si aprirebbero e
    l'albergo sembrerebbe fotografato di giorno. Questa è la regola della luce
    del Méridien — una sorgente calda dominante, tutto il resto è riflesso.
    """
    mondo = bpy.data.worlds.new("mondo")
    scena.world = mondo
    mondo.use_nodes = True
    sfondo = mondo.node_tree.nodes["Background"]
    sfondo.inputs["Color"].default_value = srgb(PALETTE[tinta])
    sfondo.inputs["Strength"].default_value = forza


# ── camera ──────────────────────────────────────────────────────────────────

def foschia(scena, densita=0.006, tinta="rain"):
    """
    L'aria della stanza, resa visibile.

    Una lampada in una stanza secca illumina le superfici e basta. La stessa
    lampada in un albergo sul mare, di notte, con la pioggia che entra da ogni
    porta aperta, disegna un cono: la luce si vede *nel mezzo*, non solo dove
    arriva. Sono i raggi di luce che rendono cinematografica un'inquadratura, e
    non si possono simulare con un gradiente sovrapposto — vanno calcolati.

    La densità è deliberatamente bassa. La foschia costa cara su CPU, e una
    dose eccessiva appiattisce i neri: si vuole l'accenno del cono, non la
    nebbia.
    """
    mondo = scena.world
    if mondo is None:
        return
    nodi = mondo.node_tree.nodes
    link = mondo.node_tree.links
    uscita = next((n for n in nodi if n.type == "OUTPUT_WORLD"), None)
    if uscita is None:
        return
    scatter = nodi.new("ShaderNodeVolumeScatter")
    scatter.inputs["Color"].default_value = srgb(PALETTE[tinta])
    scatter.inputs["Density"].default_value = densita
    scatter.inputs["Anisotropy"].default_value = 0.35
    link.new(scatter.outputs["Volume"], uscita.inputs["Volume"])


def camera(scena, posizione, bersaglio, lunghezza=32.0):
    """
    Inquadratura a un punto di fuga: la camera guarda dritta verso il fondo.

    È la scelta della direzione artistica — «prospettiva a un punto, moquette a
    rombi» — e ha un vantaggio pratico: gli hotspot dichiarati in percentuale
    cadono dove ci si aspetta, senza distorsioni ai bordi.
    """
    bpy.ops.object.camera_add(location=posizione)
    cam = bpy.context.object
    cam.data.lens = lunghezza
    cam.data.sensor_width = 36.0

    direzione = Vector(bersaglio) - Vector(posizione)
    cam.rotation_euler = direzione.to_track_quat("-Z", "Y").to_euler()

    """
    Profondità di campo.

    Un'immagine con tutto a fuoco è una planimetria: l'occhio non sa dove
    guardare e la scena resta piatta anche se è tridimensionale. Una lente vera
    tiene a fuoco un piano solo, e il resto sfuma — è così che una fotografia
    dice «questo è importante, quello è contesto».

    Il fuoco cade sul bersaglio della camera, che è il centro della scena;
    f/2.8 è abbastanza aperto da staccare il fondo senza trasformare la stanza
    in una macchia. Costa qualche campione in più e non richiede nulla in
    tempo reale: lo sfocato è già cotto nell'immagine.
    """
    cam.data.dof.use_dof = True
    cam.data.dof.focus_distance = direzione.length
    cam.data.dof.aperture_fstop = 2.8
    cam.data.dof.aperture_blades = 6

    scena.camera = cam
    return cam


# ── render e uscite a livelli ───────────────────────────────────────────────

def imposta_render(scena, larghezza, altezza, campioni, cartella):
    """
    Colore: **AgX** con look «Punchy».

    Con la trasformata Standard ogni superficie vicino a una lampada saliva a
    fondo scala e la hall usciva gialla: il bianco non esiste, in un albergo
    illuminato a incandescenza, e Standard non ha modo di dirlo. AgX comprime
    le alte luci come farebbe una pellicola — la lampada resta luminosa senza
    tingere di giallo il marmo intorno — e «Punchy» restituisce il contrasto
    che la compressione toglie.

    Il viraggio vero lo mette poi il filtro nel gioco, dove si può cambiare
    idea senza rifare quattordici render.
    """
    scena.view_settings.view_transform = "AgX"
    for look in ("AgX - Punchy", "Punchy", "None"):
        try:
            scena.view_settings.look = look
            break
        except TypeError:
            continue
    scena.view_settings.exposure = 0.0
    scena.render.engine = "CYCLES"
    scena.cycles.device = "CPU"
    scena.cycles.samples = campioni
    scena.cycles.use_denoising = True
    scena.cycles.max_bounces = 6
    scena.cycles.diffuse_bounces = 3
    scena.cycles.glossy_bounces = 3
    scena.cycles.transmission_bounces = 4
    scena.cycles.caustics_reflective = False
    scena.cycles.caustics_refractive = False
    # il rumore residuo lo toglie il denoiser: meglio pochi campioni e più scene
    scena.cycles.use_adaptive_sampling = True
    scena.cycles.adaptive_threshold = 0.02

    scena.render.resolution_x = larghezza
    scena.render.resolution_y = altezza
    scena.render.resolution_percentage = 100
    scena.render.film_transparent = False
    scena.render.image_settings.file_format = "PNG"
    scena.render.image_settings.color_mode = "RGBA"
    scena.render.image_settings.compression = 92
    scena.render.filepath = str(cartella)

    scena.view_layers[0].use_pass_z = True
    scena.view_layers[0].use_pass_normal = True


# soglie di profondità dei livelli, in metri dalla camera
SOGLIE = [(0.0, 3.2), (3.2, 6.5), (6.5, 40.0)]


def compositore_a_livelli(scena, cartella, vicino, lontano):
    """
    Divide un solo render in livelli di parallasse, usando la profondità.

    Il livello di fondo è l'immagine **intera**, senza ritagli: sopra si
    appoggiano due fette più vicine, che alla parallasse si spostano di più.
    Ritagliare anche il fondo lascerebbe buchi che si aprono al primo
    movimento; duplicare qualche pixel invece non si vede, perché lo scarto
    massimo fra due livelli è di pochi punti sullo schermo.

    Ne esce esattamente ciò che il renderer del gioco si aspetta di trovare:
    `layer-0.png` … `layer-2.png`, più la mappa di profondità per gli usi
    futuri.
    """
    scena.use_nodes = True
    albero = scena.node_tree
    albero.nodes.clear()

    rl = albero.nodes.new("CompositorNodeRLayers")
    rl.location = (-800, 0)

    def uscita(nome, sorgente, y):
        nodo = albero.nodes.new("CompositorNodeOutputFile")
        nodo.location = (600, y)
        nodo.base_path = str(cartella)
        nodo.file_slots[0].path = nome
        nodo.format.file_format = "PNG"
        nodo.format.color_mode = "RGBA"
        albero.links.new(sorgente, nodo.inputs[0])
        return nodo

    # livello 0: l'immagine così com'è
    uscita("layer-0-", rl.outputs["Image"], 300)

    # profondità normalizzata: 0 vicino, 1 lontano
    mappa = albero.nodes.new("CompositorNodeMapRange")
    mappa.location = (-560, -200)
    mappa.inputs[1].default_value = vicino
    mappa.inputs[2].default_value = lontano
    mappa.inputs[3].default_value = 0.0
    mappa.inputs[4].default_value = 1.0
    mappa.use_clamp = True
    albero.links.new(rl.outputs["Depth"], mappa.inputs[0])

    intervallo = max(lontano - vicino, 0.001)
    for indice, (da, a) in enumerate(SOGLIE[:2], start=1):
        rampa = albero.nodes.new("CompositorNodeValToRGB")
        rampa.location = (-300, -200 - indice * 260)
        # banda morbida: un taglio netto stamperebbe il bordo della fetta
        inizio = max(0.0, (da - vicino) / intervallo - 0.02)
        fine = min(1.0, (a - vicino) / intervallo + 0.06)
        rampa.color_ramp.elements[0].position = inizio
        rampa.color_ramp.elements[0].color = (1, 1, 1, 1)
        rampa.color_ramp.elements[1].position = fine
        rampa.color_ramp.elements[1].color = (0, 0, 0, 1)
        # nel compositore i nomi delle prese differiscono da quelli degli shader:
        # si usano gli indici, che non cambiano
        albero.links.new(mappa.outputs[0], rampa.inputs[0])

        alfa = albero.nodes.new("CompositorNodeSetAlpha")
        alfa.location = (100, -200 - indice * 260)
        alfa.mode = "REPLACE_ALPHA"
        albero.links.new(rl.outputs["Image"], alfa.inputs[0])
        albero.links.new(rampa.outputs[0], alfa.inputs[1])

        uscita(f"layer-{indice}-", alfa.outputs["Image"], -200 - indice * 260)

    # la profondità stessa, per la nebbia e la sfocatura selettiva del futuro
    profondita = albero.nodes.new("CompositorNodeOutputFile")
    profondita.location = (600, -1100)
    profondita.base_path = str(cartella)
    profondita.file_slots[0].path = "profondita-"
    profondita.format.file_format = "PNG"
    profondita.format.color_mode = "BW"
    albero.links.new(mappa.outputs[0], profondita.inputs[0])
