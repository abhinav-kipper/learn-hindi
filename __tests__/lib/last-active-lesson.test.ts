import { describe, it, expect, beforeEach } from 'vitest'
import {
  setLastActiveLesson,
  getLastActiveLesson,
  clearLastActiveLesson,
} from '@/lib/last-active-lesson'

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

describe('last-active-lesson', () => {
  beforeEach(() => localStorage.clear())

  it('round-trips per prefix', () => {
    setLastActiveLesson('greetings', 'hindi')
    setLastActiveLesson('dutch-cafe', 'dutch')
    expect(getLastActiveLesson('hindi')).toBe('greetings')
    expect(getLastActiveLesson('dutch')).toBe('dutch-cafe')
  })

  it('returns null when nothing is set', () => {
    expect(getLastActiveLesson('hindi')).toBeNull()
  })

  it('overwrites with the newer lesson', () => {
    setLastActiveLesson('greetings', 'hindi')
    setLastActiveLesson('ordering-food', 'hindi')
    expect(getLastActiveLesson('hindi')).toBe('ordering-food')
  })

  it('clearLastActiveLesson removes the entry', () => {
    setLastActiveLesson('greetings', 'hindi')
    clearLastActiveLesson('hindi')
    expect(getLastActiveLesson('hindi')).toBeNull()
  })

  it('ignores empty lessonId', () => {
    setLastActiveLesson('', 'hindi')
    expect(getLastActiveLesson('hindi')).toBeNull()
  })

  it('storage keys are language-prefixed', () => {
    setLastActiveLesson('greetings', 'hindi')
    const raw = localStorageMock._dump()
    expect(raw['hindi-last-active-lesson']).toBe('greetings')
    expect(raw['dutch-last-active-lesson']).toBeUndefined()
  })
})
