'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, LanguageConfig, LANGUAGE_CONFIGS, ACTIVE_LANGUAGE_KEY } from './language-config'

interface LanguageContextValue {
  language: Language
  config: LanguageConfig
  setLanguage: (lang: Language) => void
  toggle: () => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('hindi')

  useEffect(() => {
    const stored = localStorage.getItem(ACTIVE_LANGUAGE_KEY)
    if (stored === 'dutch' || stored === 'hindi') {
      setLanguageState(stored)
    }
  }, [])

  function setLanguage(lang: Language) {
    setLanguageState(lang)
    localStorage.setItem(ACTIVE_LANGUAGE_KEY, lang)
  }

  function toggle() {
    setLanguage(language === 'hindi' ? 'dutch' : 'hindi')
  }

  return (
    <LanguageContext.Provider value={{ language, config: LANGUAGE_CONFIGS[language], setLanguage, toggle }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
