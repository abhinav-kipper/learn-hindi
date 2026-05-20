'use client'

import { SwipeableCarousel } from './swipeable-carousel'

interface SectionGrammarProps {
  notes: string[]
  onNext: () => void
}

function GrammarCardContent({ note }: { note: string }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 min-h-[240px] flex flex-col items-center justify-center border border-emerald-100">
      <div className="w-10 h-1 bg-emerald-300 rounded-full mb-6" />
      <p className="text-lg text-slate-700 text-center leading-relaxed font-medium">
        {note}
      </p>
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
