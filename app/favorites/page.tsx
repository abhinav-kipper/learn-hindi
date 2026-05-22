'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getFavorites, removeFavorite, type FavoritePhrase } from '@/lib/favorites'
import { ReadAloudButton } from '@/components/read-aloud-button'
import { useLanguage } from '@/lib/language-context'
import { getUniversalLessonById } from '@/lib/all-content'
import { playSound } from '@/lib/sounds'

export default function FavoritesPage() {
  const router = useRouter()
  const { config } = useLanguage()
  const prefix = config.storagePrefix
  const [favorites, setFavorites] = useState<FavoritePhrase[]>([])

  useEffect(() => {
    setFavorites(getFavorites(prefix))
  }, [prefix])

  const handleRemove = (lessonId: string, hindi: string) => {
    removeFavorite(lessonId, hindi, prefix)
    setFavorites(getFavorites(prefix))
    playSound('tap')
  }

  // Group by lesson, newest first within each group
  const groups = favorites.reduce<Record<string, FavoritePhrase[]>>((acc, f) => {
    if (!acc[f.lessonId]) acc[f.lessonId] = []
    acc[f.lessonId].push(f)
    return acc
  }, {})

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.back()}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15,18 9,12 15,6" />
          </svg>
          Back
        </button>
      </div>

      <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
        Saved phrases
      </h1>
      <p className="text-sm text-[var(--text-secondary)] mt-1 mb-6">
        Tap the star on any phrase to save it here
      </p>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">⭐</div>
          <p className="text-[var(--text-secondary)] font-medium">
            No saved phrases yet
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">
            Open any lesson, tap the star on a phrase card to save it.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([lessonId, items]) => {
            const lesson = getUniversalLessonById(lessonId)
            const groupTitle = lesson?.title ?? lessonId
            return (
              <div key={lessonId}>
                <h2 className="text-xs uppercase tracking-wide font-bold text-[var(--text-tertiary)] mb-2">
                  {groupTitle}
                </h2>
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {items.map(f => (
                      <motion.div
                        key={`${f.lessonId}::${f.hindi}`}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-base font-semibold text-[var(--text-primary)] leading-snug">
                                {f.hindi}
                              </p>
                              <ReadAloudButton text={f.hindi} />
                            </div>
                            {f.pronunciation && (
                              <p className="text-xs text-indigo-400 font-mono mt-0.5">
                                {f.pronunciation}
                              </p>
                            )}
                            <p className="text-sm text-[var(--text-secondary)] mt-1">
                              {f.english}
                            </p>
                            {f.context && (
                              <p className="text-xs text-[var(--text-tertiary)] mt-1 italic">
                                {f.context}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemove(f.lessonId, f.hindi)}
                            aria-label="Remove from favorites"
                            className="flex-shrink-0 p-1 text-amber-500 hover:text-[var(--text-tertiary)] transition-colors"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
