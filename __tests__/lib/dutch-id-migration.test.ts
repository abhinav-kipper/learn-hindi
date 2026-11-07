import { describe, it, expect, beforeEach } from 'vitest'
import { migrateDutchFoundationIds, DUTCH_ID_RENAMES } from '@/lib/dutch/id-migration'

const FLAG = 'dutch-foundation-id-migration-v1'

function mockStorage() {
  const store: Record<string, string> = {}
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => {
        store[k] = String(v)
      },
      removeItem: (k: string) => {
        delete store[k]
      },
      clear: () => {
        for (const k of Object.keys(store)) delete store[k]
      },
    },
  })
  return store
}

describe('migrateDutchFoundationIds', () => {
  let store: Record<string, string>

  beforeEach(() => {
    store = mockStorage()
  })

  it('renames bare IDs in completedLessons and lessonCompletedAt', () => {
    store['dutch-progress'] = JSON.stringify({
      completedLessons: ['questions', 'dutch-numbers', 'negation'],
      lessonCompletedAt: { questions: '2026-10-01', 'dutch-numbers': '2026-10-02' },
      currentStreak: 4,
    })

    migrateDutchFoundationIds()

    const after = JSON.parse(store['dutch-progress'])
    expect(after.completedLessons).toEqual([
      'dutch-questions',
      'dutch-numbers',
      'dutch-negation',
    ])
    expect(after.lessonCompletedAt).toEqual({
      'dutch-questions': '2026-10-01',
      'dutch-numbers': '2026-10-02',
    })
    // untouched fields survive
    expect(after.currentStreak).toBe(4)
  })

  it('renames keys in the phrase-progress map', () => {
    store['dutch-phrase-progress'] = JSON.stringify({
      questions: [0, 1, 2],
      'dutch-de-het': [0],
    })

    migrateDutchFoundationIds()

    const after = JSON.parse(store['dutch-phrase-progress'])
    expect(after['dutch-questions']).toEqual([0, 1, 2])
    expect(after['questions']).toBeUndefined()
    expect(after['dutch-de-het']).toEqual([0])
  })

  it('renames a bare last-active-lesson ID', () => {
    store['dutch-last-active-lesson'] = 'simple-sentences'
    migrateDutchFoundationIds()
    expect(store['dutch-last-active-lesson']).toBe('dutch-simple-sentences')
  })

  it('runs only once, so later progress on an old-looking ID is left alone', () => {
    store['dutch-progress'] = JSON.stringify({ completedLessons: ['questions'] })
    migrateDutchFoundationIds()
    expect(JSON.parse(store['dutch-progress']).completedLessons).toEqual([
      'dutch-questions',
    ])
    expect(store[FLAG]).toBe('1')

    // A Hindi-style ID written afterwards must not be rewritten by a second call.
    store['dutch-progress'] = JSON.stringify({ completedLessons: ['questions'] })
    migrateDutchFoundationIds()
    expect(JSON.parse(store['dutch-progress']).completedLessons).toEqual(['questions'])
  })

  it('is a no-op when there is nothing stored', () => {
    expect(() => migrateDutchFoundationIds()).not.toThrow()
    expect(store[FLAG]).toBe('1')
  })

  it('survives malformed JSON without throwing', () => {
    store['dutch-progress'] = '{not json'
    expect(() => migrateDutchFoundationIds()).not.toThrow()
    expect(store['dutch-progress']).toBe('{not json')
  })

  it('never touches the Hindi prefix', () => {
    const hindi = JSON.stringify({ completedLessons: ['questions', 'numbers'] })
    store['hindi-progress'] = hindi
    migrateDutchFoundationIds()
    expect(store['hindi-progress']).toBe(hindi)
  })

  it('covers all seven renamed foundations', () => {
    expect(Object.keys(DUTCH_ID_RENAMES)).toHaveLength(7)
    for (const [old, next] of Object.entries(DUTCH_ID_RENAMES)) {
      expect(next).toBe(`dutch-${old}`)
    }
  })
})
