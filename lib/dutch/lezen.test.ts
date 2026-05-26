import { describe, it, expect, beforeEach } from 'vitest'
import {
  getLezenTexts,
  getTextById,
  getTextsByTier,
  drawMockSet,
  scoreMockAttempt,
  saveMockAttempt,
  getMockHistory,
  markTextStudied,
  isStudied,
  getStudiedCount,
  PASS_THRESHOLD,
  MOCK_SIZE,
  QUESTIONS_PER_TEXT,
  MOCK_TIMER_MS,
  STUDIED_KEY,
  MOCK_ATTEMPTS_KEY,
} from './lezen'

beforeEach(() => {
  localStorage.clear()
})

describe('lezen', () => {
  it('loads 10 texts', () => {
    expect(getLezenTexts().length).toBe(10)
  })

  it('every text has bilingual body + 4 bilingual questions', () => {
    for (const t of getLezenTexts()) {
      expect(t.id).toMatch(/^lezen-\d{3}$/)
      expect(['A1','A2','B1']).toContain(t.tier)
      expect(t.body_nl.length).toBeGreaterThan(0)
      expect(t.body_en.length).toBeGreaterThan(0)
      expect(t.questions.length).toBe(QUESTIONS_PER_TEXT)
      for (const q of t.questions) {
        expect(['hoofdgedachte','detail','woordbetekenis','gevolg']).toContain(q.type)
        expect(q.question_nl.length).toBeGreaterThan(0)
        expect(q.question_en.length).toBeGreaterThan(0)
        expect(q.options_nl.length).toBe(4)
        expect(q.options_en.length).toBe(4)
        expect([0,1,2,3]).toContain(q.correct_index)
      }
    }
  })

  it('getTextById returns the matching text', () => {
    expect(getTextById('lezen-001')?.tier).toBe('A1')
    expect(getTextById('lezen-010')?.tier).toBe('B1')
    expect(getTextById('nope')).toBeUndefined()
  })

  it('getTextsByTier filters correctly', () => {
    expect(getTextsByTier('A1').length).toBe(5)
    expect(getTextsByTier('A2').length).toBe(4)
    expect(getTextsByTier('B1').length).toBe(1)
  })

  it('drawMockSet returns MOCK_SIZE unique texts', () => {
    const m = drawMockSet()
    expect(m.length).toBe(MOCK_SIZE)
    const ids = new Set(m.map((t) => t.id))
    expect(ids.size).toBe(MOCK_SIZE)
  })

  it('drawMockSet randomness sanity', () => {
    const a = drawMockSet().map((t) => t.id).join(',')
    const b = drawMockSet().map((t) => t.id).join(',')
    expect(a).not.toBe(b)
  })

  it('scoreMockAttempt counts correct answers across all 20 questions', () => {
    const m = drawMockSet()
    const allCorrect = m.flatMap((t) => t.questions.map((q) => q.correct_index))
    const r = scoreMockAttempt(m, allCorrect)
    expect(r.score).toBe(MOCK_SIZE * QUESTIONS_PER_TEXT)
    expect(r.total).toBe(MOCK_SIZE * QUESTIONS_PER_TEXT)
    expect(r.passed).toBe(true)

    const allWrong = m.flatMap((t) => t.questions.map((q) => ((q.correct_index + 1) % 4) as 0|1|2|3))
    const r2 = scoreMockAttempt(m, allWrong)
    expect(r2.score).toBe(0)
    expect(r2.passed).toBe(false)
  })

  it('PASS_THRESHOLD is 0.8 (80%)', () => {
    expect(PASS_THRESHOLD).toBe(0.8)
  })

  it('MOCK_TIMER_MS is 25 minutes', () => {
    expect(MOCK_TIMER_MS).toBe(25 * 60 * 1000)
  })

  it('saveMockAttempt + getMockHistory persist (most recent first)', () => {
    saveMockAttempt({ ts: 1000, score: 18, total: 20, passed: true, text_ids: ['lezen-001'] })
    saveMockAttempt({ ts: 2000, score: 12, total: 20, passed: false, text_ids: ['lezen-002'] })
    const hist = getMockHistory()
    expect(hist.length).toBe(2)
    expect(hist[0].ts).toBe(2000)
  })

  it('getMockHistory caps at 50', () => {
    for (let i = 0; i < 60; i++) {
      saveMockAttempt({ ts: i, score: 0, total: 20, passed: false, text_ids: [] })
    }
    expect(getMockHistory().length).toBe(50)
  })

  it('markTextStudied + isStudied + getStudiedCount track per-text learning', () => {
    expect(isStudied('lezen-001')).toBe(false)
    expect(getStudiedCount()).toBe(0)
    markTextStudied('lezen-001')
    markTextStudied('lezen-002')
    markTextStudied('lezen-001') // idempotent
    expect(isStudied('lezen-001')).toBe(true)
    expect(getStudiedCount()).toBe(2)
  })
})
