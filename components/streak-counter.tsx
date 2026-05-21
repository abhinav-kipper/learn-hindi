'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getStreak, updateStreak } from '@/lib/progress'
import { useLanguage } from '@/lib/language-context'

export function StreakCounter() {
  const { config } = useLanguage()
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    updateStreak(config.storagePrefix)
    setStreak(getStreak(config.storagePrefix))
  }, [config.storagePrefix])

  return (
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
  )
}
