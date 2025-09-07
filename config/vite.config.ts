import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, '..'),
  base: '/englishgame4/',
  build: {
    outDir: resolve(__dirname, '../dist'),
    emptyOutDir: true
  },
  publicDir: resolve(__dirname, '../public'),
  css: {
    postcss: resolve(__dirname, 'postcss.config.js')
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src')
    }
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
});