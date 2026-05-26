export const STORIES_READ_KEY = 'learn-hindi:hindi-stories-read'

function read(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORIES_READ_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

function write(ids: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORIES_READ_KEY, JSON.stringify(ids))
}

export function getStoriesRead(): string[] {
  return read()
}

export function isStoryRead(id: string): boolean {
  return read().includes(id)
}

export function markStoryRead(id: string): void {
  const ids = read()
  if (ids.includes(id)) return
  write([...ids, id])
}

export function getStoriesReadCount(): number {
  return read().length
}
