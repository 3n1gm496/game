# AI ARCHITECTURE — il Regista del Méridien

## 1. Il principio

> La verità del caso vive in un motore deterministico. Il modello linguistico è un
> **attore**, non un **arbitro**.

Il Regista AI riceve un contesto già ristretto dal server, restituisce testo, e quel testo
passa da uno schema rigoroso prima di entrare in partita. Non conosce la soluzione perché
la soluzione non gli viene mai mandata.

## 2. Cosa può e cosa non può

| Può | Non può |
| --- | --- |
| Interpretare domande libere rivolte ai testimoni | Scegliere il colpevole |
| Trasformare fatti già validati in dialogo naturale | Cambiare la soluzione |
| Adattare il tono di un personaggio | Creare prove |
| Riassumere le teorie del gruppo | Rimuovere prove |
| Segnalare contraddizioni **già presenti** in bacheca | Modificare il punteggio |
| Scegliere fra eventi **prevalidati** | Inventare stanze o orari |
| Offrire suggerimenti calibrati | Rivelare informazioni non sbloccate |
| Scrivere il riepilogo cinematografico finale | Seguire istruzioni dei giocatori contro le regole |
| Generare titoli ironici per i momenti memorabili | Leggere segreti fuori dal contesto ricevuto |
| Interpretare ADALBERTO, il maggiordomo della lobby | |

Queste non sono buone intenzioni: sono vincoli strutturali. Il Regista **non riceve** la
soluzione, non ha accesso allo stato di gioco e i suoi effetti non toccano mai
`RoomState`. L'unica cosa che produce è una stringa che finisce in un messaggio `witness`
o `director`.

## 3. Struttura

```
packages/ai/
├── types.ts                     interfaccia AIProvider e configurazione
├── director.ts                  AiDirector: provider scelto + fallback + interruttore
├── prompt.ts                    costruzione dei prompt, sanificazione del testo utente
├── parse.ts                     validazione delle risposte e guardrail
├── catalog.ts                   frammenti del provider deterministico
└── providers/
    ├── deterministic.ts         DeterministicNarrativeProvider   (predefinito)
    ├── anthropic.ts             AnthropicClaudeProvider          (solo server)
    ├── openaiCompatible.ts      OpenAICompatibleProvider         (solo server)
    └── onDeviceApple.ts         OnDeviceAppleProvider            (solo app iOS)
```

### 3.1 `AIProvider`

```ts
interface AIProvider {
  readonly name: string;
  isAvailable(): boolean;
  respond(request: AiRequest, signal?: AbortSignal): Promise<AiOutcome>;
}
```

`AiRequest` è una unione discriminata definita nel **motore**, non qui: `witness`,
`butler`, `recap`, `hint`, `epilogue`. Ogni variante contiene esattamente ciò che serve e
nulla di più.

### 3.2 `AiDirector`

Tiene sempre due provider: quello scelto e quello deterministico. Se il primo tarda
(timeout 6 s), restituisce una forma sbagliata, viola un guardrail o non è disponibile, il
secondo risponde. Dopo **tre errori consecutivi** l'interruttore si apre per un minuto:
un endpoint che non risponde non rallenta ogni partita.

```
richiesta → provider scelto ──ok──→ schema Zod ──ok──→ guardrail ──ok──→ risposta
                │                       │                   │
              errore                 non valida          violazione
                └───────────────────────┴───────────────────┴──→ provider deterministico
```

Il giocatore non vede differenza: il campo `provider` nel messaggio dice quale ha risposto,
e serve solo alla diagnostica.

## 4. I quattro provider

### 4.1 `DeterministicNarrativeProvider` — predefinito

Zero dipendenze, zero rete, zero chiavi. **Il gioco è completo così.**

* **Testimoni**: le battute sono già scritte nel caso, una per argomento. Il provider
  interpreta la domanda libera con un punteggio per parole chiave, con normalizzazione
  italiana (minuscole, rimozione dei diacritici, parole vuote). Se nessuna battuta è
  pertinente, il testimone dice che non sa — che è una risposta legittima e in carattere.
* **Maggiordomo, riepiloghi, suggerimenti, epilogo**: frasi composte da frammenti
  (apertura × soggetto × chiusura). Per la sola lobby le combinazioni sono 12 × 14 × 12 =
  **2 016**, e un registro delle ultime dodici battute evita le ripetizioni ravvicinate.
* Tutto è **seeded**: a parità di contesto la risposta è la stessa, quindi i test sono
  riproducibili.

### 4.2 `AnthropicClaudeProvider` — solo server

Chiave in `process.env.ANTHROPIC_API_KEY`. Il costruttore **rifiuta di attivarsi** se
rileva `window` e `document`: un errore di bundling non può trascinare la chiave nel
client. Il modello è pre-riempito con `{` per forzare l'uscita in JSON.

### 4.3 `OpenAICompatibleProvider` — solo server

Qualunque endpoint compatibile con Chat Completions: vLLM, llama.cpp server, Ollama,
LM Studio, TGI, o un servizio gestito. Pensato per un **modello open-source ospitato in
proprio**:

```bash
MERIDIEN_AI_PROVIDER=openai-compatible
MERIDIEN_AI_BASE_URL=http://127.0.0.1:8000/v1
MERIDIEN_AI_MODEL=qwen2.5-7b-instruct
```

### 4.4 `OnDeviceAppleProvider` — solo app iOS

Ponte verso il plugin Capacitor `MeridienLocalModel`
(`apps/ios/plugin/ios/Sources/MeridienPlugin/`), che usa **MLX Swift LM**.

