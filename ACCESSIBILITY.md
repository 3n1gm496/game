# ACCESSIBILITY — MÉRIDIEN

L'obiettivo non è aggiungere una modalità accessibile accanto al gioco: è che il gioco
funzioni per più persone possibile **senza smettere di essere quello che è**.

## 1. Cosa è supportato

| Area | Come |
| --- | --- |
| **Contrasto** | La palette rispetta AA sul testo (≥ 4.5:1) e sui controlli (≥ 3:1). La modalità «alto contrasto» porta i fondi a nero pieno, il testo a bianco pieno, l'ottone a `#FFD24A`, raddoppia i bordi e disattiva grana e texture. |
| **Dimensione del testo** | Quattro livelli (90 %, 100 %, 115 %, 130 %) applicati alla radice: tutto il layout usa `rem`, quindi cresce insieme. Rispettato anche l'ingrandimento del browser fino al 200 %. |
| **VoiceOver e screen reader** | Struttura semantica (`header`, `main`, `nav`, `section` con `aria-label`), stati con `aria-pressed`/`aria-current`, regioni dinamiche con `role="status"` e `aria-live`, timer con `role="timer"` e etichetta parlata. La scena Pixi è `aria-hidden`: l'interazione avviene su **veri pulsanti HTML** sovrapposti. |
| **Tastiera** | Tutto è raggiungibile con Tab. `:focus-visible` è sempre presente e non viene mai rimosso. I fogli inferiori trattengono il fuoco e si chiudono con `Esc`. Link «Salta al contenuto» come primo elemento. |
| **Riduzione del movimento** | Rispetta `prefers-reduced-motion` e ha un interruttore proprio. Disattiva parallasse, pioggia animata, camera; le tendine diventano dissolvenze da 120 ms. |
| **Sottotitoli dei suoni** | Ogni effetto e ogni ambiente hanno una didascalia testuale (`[pioggia sui vetri]`, `[indizio trovato]`) mostrata a schermo quando i sottotitoli sono attivi. |
| **Distinzione non solo cromatica** | Le carte indizio portano l'etichetta scritta della rilevanza oltre al colore del bordo; lo stato «pronto» ha un simbolo pieno/vuoto oltre al colore; le voci in bacheca hanno icona e parola. |
| **Font ad alta leggibilità** | Interruttore che sostituisce le famiglie editoriali con Atkinson Hyperlegible (o Verdana come ripiego) e allarga la spaziatura. |
| **Tempi** | L'host può estendere i timer a ×1.5 o ×2, oppure disattivarli del tutto: la partita avanza per consenso. |
| **Nessun lampeggio pericoloso** | Nessuna animazione supera i 3 lampi al secondo. Gli unici elementi pulsanti (spia di connessione, anello degli hotspot) hanno cicli da 1.4 s e 2.6 s. |
| **Vibrazione** | Attiva per impostazione predefinita, disattivabile con un interruttore. Non c'è nessuna vibrazione che non sia risposta a un gesto. |
| **Bersagli tattili** | Minimo 48 × 48 px su ogni controllo, hotspot compresi. |
| **Zoom accidentale** | I campi di testo hanno `font-size: 16px`, la misura sotto la quale iOS ingrandisce la pagina al focus. `user-scalable` resta attivo: lo zoom volontario funziona. |

## 2. Dove si regola

Impostazioni → icona in alto a destra, raggiungibile da **qualunque** schermata, anche
durante una partita. Le preferenze restano sul dispositivo e non vengono mai inviate al
server.

Al primo avvio il gioco legge `prefers-reduced-motion` e `prefers-contrast` dal sistema e
si adegua senza chiedere nulla.

## 3. Scelte di progetto che contano

**La scena è un'immagine, l'interazione è HTML.** Sarebbe stato più semplice mettere gli
hotspot dentro Pixi. Sono invece pulsanti veri, posizionati in percentuale sopra il canvas:
così hanno un nome accessibile, ricevono il fuoco, crescono con il testo e funzionano con
gli screen reader.

**Nessuna informazione affidata al solo colore.** Il rosso lacca segnala ciò che è
irreversibile, ma accanto c'è sempre una parola.

**I testi restano leggibili.** Il corpo non supera i 62 caratteri per riga, il contrasto
non scende mai sotto AA, e la modalità alto contrasto toglie le texture invece di
sovrapporvi altro.

**Mentire non richiede di scrivere in fretta.** Le dichiarazioni pubbliche dell'Atto I sono
tre opzioni precomposte: chi ha difficoltà motorie o di scrittura non è svantaggiato nel
momento che conta di più.

## 4. Come si verifica

```bash
pnpm test:visual        # snapshot su 4 viewport, con varianti alto contrasto e testo 130 %
pnpm test:e2e -g "accessibilita"   # navigazione da sola tastiera, focus trap, etichette
```

Verifica manuale, in ordine:

1. Impostazioni → «Riduci movimento» + «Alto contrasto» + testo 130 %.
2. Attraversare apertura, atrio, lobby, dossier, partita, accusa, verdetto, punteggi
   **senza toccare il mouse**.
3. Su iPhone: VoiceOver attivo, scorrere ogni schermata elemento per elemento.
4. Aprire la tastiera in ogni campo di testo e verificare che il campo resti visibile.
5. Ruotare il dispositivo in ogni schermata.

## 5. Limiti noti

* La scena 2.5D non è descritta elemento per elemento: gli hotspot hanno un nome
  («Esamina: il bancone della reception»), ma l'atmosfera visiva non è narrata. Chi gioca
  con uno screen reader riceve tutte le informazioni **di gioco**, non l'illustrazione.
* Il gioco richiede di leggere e scrivere testo in italiano: non c'è supporto vocale.
* La modalità orizzontale offre una composizione più larga ma non è necessaria; il layout
  di riferimento resta verticale.
