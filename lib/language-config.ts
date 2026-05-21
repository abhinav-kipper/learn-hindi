export type Language = 'hindi' | 'dutch'

export interface LanguageConfig {
  code: Language
  name: string
  flag: string
  ttsLocale: string
  storagePrefix: string
  inputPlaceholder: string
  practiceInputPlaceholder: string
  practiceTooltip: string
}

export const LANGUAGE_CONFIGS: Record<Language, LanguageConfig> = {
  hindi: {
    code: 'hindi',
    name: 'Hindi',
    flag: '🇮🇳',
    ttsLocale: 'hi',
    storagePrefix: 'hindi',
    inputPlaceholder: 'Type in Hindi or English...',
    practiceInputPlaceholder: 'Type in Hindi or English...',
    practiceTooltip: 'The AI will start talking first — reply in Hindi (romanized) or English!',
  },
  dutch: {
    code: 'dutch',
    name: 'Dutch',
    flag: '🇳🇱',
    ttsLocale: 'nl',
    storagePrefix: 'dutch',
    inputPlaceholder: 'Type in Dutch or English...',
    practiceInputPlaceholder: 'Type in Dutch or English...',
    practiceTooltip: 'Your Dutch tutor will introduce the topic — reply in Dutch or English!',
  },
}

export const ACTIVE_LANGUAGE_KEY = 'app-active-language'
