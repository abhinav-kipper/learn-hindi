'use client'

import { useEffect, useRef, useState } from 'react'
import { BottomNav } from '@/components/bottom-nav'
import { NotificationPrompt } from '@/components/notification-prompt'
import { DailyReviewPopup } from '@/components/daily-review-popup'
import { OfflineBanner } from '@/components/offline-banner'
import { registerServiceWorker, shouldShowNotificationPrompt, maybeShowReminderOnOpen, fireOneTimeTestNotification, maybeFireRandomNudge } from '@/lib/notifications'
import { addTodayActiveMs, getTodayActiveMinutes, todayISO, updateStreak } from '@/lib/progress'
import { getUserProfile } from '@/lib/onboarding'
import { Confetti } from '@/components/design'
import { playSound } from '@/lib/sounds'
import { useLanguage } from '@/lib/language-context'
import { useChaina, canFire, markFired, Mascot, Sticker, COLORS, FONTS, BORDER, SHADOW, useTheme } from '@/components/design'
import { motion, AnimatePresence } from 'framer-motion'

const W = '#fff' // @design-allow: white literal

function checkDailyGoalCrossed(prefix: string, onFire: (goalMinutes: number) => void): void {
  if (typeof window === 'undefined') return
  const profile = getUserProfile()
  const goal = profile?.dailyGoal ?? 0
  if (goal <= 0) return
  const minutes = getTodayActiveMinutes(prefix)
  if (minutes < goal) return
  const key = `${prefix}-daily-goal-fired:${todayISO()}`
  if (localStorage.getItem(key)) return
  localStorage.setItem(key, '1')
  // Reaching the daily goal counts as a streak day (Duolingo-style), so the
  // streak holds even on days with no lesson/quiz/practice completion.
  updateStreak(prefix)
  onFire(goal)
}

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { config } = useLanguage()
  const { play } = useChaina()
  const theme = useTheme()
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)
  const [goalBurst, setGoalBurst] = useState<number | null>(null)
  const goalBurstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dismissGoalBurst = () => {
    if (goalBurstTimerRef.current) {
      clearTimeout(goalBurstTimerRef.current)
      goalBurstTimerRef.current = null
    }
    setGoalBurst(null)
  }

  const fireDailyGoal = (goalMinutes: number) => {
    setGoalBurst(goalMinutes)
    playSound('levelup')
    play('dailyGoalReached')
    goalBurstTimerRef.current = setTimeout(() => {
      goalBurstTimerRef.current = null
      setGoalBurst(null)
    }, 5000)
  }

  // Escape key dismisses the goal-burst card when it's showing
  useEffect(() => {
    if (goalBurst === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismissGoalBurst()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goalBurst])

  useEffect(() => {
    registerServiceWorker()
    maybeShowReminderOnOpen(config.storagePrefix)

    // Record session start (for Chaina sessionEnd 5-min threshold)
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('chaina-session-start-ts', String(Date.now()))
      } catch {}
    }

    // Daily-goal active-time ticker. Accrue real elapsed time while the app
    // is visible. Persist every 30s so a tab close doesn't lose progress.
    let lastTick = Date.now()
    const TICK_MS = 30_000
    const flushElapsed = () => {
      if (document.visibilityState !== 'visible') return
      const now = Date.now()
      const elapsed = Math.min(now - lastTick, 5 * 60 * 1000) // cap at 5min to avoid wakeup spikes
      lastTick = now
      addTodayActiveMs(elapsed, config.storagePrefix)
      window.dispatchEvent(new CustomEvent('hindi-active-tick'))
      checkDailyGoalCrossed(config.storagePrefix, fireDailyGoal)
    }
    // Also check immediately on mount in case the user re-opened the app
    // after already crossing the goal in a prior session this day.
    checkDailyGoalCrossed(config.storagePrefix, fireDailyGoal)
    const activeTickInterval = setInterval(flushElapsed, TICK_MS)

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        // Flush any partial elapsed time before backgrounding.
        flushElapsed()
        fireOneTimeTestNotification()
        maybeFireRandomNudge(config.storagePrefix)

        // Chaina sessionEnd: fire if session was ≥5min
        try {
          const startTs = Number(sessionStorage.getItem('chaina-session-start-ts') || 0)
          const FIVE_MIN = 5 * 60 * 1000
          if (
            startTs &&
            Date.now() - startTs >= FIVE_MIN &&
            canFire('sessionEnd', 'once-per-session')
          ) {
            play('sessionEnd')
            markFired('sessionEnd', 'once-per-session')
          }
        } catch {}
      } else if (document.visibilityState === 'visible') {
        // Reset tick baseline so we don't credit time spent backgrounded.
        lastTick = Date.now()
        maybeShowReminderOnOpen(config.storagePrefix)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    const timer = setTimeout(() => {
      if (shouldShowNotificationPrompt()) {
        setShowNotificationPrompt(true)
      }
    }, 30000)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      clearInterval(activeTickInterval)
      clearTimeout(timer)
    }
  }, [config.storagePrefix, play])

  return (
    <>
      <OfflineBanner />
      <main className="pb-16">
        {children}
      </main>
      <BottomNav />
      <NotificationPrompt
        show={showNotificationPrompt}
        onDismiss={() => setShowNotificationPrompt(false)}
      />
      <DailyReviewPopup />
      <AnimatePresence>
        {goalBurst !== null && (
          <>
            <div
              style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 90,
              }}
            >
              <Confetti active={true} />
            </div>
            <motion.div
              key="daily-goal-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={dismissGoalBurst}
              style={{
                position: 'fixed',
                inset: 0,
                background: `${COLORS.ink}73`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
                zIndex: 91,
                cursor: 'pointer',
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Daily goal reached"
            >
              <motion.div
                initial={{ scale: 0.7, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: 360, width: '100%' }}
              >
                <Sticker color={COLORS.butter} radius={28} padding={22}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                    <Mascot size={120} mood="excited" />
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.display,
                      fontWeight: 800,
                      fontSize: 30,
                      color: theme.primary,
                      textAlign: 'center',
                      lineHeight: 1.1,
                      marginBottom: 6,
                    }}
                  >
                    🎉 Daily Goal Done!
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.display,
                      fontWeight: 800,
                      fontSize: 16,
                      color: COLORS.ink,
                      textAlign: 'center',
                      marginBottom: 4,
                      textTransform: 'lowercase',
                    }}
                  >
                    wah, shabash dost!
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: 14,
                      color: COLORS.ink60,
                      textAlign: 'center',
                      lineHeight: 1.5,
                      marginBottom: 16,
                    }}
                  >
                    you hit today&apos;s {goalBurst}-minute goal. mehnat ki keemat, streak strong, aage badho.
                  </div>
                  <button
                    onClick={dismissGoalBurst}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 18,
                      background: theme.primary,
                      color: W,
                      border: BORDER.sticker,
                      boxShadow: SHADOW.chip,
                      fontFamily: FONTS.display,
                      fontWeight: 800,
                      fontSize: 15,
                      cursor: 'pointer',
                      textTransform: 'lowercase',
                    }}
                  >
                    keep going →
                  </button>
                </Sticker>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
