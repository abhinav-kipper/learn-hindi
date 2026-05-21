'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phrase } from '@/types/lesson'
import { SwipeableCarousel } from './swipeable-carousel'
import { ReadAloudButton } from '@/components/read-aloud-button'
import { playSound } from '@/lib/sounds'

interface SectionPhrasesProps {
  phrases: Phrase[]
  grammarNotes: string[]
  cultureNotes: string[]
  onNext: () => void
}

function PhraseCardContent({
  phrase,
  grammarNote,
  cultureTip,
}: {
  phrase: Phrase
  grammarNote?: string
  cultureTip?: string
}) {
  const [revealed, setRevealed] = useState(false)
  const [showCulture, setShowCulture] = useState(false)

  const handleReveal = () => {
    if (!revealed) {
      playSound('pop')
    }
    setRevealed(!revealed)
  }

  return (
    <div className="relative">
      <div
        onClick={handleReveal}
        className="bg-[var(--bg-surface)] rounded-3xl shadow-lg p-6 min-h-[320px] flex flex-col items-center cursor-pointer select-none border border-violet-100"
      >
        {/* Hindi text + pronunciation + read aloud */}
        <div className="flex items-center gap-2 mt-2">
          <p className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] text-center leading-relaxed">
            {phrase.hindi}
          </p>
          <ReadAloudButton text={phrase.hindi} />
        </div>

        {phrase.pronunciation && (
          <p className="mt-2 text-sm text-indigo-400 font-mono text-center">
            {phrase.pronunciation}
          </p>
        )}

        {revealed ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 text-center w-full"
          >
            <p className="text-lg text-[var(--text-primary)] font-medium">{phrase.english}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-2 italic">{phrase.context}</p>

            {grammarNote && (
              <div className="mt-4 pt-4 border-t border-emerald-100 text-left w-full">
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
                  📝 Grammar
                </p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {grammarNote}
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <p className="mt-6 text-sm text-violet-400 font-medium">Tap to reveal translation</p>
        )}
      </div>

      {/* Culture tip bubble — only shows if this card has one */}
      {cultureTip && revealed && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={(e) => {
            e.stopPropagation()
            setShowCulture(true)
          }}
          className="absolute bottom-3 right-3 bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm hover:bg-amber-200 transition-colors"
        >
          💡 Culture tip
        </motion.button>
      )}

      {/* Culture tip popup */}
      <AnimatePresence>
        {showCulture && cultureTip && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute inset-x-4 bottom-4 bg-white rounded-2xl shadow-xl border border-amber-200 p-5 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">
                  💡 Culture Tip
                </p>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                  {cultureTip}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowCulture(false)
                }}
                className="text-gray-400 hover:text-gray-600 ml-3 text-lg"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function SectionPhrases({ phrases, grammarNotes, cultureNotes, onNext }: SectionPhrasesProps) {
  // Distribute grammar notes across phrases (1:1 by index)
  // Distribute culture notes spaced evenly across phrases
  const cultureInterval = cultureNotes.length > 0
    ? Math.floor(phrases.length / cultureNotes.length)
    : 0

  const phraseCards = phrases.map((phrase, i) => {
    // Match grammar note by index
    const grammarNote = i < grammarNotes.length ? grammarNotes[i] : undefined

    // Distribute culture tips evenly across phrase cards
    let cultureTip: string | undefined
    if (cultureInterval > 0) {
      const cultureIdx = Math.floor(i / cultureInterval)
      if (i % cultureInterval === 0 && cultureIdx < cultureNotes.length) {
        cultureTip = cultureNotes[cultureIdx]
      }
    }

    return (
      <PhraseCardContent
        key={`phrase-${i}`}
        phrase={phrase}
        grammarNote={grammarNote}
        cultureTip={cultureTip}
      />
    )
  })

  return (
    <div className="flex flex-col flex-1 pt-4">
      <h2 className="text-sm font-semibold text-violet-600 uppercase tracking-wide text-center mb-2">
        Key Phrases
      </h2>
      <SwipeableCarousel items={phraseCards} onComplete={onNext} />
    </div>
  )
}
