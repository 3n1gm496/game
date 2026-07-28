# IOS_SETUP — dal repository a TestFlight

Il progetto Xcode **non** è nel repository, ed è una scelta: contiene percorsi assoluti,
identificativi di team e riferimenti a profili di firma che non hanno senso condivisi.
Viene generato da Capacitor in un minuto sulla macchina di chi compila.

Nel repository ci sono invece tutte le parti che contano e che si possono versionare:
la configurazione, i plugin Swift, le icone e le schermate di avvio.

## 0. Cosa serve

* macOS con **Xcode 15 o successivo**
* CocoaPods (`brew install cocoapods`)
* Node ≥ 20.11 e pnpm ≥ 10
* Un account sviluppatore Apple (per firmare e per TestFlight)

## 1. Preparare il progetto

```bash
git clone <repository> meridien && cd meridien
pnpm install
pnpm add -D @capacitor/cli @capacitor/core @capacitor/ios
pnpm build:web            # produce apps/web/dist
npx cap add ios           # genera ios/ — una sola volta
```

`capacitor.config.ts` è già configurato:

| Voce | Valore |
| --- | --- |
| `appId` | `com.meridien.gioco` |
| `appName` | `Méridien` |
| `webDir` | `apps/web/dist` |
| `contentInset` | `never` — il gioco gestisce da sé le safe area |
| `scrollEnabled` | `false` — lo scorrimento è dei pannelli, non della pagina |
| `backgroundColor` | `#0B1220` |

Cambia `appId` con il tuo bundle identifier prima di firmare.

## 2. Collegare i plugin nativi

I sorgenti stanno in `apps/ios/plugin/ios/Sources/MeridienPlugin/`:

| File | Cosa fa |
| --- | --- |
| `MeridienHapticsPlugin.swift` | vibrazione calibrata e condivisione nativa del codice stanza |
| `MeridienLocalModelPlugin.swift` | gestione del modello su dispositivo: spazio, checksum, stato termico, limiti |
| `ModelBridge.swift` | ponte verso MLX Swift LM, isolato dietro `#if canImport(MLXLMCommon)` |

In Xcode:

1. `File → Add Files to "App"…` → seleziona la cartella
   `apps/ios/plugin/ios/Sources/MeridienPlugin`, spunta **Create groups** e il target `App`.
2. Compila (`⌘B`). I plugin si registrano da soli: Capacitor li scopre tramite
   `CAPBridgedPlugin`, e da quel momento il lato web trova `window.MeridienHaptics` e
   `window.MeridienLocalModel`.

Il gioco funziona anche **senza** questo passo: `haptic()` ricade su `navigator.vibrate` e
il provider su dispositivo si dichiara non disponibile.

## 3. Modello su dispositivo (facoltativo)

Serve solo a chi vuole l'assistente locale. Vedi `AI_ARCHITECTURE.md` § 5 per la scheda
completa del modello (Qwen2.5 1.5B Instruct, Apache-2.0, 4 bit, ≈ 0,95 GB).

1. `File → Add Package Dependencies…`
2. URL: `https://github.com/ml-explore/mlx-swift-examples`
3. Prodotti da aggiungere al target `App`: **MLXLLM**, **MLXLMCommon**
4. In `Signing & Capabilities` alza il limite di memoria: **Increased Memory Limit**
   (`com.apple.developer.kernel.increased-memory-limit`)

Senza questi passi `ModelBridge` compila comunque e restituisce
`BridgeError.mlxNonDisponibile`: il gioco usa il narratore deterministico e nessuno se ne
accorge.

**Il modello non viene mai incluso nel binario.** Si scarica dalle impostazioni del gioco,
su richiesta esplicita, e si può eliminare da lì in qualunque momento.

## 4. Icone e schermate di avvio

Sono generate da `pnpm generate:assets` in `apps/web/public/` e
`apps/web/public/assets/splash/`. Per l'app nativa:

```bash
pnpm generate:assets
npx @capacitor/assets generate --ios \
  --iconBackgroundColor '#0B1220' \
  --splashBackgroundColor '#0B1220'
```

