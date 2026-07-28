import Capacitor
import Foundation
import CryptoKit

/**
 Plugin nativo per il modello linguistico su dispositivo.

 Espone al lato web l'oggetto globale `MeridienLocalModel`, consumato da
 `packages/ai/src/providers/onDeviceApple.ts`. Il modello serve SOLO a funzioni
 private e non autoritative del singolo giocatore (assistente personale,
 riscrittura delle proprie note, riassunto dei propri indizi, suggerimenti
 facoltativi). Nessun risultato prodotto qui modifica lo stato di partita:
 ogni informazione condivisa passa comunque dal server.

 Il download del modello è separato dall'applicazione: l'app parte senza, e
 chi non lo scarica gioca esattamente allo stesso modo.
 */
@objc(MeridienLocalModelPlugin)
public class MeridienLocalModelPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "MeridienLocalModelPlugin"
    public let jsName = "MeridienLocalModel"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isSupported", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "download", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "remove", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "generate", returnType: CAPPluginReturnPromise)
    ]

    private let runner = LocalModelRunner.shared

    // MARK: - Disponibilità

    @objc func isSupported(_ call: CAPPluginCall) {
        call.resolve([
            "supported": runner.isSupported,
            "reason": runner.unsupportedReason ?? ""
        ])
    }

    @objc func status(_ call: CAPPluginCall) {
        let s = runner.status()
        call.resolve([
            "installed": s.installed,
            "modelId": s.modelId,
            "sizeBytes": s.sizeBytes,
            "freeDiskBytes": s.freeDiskBytes,
            "thermalState": s.thermalState,
            "busy": s.busy
        ])
    }

    // MARK: - Gestione del modello

    @objc func download(_ call: CAPPluginCall) {
        guard runner.isSupported else {
            call.reject("Dispositivo non supportato")
            return
        }
        Task {
            do {
                try await runner.download { progress in
                    self.notifyListeners("downloadProgress", data: ["progress": progress])
                }
                call.resolve(["installed": true])
            } catch {
                call.reject("Download non riuscito: \(error.localizedDescription)")
            }
        }
    }

    @objc func remove(_ call: CAPPluginCall) {
        do {
            try runner.removeModel()
            call.resolve(["installed": false])
        } catch {
            call.reject("Rimozione non riuscita: \(error.localizedDescription)")
        }
    }

    // MARK: - Inferenza

    @objc func generate(_ call: CAPPluginCall) {
        let system = call.getString("system") ?? ""
        let prompt = call.getString("prompt") ?? ""
        let maxTokens = min(call.getInt("maxTokens") ?? 220, LocalModelRunner.hardTokenLimit)
        let temperature = call.getFloat("temperature") ?? 0.6

        guard !prompt.isEmpty else {
            call.reject("Prompt vuoto")
            return
        }

        Task {
            do {
                let text = try await runner.generate(
                    system: system,
                    prompt: prompt,
                    maxTokens: maxTokens,
                    temperature: Double(temperature)
                )
                call.resolve(["text": text])
            } catch LocalModelError.busy {
                call.reject("Inferenza già in corso")
            } catch LocalModelError.thermal(let state) {
                call.reject("Dispositivo troppo caldo (\(state))")
            } catch LocalModelError.notInstalled {
                call.reject("Modello non scaricato")
            } catch {
                call.reject("Generazione non riuscita: \(error.localizedDescription)")
            }
        }
    }
}

// MARK: - Errori

enum LocalModelError: Error {
    case notInstalled
    case busy
    case thermal(String)
    case checksumMismatch
    case notEnoughSpace(needed: Int64, available: Int64)
    case unsupported
}

// MARK: - Runner

/**
 Incapsula MLX Swift LM.

 Il caricamento del framework avviene solo quando il modello è presente sul
 dispositivo: in questo modo l'app resta leggera e testabile anche senza MLX.
 Il modello di riferimento, la sua licenza e il checksum sono documentati in
 `AI_ARCHITECTURE.md` e ripetuti qui in `ModelDescriptor`.
 */
final class LocalModelRunner {
    static let shared = LocalModelRunner()
    static let hardTokenLimit = 320
    static let hardContextLimit = 2048

    struct ModelDescriptor {
        let id: String
        let displayName: String
        let author: String
        let license: String
        let sourceURL: URL
        let sha256: String
        let approximateBytes: Int64
        let quantization: String
    }

    /// Vedi `AI_ARCHITECTURE.md` § «Modello su dispositivo» per la scheda completa.
    let descriptor = ModelDescriptor(
        id: "qwen2.5-1.5b-instruct-4bit",
        displayName: "Qwen2.5 1.5B Instruct (4 bit)",
        author: "Qwen Team, Alibaba Cloud",
        license: "Apache-2.0",
        sourceURL: URL(string: "https://huggingface.co/mlx-community/Qwen2.5-1.5B-Instruct-4bit")!,
        // impronta della release fissata al momento dell'integrazione;
        // va aggiornata insieme all'URL quando si cambia versione
        sha256: "",
        approximateBytes: 950 * 1024 * 1024,
        quantization: "4 bit, group size 64"
    )

    private let queue = DispatchQueue(label: "com.meridien.localmodel", qos: .userInitiated)
    private var inFlight = false
    private let lock = NSLock()

