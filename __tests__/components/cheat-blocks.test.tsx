import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom'
import { RichText, BlockView } from '@/components/cheatsheet/CheatBlocks'

vi.mock('@/lib/speech', () => ({ speak: vi.fn() }))
vi.mock('@/lib/sounds', () => ({ playSound: vi.fn() }))

describe('RichText inline markup', () => {
  it('renders a bold run without leaking asterisks', () => {
    const { container } = render(<RichText text="The verb is **second**." />)
    expect(container.textContent).toBe('The verb is second.')
    expect(container.querySelector('strong')).toHaveTextContent('second')
  })

  it('renders a token chip without leaking backticks', () => {
    const { container } = render(<RichText text="Say `goedemorgen` before noon." />)
    expect(container.textContent).toBe('Say goedemorgen before noon.')
  })

  // Regression: bold nested inside a chip used to print literal asterisks,
  // because the chip branch inserted its contents verbatim.
  it('parses bold nested inside a token chip', () => {
    const { container } = render(<RichText text="Compare `Ik wil een biertje **drinken**.`" />)
    expect(container.textContent).toBe('Compare Ik wil een biertje drinken.')
    expect(container.textContent).not.toContain('*')
    expect(container.querySelector('strong')).toHaveTextContent('drinken')
  })

  it('handles several chips and bold runs in one line', () => {
    const { container } = render(
      <RichText text="`**Ga** je **mee**?` versus `Wil je **meegaan**?` and **plain** bold." />,
    )
    expect(container.textContent).not.toContain('*')
    expect(container.textContent).not.toContain('`')
    expect(container.querySelectorAll('strong')).toHaveLength(4)
  })

  it('splits bullets and numbered steps into lists', () => {
    const { container } = render(<RichText text={'Rules:\n- first\n- second'} />)
    const items = container.querySelectorAll('li')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('first')

    const { container: ol } = render(<RichText text={'Steps:\n1. one\n2. two'} />)
    expect(ol.querySelector('ol')).toBeTruthy()
    expect(ol.querySelectorAll('li')).toHaveLength(2)
  })
})

describe('BlockView', () => {
  it('renders a table with its headers, rows and note', () => {
    render(
      <BlockView
        block={{
          kind: 'table',
          headers: ['Subject', 'Form'],
          rows: [
            ['ik', 'zal'],
            ['wij', 'zullen'],
          ],
          note: 'Only two forms matter.',
        }}
      />,
    )
    expect(screen.getByText('Subject')).toBeInTheDocument()
    expect(screen.getByText('zullen')).toBeInTheDocument()
    expect(screen.getByText('Only two forms matter.')).toBeInTheDocument()
  })

  it('renders a pitfall callout with its warning label', () => {
    const { container } = render(
      <BlockView block={{ kind: 'pitfall', title: 'Never call out Ober!', body: 'Catch their eye.' }} />,
    )
    expect(container.textContent).toContain('Never call out Ober!')
    expect(container.textContent).toContain('Catch their eye.')
  })

  it('gives every example row a speak button labelled with its Dutch text', () => {
    render(
      <BlockView
        block={{
          kind: 'examples',
          items: [{ nl: 'Zullen we koffie drinken?', en: 'Shall we have coffee?', note: 'a proposal' }],
        }}
      />,
    )
    expect(screen.getByLabelText('Hear it: Zullen we koffie drinken?')).toBeInTheDocument()
    expect(screen.getByText('Shall we have coffee?')).toBeInTheDocument()
    expect(screen.getByText('a proposal')).toBeInTheDocument()
  })
})
