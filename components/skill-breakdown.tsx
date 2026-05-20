'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SkillBreakdown as SkillBreakdownType } from '@/types/lesson'

interface SkillBreakdownProps {
  skill: SkillBreakdownType
}

export function SkillBreakdown({ skill }: SkillBreakdownProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left hover:bg-slate-50 transition-colors duration-150 flex items-center justify-between"
      >
        <span className="font-semibold text-slate-800">{skill.skill}</span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-indigo-500 text-lg"
        >
          {expanded ? '−' : '+'}
        </motion.span>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-3 border-t border-slate-100">
              <p className="text-slate-600 text-sm leading-relaxed mt-3">{skill.explanation}</p>
              <div className="space-y-2">
                {skill.more_examples.map((ex, i) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <span className="font-medium text-slate-900">{ex.hindi}</span>
                    <span className="text-slate-400">—</span>
                    <span className="text-slate-500">{ex.english}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
