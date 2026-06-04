'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getProgress } from '@/lib/progress'
import { useLanguage } from '@/lib/language-context'
import { playSound } from '@/lib/sounds'
import { COLORS, FONTS, BORDER, SHADOW, useTheme } from '@/components/design'
const W = '#fff' // @design-allow: white literal

const tabs = [
  { href: '/', label: 'home', icon: HomeIcon, requiresLesson: false },
  { href: '/play', label: 'play', icon: QuizIcon, requiresLesson: false },
  { href: '/vocabulary', label: 'words', icon: VocabIcon, requiresLesson: false },
  { href: '/progress', label: 'you', icon: ProgressIcon, requiresLesson: false },
]

export function BottomNav() {
  const pathname = usePathname()
  const { config, toggle } = useLanguage()
  const [hasCompletedLesson, setHasCompletedLesson] = useState(true)

  useEffect(() => {
    const progress = getProgress(config.storagePrefix)
    setHasCompletedLesson(progress.completedLessons.length > 0)
  }, [pathname, config.storagePrefix])

  if (
    pathname.startsWith('/lessons/') ||
    pathname.startsWith('/practice/') ||
    pathname.startsWith('/play/duel/') ||
    pathname.startsWith('/play/sentence/') ||
    pathname.startsWith('/chaina') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/_dev')
  ) {
    return null
  }

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 12,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          background: W,
          border: BORDER.sticker,
          borderRadius: 99,
          boxShadow: SHADOW.sticker,
          padding: '6px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          gap: 4,
          pointerEvents: 'auto',
        }}
      >
        <button
          type="button"
          onClick={() => {
            playSound('tap')
            toggle()
          }}
          title={`Switch to ${config.code === 'hindi' ? 'Dutch' : 'Hindi'}`}
          aria-label={`Switch to ${config.code === 'hindi' ? 'Dutch' : 'Hindi'}`}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '6px 8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            borderRadius: 99,
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>{config.flag}</span>
          <span
            style={{
              fontFamily: FONTS.tag,
              fontSize: 8,
              color: COLORS.ink60,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}
          >
            {config.name}
          </span>
        </button>

        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          const isLocked = tab.requiresLesson && !hasCompletedLesson

          if (isLocked) {
            return (
              <div
                key={tab.href}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  padding: '6px 10px',
                  opacity: 0.4,
                }}
              >
                <tab.icon active={false} />
                <span
                  style={{
                    fontFamily: FONTS.tag,
                    fontSize: 8,
                    color: COLORS.ink45,
                    letterSpacing: 0.4,
                    textTransform: 'uppercase',
                  }}
                >
                  {tab.label}
                </span>
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 12,
                    height: 12,
                    borderRadius: 99,
                    background: COLORS.ink,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: COLORS.cream,
                  }}
                >
                  <LockIcon />
                </span>
              </div>
            )
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => playSound('tap')}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '6px 12px',
                borderRadius: 99,
                textDecoration: 'none',
                minWidth: 50,
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: COLORS.cream,
                    border: BORDER.thin,
                    borderRadius: 99,
                    zIndex: 0,
                  }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1 }}>
                <tab.icon active={isActive} />
              </span>
              <span
                style={{
                  position: 'relative',
                  zIndex: 1,
                  fontFamily: FONTS.tag,
                  fontSize: 8,
                  color: isActive ? COLORS.ink : COLORS.ink60,
                  letterSpacing: 0.4,
                  textTransform: 'uppercase',
                }}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function LockIcon() {
  return (
    <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  )
}

function HomeIcon({ active }: { active: boolean }) {
  const theme = useTheme()
  const stroke = active ? COLORS.ink : COLORS.ink60
  const fill = active ? theme.primary : 'none'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  )
}

function QuizIcon({ active }: { active: boolean }) {
  const stroke = active ? COLORS.ink : COLORS.ink60
  const fill = active ? COLORS.mint : 'none'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function VocabIcon({ active }: { active: boolean }) {
  const stroke = active ? COLORS.ink : COLORS.ink60
  const fill = active ? COLORS.butter : 'none'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      <path d="M8 7h8" />
      <path d="M8 11h6" />
    </svg>
  )
}

function ProgressIcon({ active }: { active: boolean }) {
  const stroke = active ? COLORS.ink : COLORS.ink60
  const fill = active ? COLORS.lav2 : 'none'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}
