'use client'

import { useState } from 'react'
import { Phrase } from '@/types/lesson'

interface PhraseCardProps {
  phrase: Phrase
  index: number
}

export function PhraseCard({ phrase, index }: PhraseCardProps) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div
      onClick={() => setRevealed(!revealed)}
      className="p-4 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-orange-300 transition-all"
    >
      <div className="flex items-start gap-3">
        <span className="text-sm font-medium text-orange-400 mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1">
          <p className="text-lg font-semibold text-gray-900">{phrase.hindi}</p>
          {revealed ? (
            <div className="mt-2 space-y-1">
              <p className="text-gray-700">{phrase.english}</p>
              <p className="text-sm text-orange-600 italic">{phrase.context}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mt-1">Tap to reveal meaning</p>
          )}
        </div>
      </div>
    </div>
  )
}
