import type { ServerMessage } from '@meridien/engine';

/**
 * Il catalogo del caso viaggia una volta sola per collegamento.
 *
 * Ambienti, ruoli, testimoni, moventi e metodi valgono circa ottomila byte su
 * novemila di stato, e a partita iniziata non cambiano mai. Rispedirli a ogni
 * aggiornamento — e gli aggiornamenti arrivano a ogni movimento di ogni
 * giocatore — significa riempire la linea di roba che il client ha già. Su una
 * connessione mobile è la differenza fra un gioco che scorre e uno che arranca.
 *
 * Il filtro tiene da parte quale caso è già stato mandato. Se il padrone di
 * casa ne sceglie un altro, il catalogo riparte per intero.
 *
 * Sta sul singolo collegamento e non sulla stanza perché ogni socket viene
 * servito separatamente: chi entra a metà lobby riceve il catalogo nel primo
 * stato che gli capita, senza bisogno di trattamenti speciali.
 *
 * Nel messaggio alleggerito il campo è **assente**, non `null`: `null` è una
 * risposta piena e significa «nessun caso scelto». Il client distingue i due
 * casi e conserva l'ultimo catalogo ricevuto.
 */
export function creaFiltroCatalogo(): (msg: ServerMessage) => ServerMessage {
  let inviatoPer: string | null = null;

  return (msg) => {
    if (msg.t !== 'state') return msg;

    const caso = msg.state.caseId;
    if (inviatoPer === caso) {
      const { catalog: _giaNoto, ...resto } = msg.state;
      return { ...msg, state: resto };
    }

    inviatoPer = caso;
    return msg;
  };
}
