# ART DIRECTION — MÉRIDIEN

## 1. La frase guida

> **Un poster turistico della Riviera del 1968, bagnato dalla pioggia, visto attraverso il vetro di
> una porta girevole.**

Lusso decadente, modernismo italiano, geometrie Art Déco tardive, graphic novel europea. Luce calda
contro pioggia blu. Nessun horror, nessun gore: il delitto è un'assenza elegante, non una ferita.

## 2. Palette

| Token | Hex | Uso |
| --- | --- | --- |
| `--ink` | `#0B1220` | Fondo notte, testo su chiaro |
| `--night` | `#111C2E` | Fondo primario delle scene |
| `--petrol` | `#14413F` | Verde petrolio: velluti, tende, superfici |
| `--petrol-lit` | `#1E5E58` | Velluto illuminato |
| `--lacquer` | `#B5261E` | Rosso lacca: accenti, allarme, colpevole |
| `--lacquer-deep` | `#7E1712` | Rosso in ombra |
| `--brass` | `#C9A227` | Ottone: cornici, chiavi, bordi attivi |
| `--brass-soft` | `#E0C365` | Ottone in luce |
| `--ivory` | `#F2E9D8` | Avorio: carta, testo principale |
| `--ivory-dim` | `#CDC2AE` | Testo secondario |
| `--rain` | `#5C7FA3` | Pioggia, vetro, freddo |
| `--marble` | `#DCD6C8` | Marmo del pavimento |
| `--plum` | `#3A2440` | Ombre calde, tendaggi |

**Regola 60/30/10**: 60 % notte/petrolio, 30 % avorio/marmo, 10 % ottone + lacca.
La lacca è riservata a ciò che è **irreversibile** (accusa, verdetto, tempo scaduto).

Modalità **alto contrasto**: `--ivory` → `#FFFFFF`, `--night` → `#000000`, ottone → `#FFD24A`,
bordi portati a 2 px, texture disattivate, opacità minima 0.92 su ogni testo.

## 3. Tipografia

| Ruolo | Font | Note |
| --- | --- | --- |
| Display / titoli | **Méridien Display** — famiglia variabile costruita nel repo a partire da forme Art Déco geometriche | Usata per logo, titoli d'atto, numeri dell'orologio |
| Testo | `"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif` | Serif da romanzo, ottima leggibilità su iOS |
| Interfaccia | `ui-sans-serif, -apple-system, "Segoe UI", Roboto, sans-serif` | Etichette, pulsanti, contatori |
| Monospazio | `ui-monospace, "SF Mono", Menlo, monospace` | Codici stanza, orari, seed |
| Alta leggibilità (accessibilità) | `"Atkinson Hyperlegible", "Verdana", sans-serif` con fallback di sistema | Attivabile dalle impostazioni |

Scala tipografica (rem, base 16, moltiplicatore utente 0.9 / 1 / 1.15 / 1.3):
`0.75 · 0.875 · 1 · 1.125 · 1.375 · 1.75 · 2.25 · 3`.

Le lettere dei titoli hanno `letter-spacing: 0.08em` e maiuscoletto ottico. Il corpo del testo non
supera mai i 62 caratteri per riga.

## 4. Griglia e spazi

* Griglia mobile: 4 colonne, gutter 12 px, margine 20 px.
* Griglia tablet/desktop: 12 colonne, gutter 20 px, contenuto max 1180 px.
* Scala di spaziatura (px): `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`.
* Raggi: `2` (etichette), `6` (carte), `12` (pannelli), `999` (pillole). Le carte indizio hanno
  angoli **tagliati** (clip-path a 45°) invece che arrotondati: è la firma geometrica del gioco.
* Ombre: due sole, morbide e calde.
  `--shadow-card: 0 2px 6px rgba(6,10,18,.45), 0 12px 28px rgba(6,10,18,.35)`
  `--shadow-lift: 0 6px 14px rgba(6,10,18,.5), 0 24px 60px rgba(6,10,18,.45)`

## 5. Personaggi

