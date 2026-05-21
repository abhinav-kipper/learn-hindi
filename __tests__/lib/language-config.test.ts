import { describe, it, expect } from 'vitest'
import { LANGUAGE_CONFIGS, ACTIVE_LANGUAGE_KEY } from '@/lib/language-config'

describe('LANGUAGE_CONFIGS', () => {
  it('hindi config has correct values', () => {
    expect(LANGUAGE_CONFIGS.hindi.storagePrefix).toBe('hindi')
    expect(LANGUAGE_CONFIGS.hindi.ttsLocale).toBe('hi')
    expect(LANGUAGE_CONFIGS.hindi.flag).toBe('🇮🇳')
    expect(LANGUAGE_CONFIGS.hindi.code).toBe('hindi')
  })

  it('dutch config has correct values', () => {
    expect(LANGUAGE_CONFIGS.dutch.storagePrefix).toBe('dutch')
    expect(LANGUAGE_CONFIGS.dutch.ttsLocale).toBe('nl')
    expect(LANGUAGE_CONFIGS.dutch.flag).toBe('🇳🇱')
    expect(LANGUAGE_CONFIGS.dutch.code).toBe('dutch')
  })

  it('ACTIVE_LANGUAGE_KEY is correct', () => {
    expect(ACTIVE_LANGUAGE_KEY).toBe('app-active-language')
  })

  it('both languages have all required fields', () => {
    for (const config of Object.values(LANGUAGE_CONFIGS)) {
      expect(config.name).toBeTruthy()
      expect(config.inputPlaceholder).toBeTruthy()
      expect(config.practiceInputPlaceholder).toBeTruthy()
      expect(config.practiceTooltip).toBeTruthy()
    }
  })
})
