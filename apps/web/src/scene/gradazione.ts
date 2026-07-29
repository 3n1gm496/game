import { Filter, GlProgram } from 'pixi.js';

/**
 * La gradazione: un solo passaggio che dà alla scena il suo colore.
 *
 * Prima di questo filtro ogni ambiente usciva com'era stato disegnato — tinte
 * piatte, contrasto uniforme, bordi netti. È il motivo principale per cui il
 * gioco sembrava fatto da un programma: nella fotografia e nel cinema nessuna
 * immagine arriva allo spettatore senza essere passata da una gradazione.
 *
 * Quello che fa, nell'ordine in cui la luce lo farebbe:
 *
 * 1. **aberrazione cromatica** crescente verso i bordi — è il difetto di una
 *    lente vera, e in dose omeopatica è ciò che distingue «fotografato» da
 *    «renderizzato»;
 * 2. **curva di contrasto** a S, che chiude i neri e trattiene le alte luci;
 * 3. **viraggio separato**: ombre verso il blu della pioggia, luci verso
 *    l'ambra dell'ottone. È la regola della luce del Méridien resa in numeri —
 *    una sorgente calda dominante, tutto il resto è riflesso freddo;
 * 4. **saturazione** governata, perché la palette è di otto tinte e devono
 *    restare quelle;
 * 5. **vignettatura** ellittica, che tiene lo sguardo al centro;
 * 6. **grana** animata a scatti di pellicola, non a 60 fotogrammi: la grana
 *    che scorre fluida è rumore digitale, quella che salta è pellicola.
 *
 * Tutto in un passaggio solo: sei filtri in fila costerebbero sei letture
 * dell'intero schermo, e su un telefono si vedrebbe.
 */

const VERTICE = `#version 300 es
in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 posizione(void) {
  vec2 p = aPosition * uOutputFrame.zw + uOutputFrame.xy;
  p.x = p.x * (2.0 / uOutputTexture.x) - 1.0;
  p.y = p.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
  return vec4(p, 0.0, 1.0);
}

void main(void) {
  gl_Position = posizione();
  vTextureCoord = aPosition * (uOutputFrame.zw * uInputSize.zw);
}
`;

const FRAMMENTO = `#version 300 es
precision highp float;

in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform vec4 uInputSize;

uniform float uTempo;
uniform float uGrana;
uniform float uVignetta;
uniform float uAberrazione;
uniform float uForza;
uniform float uSaturazione;
uniform float uProporzione;
uniform vec3 uOmbra;
uniform vec3 uLuce;

/* Pixi lavora con alfa premoltiplicato: per toccare il colore va sciolto. */
vec3 sciogli(vec4 c) {
  return c.a > 0.0001 ? c.rgb / c.a : c.rgb;
}

float rumore(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main(void) {
  vec2 uv = vTextureCoord;
  vec2 scarto = uv - vec2(0.5);
  float raggio = length(vec2(scarto.x * uProporzione, scarto.y));

  vec4 sorgente = texture(uTexture, uv);
  float alfa = sorgente.a;

  /* 1 — aberrazione: rosso e blu scivolano in direzioni opposte */
  vec2 slittamento = scarto * uAberrazione * raggio;
  vec3 colore = vec3(
    sciogli(texture(uTexture, uv + slittamento)).r,
    sciogli(sorgente).g,
    sciogli(texture(uTexture, uv - slittamento)).b
  );

  /* 2 — curva di contrasto */
  vec3 morbida = clamp(colore, 0.0, 1.0);
  colore = mix(colore, morbida * morbida * (3.0 - 2.0 * morbida), 0.38);

  /* 3 — viraggio separato fra ombre e luci */
  float luminanza = dot(colore, vec3(0.2126, 0.7152, 0.0722));
  vec3 virata = mix(uOmbra, uLuce, smoothstep(0.05, 0.85, luminanza));
  colore = mix(colore, colore * virata, uForza);

  /* 4 — saturazione governata */
  luminanza = dot(colore, vec3(0.2126, 0.7152, 0.0722));
  colore = mix(vec3(luminanza), colore, uSaturazione);

  /* 5 — vignettatura */
  float chiusura = smoothstep(0.86, 0.22, raggio);
  colore *= mix(1.0, chiusura, uVignetta);

  /* 6 — grana, a scatti */
  if (uGrana > 0.0) {
    vec2 seme = uv * uInputSize.xy * 0.5 + vec2(uTempo * 71.0, uTempo * 113.0);
    colore += (rumore(seme) - 0.5) * uGrana;
  }

  finalColor = vec4(clamp(colore, 0.0, 1.0) * alfa, alfa);
}
`;

export interface OpzioniGradazione {
  /** quantità di grana: 0 la spegne */
  grana: number;
  vignetta: number;
  aberrazione: number;
  /** quanto pesa il viraggio, 0…1 */
  forza: number;
  saturazione: number;
}

/**
 * Il viraggio del Méridien.
 *
 * Moltiplicatori, non colori: le ombre perdono rosso e guadagnano blu, le luci
 * fanno il contrario. Sono i due estremi fra cui il filtro interpola secondo la
 * luminanza del pixel.
 */
const OMBRA_FREDDA: readonly [number, number, number] = [0.84, 0.94, 1.2];
const LUCE_CALDA: readonly [number, number, number] = [1.16, 1.03, 0.79];

export class Gradazione {
  readonly filtro: Filter;
  private tempo = 0;

  constructor(opzioni: OpzioniGradazione) {
    this.filtro = new Filter({
      glProgram: GlProgram.from({ vertex: VERTICE, fragment: FRAMMENTO, name: 'gradazione' }),
      resources: {
        gradazione: {
          uTempo: { value: 0, type: 'f32' },
          uGrana: { value: opzioni.grana, type: 'f32' },
          uVignetta: { value: opzioni.vignetta, type: 'f32' },
          uAberrazione: { value: opzioni.aberrazione, type: 'f32' },
          uForza: { value: opzioni.forza, type: 'f32' },
          uSaturazione: { value: opzioni.saturazione, type: 'f32' },
          uProporzione: { value: 1, type: 'f32' },
          uOmbra: { value: new Float32Array(OMBRA_FREDDA), type: 'vec3<f32>' },
          uLuce: { value: new Float32Array(LUCE_CALDA), type: 'vec3<f32>' },
        },
      },
    });
  }

  private get uniformi(): Record<string, number> {
    return (this.filtro.resources.gradazione as { uniforms: Record<string, number> }).uniforms;
  }

  /**
   * Avanza la grana. Il tempo viene arrotondato a quattordici scatti al
   * secondo: è la cadenza della pellicola, e costa meno di ridisegnare il
   * rumore a ogni fotogramma.
   */
  avanza(deltaMs: number): void {
    this.tempo += deltaMs / 1000;
    this.uniformi.uTempo = Math.floor(this.tempo * 14) / 14;
  }

  proporzione(larghezza: number, altezza: number): void {
    this.uniformi.uProporzione = altezza > 0 ? larghezza / altezza : 1;
  }

  regola(opzioni: Partial<OpzioniGradazione>): void {
    const u = this.uniformi;
    if (opzioni.grana !== undefined) u.uGrana = opzioni.grana;
    if (opzioni.vignetta !== undefined) u.uVignetta = opzioni.vignetta;
    if (opzioni.aberrazione !== undefined) u.uAberrazione = opzioni.aberrazione;
    if (opzioni.forza !== undefined) u.uForza = opzioni.forza;
    if (opzioni.saturazione !== undefined) u.uSaturazione = opzioni.saturazione;
  }

  distruggi(): void {
    this.filtro.destroy();
  }
}
