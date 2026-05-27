export function storageKey(prefix: string): string {
  return `${prefix}-vocab-archived`
}

function read(prefix: string): string[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(storageKey(prefix))
  if (raw === null) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

function write(prefix: string, items: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(storageKey(prefix), JSON.stringify(items))
}

export function getArchived(prefix: string): string[] {
  return read(prefix)
}

export function addArchived(prefix: string, hindi: string): void {
  const items = read(prefix)
  if (items.includes(hindi)) return
  items.push(hindi)
  write(prefix, items)
}

export function removeArchived(prefix: string, hindi: string): void {
  const items = read(prefix)
  const next = items.filter((w) => w !== hindi)
  if (next.length === items.length) return
  write(prefix, next)
}

export function isArchived(prefix: string, hindi: string): boolean {
  return read(prefix).includes(hindi)
}

const LEGACY_KNOWN_KEY = 'vocab-known'

export function migrateLegacyKnown(prefix: string): void {
  if (typeof window === 'undefined') return
  const raw = localStorage.getItem(LEGACY_KNOWN_KEY)
  if (raw === null) return
  let legacy: string[] = []
  try {
    const parsed = JSON.parse(raw)
    legacy = Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return
  }
  for (const word of legacy) {
    addArchived(prefix, word)
  }
}
