import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['**/*.test.ts', '**/*.test.tsx', 'utils/**/*.test.ts'],
    exclude: ['node_modules', 'dist', '.next', 'tests/e2e/**'],
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      all: false,
      include: ['components/**/*.tsx', 'utils/**/*.ts', 'app/api/**/*.ts'],
      exclude: [
        'node_modules/',
        'dist/',
        '.next/',
        'tests/e2e/**',
        '**/*.config.*',
        '**/types/**',
        '**/*.d.ts',
        '**/*.test.tsx',
        '**/*.test.ts',
      ],
      thresholds: {
        lines: 50,
        functions: 20,
        branches: 20,
        statements: 50,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
