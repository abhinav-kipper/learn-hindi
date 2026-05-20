'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phrase } from '@/types/lesson'
import { SwipeableCarousel } from './swipeable-carousel'

interface SectionPhrasesProps {
  phrases: Phrase[]
  onNext: () => void
}

function PhraseCardContent({ phrase }: { phrase: Phrase }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div
      onClick={() => setRevealed(!revealed)}
      className="bg-white rounded-3xl shadow-lg p-8 min-h-[280px] flex flex-col items-center justify-center cursor-pointer select-none border border-violet-100"
    >
      <p className="text-2xl md:text-3xl font-bold text-slate-900 text-center leading-relaxed">
        {phrase.hindi}
      </p>

      {revealed ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <p className="text-lg text-slate-700 font-medium">{phrase.english}</p>
          <p className="text-sm text-slate-500 mt-2 italic">{phrase.context}</p>
        </motion.div>
      ) : (
        <p className="mt-6 text-sm text-indigo-400 font-medium">Tap to reveal translation</p>
      )}
    </div>
  )
}

export function SectionPhrases({ phrases, onNext }: SectionPhrasesProps) {
  const cards = phrases.map((phrase, i) => (
    <PhraseCardContent key={i} phrase={phrase} />
  ))

  return (
    <div className="flex flex-col flex-1 pt-4">
      <h2 className="text-sm font-semibold text-violet-600 uppercase tracking-wide text-center mb-2">
        Key Phrases
      </h2>
      <SwipeableCarousel items={cards} onComplete={onNext} />
    </div>
  )
}
