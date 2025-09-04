/**
 * Enhanced Service Worker for English Learning App
 * Provides offline support, background sync, and push notifications
 */

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: any;
  addEventListener: (type: string, listener: (event: any) => void) => void;
  registration: any;
  clients: any;
  skipWaiting: () => Promise<void>;
};

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST);

// Clean up old caches
cleanupOutdatedCaches();

// Cache strategies for different resource types
registerRoute(
  ({ request }) => request.destination === 'document',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24, // 1 day
      }),
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
      }),
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  })
);

// Cache learning content with background sync
const bgSyncPlugin = new BackgroundSyncPlugin('learning-data-sync', {
  maxRetentionTime: 24 * 60, // 24 hours
});

registerRoute(
  ({ url }) => url.pathname.includes('/data/') && url.pathname.endsWith('.json'),
  new StaleWhileRevalidate({
    cacheName: 'learning-content',
    plugins: [
      bgSyncPlugin,
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
      }),
    ],
  })
);

// Handle offline fallback
registerRoute(
  ({ request }) => request.mode === 'navigate',
  async ({ event }) => {
    try {
      return await fetch(event.request);
    } catch (error) {
      // Return cached offline page or main app
      const cache = await caches.open('pages');
      const cachedResponse = await cache.match('/englishgame4/');
      return cachedResponse || new Response('Offline - Please check your connection', {
        status: 503,
        statusText: 'Service Unavailable',
      });
    }
  }
);

// Background sync for user progress
self.addEventListener('sync', (event) => {
  if (event.tag === 'user-progress-sync') {
    event.waitUntil(syncUserProgress());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/englishgame4/pwa-192x192.png',
    badge: '/englishgame4/pwa-192x192.png',
    vibrate: [200, 100, 200],
    data: data.data,
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/englishgame4/pwa-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/englishgame4/pwa-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      self.clients.openWindow('/englishgame4/')
    );
  }
});

// Sync user progress when online
async function syncUserProgress(): Promise<void> {
  try {
    // Get stored progress data
    const cache = await caches.open('user-progress');
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('progress-sync')) {
        const response = await cache.match(request);
        if (response) {
          const data = await response.json();
          
          // Attempt to sync with server
          try {
            await fetch('/api/sync-progress', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            });
            
            // Remove from cache after successful sync
            await cache.delete(request);
          } catch (syncError) {
            console.warn('Failed to sync progress:', syncError);
          }
        }
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Handle app updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-progress-sync') {
    event.waitUntil(syncUserProgress());
  }
});

// Install event
self.addEventListener('install', () => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});