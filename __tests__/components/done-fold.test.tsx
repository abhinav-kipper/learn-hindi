import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { DoneFold } from '@/components/design/DoneFold'

vi.mock('@/lib/sounds', () => ({ playSound: vi.fn() }))

beforeEach(() => localStorage.clear())

describe('DoneFold', () => {
  it('renders nothing when count is 0', () => {
    const { container } = render(
      <DoneFold count={0}>
        <div>hidden child</div>
      </DoneFold>,
    )
    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByText('hidden child')).toBeNull()
  })

  it('shows a "✓ N noun" toggle and hides children by default', () => {
    render(
      <DoneFold count={3} noun="read">
        <div>folded child</div>
      </DoneFold>,
    )
    expect(screen.getByText('✓ 3 read')).toBeInTheDocument()
    expect(screen.queryByText('folded child')).toBeNull()
  })

  it('reveals and re-hides children on toggle', () => {
    render(
      <DoneFold count={2}>
        <div>folded child</div>
      </DoneFold>,
    )
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    expect(screen.getByText('folded child')).toBeInTheDocument()
    fireEvent.click(btn)
    expect(screen.queryByText('folded child')).toBeNull()
  })

  it('persists open state to localStorage and restores it', () => {
    const { unmount } = render(
      <DoneFold count={1} storageKey="test-fold">
        <div>child</div>
      </DoneFold>,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(localStorage.getItem('test-fold')).toBe('1')
    unmount()

    render(
      <DoneFold count={1} storageKey="test-fold">
        <div>child</div>
      </DoneFold>,
    )
    // restored open from storage
    expect(screen.getByText('child')).toBeInTheDocument()
  })
})