Silhouette prima di tutto: ogni personaggio è riconoscibile in nero su fondo chiaro. Corpi
leggermente caricaturali (teste al 1/7 dell'altezza, spalle geometriche), volti costruiti con poche
forme: un ovale, un naso a virgola, due archi per gli occhi, una bocca essenziale.

**Dodici ritratti originali** (`portrait-01` … `portrait-12`), ciascuno con:

* 3 pose (`neutral`, `lean`, `turn`);
* 4 espressioni (`calm`, `worried`, `smug`, `caught`);
* maschera del ballo rimovibile (layer separato);
* variante silhouette per la bacheca e per il verdetto.

Ogni ritratto è composto da forme SVG generate da `tools/generate-assets`, parametrizzate da un seed
per famiglia (colore pelle, capelli, abito, accessorio) e disegnate a mano nei tratti caratteristici.
Nessun ritratto imita una persona reale o uno stile d'artista vivente.

## 6. Ambienti

Undici scene, tutte a 3–5 livelli di profondità:

| Scena | Chiave visiva |
| --- | --- |
| Facciata dell'hotel | Insegna al neon «MÉRIDIEN» sotto la pioggia obliqua, palme piegate dal vento |
| Hall | Marmo a scacchi, bancone di ottone, quadro di orologi delle capitali |
| Sala da ballo | Lampadario a cascata, coppie sfocate sul fondo, palco |
| Suite 404 | Porta socchiusa, luce da un solo abat-jour, finestra battuta dalla pioggia |
| Terrazza | Ringhiera, mare nero, faro lontano che pulsa ogni 4 secondi |
| Piscina vuota | Piastrelle verde petrolio, scaletta, fondo asciutto, una scarpa |
| Cucina | Acciaio, vapore, ganci, orologio a muro |
| Corridoi | Prospettiva a un punto, moquette a rombi, porte numerate |
| Camerini | Specchio con lampadine, abiti su stampella, spartiti |
| Passaggi di servizio | Tubi, luce verde d'emergenza, scala a chiocciola |
| Sala macchine / quadro elettrico | Leve, contatori, ombra lunga |

**Presentazione 2.5D**: 4 layer con parallasse (`0.15 · 0.4 · 1.0 · 1.6`), luce volumetrica in
overlay, pioggia in particelle (WebGL), riflessi su marmo tramite maschera speculare, nebbia
discreta a bassa opacità, grana di carta su tutto (blend `soft-light`, 6 %).

## 7. Movimento

| Elemento | Durata | Curva |
| --- | --- | --- |
| Micro-feedback (pressione) | 120 ms | `cubic-bezier(.2,.8,.3,1)` |
| Transizione fra pannelli | 320 ms | `cubic-bezier(.22,1,.36,1)` |
| Tendina d'atto (sipario) | 900 ms | `cubic-bezier(.7,0,.2,1)` |
| Camera pan di scena | 1400 ms | `cubic-bezier(.4,0,.2,1)` |
| Rivelazione carta indizio | 480 ms | flip 3D con ombra che segue |

Con `prefers-reduced-motion` o l'impostazione «riduci movimento»: parallasse disattivata, pioggia
statica, tendine sostituite da dissolvenze di 160 ms, camera fissa, nessun bagliore pulsante.
Nessuna animazione supera 3 lampi al secondo in nessuna circostanza.

## 8. Icone

Set originale a tratto singolo, 24×24, `stroke-width: 1.5`, terminali tagliati a 45°: chiave,
orologio, maschera, bicchiere, spartito, macchina fotografica, telefono, ombrello, valigia, faro,
scala, lente, taccuino, sigillo, campanello, fulmine.

## 9. Cosa evitare

* Glassmorphism diffuso (ammesso solo sul vetro della porta girevole, dove è letterale).
* Gradienti casuali, neon fuori dall'insegna, ombre pesanti, bordi luminosi generici.
* Emoji come grafica finale.
* Rettangoli colorati al posto di un asset.
* Immagini remote o asset di terzi non licenziati: **tutto è generato nel repository**.
* Animazioni decorative prive di funzione narrativa o di feedback.

## 10. Pipeline

`pnpm generate:assets` esegue `tools/generate-assets`:

1. costruisce le palette e i token in `packages/engine/src/design/tokens.ts` → `apps/web/src/styles/tokens.css`;
2. genera gli SVG di ritratti, icone, carte, logo;
3. rasterizza in PNG/WebP a 1×/2× con `sharp` quando disponibile, altrimenti mantiene SVG (il gioco
   funziona interamente con gli SVG);
4. compone l'atlas delle texture per Pixi;
5. genera le icone PWA (192/512/maskable) e gli splash iOS;
6. scrive `apps/web/public/assets/manifest.json` con checksum di ogni file.

Tutti i file prodotti sono **committati** nel repository: l'app non dipende mai da una generazione a
runtime né da una risorsa remota.
