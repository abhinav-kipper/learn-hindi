'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { getCategory, markWordLearned, isWordLearned, VocabWord, VocabCategory } from '@/lib/vocabulary'
import { getDutchCategory, markDutchWordLearned, isDutchWordLearned } from '@/lib/dutch/vocabulary'
import { getVocabKnown, getVocabReview, addVocabKnown, addVocabReview, removeVocabKnown, removeVocabReview } from '@/lib/vocab-review'
import { ReadAloudButton } from '@/components/read-aloud-button'
import { playSound } from '@/lib/sounds'
import { useLanguage } from '@/lib/language-context'

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const { language, config } = useLanguage()
  const categoryId = params.category as string

  const [category, setCategory] = useState<VocabCategory | null>(null)
  const [learnedSet, setLearnedSet] = useState<Set<string>>(new Set())
  const [knownSet, setKnownSet] = useState<Set<string>>(new Set())
  const [reviewSet, setReviewSet] = useState<Set<string>>(new Set())
  const [flippedCard, setFlippedCard] = useState<string | null>(null)

  const isDutch = language === 'dutch'

  useEffect(() => {
    const cat = isDutch ? getDutchCategory(categoryId) : getCategory(categoryId)
    if (!cat) {
      router.replace('/vocabulary')
      return
    }
    setCategory(cat)

    const learned = new Set<string>()
    cat.words.forEach(word => {
      const learned_ = isDutch
        ? isDutchWordLearned(categoryId, word.hindi)
        : isWordLearned(categoryId, word.hindi)
      if (learned_) learned.add(word.hindi)
    })
    setLearnedSet(learned)

    setKnownSet(new Set(getVocabKnown()))
    setReviewSet(new Set(getVocabReview()))
  }, [categoryId, router, isDutch])

  const handleCardTap = (word: VocabWord) => {
    if (flippedCard === word.hindi) {
      setFlippedCard(null)
    } else {
      setFlippedCard(word.hindi)
      playSound('pop')
      if (!learnedSet.has(word.hindi)) {
        if (isDutch) markDutchWordLearned(categoryId, word.hindi)
        else markWordLearned(categoryId, word.hindi)
        setLearnedSet(prev => new Set([...prev, word.hindi]))
      }
    }
  }

  const handleSwipeRight = useCallback((word: VocabWord) => {
    playSound('correct')
    addVocabKnown(word.hindi)
    removeVocabReview(word.hindi)
    setKnownSet(prev => new Set([...prev, word.hindi]))
    setReviewSet(prev => {
      const next = new Set(prev)
      next.delete(word.hindi)
      return next
    })
    if (!learnedSet.has(word.hindi)) {
      if (isDutch) markDutchWordLearned(categoryId, word.hindi)
      else markWordLearned(categoryId, word.hindi)
      setLearnedSet(prev => new Set([...prev, word.hindi]))
    }
  }, [categoryId, learnedSet, isDutch])

  const handleSwipeLeft = useCallback((word: VocabWord) => {
    playSound('swipe')
    addVocabReview(word.hindi)
    removeVocabKnown(word.hindi)
    setReviewSet(prev => new Set([...prev, word.hindi]))
    setKnownSet(prev => {
      const next = new Set(prev)
      next.delete(word.hindi)
      return next
    })
    if (!learnedSet.has(word.hindi)) {
      if (isDutch) markDutchWordLearned(categoryId, word.hindi)
      else markWordLearned(categoryId, word.hindi)
      setLearnedSet(prev => new Set([...prev, word.hindi]))
    }
  }, [categoryId, learnedSet, isDutch])

  // useMemo must be before any early returns to satisfy Rules of Hooks
  const sortedWords = useMemo(() => {
    if (!category) return []
    return [...category.words].sort((a, b) => {
      const aKnown = knownSet.has(a.hindi) ? 1 : 0
      const bKnown = knownSet.has(b.hindi) ? 1 : 0
      return aKnown - bKnown
    })
  }, [category, knownSet])

  if (!category) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const learnedCount = learnedSet.size
  const totalCount = category.words.length

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
        <div className="mt-3 w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${category.gradient} rounded-full`}
            animate={{ width: `${(learnedCount / totalCount) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
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

        {/* Front side */}
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

        {/* Back side */}
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
