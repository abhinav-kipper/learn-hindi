import { describe, it, expect } from 'vitest'
import { getAllStories, getStoryById } from './stories'

describe('lib/stories', () => {
  it('loads all 5 stories', () => {
    const stories = getAllStories()
    expect(stories).toHaveLength(5)
    expect(stories.map(s => s.id)).toEqual([
      'chai-stall',
      'lost-in-bazaar',
      'sunday-with-nani',
      'diwali-night',
      'at-the-doctor',
    ])
  })

  it('returns a story by id', () => {
    const chai = getStoryById('chai-stall')
    expect(chai).toBeDefined()
    expect(chai?.title).toBe('The Chai Stall')
    expect(chai?.panels).toHaveLength(5)
  })

  it('returns undefined for unknown id', () => {
    expect(getStoryById('does-not-exist')).toBeUndefined()
  })

  it('every story has exactly 5 panels with required fields', () => {
    for (const story of getAllStories()) {
      expect(story.panels).toHaveLength(5)
      for (const panel of story.panels) {
        expect(panel.scene).toBeTruthy()
        expect(panel.hindi).toBeTruthy()
        expect(panel.english).toBeTruthy()
      }
    }
  })
})
