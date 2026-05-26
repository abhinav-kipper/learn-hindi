import { describe, it, expect, beforeEach } from 'vitest'
import { MOMENTS, pickLine, resetPickLineHistory } from '@/components/design/moments'

describe('MOMENTS registry', () => {
  it('has all 21 moments', () => {
    const keys = Object.keys(MOMENTS).sort()
    expect(keys).toEqual([
      'a2Milestone',
      'conjugationCorrect',
      'correctAnswer',
      'drillGotIt',
      'favoriteSaved',
      'firstEver',
      'firstMistake',
      'firstOpenToday',
      'idleNudge',
      'knmAttemptComplete',
      'knmPassed',
      'lessonComplete',
      'lezenMockPassed',
      'lezenStudyDone',
      'newContent',
      'phraseStreak',
      'sessionEnd',
      'streakMilestone',
      'tap',
      'welcomeBack',
      'wrongAnswer',
    ])
  })

  it('every moment has at least one line with main + speak', () => {
    for (const [key, cfg] of Object.entries(MOMENTS)) {
      expect(cfg.lines.length, `${key} has no lines`).toBeGreaterThan(0)
      for (const line of cfg.lines) {
        expect(line.main, `${key} missing main`).toBeTruthy()
        expect(line.speak, `${key} missing speak`).toBeTruthy()
      }
    }
  })

  it('silent moments have voice=false', () => {
    expect(MOMENTS.phraseStreak.voice).toBe(false)
    expect(MOMENTS.idleNudge.voice).toBe(false)
    expect(MOMENTS.favoriteSaved.voice).toBe(false)
    expect(MOMENTS.conjugationCorrect.voice).toBe(false)
    expect(MOMENTS.drillGotIt.voice).toBe(false)
  })
})

describe('pickLine', () => {
  beforeEach(() => resetPickLineHistory())

  it('returns a line and its index', () => {
    const r = pickLine('correctAnswer')
    expect(r.line).toBeDefined()
    expect(r.idx).toBeGreaterThanOrEqual(0)
    expect(MOMENTS.correctAnswer.lines[r.idx]).toBe(r.line)
  })

  it('never repeats the same index twice in a row when >1 line', () => {
    let prev = -1
    for (let i = 0; i < 50; i++) {
      const r = pickLine('welcomeBack')
      expect(r.idx).not.toBe(prev)
      prev = r.idx
    }
  })

  it('returns the only line when there is just one', () => {
    const r1 = pickLine('firstEver')
    const r2 = pickLine('firstEver')
    expect(r1.idx).toBe(0)
    expect(r2.idx).toBe(0)
  })
})
