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
  /** Days to wait before the next review. */
  interval: number
  /** SM-2 ease factor — multiplier applied to interval on success. */
  easeFactor: number
  /** ISO timestamp of when the phrase is next due, or null if never reviewed. */
  nextReviewAt: string | null
}

interface ReviewRecord {
  phraseId: string
  lastReviewed: string
  correctCount: number
  wrongCount: number
  // SM-2 fields — optional in stored data for backward compatibility.
  // Missing fields are treated as a fresh card (interval 0, ease 2.5, due now).
  interval?: number
  easeFactor?: number
  nextReviewAt?: string
}

// SM-2 lite tuning. Conservative caps so cards still cycle through within
// a normal review schedule even when the user is consistent.
const DEFAULT_EASE = 2.5
const MIN_EASE = 1.3
const WRONG_EASE_PENALTY = 0.85
const MAX_INTERVAL_DAYS = 60

const DAY_MS = 24 * 60 * 60 * 1000

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

/**
 * Compute the next SM-2 state given the previous interval/ease and a review
 * outcome. Exported so tests (and future analytics) can verify the curve.
 */
export function computeNextSchedule(
  prevInterval: number,
  prevEase: number,
  correct: boolean,
  now: Date = new Date(),
): { interval: number; easeFactor: number; nextReviewAt: string } {
  let interval: number
  let easeFactor: number

  if (correct) {
    // First success: 1 day. Second: 6 days. After that, multiply by ease.
    if (prevInterval <= 0) {
      interval = 1
    } else if (prevInterval < 6) {
      interval = 6
    } else {
      interval = Math.round(prevInterval * prevEase)
    }
    interval = Math.min(interval, MAX_INTERVAL_DAYS)
    easeFactor = prevEase
  } else {
    // Wrong: reset interval to 1 day and dock ease.
    interval = 1
    easeFactor = Math.max(MIN_EASE, prevEase * WRONG_EASE_PENALTY)
  }

  const nextReviewAt = new Date(now.getTime() + interval * DAY_MS).toISOString()
  return { interval, easeFactor, nextReviewAt }
}

export function markReviewed(phraseId: string, correct: boolean, prefix = 'hindi'): void {
  const records = getReviewRecords(prefix)
  const existing = records[phraseId] || {
    phraseId,
    lastReviewed: '',
    correctCount: 0,
    wrongCount: 0,
    interval: 0,
    easeFactor: DEFAULT_EASE,
  }

  const prevInterval = existing.interval ?? 0
  const prevEase = existing.easeFactor ?? DEFAULT_EASE
  const schedule = computeNextSchedule(prevInterval, prevEase, correct)

  existing.lastReviewed = new Date().toISOString()
  if (correct) existing.correctCount += 1
  else existing.wrongCount += 1
  existing.interval = schedule.interval
  existing.easeFactor = schedule.easeFactor
  existing.nextReviewAt = schedule.nextReviewAt

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
      interval: 0,
      easeFactor: DEFAULT_EASE,
      nextReviewAt: null,
    }))
  }

  const records = getReviewRecords(prefix)
  const now = Date.now()
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
        interval: record?.interval ?? 0,
        easeFactor: record?.easeFactor ?? DEFAULT_EASE,
        nextReviewAt: record?.nextReviewAt || null,
      })
    })
  }

  // SM-2 scheduling: due cards first (overdue first), then never-reviewed,
  // then earliest-due, then mastered cards last.
  const sorted = allPhrases.sort((a, b) => {
    const aDue = a.nextReviewAt && new Date(a.nextReviewAt).getTime() <= now
    const bDue = b.nextReviewAt && new Date(b.nextReviewAt).getTime() <= now
    if (aDue && !bDue) return -1
    if (!aDue && bDue) return 1

    // Among due cards: more overdue first.
    if (aDue && bDue) {
      return new Date(a.nextReviewAt!).getTime() - new Date(b.nextReviewAt!).getTime()
    }

    // Never reviewed comes before scheduled-future cards.
    if (!a.nextReviewAt && b.nextReviewAt) return -1
    if (a.nextReviewAt && !b.nextReviewAt) return 1

    // Among scheduled-future: earlier due first.
    if (a.nextReviewAt && b.nextReviewAt) {
      return new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime()
    }

    // Neither has been reviewed — break ties on wrong-ratio so any wrong
    // attempts surface before never-touched cards.
    const aWrongRatio = a.wrongCount / (a.correctCount + a.wrongCount + 1)
    const bWrongRatio = b.wrongCount / (b.correctCount + b.wrongCount + 1)
    return bWrongRatio - aWrongRatio
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
