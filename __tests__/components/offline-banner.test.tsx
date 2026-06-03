import { vi, describe, it, expect, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { OfflineBanner } from '@/components/offline-banner'

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, { get: () => (props: React.ComponentProps<'div'>) => <div {...props} /> }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

function setOnLine(value: boolean) {
  Object.defineProperty(navigator, 'onLine', { configurable: true, value })
}

afterEach(() => {
  setOnLine(true)
  vi.useRealTimers()
})

describe('OfflineBanner', () => {
  it('renders nothing while online', () => {
    setOnLine(true)
    render(<OfflineBanner />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows the offline message when an offline event fires', () => {
    setOnLine(true)
    render(<OfflineBanner />)
    act(() => {
      setOnLine(false)
      window.dispatchEvent(new Event('offline'))
    })
    expect(screen.getByText(/you're offline/i)).toBeInTheDocument()
  })

  it('mounts already showing when the device starts offline', () => {
    setOnLine(false)
    render(<OfflineBanner />)
    expect(screen.getByText(/you're offline/i)).toBeInTheDocument()
  })

  it('shows a "back online" confirmation after reconnecting, then hides', () => {
    vi.useFakeTimers()
    setOnLine(false)
    render(<OfflineBanner />)
    expect(screen.getByText(/you're offline/i)).toBeInTheDocument()

    act(() => {
      setOnLine(true)
      window.dispatchEvent(new Event('online'))
    })
    expect(screen.getByText(/back online/i)).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2600)
    })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
