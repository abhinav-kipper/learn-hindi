'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Lesson } from '@/types/lesson'
import { isLessonComplete, getLessonCompletedAt } from '@/lib/progress'
import { useLanguage } from '@/lib/language-context'

interface LessonCardProps {
  lesson: Lesson
  index: number
}

const gradients = [
  'from-indigo-500/10 to-indigo-600/5',
  'from-violet-500/10 to-violet-600/5',
  'from-emerald-500/10 to-emerald-600/5',
  'from-amber-500/10 to-amber-600/5',
  'from-sky-500/10 to-sky-600/5',
  'from-pink-500/10 to-pink-600/5',
]

const accentColors = [
  'text-indigo-500',
  'text-violet-500',
  'text-emerald-500',
  'text-amber-500',
  'text-sky-500',
  'text-pink-500',
]

function daysAgoLabel(isoDate: string): string {
  const completed = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - completed.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 14) return '1 week ago'
  return `${Math.floor(days / 7)}w ago`
}

export function LessonCard({ lesson, index }: LessonCardProps) {
  const router = useRouter()
  const { config } = useLanguage()
  const [completed, setCompleted] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [completedAt, setCompletedAt] = useState<string | null>(null)

  useEffect(() => {
    const done = isLessonComplete(lesson.id, config.storagePrefix)
    setCompleted(done)
    setExpanded(!done)
    if (done) setCompletedAt(getLessonCompletedAt(lesson.id, config.storagePrefix))
  }, [lesson.id, config.storagePrefix])

  const gradient = gradients[index % gradients.length]
  const accent = accentColors[index % accentColors.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.08,
        ease: 'easeOut',
        layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
      }}
      layout
    >
      <AnimatePresence mode="wait" initial={false}>
        {completed && !expanded ? (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setExpanded(true)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/50 bg-gradient-to-br ${gradient} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-shadow,transform duration-200 text-left`}
          >
            <div className="w-6 h-6 flex-shrink-0 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wide ${accent} flex-shrink-0`}>
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[var(--text-primary)] text-sm truncate">{lesson.title}</h3>
              {completedAt && (
                <p className="text-[10px] text-[var(--text-tertiary)]">{daysAgoLabel(completedAt)}</p>
              )}
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0">
              <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              if (completed) {
                setExpanded(false)
              } else {
                router.push(`/lessons/${lesson.id}`)
              }
            }}
            className="cursor-pointer"
          >
            <div className={`relative min-h-[200px] p-6 rounded-3xl border border-white/50 bg-gradient-to-br ${gradient} shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden`}>
              {/* Background number */}
              <span className="absolute -right-2 -top-4 text-8xl font-black text-slate-900/[0.03] select-none pointer-events-none">
                {index + 1}
              </span>

              {/* Completion badge / collapse button */}
              {completed && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div className="w-7 h-7 bg-white/60 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/50">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-[var(--text-secondary)]">
                      <path fillRule="evenodd" d="M14.78 11.78a.75.75 0 0 1-1.06 0L10 8.06l-3.72 3.72a.75.75 0 1 1-1.06-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06Z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="relative z-10">
                <span className={`text-xs font-semibold uppercase tracking-wide ${accent}`}>
                  Lesson {index + 1}
                </span>
                <h3 className="font-bold text-[var(--text-primary)] mt-2 text-xl">{lesson.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed line-clamp-2">
                  {lesson.situation}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {lesson.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs bg-white/60 text-[var(--text-secondary)] px-2.5 py-1 rounded-full font-medium backdrop-blur-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Quick actions */}
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/practice/${lesson.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs px-3 py-1.5 rounded-full bg-[var(--accent)] text-white font-medium hover:opacity-90 transition-colors"
                  >
                    💬 Practice
                  </Link>
                  {completed && (
                    <Link
                      href={`/lessons/${lesson.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs px-3 py-1.5 rounded-full bg-white/60 text-[var(--text-secondary)] font-medium hover:bg-white/80 transition-colors backdrop-blur-sm border border-white/50"
                    >
                      Review
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
