'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getCategory, markWordLearned, isWordLearned, VocabWord, VocabCategory } from '@/lib/vocabulary'

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params.category as string

  const [category, setCategory] = useState<VocabCategory | null>(null)
  const [learnedSet, setLearnedSet] = useState<Set<string>>(new Set())
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
  }, [categoryId, router])

  const handleCardTap = (word: VocabWord) => {
    if (flippedCard === word.hindi) {
      setFlippedCard(null)
    } else {
      setFlippedCard(word.hindi)
      // Mark as learned on first tap
      if (!learnedSet.has(word.hindi)) {
        markWordLearned(categoryId, word.hindi)
        setLearnedSet(prev => new Set([...prev, word.hindi]))
      }
    }
  }

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
        {/* Progress bar */}
        <div className="mt-3 w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${category.gradient} rounded-full`}
            animate={{ width: `${(learnedCount / totalCount) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Word Cards */}
      <div className="space-y-3">
        {category.words.map((word, index) => {
          const isFlipped = flippedCard === word.hindi
          const isLearned = learnedSet.has(word.hindi)

          return (
            <motion.div
              key={word.hindi}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <div
                onClick={() => handleCardTap(word)}
                className={`relative bg-[var(--bg-surface)] rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                  isFlipped
                    ? 'border-[var(--accent)] shadow-md'
                    : 'border-[var(--border)] hover:border-[var(--accent)]/50'
                }`}
              >
                {/* Learned indicator */}
                {isLearned && (
                  <div className="absolute top-3 right-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                )}

                {/* Front side - always visible */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xl font-bold text-[var(--text-primary)]">
                        {word.hindi}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                        {word.pronunciation}
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-[var(--bg-elevated)] text-[var(--text-tertiary)] rounded-full font-medium">
                      {word.type}
                    </span>
                  </div>
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
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
