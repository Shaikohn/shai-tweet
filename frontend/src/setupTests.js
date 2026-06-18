import '@testing-library/jest-dom'

// Ensure fetch exists in the test environment; tests will mock it per-case
if (!global.fetch) {
  global.fetch = () => Promise.resolve({ ok: true, json: async () => ({}) })
}
