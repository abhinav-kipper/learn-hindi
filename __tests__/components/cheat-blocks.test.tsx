import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom'
import { RichText, BlockView } from '@/components/cheatsheet/CheatBlocks'
import { DutchTermProvider } from '@/components/cheatsheet/DutchTerm'

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

describe('tappable Dutch', () => {
  it('marks only the columns listed in nl_cols as tappable', () => {
    const { container } = render(
      <DutchTermProvider>
        <BlockView
          block={{
            kind: 'table',
            headers: ['Dutch', 'English'],
            rows: [['de vader', 'the father']],
            nl_cols: [0],
            en_col: 1,
          }}
        />
      </DutchTermProvider>,
    )
    const tappable = container.querySelectorAll('[role="button"]')
    expect(tappable).toHaveLength(1)
    expect(tappable[0]).toHaveTextContent('de vader')
  })

  it('leaves a table with no nl_cols entirely untappable', () => {
    const { container } = render(
      <DutchTermProvider>
        <BlockView
          block={{ kind: 'table', headers: ['Group', 'Letters'], rows: [['1', 'B, C, D']] }}
        />
      </DutchTermProvider>,
    )
    expect(container.querySelectorAll('[role="button"]')).toHaveLength(0)
  })

  it('splits a Dutch cell into one tappable term per alternative', () => {
    const { container } = render(
      <DutchTermProvider>
        <BlockView
          block={{
            kind: 'table',
            headers: ['Dutch', 'English'],
            rows: [['de opa / de grootvader', 'the grandfather']],
            nl_cols: [0],
            en_col: 1,
          }}
        />
      </DutchTermProvider>,
    )
    const tappable = [...container.querySelectorAll('[role="button"]')].map((n) => n.textContent)
    expect(tappable).toEqual(['de opa', 'de grootvader'])
    // the slash survives as plain text, so the cell still reads correctly
    expect(container.textContent).toContain('de opa / de grootvader')
  })

  it('opens a sheet with the meaning and a speak button when a term is tapped', async () => {
    render(
      <DutchTermProvider>
        <BlockView
          block={{
            kind: 'examples',
            items: [{ nl: 'Goedemorgen!', en: 'Good morning!' }],
          }}
        />
      </DutchTermProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Goedemorgen!' }))
    const sheet = await screen.findByRole('dialog')
    // The meaning we already have is shown straight away, with no lookup needed.
    expect(within(sheet).getByText('Good morning!')).toBeInTheDocument()
    expect(within(sheet).getByLabelText('Hear it: Goedemorgen!')).toBeInTheDocument()
  })

  it('renders plain text outside a provider, so nothing breaks elsewhere', () => {
    const { container } = render(
      <BlockView
        block={{
          kind: 'table',
          headers: ['Dutch', 'English'],
          rows: [['de vader', 'the father']],
          nl_cols: [0],
        }}
      />,
    )
    expect(container.querySelectorAll('[role="button"]')).toHaveLength(0)
    expect(container.textContent).toContain('de vader')
  })
})
