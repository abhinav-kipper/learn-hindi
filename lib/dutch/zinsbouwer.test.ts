import { describe, it, expect, beforeEach } from 'vitest'
import {
  LEVELS,
  SPRINT_SECONDS,
  getItems,
  getItemById,
  getConcepts,
  getConcept,
  tokens,
  acceptedOrders,
  checkBuild,
  displaySentence,
  decoyCount,
  drawQueue,
  itemsFor,
  getStats,
  recordResult,
  conceptAccuracy,
  getWeakConcepts,
  totalAnswered,
  resetStats,
  getSprintBests,
  recordSprint,
  type SentenceEntry,
} from '@/lib/dutch/zinsbouwer'

beforeEach(() => localStorage.clear())

/** Same words, ignoring order. */
function sameMultiset(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const sort = (xs: string[]) => [...xs].map((x) => x.toLowerCase()).sort()
  const [x, y] = [sort(a), sort(b)]
  return x.every((w, i) => w === y[i])
}

// ── Content gates. These fail the build on bad content, not just bad code. ───

describe('zinsbouwer content', () => {
  const items = getItems()
  const concepts = getConcepts()

  it('has a real corpus spread over all three levels', () => {
    expect(items.length).toBeGreaterThanOrEqual(120)
    for (const level of LEVELS) {
      expect(items.filter((i) => i.level === level).length).toBeGreaterThanOrEqual(25)
    }
  })

  it('gives every concept a label, a Dutch name and a rule', () => {
    expect(Object.keys(concepts).length).toBeGreaterThanOrEqual(15)
    for (const [key, c] of Object.entries(concepts)) {
      expect(c.label, key).toBeTruthy()
      expect(c.nl, key).toBeTruthy()
      expect(c.rule.length, key).toBeGreaterThan(30)
    }
  })

  it('tags every sentence with a concept that exists', () => {
    for (const i of items) expect(concepts[i.concept], `${i.id} -> ${i.concept}`).toBeTruthy()
  })

  it('gives every concept enough sentences to practise on its own', () => {
    for (const key of Object.keys(concepts)) {
      expect(itemsFor(null, key).length, key).toBeGreaterThanOrEqual(4)
    }
  })

  it('has unique ids and no duplicate sentences', () => {
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length)
    expect(new Set(items.map((i) => i.nl)).size).toBe(items.length)
  })

  it('stores sentences as lowercase tiles with no trailing punctuation', () => {
    for (const i of items) {
      // A capital on the first tile would give away which word starts the sentence.
      expect(i.nl[0], i.id).toBe(i.nl[0].toLowerCase())
      expect(/[.!?]$/.test(i.nl), i.id).toBe(false)
      expect(tokens(i.nl).length, i.id).toBeGreaterThanOrEqual(3)
    }
  })

  it('explains every sentence and gives every one an English prompt', () => {
    for (const i of items) {
      expect(i.why.length, i.id).toBeGreaterThan(25)
      expect(i.en.length, i.id).toBeGreaterThan(5)
      expect(LEVELS, i.id).toContain(i.level)
    }
  })

  // The one that matters most: an alternate built from different words could
  // never be tapped out of the tray, and an alternate equal to the canonical is
  // dead weight.
  it('only accepts alternate orders made of exactly the same words', () => {
    for (const i of items) {
      for (const alt of i.accept ?? []) {
        expect(sameMultiset(tokens(alt), tokens(i.nl)), `${i.id}: "${alt}"`).toBe(true)
        expect(alt, i.id).not.toBe(i.nl)
      }
      expect(new Set(i.accept ?? []).size).toBe((i.accept ?? []).length)
    }
  })

  it('accepts every order it declares, and rejects a wrong one', () => {
    for (const i of items) {
      for (const order of acceptedOrders(i)) {
        expect(checkBuild(i, tokens(order)), `${i.id}: "${order}"`).toBe(true)
      }
      const reversed = [...tokens(i.nl)].reverse()
      if (reversed.join(' ') !== i.nl) {
        expect(checkBuild(i, reversed), i.id).toBe(false)
      }
    }
  })
})

// ── Engine ───────────────────────────────────────────────────────────────────

describe('checkBuild', () => {
  const item = getItems().find((i) => (i.accept?.length ?? 0) > 0) as SentenceEntry

  it('is forgiving about case and spacing', () => {
    expect(checkBuild(item, item.nl.toUpperCase().split(' '))).toBe(true)
  })

  it('rejects an empty build', () => {
    expect(checkBuild(item, [])).toBe(false)
    expect(checkBuild(item, ['  '])).toBe(false)
  })

  it('rejects a build that is missing a word', () => {
    expect(checkBuild(item, tokens(item.nl).slice(0, -1))).toBe(false)
  })
})

describe('displaySentence', () => {
  it('capitalises the first word', () => {
    const i = getItemById('z001') as SentenceEntry
    expect(displaySentence(i)).toBe('Ik woon in Nederland.')
  })

  it('ends a question with a question mark', () => {
    const i = getItemById('z020') as SentenceEntry
    expect(displaySentence(i)).toBe('Waar woon je?')
  })

  it('can render an alternate order the learner actually built', () => {
    const i = getItemById('z013') as SentenceEntry
    expect(displaySentence(i, 'ik ga morgen naar de gemeente')).toBe('Ik ga morgen naar de gemeente.')
  })
})

