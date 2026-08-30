import { describe, it, expect, beforeEach } from 'vitest'
import {
  getGroups,
  getTopics,
  getTopicById,
  getGroupOfTopic,
  getNextTopic,
  getTotalExerciseCount,
  drawTopicDrill,
  drawMixedReview,
  scrambleWords,
  normalizeAnswer,
  isCorrect,
  scoreDrill,
  markTopicStudied,
  unmarkTopicStudied,
  isTopicStudied,
  getStudiedCount,
  recordDrillResult,
  getTopicScore,
  getWeakTopics,
  getOverallProgress,
  MIXED_REVIEW_SIZE,
  STUDIED_KEY,
  SCORES_KEY,
  type OrderExercise,
  type Exercise,
} from '@/lib/dutch/cheatsheet'

const store: Record<string, string> = {}

Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v
    },
    removeItem: (k: string) => {
      delete store[k]
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k]
    },
  },
  writable: true,
})

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k]
})

describe('cheatsheet content', () => {
  it('loads five groups, each with topics', () => {
    const groups = getGroups()
    expect(groups).toHaveLength(5)
    for (const g of groups) {
      expect(g.topics.length).toBeGreaterThan(0)
      expect(g.id).toBeTruthy()
      expect(g.title).toBeTruthy()
    }
  })

  it('has unique topic ids and unique exercise ids', () => {
    const topics = getTopics()
    const topicIds = topics.map((t) => t.id)
    expect(new Set(topicIds).size).toBe(topicIds.length)

    const exIds = topics.flatMap((t) => t.exercises.map((e) => e.id))
    expect(new Set(exIds).size).toBe(exIds.length)
  })

  it('gives every topic sections, takeaways and at least six exercises', () => {
    for (const t of getTopics()) {
      expect(t.sections.length).toBeGreaterThan(0)
      expect(t.key_takeaways.length).toBeGreaterThan(0)
      expect(t.exercises.length).toBeGreaterThanOrEqual(6)
      for (const s of t.sections) {
        expect(s.heading).toBeTruthy()
        expect(s.blocks.length).toBeGreaterThan(0)
      }
    }
  })

  it('keeps every exercise internally consistent', () => {
    for (const ex of getTopics().flatMap((t) => t.exercises)) {
      expect(ex.explain).toBeTruthy()
      if (ex.kind === 'mcq') {
        expect(ex.options.length).toBeGreaterThanOrEqual(2)
        expect(ex.correct).toBeGreaterThanOrEqual(0)
        expect(ex.correct).toBeLessThan(ex.options.length)
      } else if (ex.kind === 'fill') {
        expect(ex.answers.length).toBeGreaterThan(0)
      } else {
        // Every answer token must exist in the tile pool and vice versa.
        expect([...ex.words].sort()).toEqual([...ex.answer].sort())
      }
    }
  })

  it('keeps table rows the same width as their headers', () => {
    for (const t of getTopics()) {
      for (const s of t.sections) {
        for (const b of s.blocks) {
          if (b.kind !== 'table') continue
          for (const row of b.rows) {
            expect(row.length).toBe(b.headers.length)
          }
        }
      }
    }
  })

  // The Dutch columns are marked by hand, so guard the indices against drift:
  // an out-of-range index would silently stop a column being tappable, and an
  // en_col pointing at a Dutch column would show the wrong "meaning".
  it('keeps every nl_cols / en_col index inside its table', () => {
    for (const t of getTopics()) {
      for (const s of t.sections) {
        for (const b of s.blocks) {
          if (b.kind !== 'table') continue
          const width = b.headers.length
          for (const c of b.nl_cols ?? []) {
            expect(c, `${t.id}: nl_cols out of range`).toBeGreaterThanOrEqual(0)
            expect(c, `${t.id}: nl_cols out of range`).toBeLessThan(width)
          }
          if (b.en_col !== undefined) {
            expect(b.en_col, `${t.id}: en_col out of range`).toBeLessThan(width)
            expect(b.nl_cols ?? [], `${t.id}: en_col also marked as Dutch`).not.toContain(b.en_col)
          }
        }
      }
    }
  })

  it('marks Dutch columns on the tables that have Dutch in them', () => {
    const tables = getTopics().flatMap((t) =>
      t.sections.flatMap((s) => s.blocks.filter((b) => b.kind === 'table')),
    )
    const annotated = tables.filter((b) => (b.nl_cols?.length ?? 0) > 0)
    // Every table but the alphabet one (letter names, not Dutch words) is annotated.
    expect(annotated.length).toBe(tables.length - 1)
  })

  it('finds a topic, its group and the next one in order', () => {
    const all = getTopics()
    expect(getTopicById('greetings')?.title).toBeTruthy()
    expect(getTopicById('nope')).toBeUndefined()
    expect(getGroupOfTopic('greetings')?.id).toBe('start')
    expect(getNextTopic(all[0].id)?.id).toBe(all[1].id)
    expect(getNextTopic(all[all.length - 1].id)).toBeUndefined()
  })

  it('counts every exercise in the deck', () => {
    expect(getTotalExerciseCount()).toBe(getTopics().flatMap((t) => t.exercises).length)
  })
})

