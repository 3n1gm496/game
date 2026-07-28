import { validateCase, formatReport } from './packages/engine/src/validator.js';
import { orologioSommerso } from './packages/content/src/cases/orologio/index.js';
console.log(formatReport(validateCase(orologioSommerso)));
