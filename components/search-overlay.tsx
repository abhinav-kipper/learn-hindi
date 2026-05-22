'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllLessons } from '@/lib/lessons'
import { getAllFoundations } from '@/lib/foundations'
import { getAllCategories } from '@/lib/vocabulary'
import { useLanguage } from '@/lib/language-context'
import { playSound } from '@/lib/sounds'

interface SearchResult {
  type: 'lesson' | 'phrase' | 'vocab'
  title: string
  subtitle: string
  href: string
  badge?: string
}

function buildIndex(language: string): SearchResult[] {
  const results: SearchResult[] = []

  // Lessons + phrases
  const lessons = [...getAllLessons(), ...getAllFoundations()]
  for (const lesson of lessons) {
    results.push({
      type: 'lesson',
      title: lesson.title,
      subtitle: lesson.situation ?? '',
      href: `/lessons/${lesson.id}`,
      badge: 'Lesson',
    })
    if (lesson.phrases) {
      for (const phrase of lesson.phrases) {
        results.push({
          type: 'phrase',
          title: phrase.hindi,
          subtitle: phrase.english,
          href: `/lessons/${lesson.id}`,
          badge: lesson.title,
        })
      }
    }
  }

  // Vocabulary
  if (language !== 'dutch') {
    for (const cat of getAllCategories()) {
      for (const word of cat.words) {
        results.push({
          type: 'vocab',
          title: word.hindi,
          subtitle: word.english,
          href: `/vocabulary`,
          badge: cat.title,
        })
      }
    }
  }

  return results
}

function search(index: SearchResult[], query: string): SearchResult[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  const hits = index.filter(r =>
    r.title.toLowerCase().includes(q) ||
    r.subtitle.toLowerCase().includes(q) ||
    (r.badge?.toLowerCase().includes(q) ?? false)
  )
  // Dedupe phrases that map to the same lesson href when we already have a lesson result
  return hits.slice(0, 20)
}

const typeLabel: Record<SearchResult['type'], string> = {
  lesson: '📖',
  phrase: '💬',
  vocab: '📝',
}

interface SearchOverlayProps {
  open: boolean
  onClose: () => void
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const router = useRouter()
  const { language } = useLanguage()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const index = useMemo(() => buildIndex(language), [language])
  const results = useMemo(() => search(index, query), [index, query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSelect = (result: SearchResult) => {
    playSound('tap')
    onClose()
    router.push(result.href)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-[var(--bg-base)] border-b border-[var(--border)] p-4 safe-top"
            onClick={e => e.stopPropagation()}
          >
            <div className="max-w-md mx-auto flex items-center gap-3">
              <svg className="text-[var(--text-tertiary)] flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search lessons, phrases, vocab…"
                className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none text-base"
              />
              <button
                onClick={onClose}
                className="text-[var(--text-secondary)] text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </motion.div>

          <div
            className="flex-1 overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="max-w-md mx-auto p-4 space-y-1">
              {query.length === 0 && (
                <p className="text-center text-sm text-[var(--text-tertiary)] py-8">
                  Type to search lessons, phrases, and vocab
                </p>
              )}
              {query.length > 0 && results.length === 0 && (
                <p className="text-center text-sm text-[var(--text-tertiary)] py-8">
                  No results for &ldquo;{query}&rdquo;
                </p>
              )}
              {results.map((r, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => handleSelect(r)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors text-left"
                >
                  <span className="text-lg flex-shrink-0">{typeLabel[r.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{r.title}</p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">{r.subtitle}</p>
                  </div>
                  {r.badge && (
                    <span className="text-[10px] font-medium bg-[var(--accent-soft)] text-[var(--accent-text)] px-2 py-0.5 rounded-full flex-shrink-0 max-w-[80px] truncate">
                      {r.badge}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
