'use client'

import { useEffect, useState } from 'react'
import { BottomNav } from '@/components/bottom-nav'
import { NotificationPrompt } from '@/components/notification-prompt'
import { DailyReviewPopup } from '@/components/daily-review-popup'
import { registerServiceWorker, shouldShowNotificationPrompt, maybeShowReminderOnOpen, fireOneTimeTestNotification, maybeFireRandomNudge } from '@/lib/notifications'
import { addTodayActiveMs } from '@/lib/progress'
import { useLanguage } from '@/lib/language-context'
import { useChaina, canFire, markFired } from '@/components/design'

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { config } = useLanguage()
  const { play } = useChaina()
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)

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
    }
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
      <main className="pb-16">
        {children}
      </main>
      <BottomNav />
      <NotificationPrompt
        show={showNotificationPrompt}
        onDismiss={() => setShowNotificationPrompt(false)}
      />
      <DailyReviewPopup />
    </>
  )
}
