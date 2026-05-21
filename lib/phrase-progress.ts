import type { Lesson } from '@/types/lesson'
import { getProgress, isLessonComplete } from '@/lib/progress'

type ViewedMap = Record<string, number[]>

function storageKey(prefix: string): string {
  return `${prefix}-phrase-progress`
}

function loadMap(prefix: string): ViewedMap {
  if (typeof window === 'undefined') return {}
  const raw = localStorage.getItem(storageKey(prefix))
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as ViewedMap
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

function saveMap(map: ViewedMap, prefix: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(storageKey(prefix), JSON.stringify(map))
}

export function markPhraseViewed(lessonId: string, phraseIndex: number, prefix = 'hindi'): void {
  const map = loadMap(prefix)
  const existing = map[lessonId] ?? []
  if (!existing.includes(phraseIndex)) {
    map[lessonId] = [...existing, phraseIndex]
    saveMap(map, prefix)
  }
}

export function getViewedPhrases(lessonId: string, prefix = 'hindi'): number[] {
  const map = loadMap(prefix)
  return map[lessonId] ?? []
}

export function getLessonPercent(lesson: Lesson, prefix = 'hindi'): number {
  const progress = getProgress(prefix)
  if (progress.completedLessons.includes(lesson.id)) {
    return 100
  }
  const total = lesson.phrases.length
  if (total === 0) return 0
  const viewed = getViewedPhrases(lesson.id, prefix).length
  return Math.round((viewed / total) * 100)
}

/**
 * Where in the lesson flow should we drop the user when they reopen a lesson?
 *
 * - Untouched / completed → start fresh from the intro (section 0, phrase 0)
 * - Mid-phrases → jump straight to the Phrases section, at the last-viewed
 *   phrase so they can keep going
 * - Saw every phrase but haven't tapped Mark Complete → land on the CTA so
 *   they can finish
 */
export function computeLessonResume(
  lesson: Lesson,
  prefix = 'hindi',
): { sectionIndex: number; phraseIndex: number } {
  const total = lesson.phrases.length
  if (total === 0) return { sectionIndex: 0, phraseIndex: 0 }
  if (isLessonComplete(lesson.id, prefix)) return { sectionIndex: 0, phraseIndex: 0 }

  const viewed = getViewedPhrases(lesson.id, prefix)
  if (viewed.length === 0) return { sectionIndex: 0, phraseIndex: 0 }

  if (viewed.length >= total) {
    return { sectionIndex: 2, phraseIndex: total - 1 }
  }
  return { sectionIndex: 1, phraseIndex: Math.max(...viewed) }
}
