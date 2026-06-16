import { describe, it, expect, beforeEach } from 'vitest'
import {
  getDuels,
  getDuelById,
  drawDuelRound,
  getDuelBest,
  recordDuelResult,
  getDuelProgress,
  saveDuelProgress,
  clearDuelProgress,
} from '@/lib/games'

beforeEach(() => localStorage.clear())

describe('duel loader', () => {
  it('has both Hindi and Dutch duels, each tagged correctly', () => {
    const hi = getDuels('hindi')
    const nl = getDuels('dutch')
    expect(hi.length).toBeGreaterThanOrEqual(3)
    expect(nl.length).toBeGreaterThanOrEqual(2)
    expect(hi.every((d) => d.language === 'hindi')).toBe(true)
    expect(nl.every((d) => d.language === 'dutch')).toBe(true)
  })

  it('every duel has a valid shape (sides + ≥30 well-formed items)', () => {
    for (const d of [...getDuels('hindi'), ...getDuels('dutch')]) {
      expect(d.left.label).toBeTruthy()
      expect(d.right.label).toBeTruthy()
      expect(d.items.length).toBeGreaterThanOrEqual(30)
      expect(d.items.every((it) => it.answer === 'left' || it.answer === 'right')).toBe(true)
      expect(d.items.every((it) => typeof it.prompt === 'string' && it.prompt.length > 0)).toBe(true)
    }
  })

  it('finds each expected duel by id', () => {
    for (const id of ['gender', 'ne-rule', 'hai-hain', 'register', 'de-het', 'hebben-zijn']) {
      expect(getDuelById(id)).toBeDefined()
    }
  })
})

describe('resume progress', () => {
  it('saves, reads, and clears a mid-game checkpoint', () => {
    const d = getDuelById('gender')!
    expect(getDuelProgress('hindi', 'gender')).toBeNull()
    saveDuelProgress('hindi', 'gender', { items: d.items.slice(0, 30), index: 10, score: 8, combo: 3 })
    const p = getDuelProgress('hindi', 'gender')
    expect(p?.index).toBe(10)
    expect(p?.score).toBe(8)
    clearDuelProgress('hindi', 'gender')
    expect(getDuelProgress('hindi', 'gender')).toBeNull()
  })

  it('ignores an out-of-range checkpoint', () => {
    const d = getDuelById('gender')!
    saveDuelProgress('hindi', 'gender', { items: d.items.slice(0, 30), index: 0, score: 0, combo: 0 })
    expect(getDuelProgress('hindi', 'gender')).toBeNull()
  })
})

describe('drawDuelRound', () => {
  it('draws `rounds` items from the pool (capped at pool size)', () => {
    const d = getDuelById('gender')!
    const round = drawDuelRound(d, 30)
    expect(round).toHaveLength(30)
    const pool = new Set(d.items)
    expect(round.every((it) => pool.has(it))).toBe(true)
  })

  it('never returns more than the pool has', () => {
    const d = getDuelById('gender')!
    expect(drawDuelRound(d, 9999).length).toBe(d.items.length)
  })
})

describe('best score', () => {
  it('returns null before any play', () => {
    expect(getDuelBest('hindi', 'gender')).toBeNull()
  })

  it('records and only updates on improvement', () => {
    recordDuelResult('hindi', 'gender', 20, 30)
    expect(getDuelBest('hindi', 'gender')).toEqual({ score: 20, total: 30 })

    recordDuelResult('hindi', 'gender', 15, 30) // worse, ignored
    expect(getDuelBest('hindi', 'gender')).toEqual({ score: 20, total: 30 })

    recordDuelResult('hindi', 'gender', 27, 30) // better
    expect(getDuelBest('hindi', 'gender')).toEqual({ score: 27, total: 30 })
  })

  it('keeps best per language prefix', () => {
    recordDuelResult('hindi', 'gender', 25, 30)
    expect(getDuelBest('dutch', 'gender')).toBeNull()
  })
})
