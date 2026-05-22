'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getStreak, updateStreak, getSeenStreakMilestones, markStreakMilestoneSeen } from '@/lib/progress'
import { useLanguage } from '@/lib/language-context'
import { playSound } from '@/lib/sounds'

const MILESTONES = [7, 14, 30, 100]

function milestoneEmoji(n: number) {
  if (n >= 100) return '🏆'
  if (n >= 30) return '💎'
  if (n >= 14) return '🌟'
  return '🎉'
}

export function StreakCounter() {
  const { config } = useLanguage()
  const [streak, setStreak] = useState(0)
  const [milestone, setMilestone] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    updateStreak(config.storagePrefix)
    const s = getStreak(config.storagePrefix)
    setStreak(s)

    // Check for a milestone that hasn't been celebrated yet
    const seen = getSeenStreakMilestones(config.storagePrefix)
    const hit = MILESTONES.find(m => s >= m && !seen.includes(m))
    if (hit) {
      setMilestone(hit)
      markStreakMilestoneSeen(hit, config.storagePrefix)
      playSound('streak')

      // Fire confetti (lazy-loaded to avoid SSR issues)
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ['#f59e0b', '#f97316', '#ec4899'] })
      })

      timerRef.current = setTimeout(() => setMilestone(null), 4000)
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [config.storagePrefix])

  return (
    <div className="relative">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full px-4 py-2 w-fit shadow-sm border border-orange-200/50"
      >
        <span className="text-xl">🔥</span>
        <motion.span
          key={streak}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="font-bold text-orange-700 text-sm"
        >
          {streak} day{streak !== 1 ? 's' : ''}
        </motion.span>
      </motion.div>

      <AnimatePresence>
        {milestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="absolute top-full right-0 mt-2 z-50 bg-white rounded-2xl shadow-xl border border-amber-200 px-4 py-3 text-center min-w-[160px]"
          >
            <div className="text-3xl mb-1">{milestoneEmoji(milestone)}</div>
            <p className="text-sm font-bold text-amber-700">{milestone}-day streak!</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">You&apos;re on fire 🔥</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
