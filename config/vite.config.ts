import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

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