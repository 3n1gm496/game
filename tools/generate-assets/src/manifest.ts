import path from 'node:path';
import { readFile } from 'node:fs/promises';
import type { PortraitManifestEntry } from './portraits.js';
import type { SceneManifestEntry } from './scenes.js';
import { ASSETS_DIR, ROOT, listFiles, setCategory, sha256, toPosix, write } from './util.js';

/**
 * Manifesto degli asset: elenco completo dei file su disco con dimensione e
 * checksum, più i metadati delle scene e dei ritratti.
 *
 * Serve a due cose: il caricamento progressivo del client (che sa in anticipo
 * cosa e quanto sta per scaricare) e la verifica d'integrità in fase di
 * collaudo — se un file manca o cambia senza rigenerare, il controllo lo dice.
 */

export interface AssetEntry {
  readonly percorso: string;
  readonly byte: number;
  readonly sha256: string;
}

export interface AssetsManifest {
  readonly versione: number;
  readonly generatoIl: string;
  readonly totale: { file: number; byte: number };
  readonly file: AssetEntry[];
  readonly scene: SceneManifestEntry[];
  readonly ritratti: PortraitManifestEntry[];
  readonly icone: string[];
}

export async function generateManifest(dati: {
  scene: SceneManifestEntry[];
  ritratti: PortraitManifestEntry[];
  icone: string[];
}): Promise<AssetsManifest> {
  setCategory('manifesto');

  const percorsi = (await listFiles(ASSETS_DIR)).filter((p) => !p.endsWith('manifest.json'));

  const file: AssetEntry[] = [];
  let byteTotali = 0;
  for (const assoluto of percorsi) {
    const contenuto = await readFile(assoluto);
    byteTotali += contenuto.byteLength;
    file.push({
      percorso: toPosix(path.relative(ASSETS_DIR, assoluto)),
      byte: contenuto.byteLength,
      sha256: sha256(contenuto).slice(0, 32),
    });
  }

  const manifest: AssetsManifest = {
    versione: 1,
    // data fissa alla giornata: il file non cambia a ogni rigenerazione
    generatoIl: new Date().toISOString().slice(0, 10),
    totale: { file: file.length, byte: byteTotali },
    file,
    scene: dati.scene,
    ritratti: dati.ritratti,
    icone: dati.icone,
  };

  await write(path.join(ASSETS_DIR, 'manifest.json'), JSON.stringify(manifest, null, 1));
  void ROOT;
  return manifest;
}
