/**
 * Regression tests for Dutch vocabulary category lookup isolation.
 *
 * Covers the bug class where Dutch category IDs (e.g. "dutch-greetings")
 * were passed to the Hindi `getCategory()` instead of `getDutchCategory()`,
 * causing the vocab page to redirect to /vocabulary.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { getCategory, markWordLearned, isWordLearned } from '@/lib/vocabulary'
import {
  getDutchCategory,
  getDutchAllCategories,
  markDutchWordLearned,
  isDutchWordLearned,
  getDutchLearnedCountForCategory,
} from '@/lib/dutch/vocabulary'

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

describe('Dutch category lookup isolation', () => {
  it('Dutch category IDs are not found by Hindi getCategory()', () => {
    const dutchCategories = getDutchAllCategories()
    for (const cat of dutchCategories) {
      expect(getCategory(cat.id)).toBeUndefined()
    }
  })

  it('getDutchCategory() returns undefined for Hindi category IDs', () => {
    // Hindi category IDs don't start with "dutch-"
    expect(getDutchCategory('greetings')).toBeUndefined()
    expect(getDutchCategory('everyday')).toBeUndefined()
    expect(getDutchCategory('food')).toBeUndefined()
  })

  it('getDutchCategory() resolves Dutch category IDs correctly', () => {
    const dutchCategories = getDutchAllCategories()
    expect(dutchCategories.length).toBeGreaterThan(0)
    for (const cat of dutchCategories) {
      expect(getDutchCategory(cat.id)).toBeDefined()
      expect(getDutchCategory(cat.id)?.id).toBe(cat.id)
    }
  })

  it('Dutch category has words', () => {
    const cat = getDutchAllCategories()[0]
    expect(cat.words.length).toBeGreaterThan(0)
  })
})

describe('Dutch vocab learned state storage', () => {
  beforeEach(() => localStorage.clear())

  it('stores under dutch-vocab-learned key, not hindi-vocab-learned', () => {
    const cat = getDutchAllCategories()[0]
    const word = cat.words[0].hindi
    markDutchWordLearned(cat.id, word)

    const raw = localStorageMock._dump()
    expect(raw['dutch-vocab-learned']).toBeDefined()
    expect(raw['hindi-vocab-learned']).toBeUndefined()
  })

  it('isDutchWordLearned returns true after marking', () => {
    const cat = getDutchAllCategories()[0]
    const word = cat.words[0].hindi
    markDutchWordLearned(cat.id, word)
    expect(isDutchWordLearned(cat.id, word)).toBe(true)
  })

  it('isDutchWordLearned returns false for unlearned word', () => {
    const cat = getDutchAllCategories()[0]
    const word = cat.words[0].hindi
    expect(isDutchWordLearned(cat.id, word)).toBe(false)
  })

  it('does not double-count repeated markDutchWordLearned calls', () => {
    const cat = getDutchAllCategories()[0]
    const word = cat.words[0].hindi
    markDutchWordLearned(cat.id, word)
    markDutchWordLearned(cat.id, word)
    expect(getDutchLearnedCountForCategory(cat.id)).toBe(1)
  })

  it('Dutch learned words are independent from Hindi learned words', () => {
    const cat = getDutchAllCategories()[0]
    const word = cat.words[0].hindi

    markWordLearned(cat.id, word, 'hindi')
    expect(isDutchWordLearned(cat.id, word)).toBe(false)

    markDutchWordLearned(cat.id, word)
    expect(isWordLearned(cat.id, word, 'hindi')).toBe(true)
    expect(isDutchWordLearned(cat.id, word)).toBe(true)
  })
})
