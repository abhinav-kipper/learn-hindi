import { describe, it, expect, beforeEach } from 'vitest'
import { getExamTarget, setExamTarget, EXAM_TARGET_KEY } from './exam-target'

beforeEach(() => {
  localStorage.clear()
})

describe('dutch exam-target', () => {
  it('returns "b1" by default when nothing is stored', () => {
    expect(getExamTarget()).toBe('b1')
  })

  it('returns "a2" when explicitly set', () => {
    setExamTarget('a2')
    expect(getExamTarget()).toBe('a2')
  })

  it('returns "b1" when explicitly set', () => {
    setExamTarget('a2')
    setExamTarget('b1')
    expect(getExamTarget()).toBe('b1')
  })

  it('persists to localStorage under EXAM_TARGET_KEY', () => {
    setExamTarget('a2')
    expect(localStorage.getItem(EXAM_TARGET_KEY)).toBe('a2')
  })

  it('treats unknown values as b1 (safe default)', () => {
    localStorage.setItem(EXAM_TARGET_KEY, 'gibberish')
    expect(getExamTarget()).toBe('b1')
  })
})
