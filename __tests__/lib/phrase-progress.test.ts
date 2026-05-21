import { describe, it, expect, beforeEach } from 'vitest'
import {
  markPhraseViewed,
  getViewedPhrases,
  getLessonPercent,
} from '@/lib/phrase-progress'
import type { Lesson } from '@/types/lesson'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

function makeLesson(id: string, phraseCount: number): Lesson {
  return {
    id,
    title: 'Test',
    situation: 'test',
    skills: [],
    phrases: Array.from({ length: phraseCount }, (_, i) => ({
      hindi: `h${i}`,
      english: `e${i}`,
      context: `c${i}`,
      pronunciation: `p${i}`,
    })),
    grammar_notes: [],
    culture_notes: [],
    skill_breakdown: [],
    practice_prompt: '',
  }
}

describe('phrase-progress', () => {
  beforeEach(() => localStorage.clear())

  it('records viewed phrase indices', () => {
    markPhraseViewed('greetings', 0)
    markPhraseViewed('greetings', 2)
    expect(getViewedPhrases('greetings').sort()).toEqual([0, 2])
  })

  it('deduplicates repeated views', () => {
    markPhraseViewed('greetings', 1)
    markPhraseViewed('greetings', 1)
    markPhraseViewed('greetings', 1)
    expect(getViewedPhrases('greetings')).toEqual([1])
  })

  it('isolates progress per lesson', () => {
    markPhraseViewed('greetings', 0)
    markPhraseViewed('food', 0)
    markPhraseViewed('food', 1)
    expect(getViewedPhrases('greetings')).toEqual([0])
    expect(getViewedPhrases('food').sort()).toEqual([0, 1])
  })

  it('returns empty array for unknown lesson', () => {
    expect(getViewedPhrases('never-seen')).toEqual([])
  })

  it('getLessonPercent computes from viewed phrases', () => {
    const lesson = makeLesson('greetings', 10)
    markPhraseViewed('greetings', 0)
    markPhraseViewed('greetings', 1)
    markPhraseViewed('greetings', 2)
    expect(getLessonPercent(lesson)).toBe(30)
  })

  it('getLessonPercent returns 100 if lesson is in completedLessons (back-compat)', () => {
    localStorage.setItem('hindi-progress', JSON.stringify({
      completedLessons: ['greetings'],
      currentStreak: 0,
      lastActiveDate: '',
      practiceSessionCount: 0,
    }))
    const lesson = makeLesson('greetings', 10)
    expect(getLessonPercent(lesson)).toBe(100)
  })

  it('getLessonPercent returns 0 for unseen, incomplete lesson', () => {
    const lesson = makeLesson('greetings', 10)
    expect(getLessonPercent(lesson)).toBe(0)
  })

  it('getLessonPercent rounds to nearest integer', () => {
    const lesson = makeLesson('greetings', 3)
    markPhraseViewed('greetings', 0)
    expect(getLessonPercent(lesson)).toBe(33)
  })
})