describe('drill sets', () => {
  it('draws a topic drill containing exactly that topic exercises', () => {
    const drill = drawTopicDrill('numbers')
    const source = getTopicById('numbers')!.exercises
    expect(drill).toHaveLength(source.length)
    expect(drill.map((e) => e.id).sort()).toEqual(source.map((e) => e.id).sort())
  })

  it('returns an empty drill for an unknown topic', () => {
    expect(drawTopicDrill('nope')).toEqual([])
  })

  it('draws a mixed review of the requested size with no repeats', () => {
    const set = drawMixedReview()
    expect(set).toHaveLength(MIXED_REVIEW_SIZE)
    expect(new Set(set.map((e) => e.id)).size).toBe(set.length)
  })

  it('never scrambles an order exercise into its own answer', () => {
    const ex: OrderExercise = {
      id: 'x',
      kind: 'order',
      prompt: '',
      words: ['a', 'b'],
      answer: ['a', 'b'],
      explain: '',
    }
    for (let i = 0; i < 20; i++) {
      expect(scrambleWords(ex).join(' ')).not.toBe('a b')
    }
  })
})

describe('answer checking', () => {
  it('normalizes case, punctuation and spacing', () => {
    expect(normalizeAnswer('  Ik BEN,  moe! ')).toBe('ik ben moe')
  })

  it('checks mcq answers by index', () => {
    const ex: Exercise = {
      id: 'm',
      kind: 'mcq',
      prompt: '',
      options: ['a', 'b'],
      correct: 1,
      explain: '',
    }
    expect(isCorrect(ex, 1)).toBe(true)
    expect(isCorrect(ex, 0)).toBe(false)
  })

  it('accepts any listed fill answer, forgiving case and punctuation', () => {
    const ex: Exercise = {
      id: 'f',
      kind: 'fill',
      prompt: '',
      answers: ['hebt', 'heeft'],
      explain: '',
    }
    expect(isCorrect(ex, 'Heeft')).toBe(true)
    expect(isCorrect(ex, ' hebt. ')).toBe(true)
    expect(isCorrect(ex, 'ben')).toBe(false)
    expect(isCorrect(ex, '   ')).toBe(false)
  })

  it('checks order answers as a joined sentence', () => {
    const ex: Exercise = {
      id: 'o',
      kind: 'order',
      prompt: '',
      words: ['ben', 'Ik', 'moe'],
      answer: ['Ik', 'ben', 'moe'],
      explain: '',
    }
    expect(isCorrect(ex, ['Ik', 'ben', 'moe'])).toBe(true)
    expect(isCorrect(ex, ['ik', 'ben', 'moe'])).toBe(true)
    expect(isCorrect(ex, ['ben', 'Ik', 'moe'])).toBe(false)
  })

  it('scores a drill and applies the 80 percent pass mark', () => {
    const exercises: Exercise[] = Array.from({ length: 10 }, (_, i) => ({
      id: `e${i}`,
      kind: 'mcq' as const,
      prompt: '',
      options: ['a', 'b'],
      correct: 0,
      explain: '',
    }))
    const eight = exercises.map((_, i) => (i < 8 ? 0 : 1))
    expect(scoreDrill(exercises, eight)).toEqual({ score: 8, total: 10, passed: true })

    const seven = exercises.map((_, i) => (i < 7 ? 0 : 1))
    expect(scoreDrill(exercises, seven)).toEqual({ score: 7, total: 10, passed: false })

    const withSkips = exercises.map(() => null)
    expect(scoreDrill(exercises, withSkips).score).toBe(0)
  })
})

describe('progress', () => {
  it('marks and unmarks a topic as studied', () => {
    expect(isTopicStudied('numbers')).toBe(false)
    markTopicStudied('numbers')
    markTopicStudied('numbers')
    expect(isTopicStudied('numbers')).toBe(true)
    expect(getStudiedCount()).toBe(1)
    unmarkTopicStudied('numbers')
    expect(isTopicStudied('numbers')).toBe(false)
    expect(getStudiedCount()).toBe(0)
  })

  it('survives corrupt stored data', () => {
    store[STUDIED_KEY] = 'not json'
    store[SCORES_KEY] = '{{{'
    expect(getStudiedCount()).toBe(0)
    expect(getTopicScore('numbers')).toBeUndefined()
  })

  it('keeps the best score and counts every attempt', () => {
    recordDrillResult('numbers', 5, 8)
    expect(getTopicScore('numbers')).toMatchObject({ best: 5, total: 8, attempts: 1 })

    recordDrillResult('numbers', 3, 8)
    expect(getTopicScore('numbers')).toMatchObject({ best: 5, total: 8, attempts: 2 })

    recordDrillResult('numbers', 8, 8)
    expect(getTopicScore('numbers')).toMatchObject({ best: 8, total: 8, attempts: 3 })
  })

  it('lists topics drilled but not yet passed', () => {
    recordDrillResult('numbers', 4, 8)
    recordDrillResult('greetings', 8, 8)
    const weak = getWeakTopics().map((t) => t.id)
    expect(weak).toContain('numbers')
    expect(weak).not.toContain('greetings')
    expect(weak).not.toContain('family')
  })

  it('reports overall progress across studied, drilled and passed', () => {
    markTopicStudied('numbers')
    markTopicStudied('greetings')
    recordDrillResult('numbers', 4, 8)
    recordDrillResult('greetings', 8, 8)

    const p = getOverallProgress()
    expect(p.studied).toBe(2)
    expect(p.drilled).toBe(2)
    expect(p.passed).toBe(1)
    expect(p.totalTopics).toBe(getTopics().length)
  })
})