describe('drawQueue', () => {
  it('returns the asked-for number of builds from the asked-for level', () => {
    const q = drawQueue({ level: 'A1', count: 8, weighted: false })
    expect(q).toHaveLength(8)
    expect(q.every((b) => b.item.level === 'A1')).toBe(true)
  })

  it('can be narrowed to one concept', () => {
    const q = drawQueue({ level: null, concept: 'passive', count: 5, weighted: false })
    expect(q.length).toBeGreaterThan(0)
    expect(q.every((b) => b.item.concept === 'passive')).toBe(true)
  })

  it('never repeats a sentence inside one queue', () => {
    const q = drawQueue({ level: null, count: 40, weighted: false })
    expect(new Set(q.map((b) => b.item.id)).size).toBe(q.length)
  })

  it('puts every word of the sentence in the tray', () => {
    for (const b of drawQueue({ level: null, count: 30, weighted: false })) {
      const tray = b.tiles.map((t) => t.w)
      for (const w of tokens(b.item.nl)) expect(tray).toContain(w)
      expect(b.tiles).toHaveLength(tokens(b.item.nl).length + b.decoys)
    }
  })

  it('adds decoys by level, and never a word the sentence already uses', () => {
    expect(decoyCount('A1')).toBe(0)
    expect(decoyCount('A2')).toBe(1)
    expect(decoyCount('B1')).toBe(2)
    for (const b of drawQueue({ level: null, count: 40, weighted: false })) {
      expect(b.decoys).toBe(decoyCount(b.item.level))
      const own = tokens(b.item.nl).map((w) => w.toLowerCase())
      const extra = b.tiles.map((t) => t.w.toLowerCase()).filter((w) => !own.includes(w))
      expect(new Set(extra).size).toBe(extra.length)
    }
  })

  it('never uses a negation word as a decoy, which could make a different true sentence', () => {
    for (let run = 0; run < 20; run++) {
      for (const b of drawQueue({ level: 'B1', count: 10, weighted: false })) {
        const own = new Set(tokens(b.item.nl).map((w) => w.toLowerCase()))
        const extra = b.tiles.map((t) => t.w.toLowerCase()).filter((w) => !own.has(w))
        for (const w of extra) expect(['niet', 'geen', 'wel', 'nooit', 'ook']).not.toContain(w)
      }
    }
  })

  it('returns nothing when the filter matches nothing', () => {
    expect(drawQueue({ level: 'A1', concept: 'nonsense', count: 5 })).toEqual([])
  })

  it('leans toward the concepts you keep getting wrong', () => {
    // Make "passive" look weak and "v2" look mastered.
    for (let i = 0; i < 10; i++) {
      recordResult('passive', false)
      recordResult('v2', true)
    }
    let passive = 0
    for (let run = 0; run < 60; run++) {
      const q = drawQueue({ level: null, count: 6 })
      passive += q.filter((b) => b.item.concept === 'passive').length
    }
    const share = passive / (60 * 6)
    // Passive is 4% of the corpus; weighted draws should beat that clearly.
    expect(share).toBeGreaterThan(0.08)
  })
})

describe('stats', () => {
  it('counts attempts and right answers per concept', () => {
    recordResult('v2', true)
    recordResult('v2', false)
    recordResult('passive', true)
    expect(getStats().v2).toEqual({ seen: 2, correct: 1 })
    expect(conceptAccuracy('v2')).toBe(0.5)
    expect(conceptAccuracy('never-touched')).toBeNull()
    expect(totalAnswered()).toBe(3)
  })

  it('lists weak concepts worst first, and only once there is evidence', () => {
    recordResult('er', false)
    recordResult('er', false)
    expect(getWeakConcepts()).toEqual([]) // 2 attempts is not evidence yet
    recordResult('er', false)
    for (let i = 0; i < 2; i++) recordResult('passive', false)
    recordResult('passive', true)
    recordResult('passive', true)
    expect(getWeakConcepts()).toEqual(['er', 'passive'])
  })

  it('survives a corrupt stats blob', () => {
    localStorage.setItem('dutch-zinsbouwer-stats', 'not json')
    expect(getStats()).toEqual({})
  })

  it('can be reset', () => {
    recordResult('v2', true)
    resetStats()
    expect(getStats()).toEqual({})
  })
})

describe('sprint bests', () => {
  it('keeps the higher score, so a bad run never erases a good one', () => {
    recordSprint('A2', 12)
    recordSprint('A2', 7)
    expect(getSprintBests().A2).toBe(12)
    recordSprint('A2', 15)
    expect(getSprintBests().A2).toBe(15)
  })

  it('tracks each level separately', () => {
    recordSprint('A1', 20)
    recordSprint('B1', 4)
    expect(getSprintBests()).toEqual({ A1: 20, B1: 4 })
  })

  it('gives the sprint a sane clock', () => {
    expect(SPRINT_SECONDS).toBeGreaterThanOrEqual(60)
    expect(SPRINT_SECONDS).toBeLessThanOrEqual(180)
  })
})

describe('lookups', () => {
  it('finds a concept and an item by key', () => {
    expect(getConcept('passive')?.label).toBe('Passive')
    expect(getConcept('nope')).toBeUndefined()
    expect(getItemById('z001')?.nl).toBe('ik woon in Nederland')
    expect(getItemById('nope')).toBeUndefined()
  })
})
