'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lesson } from '@/types/lesson'
import { isLessonComplete } from '@/lib/progress'

interface LessonCardProps {
  lesson: Lesson
  index: number
}

export function LessonCard({ lesson, index }: LessonCardProps) {
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    setCompleted(isLessonComplete(lesson.id))
  }, [lesson.id])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08, ease: 'easeOut' }}
    >
      <Link href={`/lessons/${lesson.id}`}>
        <div className={`p-5 rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
          completed
            ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 shadow-sm'
            : 'border-slate-200 bg-white hover:border-indigo-300 shadow-sm'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">
                  Lesson {index + 1}
                </span>
                {completed && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                    Complete
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 mt-1.5 text-base">{lesson.title}</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{lesson.situation}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {lesson.skills.map((skill) => (
              <span
                key={skill}
                className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
