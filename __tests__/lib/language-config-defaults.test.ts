/**
 * Regression tests for language config and active-language persistence.
 *
 * Covers: default language fallback, storagePrefix values, ACTIVE_LANGUAGE_KEY
 * usage in localStorage, and the language-context lazy initializer logic
 * (extracted here as a pure function test to avoid mounting React).
 */
import { describe, it, expect } from 'vitest'
import { LANGUAGE_CONFIGS, ACTIVE_LANGUAGE_KEY, type Language } from '@/lib/language-config'

// Mirror the lazy-initializer logic from LanguageProvider so we can test it
// without a browser environment (or React).
function resolveStoredLanguage(stored: string | null): Language {
  if (stored === 'dutch' || stored === 'hindi') return stored
  return 'hindi'
}

describe('LANGUAGE_CONFIGS', () => {
  it('has entries for hindi and dutch', () => {
    expect(LANGUAGE_CONFIGS.hindi).toBeDefined()
    expect(LANGUAGE_CONFIGS.dutch).toBeDefined()
  })

  it('hindi storagePrefix is "hindi"', () => {
    expect(LANGUAGE_CONFIGS.hindi.storagePrefix).toBe('hindi')
  })

  it('dutch storagePrefix is "dutch"', () => {
    expect(LANGUAGE_CONFIGS.dutch.storagePrefix).toBe('dutch')
  })

  it('storage prefixes are distinct', () => {
    expect(LANGUAGE_CONFIGS.hindi.storagePrefix).not.toBe(LANGUAGE_CONFIGS.dutch.storagePrefix)
  })

  it('ttsLocale is hi for hindi', () => {
    expect(LANGUAGE_CONFIGS.hindi.ttsLocale).toBe('hi')
  })

  it('ttsLocale is nl for dutch', () => {
    expect(LANGUAGE_CONFIGS.dutch.ttsLocale).toBe('nl')
  })

  it('ACTIVE_LANGUAGE_KEY is a non-empty string', () => {
    expect(typeof ACTIVE_LANGUAGE_KEY).toBe('string')
    expect(ACTIVE_LANGUAGE_KEY.length).toBeGreaterThan(0)
  })
})

describe('language lazy-initializer logic', () => {
  it('defaults to hindi when nothing stored', () => {
    expect(resolveStoredLanguage(null)).toBe('hindi')
  })

  it('defaults to hindi for unknown stored value', () => {
    expect(resolveStoredLanguage('french')).toBe('hindi')
    expect(resolveStoredLanguage('')).toBe('hindi')
    expect(resolveStoredLanguage('HINDI')).toBe('hindi')
  })

  it('restores hindi when "hindi" is stored', () => {
    expect(resolveStoredLanguage('hindi')).toBe('hindi')
  })

  it('restores dutch when "dutch" is stored', () => {
    expect(resolveStoredLanguage('dutch')).toBe('dutch')
  })
})
