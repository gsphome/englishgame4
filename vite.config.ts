import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Control flag for cache logging
const ENABLE_CACHE_LOGS = process.env.VITE_ENABLE_CACHE_LOGS === 'true'

export default defineConfig({
  base: '/englishgame4/',
  publicDir: 'public',
  // Optimize dependencies to avoid initialization issues
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'zustand',
      '@tanstack/react-query',
      'lucide-react'
    ],
    // Force pre-bundling to avoid runtime issues
    force: true,
  },
  // Ensure proper module resolution
  esbuild: {
    // Keep function names for better debugging and avoid initialization issues
    keepNames: true,
    // Preserve legal comments that might be important for module initialization
    legalComments: 'inline',
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
    minify: 'terser',
    chunkSizeWarningLimit: 1000, // Increase to 1MB to allow larger chunks and avoid module initialization issues
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug'],
      },
      mangle: {
        // Preserve function names to avoid initialization issues
        keep_fnames: true,
      },
    },
    rollupOptions: {
      output: {
        // Simplified chunking strategy to avoid module initialization issues
        manualChunks: (id) => {
          // Keep React and React-DOM together to avoid initialization issues
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // Keep all other vendor libraries in a single chunk to maintain initialization order
            return 'vendor';
          }
          
          // Keep all application code in fewer chunks to maintain proper initialization order
          if (id.includes('/stores/') || id.includes('/hooks/')) {
            return 'app-state';
          }
          
          if (id.includes('/components/')) {
            return 'app-components';
          }
          
          if (id.includes('/utils/')) {
            return 'app-utils';
          }
        },
        // Preserve module format to avoid initialization issues
        format: 'es',
        // Optimize asset naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') ?? [];
          const extType = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType ?? '')) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(extType ?? '')) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        // Preserve module initialization order
        preserveModules: false,
        // Ensure proper hoisting
        hoistTransitiveImports: false,
      },
      // Preserve entry order to avoid initialization issues
      preserveEntrySignatures: 'strict',
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