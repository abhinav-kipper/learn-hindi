'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Lesson } from '@/types/lesson'
import { markLessonComplete, isLessonComplete, updateStreak } from '@/lib/progress'
import { playSound } from '@/lib/sounds'
import { useLanguage } from '@/lib/language-context'
import { useCuteMoments } from '@/components/cute-moments'

interface SectionCtaProps {
  lesson: Lesson
}

function CountUp({ target, duration = 1200, delay = 0 }: { target: number; duration?: number; delay?: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let raf = 0
    let startTime: number | null = null
    const timeoutId = window.setTimeout(() => {
      const step = (timestamp: number) => {
        if (startTime === null) startTime = timestamp
        const elapsed = timestamp - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplay(Math.round(eased * target))
        if (progress < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }, delay)

    return () => {
      window.clearTimeout(timeoutId)
      cancelAnimationFrame(raf)
    }
  }, [target, duration, delay])

  return <span className="tabular-nums">{display}</span>
}

export function SectionCta({ lesson }: SectionCtaProps) {
  const { config } = useLanguage()
  const { show } = useCuteMoments()
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    setCompleted(isLessonComplete(lesson.id, config.storagePrefix))
  }, [lesson.id, config.storagePrefix])

  const handleComplete = () => {
    markLessonComplete(lesson.id, config.storagePrefix)
    updateStreak(config.storagePrefix)
    setCompleted(true)
    playSound('levelup')
    show('🏆', 'Lesson complete!')

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
      <div className="text-center flex flex-col items-center">
        {/* Bouncy emoji stamp */}
        <motion.p
          initial={{ scale: 0, rotate: -25, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 220, damping: 11 }}
          className="text-7xl mb-2"
        >
          🎉
        </motion.p>

        {/* Hero number — counts up from 0 */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.55, type: 'spring', stiffness: 180, damping: 16 }}
          className="leading-none"
        >
          <span className="text-8xl font-extrabold bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
            <CountUp target={lesson.phrases.length} duration={1100} delay={700} />
          </span>
        </motion.div>

        {/* Caption — fades in after the number lands */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9, duration: 0.4 }}
          className="text-lg font-semibold text-[var(--text-primary)] mt-3"
        >
          phrases learned
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.15, duration: 0.4 }}
          className="text-sm text-[var(--text-secondary)] mt-1"
        >
          Great progress on <span className="font-semibold text-[var(--text-primary)]">{lesson.title}</span>
        </motion.p>
      </div>

      {/* Actions — fade in last so the hero moment lands first */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.4, duration: 0.5, ease: 'easeOut' }}
        className="w-full mt-auto space-y-3"
      >
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
              className="w-full py-3.5 px-6 bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold rounded-2xl border border-[var(--border)]"
            >
              Mark Complete ✓
            </motion.button>
          )}
        </AnimatePresence>

        <a
          href="/"
          className="block text-center text-sm text-[var(--text-tertiary)] py-2"
        >
          Back to Home
        </a>
      </motion.div>
    </div>
  )
}
