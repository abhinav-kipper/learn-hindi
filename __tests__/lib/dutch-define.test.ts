import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  splitCell,
  cacheKey,
  cacheDefinition,
  getCachedDefinition,
  resetDefineCache,
  defineTerm,
  shouldLookUp,
  DEFINE_CACHE_KEY,
  type Definition,
} from '@/lib/dutch/define'

const store: Record<string, string> = {}
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v
    },
    removeItem: (k: string) => {
      delete store[k]
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k]
    },
  },
  writable: true,
})

const def = (word: string, translation = 'x'): Definition => ({
  found: true,
  word,
  article: 'de',
  partOfSpeech: 'noun',
  translation,
  meaning: 'a meaning',
  example: 'Een zin.',
  example_en: 'A sentence.',
})

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k]
  resetDefineCache()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('splitCell', () => {
  it('keeps a plain single term whole', () => {
    expect(splitCell('de vader').map((p) => p.text)).toEqual(['de vader'])
  })

  it('splits alternatives on a slash and keeps the slash as plain text', () => {
    const pieces = splitCell('de opa / de grootvader')
    expect(pieces.filter((p) => p.term).map((p) => p.text)).toEqual(['de opa', 'de grootvader'])
    expect(pieces.map((p) => p.text).join('')).toBe('de opa / de grootvader')
  })

  it('splits a list of single words on commas', () => {
    const terms = splitCell('blond, bruin, zwart').filter((p) => p.term).map((p) => p.text)
    expect(terms).toEqual(['blond', 'bruin', 'zwart'])
  })

  // The important half of the comma rule: a sentence with a comma must not split.
  it('leaves a comma inside a sentence alone', () => {
    const terms = splitCell('Sorry, dan kan ik niet.').filter((p) => p.term).map((p) => p.text)
    expect(terms).toEqual(['Sorry, dan kan ik niet.'])
  })

  it('splits a multi-sentence cell per sentence', () => {
    const terms = splitCell('Hij is lang. Zij is klein.').filter((p) => p.term).map((p) => p.text)
    expect(terms).toEqual(['Hij is lang.', 'Zij is klein.'])
  })

  it('never loses or reorders any character', () => {
    for (const cell of [
      'de opa / de grootvader',
      'blond, bruin, zwart, rood',
      'Hij is lang. Zij is klein. Hij is kaal.',
      "'s ochtends / 's morgens",
      'Ik heb twee broers.',
    ]) {
      expect(splitCell(cell).map((p) => p.text).join('')).toBe(cell)
    }
  })

  it('marks punctuation-only pieces as non-terms', () => {
    const pieces = splitCell('a / b')
    expect(pieces.find((p) => p.text === '/')?.term).toBe(false)
  })
})

describe('definition cache', () => {
  it('normalizes the cache key', () => {
    expect(cacheKey('  De Vader  ')).toBe('de vader')
    expect(cacheKey('"hoi"')).toBe('hoi')
  })

  it('round-trips through localStorage', () => {
    cacheDefinition('de vader', def('de vader', 'the father'))
    resetDefineCache()
    expect(getCachedDefinition('De Vader')?.translation).toBe('the father')
    expect(store[DEFINE_CACHE_KEY]).toBeTruthy()
  })

  it('survives corrupt stored data', () => {
    store[DEFINE_CACHE_KEY] = 'not json'
    resetDefineCache()
    expect(getCachedDefinition('iets')).toBeUndefined()
  })
})

describe('defineTerm', () => {
  it('serves a cached hit without touching the network', async () => {
    cacheDefinition('kaas', def('kaas', 'cheese'))
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const r = await defineTerm('kaas')
    expect(r).toEqual({ status: 'ok', definition: expect.objectContaining({ translation: 'cheese' }) })
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('fetches, caches and reports ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => def('brood', 'bread') }),
    )
    const r = await defineTerm('brood')
    expect(r.status).toBe('ok')
    expect(getCachedDefinition('brood')?.translation).toBe('bread')
  })

  // Offline must degrade quietly: the sheet still shows the term and speaks it.
  it('reports unavailable when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    expect(await defineTerm('iets')).toEqual({ status: 'unavailable' })
  })

  it('reports unavailable on a non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }))
    expect(await defineTerm('iets')).toEqual({ status: 'unavailable' })
  })

  it('reports notfound when the dictionary has no entry', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ...def('zzz'), found: false }) }),
    )
    expect((await defineTerm('zzz')).status).toBe('notfound')
  })

  it('does not call out for an empty term', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    expect((await defineTerm('   ')).status).toBe('notfound')
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

describe('shouldLookUp', () => {
  it('looks up single words and short phrases', () => {
    expect(shouldLookUp('kaas')).toBe(true)
    expect(shouldLookUp('de grote fiets')).toBe(true)
    expect(shouldLookUp('Ik heb twee broers.')).toBe(true)
  })

  it('skips whole sentences, which the dictionary cannot answer usefully', () => {
    expect(shouldLookUp('Mijn moeder heet Dorine en zij woont in Amsterdam.')).toBe(false)
    expect(shouldLookUp('   ')).toBe(false)
  })

  it('defineTerm does not call out for a long phrase', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const long = 'Mijn moeder heet Dorine en zij woont in Amsterdam.'
    expect((await defineTerm(long)).status).toBe('notfound')
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
