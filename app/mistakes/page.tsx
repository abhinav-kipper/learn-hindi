'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getMistakes, deleteMistake, clearMistakes, type Mistake, type MistakeSource } from '@/lib/mistakes'
import { useLanguage } from '@/lib/language-context'
import { getUniversalLessonById } from '@/lib/all-content'
import { ReadAloudButton } from '@/components/read-aloud-button'
import { playSound } from '@/lib/sounds'

function SourceChip({ source }: { source: MistakeSource }) {
  const isQuiz = source === 'quiz'
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
        isQuiz
          ? 'bg-indigo-100 text-indigo-700'
          : 'bg-emerald-100 text-emerald-700'
      }`}
    >
      <span>{isQuiz ? '🎯' : '💬'}</span>
      <span>{isQuiz ? 'Quiz' : 'Practice'}</span>
    </span>
  )
}

export default function MistakesPage() {
  const router = useRouter()
  const { config } = useLanguage()
  const prefix = config.storagePrefix
  const [mistakes, setMistakes] = useState<Mistake[]>([])
  const [confirmClear, setConfirmClear] = useState(false)
  const [drilling, setDrilling] = useState(false)

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => { playSound('tap'); setDrilling(true) }}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm hover:opacity-90 transition-opacity"
            >
              Drill ({mistakes.length})
            </button>
            <button
              onClick={() => setConfirmClear(true)}
              className="text-xs text-[var(--text-tertiary)] hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
        Your mistakes
      </h1>
      <p className="text-sm text-[var(--text-secondary)] mt-1 mb-6">
        Corrections from practice + wrong quiz answers
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
            const groupTitle = lesson?.title
              ?? (lessonId === 'vocab' ? 'Vocabulary'
              : lessonId.startsWith('vocab-') ? 'Vocabulary'
              : lessonId)
            return (
              <div key={lessonId}>
                <h2 className="text-xs uppercase tracking-wide font-bold text-[var(--text-tertiary)] mb-2">
                  {groupTitle}
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
                            <div className="flex items-center gap-2 mb-1">
                              <SourceChip source={m.source ?? 'practice'} />
                            </div>
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

      <AnimatePresence>
        {drilling && (
          <DrillOverlay mistakes={mistakes} onClose={() => setDrilling(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function DrillOverlay({ mistakes, onClose }: { mistakes: Mistake[]; onClose: () => void }) {
  const [order] = useState(() => [...mistakes].sort(() => Math.random() - 0.5))
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [gotItCount, setGotItCount] = useState(0)
  const current = order[index]
  const isLast = index === order.length - 1
  const complete = index >= order.length

  const advance = (gotIt: boolean) => {
    if (gotIt) {
      setGotItCount(c => c + 1)
      playSound('correct')
    } else {
      playSound('pop')
    }
    if (isLast) {
      setIndex(order.length)
    } else {
      setIndex(i => i + 1)
      setRevealed(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto"
      >
        <div className="bg-[var(--bg-surface)] rounded-t-3xl shadow-2xl border-t border-[var(--border)] overflow-hidden">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-[var(--border)] rounded-full" />
          </div>

          <div className="px-6 pb-8 pt-2">
            {complete ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="text-4xl mb-3">🎯</div>
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                  Drill done!
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mb-5">
                  {gotItCount}/{order.length} nailed
                </p>
                <button
                  onClick={onClose}
                  className="w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-xl shadow-md"
                >
                  Done
                </button>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-[var(--text-tertiary)] font-medium">
                    {index + 1} / {order.length}
                  </span>
                  <div className="flex-1 mx-3 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                      animate={{ width: `${((index + 1) / order.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <button
                    onClick={onClose}
                    aria-label="Close drill"
                    className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] ml-2"
                  >
                    ✕
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    <div
                      onClick={() => !revealed && (setRevealed(true), playSound('pop'))}
                      className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] p-6 min-h-[200px] flex flex-col items-center justify-center cursor-pointer"
                    >
                      <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] mb-2 font-semibold">
                        You said
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xl font-bold text-rose-500 line-through text-center">
                          {current.original}
                        </p>
                      </div>

                      {revealed ? (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 pt-4 border-t border-[var(--border)] w-full text-center"
                        >
                          <p className="text-xs uppercase tracking-wide text-emerald-600 mb-2 font-semibold">
                            Correct
                          </p>
                          <div className="flex items-center justify-center gap-2">
                            <p className="text-lg font-bold text-emerald-600">
                              {current.correction}
                            </p>
                            <ReadAloudButton text={current.correction} />
                          </div>
                          {current.reason && (
                            <p className="text-xs text-[var(--text-secondary)] mt-2 italic">
                              {current.reason}
                            </p>
                          )}
                        </motion.div>
                      ) : (
                        <p className="text-xs text-[var(--text-tertiary)] mt-4">Tap to reveal the fix</p>
                      )}
                    </div>

                    {revealed && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 mt-4"
                      >
                        <button
                          onClick={() => advance(false)}
                          className="flex-1 py-2.5 px-4 bg-amber-50 border border-amber-200 text-amber-700 font-semibold rounded-xl text-sm"
                        >
                          Still learning
                        </button>
                        <button
                          onClick={() => advance(true)}
                          className="flex-1 py-2.5 px-4 bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold rounded-xl text-sm"
                        >
                          Got it!
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}
