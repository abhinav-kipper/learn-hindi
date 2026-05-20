'use client'

import { useState } from 'react'
import { SkillBreakdown as SkillBreakdownType } from '@/types/lesson'

interface SkillBreakdownProps {
  skill: SkillBreakdownType
}

export function SkillBreakdown({ skill }: SkillBreakdownProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-amber-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left bg-amber-50 hover:bg-amber-100 transition-colors flex items-center justify-between"
      >
        <span className="font-semibold text-amber-800">{skill.skill}</span>
        <span className="text-amber-600">{expanded ? '−' : '+'}</span>
      </button>
      {expanded && (
        <div className="p-4 bg-white space-y-3">
          <p className="text-gray-700 text-sm">{skill.explanation}</p>
          <div className="space-y-2">
            {skill.more_examples.map((ex, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <span className="font-medium text-gray-900">{ex.hindi}</span>
                <span className="text-gray-500">— {ex.english}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
