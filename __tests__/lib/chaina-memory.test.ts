import { describe, it, expect, beforeEach } from 'vitest'
import {
  getMemory,
  saveMemory,
  mergeMemory,
  applyRemember,
  isReturning,
  emptyMemory,
  FACTS_CAP,
  THREADS_CAP,
  type ChainaMemory,
} from '@/lib/chaina-memory'

describe('chaina-memory', () => {
  beforeEach(() => localStorage.clear())

  it('returns an empty card when nothing is stored', () => {
    expect(getMemory('hindi')).toEqual(emptyMemory())
  })

  it('round-trips through localStorage', () => {
    const mem: ChainaMemory = {
      facts: ['has a sister Priya'],
      threads: ['interview Friday'],
      runningSummary: 'New friend, eager.',
      lastTopic: 'family',
      lastSeenAt: '2026-06-01T10:00:00.000Z',
      chatCount: 3,
    }
    saveMemory(mem, 'hindi')
    expect(getMemory('hindi')).toEqual(mem)
  })

  it('keeps memory separate per language prefix', () => {
    saveMemory({ ...emptyMemory(), facts: ['hindi fact'] }, 'hindi')
    saveMemory({ ...emptyMemory(), facts: ['dutch fact'] }, 'dutch')
    expect(getMemory('hindi').facts).toEqual(['hindi fact'])
    expect(getMemory('dutch').facts).toEqual(['dutch fact'])
  })

  it('merges new facts and threads, dedupes case-insensitively', () => {
    const base = { ...emptyMemory(), facts: ['Likes chai'], threads: ['visit'] }
    const next = mergeMemory(base, { newFacts: ['likes chai', 'works in tech'], newThreads: ['trip'] })
    expect(next.facts).toEqual(['likes chai', 'works in tech'])
    expect(next.threads).toEqual(['visit', 'trip'])
  })

  it('drops resolved threads', () => {
    const base = { ...emptyMemory(), threads: ['interview Friday', 'sister visit'] }
    const next = mergeMemory(base, { resolvedThreads: ['interview friday'] })
    expect(next.threads).toEqual(['sister visit'])
  })

  it('caps facts and threads, keeping the most recent', () => {
    const manyFacts = Array.from({ length: FACTS_CAP + 5 }, (_, i) => `fact ${i}`)
    const manyThreads = Array.from({ length: THREADS_CAP + 3 }, (_, i) => `thread ${i}`)
    const next = mergeMemory(emptyMemory(), { newFacts: manyFacts, newThreads: manyThreads })
    expect(next.facts).toHaveLength(FACTS_CAP)
    expect(next.threads).toHaveLength(THREADS_CAP)
    expect(next.facts.at(-1)).toBe(`fact ${FACTS_CAP + 4}`)
  })

  it('replaces summary/topic only when provided, bumps count + stamps time', () => {
    const base = { ...emptyMemory(), runningSummary: 'old', lastTopic: 'food', chatCount: 2 }
    const now = new Date('2026-06-02T09:00:00.000Z')
    const a = mergeMemory(base, {}, now)
    expect(a.runningSummary).toBe('old')
    expect(a.lastTopic).toBe('food')
    expect(a.chatCount).toBe(3)
    expect(a.lastSeenAt).toBe(now.toISOString())
    const b = mergeMemory(base, { runningSummary: 'new gist', lastTopic: 'work' }, now)
    expect(b.runningSummary).toBe('new gist')
    expect(b.lastTopic).toBe('work')
  })

  it('applyRemember persists the merged result', () => {
    applyRemember({ newFacts: ['lives in Amsterdam'] }, 'hindi')
    expect(getMemory('hindi').facts).toEqual(['lives in Amsterdam'])
    expect(getMemory('hindi').chatCount).toBe(1)
  })

  it('isReturning is true when never seen or after the gap', () => {
    const now = new Date('2026-06-02T12:00:00.000Z')
    expect(isReturning(emptyMemory(), 12, now)).toBe(true)
    const recent = { ...emptyMemory(), lastSeenAt: '2026-06-02T08:00:00.000Z' }
    expect(isReturning(recent, 12, now)).toBe(false)
    const old = { ...emptyMemory(), lastSeenAt: '2026-06-01T08:00:00.000Z' }
    expect(isReturning(old, 12, now)).toBe(true)
  })
})
