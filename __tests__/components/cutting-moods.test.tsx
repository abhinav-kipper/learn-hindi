import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Cutting } from '@/components/design/Cutting'

describe('Cutting moods', () => {
  it('renders idle by default', () => {
    const { container } = render(<Cutting />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders all 7 moods without throwing', () => {
    const moods = ['idle', 'happy', 'wave', 'sympathy', 'wink', 'excited', 'sleepy'] as const
    for (const mood of moods) {
      const { container } = render(<Cutting mood={mood} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    }
  })

  it('renders sparkle paths in excited eyes', () => {
    const { container } = render(<Cutting mood="excited" />)
    expect(container.innerHTML).toContain('M 0 -4 L 1 -1 L 4 0')
  })

  it('renders a wink path on the right eye when mood=wink', () => {
    const { container } = render(<Cutting mood="wink" />)
    expect(container.innerHTML).toContain('M 68 84 Q 74 78, 80 84')
  })

  it('renders sympathetic downturned mouth when mood=sympathy', () => {
    const { container } = render(<Cutting mood="sympathy" />)
    expect(container.innerHTML).toContain('M 50 108 Q 60 100, 70 108')
  })

  it('renders sleepy half-lidded eyes when mood=sleepy', () => {
    const { container } = render(<Cutting mood="sleepy" />)
    expect(container.innerHTML).toContain('M 40 82 Q 46 86, 52 82')
  })

  it('renders raised brows when mood=wave', () => {
    const { container } = render(<Cutting mood="wave" />)
    expect(container.innerHTML).toContain('M 40 72 Q 46 68, 52 72')
  })
})
