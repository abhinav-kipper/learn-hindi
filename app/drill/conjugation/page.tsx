'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { VERBS, Tense, shuffle, getDistractors, type Verb, type ConjRow } from '@/lib/conjugations'
import { playSound } from '@/lib/sounds'

const TENSES: Tense[] = ['present', 'past', 'future']
const TENSE_LABELS: Record<Tense, string> = {
  present: 'Present',
  past: 'Past',
  future: 'Future',
}

interface DrillCard {
  verb: Verb
  tense: Tense
  row: ConjRow
  options: string[]   // 4 choices, shuffled
  correct: string
}

function buildDeck(verb: Verb, tense: Tense): DrillCard[] {
  const rows = verb.tenses[tense]
  return shuffle(rows).map(row => {
    const distractors = getDistractors(verb, tense, row.form)
    const options = shuffle([row.form, ...distractors.slice(0, 3)])
    return { verb, tense, row, options, correct: row.form }
  })
}

export default function ConjugationDrillPage() {
  const router = useRouter()
  const [selectedVerb, setSelectedVerb] = useState<Verb | null>(null)
  const [selectedTense, setSelectedTense] = useState<Tense>('present')
  const [deck, setDeck] = useState<DrillCard[]>([])
  const [cardIdx, setCardIdx] = useState(0)
  const [chosen, setChosen] = useState<string | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [done, setDone] = useState(false)

  const startDrill = useCallback((verb: Verb, tense: Tense) => {
    const newDeck = buildDeck(verb, tense)
    setDeck(newDeck)
    setCardIdx(0)
    setChosen(null)
    setScore({ correct: 0, total: 0 })
    setDone(false)
    setSelectedVerb(verb)
    setSelectedTense(tense)
    playSound('tap')
  }, [])

  const handleChoice = (choice: string) => {
    if (chosen !== null) return
    setChosen(choice)
    const isCorrect = choice === deck[cardIdx].correct
    playSound(isCorrect ? 'correct' : 'wrong')
    setScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }))
  }

  const handleNext = () => {
    if (cardIdx + 1 >= deck.length) {
      setDone(true)
    } else {
      setCardIdx(i => i + 1)
      setChosen(null)
    }
    playSound('swipe')
  }

  // Selection screen
  if (!selectedVerb) {
    return (
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15,18 9,12 15,6" />
            </svg>
            Back
          </button>
        </div>

        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight mb-1">
          Conjugation Drill
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Pick a verb and tense to drill
        </p>

        {/* Tense selector */}
        <div className="flex gap-2 mb-6">
          {TENSES.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTense(t)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedTense === t
                  ? 'bg-[var(--accent)] text-white shadow-md'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border)]'
              }`}
            >
              {TENSE_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Verb cards */}
        <div className="space-y-3">
          {VERBS.map(verb => (
            <motion.button
              key={verb.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => startDrill(verb, selectedTense)}
              className="w-full flex items-center justify-between px-5 py-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl hover:border-[var(--accent)] transition-colors text-left group"
            >
              <div>
                <p className="font-bold text-[var(--text-primary)] text-base">{verb.infinitive}</p>
                <p className="text-sm text-[var(--text-secondary)]">{verb.meaning}</p>
              </div>
              <div className="flex items-center gap-2">
                {verb.transitive && (
                  <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                    transitive
                  </span>
                )}
                <svg className="text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9,18 15,12 9,6" />
                </svg>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // Done screen
  if (done) {
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">{pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📚'}</div>
        <h2 className="text-2xl font-extrabold text-[var(--text-primary)] mb-2">
          {score.correct}/{score.total} correct
        </h2>
        <p className="text-[var(--text-secondary)] text-sm mb-8">
          {pct >= 80 ? 'Excellent! You know this tense well.' : pct >= 50 ? 'Good start — drill it again to solidify.' : 'Keep going, repetition is key!'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => startDrill(selectedVerb, selectedTense)}
            className="px-6 py-3 bg-[var(--accent)] text-white font-semibold rounded-2xl shadow hover:opacity-90"
          >
            Drill again
          </button>
          <button
            onClick={() => { setSelectedVerb(null); setDone(false) }}
            className="px-6 py-3 bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] font-semibold rounded-2xl"
          >
            Change verb
          </button>
        </div>
      </div>
    )
  }

  const card = deck[cardIdx]
  const progress = deck.length > 0 ? (cardIdx / deck.length) : 0

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setSelectedVerb(null)}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15,18 9,12 15,6" />
          </svg>
          {selectedVerb.infinitive}
        </button>
        <span className="text-xs text-[var(--text-tertiary)] font-medium">
          {cardIdx + 1} / {deck.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[var(--bg-surface)] rounded-full mb-8">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-400 to-violet-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={cardIdx}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >
          {/* Prompt card */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-8 text-center mb-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)] mb-1">
              {TENSE_LABELS[card.tense]} tense
            </p>
            <p className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              {card.row.subject}
            </p>
            <p className="text-lg text-indigo-500 font-medium">
              {card.verb.infinitive} — {card.verb.meaning}
            </p>
            {card.verb.transitive && card.tense === 'past' && (
              <p className="text-xs text-amber-600 mt-3 font-medium leading-snug">
                Ne construction — the verb agrees with the gender &amp; number of the direct object, not the subject.
              </p>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {card.options.map(opt => {
              const isChosen = chosen === opt
              const isCorrect = opt === card.correct
              let cls = 'bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)]'
              if (chosen !== null) {
                if (isCorrect) cls = 'bg-emerald-50 border-emerald-400 text-emerald-800'
                else if (isChosen) cls = 'bg-red-50 border-red-400 text-red-800'
                else cls = 'bg-[var(--bg-surface)] border-[var(--border)] text-[var(--text-tertiary)] opacity-60'
              }
              return (
                <motion.button
                  key={opt}
                  whileTap={chosen === null ? { scale: 0.95 } : {}}
                  onClick={() => handleChoice(opt)}
                  className={`py-4 px-3 rounded-2xl text-center font-semibold text-base border-2 transition-all duration-200 ${cls}`}
                >
                  {opt}
                  {chosen !== null && isCorrect && <span className="ml-1">✓</span>}
                  {chosen !== null && isChosen && !isCorrect && <span className="ml-1">✗</span>}
                </motion.button>
              )
            })}
          </div>

          {chosen !== null && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleNext}
              className="mt-6 w-full py-4 rounded-2xl bg-[var(--accent)] text-white font-bold text-base shadow hover:opacity-90"
            >
              {cardIdx + 1 >= deck.length ? 'See results →' : 'Next →'}
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
