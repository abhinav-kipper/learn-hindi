import type { Lesson } from '@/types/lesson'
import { getProgress } from '@/lib/progress'

const STORAGE_KEY = 'hindi-phrase-progress'

type ViewedMap = Record<string, number[]>

function loadMap(): ViewedMap {
  if (typeof window === 'undefined') return {}
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as ViewedMap
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

function saveMap(map: ViewedMap): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export function markPhraseViewed(lessonId: string, phraseIndex: number): void {
  const map = loadMap()
  const existing = map[lessonId] ?? []
  if (!existing.includes(phraseIndex)) {
    map[lessonId] = [...existing, phraseIndex]
    saveMap(map)
  }
}

export function getViewedPhrases(lessonId: string): number[] {
  const map = loadMap()
  return map[lessonId] ?? []
}

export function getLessonPercent(lesson: Lesson): number {
  const progress = getProgress()
  if (progress.completedLessons.includes(lesson.id)) {
    return 100
  }
  const total = lesson.phrases.length
  if (total === 0) return 0
  const viewed = getViewedPhrases(lesson.id).length
  return Math.round((viewed / total) * 100)
}
