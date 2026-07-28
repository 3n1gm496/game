/*
  Service worker del Méridien.

  Politica:
    - il guscio applicativo e gli asset locali vanno in cache alla prima visita;
    - le richieste di navigazione usano la rete e ricadono sulla cache, con una
      pagina offline dedicata come ultima risorsa;
    - gli asset con impronta nel nome sono immutabili: cache per prima;
    - il WebSocket non passa mai da qui;
    - il nuovo service worker resta in attesa: prende il controllo solo quando
      l'utente lo chiede dalle impostazioni.
*/

const VERSIONE = 'meridien-v1';
const GUSCIO = `${VERSIONE}-guscio`;
const RISORSE = `${VERSIONE}-risorse`;

const PRECARICATI = ['/', '/index.html', '/offline.html', '/manifest.webmanifest', '/favicon.svg'];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(GUSCIO)
      .then((cache) => cache.addAll(PRECARICATI))
      .catch(() => undefined),
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((chiavi) =>
        Promise.all(chiavi.filter((k) => !k.startsWith(VERSIONE)).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (evento) => {
  if (evento.data && evento.data.tipo === 'PRENDI-IL-CONTROLLO') {
    void self.skipWaiting();
  }
});

self.addEventListener('fetch', (evento) => {
  const richiesta = evento.request;
  if (richiesta.method !== 'GET') return;

  const url = new URL(richiesta.url);
  // solo la nostra origine: niente cache di terzi, niente sorprese
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/ws') || url.pathname.startsWith('/health') || url.pathname.startsWith('/metrics')) {
    return;
  }

  if (richiesta.mode === 'navigate') {
    evento.respondWith(
      fetch(richiesta)
        .then((risposta) => {
          const copia = risposta.clone();
          void caches.open(GUSCIO).then((cache) => cache.put('/index.html', copia));
          return risposta;
        })
        .catch(() =>
          caches
            .match('/index.html')
            .then((cached) => cached || caches.match('/offline.html'))
            .then((r) => r || new Response('Offline', { status: 503 })),
        ),
    );
    return;
  }

  const immutabile = /-[A-Za-z0-9_]{8,}\.(js|css|woff2|png|webp|svg)$/.test(url.pathname);

  if (immutabile) {
    evento.respondWith(
      caches.match(richiesta).then(
        (cached) =>
          cached ||
          fetch(richiesta).then((risposta) => {
            const copia = risposta.clone();
            void caches.open(RISORSE).then((cache) => cache.put(richiesta, copia));
            return risposta;
          }),
      ),
    );
    return;
  }

  evento.respondWith(
    caches.match(richiesta).then((cached) => {
      const rete = fetch(richiesta)
        .then((risposta) => {
          if (risposta.ok) {
            const copia = risposta.clone();
            void caches.open(RISORSE).then((cache) => cache.put(richiesta, copia));
          }
          return risposta;
        })
        .catch(() => cached || new Response('', { status: 504 }));
      return cached || rete;
    }),
  );
});
