import { vi, describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TheoryView } from '@/components/lesson/TheoryView'
import type { Theory } from '@/types/lesson'

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, { get: () => (props: any) => <div {...props} /> }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const THEORY: Theory = {
  intro: 'Hindi has two genders.',
  sections: [
    {
      heading: 'The two genders',
      body: 'Every noun is masculine or feminine.\n\nThere is no neuter.',
      examples: [
        { hindi: 'ladka acchaa hai', english: 'the boy is good', breakdown: '(m) noun + (m) adj' },
      ],
      callout: { tone: 'note', body: 'verb hai is gender-invariant' },
    },
    {
      heading: 'Endings',
      body: 'Most -aa words are masculine.',
      table: {
        caption: 'Common endings',
        columns: ['ending', 'gender'],
        rows: [
          ['-aa', 'masc'],
          ['-i', 'fem'],
        ],
      },
      callout: { tone: 'warning', body: 'aadmi is the famous exception' },
    },
    {
      heading: 'Final tip',
      body: 'Memorize gender with the word.',
      callout: { tone: 'tip', body: 'write it as ladka (m) in your notes' },
    },
  ],
  wrap_up: 'Gender is structural.',
}

describe('TheoryView', () => {
  it('renders chapter title + intro paragraph', () => {
    render(<TheoryView theory={THEORY} title="Noun Gender" onStartPhrases={() => {}} />)
    expect(screen.getByText('Noun Gender')).toBeInTheDocument()
    expect(screen.getByText(/hindi has two genders/i)).toBeInTheDocument()
  })

  it('renders every section heading', () => {
    render(<TheoryView theory={THEORY} title="Noun Gender" onStartPhrases={() => {}} />)
    expect(screen.getByText('The two genders')).toBeInTheDocument()
    expect(screen.getByText('Endings')).toBeInTheDocument()
    expect(screen.getByText('Final tip')).toBeInTheDocument()
  })

  it('splits body prose into paragraphs at \\n\\n', () => {
    render(<TheoryView theory={THEORY} title="Noun Gender" onStartPhrases={() => {}} />)
    expect(screen.getByText('Every noun is masculine or feminine.')).toBeInTheDocument()
    expect(screen.getByText('There is no neuter.')).toBeInTheDocument()
  })

  it('renders worked examples with hindi + english + breakdown', () => {
    render(<TheoryView theory={THEORY} title="Noun Gender" onStartPhrases={() => {}} />)
    expect(screen.getByText('ladka acchaa hai')).toBeInTheDocument()
    expect(screen.getByText('the boy is good')).toBeInTheDocument()
    expect(screen.getByText('(m) noun + (m) adj')).toBeInTheDocument()
  })

  it('renders tables with caption + headers + rows', () => {
    render(<TheoryView theory={THEORY} title="Noun Gender" onStartPhrases={() => {}} />)
    expect(screen.getByText('Common endings')).toBeInTheDocument()
    expect(screen.getByText('ending')).toBeInTheDocument()
    expect(screen.getByText('-aa')).toBeInTheDocument()
    expect(screen.getByText('masc')).toBeInTheDocument()
  })

  it('renders all three callout tones with their labels', () => {
    render(<TheoryView theory={THEORY} title="Noun Gender" onStartPhrases={() => {}} />)
    expect(screen.getByText('note')).toBeInTheDocument()
    expect(screen.getByText('watch out')).toBeInTheDocument()
    expect(screen.getByText('tip')).toBeInTheDocument()
    expect(screen.getByText(/verb hai is gender-invariant/i)).toBeInTheDocument()
    expect(screen.getByText(/aadmi is the famous exception/i)).toBeInTheDocument()
  })

  it('renders wrap_up when present', () => {
    render(<TheoryView theory={THEORY} title="Noun Gender" onStartPhrases={() => {}} />)
    expect(screen.getByText('Gender is structural.')).toBeInTheDocument()
    expect(screen.getByText('wrap up')).toBeInTheDocument()
  })

  it('CTA fires onStartPhrases when clicked', () => {
    const onStart = vi.fn()
    render(<TheoryView theory={THEORY} title="Noun Gender" onStartPhrases={onStart} />)
    fireEvent.click(screen.getByLabelText(/start phrases/i))
    expect(onStart).toHaveBeenCalledTimes(1)
  })
})
