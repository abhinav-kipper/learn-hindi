// Vocabulary review system — tracks words marked as "known" or "needs review"
// via swipe gestures in the vocabulary category pages.

const VOCAB_KNOWN_KEY = 'vocab-known'
const VOCAB_REVIEW_KEY = 'vocab-review'

function getSet(key: string): string[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(key)
  if (!stored) return []
  try {
    return JSON.parse(stored) as string[]
  } catch {
    return []
  }
}

function saveSet(key: string, items: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(items))
}

export function getVocabKnown(): string[] {
  return getSet(VOCAB_KNOWN_KEY)
}

export function getVocabReview(): string[] {
  return getSet(VOCAB_REVIEW_KEY)
}

export function addVocabKnown(hindi: string): void {
  const items = getSet(VOCAB_KNOWN_KEY)
  if (!items.includes(hindi)) {
    items.push(hindi)
    saveSet(VOCAB_KNOWN_KEY, items)
  }
}

export function addVocabReview(hindi: string): void {
  const items = getSet(VOCAB_REVIEW_KEY)
  if (!items.includes(hindi)) {
    items.push(hindi)
    saveSet(VOCAB_REVIEW_KEY, items)
  }
}

export function removeVocabKnown(hindi: string): void {
  const items = getSet(VOCAB_KNOWN_KEY)
  const filtered = items.filter(w => w !== hindi)
  saveSet(VOCAB_KNOWN_KEY, filtered)
}

export function removeVocabReview(hindi: string): void {
  const items = getSet(VOCAB_REVIEW_KEY)
  const filtered = items.filter(w => w !== hindi)
  saveSet(VOCAB_REVIEW_KEY, filtered)
}

/**
 * Get vocabulary words marked for review, formatted as ReviewPhrase-compatible objects
 * for use in the daily review popup.
 */
export function getVocabReviewPhrases(): { hindi: string; english: string; pronunciation: string; context: string }[] {
  if (typeof window === 'undefined') return []

  const reviewWords = getSet(VOCAB_REVIEW_KEY)
  if (reviewWords.length === 0) return []

  // Load vocabulary data to get full word details
  try {
    const vocabDataStr = localStorage.getItem('hindi-vocab-learned')
    // We need to look up the words from the vocabulary JSON
    // Since we only store the hindi text, we'll try to get full info from categories
    // This is a best-effort approach — the vocabulary module isn't importable here without circular deps
    // So we store minimal data and let the consumer look up full details
    return reviewWords.map(hindi => ({
      hindi,
      english: '',
      pronunciation: '',
      context: 'Vocabulary word marked for review',
    }))
  } catch {
    return []
  }
}
