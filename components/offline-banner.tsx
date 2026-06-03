'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { COLORS, FONTS, BORDER, SHADOW } from '@/components/design'

type Status = 'online' | 'offline' | 'reconnected'

// How long the green "back online" confirmation lingers before hiding.
const RECONNECT_MS = 2500

/**
 * Global connectivity banner. Slides a status pill down from the top whenever
 * the device goes offline (so it's obvious the app is in offline mode), and a
 * brief green confirmation when the connection returns. Mounted once in
 * LayoutShell. Purely a status indicator — no dismiss, no network calls.
 */
export function OfflineBanner() {
  const [status, setStatus] = useState<Status>('online')

  useEffect(() => {
    // Sync with the real state on mount (SSR renders 'online' to avoid a
    // hydration mismatch; correct it here).
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setStatus('offline')
    }

    let reconnectTimer: ReturnType<typeof setTimeout> | null = null

    const goOffline = () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
      setStatus('offline')
    }

    const goOnline = () => {
      // Only celebrate a reconnect if we were actually offline.
      setStatus((prev) => (prev === 'offline' ? 'reconnected' : 'online'))
      reconnectTimer = setTimeout(() => setStatus('online'), RECONNECT_MS)
    }

    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
      if (reconnectTimer) clearTimeout(reconnectTimer)
    }
  }, [])

  const visible = status !== 'online'
  const reconnected = status === 'reconnected'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="offline-banner"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ type: 'spring', damping: 24, stiffness: 260 }}
          style={{
            position: 'fixed',
            top: 'calc(env(safe-area-inset-top, 0px) + 10px)',
            left: 14,
            right: 14,
            maxWidth: 420,
            margin: '0 auto',
            zIndex: 80,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: reconnected ? COLORS.mint : COLORS.redBg,
              border: BORDER.sticker,
              borderRadius: 99,
              boxShadow: SHADOW.chip,
              padding: '8px 16px',
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>{reconnected ? '✓' : '📡'}</span>
            <span
              style={{
                fontFamily: FONTS.display,
                fontWeight: 800,
                fontSize: 13,
                color: COLORS.ink,
                letterSpacing: -0.2,
                textAlign: 'center',
              }}
            >
              {reconnected
                ? 'back online'
                : "you're offline — saved lessons still work"}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
