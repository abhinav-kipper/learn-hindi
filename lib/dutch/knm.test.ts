import { describe, it, expect, beforeEach } from 'vitest'
import {
  getKnmQuestions,
  getQuestionsByCategory,
  drawDrillSet,
  scoreAttempt,
  saveAttempt,
  getAttemptHistory,
  PASS_THRESHOLD,
  DRILL_SIZE,
  ATTEMPTS_KEY,
  LEARNED_KEY,
  markLearned,
  isLearned,
  getLearnedCount,
} from './knm'

beforeEach(() => {
  localStorage.clear()
})

describe('knm', () => {
  it('loads 100 questions', () => {
    expect(getKnmQuestions().length).toBe(100)
  })

  it('every question has all required fields', () => {
    for (const q of getKnmQuestions()) {
      expect(q.id).toMatch(/^knm-\d{3}$/)
      expect(['politiek','werk','onderwijs','wonen','gezondheid','geschiedenis']).toContain(q.category)
      expect(q.options_nl.length).toBe(4)
      expect([0,1,2,3]).toContain(q.correct_index)
      expect(q.question_nl.length).toBeGreaterThan(0)
      expect(q.explanation_en.length).toBeGreaterThan(0)
    }
  })

  it('getQuestionsByCategory filters correctly', () => {
    const politiek = getQuestionsByCategory('politiek')
    expect(politiek.length).toBeGreaterThan(0)
    politiek.forEach((q) => expect(q.category).toBe('politiek'))
  })

  it('drawDrillSet returns DRILL_SIZE unique questions', () => {
    const drill = drawDrillSet()
    expect(drill.length).toBe(DRILL_SIZE)
    const ids = new Set(drill.map((q) => q.id))
    expect(ids.size).toBe(DRILL_SIZE)
  })

  it('drawDrillSet returns different sets on repeated calls (randomness sanity)', () => {
    const a = drawDrillSet().map((q) => q.id).join(',')
    const b = drawDrillSet().map((q) => q.id).join(',')
    expect(a).not.toBe(b)
  })

  it('scoreAttempt counts correct answers', () => {
    const drill = drawDrillSet()
    const allCorrect = drill.map((q) => q.correct_index)
    expect(scoreAttempt(drill, allCorrect).score).toBe(DRILL_SIZE)
    expect(scoreAttempt(drill, allCorrect).passed).toBe(true)

    const allWrong = drill.map((q) => ((q.correct_index + 1) % 4) as 0|1|2|3)
    expect(scoreAttempt(drill, allWrong).score).toBe(0)
    expect(scoreAttempt(drill, allWrong).passed).toBe(false)
  })

  it('PASS_THRESHOLD is 0.8 (80%)', () => {
    expect(PASS_THRESHOLD).toBe(0.8)
  })

  it('scoreAttempt passes at exactly 80%', () => {
    const drill = drawDrillSet()
    const need = Math.ceil(DRILL_SIZE * 0.8)
    const answers = drill.map((q, i) =>
      (i < need ? q.correct_index : ((q.correct_index + 1) % 4)) as 0|1|2|3,
    )
    expect(scoreAttempt(drill, answers).passed).toBe(true)
  })

  it('saveAttempt + getAttemptHistory persist across calls (most recent first)', () => {
    saveAttempt({ ts: 1000, score: 25, total: 30, passed: true })
    saveAttempt({ ts: 2000, score: 20, total: 30, passed: false })
    const hist = getAttemptHistory()
    expect(hist.length).toBe(2)
    expect(hist[0].ts).toBe(2000)
    expect(hist[1].ts).toBe(1000)
  })

  it('getAttemptHistory caps at 50 attempts (most recent first)', () => {
    for (let i = 0; i < 60; i++) {
      saveAttempt({ ts: i, score: 0, total: 30, passed: false })
    }
    const hist = getAttemptHistory()
    expect(hist.length).toBe(50)
    expect(hist[0].ts).toBe(59)
  })

  it('markLearned + isLearned + getLearnedCount track per-question learning', () => {
    expect(isLearned('knm-001')).toBe(false)
    expect(getLearnedCount()).toBe(0)
    markLearned('knm-001')
    markLearned('knm-002')
    markLearned('knm-001') // idempotent
    expect(isLearned('knm-001')).toBe(true)
    expect(getLearnedCount()).toBe(2)
  })

  it('every question has bilingual fields (question_en + options_en)', () => {
    for (const q of getKnmQuestions()) {
      expect(q.question_en).toBeDefined()
      expect(q.question_en!.length).toBeGreaterThan(0)
      expect(q.options_en).toBeDefined()
      expect(q.options_en!.length).toBe(4)
      q.options_en!.forEach((opt) => expect(opt.length).toBeGreaterThan(0))
    }
  })
})
