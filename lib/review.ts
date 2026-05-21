import { Phrase } from '@/types/lesson'
import { getAllContent } from '@/lib/lessons'
import { getDutchAllContent } from '@/lib/dutch/lessons'
import { getProgress } from '@/lib/progress'

export interface ReviewPhrase {
  phraseId: string
  lessonId: string
  phrase: Phrase
  lastReviewed: string | null
  correctCount: number
  wrongCount: number
}

interface ReviewRecord {
  phraseId: string
  lastReviewed: string
  correctCount: number
  wrongCount: number
}

function reviewKey(prefix: string): string {
  return `${prefix}-review-data`
}

function sessionsKey(prefix: string): string {
  return `${prefix}-review-sessions`
}

function getAllContentFor(prefix: string) {
  return prefix === 'dutch' ? getDutchAllContent() : getAllContent()
}

function getReviewRecords(prefix: string): Record<string, ReviewRecord> {
  if (typeof window === 'undefined') return {}
  const stored = localStorage.getItem(reviewKey(prefix))
  if (!stored) return {}
  try {
    return JSON.parse(stored) as Record<string, ReviewRecord>
  } catch {
    return {}
  }
}

function saveReviewRecords(records: Record<string, ReviewRecord>, prefix: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(reviewKey(prefix), JSON.stringify(records))
}

export function markReviewed(phraseId: string, correct: boolean, prefix = 'hindi'): void {
  const records = getReviewRecords(prefix)
  const existing = records[phraseId] || { phraseId, lastReviewed: '', correctCount: 0, wrongCount: 0 }

  existing.lastReviewed = new Date().toISOString()
  if (correct) {
    existing.correctCount += 1
  } else {
    existing.wrongCount += 1
  }

  records[phraseId] = existing
  saveReviewRecords(records, prefix)
}

export function getReviewPhrases(count: number, prefix = 'hindi'): ReviewPhrase[] {
  const progress = getProgress(prefix)
  const lessons = getAllContentFor(prefix)
  const completedLessons = lessons.filter(l => progress.completedLessons.includes(l.id))

  if (completedLessons.length === 0) {
    // Default to first lesson if none completed
    const firstLesson = lessons[0]
    if (!firstLesson) return []
    return firstLesson.phrases.slice(0, count).map((phrase, i) => ({
      phraseId: `${firstLesson.id}-${i}`,
      lessonId: firstLesson.id,
      phrase,
      lastReviewed: null,
      correctCount: 0,
      wrongCount: 0,
    }))
  }

  const records = getReviewRecords(prefix)
  const allPhrases: ReviewPhrase[] = []

  for (const lesson of completedLessons) {
    lesson.phrases.forEach((phrase, index) => {
      const phraseId = `${lesson.id}-${index}`
      const record = records[phraseId]
      allPhrases.push({
        phraseId,
        lessonId: lesson.id,
        phrase,
        lastReviewed: record?.lastReviewed || null,
        correctCount: record?.correctCount || 0,
        wrongCount: record?.wrongCount || 0,
      })
    })
  }

  // Prioritize: wrong answers > not reviewed recently > older lessons > already mastered
  const sorted = allPhrases.sort((a, b) => {
    // Phrases user got wrong more should come first
    const aWrongRatio = a.wrongCount / (a.correctCount + a.wrongCount + 1)
    const bWrongRatio = b.wrongCount / (b.correctCount + b.wrongCount + 1)
    if (aWrongRatio !== bWrongRatio) return bWrongRatio - aWrongRatio

    // Never reviewed comes before reviewed
    if (!a.lastReviewed && b.lastReviewed) return -1
    if (a.lastReviewed && !b.lastReviewed) return 1

    // Less recently reviewed first
    if (a.lastReviewed && b.lastReviewed) {
      return new Date(a.lastReviewed).getTime() - new Date(b.lastReviewed).getTime()
    }

    // Mastered phrases (3+ correct) come last
    if (a.correctCount >= 3 && b.correctCount < 3) return 1
    if (b.correctCount >= 3 && a.correctCount < 3) return -1

    return 0
  })

  return sorted.slice(0, count)
}

export interface ReviewSession {
  date: string
  reviewed: number
  gotIt: number
}

export function saveReviewSession(reviewed: number, gotIt: number, prefix = 'hindi'): void {
  if (typeof window === 'undefined') return
  const sessions = getReviewSessions(prefix)
  sessions.push({ date: new Date().toISOString(), reviewed, gotIt })
  const trimmed = sessions.slice(-50)
  localStorage.setItem(sessionsKey(prefix), JSON.stringify(trimmed))
}

export function getReviewSessions(prefix = 'hindi'): ReviewSession[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(sessionsKey(prefix))
  if (!stored) return []
  try {
    return JSON.parse(stored) as ReviewSession[]
  } catch {
    return []
  }
}
