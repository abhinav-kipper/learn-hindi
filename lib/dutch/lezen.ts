import lezenData from '@/content/dutch/lezen.json'

export const MOCK_SIZE = 5
export const QUESTIONS_PER_TEXT = 4
export const PASS_THRESHOLD = 0.8
export const MOCK_TIMER_MS = 25 * 60 * 1000
export const STUDIED_KEY = 'dutch-lezen-studied'
export const MOCK_ATTEMPTS_KEY = 'dutch-lezen-mock-attempts'
const MAX_ATTEMPTS = 50

export type Tier = 'A1' | 'A2' | 'B1'
export type QuestionType = 'hoofdgedachte' | 'detail' | 'woordbetekenis' | 'gevolg'

export interface LezenQuestion {
  type: QuestionType
  question_nl: string
  question_en: string
  options_nl: [string, string, string, string]
  options_en: [string, string, string, string]
  correct_index: 0 | 1 | 2 | 3
  explanation_en: string
}

export interface LezenText {
  id: string
  tier: Tier
  topic: string
  title_nl: string
  title_en: string
  body_nl: string
  body_en: string
  word_count: number
  questions: LezenQuestion[]
  references?: string[]
}

export interface LezenMockAttempt {
  ts: number
  score: number
  total: number
  passed: boolean
  text_ids: string[]
}

export interface LezenScoreResult {
  score: number
  total: number
  passed: boolean
}

function safeWindow(): Window | null {
  return typeof window === 'undefined' ? null : window
}

export function getLezenTexts(): LezenText[] {
  return lezenData.texts as LezenText[]
}

export function getTextById(id: string): LezenText | undefined {
  return getLezenTexts().find((t) => t.id === id)
}

export function getTextsByTier(tier: Tier): LezenText[] {
  return getLezenTexts().filter((t) => t.tier === tier)
}

export function drawMockSet(): LezenText[] {
  const all = [...getLezenTexts()]
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  return all.slice(0, MOCK_SIZE)
}

export function scoreMockAttempt(
  texts: LezenText[],
  answers: Array<0 | 1 | 2 | 3>,
): LezenScoreResult {
  let score = 0
  let total = 0
  let aIdx = 0
  for (const t of texts) {
    for (const q of t.questions) {
      if (answers[aIdx] === q.correct_index) score++
      total++
      aIdx++
    }
  }
  const passed = total > 0 && score / total >= PASS_THRESHOLD
  return { score, total, passed }
}

export function saveMockAttempt(attempt: LezenMockAttempt): void {
  const w = safeWindow()
  if (!w) return
  const existing = getMockHistory()
  const next = [attempt, ...existing].slice(0, MAX_ATTEMPTS)
  w.localStorage.setItem(MOCK_ATTEMPTS_KEY, JSON.stringify(next))
}

export function getMockHistory(): LezenMockAttempt[] {
  const w = safeWindow()
  if (!w) return []
  const raw = w.localStorage.getItem(MOCK_ATTEMPTS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as LezenMockAttempt[]
  } catch {
    return []
  }
}

function readStudiedSet(): Set<string> {
  const w = safeWindow()
  if (!w) return new Set()
  const raw = w.localStorage.getItem(STUDIED_KEY)
  if (!raw) return new Set()
  try {
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function writeStudiedSet(set: Set<string>): void {
  const w = safeWindow()
  if (!w) return
  w.localStorage.setItem(STUDIED_KEY, JSON.stringify([...set]))
}

export function markTextStudied(id: string): void {
  const set = readStudiedSet()
  set.add(id)
  writeStudiedSet(set)
}

export function isStudied(id: string): boolean {
  return readStudiedSet().has(id)
}

export function getStudiedCount(): number {
  return readStudiedSet().size
}
