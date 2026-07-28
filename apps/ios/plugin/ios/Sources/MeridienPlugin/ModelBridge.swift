import Foundation

#if canImport(MLXLMCommon)
import MLX
import MLXLMCommon
import MLXLLM
#endif

/**
 Ponte verso MLX Swift LM.

 È isolato dietro un `#if canImport` per una ragione pratica: il resto del
 plugin — gestione del file, spazio disco, checksum, stato termico, limiti di
 contesto — si compila e si testa anche in un progetto che non ha ancora
 aggiunto la dipendenza MLX. Quando MLX c'è, questo file lo usa; quando non
 c'è, `generate` fallisce in modo pulito e il gioco ricade sul provider
 deterministico, che è comunque quello predefinito.

 Come aggiungere MLX al progetto Xcode:
   File → Add Package Dependencies…
   https://github.com/ml-explore/mlx-swift-examples  (prodotti: MLXLLM, MLXLMCommon)
 Vedi `IOS_SETUP.md`.
 */
final class ModelBridge {
    static let shared = ModelBridge()

    enum BridgeError: LocalizedError {
        case mlxNonDisponibile
        case caricamentoFallito(String)

        var errorDescription: String? {
            switch self {
            case .mlxNonDisponibile:
                return "MLX non è incluso in questa build. Il gioco usa il narratore deterministico."
            case .caricamentoFallito(let motivo):
                return "Caricamento del modello non riuscito: \(motivo)"
            }
        }
    }

    #if canImport(MLXLMCommon)
    private var container: ModelContainer?
    #endif

    // MARK: Download

    func fetch(repository: URL, destination: URL, progress: @escaping (Double) -> Void) async throws {
        #if canImport(MLXLMCommon)
        let nome = repository.lastPathComponent
        let configurazione = ModelConfiguration(id: "mlx-community/\(nome)")
        let caricato = try await LLMModelFactory.shared.loadContainer(configuration: configurazione) { avanzamento in
            progress(avanzamento.fractionCompleted)
        }
        container = caricato
        // segnala l'installazione: il runner usa questo file come sentinella
        let marcatore = destination.appendingPathComponent("config.json")
        if !FileManager.default.fileExists(atPath: marcatore.path) {
            let info = ["id": configurazione.name, "scaricatoIl": ISO8601DateFormatter().string(from: Date())]
            let dati = try JSONSerialization.data(withJSONObject: info, options: [.prettyPrinted])
            try dati.write(to: marcatore)
        }
        progress(1)
        #else
        _ = repository
        _ = destination
        progress(0)
        throw BridgeError.mlxNonDisponibile
        #endif
    }

    func unload() {
        #if canImport(MLXLMCommon)
        container = nil
        MLX.GPU.clearCache()
        #endif
    }

    // MARK: Inferenza

    func generate(
        modelDirectory: URL,
        system: String,
        prompt: String,
        maxTokens: Int,
        temperature: Double
    ) async throws -> String {
        #if canImport(MLXLMCommon)
        // tetto di memoria per la cache GPU: su iPhone conviene essere prudenti
        MLX.GPU.set(cacheLimit: 256 * 1024 * 1024)

        let attivo: ModelContainer
        if let esistente = container {
            attivo = esistente
        } else {
            let nome = modelDirectory.lastPathComponent
            let configurazione = ModelConfiguration(id: "mlx-community/\(nome)")
            do {
                attivo = try await LLMModelFactory.shared.loadContainer(configuration: configurazione)
                container = attivo
            } catch {
                throw BridgeError.caricamentoFallito(error.localizedDescription)
            }
        }

        let messaggi: [Chat.Message] = [
            .system(system),
            .user(prompt)
        ]

        let parametri = GenerateParameters(
            maxTokens: maxTokens,
            temperature: Float(temperature),
            topP: 0.9,
            repetitionPenalty: 1.05
        )

        return try await attivo.perform { contesto in
            let input = try await contesto.processor.prepare(input: .init(chat: messaggi))
            var testo = ""
            let stream = try MLXLMCommon.generate(input: input, parameters: parametri, context: contesto)
            for await evento in stream {
                if let pezzo = evento.chunk {
                    testo += pezzo
                    // il modello locale serve a risposte brevi: si taglia presto
                    if testo.count > maxTokens * 6 { break }
                }
            }
            return testo
        }
        #else
        _ = (modelDirectory, system, prompt, maxTokens, temperature)
        throw BridgeError.mlxNonDisponibile
        #endif
    }
}
