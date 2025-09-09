import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ command, mode }) => {
  // Load env file from config directory based on mode
  const env = loadEnv(mode, __dirname, '');
  
  return {
    plugins: [react()],
    root: resolve(__dirname, '..'),
    base: env.VITE_APP_BASE_URL || '/',
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
      },
      port: 5173,
      host: true
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },
    envDir: __dirname
  };
});