import { describe, it, expect, beforeEach } from 'vitest'
import {
  getArchived,
  addArchived,
  removeArchived,
  isArchived,
  storageKey,
} from './vocab-archive'

beforeEach(() => {
  localStorage.clear()
})

describe('vocab-archive', () => {
  it('storageKey is per-language', () => {
    expect(storageKey('hindi')).toBe('hindi-vocab-archived')
    expect(storageKey('dutch')).toBe('dutch-vocab-archived')
  })

  it('getArchived returns empty array when not set', () => {
    expect(getArchived('hindi')).toEqual([])
  })

  it('addArchived appends a hindi headword', () => {
    addArchived('hindi', 'namaste')
    expect(getArchived('hindi')).toEqual(['namaste'])
  })

  it('addArchived is idempotent (no duplicates)', () => {
    addArchived('hindi', 'namaste')
    addArchived('hindi', 'namaste')
    expect(getArchived('hindi')).toEqual(['namaste'])
  })

  it('removeArchived drops the entry', () => {
    addArchived('hindi', 'namaste')
    addArchived('hindi', 'shukriya')
    removeArchived('hindi', 'namaste')
    expect(getArchived('hindi')).toEqual(['shukriya'])
  })

  it('removeArchived is a no-op for missing entries', () => {
    addArchived('hindi', 'namaste')
    removeArchived('hindi', 'not-present')
    expect(getArchived('hindi')).toEqual(['namaste'])
  })

  it('isArchived reflects add/remove', () => {
    expect(isArchived('hindi', 'chai')).toBe(false)
    addArchived('hindi', 'chai')
    expect(isArchived('hindi', 'chai')).toBe(true)
    removeArchived('hindi', 'chai')
    expect(isArchived('hindi', 'chai')).toBe(false)
  })

  it('per-language sets are isolated', () => {
    addArchived('hindi', 'chai')
    expect(getArchived('hindi')).toEqual(['chai'])
    expect(getArchived('dutch')).toEqual([])
  })

  it('getArchived returns empty array on corrupt JSON', () => {
    localStorage.setItem('hindi-vocab-archived', 'not-json{')
    expect(getArchived('hindi')).toEqual([])
  })
})

import { migrateLegacyKnown } from './vocab-archive'

describe('vocab-archive: legacy migration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('copies legacy vocab-known entries into per-language archived', () => {
    localStorage.setItem('vocab-known', JSON.stringify(['namaste', 'chai']))
    migrateLegacyKnown('hindi')
    expect(getArchived('hindi').sort()).toEqual(['chai', 'namaste'])
  })

  it('preserves words that were already archived', () => {
    addArchived('hindi', 'pre-existing')
    localStorage.setItem('vocab-known', JSON.stringify(['namaste']))
    migrateLegacyKnown('hindi')
    expect(getArchived('hindi').sort()).toEqual(['namaste', 'pre-existing'])
  })

  it('does not wipe the legacy vocab-known key', () => {
    localStorage.setItem('vocab-known', JSON.stringify(['namaste']))
    migrateLegacyKnown('hindi')
    expect(JSON.parse(localStorage.getItem('vocab-known') ?? '[]')).toEqual([
      'namaste',
    ])
  })

  it('is idempotent — running twice does not duplicate', () => {
    localStorage.setItem('vocab-known', JSON.stringify(['namaste']))
    migrateLegacyKnown('hindi')
    migrateLegacyKnown('hindi')
    expect(getArchived('hindi')).toEqual(['namaste'])
  })

  it('is a no-op when legacy vocab-known is absent', () => {
    migrateLegacyKnown('hindi')
    expect(getArchived('hindi')).toEqual([])
  })

  it('handles corrupt legacy JSON gracefully', () => {
    localStorage.setItem('vocab-known', 'broken{')
    migrateLegacyKnown('hindi')
    expect(getArchived('hindi')).toEqual([])
  })
})
