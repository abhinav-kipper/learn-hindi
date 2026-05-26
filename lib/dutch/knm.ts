import knmData from '@/content/dutch/knm.json'

export const DRILL_SIZE = 30
export const PASS_THRESHOLD = 0.8
export const ATTEMPTS_KEY = 'dutch-knm-attempts'
export const LEARNED_KEY = 'dutch-knm-learned'
const MAX_ATTEMPTS = 50

export type Category = 'politiek' | 'werk' | 'onderwijs' | 'wonen' | 'gezondheid' | 'geschiedenis'

export interface KnmQuestion {
  id: string
  category: Category
  question_nl: string
  question_en?: string
  options_nl: [string, string, string, string]
  options_en?: [string, string, string, string]
  correct_index: 0 | 1 | 2 | 3
  explanation_en: string
  references?: string[]
}

export interface KnmAttempt {
  ts: number
  score: number
  total: number
  passed: boolean
}

export interface KnmScoreResult {
  score: number
  total: number
  passed: boolean
}

function safeWindow(): Window | null {
  return typeof window === 'undefined' ? null : window
}

export function getKnmQuestions(): KnmQuestion[] {
  return knmData.questions as KnmQuestion[]
}

export function getQuestionsByCategory(category: Category): KnmQuestion[] {
  return getKnmQuestions().filter((q) => q.category === category)
}

export function drawDrillSet(): KnmQuestion[] {
  const all = [...getKnmQuestions()]
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  return all.slice(0, DRILL_SIZE)
}

export function scoreAttempt(
  drill: KnmQuestion[],
  answers: Array<0 | 1 | 2 | 3>,
): KnmScoreResult {
  let score = 0
  drill.forEach((q, i) => {
    if (answers[i] === q.correct_index) score++
  })
  const total = drill.length
  const passed = score / total >= PASS_THRESHOLD
  return { score, total, passed }
}

export function saveAttempt(attempt: KnmAttempt): void {
  const w = safeWindow()
  if (!w) return
  const existing = getAttemptHistory()
  const next = [attempt, ...existing].slice(0, MAX_ATTEMPTS)
  w.localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(next))
}

export function getAttemptHistory(): KnmAttempt[] {
  const w = safeWindow()
  if (!w) return []
  const raw = w.localStorage.getItem(ATTEMPTS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as KnmAttempt[]
  } catch {
    return []
  }
}

function readLearnedSet(): Set<string> {
  const w = safeWindow()
  if (!w) return new Set()
  const raw = w.localStorage.getItem(LEARNED_KEY)
  if (!raw) return new Set()
  try {
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function writeLearnedSet(set: Set<string>): void {
  const w = safeWindow()
  if (!w) return
  w.localStorage.setItem(LEARNED_KEY, JSON.stringify([...set]))
}

export function markLearned(id: string): void {
  const set = readLearnedSet()
  set.add(id)
  writeLearnedSet(set)
}

export function isLearned(id: string): boolean {
  return readLearnedSet().has(id)
}

export function getLearnedCount(): number {
  return readLearnedSet().size
}
