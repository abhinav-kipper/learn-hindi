import { describe, it, expect } from 'vitest'
import { getDutchAllCategories, getDutchTotalWordCount } from '@/lib/dutch/vocabulary'
import { getAllCategories } from '@/lib/vocabulary'

const categories = getDutchAllCategories()
const words = categories.flatMap((c) => c.words)

describe('Dutch vocabulary deck', () => {
  it('matches the Hindi deck in size and shape', () => {
    expect(getDutchTotalWordCount()).toBe(100)
    expect(categories).toHaveLength(getAllCategories().length)
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
