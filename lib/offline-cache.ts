// Offline warm-up: proactively download the whole app into the SW caches while
// online, so every route works offline (not just ones already visited).
//
// The app is a pure client-side SPA — every page is a 'use client' component
// that reads bundled JSON content. So "works offline" needs three things cached:
//   1. each route's document HTML  (for cold/hard loads)  → PAGE_CACHE
//   2. every JS/CSS chunk the routes reference            → STATIC_CACHE (via SW)
//   3. (optional) the pre-generated "hear it" audio clips → AUDIO_CACHE
//
// We fetch each route's HTML, parse out its /_next/static asset URLs, and fetch
// those too (the service worker stores them cache-first). This is deploy-agnostic
// (no build step) and fully awaitable, so we can show real progress.

import { getAllLessons } from '@/lib/lessons'
import { getAllFoundations } from '@/lib/foundations'
import { getDutchLessons } from '@/lib/dutch/lessons'
import { getDutchFoundations } from '@/lib/dutch/foundations'
import { getAllStories } from '@/lib/stories'
import { getAllCategories } from '@/lib/vocabulary'
import { getStages as getHindiSoundStages } from '@/lib/hindi/pronunciation'
import { getStages as getDutchSoundStages } from '@/lib/dutch/pronunciation'
import { getLezenTexts } from '@/lib/dutch/lezen'
import { getClips } from '@/lib/dutch/luisteren'
import { getDuels } from '@/lib/games'
import { getSentenceGames } from '@/lib/sentence-game'
import hiAudio from '@/content/hi-audio.json'
import nlAudio from '@/content/nl-audio.json'

// Cache names MUST stay in sync with public/sw.js (CACHE_VERSION = 'v2').
const PAGE_CACHE = 'bs-pages-v2'
const AUDIO_CACHE = 'bs-audio-v2'

const STATIC_ROUTES = [
  '/',
  '/quiz',
  '/progress',
  '/settings',
  '/mistakes',
  '/favorites',
  '/learn',
  '/vocabulary',
  '/play',
  '/drill/conjugation',
  '/sounds',
  '/onboarding',
  '/chaina',
  '/dutch/knm',
  '/dutch/knm/drill',
  '/dutch/lezen',
  '/dutch/lezen/mock',
  '/dutch/luisteren',
  '/dutch/luisteren/mock',
  '/dutch/sounds',
]

// Pull ids from a loader, swallowing any failure so one bad loader can't abort
// the whole route list.
function ids(fn: () => Array<{ id?: string }>): string[] {
  try {
    return fn()
      .map((x) => x?.id)
      .filter((x): x is string => typeof x === 'string' && x.length > 0)
  } catch {
    return []
  }
}

/** Every navigable route in the app, derived from bundled content. Deduped. */
export function getAllRoutes(): string[] {
  const lessonIds = [
    ...ids(getAllLessons),
    ...ids(getAllFoundations),
    ...ids(getDutchLessons),
    ...ids(getDutchFoundations),
  ]
  const routes = [
    ...STATIC_ROUTES,
    ...lessonIds.flatMap((id) => [`/lessons/${id}`, `/practice/${id}`]),
    ...ids(getAllStories).map((id) => `/stories/${id}`),
    ...ids(getAllCategories).map((id) => `/vocabulary/${id}`),
    ...ids(getHindiSoundStages).map((id) => `/sounds/${id}`),
    ...ids(getDutchSoundStages).map((id) => `/dutch/sounds/${id}`),
    ...ids(getLezenTexts).map((id) => `/dutch/lezen/${id}`),
    ...ids(getClips).map((id) => `/dutch/luisteren/${id}`),
    ...['hindi', 'dutch'].flatMap((l) => getDuels(l)).map((d) => `/play/duel/${d.id}`),
    ...['hindi', 'dutch'].flatMap((l) => getSentenceGames(l)).map((g) => `/play/sentence/${g.id}`),
  ]
  return [...new Set(routes)]
}

/** Pre-generated "hear it" audio clip URLs for a language. */
export function getAudioUrls(language: 'hindi' | 'dutch'): string[] {
  const map = (language === 'dutch' ? nlAudio : hiAudio) as Record<string, string>
  const dir = language === 'dutch' ? 'nl' : 'hi'
  return [...new Set(Object.values(map).map((file) => `/audio/${dir}/${file}`))]
}

