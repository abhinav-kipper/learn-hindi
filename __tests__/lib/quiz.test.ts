import { describe, it, expect, beforeEach } from 'vitest'
import { generateQuiz } from '@/lib/quiz'

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

describe('generateQuiz', () => {
  beforeEach(() => localStorage.clear())

  it('returns lesson-only questions when no vocab has been explored', () => {
    const questions = generateQuiz(['greetings'], 10)
    expect(questions.length).toBeGreaterThan(0)
    for (const q of questions) {
      expect(q.source ?? 'phrase').toBe('phrase')
    }
  })

  it('mixes ~30% vocab questions when enough vocab is explored', () => {
    localStorage.setItem('hindi-vocab-learned', JSON.stringify({
      everyday: ['accha', 'theek', 'bas', 'bilkul', 'zaroor'],
    }))

    const questions = generateQuiz(['greetings'], 10)
    const vocabCount = questions.filter(q => q.source === 'vocab').length
    expect(vocabCount).toBeGreaterThanOrEqual(1)
    expect(vocabCount).toBeLessThanOrEqual(3)
  })

  it('falls back to phrases-only when fewer than 3 vocab words are explored', () => {
    localStorage.setItem('hindi-vocab-learned', JSON.stringify({
      everyday: ['accha', 'theek'],
    }))

    const questions = generateQuiz(['greetings'], 10)
    for (const q of questions) {
      expect(q.source ?? 'phrase').toBe('phrase')
    }
  })

  it('never emits fill-in-blank for vocab source', () => {
    localStorage.setItem('hindi-vocab-learned', JSON.stringify({
      everyday: ['accha', 'theek', 'bas', 'bilkul', 'zaroor'],
    }))

    const questions = generateQuiz(['greetings'], 10)
    for (const q of questions) {
      if (q.source === 'vocab') {
        expect(q.type).not.toBe('fill-in-blank')
      }
    }
  })

  it('returns empty array when no lessons match', () => {
    const questions = generateQuiz(['nonexistent-lesson'], 10)
    expect(questions).toEqual([])
  })
})
