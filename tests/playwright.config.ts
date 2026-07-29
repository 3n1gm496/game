import { defineConfig, devices } from '@playwright/test';

/**
 * Test end-to-end e visual regression.
 *
 * Il server viene avviato da Playwright sulla build di produzione: è lo stesso
 * artefatto che va in rete, non una versione di sviluppo. Ogni giocatore è un
 * **contesto browser separato**, quindi con archiviazione, sessione e socket
 * propri: è multiplayer vero, non quattro finestre che condividono lo stato.
 */
export default defineConfig({
  testDir: '.',
  outputDir: './test-results',
  fullyParallel: false,
  workers: 1,
  timeout: 180_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]] : [['list']],

  use: {
    baseURL: 'http://127.0.0.1:8788',
    trace: 'retain-on-failure',
    video: 'off',
    screenshot: 'only-on-failure',
    locale: 'it-IT',
    timezoneId: 'Europe/Rome',
  },

  webServer: {
    command: 'node apps/server/dist/index.js',
    cwd: '..',
    url: 'http://127.0.0.1:8788/health',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      PORT: '8788',
      HOST: '127.0.0.1',
      NODE_ENV: 'preview',
      STATIC_DIR: 'apps/web/dist',
      MERIDIEN_AI_PROVIDER: 'deterministic',
      LOG_LEVEL: 'warn',
    },
  },

  projects: [
    {
      name: 'partite',
      testMatch: /e2e\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'visivi',
      testMatch: /visual\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
