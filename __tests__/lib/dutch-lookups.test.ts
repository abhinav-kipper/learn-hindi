import { describe, it, expect, beforeEach } from 'vitest'
import { getLookups, addLookup, clearLookups, Lookup } from '@/lib/dutch/lookups'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v },
    removeItem: (k: string) => { delete store[k] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

const mk = (word: string, translation = 'x'): Lookup => ({ word, translation, ts: '2026-01-01' })

describe('dutch lookups history', () => {
  beforeEach(() => localStorage.clear())

  it('starts empty', () => {
    expect(getLookups()).toEqual([])
  })

  it('adds most-recent-first', () => {
    addLookup(mk('huis'))
    addLookup(mk('boom'))
    expect(getLookups().map((l) => l.word)).toEqual(['boom', 'huis'])
  })

  it('dedupes case-insensitively and bumps to the top', () => {
    addLookup(mk('huis'))
    addLookup(mk('boom'))
    addLookup(mk('HUIS'))
    const words = getLookups().map((l) => l.word)
    expect(words).toEqual(['HUIS', 'boom'])
    expect(words.length).toBe(2)
  })

  it('trims whitespace and ignores blank words', () => {
    addLookup(mk('  water  '))
    addLookup(mk('   '))
    expect(getLookups().map((l) => l.word)).toEqual(['water'])
  })

  it('caps the history at 24 entries', () => {
    for (let i = 0; i < 30; i++) addLookup(mk(`w${i}`))
    const all = getLookups()
    expect(all.length).toBe(24)
    expect(all[0].word).toBe('w29') // newest first
  })

  it('is language-namespaced', () => {
    addLookup(mk('huis'), 'dutch')
    addLookup(mk('ghar'), 'hindi')
    expect(getLookups('dutch').map((l) => l.word)).toEqual(['huis'])
    expect(getLookups('hindi').map((l) => l.word)).toEqual(['ghar'])
  })

  it('clears', () => {
    addLookup(mk('huis'))
    clearLookups()
    expect(getLookups()).toEqual([])
  })

  it('survives corrupt storage', () => {
    localStorage.setItem('dutch-lookups', '{not json')
    expect(getLookups()).toEqual([])
  })
})
