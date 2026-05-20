'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phrase } from '@/types/lesson'

interface PhraseCardProps {
  phrase: Phrase
  index: number
}

export function PhraseCard({ phrase, index }: PhraseCardProps) {
  const [revealed, setRevealed] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.06 }}
      onClick={() => setRevealed(!revealed)}
      className="p-5 bg-white rounded-2xl border border-slate-200 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all duration-200 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <span className="text-sm font-bold text-indigo-400 mt-1">
          {index + 1}
        </span>
        <div className="flex-1">
          <p className="text-xl font-semibold text-slate-900 leading-snug">{phrase.hindi}</p>
          <AnimatePresence mode="wait">
            {revealed ? (
              <motion.div
                key="revealed"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="mt-2.5 space-y-1.5 overflow-hidden"
              >
                <p className="text-slate-700 text-base">{phrase.english}</p>
                <p className="text-sm text-indigo-500 italic">{phrase.context}</p>
              </motion.div>
            ) : (
              <motion.p
                key="hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-slate-400 mt-1.5"
              >
                Tap to reveal meaning
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
