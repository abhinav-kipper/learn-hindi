import dutchVocabData from '@/content/dutch/vocabulary.json'
import { VocabWord, VocabCategory, VocabularyData } from '@/lib/vocabulary'

const DUTCH_LEARNED_KEY = 'dutch-vocab-learned'

export function getDutchVocabularyData(): VocabularyData {
  return dutchVocabData as VocabularyData
}

export function getDutchAllCategories(): VocabCategory[] {
  return dutchVocabData.categories as VocabCategory[]
}

export function getDutchCategory(categoryId: string): VocabCategory | undefined {
  return dutchVocabData.categories.find(c => c.id === categoryId) as VocabCategory | undefined
}

export function getDutchTotalWordCount(): number {
  return dutchVocabData.categories.reduce((sum, cat) => sum + cat.words.length, 0)
}

function getDutchLearnedWords(): Record<string, string[]> {
  if (typeof window === 'undefined') return {}
  const stored = localStorage.getItem(DUTCH_LEARNED_KEY)
  if (!stored) return {}
  try {
    return JSON.parse(stored) as Record<string, string[]>
  } catch {
    return {}
  }
}

function saveDutchLearnedWords(data: Record<string, string[]>): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(DUTCH_LEARNED_KEY, JSON.stringify(data))
}

export function markDutchWordLearned(categoryId: string, word: string): void {
  const learned = getDutchLearnedWords()
  if (!learned[categoryId]) learned[categoryId] = []
  if (!learned[categoryId].includes(word)) {
    learned[categoryId].push(word)
  }
  saveDutchLearnedWords(learned)
}

export function isDutchWordLearned(categoryId: string, word: string): boolean {
  const learned = getDutchLearnedWords()
  return learned[categoryId]?.includes(word) ?? false
}

export function getDutchLearnedCountForCategory(categoryId: string): number {
  const learned = getDutchLearnedWords()
  return learned[categoryId]?.length ?? 0
}

export function getDutchTotalLearnedCount(): number {
  const learned = getDutchLearnedWords()
  return Object.values(learned).reduce((sum, words) => sum + words.length, 0)
}

export function getDutchExploredVocabWords(): VocabWord[] {
  const learned = getDutchLearnedWords()
  const explored: VocabWord[] = []
  for (const cat of dutchVocabData.categories) {
    const learnedInCat = learned[cat.id] ?? []
    for (const word of cat.words) {
      if (learnedInCat.includes(word.hindi)) {
        explored.push(word as VocabWord)
      }
    }
  }
  return explored
}
