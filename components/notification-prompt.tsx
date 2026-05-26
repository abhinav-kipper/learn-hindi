'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { requestNotificationPermission, setNotificationPreference } from '@/lib/notifications'
import { useLanguage } from '@/lib/language-context'
import { playSound } from '@/lib/sounds'
import { Tag, COLORS, FONTS, BORDER, SHADOW } from '@/components/design'
const W = '#fff' // @design-allow: white literal

interface NotificationPromptProps {
  show: boolean
  onDismiss: () => void
}

export function NotificationPrompt({ show, onDismiss }: NotificationPromptProps) {
  const { config } = useLanguage()
  const [requesting, setRequesting] = useState(false)

  const handleEnable = async () => {
    setRequesting(true)
    playSound('tap')
    await requestNotificationPermission()
    setRequesting(false)
    onDismiss()
  }

  const handleLater = () => {
    setNotificationPreference('disabled')
    playSound('tap')
    onDismiss()
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          style={{
            position: 'fixed',
            bottom: 100,
            left: 14,
            right: 14,
            maxWidth: 460,
            margin: '0 auto',
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: COLORS.butter,
              border: BORDER.sticker,
              borderRadius: 22,
              boxShadow: SHADOW.sticker,
              padding: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: W,
                  border: BORDER.thin,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                🔔
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Tag>daily reminder</Tag>
                <div
                  style={{
                    marginTop: 4,
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 15,
                    color: COLORS.ink,
                    letterSpacing: -0.2,
                  }}
                >
                  practice every day?
                </div>
                <div
                  style={{
                    marginTop: 2,
                    fontFamily: FONTS.body,
                    fontWeight: 600,
                    fontSize: 12,
                    color: COLORS.ink60,
                  }}
                >
                  get a gentle nudge to keep your {config.name} streak alive
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button
                type="button"
                onClick={handleLater}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 99,
                  background: W,
                  color: COLORS.ink,
                  border: BORDER.sticker,
                  boxShadow: SHADOW.chip,
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  textTransform: 'lowercase',
                }}
              >
                later
              </button>
              <button
                type="button"
                onClick={handleEnable}
                disabled={requesting}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 99,
                  background: COLORS.orange,
                  color: W,
                  border: BORDER.sticker,
                  boxShadow: SHADOW.chip,
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: requesting ? 'not-allowed' : 'pointer',
                  opacity: requesting ? 0.5 : 1,
                  textTransform: 'lowercase',
                }}
              >
                {requesting ? 'enabling…' : 'enable'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
