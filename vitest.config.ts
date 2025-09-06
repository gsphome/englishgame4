import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/helpers/setup.ts'],
    css: true,
    // Test file patterns - now looks in tests/ directory
    include: [
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}' // Fallback for any remaining tests
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'coverage/',
        'debug-toast-test.js',
        '**/*.md'
      ],
      thresholds: {
        global: {
          branches: 75,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        // Specific thresholds for different areas
        'src/components/': {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        'src/hooks/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/stores/': {
          branches: 85,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/utils/': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
      },
    },
    // Mock browser APIs
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    // Test timeout for debugging
    testTimeout: 10000,
    // Reporter configuration
    reporter: ['verbose', 'json', 'html'],
  },
  resolve: {
    alias: {
      '@': '/src',
      '@tests': '/tests',
    },
  },
});