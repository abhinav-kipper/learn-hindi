'use client'

import { useEffect, useState } from 'react'
import { BottomNav } from '@/components/bottom-nav'
import { NotificationPrompt } from '@/components/notification-prompt'
import { DailyReviewPopup } from '@/components/daily-review-popup'
import { registerServiceWorker, shouldShowNotificationPrompt, maybeShowReminderOnOpen } from '@/lib/notifications'
import { useLanguage } from '@/lib/language-context'

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { config } = useLanguage()
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)

  useEffect(() => {
    registerServiceWorker()

    // Check on first open
    maybeShowReminderOnOpen(config.storagePrefix)

    // Also check whenever the user switches back to this tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
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
