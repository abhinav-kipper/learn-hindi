import { describe, it, expect } from 'vitest'
import { tokenize, words, getGloss, glossForWordIndex } from './gloss'

describe('lib/gloss tokenizer', () => {
  it('splits words from punctuation, preserving everything in order', () => {
    const pieces = tokenize('arey, kya haal hai?')
    expect(pieces.map((p) => p.text).join('')).toBe('arey, kya haal hai?')
    expect(pieces.filter((p) => p.word).map((p) => p.text)).toEqual(['arey', 'kya', 'haal', 'hai'])
  })

  it('assigns sequential word indices to word pieces only', () => {
    const pieces = tokenize('haan, theek hai')
    const wordPieces = pieces.filter((p) => p.word)
    expect(wordPieces.map((p) => p.wordIndex)).toEqual([0, 1, 2])
    expect(pieces.filter((p) => !p.word).every((p) => p.wordIndex === -1)).toBe(true)
  })

  it('keeps internal apostrophes/hyphens as one word', () => {
    expect(words("how's jaane-pehchaane")).toEqual(["how's", 'jaane-pehchaane'])
  })

  it('words() lower-cases', () => {
    expect(words('Rahul Hai')).toEqual(['rahul', 'hai'])
  })

  it('getGloss returns null for an unknown phrase', () => {
    expect(getGloss('nonexistent phrase', 'hindi')).toBeNull()
  })

  it('glossForWordIndex is null when out of range or no gloss', () => {
    expect(glossForWordIndex('whatever', 'hindi', 0)).toBeNull()
    expect(glossForWordIndex('whatever', 'hindi', -1)).toBeNull()
  })
})
