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
    // Foundation JSONs use `dutch-` prefixed IDs. This test used to assert the
    // bare forms ('numbers', 'past-tense'), which matched map keys that no
    // content ever had, so every foundation silently fell through to the 'A1'
    // default. Keys and assertions now both use the real IDs.
    expect(getLevel('dutch-numbers')).toBe('A1')
    expect(getLevel('dutch-questions')).toBe('A1')
    expect(getLevel('dutch-past-tense')).toBe('A2')
    expect(getLevel('dutch-comparatives')).toBe('A2')
  })

  it('has no bare (unprefixed) foundation keys left in the map', () => {
    // A bare key can never match a content ID, so it would quietly inflate the
    // stage bars with items that can never complete.
    for (const level of ALL_LEVELS) {
      for (const id of getItemsByLevel(level)) {
        expect(id.startsWith('dutch-')).toBe(true)
      }
    }
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
