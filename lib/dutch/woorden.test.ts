import { describe, it, expect, beforeEach } from 'vitest'
import {
  getPacks,
  getPack,
  getPacksByStage,
  getAllEntries,
  getEntry,
  getArticleEntries,
  getRecord,
  recordAttempt,
  isMastered,
  getMasteredCount,
  isMet,
  markMet,
  getMetCount,
  getPackProgress,
  getStageProgress,
  getNextPack,
  getDueEntries,
  getDueCount,
  buildSession,
  pickDrill,
  normalize,
  checkRecall,
  checkArticle,
  buildCloze,
  STAGES,
  MASTERY_HITS,
} from './woorden'

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
    clear: () => Object.keys(store).forEach((k) => delete store[k]),
  },
  writable: true,
})

beforeEach(() => localStorage.clear())

// The content is the product, so these are CI gates on it as much as unit tests.
describe('word lab content', () => {
  const entries = getAllEntries()

  it('covers all three stages', () => {
    for (const s of STAGES) expect(getPacksByStage(s).length).toBeGreaterThan(0)
  })

  it('has a substantial corpus', () => {
    expect(entries.length).toBeGreaterThanOrEqual(120)
  })

  it('gives every entry a unique id', () => {
    const ids = entries.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  // The central design claim: the unit of learning is a chunk, never a bare
  // headword. A single word only qualifies when it genuinely stands alone.
  it('stores every noun with its article, as part of the chunk', () => {
    for (const e of entries) {
      if (e.pos !== 'noun') continue
      expect(e.article, e.id).toMatch(/^(de|het)$/)
      expect(e.chunk.split(' ')[0], e.id).toBe(e.article)
    }
  })

  it('never stores a noun without an article', () => {
    const bare = entries.filter((e) => e.pos === 'noun' && !e.article)
    expect(bare.map((e) => e.id)).toEqual([])
  })

  it('names the lexical pattern on every entry', () => {
    for (const e of entries) expect(e.pattern.trim().length, e.id).toBeGreaterThan(20)
  })

  it('gives every entry at least two worked examples', () => {
    for (const e of entries) {
      expect(e.examples.length, e.id).toBeGreaterThanOrEqual(2)
      for (const ex of e.examples) {
        expect(ex.nl.trim(), e.id).not.toBe('')
        expect(ex.en.trim(), e.id).not.toBe('')
      }
    }
  })

  it('gives every entry a pronunciation hint and a gloss', () => {
    for (const e of entries) {
      expect(e.pron.trim(), e.id).not.toBe('')
      expect(e.gloss.trim().length, e.id).toBeGreaterThan(1)
    }
  })

  it('has enough nouns to make the de/het drill worthwhile', () => {
    expect(getArticleEntries().length).toBeGreaterThanOrEqual(30)
  })

  it('finds a pack and an entry by id', () => {
    expect(getPack('a0-first-words')?.stage).toBe('A0')
    expect(getEntry('a0-elke-dag')?.chunk).toBe('elke dag')
    expect(getPack('nope')).toBeUndefined()
  })

  // The example the whole design is built around.
  it('teaches elke dag as a chunk rather than elke on its own', () => {
    const e = getEntry('a0-elke-dag')!
    expect(e.chunk).toBe('elke dag')
    expect(e.family).toContain('elke week')
    expect(e.pitfall).toMatch(/elk /i)
  })
})

describe('srs', () => {
  it('starts with nothing met, due or mastered', () => {
    expect(getMetCount()).toBe(0)
    expect(getDueCount()).toBe(0)
    expect(getMasteredCount()).toBe(0)
  })

  it('marks a chunk as met', () => {
    expect(isMet('a0-elke-dag')).toBe(false)
    markMet(['a0-elke-dag'])
    expect(isMet('a0-elke-dag')).toBe(true)
    expect(getMetCount()).toBe(1)
  })

  it('only queues chunks that have been met', () => {
    expect(getDueEntries()).toHaveLength(0)
    markMet(['a0-elke-dag'])
    expect(getDueEntries().map((e) => e.id)).toEqual(['a0-elke-dag'])
  })

  it('schedules a correct answer into the future', () => {
    markMet(['a0-elke-dag'])
    const r = recordAttempt('a0-elke-dag', true)
    expect(r.hits).toBe(1)
    expect(r.interval).toBeGreaterThan(0)
    expect(new Date(r.nextReviewAt).getTime()).toBeGreaterThan(Date.now())
    expect(getDueCount()).toBe(0)
  })

  it('brings a wrong answer straight back', () => {
    markMet(['a0-elke-dag'])
    recordAttempt('a0-elke-dag', true)
    recordAttempt('a0-elke-dag', true)
    const r = recordAttempt('a0-elke-dag', false)
    expect(r.misses).toBe(1)
    expect(r.interval).toBe(1)
  })

  it('docks the ease factor on a miss but never below the floor', () => {
    markMet(['a0-elke-dag'])
    const first = recordAttempt('a0-elke-dag', false)
    expect(first.easeFactor).toBeLessThan(2.5)
    for (let i = 0; i < 20; i++) recordAttempt('a0-elke-dag', false)
    expect(getRecord('a0-elke-dag')!.easeFactor).toBeGreaterThanOrEqual(1.3)
  })

  it('counts mastery in successful retrievals, not attempts', () => {
    markMet(['a0-elke-dag'])
    for (let i = 0; i < MASTERY_HITS - 1; i++) recordAttempt('a0-elke-dag', true)
    expect(isMastered('a0-elke-dag')).toBe(false)
    recordAttempt('a0-elke-dag', true)
    expect(isMastered('a0-elke-dag')).toBe(true)
    expect(getMasteredCount()).toBe(1)
  })

  it('does not let misses count toward mastery', () => {
    markMet(['a0-elke-dag'])
    for (let i = 0; i < MASTERY_HITS + 4; i++) recordAttempt('a0-elke-dag', false)
    expect(isMastered('a0-elke-dag')).toBe(false)
  })

  it('survives corrupt storage without throwing', () => {
    localStorage.setItem('dutch-woorden-srs', 'not json')
    localStorage.setItem('dutch-woorden-met', '{{{')
    expect(getMetCount()).toBe(0)
    expect(getMasteredCount()).toBe(0)
  })

  it('ignores ids that are no longer in the content', () => {
    markMet(['a0-elke-dag', 'deleted-entry'])
    expect(getMetCount()).toBe(1)
  })
})

describe('sessions', () => {
  it('is empty when nothing is due', () => {
    expect(buildSession()).toHaveLength(0)
  })

  it('caps a sitting at the requested size', () => {
    markMet(getAllEntries().slice(0, 40).map((e) => e.id))
    expect(buildSession(12)).toHaveLength(12)
  })

  it('interleaves packs rather than blocking them', () => {
    // Twelve from one pack and twelve from another: a blocked session would
    // run all of the first before any of the second.
    const [p1, p2] = getPacks()
    markMet([...p1.entries.slice(0, 6), ...p2.entries.slice(0, 6)].map((e) => e.id))
    const session = buildSession(12)
    const packOf = (id: string) => (p1.entries.some((e) => e.id === id) ? 1 : 2)
    let switches = 0
    for (let i = 1; i < session.length; i++) {
      if (packOf(session[i].entry.id) !== packOf(session[i - 1].entry.id)) switches++
    }
    expect(switches).toBeGreaterThan(4)
  })

  it('leaves out chunks that are not yet due', () => {
    markMet(['a0-elke-dag', 'a0-de-man'])
    recordAttempt('a0-elke-dag', true)
    expect(buildSession().map((c) => c.entry.id)).toEqual(['a0-de-man'])
  })

  it('gives nouns the article drill at least some of the time', () => {
    const noun = getArticleEntries()[0]
    const kinds = [0, 1, 2, 3].map((i) => pickDrill(noun, i))
    expect(kinds).toContain('article')
    expect(kinds).toContain('recall')
  })

  it('never asks the article drill about a non-noun', () => {
    for (const e of getAllEntries()) {
      if (e.pos === 'noun') continue
      for (let i = 0; i < 6; i++) expect(pickDrill(e, i)).not.toBe('article')
    }
  })
})

describe('answer checking', () => {
  it('ignores case, accents and punctuation', () => {
    expect(normalize('  Élke, DAG! ')).toBe('elke dag')
  })

  it('accepts the chunk typed correctly', () => {
    const e = getEntry('a0-elke-dag')!
    expect(checkRecall(e, 'elke dag')).toBe(true)
    expect(checkRecall(e, '  Elke Dag.  ')).toBe(true)
  })

  it('rejects an empty or wrong answer', () => {
    const e = getEntry('a0-elke-dag')!
    expect(checkRecall(e, '')).toBe(false)
    expect(checkRecall(e, '   ')).toBe(false)
    expect(checkRecall(e, 'elke week')).toBe(false)
  })

  // The point of storing the article with the noun is lost if a bare noun passes.
  it('rejects a noun typed without its article', () => {
    const e = getEntry('a0-het-huis')!
    expect(checkRecall(e, 'het huis')).toBe(true)
    expect(checkRecall(e, 'huis')).toBe(false)
    expect(checkRecall(e, 'de huis')).toBe(false)
  })

  it('checks the article on its own', () => {
    const e = getEntry('a0-het-huis')!
    expect(checkArticle(e, 'het')).toBe(true)
    expect(checkArticle(e, 'de')).toBe(false)
  })

  it('builds a cloze from an example that contains the chunk', () => {
    const e = getEntry('a0-elke-dag')!
    const c = buildCloze(e)
    expect(c).not.toBeNull()
    expect(c!.sentence).toContain('___')
    expect(c!.sentence).not.toContain('elke dag')
    expect(c!.answer).toBe('elke dag')
  })

  it('returns null when no example contains the chunk', () => {
    const fake = { ...getEntry('a0-elke-dag')!, chunk: 'zzzz', examples: [{ nl: 'Niets.', en: 'Nothing.' }] }
    expect(buildCloze(fake)).toBeNull()
  })
})

describe('progress', () => {
  it('reports pack progress', () => {
    const p = getPacks()[0]
    expect(getPackProgress(p.id)).toEqual({ met: 0, mastered: 0, total: p.entries.length })
    markMet([p.entries[0].id, p.entries[1].id])
    expect(getPackProgress(p.id).met).toBe(2)
  })

  it('reports stage progress', () => {
    const before = getStageProgress('A0')
    expect(before.met).toBe(0)
    expect(before.total).toBeGreaterThan(0)
    markMet([getPacksByStage('A0')[0].entries[0].id])
    expect(getStageProgress('A0').met).toBe(1)
  })

  it('offers the first unfinished pack as the next step', () => {
    expect(getNextPack()?.id).toBe(getPacks()[0].id)
    markMet(getPacks()[0].entries.map((e) => e.id))
    expect(getNextPack()?.id).toBe(getPacks()[1].id)
  })

  it('offers nothing once every chunk has been met', () => {
    markMet(getAllEntries().map((e) => e.id))
    expect(getNextPack()).toBeUndefined()
  })
})
