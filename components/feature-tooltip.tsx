'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { hasSeenTooltip, markTooltipShown } from '@/lib/onboarding'
import { COLORS, useTheme } from '@/components/design'
const W = '#fff' // @design-allow: white literal

interface FeatureTooltipProps {
  id: string
  message: string
  position?: 'top' | 'bottom' | 'center'
  children: React.ReactNode
}

export function FeatureTooltip({ id, message, position = 'bottom', children }: FeatureTooltipProps) {
  const theme = useTheme()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Small delay so the page renders first
    const timer = setTimeout(() => {
      if (!hasSeenTooltip(id)) {
        setVisible(true)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [id])

  const dismiss = useCallback(() => {
    markTooltipShown(id)
    setVisible(false)
  }, [id])

  const tooltipPosition = {
    top: 'bottom-full mb-3',
    bottom: 'top-full mt-3',
    center: 'top-1/2 -translate-y-1/2 mt-0',
  }

  return (
    <div className="relative">
      {children}
      <AnimatePresence>
        {visible && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={dismiss}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(54,40,30,0.5)',
                backdropFilter: 'blur(2px)',
                zIndex: 100,
              }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 101,
                pointerEvents: 'none',
                borderRadius: 22,
                outline: '4px solid rgba(255,243,207,0.85)',
                outlineOffset: 2,
                boxShadow: '0 0 0 9999px rgba(54,40,30,0.45)',
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: position === 'top' ? 10 : -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: position === 'top' ? 10 : -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`absolute left-1/2 -translate-x-1/2 ${tooltipPosition[position]}`}
              style={{ zIndex: 102, width: 280 }}
            >
              <div
                style={{
                  background: W,
                  border: `2.5px solid ${COLORS.ink}`,
                  boxShadow: `4px 4px 0 ${COLORS.ink}`,
                  borderRadius: 18,
                  padding: 14,
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    fontWeight: 700,
                    color: COLORS.ink,
                    lineHeight: 1.4,
                    margin: 0,
                  }}
                >
                  {message}
                </p>
                <button
                  type="button"
                  onClick={dismiss}
                  style={{
                    marginTop: 10,
                    width: '100%',
                    padding: 10,
                    borderRadius: 99,
                    background: theme.primary,
                    color: W,
                    border: `2.5px solid ${COLORS.ink}`,
                    boxShadow: `3px 3px 0 ${COLORS.ink}`,
                    fontFamily: 'var(--font-bricolage), system-ui, sans-serif',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer',
                    textTransform: 'lowercase',
                  }}
                >
                  got it ✓
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
