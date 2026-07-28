# apps/ios — wrapper nativo

Questa cartella contiene tutto ciò che serve a impacchettare MÉRIDIEN come
applicazione iOS, **tranne** il progetto Xcode: quello viene generato da
Capacitor sulla macchina di chi compila, perché contiene percorsi assoluti e
identificativi di firma che non hanno senso in un repository.

```
apps/ios/
├── plugin/                 plugin Capacitor scritti in Swift
│   ├── Package.swift
│   └── ios/Sources/MeridienPlugin/
│       ├── MeridienLocalModelPlugin.swift   modello su dispositivo (MLX)
│       ├── ModelBridge.swift                ponte verso MLX Swift LM
│       └── MeridienHapticsPlugin.swift      vibrazione e condivisione nativa
└── resources/              icona e schermata di avvio sorgente
```

Procedura completa in `../../IOS_SETUP.md`.

Comandi:

```bash
pnpm ios:sync    # build web + npx cap sync ios
pnpm ios:build   # controlli preliminari e istruzioni di compilazione
```
