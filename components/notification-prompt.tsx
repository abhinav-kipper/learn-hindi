'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { requestNotificationPermission, setNotificationPreference } from '@/lib/notifications'

interface NotificationPromptProps {
  show: boolean
  onDismiss: () => void
}

export function NotificationPrompt({ show, onDismiss }: NotificationPromptProps) {
  const [requesting, setRequesting] = useState(false)

  const handleEnable = async () => {
    setRequesting(true)
    await requestNotificationPermission()
    setRequesting(false)
    onDismiss()
  }

  const handleLater = () => {
    setNotificationPreference('disabled')
    onDismiss()
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-50"
        >
          <div className="bg-[var(--bg-surface)] rounded-2xl p-5 shadow-xl border border-[var(--border)]">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔔</span>
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--text-primary)] text-sm">Daily Practice Reminders</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Get a gentle reminder to practice Hindi every day and keep your streak alive!
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleLater}
                className="flex-1 py-2.5 px-4 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-elevated)] rounded-xl hover:bg-[var(--bg-hover)] transition-colors"
              >
                Later
              </button>
              <button
                onClick={handleEnable}
                disabled={requesting}
                className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-[var(--accent)] rounded-xl hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {requesting ? 'Enabling...' : 'Enable'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
