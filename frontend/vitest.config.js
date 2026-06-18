import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    exclude: [
      // preserve default excludes and add e2e/playwright files
      ...configDefaults.exclude,
      'e2e/**',
      '**/e2e/**',
      'playwright.config.*',
      '**/*.spec.e2e.*'
    ],
  },
})
