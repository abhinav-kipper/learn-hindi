'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SkillBreakdown } from '@/types/lesson'

interface SectionSkillsProps {
  skills: SkillBreakdown[]
  onNext: () => void
}

function SkillSummaryCard({ skill }: { skill: SkillBreakdown }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="bg-[var(--bg-surface)] rounded-2xl p-4 border border-emerald-100 shadow-sm cursor-pointer select-none"
    >
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
            <polyline points="20,6 9,17 4,12" />
          </svg>
        </div>
        <h3 className="font-semibold text-[var(--text-primary)] flex-1 text-sm">{skill.skill}</h3>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          className="text-emerald-400 text-xs"
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
            <p className="text-sm text-[var(--text-secondary)] mt-3 ml-9 leading-relaxed">{skill.explanation}</p>
            {skill.more_examples.length > 0 && (
              <div className="mt-3 ml-9 space-y-2">
                {skill.more_examples.slice(0, 2).map((ex, i) => (
                  <div key={i} className="text-sm pl-3 border-l-2 border-emerald-200">
                    <p className="font-medium text-[var(--text-primary)]">{ex.hindi}</p>
                    <p className="text-[var(--text-secondary)] text-xs">{ex.english}</p>
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
    <div className="flex flex-col h-full min-h-0 px-6 pt-4 pb-6">
      {/* Header */}
      <div className="text-center mb-4 flex-shrink-0">
        <div className="text-3xl mb-2">🎉</div>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          Skills you learned
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Great job! Here&apos;s a recap of what you picked up.
        </p>
      </div>

      {/* Scrollable skills list */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pb-4 -mx-1 px-1">
        {skills.map((skill, i) => (
          <SkillSummaryCard key={i} skill={skill} />
        ))}
      </div>

      <button
        onClick={onNext}
        className="mt-4 flex-shrink-0 w-full py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-200"
      >
        Continue →
      </button>
    </div>
  )
}
