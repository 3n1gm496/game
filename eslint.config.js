import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

/**
 * Configurazione ESLint del monorepo.
 *
 * Oltre alle regole standard, `no-placeholder` è una regola locale che
 * impedisce a segnaposti, TODO e lorem ipsum di sopravvivere in un commit:
 * è il presidio automatico del requisito «nessun placeholder».
 */

const noPlaceholder = {
  rules: {
    'no-placeholder': {
      meta: {
        type: 'problem',
        docs: { description: 'Vieta TODO, FIXME, segnaposti e lorem ipsum nel codice.' },
        schema: [],
        messages: {
          trovato: 'Segnaposto non ammesso nel prodotto finito: «{{ testo }}».',
        },
      },
      create(context) {
        const vietati = [
          /\bTODO\b/,
          /\bFIXME\b/,
          /\bXXX\b/,
          /\bHACK\b/,
          /\bplaceholder\b/i,
          /\blorem ipsum\b/i,
          /\bda implementare\b/i,
          /\bnon implementato\b/i,
          /\bcoming soon\b/i,
        ];
        const controlla = (nodo, testo) => {
          for (const re of vietati) {
            const trovato = re.exec(testo);
            if (trovato) {
              context.report({ node: nodo, messageId: 'trovato', data: { testo: trovato[0] } });
              return;
            }
          }
        };
        return {
          Program() {
            for (const commento of context.sourceCode.getAllComments()) {
              controlla(commento, commento.value);
            }
          },
          Literal(nodo) {
            if (typeof nodo.value === 'string') controlla(nodo, nodo.value);
          },
          TemplateElement(nodo) {
            controlla(nodo, nodo.value.raw);
          },
        };
      },
    },
  },
};

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/dist-types/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
      'apps/web/public/**',
      'apps/ios/**',
      '**/*.tsbuildinfo',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    plugins: { meridien: noPlaceholder },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.es2023 },
    },
    rules: {
      'meridien/no-placeholder': 'error',
      'no-console': 'off',
      eqeqeq: ['error', 'smart'],
      'no-var': 'error',
      'prefer-const': 'error',
      'object-shorthand': 'error',
      'no-implicit-coercion': ['error', { boolean: false }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },

  // client: ambiente browser e regole degli hook
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-restricted-globals': ['error', { name: 'event', message: 'Usa il parametro dell’evento.' }],
    },
  },

  // service worker: contesto proprio
  {
    files: ['apps/web/public/sw.js'],
    languageOptions: { globals: { ...globals.serviceworker } },
  },

  // test: qualche libertà in più
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**', 'tests/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'meridien/no-placeholder': 'off',
    },
  },

  // script Node
  {
    files: ['scripts/**/*.mjs', '*.config.js', '*.config.ts'],
    languageOptions: { globals: { ...globals.node } },
    rules: { '@typescript-eslint/no-unused-vars': 'off' },
  },

  // questo file elenca per forza i termini che vieta agli altri
  {
    files: ['eslint.config.js'],
    rules: { 'meridien/no-placeholder': 'off' },
  },
);
