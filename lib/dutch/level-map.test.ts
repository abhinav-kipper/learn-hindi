import { describe, it, expect } from 'vitest'
import { getLevel, getItemsByLevel, ALL_LEVELS } from './level-map'

describe('dutch level-map', () => {
  it('returns the level for a known lesson id', () => {
    expect(getLevel('supermarket')).toBe('A1')
    expect(getLevel('introductions')).toBe('A1')
  })

  it('returns the level for a known foundation id', () => {
    expect(getLevel('numbers')).toBe('A1')
    expect(getLevel('past-tense')).toBe('A2')
  })

  it('returns "A1" as safe default for unknown ids', () => {
    expect(getLevel('nonexistent-thing')).toBe('A1')
  })

  it('getItemsByLevel groups all known items by level', () => {
    const a1 = getItemsByLevel('A1')
    expect(a1.length).toBeGreaterThan(0)
    expect(a1).toContain('supermarket')
  })

  it('ALL_LEVELS is the canonical [A1, A2, B1] order', () => {
    expect(ALL_LEVELS).toEqual(['A1', 'A2', 'B1'])
  })
})
