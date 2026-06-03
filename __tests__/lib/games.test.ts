import { describe, it, expect, beforeEach } from 'vitest'
import {
  getDuels,
  getDuelById,
  drawDuelRound,
  getDuelBest,
  recordDuelResult,
} from '@/lib/games'

beforeEach(() => localStorage.clear())

describe('duel loader', () => {
  it('returns Hindi duels and none for Dutch (yet)', () => {
    expect(getDuels('hindi').length).toBeGreaterThan(0)
    expect(getDuels('dutch')).toEqual([])
  })

  it('finds the gender duel by id with a valid shape', () => {
    const d = getDuelById('gender')
    expect(d).toBeDefined()
    expect(d!.left.label).toBeTruthy()
    expect(d!.right.label).toBeTruthy()
    expect(d!.items.length).toBeGreaterThanOrEqual(30)
    expect(d!.items.every((it) => it.answer === 'left' || it.answer === 'right')).toBe(true)
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
