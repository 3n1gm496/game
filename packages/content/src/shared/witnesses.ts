import type { WitnessDef } from '@meridien/engine';

/**
 * Il personale del Méridien. Compare in tutti e tre i casi come testimone
 * interrogabile: è la voce costante dell'albergo. Ogni caso riassegna i
 * `locationId` e ogni variante scrive le battute.
 */

export const WITNESS_CAST: Record<string, Omit<WitnessDef, 'locationId'>> = {
  'wit.bramante': {
    id: 'wit.bramante',
    name: 'Tullio Bramante',
    role: 'Portiere di notte',
    portrait: 'portrait-03',
    voice:
      'Sessantun anni, trentaquattro dietro al bancone. Dà del lei a chiunque, non finisce le frasi che potrebbero compromettere qualcuno e chiama tutti «signore» anche quando li disprezza.',
    topics: ['registro', 'chiavi', 'telefono', 'orari', 'ospiti'],
  },
  'wit.coldani': {
    id: 'wit.coldani',
    name: 'Nives Coldani',
    role: 'Governante ai piani',
    portrait: 'portrait-11',
    voice:
      'Quarantaquattro anni, conta le lenzuola come conta le bugie. Parla per constatazioni, non per opinioni. Se una cosa non l\'ha vista, lo dice subito.',
    topics: ['camere', 'biancheria', 'pulizie', 'rumori', 'passaggio'],
  },
  'wit.pesce': {
    id: 'wit.pesce',
    name: 'Gualtiero Pesce',
    role: 'Capocuoco',
    portrait: 'portrait-02',
    voice:
      'Cinquantadue anni e una voce che arriva in sala. Generoso, rumoroso, distratto su tutto ciò che non si mangia. Ricorda gli orari solo in rapporto alle portate.',
    topics: ['cucina', 'servizio', 'bicchieri', 'personale', 'cena'],
  },
  'wit.ottonello': {
    id: 'wit.ottonello',
    name: 'Marisa Ottonello',
    role: 'Centralinista',
    portrait: 'portrait-09',
    voice:
      'Ventisette anni, parla piano perché è abituata alle cuffie. Ricorda i numeri e gli orari con precisione assoluta, i volti quasi per niente.',
    topics: ['telefonate', 'centralino', 'linea', 'messaggi', 'orari'],
  },
  'wit.bacigalupo': {
    id: 'wit.bacigalupo',
    name: 'Renzo Bacigalupo',
    role: 'Elettricista e tuttofare',
    portrait: 'portrait-12',
    voice:
      'Trentotto anni, poche parole. Le sue risposte sono quasi sempre orari e numeri di quadro. Non aggiunge mai un commento a un fatto.',
    topics: ['corrente', 'quadro', 'ascensore', 'manutenzione', 'blackout'],
  },
};

/** Aiuto per comporre il cast di un caso assegnando gli ambienti. */
export function witnessesAt(assignments: Record<string, string>): WitnessDef[] {
  return Object.entries(assignments).map(([id, locationId]) => {
    const base = WITNESS_CAST[id];
    if (!base) throw new Error(`testimone sconosciuto: ${id}`);
    return { ...base, locationId };
  });
}
