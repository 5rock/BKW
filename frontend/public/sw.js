/**
 * Service Worker — GoldMarket PWA
 * Strategy:
 *   - Static assets (JS/CSS/fonts): Cache-first (long TTL)
 *   - Images: Stale-while-revalidate (serve cache, update in background)
 *   - API: Network-first with 3s timeout fallback to cache
 *   - HTML: Network-first (always fresh)
 */

const CACHE_NAME = 'goldmarket-v1';
const STATIC_CACHE = 'goldmarket-static-v1';
const IMAGE_CACHE = 'goldmarket-images-v1';
const API_CACHE = 'goldmarket-api-v1';

const STATIC_EXTENSIONS = /\.(js|css|woff2?|ttf|otf|eot)$/;
const IMAGE_EXTENSIONS = /\.(webp|avif|png|jpg|jpeg|gif|svg|ico)$/;
const API_PATTERN = /\/api\//;

// ── Install: pre-cache app shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(['/'])
    )
  );
});

// ── Activate: clean old caches
self.addEventListener('activate', (event) => {
  const CURRENT_CACHES = new Set([CACHE_NAME, STATIC_CACHE, IMAGE_CACHE, API_CACHE]);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !CURRENT_CACHES.has(key))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch strategy routing
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin && !url.hostname.includes('unsplash.com') && !url.hostname.includes('fonts.g')) return;

  // API: Network-first with cache fallback
  if (API_PATTERN.test(url.pathname)) {
    event.respondWith(networkFirst(request, API_CACHE, 3000));
    return;
  }

  // Images: Stale-while-revalidate
  if (IMAGE_EXTENSIONS.test(url.pathname) || url.hostname.includes('unsplash.com')) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    return;
  }

  // Static assets: Cache-first
  if (STATIC_EXTENSIONS.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML navigation: Network-first
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, CACHE_NAME, 5000));
  }
});

// ── Strategies

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkFetch = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  return cached || networkFetch;
}

async function networkFirst(request, cacheName, timeoutMs) {
  const cache = await caches.open(cacheName);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timer);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    clearTimeout(timer);
    const cached = await cache.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}
