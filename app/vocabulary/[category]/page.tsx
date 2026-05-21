'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { getCategory, markWordLearned, isWordLearned, VocabWord, VocabCategory } from '@/lib/vocabulary'
import { getVocabKnown, getVocabReview, addVocabKnown, addVocabReview, removeVocabKnown, removeVocabReview } from '@/lib/vocab-review'
import { ReadAloudButton } from '@/components/read-aloud-button'
import { playSound } from '@/lib/sounds'

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params.category as string

  const [category, setCategory] = useState<VocabCategory | null>(null)
  const [learnedSet, setLearnedSet] = useState<Set<string>>(new Set())
  const [knownSet, setKnownSet] = useState<Set<string>>(new Set())
  const [reviewSet, setReviewSet] = useState<Set<string>>(new Set())
  const [flippedCard, setFlippedCard] = useState<string | null>(null)

  useEffect(() => {
    const cat = getCategory(categoryId)
    if (!cat) {
      router.replace('/vocabulary')
      return
    }
    setCategory(cat)

    // Load learned state
    const learned = new Set<string>()
    cat.words.forEach(word => {
      if (isWordLearned(categoryId, word.hindi)) {
        learned.add(word.hindi)
      }
    })
    setLearnedSet(learned)

    // Load known/review sets
    setKnownSet(new Set(getVocabKnown()))
    setReviewSet(new Set(getVocabReview()))
  }, [categoryId, router])

  const handleCardTap = (word: VocabWord) => {
    if (flippedCard === word.hindi) {
      setFlippedCard(null)
    } else {
      setFlippedCard(word.hindi)
      playSound('pop')
      // Mark as learned on first tap
      if (!learnedSet.has(word.hindi)) {
        markWordLearned(categoryId, word.hindi)
        setLearnedSet(prev => new Set([...prev, word.hindi]))
      }
    }
  }

  const handleSwipeRight = useCallback((word: VocabWord) => {
    playSound('correct')
    // Mark as known
    addVocabKnown(word.hindi)
    removeVocabReview(word.hindi)
    setKnownSet(prev => new Set([...prev, word.hindi]))
    setReviewSet(prev => {
      const next = new Set(prev)
      next.delete(word.hindi)
      return next
    })
    // Also mark as learned
    if (!learnedSet.has(word.hindi)) {
      markWordLearned(categoryId, word.hindi)
      setLearnedSet(prev => new Set([...prev, word.hindi]))
    }
  }, [categoryId, learnedSet])

  const handleSwipeLeft = useCallback((word: VocabWord) => {
    playSound('swipe')
    // Mark for review
    addVocabReview(word.hindi)
    removeVocabKnown(word.hindi)
    setReviewSet(prev => new Set([...prev, word.hindi]))
    setKnownSet(prev => {
      const next = new Set(prev)
      next.delete(word.hindi)
      return next
    })
    // Also mark as learned
    if (!learnedSet.has(word.hindi)) {
      markWordLearned(categoryId, word.hindi)
      setLearnedSet(prev => new Set([...prev, word.hindi]))
    }
  }, [categoryId, learnedSet])

  if (!category) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const learnedCount = learnedSet.size
  const totalCount = category.words.length

  // Sort: unknown/review words first, known words at bottom
  const sortedWords = useMemo(() => {
    return [...category.words].sort((a, b) => {
      const aKnown = knownSet.has(a.hindi) ? 1 : 0
      const bKnown = knownSet.has(b.hindi) ? 1 : 0
      return aKnown - bKnown
    })
  }, [category.words, knownSet])

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/vocabulary')}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-3 flex items-center gap-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15,18 9,12 15,6" />
          </svg>
          Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{category.emoji}</span>
          <div>
            <h1 className="text-xl font-extrabold text-[var(--text-primary)]">
              {category.title}
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {learnedCount}/{totalCount} words explored
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${category.gradient} rounded-full`}
            animate={{ width: `${(learnedCount / totalCount) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        {/* Swipe hint */}
        <p className="mt-2 text-xs text-[var(--text-tertiary)] text-center">
          Swipe right = known | Swipe left = needs review
        </p>
      </div>

      {/* Word Cards */}
      <div className="space-y-3">
        {sortedWords.map((word, index) => (
          <SwipeableWordCard
            key={word.hindi}
            word={word}
            index={index}
            isFlipped={flippedCard === word.hindi}
            isKnown={knownSet.has(word.hindi)}
            isReview={reviewSet.has(word.hindi)}
            onTap={handleCardTap}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
          />
        ))}
      </div>
    </div>
  )
}

function SwipeableWordCard({
  word,
  index,
  isFlipped,
  isKnown,
  isReview,
  onTap,
  onSwipeRight,
  onSwipeLeft,
}: {
  word: VocabWord
  index: number
  isFlipped: boolean
  isKnown: boolean
  isReview: boolean
  onTap: (word: VocabWord) => void
  onSwipeRight: (word: VocabWord) => void
  onSwipeLeft: (word: VocabWord) => void
}) {
  const x = useMotionValue(0)
  const bgOpacity = useTransform(x, [-100, 0, 100], [0.3, 0, 0.3])
  const bgColorRight = useTransform(x, [0, 100], ['rgba(16,185,129,0)', 'rgba(16,185,129,0.15)'])
  const bgColorLeft = useTransform(x, [-100, 0], ['rgba(245,158,11,0.15)', 'rgba(245,158,11,0)'])

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 80 || info.velocity.x > 500) {
      onSwipeRight(word)
    } else if (info.offset.x < -80 || info.velocity.x < -500) {
      onSwipeLeft(word)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
    >
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        dragMomentum={false}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 30 }}
        onDragEnd={handleDragEnd}
        onClick={() => onTap(word)}
        className={`relative bg-[var(--bg-surface)] rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
          isFlipped
            ? 'border-[var(--accent)] shadow-md'
            : isKnown
              ? 'border-emerald-300 bg-emerald-50/30'
              : isReview
                ? 'border-amber-300'
                : 'border-[var(--border)] hover:border-[var(--accent)]/50'
        }`}
      >
        {/* Swipe overlays */}
        <motion.div
          style={{ backgroundColor: bgColorRight }}
          className="absolute inset-0 rounded-xl pointer-events-none z-10"
        />
        <motion.div
          style={{ backgroundColor: bgColorLeft }}
          className="absolute inset-0 rounded-xl pointer-events-none z-10"
        />

        {/* Status indicators */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {isKnown && (
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" title="Known" />
          )}
          {isReview && (
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" title="Needs review" />
          )}
        </div>

        {/* Front side - always visible */}
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-[var(--text-primary)]">
                {word.hindi}
              </p>
              <ReadAloudButton text={word.hindi} />
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-[var(--bg-elevated)] text-[var(--text-tertiary)] rounded-full font-medium mr-6">
              {word.type}
            </span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            {word.pronunciation}
          </p>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            {word.english}
          </p>
        </div>

        {/* Back side - details on flip */}
        <AnimatePresence>
          {isFlipped && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-0 border-t border-[var(--border)]">
                <div className="mt-3 bg-[var(--bg-elevated)] rounded-lg p-3">
                  <p className="text-xs text-[var(--text-tertiary)] mb-1 font-medium uppercase tracking-wide">Example</p>
                  <p className="text-sm text-[var(--text-primary)] italic">
                    {word.example}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
