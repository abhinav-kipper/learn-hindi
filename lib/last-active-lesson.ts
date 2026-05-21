/**
 * Tracks the most recently touched lesson per language so the home page can
 * surface a "Continue …" affordance and the practice page knows what to
 * resume into.
 *
 * Bumped on:
 *   - Phrase viewed (section-phrases.tsx)
 *   - Practice message sent (practice/[id]/page.tsx)
 */

function storageKey(prefix: string): string {
  return `${prefix}-last-active-lesson`
}

export function setLastActiveLesson(lessonId: string, prefix = 'hindi'): void {
  if (typeof window === 'undefined') return
  if (!lessonId) return
  localStorage.setItem(storageKey(prefix), lessonId)
}

export function getLastActiveLesson(prefix = 'hindi'): string | null {
  if (typeof window === 'undefined') return null
  const v = localStorage.getItem(storageKey(prefix))
  return v && v.length > 0 ? v : null
}

export function clearLastActiveLesson(prefix = 'hindi'): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(storageKey(prefix))
}
