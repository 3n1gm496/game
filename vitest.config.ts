import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/**/src/**/*.test.ts', 'apps/server/src/**/*.test.ts', 'apps/web/src/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/**'],
    environment: 'node',
    globals: false,
    testTimeout: 30_000,
    reporters: ['default'],
  },
  resolve: {
    alias: {
      '@meridien/engine': new URL('./packages/engine/src/index.ts', import.meta.url).pathname,
      '@meridien/content/public': new URL('./packages/content/src/public.ts', import.meta.url).pathname,
      '@meridien/content': new URL('./packages/content/src/index.ts', import.meta.url).pathname,
      '@meridien/ai': new URL('./packages/ai/src/index.ts', import.meta.url).pathname,
    },
  },
});
