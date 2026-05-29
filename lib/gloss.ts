import glossHiJson from '@/content/gloss-hi.json'
import glossNlJson from '@/content/gloss-nl.json'

// Per-word, context-aware glosses for a phrase. Pre-generated into
// content/gloss-{hi,nl}.json, keyed by the exact (trimmed) phrase string. Each
// entry is an ordered list aligned to the phrase's word tokens (see tokenize()).
export interface GlossToken {
  /** the word as it appears (lower-cased, punctuation-stripped) */
  w: string
  /** short contextual translation */
  t: string
  /** optional one-line usage/meaning note */
  note?: string
}

const MAPS: Record<string, Record<string, GlossToken[]>> = {
  hindi: glossHiJson as Record<string, GlossToken[]>,
  dutch: glossNlJson as Record<string, GlossToken[]>,
}

/** A renderable piece of a phrase: a `word` (long-pressable) or literal text. */
export interface PhrasePiece {
  text: string
  word: boolean
  /** index among word pieces only (use to look up the gloss); -1 for non-words */
  wordIndex: number
}

// A "word" is a run of letters/digits, allowing internal apostrophes/hyphens.
// Everything else (spaces, punctuation) is rendered as-is between words.
const WORD_RE = /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu

/** Split a phrase into ordered word / non-word pieces, preserving everything. */
export function tokenize(phrase: string): PhrasePiece[] {
  const pieces: PhrasePiece[] = []
  let last = 0
  let wi = 0
  for (const m of phrase.matchAll(WORD_RE)) {
    const start = m.index ?? 0
    if (start > last) pieces.push({ text: phrase.slice(last, start), word: false, wordIndex: -1 })
    pieces.push({ text: m[0], word: true, wordIndex: wi++ })
    last = start + m[0].length
  }
  if (last < phrase.length) pieces.push({ text: phrase.slice(last), word: false, wordIndex: -1 })
  return pieces
}

/** Just the word tokens of a phrase, lower-cased — the unit gloss generation fills in. */
export function words(phrase: string): string[] {
  return [...phrase.matchAll(WORD_RE)].map((m) => m[0].toLowerCase())
}

/** The gloss list for a phrase in the given language, or null if none exists. */
export function getGloss(phrase: string, language: string): GlossToken[] | null {
  const map = MAPS[language] ?? MAPS.hindi
  return map[phrase.trim()] ?? null
}

/** Gloss for the word at a given word-index within a phrase, or null. */
export function glossForWordIndex(
  phrase: string,
  language: string,
  wordIndex: number,
): GlossToken | null {
  const g = getGloss(phrase, language)
  if (!g || wordIndex < 0 || wordIndex >= g.length) return null
  return g[wordIndex]
}
