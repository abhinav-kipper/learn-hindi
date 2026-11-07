import { describe, it, expect, beforeEach } from 'vitest'
import {
  getExamTarget,
  setExamTarget,
  EXAM_TARGET_KEY,
  targetLabel,
  levelsForTarget,
  isBeyondTarget,
} from './exam-target'

beforeEach(() => {
  localStorage.clear()
})

describe('dutch exam-target', () => {
  // A2 is the level most people actually sit, and the one this learner is
  // preparing for. B1 is opt-in.
  it('returns "a2" by default when nothing is stored', () => {
    expect(getExamTarget()).toBe('a2')
  })

  it('returns "b1" when explicitly set', () => {
    setExamTarget('b1')
    expect(getExamTarget()).toBe('b1')
  })

  it('can be switched back to a2', () => {
    setExamTarget('b1')
    setExamTarget('a2')
    expect(getExamTarget()).toBe('a2')
  })

  it('persists to localStorage under EXAM_TARGET_KEY', () => {
    setExamTarget('b1')
    expect(localStorage.getItem(EXAM_TARGET_KEY)).toBe('b1')
  })

  it('treats unknown values as a2 (safe default)', () => {
    localStorage.setItem(EXAM_TARGET_KEY, 'gibberish')
    expect(getExamTarget()).toBe('a2')
  })
})

describe('targetLabel', () => {
  it('maps the target onto its CEFR level', () => {
    expect(targetLabel('a2')).toBe('A2')
    expect(targetLabel('b1')).toBe('B1')
  })
})

describe('levelsForTarget', () => {
  it('stops at A2 for the a2 target', () => {
    expect(levelsForTarget('a2')).toEqual(['A1', 'A2'])
  })

  it('includes B1 for the b1 target', () => {
    expect(levelsForTarget('b1')).toEqual(['A1', 'A2', 'B1'])
  })
})

describe('isBeyondTarget', () => {
  it('flags B1 content when aiming at A2', () => {
    expect(isBeyondTarget('B1', 'a2')).toBe(true)
  })

  it('does not flag A1 or A2 content when aiming at A2', () => {
    expect(isBeyondTarget('A1', 'a2')).toBe(false)
    expect(isBeyondTarget('A2', 'a2')).toBe(false)
  })

  it('flags nothing when aiming at B1', () => {
    for (const lvl of ['A1', 'A2', 'B1'] as const) {
      expect(isBeyondTarget(lvl, 'b1')).toBe(false)
    }
  })

  it('treats an untagged item as in-scope rather than hiding it', () => {
    expect(isBeyondTarget(undefined, 'a2')).toBe(false)
  })
})
