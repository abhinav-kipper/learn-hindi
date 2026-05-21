'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phrase, SkillBreakdown } from '@/types/lesson'
import { SwipeableCarousel } from './swipeable-carousel'
import { ReadAloudButton } from '@/components/read-aloud-button'
import { playSound } from '@/lib/sounds'

interface SectionPhrasesProps {
  phrases: Phrase[]
  grammarNotes: string[]
  cultureNotes: string[]
  skillBreakdown?: SkillBreakdown[]
  onNext: () => void
}

/**
 * Match a grammar note to a phrase by keyword relevance.
 * Looks for overlapping words between the phrase (hindi + context) and the grammar note.
 */
function matchGrammarToPhrase(phrase: Phrase, grammarNotes: string[]): string | undefined {
  const hindiWords = phrase.hindi.toLowerCase().split(/\s+/)
  const contextWords = phrase.context.toLowerCase().split(/\s+/)

  let bestMatch: { note: string; score: number } | null = null

  for (const note of grammarNotes) {
    const noteLower = note.toLowerCase()
    let score = 0
    for (const word of [...hindiWords, ...contextWords]) {
      if (word.length > 2 && noteLower.includes(word)) score++
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { note, score }
    }
  }

  return bestMatch?.note
}

/**
 * Match a culture tip to a phrase by keyword relevance.
 */
function matchCultureToPhrase(phrase: Phrase, cultureNotes: string[]): string | undefined {
  const hindiWords = phrase.hindi.toLowerCase().split(/\s+/)
  const contextWords = phrase.context.toLowerCase().split(/\s+/)
  const englishWords = phrase.english.toLowerCase().split(/\s+/)

  let bestMatch: { note: string; score: number } | null = null

  for (const note of cultureNotes) {
    const noteLower = note.toLowerCase()
    let score = 0
    for (const word of [...hindiWords, ...contextWords, ...englishWords]) {
      if (word.length > 2 && noteLower.includes(word)) score++
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { note, score }
    }
  }

  return bestMatch?.note
}

function SkillMiniLesson({ skill }: { skill: SkillBreakdown }) {
  return (
    <div className="bg-indigo-50 border-2 border-indigo-200 rounded-3xl shadow-lg p-6 min-h-[320px] flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🧠</span>
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Skill</span>
      </div>
      <h3 className="text-lg font-bold text-indigo-800 mb-2">{skill.skill}</h3>
      <p className="text-sm text-indigo-700 leading-relaxed mb-4">{skill.explanation}</p>
      {skill.more_examples.length > 0 && (
        <div className="space-y-2 mt-auto">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Examples:</p>
          {skill.more_examples.slice(0, 3).map((ex, i) => (
            <div key={i} className="text-sm pl-3 border-l-2 border-indigo-300">
              <p className="font-medium text-indigo-800">{ex.hindi}</p>
              <p className="text-indigo-600 text-xs">{ex.english}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
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
        className="bg-[var(--bg-surface)] rounded-3xl shadow-lg p-6 pb-14 min-h-[320px] flex flex-col items-center cursor-pointer select-none border border-violet-100"
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

      {/* Culture tip button — positioned outside the card at the bottom */}
      {cultureTip && revealed && !showCulture && (
        <motion.button
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={(e) => {
            e.stopPropagation()
            setShowCulture(true)
          }}
          className="mt-2 mx-auto block bg-amber-100 text-amber-700 text-xs font-medium px-4 py-2 rounded-full shadow-sm hover:bg-amber-200 transition-colors"
        >
          💡 Culture tip
        </motion.button>
      )}

      {/* Culture tip popup — centered overlay */}
      <AnimatePresence>
        {showCulture && cultureTip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-x-2 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl border border-amber-200 p-5 z-20"
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

export function SectionPhrases({ phrases, grammarNotes, cultureNotes, skillBreakdown, onNext }: SectionPhrasesProps) {
  // Match grammar notes to phrases by keyword relevance
  // Track which grammar notes have been used to avoid duplicates
  const usedGrammarNotes = new Set<string>()
  const usedCultureNotes = new Set<string>()

  const phraseGrammarMap = phrases.map(phrase => {
    const availableGrammar = grammarNotes.filter(n => !usedGrammarNotes.has(n))
    const matched = matchGrammarToPhrase(phrase, availableGrammar)
    if (matched) usedGrammarNotes.add(matched)
    return matched
  })

  const phraseCultureMap = phrases.map(phrase => {
    const availableCulture = cultureNotes.filter(n => !usedCultureNotes.has(n))
    const matched = matchCultureToPhrase(phrase, availableCulture)
    if (matched) usedCultureNotes.add(matched)
    return matched
  })

  // Assign any unmatched grammar notes to the most relevant remaining phrases
  const unmatchedGrammar = grammarNotes.filter(n => !usedGrammarNotes.has(n))
  for (const note of unmatchedGrammar) {
    // Find phrase without a grammar note that has best match
    let bestIdx = -1
    let bestScore = 0
    for (let i = 0; i < phrases.length; i++) {
      if (phraseGrammarMap[i]) continue
      const hindiWords = phrases[i].hindi.toLowerCase().split(/\s+/)
      const contextWords = phrases[i].context.toLowerCase().split(/\s+/)
      const noteLower = note.toLowerCase()
      let score = 0
      for (const word of [...hindiWords, ...contextWords]) {
        if (word.length > 2 && noteLower.includes(word)) score++
      }
      if (score > bestScore) {
        bestScore = score
        bestIdx = i
      }
    }
    if (bestIdx >= 0) {
      phraseGrammarMap[bestIdx] = note
    }
  }

  // Build carousel items, interleaving skill mini-lessons every 3-4 phrases
  const skills = skillBreakdown || []
  const carouselItems: React.ReactNode[] = []
  let skillIdx = 0
  const PHRASES_PER_SKILL = skills.length > 0 ? Math.ceil(phrases.length / skills.length) : phrases.length + 1

  phrases.forEach((phrase, i) => {
    carouselItems.push(
      <PhraseCardContent
        key={`phrase-${i}`}
        phrase={phrase}
        grammarNote={phraseGrammarMap[i]}
        cultureTip={phraseCultureMap[i]}
      />
    )

    // After every PHRASES_PER_SKILL phrases (minimum 3), insert a skill card
    if (skills.length > 0 && skillIdx < skills.length && (i + 1) % PHRASES_PER_SKILL === 0 && (i + 1) >= 3) {
      carouselItems.push(
        <SkillMiniLesson key={`skill-${skillIdx}`} skill={skills[skillIdx]} />
      )
      skillIdx++
    }
  })

  // Add any remaining skills at the end
  while (skillIdx < skills.length) {
    carouselItems.push(
      <SkillMiniLesson key={`skill-${skillIdx}`} skill={skills[skillIdx]} />
    )
    skillIdx++
  }

  return (
    <div className="flex flex-col flex-1 pt-4">
      <h2 className="text-sm font-semibold text-violet-600 uppercase tracking-wide text-center mb-2">
        Key Phrases
      </h2>
      <SwipeableCarousel items={carouselItems} onComplete={onNext} />
    </div>
  )
}
