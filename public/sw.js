// Service Worker for Bolna Seekho - Hindi/Dutch Learning App
//
// Two jobs:
//   1. Notifications — click actions + future server-side push (unchanged).
//   2. Offline caching — make the PWA load and work without internet.
//
// Caching strategy (all GET only; POST like /api/chat is never touched):
//   /_next/static/*           cache-first   (content-hashed, immutable)
//   /audio,/chaina,/stroopwafel cache-first (pre-generated mp3 clips)
//   /api/tts                  cache-first   (deterministic per text+lang, capped)
//   navigations (HTML)        network-first → cached page → /offline.html
//   other same-origin GET     stale-while-revalidate
//   /api/chat, /api/pronounce network-only  (real-time LLM, must stay fresh)
//
// Bump CACHE_VERSION to invalidate every cache on the next deploy.

const CACHE_VERSION = 'v1'
const STATIC_CACHE = `bs-static-${CACHE_VERSION}` // hashed _next assets, icons, misc GETs
const AUDIO_CACHE = `bs-audio-${CACHE_VERSION}` // pre-generated mp3 clips
const TTS_CACHE = `bs-tts-${CACHE_VERSION}` // /api/tts responses
const PAGE_CACHE = `bs-pages-${CACHE_VERSION}` // navigation HTML fallback

const OFFLINE_URL = '/offline.html'
const PRECACHE_URLS = [OFFLINE_URL, '/manifest.json', '/icon.svg']

// Keep the TTS cache from growing without bound (phrases are deterministic so
// they accumulate forever otherwise). FIFO trim on each insert.
const TTS_MAX_ENTRIES = 300

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => {/* precache best-effort; don't block install */})
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  const keep = new Set([STATIC_CACHE, AUDIO_CACHE, TTS_CACHE, PAGE_CACHE])
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('bs-') && !keep.has(k))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  )
})

// ---------------------------------------------------------------------------
// Fetch routing
// ---------------------------------------------------------------------------

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Cache API only stores GET. Let POST/PUT (chat, pronounce) pass straight through.
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Only manage our own origin. Anything cross-origin passes through untouched
  // (fonts are self-hosted by next/font under /_next/static, so none expected).
  if (url.origin !== self.location.origin) return

  // Real-time AI endpoints must never be served stale.
  if (url.pathname === '/api/chat' || url.pathname === '/api/pronounce') return

  // TTS proxy: same text+lang always yields the same audio → cache-first.
  if (url.pathname === '/api/tts') {
    event.respondWith(cacheFirst(request, TTS_CACHE, TTS_MAX_ENTRIES))
    return
  }

  // Pre-generated mascot/lesson/sfx audio clips.
  if (
    url.pathname.startsWith('/audio/') ||
    url.pathname.startsWith('/chaina/') ||
    url.pathname.startsWith('/stroopwafel/')
  ) {
    event.respondWith(cacheFirst(request, AUDIO_CACHE))
    return
  }

  // Immutable, content-hashed build output.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Page navigations: fresh when online, cached page or offline fallback when not.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request))
    return
  }

  // Everything else same-origin (icons, manifest, images, RSC flight payloads).
  event.respondWith(staleWhileRevalidate(request, STATIC_CACHE))
})

// ---------------------------------------------------------------------------
// Strategies
// ---------------------------------------------------------------------------

async function cacheFirst(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached
  try {
    const res = await fetch(request)
    if (res && res.ok) {
      await cache.put(request, res.clone())
      if (maxEntries) trimCache(cacheName, maxEntries)
    }
    return res
  } catch {
    // Offline and never cached. Audio callers (lib/speech.ts) degrade to the
    // browser's speechSynthesis on a failed response, so this stays graceful.
    return Response.error()
  }
}

async function networkFirstPage(request) {
  const cache = await caches.open(PAGE_CACHE)
  try {
    const res = await fetch(request)
    if (res && res.ok) await cache.put(request, res.clone())
    return res
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    const offline = await caches.match(OFFLINE_URL)
    return offline || Response.error()
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const network = fetch(request)
    .then((res) => {
      if (res && res.ok) cache.put(request, res.clone())
      return res
    })
    .catch(() => null)
  return cached || (await network) || Response.error()
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  const overflow = keys.length - maxEntries
  for (let i = 0; i < overflow; i++) {
    await cache.delete(keys[i]) // keys() preserves insertion order → FIFO
  }
}

// ---------------------------------------------------------------------------
// Notifications (unchanged)
// ---------------------------------------------------------------------------

// Push event — placeholder for future server-side push support
self.addEventListener('push', (event) => {
  const body = event.data?.text() ?? 'Time to practice! Keep your streak alive.'
  event.waitUntil(
    self.registration.showNotification('Bolna Seekho 🙏', {
      body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: 'daily-reminder',
      renotify: true,
      actions: [
        { action: 'open', title: 'Start Learning' },
        { action: 'dismiss', title: 'Later' },
      ],
    })
  )
})

// Notification click — focus the app or open a new window
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      return self.clients.openWindow('/')
    })
  )
})
