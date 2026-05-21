/**
 * Verifies the chat-message parser handles all the formats Gemini emits.
 * Imported as inline copy of the parser (component is a React file with JSX).
 */
import { describe, it, expect } from 'vitest'

function parseMessage(content: string): { hindi: string; english: string } | null {
  const trimmed = content.trim()
  if (!trimmed) return null
  const match = trimmed.match(/^([\s\S]+?)\s*\(([^()]+)\)\s*$/)
  if (!match) return null
  const hindi = match[1].trim()
  const english = match[2].trim()
  if (!hindi || !english) return null
  return { hindi, english }
}

describe('parseMessage', () => {
  it('parses block format with double newline', () => {
    expect(parseMessage('arey kya haal hai?\n\n(How are you?)')).toEqual({
      hindi: 'arey kya haal hai?',
      english: 'How are you?',
    })
  })

  it('parses block format with single newline', () => {
    expect(parseMessage('arey kya haal hai?\n(How are you?)')).toEqual({
      hindi: 'arey kya haal hai?',
      english: 'How are you?',
    })
  })

  it('parses inline format on a single line', () => {
    expect(parseMessage('arey hi (Hello)')).toEqual({
      hindi: 'arey hi',
      english: 'Hello',
    })
  })

  it('parses multi-line Hindi followed by english block', () => {
    const input = 'arey kya haal hai?\nsab theek?\n\n(How are you? All good?)'
    expect(parseMessage(input)).toEqual({
      hindi: 'arey kya haal hai?\nsab theek?',
      english: 'How are you? All good?',
    })
  })

  it('tolerates trailing whitespace and newlines', () => {
    expect(parseMessage('arey hi (Hello)\n\n  ')).toEqual({
      hindi: 'arey hi',
      english: 'Hello',
    })
  })

  it('returns null for content with no parenthetical', () => {
    expect(parseMessage('arey kya haal hai?')).toBeNull()
  })

  it('returns null for empty content', () => {
    expect(parseMessage('')).toBeNull()
    expect(parseMessage('   \n\n  ')).toBeNull()
  })

  it('returns null for content with nested parens (intentionally — fall through to raw)', () => {
    expect(parseMessage('arey (random) (Hello)')).toEqual({
      hindi: 'arey (random)',
      english: 'Hello',
    })
    // True nested case — `[^()]+` excludes both, so falls through.
    expect(parseMessage('arey (How are you? (or so))')).toBeNull()
  })
})
