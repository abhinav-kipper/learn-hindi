// Recent word-lookups history for the Word Lookup feature. Per-language, capped,
// most-recent-first, de-duplicated by word (case-insensitive) so re-looking-up a
// word moves it to the top instead of piling up. Stored under `${prefix}-lookups`.

export interface Lookup {
  word: string
  translation: string
  article?: string
  ts: string
}

const MAX = 24

function storageKey(prefix: string): string {
  return `${prefix}-lookups`
}

export function getLookups(prefix = 'dutch'): Lookup[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(storageKey(prefix))
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Lookup[]) : []
  } catch {
    return []
  }
}

/** Add (or bump to the top) a lookup. Dedupes on the lowercased word, keeps the
 *  newest MAX entries, most-recent-first. Returns the updated list. */
export function addLookup(entry: Lookup, prefix = 'dutch'): Lookup[] {
  if (typeof window === 'undefined') return []
  const word = entry.word.trim()
  if (!word) return getLookups(prefix)
  const key = word.toLowerCase()
  const rest = getLookups(prefix).filter((l) => l.word.trim().toLowerCase() !== key)
  const next = [{ ...entry, word }, ...rest].slice(0, MAX)
  localStorage.setItem(storageKey(prefix), JSON.stringify(next))
  return next
}

export function clearLookups(prefix = 'dutch'): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(storageKey(prefix))
}
