import type { CaseDef } from '@meridien/engine';
import { abilities, locations, objects, roles, victim, witnesses } from './world.js';
import { clues } from './clues.js';
import { beats, events, methodOptions, motiveOptions, objectives, secrets } from './secrets.js';
import { texts } from './texts.js';
import { variantFratello } from './variants/a.js';
import { variantDebitoSaldato } from './variants/b.js';
import { variantFotografiaSbagliata } from './variants/c.js';

/**
 * Caso 2 — «L'Orologio Sommerso».
 * 4 ottobre 1967, chiusura di stagione al Grand Hotel Méridien.
 * Elio Vanzetti esce sulla terrazza durante il temporale e non rientra.
 * Il corpo non viene ritrovato: viene ritrovato il suo orologio, sul fondo
 * della piscina svuotata per l'inverno, fermo su un'ora che non torna.
 */

export const orologioSommerso = {
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
  victim,
  roles,
  locations,
  objects,
  witnesses,
  clues,
  secrets,
  objectives,
  abilities,
  events,
  motiveOptions,
  methodOptions,
  beats,
  variants: [variantFratello, variantDebitoSaldato, variantFotografiaSbagliata],
  texts,
} satisfies CaseDef;
