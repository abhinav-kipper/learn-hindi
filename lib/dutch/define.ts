// Client-side word-definition cache for the cheatsheets. Tapping a Dutch term
// asks the existing /api/define route (the same beginner dictionary behind
// /dutch/lookup) and remembers the answer, so repeat taps are instant and work
// offline once seen. Failures degrade to "no definition" and never throw.

import { addLookup } from '@/lib/dutch/lookups'

export const DEFINE_CACHE_KEY = 'dutch-define-cache'
/** Plenty for a reading session, small enough to stay well inside localStorage. */
export const DEFINE_CACHE_MAX = 300

export interface Definition {
  found: boolean
  word: string
  article: string
  partOfSpeech: string
  translation: string
  meaning: string
  example: string
  example_en: string
  otherSenses?: { translation: string; note: string }[]
}

/** Cache key: trimmed, lower-cased, punctuation-insensitive at the edges. */
export function cacheKey(term: string): string {
  return term.trim().toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}?!.]+$/gu, '')
}

type CacheMap = Record<string, Definition>

// In-memory layer so a page full of terms doesn't hit localStorage repeatedly.
let memo: CacheMap | null = null

function readCache(): CacheMap {
  if (memo) return memo
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(DEFINE_CACHE_KEY)
    memo = raw ? (JSON.parse(raw) as CacheMap) : {}
  } catch {
    memo = {}
  }
  return memo
}

function writeCache(map: CacheMap): void {
  memo = map
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(DEFINE_CACHE_KEY, JSON.stringify(map))
  } catch {
    // Quota or private mode: the in-memory layer still serves this session.
  }
}

export function getCachedDefinition(term: string): Definition | undefined {
  const k = cacheKey(term)
  if (!k) return undefined
  return readCache()[k]
}

export function cacheDefinition(term: string, def: Definition): void {
  const k = cacheKey(term)
  if (!k) return
  const map = { ...readCache() }
  map[k] = def
  // Trim oldest-inserted keys once over the cap. Insertion order is preserved
  // by JSON round-trips for string keys, which is good enough for an LRU-ish cap.
  const keys = Object.keys(map)
  if (keys.length > DEFINE_CACHE_MAX) {
    for (const old of keys.slice(0, keys.length - DEFINE_CACHE_MAX)) delete map[old]
  }
  writeCache(map)
}

/** Test seam: drop the in-memory layer so the next read re-parses localStorage. */
export function resetDefineCache(): void {
  memo = null
}

/**
 * The dictionary answers single words and short phrases. A whole example
 * sentence would only produce noise, so those are not looked up: the sheet
 * still shows the gloss the content already carries, and speaks the sentence.
 */
export const MAX_LOOKUP_WORDS = 5

export function shouldLookUp(term: string): boolean {
  const t = term.trim()
  if (!t) return false
  return t.split(/\s+/).length <= MAX_LOOKUP_WORDS
}

export type DefineResult =
  | { status: 'ok'; definition: Definition }
  | { status: 'notfound' }
  | { status: 'unavailable' }

/**
 * Look a term up, cache-first. Never throws: a network or API failure comes back
 * as 'unavailable' so the sheet can still show the term and speak it aloud.
 */
export async function defineTerm(term: string): Promise<DefineResult> {
  const cached = getCachedDefinition(term)
  if (cached) return cached.found ? { status: 'ok', definition: cached } : { status: 'notfound' }

  const word = term.trim()
  if (!word) return { status: 'notfound' }
  if (!shouldLookUp(word)) return { status: 'notfound' }

  try {
    const res = await fetch('/api/define', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word, language: 'dutch' }),
    })
    if (!res.ok) return { status: 'unavailable' }
    const data = (await res.json()) as Definition
    if (!data) return { status: 'unavailable' }
    cacheDefinition(term, data)
    if (data.found) {
      // Feed the same recent-lookups history the Word Lookup page shows.
      addLookup(
        {
          word: data.word,
          translation: data.translation,
          article: data.article,
          ts: new Date().toISOString(),
        },
        'dutch',
      )
      return { status: 'ok', definition: data }
    }
    return { status: 'notfound' }
  } catch {
    return { status: 'unavailable' }
  }
}

// ── Splitting a content cell into individually tappable Dutch terms ──────────

/**
 * Split a table cell into the Dutch terms it actually contains, so a cell like
 * "de opa / de grootvader" or "blond, bruin, zwart" becomes several tappable
 * terms instead of one useless blob.
 *
 * Rules, in order:
 *  - always split on "/" (it separates alternatives)
 *  - split multi-sentence cells on sentence boundaries
 *  - split on commas ONLY when every piece is a single word, so a list splits
 *    but "Sorry, dan kan ik niet." stays whole
 *
 * Returns alternating term / separator pieces so the original punctuation and
 * spacing can be rendered back verbatim.
 */
export interface CellPiece {
  text: string
  term: boolean
}

export function splitCell(cell: string): CellPiece[] {
  const out: CellPiece[] = []

  const pushTerm = (raw: string) => {
    if (!raw) return
    const lead = raw.match(/^\s*/)?.[0] ?? ''
    const tail = raw.match(/\s*$/)?.[0] ?? ''
    const core = raw.slice(lead.length, raw.length - tail.length)
    if (lead) out.push({ text: lead, term: false })
    if (core) out.push({ text: core, term: /[\p{L}]/u.test(core) })
    if (tail) out.push({ text: tail, term: false })
  }

  // 1. slashes
  const bySlash = cell.split('/')
  bySlash.forEach((chunk, i) => {
    if (i > 0) out.push({ text: '/', term: false })

    // 2. sentence boundaries, keeping the punctuation on the sentence
    const sentences = chunk.match(/[^.!?]+[.!?]+\s*|[^.!?]+$/g) ?? [chunk]
    const multi = sentences.filter((s) => s.trim()).length > 1

    for (const sentence of sentences) {
      if (!sentence) continue
      if (multi) {
        pushTerm(sentence)
        continue
      }
      // 3. commas, only for pure word lists
      const parts = sentence.split(',')
      const wordList =
        parts.length > 1 && parts.every((p) => p.trim() && !/\s/.test(p.trim().replace(/[.!?]+$/, '')))
      if (!wordList) {
        pushTerm(sentence)
        continue
      }
      parts.forEach((p, j) => {
        if (j > 0) out.push({ text: ',', term: false })
        pushTerm(p)
      })
    }
  })

  return out.filter((p) => p.text.length > 0)
}
