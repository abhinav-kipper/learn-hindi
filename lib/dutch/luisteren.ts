import luisterData from '@/content/dutch/luisteren.json'

export const MOCK_SIZE = 5
export const QUESTIONS_PER_CLIP = 4
export const PASS_THRESHOLD = 0.8
export const MOCK_TIMER_MS = 25 * 60 * 1000
export const STUDIED_KEY = 'dutch-luisteren-studied'
export const MOCK_ATTEMPTS_KEY = 'dutch-luisteren-mock-attempts'
const MAX_ATTEMPTS = 50

export type Tier = 'A1' | 'A2' | 'B1'
export type ClipFormat = 'monologue' | 'dialogue'
export type QuestionType = 'hoofdgedachte' | 'detail' | 'woordbetekenis' | 'gevolg'

export interface LuisterQuestion {
  type: QuestionType
  question_nl: string
  question_en: string
  options_nl: [string, string, string, string]
  options_en: [string, string, string, string]
  correct_index: 0 | 1 | 2 | 3
  explanation_en: string
}

export interface LuisterLine {
  speaker?: string
  nl: string
  en: string
}

export interface LuisterClip {
  id: string
  tier: Tier
  topic: string
  format: ClipFormat
  title_nl: string
  title_en: string
  lines: LuisterLine[]
  questions: LuisterQuestion[]
  references?: string[]
}

export interface LuisterMockAttempt {
  ts: number
  score: number
  total: number
  passed: boolean
  clip_ids: string[]
}

export interface LuisterScoreResult {
  score: number
  total: number
  passed: boolean
}

function safeWindow(): Window | null {
  return typeof window === 'undefined' ? null : window
}

export function getClips(): LuisterClip[] {
  return luisterData.clips as LuisterClip[]
}

export function getClipById(id: string): LuisterClip | undefined {
  return getClips().find((c) => c.id === id)
}

export function getClipsByTier(tier: Tier): LuisterClip[] {
  return getClips().filter((c) => c.tier === tier)
}

/** The spoken Dutch text fed to TTS — lines joined, no speaker labels. */
export function buildAudioScript(clip: LuisterClip): string {
  return clip.lines.map((l) => l.nl).join(' ')
}

export function drawMockSet(): LuisterClip[] {
  const all = [...getClips()]
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  return all.slice(0, MOCK_SIZE)
}

export function scoreMockAttempt(
  clips: LuisterClip[],
  answers: Array<0 | 1 | 2 | 3>,
): LuisterScoreResult {
  let score = 0
  let total = 0
  let aIdx = 0
  for (const c of clips) {
    for (const q of c.questions) {
      if (answers[aIdx] === q.correct_index) score++
      total++
      aIdx++
    }
  }
  const passed = total > 0 && score / total >= PASS_THRESHOLD
  return { score, total, passed }
}

export function saveMockAttempt(attempt: LuisterMockAttempt): void {
  const w = safeWindow()
  if (!w) return
  const existing = getMockHistory()
  const next = [attempt, ...existing].slice(0, MAX_ATTEMPTS)
  w.localStorage.setItem(MOCK_ATTEMPTS_KEY, JSON.stringify(next))
}

export function getMockHistory(): LuisterMockAttempt[] {
  const w = safeWindow()
  if (!w) return []
  const raw = w.localStorage.getItem(MOCK_ATTEMPTS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as LuisterMockAttempt[]
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

export function markClipStudied(id: string): void {
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
