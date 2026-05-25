import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ChainaProvider, useChaina } from '@/components/design/MomentStage'

function Trigger({ momentKey }: { momentKey: string }) {
  const { play } = useChaina()
  return <button onClick={() => play(momentKey)}>fire</button>
}

describe('MomentStage', () => {
  it('renders nothing when no moment is active', () => {
    render(
      <ChainaProvider>
        <div>app</div>
      </ChainaProvider>
    )
    expect(screen.queryByTestId('chaina-bubble')).not.toBeInTheDocument()
  })

  it('renders the bubble after play() is called', async () => {
    vi.useFakeTimers()
    render(
      <ChainaProvider>
        <Trigger momentKey="tap" />
      </ChainaProvider>
    )
    await act(async () => {
      screen.getByText('fire').click()
    })
    expect(screen.getByTestId('chaina-bubble')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('clears the moment after its duration', async () => {
    vi.useFakeTimers()
    render(
      <ChainaProvider>
        <Trigger momentKey="tap" />
      </ChainaProvider>
    )
    await act(async () => {
      screen.getByText('fire').click()
    })
    expect(screen.getByTestId('chaina-bubble')).toBeInTheDocument()
    // tap: enterMs 700 + holdMs 1300 + exitMs 300 = 2300ms
    await act(async () => {
      vi.advanceTimersByTime(2400)
    })
    expect(screen.queryByTestId('chaina-bubble')).not.toBeInTheDocument()
    vi.useRealTimers()
  })
})
