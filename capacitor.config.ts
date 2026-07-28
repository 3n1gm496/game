import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Configurazione del wrapper iOS.
 * La build web finisce in `apps/web/dist` e viene copiata dentro il progetto
 * Xcode da `pnpm ios:sync`. Nessun segreto qui: chiavi e profili di firma
 * restano fuori dal repository.
 */
const config: CapacitorConfig = {
  appId: 'com.meridien.gioco',
  appName: 'Méridien',
  webDir: 'apps/web/dist',
  ios: {
    contentInset: 'never',
    backgroundColor: '#0B1220',
    limitsNavigationsToAppBoundDomains: true,
    scrollEnabled: false,
    preferredContentMode: 'mobile',
  },
  server: {
    // in sviluppo si punta al server locale; in produzione si usa il bundle
    androidScheme: 'https',
    iosScheme: 'meridien',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#0B1220',
      showSpinner: false,
    },
    Keyboard: {
      resize: 'none',
      style: 'dark',
    },
  },
};

export default config;
