import { defineConfig } from 'vitest/config';

/**
 * Root Vitest config — backend unit tests first.
 * Add a second project (frontend + jsdom) when component tests are introduced.
 */
export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['backend/**/*.test.js', 'frontend/src/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['backend/**/*.js'],
      exclude: [
        '**/node_modules/**',
        '**/*.test.js',
        'backend/index.js',
      ],
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,
      },
    },
  },
});
