import { describe, it, expect } from 'vitest'
import { ChatReplySchema } from '@/lib/chat-schema'

describe('ChatReplySchema', () => {
  it('accepts a minimal valid reply', () => {
    const result = ChatReplySchema.safeParse({
      hindi: 'arey kya haal hai?',
      english: 'How are you?',
    })
    expect(result.success).toBe(true)
  })

  it('accepts a reply with a correction', () => {
    const result = ChatReplySchema.safeParse({
      hindi: 'haan bilkul',
      english: 'Yeah, totally',
      correction: {
        original: 'main jaata hain',
        correct: 'main jaata hoon',
        reason: 'First person uses hoon',
      },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.correction?.original).toBe('main jaata hain')
    }
  })

  it('rejects empty hindi field', () => {
    const result = ChatReplySchema.safeParse({ hindi: '', english: 'Hi' })
    expect(result.success).toBe(false)
  })

  it('rejects empty english field', () => {
    const result = ChatReplySchema.safeParse({ hindi: 'arey', english: '' })
    expect(result.success).toBe(false)
  })

  it('rejects a correction missing required fields', () => {
    const result = ChatReplySchema.safeParse({
      hindi: 'arey',
      english: 'Hi',
      correction: { original: 'X' }, // missing correct + reason
    })
    expect(result.success).toBe(false)
  })

  it('treats correction as optional — omitting it is fine', () => {
    const result = ChatReplySchema.safeParse({
      hindi: 'arey',
      english: 'Hi',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.correction).toBeUndefined()
    }
  })
})

// Devanagari detection — mirror the regex from the API route so we can
// verify the script-detection logic without booting a server.
const NON_LATIN_RE = /[ऀ-ॿঀ-৿਀-૿઀-૿଀-୿஀-௿ఀ-౿ಀ-೿ഀ-ൿ؀-ۿ֐-׿]/

describe('NON_LATIN_RE script detector', () => {
  it('matches Devanagari', () => {
    expect(NON_LATIN_RE.test('अरे यार')).toBe(true)
  })

  it('matches Urdu/Arabic', () => {
    expect(NON_LATIN_RE.test('ارے یار')).toBe(true)
  })

  it('does not match pure romanized text', () => {
    expect(NON_LATIN_RE.test('arey yaar kya haal hai')).toBe(false)
  })

  it('catches a single Devanagari character buried in romanized text', () => {
    expect(NON_LATIN_RE.test('arey यार kya haal')).toBe(true)
  })

  it('allows accented Latin and emoji', () => {
    expect(NON_LATIN_RE.test('café résumé 😄')).toBe(false)
  })
})
