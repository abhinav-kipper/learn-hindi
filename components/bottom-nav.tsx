'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getProgress } from '@/lib/progress'
import { useLanguage } from '@/lib/language-context'

const tabs = [
  { href: '/', label: 'Home', icon: HomeIcon, requiresLesson: false },
  { href: '/quiz', label: 'Quiz', icon: QuizIcon, requiresLesson: true },
  { href: '/vocabulary', label: 'Vocabulary', icon: VocabIcon, requiresLesson: false },
  { href: '/progress', label: 'Progress', icon: ProgressIcon, requiresLesson: false },
]

export function BottomNav() {
  const pathname = usePathname()
  const { config, toggle } = useLanguage()
  const [hasCompletedLesson, setHasCompletedLesson] = useState(true) // default true to prevent flash

  useEffect(() => {
    const progress = getProgress()
    setHasCompletedLesson(progress.completedLessons.length > 0)
  }, [pathname]) // Re-check on navigation

  // Hide on lesson, practice, and onboarding pages (full-screen experiences)
  if (pathname.startsWith('/lessons/') || pathname.startsWith('/practice/') || pathname.startsWith('/onboarding')) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      <div className="max-w-md mx-auto bg-[var(--bg-surface)]/90 backdrop-blur-lg border-t border-[var(--border)] px-2 pt-2 pb-1">
        <div className="flex items-center justify-around">
          <button
            onClick={toggle}
            title={`Switch to ${config.code === 'hindi' ? 'Dutch' : 'Hindi'}`}
            className="relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg"
          >
            <span className="text-lg leading-none">{config.flag}</span>
            <span className="text-[10px] font-medium text-[var(--text-tertiary)]">{config.name}</span>
          </button>
          {tabs.map(tab => {
            const isActive = pathname === tab.href
            const isLocked = tab.requiresLesson && !hasCompletedLesson

            if (isLocked) {
              return (
                <div
                  key={tab.href}
                  className="relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg opacity-40"
                >
                  <span className="relative z-10">
                    <tab.icon active={false} />
                  </span>
                  <span className="relative z-10 text-[10px] font-medium text-[var(--text-tertiary)]">
                    {tab.label}
                  </span>
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[var(--text-tertiary)] rounded-full flex items-center justify-center">
                    <LockIcon />
                  </span>
                </div>
              )
            }

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-[var(--accent-soft)] rounded-lg"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  <tab.icon active={isActive} />
                </span>
                <span className={`relative z-10 text-[10px] font-medium ${
                  isActive ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'
                }`}>
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

function LockIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  )
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'var(--text-tertiary)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  )
}

function QuizIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'var(--text-tertiary)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function VocabIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'var(--text-tertiary)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      <path d="M8 7h8" />
      <path d="M8 11h6" />
    </svg>
  )
}

function ProgressIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'var(--text-tertiary)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}
