'use client'

import { useEffect, useState } from 'react'
import { BottomNav } from '@/components/bottom-nav'
import { NotificationPrompt } from '@/components/notification-prompt'
import { DailyReviewPopup } from '@/components/daily-review-popup'
import { registerServiceWorker, shouldShowNotificationPrompt, maybeShowReminderOnOpen, fireOneTimeTestNotification, maybeFireRandomNudge } from '@/lib/notifications'
import { useLanguage } from '@/lib/language-context'

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { config } = useLanguage()
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)

  useEffect(() => {
    registerServiceWorker()

    // Check daily reminder on first open
    maybeShowReminderOnOpen(config.storagePrefix)

    // Fire notifications on visibility change. iOS only banners notifications
    // that arrive while the PWA is NOT in foreground, so:
    //   - hidden  → fire the one-shot test + maybe a random nudge (will banner)
    //   - visible → re-check the daily reminder (silently delivered to list)
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        fireOneTimeTestNotification()
        maybeFireRandomNudge(config.storagePrefix)
      } else if (document.visibilityState === 'visible') {
        maybeShowReminderOnOpen(config.storagePrefix)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // Show notification opt-in prompt after 30 s of first use
    const timer = setTimeout(() => {
      if (shouldShowNotificationPrompt()) {
        setShowNotificationPrompt(true)
      }
    }, 30000)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      clearTimeout(timer)
    }
  }, [config.storagePrefix])

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
