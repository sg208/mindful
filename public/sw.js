// Minimal service worker for Mindful.
// HTML: network-first, falls back to /offline when the network fails.
// Static assets (CSS/JS/fonts/images): stale-while-revalidate.
// Only same-origin, OK, non-redirected responses are cached — opaque and error
// responses must never poison the cache.

const VERSION = 'mindful-v1';
const PAGE_CACHE = `${VERSION}-pages`;
const ASSET_CACHE = `${VERSION}-assets`;
const OFFLINE_URL = '/offline';
const PRECACHE = [OFFLINE_URL, '/favicon.svg', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGE_CACHE);
      // Per-asset so a single missing path (e.g. host without .html rewrites) doesn't fail install.
      await Promise.all(PRECACHE.map((url) => cache.add(url).catch(() => undefined)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Only handle same-origin: cross-origin responses are usually opaque and
  // can't be validated with response.ok, which risks cache poisoning.
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  const destination = request.destination;
  if (['style', 'script', 'font', 'image', 'manifest'].includes(destination)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

function isCacheable(response) {
  return Boolean(
    response && response.ok && response.type === 'basic' && response.redirected === false,
  );
}

async function networkFirst(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await fetch(request);
    if (isCacheable(response)) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const offline = await cache.match(OFFLINE_URL);
    return offline ?? Response.error();
  }
}

async function fetchAndCache(request, cache) {
  try {
    const response = await fetch(request);
    if (isCacheable(response)) cache.put(request, response.clone());
    return response;
  } catch {
    return undefined;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  // Started before the cache check returns so a cached hit still refreshes in the background.
  const network = fetchAndCache(request, cache);
  return cached ?? (await network) ?? Response.error();
}
