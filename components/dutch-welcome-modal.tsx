'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playSound } from '@/lib/sounds'
import { Tag, Cutting, Confetti as ChaiConfetti, COLORS, FONTS, BORDER, SHADOW } from '@/components/design'

const WELCOMED_KEY = 'dutch-welcomed'

export function DutchWelcomeModal() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(WELCOMED_KEY)) {
      setShow(true)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(WELCOMED_KEY, '1')
    setShow(false)
    playSound('tap')
  }

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              background: 'rgba(54,40,30,0.5)',
              backdropFilter: 'blur(4px)',
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                pointerEvents: 'auto',
                background: '#fff',
                border: BORDER.sticker,
                boxShadow: SHADOW.sticker,
                borderRadius: 24,
                padding: 28,
                maxWidth: 360,
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <ChaiConfetti active count={20} />
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <Cutting size={100} mood="happy" />
              </div>
              <div style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
                <Tag>🇳🇱 welkom</Tag>
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 22,
                    color: COLORS.ink,
                    marginTop: 8,
                    letterSpacing: -0.4,
                  }}
                >
                  Welkom bij Nederlands!
                </div>
                <div
                  style={{
                    fontFamily: FONTS.body,
                    fontWeight: 700,
                    fontSize: 12,
                    color: COLORS.ink60,
                    marginTop: 4,
                  }}
                >
                  welcome to Dutch mode
                </div>
              </div>
              <div
                style={{
                  marginTop: 16,
                  padding: 14,
                  background: COLORS.creamBg,
                  border: BORDER.thin,
                  borderRadius: 16,
                  fontFamily: FONTS.body,
                  fontSize: 12,
                  fontWeight: 600,
                  color: COLORS.ink60,
                  lineHeight: 1.6,
                  position: 'relative',
                  zIndex: 10,
                }}
              >
                <div>
                  • <strong style={{ color: COLORS.ink }}>foundations</strong> — grammar building blocks
                </div>
                <div>
                  • <strong style={{ color: COLORS.ink }}>situations</strong> — real conversations
                </div>
                <div>• tutor-style drill, English always nearby</div>
                <div>• your Hindi progress is untouched — switch back anytime</div>
              </div>
              <button
                type="button"
                onClick={dismiss}
                style={{
                  marginTop: 18,
                  width: '100%',
                  padding: 14,
                  borderRadius: 22,
                  background: COLORS.orange,
                  color: '#fff',
                  border: BORDER.sticker,
                  boxShadow: SHADOW.sticker,
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: 'pointer',
                  textTransform: 'lowercase',
                  position: 'relative',
                  zIndex: 10,
                }}
              >
                laten we beginnen! 🚀
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
