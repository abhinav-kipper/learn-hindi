/**
 * Tests for the SM-2 lite scheduling logic in lib/review.ts.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { computeNextSchedule, markReviewed } from '@/lib/review'

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

const DAY_MS = 24 * 60 * 60 * 1000

describe('computeNextSchedule — SM-2 lite curve', () => {
  it('first correct review schedules 1 day out', () => {
    const now = new Date('2026-01-01T00:00:00Z')
    const { interval, nextReviewAt } = computeNextSchedule(0, 2.5, true, now)
    expect(interval).toBe(1)
    expect(new Date(nextReviewAt).getTime() - now.getTime()).toBe(DAY_MS)
  })

  it('second correct review jumps to 6 days', () => {
    const { interval } = computeNextSchedule(1, 2.5, true)
    expect(interval).toBe(6)
  })

  it('subsequent correct reviews multiply by ease factor', () => {
    const { interval } = computeNextSchedule(6, 2.5, true)
    expect(interval).toBe(15) // round(6 * 2.5)
  })

  it('caps interval at 60 days', () => {
    const { interval } = computeNextSchedule(40, 2.5, true)
    expect(interval).toBe(60)
  })

  it('wrong answer resets interval to 1 day', () => {
    const { interval } = computeNextSchedule(15, 2.5, false)
    expect(interval).toBe(1)
  })

  it('wrong answer reduces ease factor by 0.85', () => {
    const { easeFactor } = computeNextSchedule(15, 2.5, false)
    expect(easeFactor).toBeCloseTo(2.125, 3)
  })

  it('ease factor floors at 1.3 after many wrong answers', () => {
    let ease = 2.5
    for (let i = 0; i < 20; i++) {
      const result = computeNextSchedule(1, ease, false)
      ease = result.easeFactor
    }
    expect(ease).toBe(1.3)
  })

  it('correct after wrong keeps reduced ease', () => {
    const wrong = computeNextSchedule(15, 2.5, false)
    expect(wrong.easeFactor).toBeCloseTo(2.125, 3)
    const correct = computeNextSchedule(wrong.interval, wrong.easeFactor, true)
    expect(correct.interval).toBe(6)
    expect(correct.easeFactor).toBeCloseTo(2.125, 3)
  })
})

describe('markReviewed persists schedule fields', () => {
  beforeEach(() => localStorage.clear())

  it('writes interval, easeFactor, nextReviewAt on first correct review', () => {
    markReviewed('greetings-0', true)
    const data = JSON.parse(localStorageMock._dump()['hindi-review-data'])
    const rec = data['greetings-0']
    expect(rec.correctCount).toBe(1)
    expect(rec.interval).toBe(1)
    expect(rec.easeFactor).toBe(2.5)
    expect(rec.nextReviewAt).toBeTruthy()
  })

  it('updates interval on repeated correct reviews', () => {
    markReviewed('greetings-0', true)
    markReviewed('greetings-0', true)
    const data = JSON.parse(localStorageMock._dump()['hindi-review-data'])
    expect(data['greetings-0'].interval).toBe(6)
  })

  it('docks ease and resets interval on wrong', () => {
    markReviewed('greetings-0', true)
    markReviewed('greetings-0', true)
    markReviewed('greetings-0', false)
    const data = JSON.parse(localStorageMock._dump()['hindi-review-data'])
    const rec = data['greetings-0']
    expect(rec.interval).toBe(1)
    expect(rec.easeFactor).toBeCloseTo(2.125, 3)
    expect(rec.wrongCount).toBe(1)
    expect(rec.correctCount).toBe(2)
  })

  it('migrates a record with no SM-2 fields by treating it as fresh', () => {
    // Simulate a record from before the SRS upgrade
    localStorage.setItem('hindi-review-data', JSON.stringify({
      'old-phrase': { phraseId: 'old-phrase', lastReviewed: '2026-01-01T00:00:00Z', correctCount: 3, wrongCount: 1 },
    }))
    markReviewed('old-phrase', true)
    const data = JSON.parse(localStorageMock._dump()['hindi-review-data'])
    const rec = data['old-phrase']
    // First time we see SM-2 fields — should start at interval 1
    expect(rec.interval).toBe(1)
    expect(rec.easeFactor).toBe(2.5)
    expect(rec.correctCount).toBe(4) // preserved
  })
})
