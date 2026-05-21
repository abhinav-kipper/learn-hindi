'use client'

import { SwipeableCarousel } from './swipeable-carousel'
import { ReadAloudButton } from '@/components/read-aloud-button'

interface SectionCultureProps {
  notes: string[]
  onNext: () => void
}

/** Extract Hindi/romanized text from culture notes */
function extractHindiText(note: string): string | null {
  // Match text in quotes (single or double)
  const quoted = note.match(/["']([^"']+)["']/g)
  if (quoted) {
    return quoted.map(q => q.replace(/["']/g, '')).join('. ')
  }
  return null
}

function CultureCardContent({ note }: { note: string }) {
  const hindiText = extractHindiText(note)

  return (
    <div className="bg-[var(--bg-surface)] rounded-3xl shadow-lg p-8 min-h-[240px] flex flex-col items-center justify-center border border-amber-100">
      <span className="text-3xl mb-4">💡</span>
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

export function SectionCulture({ notes, onNext }: SectionCultureProps) {
  const cards = notes.map((note, i) => (
    <CultureCardContent key={i} note={note} />
  ))

  return (
    <div className="flex flex-col flex-1 pt-4">
      <h2 className="text-sm font-semibold text-amber-600 uppercase tracking-wide text-center mb-2">
        Culture Tips
      </h2>
      <SwipeableCarousel items={cards} onComplete={onNext} />
    </div>
  )
}
