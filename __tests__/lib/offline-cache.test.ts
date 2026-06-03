import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getAllRoutes,
  getAudioUrls,
  warmOfflineCache,
  autoWarmOfflineCache,
} from '@/lib/offline-cache'

function setOnLine(value: boolean) {
  Object.defineProperty(navigator, 'onLine', { configurable: true, value })
}

const HTML =
  '<!doctype html><html><head>' +
  '<link rel="stylesheet" href="/_next/static/css/app-1.css"/>' +
  '</head><body>' +
  '<script src="/_next/static/chunks/main-abc.js"></script>' +
  '<script src="/_next/static/chunks/page-xyz.js"></script>' +
  '</body></html>'

let putSpy: ReturnType<typeof vi.fn>
let matchSpy: ReturnType<typeof vi.fn>

beforeEach(() => {
  setOnLine(true)
  localStorage.clear()
  putSpy = vi.fn(async () => {})
  matchSpy = vi.fn(async () => undefined)
  // Minimal Cache API
  ;(globalThis as unknown as { caches: unknown }).caches = {
    open: vi.fn(async () => ({ put: putSpy, match: matchSpy })),
  }
  globalThis.fetch = vi.fn(async () => new Response(HTML, { status: 200 })) as unknown as typeof fetch
})

afterEach(() => {
  setOnLine(true)
  vi.restoreAllMocks()
})

describe('getAllRoutes', () => {
  it('includes core static routes and content-derived dynamic routes', () => {
    const routes = getAllRoutes()
    // core app pages (not just lessons) must be cached so they work offline too
    expect(routes).toContain('/')
    expect(routes).toContain('/progress')
    expect(routes).toContain('/quiz')
    expect(routes).toContain('/mistakes')
    expect(routes).toContain('/favorites')
    expect(routes).toContain('/vocabulary')
    expect(routes).toContain('/settings')
    expect(routes).toContain('/lessons/greetings')
    expect(routes).toContain('/practice/greetings')
    expect(routes).toContain('/lessons/dutch-supermarket')
    expect(routes).toContain('/stories/chai-stall')
    expect(routes).toContain('/dutch/lezen/lezen-001')
    expect(routes).toContain('/dutch/luisteren/luister-001')
  })

  it('has no duplicate routes', () => {
    const routes = getAllRoutes()
    expect(routes.length).toBe(new Set(routes).size)
  })
})

describe('getAudioUrls', () => {
  it('maps hindi clips under /audio/hi and dutch under /audio/nl', () => {
    const hi = getAudioUrls('hindi')
    const nl = getAudioUrls('dutch')
    expect(hi.length).toBeGreaterThan(0)
    expect(hi.every((u) => u.startsWith('/audio/hi/'))).toBe(true)
    expect(nl.every((u) => u.startsWith('/audio/nl/'))).toBe(true)
  })
})

describe('warmOfflineCache', () => {
  it('does nothing when offline', async () => {
    setOnLine(false)
    const res = await warmOfflineCache()
    expect(res.pages).toBe(0)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('caches every route document and fetches discovered build assets', async () => {
    const res = await warmOfflineCache()
    const routeCount = getAllRoutes().length
    expect(res.pages).toBe(routeCount)
    // documents stored in the page cache
    expect(putSpy).toHaveBeenCalled()
    // the 3 unique assets parsed from the HTML get fetched (deduped across routes)
    expect(res.assets).toBe(3)
  })

  it('reports progress and finishes with a done phase', async () => {
    const phases = new Set<string>()
    await warmOfflineCache({ onProgress: (p) => phases.add(p.phase) })
    expect(phases.has('pages')).toBe(true)
    expect(phases.has('done')).toBe(true)
  })

  it('downloads audio when requested', async () => {
    const res = await warmOfflineCache({ audio: true, language: 'hindi' })
    expect(res.audio).toBe(getAudioUrls('hindi').length)
  })
})

describe('autoWarmOfflineCache', () => {
  it('runs once per day (sets a date flag, skips on repeat)', async () => {
    await autoWarmOfflineCache('hindi')
    expect(localStorage.getItem('bs-offline-warmed-date')).not.toBeNull()
    const callsAfterFirst = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length
    await autoWarmOfflineCache('hindi')
    // no new fetches on the second same-day run
    expect((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callsAfterFirst)
  })
})
