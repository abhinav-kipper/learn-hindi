'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lesson } from '@/types/lesson'
import { isLessonComplete } from '@/lib/progress'
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

export function LessonCard({ lesson, index }: LessonCardProps) {
  const { config } = useLanguage()
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    setCompleted(isLessonComplete(lesson.id, config.storagePrefix))
  }, [lesson.id, config.storagePrefix])

  const gradient = gradients[index % gradients.length]
  const accent = accentColors[index % accentColors.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08, ease: 'easeOut' }}
    >
      <Link href={`/lessons/${lesson.id}`}>
        <div className={`relative min-h-[200px] p-6 rounded-3xl border border-white/50 bg-gradient-to-br ${gradient} shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden`}>
          {/* Background number */}
          <span className="absolute -right-2 -top-4 text-8xl font-black text-slate-900/[0.03] select-none pointer-events-none">
            {index + 1}
          </span>

          {/* Completion badge */}
          {completed && (
            <div className="absolute top-4 right-4 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-bold">✓</span>
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
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
