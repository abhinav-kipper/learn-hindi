'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { getAllLessons } from '@/lib/lessons'
import { getAllFoundations } from '@/lib/foundations'
import { getDutchLessons } from '@/lib/dutch/lessons'
import { getDutchFoundations } from '@/lib/dutch/foundations'
import { getProgress, getTodaySessions, isLessonComplete } from '@/lib/progress'
import { FeatureTooltip } from '@/components/feature-tooltip'
import { isOnboardingComplete, getUserProfile } from '@/lib/onboarding'
import { playSound, isMuted, toggleMute } from '@/lib/sounds'
import { useLanguage } from '@/lib/language-context'
import { DutchWelcomeModal } from '@/components/dutch-welcome-modal'
import { reorderLessonsByReason } from '@/lib/personalization'
import { getLastActiveLesson } from '@/lib/last-active-lesson'
import { getLessonPercent } from '@/lib/phrase-progress'
import { getUniversalLessonById } from '@/lib/all-content'
import { SearchOverlay } from '@/components/search-overlay'

import {
  Sticker,
  Tag,
  Cutting,
  MotifIcon,
  MarigoldStrip,
  StreakChip,
  DottedBg,
  LessonStickerCard,
  COLORS,
  FONTS,
  BORDER,
  SHADOW,
  useChaina,
  canFire,
  markFired,
} from '@/components/design'

type Tab = 'situations' | 'foundations'

