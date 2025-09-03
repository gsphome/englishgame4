import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/englishgame4/',
  publicDir: 'public',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [{
          urlPattern: /\.json$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'learning-content',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
            }
          }
        }]
      },
      manifest: {
        name: 'English Learning App',
        short_name: 'EnglishApp',
        description: 'Complete English Learning Application',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: 'terser',
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('zustand') || id.includes('zod')) {
              return 'vendor-utils';
            }
            if (id.includes('@tanstack')) {
              return 'vendor-query';
            }
            return 'vendor-misc';
          }
          
          // Learning components - separate chunks for each
          if (id.includes('/components/learning/')) {
            if (id.includes('QuizComponent')) return 'learning-quiz';
            if (id.includes('FlashcardComponent')) return 'learning-flashcard';
            if (id.includes('CompletionComponent')) return 'learning-completion';
            if (id.includes('SortingComponent')) return 'learning-sorting';
            if (id.includes('MatchingComponent')) return 'learning-matching';
          }
          
          // UI components
          if (id.includes('/components/ui/')) {
            return 'ui-components';
          }
          
          // Stores and hooks
          if (id.includes('/stores/') || id.includes('/hooks/')) {
            return 'app-logic';
          }
          
          // Utils
          if (id.includes('/utils/')) {
            return 'app-utils';
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    open: false,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    },
  },
  preview: {
    port: 4173,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    },
  },
})