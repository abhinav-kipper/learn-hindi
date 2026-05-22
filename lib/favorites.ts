import type { Phrase } from '@/types/lesson'

export interface FavoritePhrase {
  lessonId: string
  hindi: string
  english: string
  pronunciation?: string
  context?: string
  addedAt: number
}

function storageKey(prefix: string): string {
  return `${prefix}-favorites`
}

function load(prefix: string): FavoritePhrase[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(storageKey(prefix))
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as FavoritePhrase[]) : []
  } catch {
    return []
  }
}

function save(list: FavoritePhrase[], prefix: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(storageKey(prefix), JSON.stringify(list))
}

function keyFor(lessonId: string, hindi: string): string {
  return `${lessonId}::${hindi}`
}

export function getFavorites(prefix = 'hindi'): FavoritePhrase[] {
  return load(prefix).sort((a, b) => b.addedAt - a.addedAt)
}

export function isFavorite(lessonId: string, hindi: string, prefix = 'hindi'): boolean {
  return load(prefix).some(f => keyFor(f.lessonId, f.hindi) === keyFor(lessonId, hindi))
}

/** Toggle and return the new favorited state. */
export function toggleFavorite(phrase: Phrase, lessonId: string, prefix = 'hindi'): boolean {
  const list = load(prefix)
  const k = keyFor(lessonId, phrase.hindi)
  const idx = list.findIndex(f => keyFor(f.lessonId, f.hindi) === k)
  if (idx >= 0) {
    list.splice(idx, 1)
    save(list, prefix)
    return false
  }
  list.push({
    lessonId,
    hindi: phrase.hindi,
    english: phrase.english,
    pronunciation: phrase.pronunciation,
    context: phrase.context,
    addedAt: Date.now(),
  })
  save(list, prefix)
  return true
}

export function removeFavorite(lessonId: string, hindi: string, prefix = 'hindi'): void {
  const list = load(prefix).filter(f => keyFor(f.lessonId, f.hindi) !== keyFor(lessonId, hindi))
  save(list, prefix)
}
