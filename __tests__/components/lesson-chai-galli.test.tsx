import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import type { Lesson } from '@/types/lesson'

const stripMotionProps = <T extends React.HTMLAttributes<HTMLElement>>({
  children,
  layout: _l,
  initial: _i,
  animate: _a,
  exit: _e,
  transition: _t,
  whileTap: _wt,
  ...props
}: Record<string, unknown> & { children?: React.ReactNode }) =>
  ({ children, ...props }) as T & { children?: React.ReactNode }

vi.mock('framer-motion', () => ({
  motion: {
    div: (p: Record<string, unknown> & { children?: React.ReactNode }) => (
      <div {...stripMotionProps<React.HTMLAttributes<HTMLDivElement>>(p)}>{p.children}</div>
    ),
    button: (p: Record<string, unknown> & { children?: React.ReactNode }) => (
      <button {...stripMotionProps<React.ButtonHTMLAttributes<HTMLButtonElement>>(p)}>{p.children}</button>
    ),
    span: (p: Record<string, unknown> & { children?: React.ReactNode }) => (
      <span {...stripMotionProps<React.HTMLAttributes<HTMLSpanElement>>(p)}>{p.children}</span>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/lib/language-context', () => ({
  useLanguage: () => ({
    language: 'hindi',
    config: { storagePrefix: 'hindi', name: 'Hindi', ttsLocale: 'hi' },
  }),
}))

const mockIsFavorite = vi.fn()
const mockToggleFavorite = vi.fn()
vi.mock('@/lib/favorites', () => ({
  isFavorite: (...a: unknown[]) => mockIsFavorite(...a),
  toggleFavorite: (...a: unknown[]) => mockToggleFavorite(...a),
}))

const mockComputeLessonResume = vi.fn()
const mockMarkPhraseViewed = vi.fn()
vi.mock('@/lib/phrase-progress', () => ({
  markPhraseViewed: (...a: unknown[]) => mockMarkPhraseViewed(...a),
  computeLessonResume: (...a: unknown[]) => mockComputeLessonResume(...a),
}))

const mockSetLastActiveLesson = vi.fn()
vi.mock('@/lib/last-active-lesson', () => ({
  setLastActiveLesson: (...a: unknown[]) => mockSetLastActiveLesson(...a),
}))

const mockIsLessonComplete = vi.fn()
const mockMarkLessonComplete = vi.fn()
const mockUpdateStreak = vi.fn()
vi.mock('@/lib/progress', () => ({
  isLessonComplete: (...a: unknown[]) => mockIsLessonComplete(...a),
  markLessonComplete: (...a: unknown[]) => mockMarkLessonComplete(...a),
  updateStreak: (...a: unknown[]) => mockUpdateStreak(...a),
}))

vi.mock('@/lib/sounds', () => ({
  playSound: vi.fn(),
}))

vi.mock('@/lib/speech', () => ({
  speak: vi.fn(),
  stopSpeaking: vi.fn(),
  isSpeaking: vi.fn(() => false),
}))

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))

vi.mock('@/components/design', async () => {
  const actual = await vi.importActual<typeof import('@/components/design')>('@/components/design')
  return {
    ...actual,
    useChaina: () => ({ play: vi.fn(), stop: vi.fn() }),
    canFire: () => false,
    markFired: () => {},
  }
})

const LESSON: Lesson = {
  id: 'auto-negotiation',
  title: 'Auto Negotiation',
  situation: 'You need to haggle',
  skills: ['numbers', 'haggling'],
  phrases: [
    { hindi: 'kitne paise?', english: 'how much?', pronunciation: 'KIT-ne PAI-se', context: 'opening' },
    { hindi: 'bahut zyada', english: 'too much', pronunciation: 'ba-HUT zya-DA', context: 'pushback' },
    { hindi: 'theek hai chalo', english: 'okay let’s go', pronunciation: 'THEEK hai cha-lo', context: 'close' },
  ],
  grammar_notes: [],
  culture_notes: [],
  skill_breakdown: [],
  practice_prompt: 'go',
}

const { LessonChaiGalli } = await import('@/components/design')

