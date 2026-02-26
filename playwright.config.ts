import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.spec.ts',
  reporter: [
    ['line'],
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
      },
    ],
  ],
});
