'use client'

import { useEffect, useState } from 'react'
import { BottomNav } from '@/components/bottom-nav'
import { NotificationPrompt } from '@/components/notification-prompt'
import { registerServiceWorker, shouldShowNotificationPrompt, scheduleLocalReminder, getNotificationPreference } from '@/lib/notifications'

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)

  useEffect(() => {
    // Register service worker
    registerServiceWorker().then(() => {
      // If notifications already enabled, schedule reminder
      if (getNotificationPreference() === 'enabled') {
        scheduleLocalReminder()
      }
    })

    // Show notification prompt after a delay if conditions are met
    const timer = setTimeout(() => {
      if (shouldShowNotificationPrompt()) {
        setShowNotificationPrompt(true)
      }
    }, 30000) // Show after 30 seconds of app usage

    return () => clearTimeout(timer)
  }, [])

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
    </>
  )
}
