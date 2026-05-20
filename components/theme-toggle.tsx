'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getTheme, setTheme, getResolvedTheme, initTheme, type Theme } from '@/lib/theme'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<Theme>('system')
  const [resolved, setResolved] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    initTheme()
    setCurrentTheme(getTheme())
    setResolved(getResolvedTheme())
    setMounted(true)
  }, [])

  const toggle = () => {
    // Cycle: light -> dark -> system
    const next: Theme = currentTheme === 'light' ? 'dark' : currentTheme === 'dark' ? 'system' : 'light'
    setTheme(next)
    setCurrentTheme(next)
    setResolved(next === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : next
    )
  }

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full bg-[var(--bg-surface)] border border-[var(--border)]" />
    )
  }

  return (
    <button
      onClick={toggle}
      aria-label={`Current theme: ${currentTheme}. Click to change.`}
      title={`Theme: ${currentTheme}`}
      className="relative w-9 h-9 flex items-center justify-center rounded-full bg-[var(--bg-surface)] backdrop-blur-sm border border-[var(--border)] shadow-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all duration-150"
    >
      <motion.div
        key={resolved}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {resolved === 'dark' ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M7.455 2.004a.75.75 0 01.26.77 7 7 0 009.958 7.967.75.75 0 011.067.853A8.5 8.5 0 116.647 1.921a.75.75 0 01.808.083z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.061-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.061zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.06 1.06l1.06 1.06z" />
          </svg>
        )}
      </motion.div>
      {/* System indicator dot */}
      {currentTheme === 'system' && (
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[var(--accent)] rounded-full border-2 border-[var(--bg-surface)]" />
      )}
    </button>
  )
}
