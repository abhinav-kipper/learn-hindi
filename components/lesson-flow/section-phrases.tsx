'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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
}: {
  phrase: Phrase
  grammarNote?: string
}) {
  const [revealed, setRevealed] = useState(false)

  const handleReveal = () => {
    if (!revealed) {
      playSound('pop')
    }
    setRevealed(!revealed)
  }

  return (
    <div
      onClick={handleReveal}
      className="bg-[var(--bg-surface)] rounded-3xl shadow-lg p-6 min-h-[320px] max-h-[480px] flex flex-col items-center cursor-pointer select-none border border-violet-100 overflow-y-auto"
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
          {/* English + context */}
          <p className="text-lg text-[var(--text-primary)] font-medium">{phrase.english}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-2 italic">{phrase.context}</p>

          {/* Grammar note (if matched to this phrase) */}
          {grammarNote && (
            <div className="mt-4 pt-4 border-t border-emerald-100 text-left w-full">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
                Grammar
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
  )
}

function CultureTipCard({ note }: { note: string }) {
  return (
    <div className="bg-[var(--bg-surface)] rounded-3xl shadow-lg p-6 min-h-[240px] flex flex-col items-center justify-center border border-amber-100">
      <span className="text-2xl mb-3">💡</span>
      <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">
        Culture Tip
      </p>
      <p className="text-base text-[var(--text-secondary)] text-center leading-relaxed">
        {note}
      </p>
    </div>
  )
}

export function SectionPhrases({ phrases, grammarNotes, cultureNotes, onNext }: SectionPhrasesProps) {
  // Distribute grammar notes across phrases (1:1 by index)
  const phraseCards = phrases.map((phrase, i) => (
    <PhraseCardContent
      key={`phrase-${i}`}
      phrase={phrase}
      grammarNote={i < grammarNotes.length ? grammarNotes[i] : undefined}
    />
  ))

  // Culture notes become bonus cards at the end of the carousel
  const cultureCards = cultureNotes.map((note, i) => (
    <CultureTipCard key={`culture-${i}`} note={note} />
  ))

  const allCards = [...phraseCards, ...cultureCards]

  return (
    <div className="flex flex-col flex-1 pt-4">
      <h2 className="text-sm font-semibold text-violet-600 uppercase tracking-wide text-center mb-2">
        Key Phrases
      </h2>
      <SwipeableCarousel items={allCards} onComplete={onNext} />
    </div>
  )
}
