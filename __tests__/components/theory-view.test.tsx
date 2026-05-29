import { vi, describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TheoryView } from '@/components/lesson/TheoryView'
import type { Theory } from '@/types/lesson'

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, { get: () => (props: React.ComponentProps<'div'>) => <div {...props} /> }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
vi.mock('@/lib/sounds', () => ({ playSound: vi.fn() }))

const THEORY: Theory = {
  intro: 'Hindi has two genders.',
  sections: [
    {
      heading: 'The two genders',
      body: 'Every noun is masculine or feminine.',
      cutting_intro: 'Hi! Let me explain.',
      examples: [{ hindi: 'ladka acchaa hai', english: 'the boy is good' }],
      quick_check: {
        question: 'How many genders?',
        options: ['Two', 'Three'],
        correct_index: 0,
        explanation: 'Yep — masculine and feminine.',
      },
    },
    {
      heading: 'Endings',
      body: 'Most -aa words are masculine.',
      table: { columns: ['ending', 'gender'], rows: [['-aa', 'masc'], ['-i', 'fem']] },
      callout: { tone: 'warning', body: 'aadmi is the exception' },
      quick_check: {
        question: 'Pattern is which?',
        options: ['Strict rule', 'Guide w/ exceptions'],
        correct_index: 1,
      },
    },
  ],
  wrap_up: 'Gender is structural.',
}

describe('TheoryView paged deck', () => {
  it('starts on intro page (page 1 of N)', () => {
    render(<TheoryView theory={THEORY} title="Noun Gender" onStartPhrases={() => {}} />)
    expect(screen.getByText('Noun Gender')).toBeInTheDocument()
    expect(screen.getByText(/welcome/i)).toBeInTheDocument()
    // Intro + 2 sections + wrap-up = 4 total pages
    expect(screen.getByText('1 / 4')).toBeInTheDocument()
  })

  it('advances to first section page on next', () => {
    render(<TheoryView theory={THEORY} title="Noun Gender" onStartPhrases={() => {}} />)
    fireEvent.click(screen.getByLabelText('Next page'))
    expect(screen.getByText('The two genders')).toBeInTheDocument()
    expect(screen.getByText(/hi! let me explain/i)).toBeInTheDocument()
    expect(screen.getByText('2 / 4')).toBeInTheDocument()
  })

  it('disables next button while quick-check is unanswered', () => {
    render(<TheoryView theory={THEORY} title="Noun Gender" onStartPhrases={() => {}} />)
    fireEvent.click(screen.getByLabelText('Next page'))
    const nextBtn = screen.getByLabelText('Next page')
    expect(nextBtn).toBeDisabled()
  })

  it('answering quick-check correctly unlocks next and shows explanation', () => {
    render(<TheoryView theory={THEORY} title="Noun Gender" onStartPhrases={() => {}} />)
    fireEvent.click(screen.getByLabelText('Next page'))
    fireEvent.click(screen.getByLabelText(/option 1.*two/i))
    expect(screen.getByLabelText('Next page')).not.toBeDisabled()
    expect(screen.getByText(/masculine and feminine/i)).toBeInTheDocument()
  })

  it('wrong answer leaves next disabled but allows retry', () => {
    render(<TheoryView theory={THEORY} title="Noun Gender" onStartPhrases={() => {}} />)
    fireEvent.click(screen.getByLabelText('Next page'))
    fireEvent.click(screen.getByLabelText(/option 2.*three/i))
    expect(screen.getByLabelText('Next page')).toBeDisabled()
    // Correct option still tappable
    fireEvent.click(screen.getByLabelText(/option 1.*two/i))
    expect(screen.getByLabelText('Next page')).not.toBeDisabled()
  })

  it('walks through to wrap-up page', () => {
    render(<TheoryView theory={THEORY} title="Noun Gender" onStartPhrases={() => {}} />)
    // page 1 → page 2 (section 1)
    fireEvent.click(screen.getByLabelText('Next page'))
    // pass section 1 quick check
    fireEvent.click(screen.getByLabelText(/option 1.*two/i))
    // page 2 → page 3 (section 2)
    fireEvent.click(screen.getByLabelText('Next page'))
    expect(screen.getByText('Endings')).toBeInTheDocument()
    // pass section 2 quick check (correct = option 2 — guide w/ exceptions)
    fireEvent.click(screen.getByLabelText(/option 2.*guide/i))
    // page 3 → page 4 (wrap-up)
    fireEvent.click(screen.getByLabelText('Next page'))
    expect(screen.getByText('Gender is structural.')).toBeInTheDocument()
    expect(screen.getByText(/you made it through/i)).toBeInTheDocument()
  })

  it('wrap-up CTA fires onStartPhrases', () => {
    const onStart = vi.fn()
    render(<TheoryView theory={THEORY} title="Noun Gender" onStartPhrases={onStart} />)
    fireEvent.click(screen.getByLabelText('Next page'))
    fireEvent.click(screen.getByLabelText(/option 1.*two/i))
    fireEvent.click(screen.getByLabelText('Next page'))
    fireEvent.click(screen.getByLabelText(/option 2.*guide/i))
    fireEvent.click(screen.getByLabelText('Next page'))
    fireEvent.click(screen.getByLabelText(/start phrases/i))
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('prev button goes back to previous page', () => {
    render(<TheoryView theory={THEORY} title="Noun Gender" onStartPhrases={() => {}} />)
    fireEvent.click(screen.getByLabelText('Next page'))
    fireEvent.click(screen.getByLabelText('Previous page'))
    expect(screen.getByText('Noun Gender')).toBeInTheDocument()
    expect(screen.getByText('1 / 4')).toBeInTheDocument()
  })

  it('prev button is disabled on intro page', () => {
    render(<TheoryView theory={THEORY} title="Noun Gender" onStartPhrases={() => {}} />)
    expect(screen.getByLabelText('Previous page')).toBeDisabled()
  })

  it('renders section table + callout when present', () => {
    render(<TheoryView theory={THEORY} title="Noun Gender" onStartPhrases={() => {}} />)
    fireEvent.click(screen.getByLabelText('Next page'))
    fireEvent.click(screen.getByLabelText(/option 1.*two/i))
    fireEvent.click(screen.getByLabelText('Next page'))
    expect(screen.getByText('ending')).toBeInTheDocument()
    expect(screen.getByText('-aa')).toBeInTheDocument()
    expect(screen.getByText(/aadmi is the exception/i)).toBeInTheDocument()
    expect(screen.getByText('watch out')).toBeInTheDocument()
  })
})
