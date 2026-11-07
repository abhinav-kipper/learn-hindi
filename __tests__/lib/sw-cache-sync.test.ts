import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * `lib/offline-cache.ts` writes into the same Cache Storage buckets that
 * `public/sw.js` reads from. If one side's CACHE_VERSION is bumped and the
 * other is not, the warm-up fills caches the service worker never looks at and
 * offline support silently stops working, with nothing failing loudly.
 */
const root = join(__dirname, '..', '..')
const sw = readFileSync(join(root, 'public', 'sw.js'), 'utf8')
const offline = readFileSync(join(root, 'lib', 'offline-cache.ts'), 'utf8')

describe('service worker / offline-cache version sync', () => {
  it('both sides agree on the cache version', () => {
    const swVersion = sw.match(/const CACHE_VERSION = '([^']+)'/)?.[1]
    expect(swVersion, 'CACHE_VERSION in public/sw.js').toBeTruthy()

    const pageCache = offline.match(/const PAGE_CACHE = '([^']+)'/)?.[1]
    const audioCache = offline.match(/const AUDIO_CACHE = '([^']+)'/)?.[1]

    expect(pageCache).toBe(`bs-pages-${swVersion}`)
    expect(audioCache).toBe(`bs-audio-${swVersion}`)
  })

  /**
   * RSC payloads are a page's content, rebuilt on every deploy and not
   * content-hashed. Serving them stale-while-revalidate left installed PWAs
   * showing the previous build's content after a deploy.
   */
  it('serves RSC flight payloads network-first, not stale-while-revalidate', () => {
    expect(sw).toMatch(/_rsc/)
    expect(sw).toMatch(/networkFirstRsc/)

    // The _rsc branch must come before the stale-while-revalidate catch-all,
    // otherwise it never runs.
    const rscIdx = sw.indexOf("searchParams.has('_rsc')")
    const swrIdx = sw.indexOf('staleWhileRevalidate(request, STATIC_CACHE)')
    expect(rscIdx).toBeGreaterThan(-1)
    expect(swrIdx).toBeGreaterThan(-1)
    expect(rscIdx).toBeLessThan(swrIdx)
  })

  it('still activates promptly so a deploy is not stuck behind an old worker', () => {
    expect(sw).toMatch(/skipWaiting\(\)/)
    expect(sw).toMatch(/clients\.claim\(\)/)
  })
})
