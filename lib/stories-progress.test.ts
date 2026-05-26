import { describe, it, expect, beforeEach } from 'vitest'
import {
  markStoryRead,
  isStoryRead,
  getStoriesRead,
  getStoriesReadCount,
  STORIES_READ_KEY,
} from './stories-progress'

describe('lib/stories-progress', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('STORIES_READ_KEY is namespaced under learn-hindi', () => {
    expect(STORIES_READ_KEY).toBe('learn-hindi:hindi-stories-read')
  })

  it('isStoryRead returns false when nothing stored', () => {
    expect(isStoryRead('chai-stall')).toBe(false)
  })

  it('markStoryRead persists the ID and isStoryRead returns true after', () => {
    markStoryRead('chai-stall')
    expect(isStoryRead('chai-stall')).toBe(true)
  })

  it('markStoryRead is idempotent — calling twice does not duplicate', () => {
    markStoryRead('chai-stall')
    markStoryRead('chai-stall')
    expect(getStoriesRead()).toEqual(['chai-stall'])
  })

  it('multiple stories tracked independently', () => {
    markStoryRead('chai-stall')
    markStoryRead('sunday-with-nani')
    const all = getStoriesRead()
    expect(all).toContain('chai-stall')
    expect(all).toContain('sunday-with-nani')
    expect(all).not.toContain('lost-in-bazaar')
  })

  it('getStoriesReadCount returns the count', () => {
    expect(getStoriesReadCount()).toBe(0)
    markStoryRead('chai-stall')
    expect(getStoriesReadCount()).toBe(1)
    markStoryRead('lost-in-bazaar')
    expect(getStoriesReadCount()).toBe(2)
  })

  it('survives malformed localStorage data — falls back to empty', () => {
    localStorage.setItem(STORIES_READ_KEY, 'not-json{{{')
    expect(getStoriesRead()).toEqual([])
    expect(isStoryRead('chai-stall')).toBe(false)
  })
})
