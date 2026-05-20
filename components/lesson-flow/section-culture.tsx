'use client'

import { SwipeableCarousel } from './swipeable-carousel'

interface SectionCultureProps {
  notes: string[]
  onNext: () => void
}

function CultureCardContent({ note }: { note: string }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 min-h-[240px] flex flex-col items-center justify-center border border-amber-100">
      <span className="text-3xl mb-4">💡</span>
      <p className="text-lg text-slate-700 text-center leading-relaxed font-medium">
        {note}
      </p>
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
