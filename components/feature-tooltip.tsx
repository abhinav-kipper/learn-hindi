'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { hasSeenTooltip, markTooltipShown } from '@/lib/onboarding'

interface FeatureTooltipProps {
  id: string
  message: string
  position?: 'top' | 'bottom' | 'center'
  children: React.ReactNode
}

export function FeatureTooltip({ id, message, position = 'bottom', children }: FeatureTooltipProps) {
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-[100]"
              onClick={dismiss}
            />
            {/* Spotlight - elevates the children above backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[101] pointer-events-none rounded-2xl ring-4 ring-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
            />
            {/* Tooltip bubble */}
            <motion.div
              initial={{ opacity: 0, y: position === 'top' ? 10 : -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: position === 'top' ? 10 : -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`absolute left-1/2 -translate-x-1/2 z-[102] w-[280px] ${tooltipPosition[position]}`}
            >
              <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-4">
                <p className="text-sm text-slate-700 leading-relaxed">{message}</p>
                <button
                  onClick={dismiss}
                  className="mt-3 w-full py-2 px-4 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Got it ✓
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
