'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getStreak, updateStreak } from '@/lib/progress'

export function StreakCounter() {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    updateStreak()
    setStreak(getStreak())
  }, [])

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-500/15 dark:to-amber-500/15 rounded-full px-4 py-2 w-fit shadow-sm border border-orange-200/50 dark:border-orange-500/20"
    >
      <span className="text-xl">🔥</span>
      <motion.span
        key={streak}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="font-bold text-orange-700 dark:text-orange-400 text-sm"
      >
        {streak} day{streak !== 1 ? 's' : ''}
      </motion.span>
    </motion.div>
  )
}
