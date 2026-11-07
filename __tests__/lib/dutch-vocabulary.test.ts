import { describe, it, expect } from 'vitest'
import { getDutchAllCategories, getDutchTotalWordCount } from '@/lib/dutch/vocabulary'
import { getAllCategories } from '@/lib/vocabulary'

const categories = getDutchAllCategories()
const words = categories.flatMap((c) => c.words)

describe('Dutch vocabulary deck', () => {
  // The deck was grown past Hindi parity for the A2 exam: the six original
  // categories plus six drawn from the situations the exam keeps returning to
  // (doctor, work and money, housing, getting around, shopping, officialdom).
  it('carries the full A2 deck and keeps every original category', () => {
    expect(getDutchTotalWordCount()).toBe(208)
    expect(categories.length).toBeGreaterThanOrEqual(getAllCategories().length)
    expect(categories).toHaveLength(12)
  })

  it('still contains the six original categories, in their original order', () => {
    // Progress is keyed by category id plus headword, so reordering or
    // renaming an existing category would orphan the user's learned state.
    expect(categories.slice(0, 6).map((c) => c.id)).toEqual([
      'dutch-greetings',
      'dutch-polite',
      'dutch-everyday',
      'dutch-time',
      'dutch-people',
      'dutch-verbs',
    ])
  })

  it('gives every category the fields the grid renders', () => {
    for (const c of categories) {
      expect(c.id, 'category id').toMatch(/^dutch-/)
      expect(c.title).toBeTruthy()
      expect(c.emoji).toBeTruthy()
      expect(c.gradient).toBeTruthy()
      expect(c.words.length).toBeGreaterThanOrEqual(15)
    }
  })

  it('gives every word the fields the card renders', () => {
    for (const w of words) {
      expect(w.hindi, 'headword').toBeTruthy()
      expect(w.pronunciation).toBeTruthy()
      expect(w.english).toBeTruthy()
      expect(w.type).toBeTruthy()
      // The card shows one string holding the Dutch sentence and its English.
      expect(w.example, `${w.hindi} example`).toContain(', ')
    }
  })

  // Progress is keyed by the headword, so a duplicate would make two cards
  // share one learned/archived state.
  it('has no duplicate headwords across the whole deck', () => {
    const heads = words.map((w) => w.hindi)
    expect(new Set(heads).size).toBe(heads.length)
  })

  it('has unique category ids', () => {
    const ids = categories.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  // de/het is the hardest part of a Dutch noun, so a noun card that does not
  // teach its article is a wasted card.
  it('gives every noun its article', () => {
    const nouns = words.filter((w) => w.type === 'noun')
    expect(nouns.length).toBeGreaterThan(0)
    for (const n of nouns) {
      expect(n.hindi, `${n.hindi} should start with de or het`).toMatch(/^(de|het) /)
    }
  })

  it('keeps headwords lower case, the way they are looked up', () => {
    for (const w of words) {
      expect(w.hindi, `${w.hindi} should be lower case`).toBe(w.hindi.toLowerCase())
    }
  })
})
