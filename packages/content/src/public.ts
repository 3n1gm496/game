import type { PublicCase } from '@meridien/engine';

/**
 * Catalogo pubblico: l'unica parte dei contenuti che finisce nel bundle del
 * client. Non contiene soluzioni, segreti, indizi né testi del colpevole.
 * Il file è generato a mano e verificato dal test `client-safety.test.ts`.
 */

export const PUBLIC_CASES: PublicCase[] = [
  {
    id: 'case.suite404',
    number: 1,
    title: 'La Suite 404',
    subtitle: 'Ballo d’Inverno, 12 gennaio 1968',
    tagline: 'Una stanza chiusa dall’interno, e nessuna chiave che torni indietro.',
    date: '12 gennaio 1968',
    synopsis:
      'La mareggiata ha chiuso la strada per Alassio. Al Grand Hotel Méridien il Ballo d’Inverno prosegue mentre al quarto piano una porta resta chiusa più del dovuto. Corrado Malaspina, proprietario dell’albergo, non scende a fare il suo brindisi.',
    coverScene: 'facciata',
    difficulty: 1,
    victimName: 'Corrado Malaspina',
    locationNames: [
      'Hall',
      'Sala da ballo',
      'Suite 404',
      'Corridoio del quarto piano',
      'Passaggio di servizio',
      'Cucina',
      'Terrazza',
      'Quadro elettrico',
    ],
    roleCount: 8,
    clueCount: 36,
    variantCount: 3,
  },
  {
    id: 'case.orologio',
    number: 2,
    title: 'L’Orologio Sommerso',
    subtitle: 'Chiusura di stagione, 4 ottobre 1967',
    tagline: 'Il mare non restituisce niente. La piscina vuota, invece, sì.',
    date: '4 ottobre 1967',
    synopsis:
      'Elio Vanzetti, il sommozzatore che tutti i rotocalchi chiamano “il pesce d’argento”, esce sulla terrazza durante il temporale e non rientra. Il suo orologio viene trovato sul fondo della piscina svuotata per l’inverno, fermo su un’ora che non torna.',
    coverScene: 'piscina',
    difficulty: 2,
    victimName: 'Elio Vanzetti',
    locationNames: [
      'Terrazza',
      'Piscina vuota',
      'Hall',
      'Camera oscura',
      'Bar del molo',
      'Corridoio del secondo piano',
      'Passaggio di servizio',
    ],
    roleCount: 8,
    clueCount: 34,
    variantCount: 3,
  },
  {
    id: 'case.valzer',
    number: 3,
    title: 'L’Ultimo Valzer',
    subtitle: 'Serata di gala, 28 febbraio 1969',
    tagline: 'Il veleno è arrivato in orario. L’orario, però, non è quello che sembra.',
    date: '28 febbraio 1969',
    synopsis:
      'Ilde Ferrante attacca l’ultimo pezzo della serata e non lo finisce. Tutti guardavano il palco: nessuno guardava il bicchiere. E il momento in cui il veleno è stato somministrato non coincide con quello in cui ha agito.',
    coverScene: 'sala-ballo',
    difficulty: 3,
    victimName: 'Ilde Ferrante',
    locationNames: [
      'Sala da ballo',
      'Palco',
      'Camerini',
      'Cucina',
      'Sala di registrazione',
      'Corridoio degli artisti',
      'Bar della sala',
    ],
    roleCount: 8,
    clueCount: 34,
    variantCount: 3,
  },
];

export function publicCase(id: string): PublicCase | undefined {
  return PUBLIC_CASES.find((c) => c.id === id);
}