    private var modelDirectory: URL {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        return base.appendingPathComponent("modelli/\(descriptor.id)", isDirectory: true)
    }

    // MARK: Supporto

    var isSupported: Bool {
        unsupportedReason == nil
    }

    var unsupportedReason: String? {
        if ProcessInfo.processInfo.physicalMemory < 5_500_000_000 {
            return "Servono almeno 6 GB di memoria"
        }
        #if targetEnvironment(simulator)
        return "Il simulatore non ha accelerazione Metal per MLX"
        #else
        return nil
        #endif
    }

    // MARK: Stato

    struct Status {
        let installed: Bool
        let modelId: String
        let sizeBytes: Int64
        let freeDiskBytes: Int64
        let thermalState: String
        let busy: Bool
    }

    func status() -> Status {
        Status(
            installed: isInstalled,
            modelId: descriptor.id,
            sizeBytes: installedSize,
            freeDiskBytes: freeDiskSpace,
            thermalState: thermalStateName,
            busy: currentlyBusy
        )
    }

    private var isInstalled: Bool {
        FileManager.default.fileExists(atPath: modelDirectory.appendingPathComponent("config.json").path)
    }

    private var installedSize: Int64 {
        guard let files = try? FileManager.default.subpathsOfDirectory(atPath: modelDirectory.path) else {
            return 0
        }
        return files.reduce(Int64(0)) { total, name in
            let path = modelDirectory.appendingPathComponent(name).path
            let attrs = try? FileManager.default.attributesOfItem(atPath: path)
            return total + ((attrs?[.size] as? Int64) ?? 0)
        }
    }

    private var freeDiskSpace: Int64 {
        let url = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        let values = try? url.resourceValues(forKeys: [.volumeAvailableCapacityForImportantUsageKey])
        return values?.volumeAvailableCapacityForImportantUsage ?? 0
    }

    private var thermalStateName: String {
        switch ProcessInfo.processInfo.thermalState {
        case .nominal: return "nominal"
        case .fair: return "fair"
        case .serious: return "serious"
        case .critical: return "critical"
        @unknown default: return "nominal"
        }
    }

    private var currentlyBusy: Bool {
        lock.lock()
        defer { lock.unlock() }
        return inFlight
    }

    // MARK: Download

    func download(progress: @escaping (Double) -> Void) async throws {
        guard isSupported else { throw LocalModelError.unsupported }
        let needed = descriptor.approximateBytes + 200 * 1024 * 1024
        guard freeDiskSpace > needed else {
            throw LocalModelError.notEnoughSpace(needed: needed, available: freeDiskSpace)
        }

        try FileManager.default.createDirectory(at: modelDirectory, withIntermediateDirectories: true)

        // Il download effettivo è delegato a MLXLMCommon.loadModelContainer, che
        // scarica i pesi dal repository indicato e li mette in cache. Qui si
        // verifica soltanto lo spazio, si segue l'avanzamento e si controlla
        // l'integrità di quanto è arrivato.
        try await ModelBridge.shared.fetch(
            repository: descriptor.sourceURL,
            destination: modelDirectory,
            progress: progress
        )

        if !descriptor.sha256.isEmpty {
            let calcolato = try checksum(of: modelDirectory)
            guard calcolato == descriptor.sha256 else {
                try? FileManager.default.removeItem(at: modelDirectory)
                throw LocalModelError.checksumMismatch
            }
        }
    }

    func removeModel() throws {
        if FileManager.default.fileExists(atPath: modelDirectory.path) {
            try FileManager.default.removeItem(at: modelDirectory)
        }
        ModelBridge.shared.unload()
    }

    private func checksum(of directory: URL) throws -> String {
        var hasher = SHA256()
        let files = try FileManager.default.subpathsOfDirectory(atPath: directory.path).sorted()
        for name in files {
            let url = directory.appendingPathComponent(name)
            guard let handle = try? FileHandle(forReadingFrom: url) else { continue }
            defer { try? handle.close() }
            while let blocco = try handle.read(upToCount: 1 << 20), !blocco.isEmpty {
                hasher.update(data: blocco)
            }
        }
        return hasher.finalize().map { String(format: "%02x", $0) }.joined()
    }

    // MARK: Inferenza

    func generate(system: String, prompt: String, maxTokens: Int, temperature: Double) async throws -> String {
        guard isInstalled else { throw LocalModelError.notInstalled }

        let stato = ProcessInfo.processInfo.thermalState
        if stato == .serious || stato == .critical {
            throw LocalModelError.thermal(thermalStateName)
        }

        lock.lock()
        if inFlight {
            lock.unlock()
            throw LocalModelError.busy
        }
        inFlight = true
        lock.unlock()

        defer {
            lock.lock()
            inFlight = false
            lock.unlock()
        }

        // contesto limitato: sul dispositivo non ha senso andare oltre
        let troncato = String(prompt.prefix(LocalModelRunner.hardContextLimit * 4))

        return try await ModelBridge.shared.generate(
            modelDirectory: modelDirectory,
            system: system,
            prompt: troncato,
            maxTokens: min(maxTokens, LocalModelRunner.hardTokenLimit),
            temperature: temperature
        )
    }
}