export default function Home() {
  const router = useRouter()
  const { language, config } = useLanguage()
  const { play } = useChaina()
  const [ready, setReady] = useState(false)
  const [userName, setUserName] = useState('')
  const [dailyGoal, setDailyGoal] = useState(5)
  const [reason, setReason] = useState('')
  const [completedCount, setCompletedCount] = useState(0)
  const [todaySessions, setTodaySessions] = useState(0)
  const [streak, setStreak] = useState(0)
  const [muted, setMuted] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const tabStorageKey = `${config.storagePrefix}-home-tab`
  const [activeTab, setActiveTab] = useState<Tab>('situations')
  const [continueInfo, setContinueInfo] = useState<{
    id: string
    title: string
    percent: number
    motif: 'marigold' | 'auto' | 'chai' | 'film' | 'phone' | 'map'
  } | null>(null)

  const setTab = (next: Tab) => {
    setActiveTab(next)
    if (typeof window !== 'undefined') localStorage.setItem(tabStorageKey, next)
    playSound('tap')
  }

  const handleCloseSearch = useCallback(() => setSearchOpen(false), [])

  const rawLessons = language === 'dutch' ? getDutchLessons() : getAllLessons()
  const foundations = language === 'dutch' ? getDutchFoundations() : getAllFoundations()
  const lessons =
    language === 'hindi' ? reorderLessonsByReason(rawLessons, reason) : rawLessons

  useEffect(() => {
    if (!isOnboardingComplete()) {
      router.replace('/onboarding')
      return
    }
    const profile = getUserProfile()
    setUserName(profile.name || 'Friend')
    setDailyGoal(profile.dailyGoal)
    setReason(profile.reason || '')
    const progress = getProgress(config.storagePrefix)
    setCompletedCount(progress.completedLessons.length)
    setTodaySessions(getTodaySessions(config.storagePrefix))
    setStreak(progress.currentStreak)
    setMuted(isMuted())

    const storedTab = localStorage.getItem(tabStorageKey)
    if (storedTab === 'situations' || storedTab === 'foundations') {
      setActiveTab(storedTab)
    } else {
      setActiveTab('situations')
    }

    const lastId = getLastActiveLesson(config.storagePrefix)
    if (lastId && !isLessonComplete(lastId, config.storagePrefix)) {
      const lesson = getUniversalLessonById(lastId)
      if (lesson) {
        setContinueInfo({
          id: lesson.id,
          title: lesson.title,
          percent: getLessonPercent(lesson, config.storagePrefix),
          motif: 'chai',
        })
      } else {
        setContinueInfo(null)
      }
    } else {
      setContinueInfo(null)
    }

    setReady(true)
  }, [router, language, config.storagePrefix, tabStorageKey])

  useEffect(() => {
    if (!isOnboardingComplete()) return
    if (typeof window === 'undefined') return

    const FIRST_EVER_KEY = 'chaina-first-ever-seen'
    const LAST_TS_KEY = 'chaina-last-session-ts'
    const seenFirstEver = localStorage.getItem(FIRST_EVER_KEY) === '1'
    const lastTs = Number(localStorage.getItem(LAST_TS_KEY) || 0)
    const now = Date.now()
    const DAY_MS = 24 * 60 * 60 * 1000

    if (!seenFirstEver) {
      // firstEver is fired from /onboarding (Task 17). Mark + record on first home visit.
      localStorage.setItem(FIRST_EVER_KEY, '1')
      localStorage.setItem(LAST_TS_KEY, String(now))
      return
    }

    // Mutex: welcomeBack OR firstOpenToday, not both. Once-per-session.
    if (canFire('welcomeBack', 'once-per-session') && canFire('firstOpenToday', 'once-per-session')) {
      const gap = now - lastTs
      if (gap >= DAY_MS) {
        play('welcomeBack')
      } else {
        play('firstOpenToday')
      }
      markFired('welcomeBack', 'once-per-session')
      markFired('firstOpenToday', 'once-per-session')
    }

    localStorage.setItem(LAST_TS_KEY, String(now))
    // Run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!ready) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const currentLessons = activeTab === 'situations' ? lessons : foundations
  const goalPct = dailyGoal > 0 ? Math.min(100, Math.round((todaySessions / dailyGoal) * 100)) : 0
  const goalHit = todaySessions >= dailyGoal && dailyGoal > 0

  return (
    <>
      {language === 'dutch' && <DutchWelcomeModal />}
      <SearchOverlay open={searchOpen} onClose={handleCloseSearch} />

      <div style={{ position: 'relative', minHeight: '100dvh', background: COLORS.lav }}>
        <DottedBg />

        {/* HEADER BAND */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          style={{
            position: 'relative',
            padding: '52px 20px 16px',
            background: 'linear-gradient(180deg, #ffc9a8 0%, #ffe1cf 100%)',
            borderBottomLeftRadius: 36,
            borderBottomRightRadius: 36,
            borderBottom: BORDER.sticker,
            boxShadow: SHADOW.headerBand,
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              maxWidth: 480,
              margin: '0 auto',
            }}
          >
            <div>
              <Tag>☼ namaste, dost</Tag>
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 34,
                  color: COLORS.ink,
                  lineHeight: 1,
                  letterSpacing: -0.5,
                  marginTop: 6,
                }}
              >
                Hi, {userName}
              </div>
            </div>
            <div style={{ marginRight: -6, marginTop: -8 }}>
              <button
                type="button"
                onClick={() => {
                  if (canFire('tap', 'debounce-800ms')) {
                    play('tap')
                    markFired('tap', 'debounce-800ms')
                  }
                }}
                style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}
                aria-label="Chaina says hi"
              >
                <Cutting size={92} />
              </button>
            </div>
          </div>

          {/* search + mute pill + streak chip */}
          <div
            style={{
              marginTop: 12,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              maxWidth: 480,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <div
              onClick={() => {
                playSound('tap')
                setSearchOpen(true)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  playSound('tap')
                  setSearchOpen(true)
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Search lessons"
              style={{
                flex: 1,
                background: '#fff',
                border: BORDER.sticker,
                borderRadius: 99,
                padding: '7px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: SHADOW.chip,
                fontFamily: FONTS.body,
                color: COLORS.ink60,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              search…
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const m = toggleMute()
                  setMuted(m)
                }}
                aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
                style={{
                  marginLeft: 'auto',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: COLORS.ink,
                }}
              >
                {muted ? (
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 3.75a.75.75 0 0 0-1.264-.546L4.703 7H3.167a.75.75 0 0 0-.7.48A6.985 6.985 0 0 0 2 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0 0 10 16.25V3.75Z" />
                    <path d="M14.22 7.22a.75.75 0 0 1 1.06 0L16.5 8.44l1.22-1.22a.75.75 0 1 1 1.06 1.06L17.56 9.5l1.22 1.22a.75.75 0 1 1-1.06 1.06L16.5 10.56l-1.22 1.22a.75.75 0 1 1-1.06-1.06l1.22-1.22-1.22-1.22a.75.75 0 0 1 0-1.06Z" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 3.75a.75.75 0 0 0-1.264-.546L4.703 7H3.167a.75.75 0 0 0-.7.48A6.985 6.985 0 0 0 2 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0 0 10 16.25V3.75ZM15.95 5.05a.75.75 0 0 0-1.06 1.061 5.5 5.5 0 0 1 0 7.778.75.75 0 0 0 1.06 1.06 7 7 0 0 0 0-9.899Z" />
                    <path d="M13.829 7.172a.75.75 0 0 0-1.061 1.06 2.5 2.5 0 0 1 0 3.536.75.75 0 0 0 1.06 1.06 4 4 0 0 0 0-5.656Z" />
                  </svg>
                )}
              </button>
            </div>
            <StreakChip count={streak} onClick={() => playSound('streak')} />
          </div>

          {/* daily goal — pill bar */}
          <div style={{ marginTop: 14, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontWeight: 700,
                  fontSize: 13,
                  color: COLORS.ink,
                  textTransform: 'uppercase',
                  letterSpacing: 0.4,
                }}
              >
                {goalHit ? "today's goal — hit! 🎯" : "today's goal"}
              </div>
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 14,
                  color: COLORS.ink,
                }}
              >
                <span style={{ color: COLORS.orange }}>{todaySessions}</span> / {dailyGoal} min
              </div>
            </div>
            <div
              style={{
                height: 18,
                background: '#fff',
                borderRadius: 99,
                position: 'relative',
                overflow: 'hidden',
                border: BORDER.sticker,
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${goalPct}%` }}
                transition={{ delay: 0.3, duration: 0.9, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: goalHit
                    ? `linear-gradient(90deg, ${COLORS.green}, #2f8a55)`
                    : `linear-gradient(90deg, ${COLORS.orange2}, ${COLORS.orange})`,
                  borderRight: goalPct > 0 && goalPct < 100 ? BORDER.sticker : 'none',
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* MARIGOLD DIVIDER */}
        <div
          style={{
            padding: '14px 20px 0',
            position: 'relative',
            zIndex: 2,
            maxWidth: 480,
            margin: '0 auto',
          }}
        >
          <MarigoldStrip count={9} />
        </div>

        {/* CONTINUE RICKSHAW-CHIP */}
        {continueInfo && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 240, damping: 22 }}
            style={{
              padding: '14px 20px 0',
              position: 'relative',
              zIndex: 2,
              maxWidth: 480,
              margin: '0 auto',
            }}
          >
            <Sticker
              color={COLORS.cream}
              radius={22}
              padding={0}
              onClick={() => {
                playSound('pop')
                router.push(`/lessons/${continueInfo.id}`)
              }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                <div
                  style={{
                    background: COLORS.teal,
                    padding: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: BORDER.sticker,
                  }}
                >
                  <MotifIcon kind={continueInfo.motif} size={64} />
                </div>
                <div style={{ flex: 1, padding: '14px 14px 14px 16px', minWidth: 0 }}>
                  <Tag>pick up</Tag>
                  <div
                    style={{
                      fontFamily: FONTS.display,
                      fontWeight: 800,
                      fontSize: 18,
                      color: COLORS.ink,
                      lineHeight: 1.15,
                      marginTop: 4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {continueInfo.title}
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: 12,
                      color: COLORS.ink60,
                      marginTop: 2,
                      fontWeight: 600,
                    }}
                  >
                    {continueInfo.percent}% done — pick up where you left off
                  </div>
                </div>
                <div
                  style={{
                    background: COLORS.ink,
                    color: COLORS.butter,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 18px',
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 22,
                  }}
                >
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </div>
              </div>
            </Sticker>
          </motion.div>
        )}

        {/* TABS */}
        <div
          style={{
            padding: '16px 20px 8px',
            position: 'relative',
            zIndex: 2,
            maxWidth: 480,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              background: COLORS.ink,
              borderRadius: 99,
              padding: 4,
              display: 'flex',
              border: BORDER.sticker,
              boxShadow: SHADOW.chip,
            }}
          >
            {(['situations', 'foundations'] as Tab[]).map((t) => {
              const active = activeTab === t
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    flex: 1,
                    position: 'relative',
                    textAlign: 'center',
                    padding: '7px 0',
                    borderRadius: 99,
                    background: 'transparent',
                    color: active ? COLORS.ink : COLORS.cream,
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: 'pointer',
                    textTransform: 'lowercase',
                    border: 'none',
                    transition: 'color 0.2s',
                  }}
                >
                  {active && (
                    <motion.div
                      layoutId="home-tab-active"
                      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: COLORS.cream,
                        borderRadius: 99,
                      }}
                    />
                  )}
                  <span style={{ position: 'relative', zIndex: 1 }}>{t}</span>
                </button>
              )
            })}
          </div>
        </div>

        {completedCount === 0 && activeTab === 'situations' && (
          <div
            style={{
              padding: '0 20px',
              position: 'relative',
              zIndex: 2,
              maxWidth: 480,
              margin: '8px auto 0',
            }}
          >
            <div
              style={{
                background: COLORS.butter,
                border: BORDER.sticker,
                borderRadius: 16,
                padding: '10px 14px',
                fontFamily: FONTS.body,
                fontWeight: 700,
                fontSize: 13,
                color: COLORS.ink,
                boxShadow: SHADOW.chip,
              }}
            >
              {language === 'dutch'
                ? 'Start with lesson 1 — or jump to Foundations to learn the grammar core first!'
                : 'Start with lesson 1 — everything builds from here'}
            </div>
          </div>
        )}

        {/* LESSON STICKER LIST */}
        <div
          style={{
            padding: '12px 20px 120px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            position: 'relative',
            zIndex: 2,
            maxWidth: 480,
            margin: '0 auto',
          }}
        >
          {currentLessons.map((lesson, index) => {
            const isFirst = index === 0 && activeTab === 'situations'
            const isLocked =
              activeTab === 'situations' &&
              completedCount === 0 &&
              index > 0 &&
              language === 'hindi'

            const card = (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.25 + index * 0.06,
                  type: 'spring',
                  stiffness: 240,
                  damping: 22,
                }}
              >
                <LessonStickerCard
                  lesson={lesson}
                  index={index}
                  routeBase="lessons"
                  locked={isLocked}
                />
              </motion.div>
            )

            if (isFirst) {
              return (
                <FeatureTooltip
                  key={lesson.id}
                  id="home"
                  message="Start here! Tap a lesson to begin learning."
                  position="bottom"
                >
                  {card}
                </FeatureTooltip>
              )
            }

            return <div key={lesson.id}>{card}</div>
          })}
        </div>
      </div>
    </>
  )
}
