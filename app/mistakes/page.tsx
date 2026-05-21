'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getMistakes, deleteMistake, clearMistakes, type Mistake } from '@/lib/mistakes'
import { useLanguage } from '@/lib/language-context'
import { getUniversalLessonById } from '@/lib/all-content'

export default function MistakesPage() {
  const router = useRouter()
  const { config } = useLanguage()
  const prefix = config.storagePrefix
  const [mistakes, setMistakes] = useState<Mistake[]>([])
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    setMistakes(getMistakes(prefix))
  }, [prefix])

  const handleDelete = (id: string) => {
    deleteMistake(id, prefix)
    setMistakes(getMistakes(prefix))
  }

  const handleClearAll = () => {
    clearMistakes(prefix)
    setMistakes([])
    setConfirmClear(false)
  }

  // Group by lesson, newest first within each group
  const groups = mistakes.reduceRight<Record<string, Mistake[]>>((acc, m) => {
    const key = m.lessonId
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
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
        {mistakes.length > 0 && (
          <button
            onClick={() => setConfirmClear(true)}
            className="text-xs text-[var(--text-tertiary)] hover:text-red-500 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
        Your mistakes
      </h1>
      <p className="text-sm text-[var(--text-secondary)] mt-1 mb-6">
        Corrections the tutor gave you in practice
      </p>

      {mistakes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">✨</div>
          <p className="text-[var(--text-secondary)] font-medium">
            No mistakes yet
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">
            Mistakes the tutor corrects during practice will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([lessonId, items]) => {
            const lesson = getUniversalLessonById(lessonId)
            return (
              <div key={lessonId}>
                <h2 className="text-xs uppercase tracking-wide font-bold text-[var(--text-tertiary)] mb-2">
                  {lesson?.title ?? lessonId}
                </h2>
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {items.map(m => (
                      <motion.div
                        key={m.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">
                              <span className="line-through text-[var(--text-tertiary)]">{m.original}</span>
                              <span className="mx-2 text-[var(--text-tertiary)]">→</span>
                              <span className="font-semibold text-emerald-600">{m.correction}</span>
                            </p>
                            {m.reason && (
                              <p className="text-xs text-[var(--text-secondary)] mt-1 italic">
                                {m.reason}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDelete(m.id)}
                            aria-label="Delete"
                            className="flex-shrink-0 text-[var(--text-tertiary)] hover:text-red-500 transition-colors p-1"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
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

      <AnimatePresence>
        {confirmClear && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setConfirmClear(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[var(--bg-surface)] rounded-2xl p-5 w-[90%] max-w-sm shadow-2xl"
            >
              <h3 className="font-bold text-[var(--text-primary)] mb-2">Clear all mistakes?</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                This permanently deletes {mistakes.length} {mistakes.length === 1 ? 'mistake' : 'mistakes'}.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 py-2 px-4 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 py-2 px-4 rounded-xl bg-red-500 text-white font-medium text-sm"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
