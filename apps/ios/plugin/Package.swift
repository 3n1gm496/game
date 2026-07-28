// swift-tools-version: 5.9
import PackageDescription

/**
 * Plugin nativi di MÉRIDIEN.
 *
 * MLX non è una dipendenza obbligatoria: `ModelBridge.swift` è protetto da
 * `#if canImport(MLXLMCommon)`, quindi il plugin compila anche senza. Chi
 * vuole il modello su dispositivo aggiunge il pacchetto MLX al progetto Xcode
 * seguendo IOS_SETUP.md.
 */
let package = Package(
    name: "MeridienPlugin",
    platforms: [.iOS(.v14)],
    products: [
        .library(name: "MeridienPlugin", targets: ["MeridienPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ],
    targets: [
        .target(
            name: "MeridienPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/MeridienPlugin"
        )
    ]
)
