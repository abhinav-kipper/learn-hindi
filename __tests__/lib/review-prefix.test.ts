/**
 * Regression tests for lib/review.ts prefix isolation.
 *
 * Covers the bug where review data + sessions were Hindi-only — Dutch users
 * never got a daily review and any Dutch reviews would corrupt Hindi data.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  markReviewed,
  saveReviewSession,
  getReviewSessions,
} from '@/lib/review'

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

describe('review storage prefix isolation', () => {
  beforeEach(() => localStorage.clear())

  it('markReviewed writes to hindi-review-data with default prefix', () => {
    markReviewed('greetings-0', true)
    const raw = localStorageMock._dump()
    expect(raw['hindi-review-data']).toBeDefined()
    expect(raw['dutch-review-data']).toBeUndefined()
  })

  it('markReviewed with dutch prefix writes to dutch-review-data', () => {
    markReviewed('dutch-cafe-0', true, 'dutch')
    const raw = localStorageMock._dump()
    expect(raw['dutch-review-data']).toBeDefined()
    expect(raw['hindi-review-data']).toBeUndefined()
  })

  it('hindi and dutch review records are fully independent', () => {
    markReviewed('greetings-0', true, 'hindi')
    markReviewed('greetings-0', false, 'dutch')

    const hindiRaw = JSON.parse(localStorageMock._dump()['hindi-review-data'])
    const dutchRaw = JSON.parse(localStorageMock._dump()['dutch-review-data'])

    expect(hindiRaw['greetings-0'].correctCount).toBe(1)
    expect(hindiRaw['greetings-0'].wrongCount).toBe(0)
    expect(dutchRaw['greetings-0'].correctCount).toBe(0)
    expect(dutchRaw['greetings-0'].wrongCount).toBe(1)
  })

  it('saveReviewSession writes to the prefixed sessions key', () => {
    saveReviewSession(5, 4, 'dutch')
    const raw = localStorageMock._dump()
    expect(raw['dutch-review-sessions']).toBeDefined()
    expect(raw['hindi-review-sessions']).toBeUndefined()
  })

  it('getReviewSessions reads only from the matching prefix', () => {
    saveReviewSession(5, 4, 'hindi')
    saveReviewSession(3, 2, 'dutch')

    const hindiSessions = getReviewSessions('hindi')
    const dutchSessions = getReviewSessions('dutch')

    expect(hindiSessions).toHaveLength(1)
    expect(hindiSessions[0].reviewed).toBe(5)
    expect(dutchSessions).toHaveLength(1)
    expect(dutchSessions[0].reviewed).toBe(3)
  })

  it('default prefix is hindi', () => {
    saveReviewSession(5, 4)
    const raw = localStorageMock._dump()
    expect(raw['hindi-review-sessions']).toBeDefined()
  })
})
