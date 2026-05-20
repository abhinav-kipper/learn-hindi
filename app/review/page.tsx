'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { getReviewPhrases, markReviewed, saveReviewSession, ReviewPhrase } from '@/lib/review'
import { getProgress, updateStreak } from '@/lib/progress'
import { FeatureTooltip } from '@/components/feature-tooltip'

export default function ReviewPage() {
  const router = useRouter()
  const [phrases, setPhrases] = useState<ReviewPhrase[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [gotItCount, setGotItCount] = useState(0)
  const [complete, setComplete] = useState(false)
  const [direction, setDirection] = useState(0)
  const [locked, setLocked] = useState(false)

  const loadPhrases = useCallback(() => {
    const progress = getProgress()
    if (progress.completedLessons.length === 0) {
      setLocked(true)
      return
    }

    const reviewPhrases = getReviewPhrases(8)
    setPhrases(reviewPhrases)
    setCurrentIndex(0)
    setRevealed(false)
    setGotItCount(0)
    setComplete(false)
  }, [])

  useEffect(() => {
    loadPhrases()
  }, [loadPhrases])

  const handleGotIt = () => {
    const phrase = phrases[currentIndex]
    markReviewed(phrase.phraseId, true)
    setGotItCount(prev => prev + 1)
    advance()
  }

  const handleStillLearning = () => {
    const phrase = phrases[currentIndex]
    markReviewed(phrase.phraseId, false)
    advance()
  }

  const advance = () => {
    setDirection(1)
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setRevealed(false)
    } else {
      saveReviewSession(phrases.length, gotItCount + (phrases[currentIndex] ? 0 : 0))
      updateStreak()
      setComplete(true)
    }
  }

  if (locked) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Review Locked</h2>
        <p className="text-base text-slate-600 text-center mb-6">Complete your first lesson to unlock reviews!</p>
        <button
          onClick={() => router.push('/')}
          className="py-3 px-6 bg-teal-600 text-white font-semibold rounded-xl"
        >
          Go to Lessons
        </button>
      </div>
    )
  }

  if (phrases.length === 0 && !locked) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
        <p className="text-lg text-slate-600 text-center mb-4">No phrases to review yet. Complete a lesson first!</p>
        <button
          onClick={() => router.push('/')}
          className="py-3 px-6 bg-teal-600 text-white font-semibold rounded-xl"
        >
          Go to Lessons
        </button>
      </div>
    )
  }

  if (complete) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 safe-top safe-bottom">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Review Complete!</h2>
          <p className="text-lg text-slate-600 mb-1">
            {gotItCount}/{phrases.length} phrases mastered
          </p>
          <p className="text-sm text-slate-400 mb-8">Come back tomorrow for more practice</p>
          <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
            <button
              onClick={loadPhrases}
              className="w-full py-3 px-6 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors"
            >
              Review Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 px-6 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const currentPhrase = phrases[currentIndex]

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? 300 : -300, opacity: 0 }),
  }

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 safe-top safe-bottom">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            &times; Close
          </button>
          <span className="text-sm font-medium text-slate-600">
            {currentIndex + 1} / {phrases.length}
          </span>
        </div>
        <FeatureTooltip
          id="review"
          message="Review phrases you've learned. Tap to reveal, then rate yourself!"
          position="bottom"
        >
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
              animate={{ width: `${((currentIndex + 1) / phrases.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </FeatureTooltip>
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center px-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-sm"
          >
            <div
              onClick={() => !revealed && setRevealed(true)}
              className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 min-h-[300px] flex flex-col items-center justify-center cursor-pointer"
            >
              {/* Hindi */}
              <p className="text-2xl font-bold text-slate-900 text-center mb-2">
                {currentPhrase.phrase.hindi}
              </p>
              <p className="text-sm text-slate-400 text-center mb-4">
                {currentPhrase.phrase.pronunciation}
              </p>

              {/* Reveal area */}
              {revealed ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 pt-4 border-t border-slate-100 w-full text-center"
                >
                  <p className="text-lg text-teal-700 font-medium">
                    {currentPhrase.phrase.english}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    {currentPhrase.phrase.context}
                  </p>
                </motion.div>
              ) : (
                <p className="text-sm text-slate-400 mt-4">Tap to reveal translation</p>
              )}
            </div>

            {/* Actions */}
            {revealed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 mt-6"
              >
                <button
                  onClick={handleStillLearning}
                  className="flex-1 py-3 px-4 bg-amber-50 border-2 border-amber-200 text-amber-700 font-semibold rounded-xl hover:bg-amber-100 transition-colors"
                >
                  Still Learning
                </button>
                <button
                  onClick={handleGotIt}
                  className="flex-1 py-3 px-4 bg-emerald-50 border-2 border-emerald-200 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-100 transition-colors"
                >
                  Got it!
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