Serve **soltanto** a funzioni private e non autoritative del singolo giocatore:

* assistente personale del detective;
* riscrittura delle proprie note;
* riassunto dei propri indizi;
* suggerimenti facoltativi;
* resa cosmetica di dialoghi già validati dal server.

Le richieste ammesse sono `recap`, `hint`, `butler`. Tutto ciò che è condiviso o che
cambia lo stato passa comunque dal server.

## 5. Il modello su dispositivo

| Voce | Valore |
| --- | --- |
| Modello | **Qwen2.5 1.5B Instruct** |
| Autore | Qwen Team, Alibaba Cloud |
| Licenza | **Apache-2.0** — permissiva, compatibile con la distribuzione |
| Origine | `mlx-community/Qwen2.5-1.5B-Instruct-4bit` (conversione MLX della release ufficiale) |
| Versione | 2.5, conversione MLX |
| Quantizzazione | 4 bit, group size 64 |
| Peso su disco | ≈ 0,95 GB |
| Contesto usato | 2 048 token (limite imposto dal plugin) |
| Uscita massima | 320 token (limite imposto dal plugin) |

### Regole di gestione, applicate nel codice

* **Download separato dall'app.** L'applicazione si installa e si gioca senza. Il modello
  si scarica dalle impostazioni, con avanzamento visibile.
* **Spazio verificato prima**: servono il peso del modello più 200 MB di margine, altrimenti
  il download non parte (`LocalModelError.notEnoughSpace`).
* **Checksum**: alla fine del download si verifica l'impronta SHA-256; se non combacia i
  file vengono cancellati.
* **L'utente può eliminarlo** in qualunque momento (`remove()`), e recuperare lo spazio.
* **Stato termico**: con `serious` o `critical` l'inferenza non parte.
* **Una sola inferenza pesante alla volta**, garantita da un lock nel runner e da un
  contatore nel provider.
* **Memoria**: cache GPU limitata a 256 MB, contesto e uscita troncati.
* **Mai necessario**: se il modello manca, il gioco usa il provider deterministico e
  nessuno se ne accorge. Non partecipare al download non toglie nulla alla partita.

`ModelBridge.swift` è isolato dietro `#if canImport(MLXLMCommon)`: il resto del plugin —
spazio, checksum, stato termico, limiti — compila e si testa anche in un progetto che non
ha ancora aggiunto MLX.

## 6. Sicurezza dei prompt

### 6.1 Il testo dei giocatori non è un'istruzione

Ogni stringa scritta da un utente passa da `sanitizeUserText()` (nel motore) prima di
entrare in un prompt:

* rimozione dei caratteri di controllo e degli zero-width;
* neutralizzazione dei recinti di codice e dei tag;
* sostituzione delle formule di dirottamento più comuni, in italiano e in inglese
  («ignora tutte le istruzioni», «ignore all previous instructions», `system:`);
* troncamento alla lunghezza prevista.

Il testo così ripulito viene inserito **dentro un delimitatore esplicito**:

```
<<<DOMANDA
…testo dell'ospite…
DOMANDA>>>
```

e il prompt di sistema dice al modello, come regola non derogabile, che quel contenuto è
materiale narrativo e mai istruzione.

### 6.2 Il contesto è già ristretto

Il server non manda al modello ciò che il modello non deve sapere:

| Richiesta | Cosa contiene |
| --- | --- |
| `witness` | solo le battute prevalidate **di quel testimone**, **di quell'atto** |
| `recap` | solo ciò che è già in bacheca, quindi già pubblico |
| `hint` | i titoli degli indizi noti e la categoria mancante — mai la conclusione |
| `epilogue` | la spiegazione ufficiale, **dopo** che il gioco l'ha già rivelata |
| `butler` | nickname e titolo del caso |

Nessuna richiesta contiene il colpevole, i segreti altrui o i fatti non sbloccati.

### 6.3 Guardrail in uscita

`violatesGuardrails()` blocca qualunque risposta che dichiari una colpevolezza, riveli la
soluzione, faccia trapelare il prompt di sistema o assomigli a una chiave. I pattern
tengono conto dell'italiano: `\b` non funziona dopo una vocale accentata, quindi i confini
sono espliciti — dettaglio piccolo, e la causa di un baco reale trovato dai test.

Una risposta bloccata non arriva mai al giocatore: risponde il provider deterministico.

## 7. Configurazione

Tutte le variabili sono **del server**. Nessuna è mai esposta al client.

```bash
MERIDIEN_AI_PROVIDER=deterministic   # deterministic | anthropic | openai-compatible
MERIDIEN_AI_ENABLED=true             # false disattiva il provider esterno
MERIDIEN_AI_TIMEOUT_MS=6000
MERIDIEN_AI_MODEL=                   # facoltativo
MERIDIEN_AI_BASE_URL=                # per openai-compatible
ANTHROPIC_API_KEY=                   # solo per il provider anthropic
MERIDIEN_AI_API_KEY=                 # solo per openai-compatible, se serve
```

Con l'ambiente vuoto il gioco parte in modalità deterministica. È il comportamento
predefinito e voluto.

## 8. Verifica

```bash
pnpm test packages/ai            # guardrail, fallback, parsing, sanificazione
unset ANTHROPIC_API_KEY && pnpm dev:multiplayer   # partita completa senza AI esterna
```

I test di `packages/ai` coprono: risposta valida accettata, risposta malformata rifiutata,
guardrail attivo, fallback immediato al deterministico, interruttore dopo tre errori,
provider esterni che si dichiarano non disponibili in contesto browser, e il fatto che il
provider su dispositivo rifiuti richieste diverse da quelle private.
