export const STORAGE_KEY = 'learn-hindi:seen-lesson-ids:hindi'

function safeWindow(): Window | null {
  return typeof window === 'undefined' ? null : window
}

function readSet(): Set<string> | null {
  const w = safeWindow()
  if (!w) return null
  const raw = w.localStorage.getItem(STORAGE_KEY)
  if (raw === null) return null
  try {
    const arr = JSON.parse(raw) as string[]
    return new Set(arr)
  } catch {
    return new Set()
  }
}

function writeSet(set: Set<string>): void {
  const w = safeWindow()
  if (!w) return
  w.localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
}

export function isInitialized(): boolean {
  const w = safeWindow()
  if (!w) return false
  return w.localStorage.getItem(STORAGE_KEY) !== null
}

export function initBaseline(allCurrentIds: string[]): void {
  if (isInitialized()) return
  writeSet(new Set(allCurrentIds))
}

export function markAsSeen(id: string): void {
  const set = readSet() ?? new Set<string>()
  set.add(id)
  writeSet(set)
}

export function getUnseenIds(allCurrentIds: string[]): string[] {
  const set = readSet()
  if (set === null) return []
  return allCurrentIds.filter((id) => !set.has(id))
}

export function hasBeenSeen(id: string): boolean {
  const set = readSet()
  if (set === null) return false
  return set.has(id)
}

export function unseeIds(ids: string[]): void {
  const set = readSet()
  if (set === null) return
  ids.forEach((id) => set.delete(id))
  writeSet(set)
}
