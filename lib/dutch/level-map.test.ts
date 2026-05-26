import { describe, it, expect } from 'vitest'
import { getLevel, getItemsByLevel, ALL_LEVELS } from './level-map'

describe('dutch level-map', () => {
  it('returns the level for known dutch- prefixed lesson IDs', () => {
    expect(getLevel('dutch-supermarket')).toBe('A1')
    expect(getLevel('dutch-introductions')).toBe('A1')
    expect(getLevel('dutch-doctor')).toBe('A1')
  })

  it('returns the level for the new exam-targeted lessons', () => {
    expect(getLevel('dutch-gemeente')).toBe('A2')
    expect(getLevel('dutch-housing-problem')).toBe('A2')
    expect(getLevel('dutch-bank')).toBe('A2')
    expect(getLevel('dutch-huisarts-call')).toBe('B1')
    expect(getLevel('dutch-job-interview')).toBe('B1')
    expect(getLevel('dutch-primary-school')).toBe('B1')
  })

  it('returns the level for known foundation IDs', () => {
    expect(getLevel('numbers')).toBe('A1')
    expect(getLevel('past-tense')).toBe('A2')
  })

  it('returns "A1" as safe default for unknown ids', () => {
    expect(getLevel('nonexistent-thing')).toBe('A1')
  })

  it('getItemsByLevel groups all known items by level', () => {
    const a1 = getItemsByLevel('A1')
    const a2 = getItemsByLevel('A2')
    const b1 = getItemsByLevel('B1')
    expect(a1.length).toBeGreaterThan(0)
    expect(a2.length).toBeGreaterThan(0)
    expect(b1.length).toBe(3)
    expect(a1).toContain('dutch-supermarket')
    expect(b1).toContain('dutch-huisarts-call')
  })

  it('ALL_LEVELS is the canonical [A1, A2, B1] order', () => {
    expect(ALL_LEVELS).toEqual(['A1', 'A2', 'B1'])
  })
})
