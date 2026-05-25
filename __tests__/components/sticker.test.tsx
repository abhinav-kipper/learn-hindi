import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Sticker } from '@/components/design'

describe('Sticker', () => {
  it('renders children', () => {
    render(<Sticker>hello</Sticker>)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('applies the default ink border + 4px offset shadow recipe', () => {
    render(<Sticker>recipe</Sticker>)
    const el = screen.getByText('recipe')
    expect(el).toHaveStyle({
      border: '2.5px solid #36281e',
      boxShadow: '4px 4px 0 #36281e',
    })
  })

  it('applies dashed border when dashed prop is set', () => {
    render(<Sticker dashed>dashed</Sticker>)
    expect(screen.getByText('dashed')).toHaveStyle({
      border: '2.5px dashed #36281e',
    })
  })

  it('lifts and applies the deeper shadow when selected', () => {
    render(<Sticker selected>sel</Sticker>)
    expect(screen.getByText('sel')).toHaveStyle({
      transform: 'translate(-2px, -2px)',
      boxShadow: '6px 6px 0 #36281e',
    })
  })

  it('fires onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Sticker onClick={onClick}>click</Sticker>)
    fireEvent.click(screen.getByText('click'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('shows press state (translate + shrunk shadow) on mouse down', () => {
    const onClick = vi.fn()
    render(<Sticker onClick={onClick}>press</Sticker>)
    const el = screen.getByText('press')
    fireEvent.mouseDown(el)
    expect(el).toHaveStyle({
      transform: 'translate(2px, 2px)',
      boxShadow: '2px 2px 0 #36281e',
    })
    fireEvent.mouseUp(el)
    expect(el).toHaveStyle({
      transform: 'none',
      boxShadow: '4px 4px 0 #36281e',
    })
  })

  it('does not respond to mouse-down when no onClick is given (static surface)', () => {
    render(<Sticker>static</Sticker>)
    const el = screen.getByText('static')
    fireEvent.mouseDown(el)
    // Shadow stays at default — no press effect for non-interactive stickers
    expect(el).toHaveStyle({ boxShadow: '4px 4px 0 #36281e' })
  })

  it('passes through custom color and radius', () => {
    render(
      <Sticker color="#fde9a8" radius={26}>
        butter
      </Sticker>,
    )
    expect(screen.getByText('butter')).toHaveStyle({
      background: 'rgb(253, 233, 168)',
      borderRadius: '26px',
    })
  })
})
