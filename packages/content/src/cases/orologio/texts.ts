import type { CaseTexts } from '@meridien/engine';

/** Testi del caso: introduzione, scoperta, atti, verdetto, voce del Maggiordomo. */

export const texts: CaseTexts = {
  intro:
    'Il 4 ottobre il Grand Hotel Méridien chiude la stagione. Le sedie della terrazza sono già impilate, il bar del molo ha servito l’ultima cena e la piscina è stata svuotata nel pomeriggio: tre metri di piastrelle azzurre e la griglia di scarico al centro. Alle 21:20 il libeccio si mette a spingere e la pensilina comincia a cantare. Elio Vanzetti, che i rotocalchi chiamano «il pesce d’argento», esce sulla terrazza alle 22:50 con la cerata sulle spalle. Non rientra dalla porta a vetri. Alle 23:20 il direttore la chiude a chiave, come ogni sera di temporale, e non guarda fuori.',
  discovery:
    'È Bacigalupo a trovarlo, all’una meno un quarto, mentre controlla la griglia di scarico con la torcia. Non un uomo: un orologio. Cassa d’acciaio, cinturino slacciato, appoggiato in fondo alla vasca vuota come se qualcuno ce lo avesse posato. È fermo sulle 23:47. A quell’ora la porta della terrazza era chiusa da ventisette minuti, e un orologio garantito duecento metri non si ferma cadendo di tre.',
  actIntros: {
    1: 'Atto I. Il mare è nero e la strada per Alassio è franata al chilometro quattro. Nove persone in una hall di marmo e ottone, e un orologio che segna un’ora in cui nessuno era dove dice di essere stato. Si comincia da ciò che si vede.',
    2: 'Atto II. Il vento gira e la scaletta del molo torna praticabile. La lampada rossa della camera oscura si è spenta. Ciò che nel primo atto sembrava un dettaglio di servizio — una cima riannodata, una posa mancante, una ricevuta con il numero sbagliato — comincia a chiedere un nome.',
    3: 'Atto III. La pattuglia di Alassio ha superato la frana e sale. Restano pochi minuti per mettere in fila le tre spiegazioni possibili e scartarne due. Il corpo non c’è: ci sono soltanto le ore, e le ore qualcuno le ha spostate.',
  },
  verdictIntro:
    'Il registro è aperto sul bancone. Ognuno indichi un nome, una ragione e un modo. Non serve avere ragione su tutto: serve avere ragione insieme. Chi ha spostato l’ora conta su di voi per non accorgervene.',
  butlerWelcome: [
    'Buonasera. Sono Adalberto, e stanotte l’albergo parla con la mia voce. La stagione chiude comunque: con o senza di noi.',
    'La strada è franata alle 20:10 e la linea cade a intermittenza. Nessuno arriva, nessuno parte. È una condizione scomoda per gli ospiti e comoda per chi indaga.',
    'La direzione mi incarica di ricordarvi che la terrazza è chiusa e che la vasca è vuota. Ciò che è stato trovato in fondo alla vasca, invece, la direzione preferisce non commentare.',
    'Vi chiedo una cortesia: dite ciò che avete visto, non ciò che avete pensato. Al Méridien la differenza si è sempre pagata cara.',
  ],
};
