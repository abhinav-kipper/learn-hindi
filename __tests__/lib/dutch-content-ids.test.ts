import { describe, it, expect } from 'vitest'
import { getAllLessons } from '@/lib/lessons'
import { getAllFoundations } from '@/lib/foundations'
import { getDutchLessons } from '@/lib/dutch/lessons'
import { getDutchFoundations } from '@/lib/dutch/foundations'
import { getUniversalLessonById } from '@/lib/all-content'
import { getLevel, ALL_LEVELS } from '@/lib/dutch/level-map'
import { DUTCH_ID_RENAMES } from '@/lib/dutch/id-migration'

/**
 * Content IDs are a single global namespace: `getUniversalLessonById` resolves
 * an ID by checking Hindi first, then Dutch, so any duplicate ID makes the
 * Dutch unit permanently unreachable. That is exactly what happened with
 * `questions` (the Dutch "Asking Questions" chapter rendered the Hindi lesson).
 * These tests are the gate that keeps it from happening again.
 */
describe('content ID namespace', () => {
  const all = [
    ...getAllLessons().map((l) => ({ id: l.id, from: 'hindi-lesson' })),
    ...getAllFoundations().map((l) => ({ id: l.id, from: 'hindi-foundation' })),
    ...getDutchLessons().map((l) => ({ id: l.id, from: 'dutch-lesson' })),
    ...getDutchFoundations().map((l) => ({ id: l.id, from: 'dutch-foundation' })),
  ]

  it('has no duplicate IDs across languages', () => {
    const byId = new Map<string, string[]>()
    for (const { id, from } of all) {
      byId.set(id, [...(byId.get(id) ?? []), from])
    }
    const dupes = [...byId.entries()].filter(([, srcs]) => srcs.length > 1)
    expect(dupes).toEqual([])
  })

  it('prefixes every Dutch content ID with `dutch-`', () => {
    const unprefixed = [...getDutchLessons(), ...getDutchFoundations()]
      .map((l) => l.id)
      .filter((id) => !id.startsWith('dutch-'))
    expect(unprefixed).toEqual([])
  })

  it('resolves every Dutch ID to the Dutch unit, not a Hindi one', () => {
    for (const lesson of [...getDutchLessons(), ...getDutchFoundations()]) {
      expect(getUniversalLessonById(lesson.id)?.title).toBe(lesson.title)
    }
  })

  it('resolves every Hindi ID to the Hindi unit', () => {
    for (const lesson of [...getAllLessons(), ...getAllFoundations()]) {
      expect(getUniversalLessonById(lesson.id)?.title).toBe(lesson.title)
    }
  })
})

describe('dutch level map', () => {
  it('maps every Dutch foundation by its real ID (no silent A1 fallback)', () => {
    // A bare key never matches, so `getLevel` would quietly return the 'A1'
    // default. Assert the ID is a real key by checking the declared level.
    const expected: Record<string, string> = {
      'dutch-pronouns-zijn-hebben': 'A1',
      'dutch-numbers': 'A1',
      'dutch-pronunciation': 'A1',
      'dutch-present-tense': 'A1',
      'dutch-questions': 'A1',
      'dutch-negation': 'A1',
      'dutch-simple-sentences': 'A1',
      'dutch-de-het': 'A1',
      'dutch-word-order': 'A2',
      'dutch-connectors': 'A2',
      'dutch-past-tense': 'A2',
      'dutch-future': 'A2',
      'dutch-modals': 'A2',
      'dutch-comparatives': 'A2',
    }
    const ids = getDutchFoundations().map((f) => f.id)
    expect(ids.sort()).toEqual(Object.keys(expected).sort())
    for (const [id, level] of Object.entries(expected)) {
      expect(getLevel(id)).toBe(level)
    }
  })

  it('assigns every Dutch lesson a valid level', () => {
    for (const lesson of getDutchLessons()) {
      expect(ALL_LEVELS).toContain(getLevel(lesson.id))
    }
  })
})

describe('dutch foundation ID rename', () => {
  it('maps each old bare ID to a foundation that exists', () => {
    const ids = new Set(getDutchFoundations().map((f) => f.id))
    for (const [old, next] of Object.entries(DUTCH_ID_RENAMES)) {
      expect(ids.has(next)).toBe(true)
      expect(ids.has(old)).toBe(false)
    }
  })
})
