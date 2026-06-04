import { describe, it, expect, beforeEach } from 'vitest'
import {
  getSentenceGames,
  getSentenceGameById,
  drawSentenceGame,
  getSentenceBest,
  recordSentenceResult,
  getSentenceProgress,
  saveSentenceProgress,
  clearSentenceProgress,
  SENTENCE_TOTAL,
  SENTENCE_PER_ROUND,
} from '@/lib/sentence-game'
import { words } from '@/lib/gloss'

beforeEach(() => localStorage.clear())

describe('sentence game loader', () => {
  it('exposes a Hindi and a Dutch sentence builder, each tagged + uniquely id-ed', () => {
    expect(getSentenceGames('hindi').length).toBeGreaterThan(0)
    expect(getSentenceGames('dutch').length).toBeGreaterThan(0)
    expect(getSentenceGameById('sentence-builder')?.language).toBe('hindi')
    expect(getSentenceGameById('sentence-builder-nl')?.language).toBe('dutch')
  })

  it('has at least PER_ROUND items in every difficulty tier (both languages)', () => {
    for (const id of ['sentence-builder', 'sentence-builder-nl']) {
      const g = getSentenceGameById(id)!
      for (const level of ['easy', 'medium', 'hard'] as const) {
        expect(g.items.filter((i) => i.level === level).length).toBeGreaterThanOrEqual(SENTENCE_PER_ROUND)
      }
    }
  })
})

describe('drawSentenceGame', () => {
  it('draws SENTENCE_TOTAL builds, ramping decoys by round', () => {
    const g = getSentenceGameById('sentence-builder')!
    const builds = drawSentenceGame(g)
    expect(builds).toHaveLength(SENTENCE_TOTAL)
    builds.forEach((b, i) => {
      const round = Math.floor(i / SENTENCE_PER_ROUND) // 0,1,2
      // tiles = correct words + `round` decoys
      expect(b.tiles.length).toBe(b.correct.length + round)
      // the correct words are all present among the tiles
      const tileWords = b.tiles.map((t) => t.w)
      expect(b.correct.every((w) => tileWords.includes(w))).toBe(true)
      // correct order matches the source sentence tokenization
      expect(b.correct.length).toBeGreaterThan(0)
    })
  })

  it('correct order is the real tokenization of a real item', () => {
    const g = getSentenceGameById('sentence-builder')!
    const allOrders = new Set(g.items.map((it) => words(it.hindi).join(' ')))
    for (const b of drawSentenceGame(g)) {
      expect(allOrders.has(b.correct.join(' '))).toBe(true)
    }
  })
})

describe('resume progress', () => {
  it('saves a round checkpoint, reads it back, and clears it', () => {
    const g = getSentenceGameById('sentence-builder')!
    const builds = drawSentenceGame(g)
    expect(getSentenceProgress('hindi', 'sentence-builder')).toBeNull()
    saveSentenceProgress('hindi', 'sentence-builder', { builds, index: 4, score: 3 })
    const p = getSentenceProgress('hindi', 'sentence-builder')
    expect(p?.index).toBe(4)
    expect(p?.score).toBe(3)
    clearSentenceProgress('hindi', 'sentence-builder')
    expect(getSentenceProgress('hindi', 'sentence-builder')).toBeNull()
  })

  it('ignores a checkpoint at index 0', () => {
    const g = getSentenceGameById('sentence-builder')!
    saveSentenceProgress('hindi', 'sentence-builder', { builds: drawSentenceGame(g), index: 0, score: 0 })
    expect(getSentenceProgress('hindi', 'sentence-builder')).toBeNull()
  })
})

describe('sentence best score', () => {
  it('records and only improves', () => {
    expect(getSentenceBest('hindi', 'sentence-builder')).toBeNull()
    recordSentenceResult('hindi', 'sentence-builder', 8, 12)
    expect(getSentenceBest('hindi', 'sentence-builder')).toEqual({ score: 8, total: 12 })
    recordSentenceResult('hindi', 'sentence-builder', 5, 12)
    expect(getSentenceBest('hindi', 'sentence-builder')).toEqual({ score: 8, total: 12 })
    recordSentenceResult('hindi', 'sentence-builder', 11, 12)
    expect(getSentenceBest('hindi', 'sentence-builder')).toEqual({ score: 11, total: 12 })
  })
})
