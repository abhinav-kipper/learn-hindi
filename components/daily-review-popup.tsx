'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getReviewPhrases, markReviewed, saveReviewSession, ReviewPhrase } from '@/lib/review'
import { getVocabReview } from '@/lib/vocab-review'
import { getAllCategories } from '@/lib/vocabulary'
import { getProgress, updateStreak } from '@/lib/progress'
import { playSound } from '@/lib/sounds'

const LAST_REVIEW_KEY = 'hindi-daily-review-timestamp'
const REVIEW_CARD_COUNT = 5

function shouldShowReview(): boolean {
  if (typeof window === 'undefined') return false

  // Check if user has completed at least 1 lesson
  const progress = getProgress()
  if (progress.completedLessons.length === 0) return false

  // Check if 24 hours have passed since last review
  const lastReview = localStorage.getItem(LAST_REVIEW_KEY)
  if (!lastReview) return true

  const lastTime = parseInt(lastReview, 10)
  const now = Date.now()
  const twentyFourHours = 24 * 60 * 60 * 1000
  return now - lastTime >= twentyFourHours
}

function recordReviewTimestamp(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LAST_REVIEW_KEY, Date.now().toString())
}

export function DailyReviewPopup() {
  const [show, setShow] = useState(false)
  const [state, setState] = useState<'prompt' | 'reviewing' | 'complete'>('prompt')
  const [phrases, setPhrases] = useState<ReviewPhrase[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [gotItCount, setGotItCount] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    // Delay a bit so it doesn't interfere with page load
    const timer = setTimeout(() => {
      if (shouldShowReview()) {
        setShow(true)
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleLetsGo = useCallback(() => {
    // Get vocab words marked for review
    const vocabReviewWords = getVocabReview()
    const categories = getAllCategories()
    const vocabPhrases: ReviewPhrase[] = []

    for (const hindi of vocabReviewWords) {
      // Find the word details from categories
      for (const cat of categories) {
        const word = cat.words.find(w => w.hindi === hindi)
        if (word) {
          vocabPhrases.push({
            phraseId: `vocab-${hindi}`,
            lessonId: `vocab-${cat.id}`,
            phrase: {
              hindi: word.hindi,
              english: word.english,
              pronunciation: word.pronunciation,
              context: word.example,
            },
            lastReviewed: null,
            correctCount: 0,
            wrongCount: 0,
          })
          break
        }
      }
    }

    // Get lesson phrases for review
    const lessonPhrases = getReviewPhrases(REVIEW_CARD_COUNT)

    // Mix: up to 2 vocab words + fill the rest with lesson phrases, capped at REVIEW_CARD_COUNT
    const vocabSlice = vocabPhrases.slice(0, 2)
    const lessonSlice = lessonPhrases.slice(0, REVIEW_CARD_COUNT - vocabSlice.length)
    const mixed = [...vocabSlice, ...lessonSlice].slice(0, REVIEW_CARD_COUNT)

    if (mixed.length === 0) {
      handleDismiss()
      return
    }
    setPhrases(mixed)
    setCurrentIndex(0)
    setRevealed(false)
    setGotItCount(0)
    setState('reviewing')
  }, [])

  const handleDismiss = () => {
    recordReviewTimestamp()
    setShow(false)
  }

  const handleGotIt = () => {
    const phrase = phrases[currentIndex]
    markReviewed(phrase.phraseId, true)
    setGotItCount(prev => prev + 1)
    playSound('correct')
    advance()
  }

  const handleStillLearning = () => {
    const phrase = phrases[currentIndex]
    markReviewed(phrase.phraseId, false)
    playSound('pop')
    advance()
  }

  const advance = () => {
    setDirection(1)
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setRevealed(false)
    } else {
      saveReviewSession(phrases.length, gotItCount + 1)
      updateStreak()
      recordReviewTimestamp()
      setState('complete')
      playSound('complete')
      // Auto dismiss after 2 seconds
      setTimeout(() => {
        setShow(false)
      }, 2500)
    }
  }

  if (!show) return null

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={state === 'prompt' ? handleDismiss : undefined}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto"
          >
            <div className="bg-[var(--bg-surface)] rounded-t-3xl shadow-2xl border-t border-[var(--border)] overflow-hidden">
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-[var(--border)] rounded-full" />
              </div>

              {/* Content */}
              <div className="px-6 pb-8 pt-2">
                {state === 'prompt' && (
                  <PromptView onLetsGo={handleLetsGo} onDismiss={handleDismiss} />
                )}
                {state === 'reviewing' && phrases.length > 0 && (
                  <ReviewView
                    phrases={phrases}
                    currentIndex={currentIndex}
                    revealed={revealed}
                    direction={direction}
                    onReveal={() => setRevealed(true)}
                    onGotIt={handleGotIt}
                    onStillLearning={handleStillLearning}
                  />
                )}
                {state === 'complete' && (
                  <CompleteView gotItCount={gotItCount} total={phrases.length} />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function PromptView({ onLetsGo, onDismiss }: { onLetsGo: () => void; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <div className="text-4xl mb-3">🔄</div>
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
        Ready for a quick review?
      </h2>
      <p className="text-sm text-[var(--text-secondary)] mb-6">
        {REVIEW_CARD_COUNT} flashcards to keep your Hindi sharp
      </p>
      <div className="flex flex-col gap-3">
        <button
          onClick={onLetsGo}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl shadow-md hover:opacity-90 transition-opacity"
        >
          Let&apos;s go
        </button>
        <button
          onClick={onDismiss}
          className="w-full py-3 px-6 text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] transition-colors"
        >
          Not now
        </button>
      </div>
    </motion.div>
  )
}

function ReviewView({
  phrases,
  currentIndex,
  revealed,
  direction,
  onReveal,
  onGotIt,
  onStillLearning,
}: {
  phrases: ReviewPhrase[]
  currentIndex: number
  revealed: boolean
  direction: number
  onReveal: () => void
  onGotIt: () => void
  onStillLearning: () => void
}) {
  const currentPhrase = phrases[currentIndex]

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? 200 : -200, opacity: 0 }),
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[var(--text-tertiary)] font-medium">
          {currentIndex + 1} / {phrases.length}
        </span>
        <div className="flex-1 mx-3 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
            animate={{ width: `${((currentIndex + 1) / phrases.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div
            onClick={() => !revealed && onReveal()}
            className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] p-6 min-h-[180px] flex flex-col items-center justify-center cursor-pointer"
          >
            <p className="text-2xl font-bold text-[var(--text-primary)] text-center">
              {currentPhrase.phrase.hindi}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] text-center mt-1">
              {currentPhrase.phrase.pronunciation}
            </p>

            {revealed ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 pt-3 border-t border-[var(--border)] w-full text-center"
              >
                <p className="text-base text-teal-600 font-medium">
                  {currentPhrase.phrase.english}
                </p>
                {currentPhrase.phrase.context && (
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">
                    {currentPhrase.phrase.context}
                  </p>
                )}
              </motion.div>
            ) : (
              <p className="text-xs text-[var(--text-tertiary)] mt-4">Tap to reveal</p>
            )}
          </div>

          {/* Action buttons */}
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 mt-4"
            >
              <button
                onClick={onStillLearning}
                className="flex-1 py-2.5 px-4 bg-amber-50 border border-amber-200 text-amber-700 font-semibold rounded-xl text-sm"
              >
                Still Learning
              </button>
              <button
                onClick={onGotIt}
                className="flex-1 py-2.5 px-4 bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold rounded-xl text-sm"
              >
                Got it!
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function CompleteView({ gotItCount, total }: { gotItCount: number; total: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-4"
    >
      <div className="text-4xl mb-3">🙌</div>
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
        Nice! See you tomorrow
      </h2>
      <p className="text-sm text-[var(--text-secondary)]">
        {gotItCount}/{total} phrases nailed
      </p>
    </motion.div>
  )
}
