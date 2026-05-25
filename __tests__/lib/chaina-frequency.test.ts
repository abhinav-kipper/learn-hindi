import { describe, it, expect, beforeEach } from 'vitest'
import { canFire, markFired } from '@/components/design/chainaFrequency'

describe('chainaFrequency', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('once-per-session', () => {
    it('returns true the first time', () => {
      expect(canFire('foo', 'once-per-session')).toBe(true)
    })

    it('returns false after markFired in the same session', () => {
      markFired('foo', 'once-per-session')
      expect(canFire('foo', 'once-per-session')).toBe(false)
    })
  })

  describe('once-per-day', () => {
    it('returns true the first time', () => {
      expect(canFire('foo', 'once-per-day')).toBe(true)
    })

    it('returns false after markFired today', () => {
      markFired('foo', 'once-per-day')
      expect(canFire('foo', 'once-per-day')).toBe(false)
    })

    it('returns true if last fired on a different day', () => {
      localStorage.setItem('chaina-freq-foo', 'Wed May 21 2025')
      expect(canFire('foo', 'once-per-day')).toBe(true)
    })
  })

  describe('debounce-800ms', () => {
    it('returns true the first time', () => {
      expect(canFire('foo', 'debounce-800ms')).toBe(true)
    })

    it('returns false within 800ms of markFired', () => {
      markFired('foo', 'debounce-800ms')
      expect(canFire('foo', 'debounce-800ms')).toBe(false)
    })

    it('returns true after >800ms', () => {
      localStorage.setItem('chaina-freq-foo', String(Date.now() - 1000))
      expect(canFire('foo', 'debounce-800ms')).toBe(true)
    })
  })
})
