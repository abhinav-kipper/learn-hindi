'use client'

import { motion } from 'framer-motion'
import { Lesson } from '@/types/lesson'

interface SectionIntroProps {
  lesson: Lesson
  onNext: () => void
}

export function SectionIntro({ lesson, onNext }: SectionIntroProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-8">
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-3xl font-extrabold text-slate-900 text-center tracking-tight"
      >
        {lesson.title}
      </motion.h1>

      {/* Situation card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 w-full p-6 bg-white/70 backdrop-blur-sm rounded-3xl border border-indigo-100 shadow-lg shadow-indigo-100/50"
      >
        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-2">The Situation</p>
        <p className="text-slate-700 leading-relaxed text-base">{lesson.situation}</p>
      </motion.div>

      {/* Skills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap justify-center gap-2 mt-6"
      >
        {lesson.skills.map((skill) => (
          <span
            key={skill}
            className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-medium"
          >
            {skill}
          </span>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={onNext}
        whileTap={{ scale: 0.97 }}
        className="mt-auto mb-4 w-full py-4 px-6 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-200 text-lg"
      >
        Start Learning →
      </motion.button>
    </div>
  )
}
