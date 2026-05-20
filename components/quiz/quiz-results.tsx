'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

interface QuizResultsProps {
  score: number
  total: number
  onTryAgain: () => void
  onGoHome: () => void
}

export function QuizResults({ score, total, onTryAgain, onGoHome }: QuizResultsProps) {
  const confettiTriggered = useRef(false)
  const percentage = Math.round((score / total) * 100)
  const isGreatScore = percentage >= 70

  useEffect(() => {
    if (isGreatScore && !confettiTriggered.current) {
      confettiTriggered.current = true
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#f59e0b', '#10b981'],
      })
    }
  }, [isGreatScore])

  const getMessage = () => {
    if (percentage === 100) return 'Perfect! You nailed it!'
    if (percentage >= 80) return 'Amazing work! Almost perfect!'
    if (percentage >= 70) return 'Great job! Keep it up!'
    if (percentage >= 50) return 'Good effort! Keep practicing!'
    return 'Keep learning, you\'ll get there!'
  }

  const getEmoji = () => {
    if (percentage === 100) return '🏆'
    if (percentage >= 80) return '🌟'
    if (percentage >= 70) return '🎉'
    if (percentage >= 50) return '💪'
    return '📚'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center text-center px-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="text-6xl mb-4"
      >
        {getEmoji()}
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-[var(--text-primary)] mb-2"
      >
        {getMessage()}
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <div className="text-5xl font-extrabold text-[var(--accent)]">
          {score}/{total}
        </div>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{percentage}% correct</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <button
          onClick={onTryAgain}
          className="w-full py-3 px-6 bg-[var(--accent)] text-white font-semibold rounded-xl hover:opacity-90 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={onGoHome}
          className="w-full py-3 px-6 bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold rounded-xl hover:bg-[var(--bg-hover)] transition-colors border border-[var(--border)]"
        >
          Back to Home
        </button>
      </motion.div>
    </motion.div>
  )
}
