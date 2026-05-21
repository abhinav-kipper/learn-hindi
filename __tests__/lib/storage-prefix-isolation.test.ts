/**
 * Regression tests for storage prefix isolation between Hindi and Dutch.
 *
 * These cover the class of bugs where Dutch progress/vocab leaked into
 * Hindi storage keys (or vice versa) when the prefix parameter was
 * accidentally omitted or hardcoded.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  getProgress,
  markLessonComplete,
  isLessonComplete,
} from '@/lib/progress'
import {
  markWordLearned,
  isWordLearned,
} from '@/lib/vocabulary'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    _dump: () => ({ ...store }),
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

// ─────────────────────────────────────────────
// Progress prefix isolation
// ─────────────────────────────────────────────

describe('progress storage prefix isolation', () => {
  beforeEach(() => localStorage.clear())

  it('marks hindi lesson complete under hindi-progress key', () => {
    markLessonComplete('greetings', 'hindi')
    const raw = localStorageMock._dump()
    expect(raw['hindi-progress']).toBeDefined()
    expect(raw['dutch-progress']).toBeUndefined()
  })

  it('marks dutch lesson complete under dutch-progress key', () => {
    markLessonComplete('dutch-lesson-1', 'dutch')
    const raw = localStorageMock._dump()
    expect(raw['dutch-progress']).toBeDefined()
    expect(raw['hindi-progress']).toBeUndefined()
  })

  it('hindi and dutch completed lessons are fully independent', () => {
    markLessonComplete('greetings', 'hindi')
    markLessonComplete('dutch-lesson-1', 'dutch')

    expect(isLessonComplete('greetings', 'hindi')).toBe(true)
    expect(isLessonComplete('greetings', 'dutch')).toBe(false)

    expect(isLessonComplete('dutch-lesson-1', 'dutch')).toBe(true)
    expect(isLessonComplete('dutch-lesson-1', 'hindi')).toBe(false)
  })

  it('getProgress with dutch prefix does not see hindi data', () => {
    markLessonComplete('greetings', 'hindi')
    markLessonComplete('shopping', 'hindi')

    const dutchProgress = getProgress('dutch')
    expect(dutchProgress.completedLessons).toEqual([])
  })

  it('getProgress with hindi prefix does not see dutch data', () => {
    markLessonComplete('dutch-lesson-1', 'dutch')

    const hindiProgress = getProgress('hindi')
    expect(hindiProgress.completedLessons).toEqual([])
  })

  it('default prefix is hindi when omitted', () => {
    markLessonComplete('greetings')
    expect(isLessonComplete('greetings', 'hindi')).toBe(true)
    expect(isLessonComplete('greetings', 'dutch')).toBe(false)
  })
})

// ─────────────────────────────────────────────
// Vocabulary learned prefix isolation
// ─────────────────────────────────────────────

describe('vocabulary learned prefix isolation', () => {
  beforeEach(() => localStorage.clear())

  it('marks word learned under correct prefix key', () => {
    markWordLearned('greetings', 'namaste', 'hindi')
    const raw = localStorageMock._dump()
    expect(raw['hindi-vocab-learned']).toBeDefined()
    expect(raw['dutch-vocab-learned']).toBeUndefined()
  })

  it('hindi word learned does not appear under dutch prefix', () => {
    markWordLearned('greetings', 'namaste', 'hindi')
    expect(isWordLearned('greetings', 'namaste', 'dutch')).toBe(false)
  })

  it('hindi and dutch word learned state is independent per word', () => {
    markWordLearned('greetings', 'hallo', 'hindi')

    expect(isWordLearned('greetings', 'hallo', 'hindi')).toBe(true)
    expect(isWordLearned('greetings', 'hallo', 'dutch')).toBe(false)
  })

  it('same word key can be learned independently in both languages', () => {
    markWordLearned('greetings', 'hallo', 'hindi')
    markWordLearned('greetings', 'hallo', 'dutch')

    expect(isWordLearned('greetings', 'hallo', 'hindi')).toBe(true)
    expect(isWordLearned('greetings', 'hallo', 'dutch')).toBe(true)
  })
})
