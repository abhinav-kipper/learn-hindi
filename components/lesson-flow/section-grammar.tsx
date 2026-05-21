'use client'

import { SwipeableCarousel } from './swipeable-carousel'
import { ReadAloudButton } from '@/components/read-aloud-button'

interface SectionGrammarProps {
  notes: string[]
  onNext: () => void
}

/** Extract Hindi/romanized text from grammar notes (text before " — " or in quotes) */
function extractHindiText(note: string): string | null {
  // Match text in quotes (single or double)
  const quoted = note.match(/["']([^"']+)["']/g)
  if (quoted) {
    return quoted.map(q => q.replace(/["']/g, '')).join('. ')
  }
  // Match text before a dash/hyphen explanation
  const beforeDash = note.match(/^(.+?)\s*[—–-]\s+/)
  if (beforeDash) return beforeDash[1]
  return null
}

function GrammarCardContent({ note }: { note: string }) {
  const hindiText = extractHindiText(note)

  return (
    <div className="bg-[var(--bg-surface)] rounded-3xl shadow-lg p-8 min-h-[240px] flex flex-col items-center justify-center border border-emerald-100">
      <div className="w-10 h-1 bg-emerald-300 rounded-full mb-6" />
      <p className="text-lg text-[var(--text-secondary)] text-center leading-relaxed font-medium">
        {note}
      </p>
      {hindiText && (
        <div className="mt-4">
          <ReadAloudButton text={hindiText} />
        </div>
      )}
    </div>
  )
}

export function SectionGrammar({ notes, onNext }: SectionGrammarProps) {
  const cards = notes.map((note, i) => (
    <GrammarCardContent key={i} note={note} />
  ))

  return (
    <div className="flex flex-col flex-1 pt-4">
      <h2 className="text-sm font-semibold text-emerald-600 uppercase tracking-wide text-center mb-2">
        Grammar Notes
      </h2>
      <SwipeableCarousel items={cards} onComplete={onNext} />
    </div>
  )
}
