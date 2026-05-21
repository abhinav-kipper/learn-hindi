import vocabularyData from '@/content/vocabulary.json'

export interface VocabWord {
  hindi: string
  pronunciation: string
  english: string
  example: string
  type: string
}

export interface VocabCategory {
  id: string
  title: string
  emoji: string
  gradient: string
  words: VocabWord[]
}

export interface VocabularyData {
  categories: VocabCategory[]
}

const LEARNED_KEY = 'hindi-vocab-learned'

export function getVocabularyData(): VocabularyData {
  return vocabularyData as VocabularyData
}

export function getCategory(categoryId: string): VocabCategory | undefined {
  return vocabularyData.categories.find(c => c.id === categoryId) as VocabCategory | undefined
}

export function getAllCategories(): VocabCategory[] {
  return vocabularyData.categories as VocabCategory[]
}

export function getTotalWordCount(): number {
  return vocabularyData.categories.reduce((sum, cat) => sum + cat.words.length, 0)
}

// --- Learned words tracking ---

function getLearnedWords(): Record<string, string[]> {
  if (typeof window === 'undefined') return {}
  const stored = localStorage.getItem(LEARNED_KEY)
  if (!stored) return {}
  try {
    return JSON.parse(stored) as Record<string, string[]>
  } catch {
    return {}
  }
}

function saveLearnedWords(data: Record<string, string[]>): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LEARNED_KEY, JSON.stringify(data))
}

export function markWordLearned(categoryId: string, hindi: string): void {
  const learned = getLearnedWords()
  if (!learned[categoryId]) {
    learned[categoryId] = []
  }
  if (!learned[categoryId].includes(hindi)) {
    learned[categoryId].push(hindi)
  }
  saveLearnedWords(learned)
}

export function isWordLearned(categoryId: string, hindi: string): boolean {
  const learned = getLearnedWords()
  return learned[categoryId]?.includes(hindi) ?? false
}

export function getLearnedCountForCategory(categoryId: string): number {
  const learned = getLearnedWords()
  return learned[categoryId]?.length ?? 0
}

export function getTotalLearnedCount(): number {
  const learned = getLearnedWords()
  return Object.values(learned).reduce((sum, words) => sum + words.length, 0)
}

export function getExploredVocabWords(): VocabWord[] {
  const learned = getLearnedWords()
  const explored: VocabWord[] = []
  for (const cat of vocabularyData.categories) {
    const learnedInCat = learned[cat.id] ?? []
    for (const word of cat.words) {
      if (learnedInCat.includes(word.hindi)) {
        explored.push(word as VocabWord)
      }
    }
  }
  return explored
}
