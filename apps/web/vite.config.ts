import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Il service worker è scritto a mano (`public/sw.js`) invece di essere generato
 * da Workbox: il gioco ha un solo scenario di cache (guscio applicativo + asset
 * locali) e un aggiornamento che deve restare sotto il controllo esplicito
 * dell'utente. Scriverlo direttamente elimina una dipendenza e rende leggibile
 * la politica di caching, che è anche una superficie di sicurezza.
 */
export default defineConfig(({ mode }) => ({
  base: './',
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/ws': { target: 'ws://127.0.0.1:8787', ws: true },
      '/health': 'http://127.0.0.1:8787',
    },
  },
  preview: { port: 4173, host: true },
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '1.0.0'),
    __DEV_TOOLS__: JSON.stringify(mode !== 'production'),
  },
  build: {
    target: 'es2022',
    sourcemap: mode !== 'production',
    cssCodeSplit: true,
    assetsInlineLimit: 2048,
    rollupOptions: {
      output: {
        // Vite 8 usa Rolldown: `manualChunks` va data in forma di funzione.
        // Le tre librerie pesanti stanno in bundle separati così il guscio
        // dell'applicazione arriva prima su rete mobile.
        manualChunks(id: string): string | undefined {
          if (id.includes('/pixi.js/') || id.includes('@pixi/')) return 'pixi';
          if (id.includes('/motion/') || id.includes('framer-motion')) return 'motion';
          if (id.includes('/react-dom/') || id.includes('/react/')) return 'react';
          return undefined;
        },
      },
    },
  },
}));
