'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { markLessonComplete, isLessonComplete } from '@/lib/progress'

interface LessonCompleteButtonProps {
  lessonId: string
}

export function LessonCompleteButton({ lessonId }: LessonCompleteButtonProps) {
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    setCompleted(isLessonComplete(lessonId))
  }, [lessonId])

  const handleComplete = () => {
    markLessonComplete(lessonId)
    setCompleted(true)

    // Confetti burst
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#6366f1', '#8b5cf6', '#a78bfa', '#34d399', '#fbbf24'],
      ticks: 60,
      gravity: 1.2,
      scalar: 0.9,
    })
  }

  return (
    <AnimatePresence mode="wait">
      {completed ? (
        <motion.div
          key="completed"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="text-center py-3 text-emerald-600 font-semibold text-sm bg-emerald-50 rounded-2xl border border-emerald-200"
        >
          ✓ Lesson completed
        </motion.div>
      ) : (
        <motion.button
          key="button"
          onClick={handleComplete}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 px-4 bg-slate-100 text-slate-700 font-semibold rounded-2xl hover:bg-slate-200 transition-colors duration-200 border border-slate-200"
        >
          Mark as Complete
        </motion.button>
      )}
    </AnimatePresence>
  )
}
