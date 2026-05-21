'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SkillBreakdown } from '@/types/lesson'

interface SectionSkillsProps {
  skills: SkillBreakdown[]
  onNext: () => void
}

function SkillCard({ skill }: { skill: SkillBreakdown }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="bg-[var(--bg-surface)] rounded-2xl p-5 border border-sky-100 shadow-sm cursor-pointer select-none"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[var(--text-primary)]">{skill.skill}</h3>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          className="text-sky-400 text-sm"
        >
          ▼
        </motion.span>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-[var(--text-secondary)] mt-3 leading-relaxed">{skill.explanation}</p>
            {skill.more_examples.length > 0 && (
              <div className="mt-3 space-y-2">
                {skill.more_examples.map((ex, i) => (
                  <div key={i} className="text-sm pl-3 border-l-2 border-sky-200">
                    <p className="font-medium text-[var(--text-primary)]">{ex.hindi}</p>
                    <p className="text-[var(--text-secondary)]">{ex.english}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function SectionSkills({ skills, onNext }: SectionSkillsProps) {
  return (
    <div className="flex flex-col flex-1 px-6 pt-4 pb-6">
      <h2 className="text-sm font-semibold text-sky-600 uppercase tracking-wide text-center mb-4">
        Skills Summary
      </h2>

      <div className="flex-1 overflow-y-auto space-y-3">
        {skills.map((skill, i) => (
          <SkillCard key={i} skill={skill} />
        ))}
      </div>

      <button
        onClick={onNext}
        className="mt-4 w-full py-3.5 px-6 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold rounded-2xl shadow-lg shadow-sky-200"
      >
        Next →
      </button>
    </div>
  )
}
