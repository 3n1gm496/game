import Capacitor
import CoreHaptics
import UIKit

/**
 Ritorno tattile e condivisione nativa.

 Il lato web cerca `MeridienHaptics` prima di `navigator.vibrate`
 (`apps/web/src/store/settings.ts`): sull'app installata la vibrazione ha la
 grana giusta, sul browser resta il fallback. Rispetta sempre l'impostazione
 dell'utente, che viene passata dal lato web: qui non si vibra mai di propria
 iniziativa.
 */
@objc(MeridienHapticsPlugin)
public class MeridienHapticsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "MeridienHapticsPlugin"
    public let jsName = "MeridienHaptics"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "impact", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "notification", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "selection", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "share", returnType: CAPPluginReturnPromise)
    ]

    private var selectionGenerator: UISelectionFeedbackGenerator?

    @objc func impact(_ call: CAPPluginCall) {
        let stile = call.getString("style") ?? "light"
        DispatchQueue.main.async {
            let intensita: UIImpactFeedbackGenerator.FeedbackStyle
            switch stile {
            case "heavy": intensita = .heavy
            case "medium": intensita = .medium
            case "rigid": intensita = .rigid
            case "soft": intensita = .soft
            default: intensita = .light
            }
            let generatore = UIImpactFeedbackGenerator(style: intensita)
            generatore.prepare()
            generatore.impactOccurred()
            call.resolve()
        }
    }

    @objc func notification(_ call: CAPPluginCall) {
        let tipo = call.getString("type") ?? "success"
        DispatchQueue.main.async {
            let generatore = UINotificationFeedbackGenerator()
            generatore.prepare()
            switch tipo {
            case "warning": generatore.notificationOccurred(.warning)
            case "error": generatore.notificationOccurred(.error)
            default: generatore.notificationOccurred(.success)
            }
            call.resolve()
        }
    }

    @objc func selection(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if self.selectionGenerator == nil {
                self.selectionGenerator = UISelectionFeedbackGenerator()
                self.selectionGenerator?.prepare()
            }
            self.selectionGenerator?.selectionChanged()
            call.resolve()
        }
    }

    /// Condivisione nativa del codice stanza: più affidabile della Web Share
    /// API dentro una WKWebView.
    @objc func share(_ call: CAPPluginCall) {
        let testo = call.getString("text") ?? ""
        let urlString = call.getString("url")

        DispatchQueue.main.async {
            var elementi: [Any] = []
            if !testo.isEmpty { elementi.append(testo) }
            if let urlString, let url = URL(string: urlString) { elementi.append(url) }
            guard !elementi.isEmpty, let controller = self.bridge?.viewController else {
                call.reject("Niente da condividere")
                return
            }

            let foglio = UIActivityViewController(activityItems: elementi, applicationActivities: nil)
            // su iPad il foglio ha bisogno di un'ancora
            if let popover = foglio.popoverPresentationController {
                popover.sourceView = controller.view
                popover.sourceRect = CGRect(
                    x: controller.view.bounds.midX,
                    y: controller.view.bounds.maxY - 40,
                    width: 0,
                    height: 0
                )
                popover.permittedArrowDirections = []
            }
            foglio.completionWithItemsHandler = { _, completato, _, _ in
                call.resolve(["shared": completato])
            }
            controller.present(foglio, animated: true)
        }
    }
}
