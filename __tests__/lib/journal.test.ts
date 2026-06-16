import { describe, it, expect, beforeEach } from 'vitest'
import {
  PROMPTS,
  dateKey,
  promptForDate,
  saveEntry,
  getEntry,
  getJournaledDateKeys,
  getArchive,
  getJournalStreak,
  getCalendar,
  analyzeEntryOffline,
  keepRealFixes,
} from '@/lib/journal'

const P = 'hindi'
beforeEach(() => localStorage.clear())

// helper: a done entry on a given Date
function tuck(d: Date, entry = 'Aaj maine chai pi.') {
  saveEntry(P, dateKey(d), { entry, done: true, ts: new Date().toISOString() })
}

describe('dateKey', () => {
  it('formats local YYYY-MM-DD', () => {
    expect(dateKey(new Date(2026, 5, 16))).toBe('2026-06-16')
  })
})

describe('promptForDate', () => {
  it('is deterministic and stable for the same day', () => {
    const d = new Date(2026, 5, 16)
    expect(promptForDate(d)).toBe(promptForDate(new Date(2026, 5, 16)))
  })
  it('rotates across the prompt list', () => {
    const seen = new Set<string>()
    for (let i = 0; i < PROMPTS.length; i++) {
      seen.add(promptForDate(new Date(2026, 0, 1 + i)).id)
    }
    expect(seen.size).toBe(PROMPTS.length)
  })
})

describe('persistence', () => {
  it('round-trips an entry', () => {
    saveEntry(P, '2026-06-16', { entry: 'hi', done: false, ts: 't' })
    expect(getEntry(P, '2026-06-16')?.entry).toBe('hi')
    expect(getEntry(P, '2026-06-16')?.done).toBe(false)
  })
  it('only lists done entries in journaled keys', () => {
    saveEntry(P, '2026-06-14', { entry: 'a', done: true, ts: 't' })
    saveEntry(P, '2026-06-15', { entry: 'b', done: false, ts: 't' })
    expect(getJournaledDateKeys(P)).toEqual(['2026-06-14'])
  })
  it('namespaces by prefix', () => {
    saveEntry('dutch', '2026-06-16', { entry: 'x', done: true, ts: 't' })
    expect(getJournaledDateKeys('hindi')).toEqual([])
    expect(getJournaledDateKeys('dutch')).toEqual(['2026-06-16'])
  })
})

describe('archive', () => {
  it('builds newest-first pages with the day prompt', () => {
    tuck(new Date(2026, 5, 14))
    tuck(new Date(2026, 5, 16))
    const arch = getArchive(P)
    expect(arch.map((a) => a.dateKey)).toEqual(['2026-06-16', '2026-06-14'])
    expect(arch[0].prompt).toBe(promptForDate(new Date(2026, 5, 16)).hinglish)
  })
})

describe('streak', () => {
  it('counts consecutive days ending today', () => {
    const today = new Date(2026, 5, 16)
    tuck(today)
    tuck(new Date(2026, 5, 15))
    tuck(new Date(2026, 5, 14))
    expect(getJournalStreak(P, today)).toBe(3)
  })
  it('still counts a live streak when today is not done yet', () => {
    const today = new Date(2026, 5, 16)
    tuck(new Date(2026, 5, 15))
    tuck(new Date(2026, 5, 14))
    expect(getJournalStreak(P, today)).toBe(2)
  })
  it('breaks on a gap', () => {
    const today = new Date(2026, 5, 16)
    tuck(today)
    tuck(new Date(2026, 5, 13)) // gap on 14, 15
    expect(getJournalStreak(P, today)).toBe(1)
  })
  it('is 0 with no history', () => {
    expect(getJournalStreak(P, new Date(2026, 5, 16))).toBe(0)
  })
})

describe('calendar', () => {
  it('marks journaled + today across the window', () => {
    const today = new Date(2026, 5, 16)
    tuck(today)
    tuck(new Date(2026, 5, 12))
    const cells = getCalendar(P, 21, today)
    expect(cells).toHaveLength(21)
    expect(cells[cells.length - 1].isToday).toBe(true)
    expect(cells[cells.length - 1].journaled).toBe(true)
    expect(cells.find((c) => c.dateKey === '2026-06-12')?.journaled).toBe(true)
    expect(cells.find((c) => c.dateKey === '2026-06-13')?.journaled).toBe(false)
  })
})

describe('analyzeEntryOffline', () => {
  it('flags a genuine slip (mai -> main)', () => {
    const r = analyzeEntryOffline('aaj mai khush hoon')
    expect(r.fixes.some((f) => f.fix === 'main')).toBe(true)
    expect(r.mood).toBe('happy')
  })
  it('does not nitpick valid house spellings', () => {
    const r = analyzeEntryOffline('aaj maine accha khaaya')
    expect(r.fixes.every((f) => f.fix !== 'achha')).toBe(true)
  })
  it('returns an enrich nudge when clean', () => {
    const r = analyzeEntryOffline('sab badhiya raha')
    expect(r.fixes).toHaveLength(1)
    expect(r.fixes[0].enrich).toBe(true)
  })
})

describe('keepRealFixes (anti-hallucination guard)', () => {
  const entry = 'aaj mai bahut khush hu'
  it('keeps a fix whose original is in the entry', () => {
    const out = keepRealFixes(entry, [{ original: 'mai', fix: 'main', note: 'x' }])
    expect(out).toHaveLength(1)
    expect(out[0].fix).toBe('main')
  })
  it('drops a phantom fix whose original is not in the entry', () => {
    const out = keepRealFixes(entry, [{ original: 'kitaab', fix: 'kitaabein', note: 'x' }])
    expect(out).toHaveLength(0)
  })
  it('drops empty and no-op fixes', () => {
    const out = keepRealFixes(entry, [
      { original: '', fix: 'main', note: '' },
      { original: 'mai', fix: 'mai', note: 'same' },
    ])
    expect(out).toHaveLength(0)
  })
  it('caps at five fixes by default', () => {
    const entry6 = 'mai hu muje thik nai bhi'
    const many = entry6.split(' ').map((w) => ({ original: w, fix: w + 'x', note: '' }))
    expect(keepRealFixes(entry6, many).length).toBe(5)
  })
  it('honours a custom max', () => {
    const many = 'mai hu muje'.split(' ').map((w) => ({ original: w, fix: w + 'x', note: '' }))
    expect(keepRealFixes('mai hu muje', many, 2).length).toBe(2)
  })
})
