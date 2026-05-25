import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SpeechBubble } from '@/components/design/SpeechBubble'

describe('SpeechBubble', () => {
  it('renders children as main text', () => {
    render(<SpeechBubble>hello</SpeechBubble>)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('renders caption when provided', () => {
    render(<SpeechBubble caption="missed you">arrey!</SpeechBubble>)
    expect(screen.getByText('arrey!')).toBeInTheDocument()
    expect(screen.getByText('missed you')).toBeInTheDocument()
  })

  it('applies the Chai Galli sticker recipe (2.5px ink border + 4px offset shadow)', () => {
    const { container } = render(<SpeechBubble>hi</SpeechBubble>)
    const bubble = container.firstChild as HTMLElement
    expect(bubble).toHaveStyle({
      border: '2.5px solid #36281e',
      boxShadow: '4px 4px 0 #36281e',
    })
  })

  it('renders a tail SVG', () => {
    const { container } = render(<SpeechBubble tail="bottom-right">hi</SpeechBubble>)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
