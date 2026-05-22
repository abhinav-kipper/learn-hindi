import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import type { Lesson } from '@/types/lesson'

// Framer-motion: strip animation props so they don't leak to the DOM
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      layout: _l,
      initial: _i,
      animate: _a,
      transition: _t,
      whileTap: _wt,
      ...props
    }: Record<string, unknown> & { children?: React.ReactNode }) => (
      <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    onClick,
    ...props
  }: { href: string; children: React.ReactNode; onClick?: React.MouseEventHandler } & Record<string, unknown>) => (
    <a href={href} onClick={onClick} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
      {children}
    </a>
  ),
}))

vi.mock('@/lib/language-context', () => ({
  useLanguage: () => ({
    language: 'hindi',
    config: { storagePrefix: 'hindi', name: 'Hindi' },
  }),
}))

const mockIsLessonComplete = vi.fn()
vi.mock('@/lib/progress', () => ({
  isLessonComplete: (...args: unknown[]) => mockIsLessonComplete(...args),
}))

const LESSON: Lesson = {
  id: 'test-01',
  title: 'Test Lesson',
  situation: 'A unique test situation description',
  skills: ['skill one', 'skill two'],
  phrases: [],
  grammar_notes: [],
  culture_notes: [],
  skill_breakdown: [],
  practice_prompt: 'Practice now',
}

// Lazy-import so mocks are applied before the module is loaded
const { LessonCard } = await import('@/components/lesson-card')

describe('LessonCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('incomplete lesson', () => {
    beforeEach(() => mockIsLessonComplete.mockReturnValue(false))

    it('renders the full card with title, situation, and skills', async () => {
      render(<LessonCard lesson={LESSON} index={0} />)
      await waitFor(() => {
        expect(screen.getByText('Test Lesson')).toBeInTheDocument()
        expect(screen.getByText('A unique test situation description')).toBeInTheDocument()
        expect(screen.getByText('skill one')).toBeInTheDocument()
      })
    })

    it('navigates to the lesson page when the card is clicked', async () => {
      render(<LessonCard lesson={LESSON} index={0} />)
      await waitFor(() => screen.getByText('Test Lesson'))
      fireEvent.click(screen.getByText('Test Lesson'))
      expect(mockPush).toHaveBeenCalledWith('/lessons/test-01')
    })

    it('shows Practice link but not Review', async () => {
      render(<LessonCard lesson={LESSON} index={0} />)
      await waitFor(() => screen.getByText(/Practice/))
      expect(screen.queryByText('Review')).not.toBeInTheDocument()
    })
  })

  describe('completed lesson', () => {
    beforeEach(() => mockIsLessonComplete.mockReturnValue(true))

    it('renders as a collapsed pill (situation hidden)', async () => {
      render(<LessonCard lesson={LESSON} index={0} />)
      await waitFor(() => {
        expect(screen.queryByText('A unique test situation description')).not.toBeInTheDocument()
        // Title still visible in the pill
        expect(screen.getByText('Test Lesson')).toBeInTheDocument()
      })
    })

    it('expands to full card when the collapsed pill is clicked', async () => {
      render(<LessonCard lesson={LESSON} index={0} />)
      const pill = await screen.findByRole('button')
      fireEvent.click(pill)
      expect(await screen.findByText('A unique test situation description')).toBeInTheDocument()
    })

    it('shows Review link in expanded state', async () => {
      render(<LessonCard lesson={LESSON} index={0} />)
      const pill = await screen.findByRole('button')
      fireEvent.click(pill)
      expect(await screen.findByText('Review')).toBeInTheDocument()
    })

    it('collapses back to pill when the expanded card body is clicked', async () => {
      render(<LessonCard lesson={LESSON} index={0} />)

      // Expand
      const pill = await screen.findByRole('button')
      fireEvent.click(pill)
      const situation = await screen.findByText('A unique test situation description')

      // Collapse by clicking on the card body
      fireEvent.click(situation)
      await waitFor(() => {
        expect(screen.queryByText('A unique test situation description')).not.toBeInTheDocument()
      })
    })

    it('does not navigate when the expanded card is clicked (just collapses)', async () => {
      render(<LessonCard lesson={LESSON} index={0} />)
      const pill = await screen.findByRole('button')
      fireEvent.click(pill)
      await screen.findByText('A unique test situation description')
      fireEvent.click(screen.getByText('Test Lesson'))
      expect(mockPush).not.toHaveBeenCalled()
    })
  })
})
