import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Control flag for cache logging
const ENABLE_CACHE_LOGS = process.env.VITE_ENABLE_CACHE_LOGS === 'true'

export default defineConfig({
  base: '/englishgame4/',
  publicDir: 'public',
  // Minimal optimization to avoid initialization issues
  optimizeDeps: {
    // Let Vite auto-discover dependencies
    force: false,
  },
  // Minimal esbuild configuration
  esbuild: {
    // Keep everything as-is to avoid transformation issues
    keepNames: true,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
        // Control cache logging
        mode: ENABLE_CACHE_LOGS ? 'development' : 'production',
        // Enhanced caching strategies
        runtimeCaching: [
          {
            urlPattern: /\.json$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'learning-content',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ],
        // Skip waiting and claim clients immediately
        skipWaiting: true,
        clientsClaim: true,
        // Clean up old caches
        cleanupOutdatedCaches: true,
        // Suppress logs when disabled
        ...(ENABLE_CACHE_LOGS ? {} : {
          navigateFallback: null,
          navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        })
      },
      manifest: {
        name: 'English Learning App',
        short_name: 'EnglishApp',
        description: 'Complete English Learning Application with offline support',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/englishgame4/',
        scope: '/englishgame4/',
        categories: ['education', 'productivity'],
        lang: 'en',
        icons: [
          {
            src: 'icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Flashcards',
            short_name: 'Flashcards',
            description: 'Start flashcard learning',
            url: '/englishgame4/?mode=flashcard',
            icons: [{ src: 'icon.svg', sizes: '192x192' }]
          },
          {
            name: 'Quiz',
            short_name: 'Quiz',
            description: 'Take a quiz',
            url: '/englishgame4/?mode=quiz',
            icons: [{ src: 'icon.svg', sizes: '192x192' }]
          }
        ]
      },
      // Development options
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 2000, // Increase to 2MB to allow very large chunks
    rollupOptions: {
      output: {
        // NO manual chunking - let Vite handle it automatically
        // This should prevent module initialization order issues
        format: 'es',
        // Simple asset naming
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
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