describe('LessonChaiGalli', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockComputeLessonResume.mockReturnValue({ sectionIndex: 0, phraseIndex: 0 })
    mockIsLessonComplete.mockReturnValue(false)
    mockIsFavorite.mockReturnValue(false)
  })

  it('renders the header tag, title, and skill chips', async () => {
    render(<LessonChaiGalli lesson={LESSON} chapterNumber={2} />)
    await waitFor(() => {
      expect(screen.getByText(/chapter 02/i)).toBeInTheDocument()
      expect(screen.getByText('Auto Negotiation')).toBeInTheDocument()
      expect(screen.getByText('numbers')).toBeInTheDocument()
    })
  })

  it('starts at the resumed phrase and pre-reveals it', async () => {
    mockComputeLessonResume.mockReturnValue({ sectionIndex: 1, phraseIndex: 1 })
    render(<LessonChaiGalli lesson={LESSON} />)
    await waitFor(() => {
      expect(screen.getByText('bahut zyada')).toBeInTheDocument()
      expect(screen.getByText('too much')).toBeInTheDocument()
      expect(screen.getByText('phrase 2 of 3')).toBeInTheDocument()
    })
  })

  it('marks the initial phrase viewed and sets last-active lesson on mount', async () => {
    render(<LessonChaiGalli lesson={LESSON} />)
    await waitFor(() => screen.getByText('kitne paise?'))
    expect(mockMarkPhraseViewed).toHaveBeenCalledWith('auto-negotiation', 0, 'hindi')
    expect(mockSetLastActiveLesson).toHaveBeenCalledWith('auto-negotiation', 'hindi')
  })

  it('reveals the english on tap-to-reveal', async () => {
    render(<LessonChaiGalli lesson={LESSON} />)
    // Phrase 0 is auto-revealed by resume default. Advance to phrase 1 (unrevealed).
    await waitFor(() => screen.getByText('phrase 1 of 3'))
    fireEvent.click(screen.getByText('next →'))
    await waitFor(() => screen.getByText('tap to reveal'))
    fireEvent.click(screen.getByText('tap to reveal'))
    await waitFor(() => expect(screen.getByText('too much')).toBeInTheDocument())
  })

  it('disables prev on the first phrase and next on the last', async () => {
    render(<LessonChaiGalli lesson={LESSON} />)
    await waitFor(() => screen.getByText('phrase 1 of 3'))
    expect(screen.getByText('← prev').closest('button')).toBeDisabled()
    fireEvent.click(screen.getByText('next →'))
    fireEvent.click(screen.getByText('next →'))
    await waitFor(() => screen.getByText('phrase 3 of 3'))
    expect(screen.getByText('next →').closest('button')).toBeDisabled()
  })

  it('toggles favorite on the star button', async () => {
    mockToggleFavorite.mockReturnValue(true)
    render(<LessonChaiGalli lesson={LESSON} />)
    await waitFor(() => screen.getByText('kitne paise?'))
    fireEvent.click(screen.getByLabelText('Favorite phrase'))
    expect(mockToggleFavorite).toHaveBeenCalled()
  })

  it('mark-complete transitions into the celebration view', async () => {
    render(<LessonChaiGalli lesson={LESSON} />)
    // Mark-complete is gated on every phrase being revealed. Phrase 0 starts pre-revealed
    // (initial state from resume); reveal phrases 1 and 2 as we navigate through them.
    await waitFor(() => screen.getByText('next →'))
    fireEvent.click(screen.getByText('next →'))
    await waitFor(() => screen.getByText(/tap to reveal/i))
    fireEvent.click(screen.getByText(/tap to reveal/i))
    fireEvent.click(screen.getByText('next →'))
    await waitFor(() => screen.getByText(/tap to reveal/i))
    fireEvent.click(screen.getByText(/tap to reveal/i))
    const completeButton = await screen.findByRole('button', { name: /mark chapter complete/i })
    await act(async () => {
      fireEvent.click(completeButton)
    })
    expect(mockMarkLessonComplete).toHaveBeenCalledWith('auto-negotiation', 'hindi')
    expect(mockUpdateStreak).toHaveBeenCalledWith('hindi')
    await waitFor(() => {
      expect(screen.getByText(/shabash, dost/i)).toBeInTheDocument()
      expect(screen.getByText(/practice now/i)).toBeInTheDocument()
    })
  })

  it('hides mark-complete and shows a hint when phrases are unrevealed', async () => {
    render(<LessonChaiGalli lesson={LESSON} />)
    await waitFor(() => screen.getByText('next →'))
    fireEvent.click(screen.getByText('next →'))
    fireEvent.click(screen.getByText('next →'))
    expect(screen.queryByRole('button', { name: /mark chapter complete/i })).not.toBeInTheDocument()
    expect(screen.getByText(/reveal every phrase/i)).toBeInTheDocument()
  })

  it('opens a chooser (review phrases / practice) when already done, and entering phrases shows the complete pill', async () => {
    mockIsLessonComplete.mockReturnValue(true)
    render(<LessonChaiGalli lesson={LESSON} />)
    // a finished lesson opens to the chooser, not straight into the phrases
    await waitFor(() => screen.getByText(/what next/i))
    expect(screen.getByText(/review the phrases/i)).toBeInTheDocument()
    expect(screen.getByText(/practice with the tutor/i)).toBeInTheDocument()
    // choosing phrases shows the completed pill, never the green mark-complete CTA
    fireEvent.click(screen.getByText(/review the phrases/i))
    await waitFor(() => screen.getByText(/chapter complete/i))
    expect(screen.queryByText(/^✓ mark chapter complete$/i)).not.toBeInTheDocument()
  })

  it('back button routes to /', async () => {
    render(<LessonChaiGalli lesson={LESSON} />)
    await waitFor(() => screen.getByLabelText('Back'))
    fireEvent.click(screen.getByLabelText('Back'))
    expect(mockPush).toHaveBeenCalledWith('/')
  })
})