export type WarmPhase = 'pages' | 'assets' | 'audio' | 'done'
export interface WarmProgress {
  phase: WarmPhase
  done: number
  total: number
}
export interface WarmResult {
  pages: number
  assets: number
  audio: number
  failed: number
}

interface WarmOptions {
  audio?: boolean
  language?: 'hindi' | 'dutch'
  signal?: AbortSignal
  onProgress?: (p: WarmProgress) => void
}

// Matches the hashed build assets referenced in a route's HTML.
const ASSET_RE = /\/_next\/static\/[^"'()\s]+?\.(?:js|css|woff2?)/g

// Run `worker` over `items` with bounded concurrency.
async function pool<T>(items: T[], limit: number, worker: (item: T) => Promise<void>): Promise<void> {
  let i = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++
      await worker(items[idx])
    }
  })
  await Promise.all(runners)
}

/**
 * Download the app for offline use. Fetches every route's HTML into PAGE_CACHE,
 * fetches all referenced build assets (the SW caches them), and optionally all
 * audio clips into AUDIO_CACHE. Safe to call repeatedly (idempotent-ish — re-puts
 * are cheap). No-ops when offline or where the Cache API is unavailable.
 */
export async function warmOfflineCache(opts: WarmOptions = {}): Promise<WarmResult> {
  const result: WarmResult = { pages: 0, assets: 0, audio: 0, failed: 0 }
  if (typeof window === 'undefined' || typeof caches === 'undefined') return result
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return result

  const { audio = false, language = 'hindi', signal, onProgress } = opts
  const routes = getAllRoutes()
  const audioUrls = audio ? getAudioUrls(language) : []
  const total = routes.length + audioUrls.length

  const pageCache = await caches.open(PAGE_CACHE)
  const assetUrls = new Set<string>()

  // 1. Documents (+ discover their build assets).
  for (const route of routes) {
    if (signal?.aborted) return result
    try {
      const res = await fetch(route, { credentials: 'same-origin' })
      if (res.ok) {
        const clone = res.clone()
        const html = await res.text()
        await pageCache.put(route, clone)
        for (const m of html.matchAll(ASSET_RE)) assetUrls.add(m[0])
        result.pages++
      } else {
        result.failed++
      }
    } catch {
      result.failed++
    }
    onProgress?.({ phase: 'pages', done: result.pages, total: routes.length })
  }

  // 2. Build assets — fetching routes them through the SW, which caches each
  // /_next/static request cache-first.
  if (!signal?.aborted) {
    const list = [...assetUrls]
    await pool(list, 6, async (url) => {
      if (signal?.aborted) return
      try {
        await fetch(url)
        result.assets++
      } catch {
        result.failed++
      }
      onProgress?.({ phase: 'assets', done: result.assets, total: list.length })
    })
  }

  // 3. Audio (optional, the bulk of the download).
  if (audio && !signal?.aborted) {
    const audioCache = await caches.open(AUDIO_CACHE)
    await pool(audioUrls, 6, async (url) => {
      if (signal?.aborted) return
      try {
        const existing = await audioCache.match(url)
        if (!existing) {
          const res = await fetch(url)
          if (res.ok) await audioCache.put(url, res)
        }
        result.audio++
      } catch {
        result.failed++
      }
      onProgress?.({ phase: 'audio', done: result.audio, total: audioUrls.length })
    })
  }

  onProgress?.({ phase: 'done', done: total, total })
  return result
}

const WARMED_KEY = 'bs-offline-warmed-date'

/** Date-gated background warm-up (pages + assets, no audio). Runs once per day. */
export async function autoWarmOfflineCache(language: 'hindi' | 'dutch'): Promise<void> {
  if (typeof window === 'undefined' || typeof caches === 'undefined') return
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return
  // Respect data-saver mode — the manual Settings button still works.
  const conn = (navigator as unknown as { connection?: { saveData?: boolean } }).connection
  if (conn?.saveData) return
  const today = new Date().toISOString().split('T')[0]
  try {
    if (localStorage.getItem(WARMED_KEY) === today) return
  } catch {
    return
  }
  const res = await warmOfflineCache({ audio: false, language })
  // Only mark done if we actually cached the routes (avoid locking in a failed run).
  if (res.pages > 0 && res.failed < res.pages) {
    try {
      localStorage.setItem(WARMED_KEY, today)
    } catch {
      /* ignore */
    }
  }
}
