/**
 * Tests for the mistake-extraction/persistence layer.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  extractCorrections,
  addMistake,
  getMistakes,
  deleteMistake,
  clearMistakes,
} from '@/lib/mistakes'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    _dump: () => ({ ...store }),
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

describe('extractCorrections', () => {
  it('returns unchanged content when no tag present', () => {
    const { cleaned, corrections } = extractCorrections('Hi! How are you doing?')
    expect(cleaned).toBe('Hi! How are you doing?')
    expect(corrections).toEqual([])
  })

  it('extracts a single double-quoted correction', () => {
    const msg = `arey wah!\n\n(Well said!)\n\n[[CORRECTION: original="main jaata hain" correct="main jaata hoon" reason="first person uses hoon"]]`
    const { cleaned, corrections } = extractCorrections(msg)
    expect(corrections).toHaveLength(1)
    expect(corrections[0]).toEqual({
      original: 'main jaata hain',
      correction: 'main jaata hoon',
      reason: 'first person uses hoon',
    })
    expect(cleaned).not.toContain('CORRECTION')
    expect(cleaned).toContain('arey wah')
  })

  it('extracts a single-quoted correction', () => {
    const msg = `text\n\n[[CORRECTION: original='ik ben goed' correct='het gaat goed met me' reason='natural Dutch']]`
    const { cleaned, corrections } = extractCorrections(msg)
    expect(corrections).toHaveLength(1)
    expect(corrections[0].correction).toBe('het gaat goed met me')
    expect(cleaned).not.toContain('CORRECTION')
  })

  it('handles missing reason field', () => {
    const msg = `text [[CORRECTION: original="X" correct="Y"]]`
    const { corrections } = extractCorrections(msg)
    expect(corrections[0]).toEqual({ original: 'X', correction: 'Y', reason: '' })
  })

  it('extracts multiple corrections from one message', () => {
    const msg = `oops!\n[[CORRECTION: original="A" correct="B" reason="r1"]]\n[[CORRECTION: original="C" correct="D" reason="r2"]]`
    const { cleaned, corrections } = extractCorrections(msg)
    expect(corrections).toHaveLength(2)
    expect(corrections.map(c => c.correction)).toEqual(['B', 'D'])
    expect(cleaned).toBe('oops!')
  })

  it('returns original message if cleaning would produce empty string', () => {
    const msg = `[[CORRECTION: original="X" correct="Y" reason="r"]]`
    const { cleaned, corrections } = extractCorrections(msg)
    expect(corrections).toHaveLength(1)
    // We don't want to display an empty bubble — fall back to original
    expect(cleaned).toBe(msg)
  })

  it('collapses excessive blank lines after stripping', () => {
    const msg = `Hi\n\n\n\n[[CORRECTION: original="a" correct="b"]]\n\n\nbye`
    const { cleaned } = extractCorrections(msg)
    expect(cleaned).toBe('Hi\n\nbye')
  })
})

describe('addMistake + getMistakes', () => {
  beforeEach(() => localStorage.clear())

  it('persists a mistake under {prefix}-mistakes', () => {
    addMistake({ original: 'X', correction: 'Y', reason: 'r' }, 'greetings', 'hindi')
    const raw = localStorageMock._dump()
    expect(raw['hindi-mistakes']).toBeDefined()
    expect(raw['dutch-mistakes']).toBeUndefined()
  })

  it('reads back mistakes for the matching prefix only', () => {
    addMistake({ original: 'A', correction: 'B', reason: '' }, 'greetings', 'hindi')
    addMistake({ original: 'C', correction: 'D', reason: '' }, 'dutch-cafe', 'dutch')

    expect(getMistakes('hindi')).toHaveLength(1)
    expect(getMistakes('dutch')).toHaveLength(1)
    expect(getMistakes('hindi')[0].original).toBe('A')
    expect(getMistakes('dutch')[0].original).toBe('C')
  })

  it('skips entries with empty original or correction', () => {
    addMistake({ original: '', correction: 'Y', reason: '' }, 'l', 'hindi')
    addMistake({ original: 'X', correction: '', reason: '' }, 'l', 'hindi')
    expect(getMistakes('hindi')).toHaveLength(0)
  })

  it('deleteMistake removes a specific entry', () => {
    addMistake({ original: 'A', correction: 'B', reason: '' }, 'l', 'hindi')
    addMistake({ original: 'C', correction: 'D', reason: '' }, 'l', 'hindi')
    const id = getMistakes('hindi')[0].id
    deleteMistake(id, 'hindi')
    const remaining = getMistakes('hindi')
    expect(remaining).toHaveLength(1)
    expect(remaining[0].original).toBe('C')
  })

  it('clearMistakes removes all entries for prefix', () => {
    addMistake({ original: 'A', correction: 'B', reason: '' }, 'l', 'hindi')
    addMistake({ original: 'C', correction: 'D', reason: '' }, 'l', 'dutch')
    clearMistakes('hindi')
    expect(getMistakes('hindi')).toHaveLength(0)
    expect(getMistakes('dutch')).toHaveLength(1)
  })
})
