'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Lesson } from '@/types/lesson'
import { markLessonComplete, isLessonComplete } from '@/lib/progress'

interface SectionCtaProps {
  lesson: Lesson
}

export function SectionCta({ lesson }: SectionCtaProps) {
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    setCompleted(isLessonComplete(lesson.id))
  }, [lesson.id])

  const handleComplete = () => {
    markLessonComplete(lesson.id)
    setCompleted(true)

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
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-8">
      {/* Celebration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring' }}
        className="text-center"
      >
        <p className="text-5xl mb-4">🎉</p>
        <h2 className="text-2xl font-extrabold text-slate-900">
          You covered {lesson.phrases.length} phrases!
        </h2>
        <p className="text-slate-500 mt-2">Great progress on this lesson</p>
      </motion.div>

      {/* Actions */}
      <div className="w-full mt-auto space-y-3">
        <a
          href={`/practice/${lesson.id}`}
          className="block w-full text-center py-4 px-6 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-200 text-lg"
        >
          Practice Now →
        </a>

        <AnimatePresence mode="wait">
          {completed ? (
            <motion.div
              key="completed"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-3.5 text-emerald-600 font-semibold text-sm bg-emerald-50 rounded-2xl border border-emerald-200"
            >
              ✓ Lesson completed
            </motion.div>
          ) : (
            <motion.button
              key="button"
              onClick={handleComplete}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 px-6 bg-slate-100 text-slate-700 font-semibold rounded-2xl border border-slate-200"
            >
              Mark Complete ✓
            </motion.button>
          )}
        </AnimatePresence>

        <a
          href="/"
          className="block text-center text-sm text-slate-400 py-2"
        >
          Back to Home
        </a>
      </div>
    </div>
  )
}
