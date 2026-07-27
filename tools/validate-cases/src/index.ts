import { allCases } from '@meridien/content';
import { formatReport, validateCase } from '@meridien/engine';

/**
 * `pnpm validate:cases`
 * Esegue i dieci controlli del validatore su ogni caso e ogni variante.
 * Esce con codice 1 se anche un solo caso presenta errori.
 */

const only = process.argv.find((a) => a.startsWith('--case='))?.split('=')[1];
const cases = allCases().filter((c) => !only || c.id === only || c.id.endsWith(only));

if (cases.length === 0) {
  console.error(`Nessun caso corrisponde a "${only}".`);
  process.exit(1);
}

let failures = 0;
let warnings = 0;

console.log('MÉRIDIEN · validazione dei casi\n');

for (const c of cases) {
  const report = validateCase(c);
  console.log(formatReport(report));
  console.log('');
  if (!report.ok) failures += 1;
  warnings += report.issues.filter((i) => i.severity === 'avviso').length;
}

const summary = `${cases.length} caso/i controllati · ${failures} con errori · ${warnings} avvisi`;
console.log(summary);

if (failures > 0) {
  console.error('\nValidazione fallita.');
  process.exit(1);
}
console.log('Validazione superata.');
