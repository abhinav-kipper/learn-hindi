import { describe, it, expect, beforeEach } from 'vitest'
import {
  initBaseline,
  markAsSeen,
  getUnseenIds,
  hasBeenSeen,
  isInitialized,
  STORAGE_KEY,
} from './seen-lessons'

beforeEach(() => {
  localStorage.clear()
})

describe('seen-lessons', () => {
  it('isInitialized is false when localStorage key is absent', () => {
    expect(isInitialized()).toBe(false)
  })

  it('isInitialized is true after initBaseline', () => {
    initBaseline(['a', 'b'])
    expect(isInitialized()).toBe(true)
  })

  it('initBaseline marks all current ids as seen', () => {
    initBaseline(['a', 'b', 'c'])
    expect(hasBeenSeen('a')).toBe(true)
    expect(hasBeenSeen('b')).toBe(true)
    expect(hasBeenSeen('c')).toBe(true)
  })

  it('getUnseenIds returns empty array when not initialized (safe default)', () => {
    expect(getUnseenIds(['a', 'b'])).toEqual([])
  })

  it('getUnseenIds returns only new ids after baseline', () => {
    initBaseline(['a', 'b'])
    expect(getUnseenIds(['a', 'b', 'c', 'd'])).toEqual(['c', 'd'])
  })

  it('markAsSeen removes an id from the unseen set', () => {
    initBaseline(['a'])
    expect(getUnseenIds(['a', 'b'])).toEqual(['b'])
    markAsSeen('b')
    expect(getUnseenIds(['a', 'b'])).toEqual([])
  })

  it('hasBeenSeen returns false for unknown ids before baseline', () => {
    expect(hasBeenSeen('a')).toBe(false)
  })

  it('hasBeenSeen returns true after markAsSeen', () => {
    initBaseline([])
    expect(hasBeenSeen('x')).toBe(false)
    markAsSeen('x')
    expect(hasBeenSeen('x')).toBe(true)
  })

  it('persists across calls (same localStorage key)', () => {
    initBaseline(['a'])
    markAsSeen('b')
    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw!)).toEqual(expect.arrayContaining(['a', 'b']))
  })
})