Sorgenti in `apps/ios/resources/`. Le misure incluse coprono iPhone 15 (1179×2556),
iPhone Pro Max (1284×2778), iPhone standard (1170×2532), iPhone piccoli (828×1792) e
tablet (1536×2048).

## 5. Sincronizzare a ogni modifica

```bash
pnpm ios:sync      # pnpm build:web && npx cap sync ios
npx cap open ios   # apre Xcode
```

## 6. Firma e TestFlight

**Nel repository non ci sono né certificati né profili, e non devono entrarci.**
`.gitignore` esclude `*.p12`, `*.mobileprovision`, `*.cer`, e
`scripts/check-secrets.mjs` fallisce se ne trova traccia.

1. Xcode → target `App` → **Signing & Capabilities**
   * spunta *Automatically manage signing*
   * scegli il tuo **Team**
   * imposta il tuo **Bundle Identifier**
2. Archivio:

```bash
pnpm ios:build     # controlli + build web + cap sync + xcodebuild archive
```

oppure a mano:

```bash
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath build/Meridien.xcarchive archive
```

3. Esportazione e caricamento:

```bash
xcodebuild -exportArchive \
  -archivePath build/Meridien.xcarchive \
  -exportOptionsPlist ios/ExportOptions.plist \
  -exportPath build/ipa

xcrun altool --upload-app -f build/ipa/App.ipa -t ios \
  --apiKey "$APP_STORE_CONNECT_KEY_ID" \
  --apiIssuer "$APP_STORE_CONNECT_ISSUER_ID"
```

Le chiavi App Store Connect vanno nell'ambiente o nei segreti della CI, mai in un file
versionato.

`pnpm ios:build` su una macchina che non è macOS non fallisce: esegue tutti i controlli
possibili, verifica che i file ci siano e stampa i comandi esatti da eseguire su un Mac.

## 7. Build automatica

`.github/workflows/ios.yml` gira su `macos-14`. Senza segreti configurati si ferma dopo la
compilazione **non firmata**, che è comunque un controllo utile: verifica che il progetto
Capacitor si generi e che i plugin Swift compilino.

Con questi segreti nel repository prosegue fino a TestFlight:

| Segreto | Cosa contiene |
| --- | --- |
| `IOS_CERTIFICATE_P12_BASE64` | certificato di distribuzione, in base64 |
| `IOS_CERTIFICATE_PASSWORD` | password del `.p12` |
| `IOS_PROVISIONING_PROFILE_BASE64` | profilo di provisioning, in base64 |
| `APP_STORE_CONNECT_KEY_ID` | identificativo della chiave API |
| `APP_STORE_CONNECT_ISSUER_ID` | issuer della chiave API |
| `APP_STORE_CONNECT_PRIVATE_KEY` | chiave privata `.p8` |

Sono **gli unici segreti** che il progetto non può procurarsi da solo: dipendono dal tuo
account Apple.

## 8. Cose che si dimenticano

* **Safe area**: `contentInset: 'never'` è voluto. Il layout usa `env(safe-area-inset-*)`,
  quindi Dynamic Island e indicatore home sono già gestiti dal CSS. Non attivare
  `contentInset: 'always'` o comparirà un doppio margine.
* **Tastiera**: `resize: 'none'` nel plugin Keyboard. Lo spostamento lo fa il client
  osservando `visualViewport`, in modo uniforme fra app e browser.
* **Rotazione**: `orientation: portrait` nel manifest, ma il layout regge l'orizzontale.
  Se vuoi bloccarlo davvero, toglilo da *Device Orientation* in Xcode.
* **Rete locale**: per provare contro un server sullo stesso Wi-Fi serve
  `NSAppTransportSecurity → NSAllowsLocalNetworking` in `Info.plist`, **solo in sviluppo**.
* **Audio**: la categoria è `ambient`, quindi il gioco non interrompe la musica di sistema e
  rispetta l'interruttore di silenzioso.
