import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import type { Lesson } from '@/types/lesson'

// Standard mocks per CLAUDE.md testing conventions.

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
    config: { storagePrefix: 'hindi', name: 'Hindi' },
  }),
}))

const mockIsLessonComplete = vi.fn()
const mockGetLessonCompletedAt = vi.fn()
vi.mock('@/lib/progress', () => ({
  isLessonComplete: (...args: unknown[]) => mockIsLessonComplete(...args),
  getLessonCompletedAt: (...args: unknown[]) => mockGetLessonCompletedAt(...args),
}))

const mockGetLessonPercent = vi.fn()
vi.mock('@/lib/phrase-progress', () => ({
  getLessonPercent: (...args: unknown[]) => mockGetLessonPercent(...args),
}))

vi.mock('@/lib/sounds', () => ({
  playSound: vi.fn(),
}))

const LESSON: Lesson = {
  id: 'auto-negotiation',
  title: 'Auto Negotiation',
  situation: 'You need to haggle with a rickshaw driver to get a fair price.',
  skills: ['numbers', 'haggling', 'directions'],
  phrases: Array(10).fill({
    hindi: 'arey',
    english: 'hey',
    pronunciation: 'a-rey',
    context: '',
  }),
  grammar_notes: [],
  culture_notes: [],
  skill_breakdown: [],
  practice_prompt: 'go',
}

const { LessonStickerCard } = await import('@/components/design')

describe('LessonStickerCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetLessonPercent.mockReturnValue(0)
  })

  describe('incomplete lesson', () => {
    beforeEach(() => {
      mockIsLessonComplete.mockReturnValue(false)
      mockGetLessonCompletedAt.mockReturnValue(null)
    })

    it('renders the lesson title, situation, and skills', async () => {
      render(<LessonStickerCard lesson={LESSON} index={1} />)
      await waitFor(() => {
        expect(screen.getByText('Auto Negotiation')).toBeInTheDocument()
        expect(screen.getByText(/haggle with a rickshaw driver/i)).toBeInTheDocument()
        expect(screen.getByText('numbers')).toBeInTheDocument()
        expect(screen.getByText('haggling')).toBeInTheDocument()
      })
    })

    it('shows the zero-padded chapter number', async () => {
      render(<LessonStickerCard lesson={LESSON} index={1} />)
      await waitFor(() => expect(screen.getByText('#02')).toBeInTheDocument())
    })

    it('does not show a done badge or completion stamp', async () => {
      render(<LessonStickerCard lesson={LESSON} index={1} />)
      await waitFor(() => screen.getByText('Auto Negotiation'))
      expect(screen.queryByText(/done/i)).not.toBeInTheDocument()
    })

    it('navigates to /lessons/{id} when clicked', async () => {
      render(<LessonStickerCard lesson={LESSON} index={1} />)
      await waitFor(() => screen.getByText('Auto Negotiation'))
      fireEvent.click(screen.getByText('Auto Negotiation'))
      expect(mockPush).toHaveBeenCalledWith('/lessons/auto-negotiation')
    })

    it('shows an inline progress bar when partially complete', async () => {
      mockGetLessonPercent.mockReturnValue(30)
      render(<LessonStickerCard lesson={LESSON} index={1} />)
      await waitFor(() => expect(screen.getByText('3/10')).toBeInTheDocument())
    })
  })

  describe('completed lesson', () => {
    beforeEach(() => {
      mockIsLessonComplete.mockReturnValue(true)
      mockGetLessonCompletedAt.mockReturnValue('2026-05-23')
      mockGetLessonPercent.mockReturnValue(100)
    })

    it('shows a green done badge with human-readable days-ago label', async () => {
      render(<LessonStickerCard lesson={LESSON} index={1} />)
      await waitFor(() => {
        // Matches: "✓ done today" | "✓ yesterday" | "✓ N days ago" | "✓ last week" | "✓ N wks ago" | "✓ done"
        expect(screen.getByText(/✓ (done( today)?|yesterday|\d+ days ago|last week|\d+ wks ago)/i)).toBeInTheDocument()
      })
    })

    it('does not show the progress bar when complete', async () => {
      render(<LessonStickerCard lesson={LESSON} index={1} />)
      await waitFor(() => screen.getByText(/✓ (done( today)?|yesterday|\d+ days ago|last week|\d+ wks ago)/i))
      expect(screen.queryByText('10/10')).not.toBeInTheDocument()
    })

    it('still navigates on click', async () => {
      render(<LessonStickerCard lesson={LESSON} index={1} />)
      await waitFor(() => screen.getByText('Auto Negotiation'))
      fireEvent.click(screen.getByText('Auto Negotiation'))
      expect(mockPush).toHaveBeenCalledWith('/lessons/auto-negotiation')
    })
  })

  describe('locked', () => {
    beforeEach(() => {
      mockIsLessonComplete.mockReturnValue(false)
      mockGetLessonCompletedAt.mockReturnValue(null)
    })

    it('renders the locked card with disabled pointer events', async () => {
      const { container } = render(<LessonStickerCard lesson={LESSON} index={1} locked />)
      await waitFor(() => screen.getByText('Auto Negotiation'))
      const outer = container.firstChild as HTMLElement
      expect(outer).toHaveStyle({ opacity: '0.5', pointerEvents: 'none' })
    })

    it('does not navigate when a locked card is clicked', async () => {
      render(<LessonStickerCard lesson={LESSON} index={1} locked />)
      await waitFor(() => screen.getByText('Auto Negotiation'))
      fireEvent.click(screen.getByText('Auto Negotiation'))
      expect(mockPush).not.toHaveBeenCalled()
    })
  })
})
