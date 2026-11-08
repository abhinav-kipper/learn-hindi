import raw from '@/content/dutch/spreken.json'

/**
 * Spreken (speaking), the A2 inburgeringsexamen paper.
 *
 * The real paper is 16 spoken answers in about 35 minutes, on a computer.
 * Since March 2025 there are no multiple-choice items left: you speak every
 * answer yourself, you get roughly a minute per task, and there is no second
 * attempt.
 *
 * That last constraint is what shapes this module. Under a one-minute timer
 * with no retry, what decides the mark is not how much grammar you know, it is
 * whether you have a sentence FRAME ready that you can slot words into without
 * having to think. So every task carries a `frame` (the skeleton) and
 * `phrases` (the chunks to fill it with), and those are shown before the
 * learner records rather than afterwards.
 *
 * Timings and the grouping into task types come from exam-prep publishers;
 * DUO is the authority if any of it changes.
 */
export type TaskType = 'warmup' | 'video' | 'foto' | 'keuze' | 'verhaal'
export type Tier = 'A1' | 'A2'

export interface Phrase {
  nl: string
  en: string
}

export interface SpreekTask {
  id: string
  type: TaskType
  tier: Tier
  /** Recording time the real paper allows for this type of task. */
  seconds: number
  title_nl: string
  title_en: string
  /** What the exam puts in front of you, in Dutch. */
  prompt_nl: string
  prompt_en: string
  /** Roughly how many sentences a passing answer needs. */
  min_sentences: number
  /** The points the answer is marked on. */
  must_cover: string[]
  /** The reusable skeleton. The heart of this module. */
  frame: string[]
  phrases: Phrase[]
  model_answer_nl: string
  model_answer_en: string
  tips_en: string[]
  /**
   * Picture tasks describe their image in English instead of showing a photo.
   * The app has no photo assets, and a described scene still forces the
   * learner to produce all the Dutch themselves, which is the skill being
   * tested. Stated plainly in the UI so it is not mistaken for the real thing.
   */
  scene_en?: string
  /** Choice tasks: the two options being chosen between. */
  options?: string[]
  /** Story tasks: the three panels, described in English. */
  panels?: string[]
}

const tasks = (raw as { tasks: SpreekTask[] }).tasks

/** Ordered the way the real paper builds up: easiest first, story last. */
export const TASK_TYPES: Array<{ key: TaskType; en: string; nl: string; blurb: string }> = [
  { key: 'warmup', en: 'About you', nl: 'Persoonlijke vragen', blurb: 'Short questions about your own life. The most predictable marks on the paper.' },
  { key: 'video', en: 'Someone speaks to you', nl: 'Videovragen', blurb: 'A person says something. You answer them.' },
  { key: 'foto', en: 'Describe a picture', nl: 'Een foto beschrijven', blurb: 'Say what you see, then what you think.' },
  { key: 'keuze', en: 'Choose and explain', nl: 'Kiezen en uitleggen', blurb: 'Pick one of two, and give your reasons.' },
  { key: 'verhaal', en: 'Tell a story', nl: 'Een verhaal vertellen', blurb: 'Three pictures, one story, in the past tense.' },
]

/** The real paper: 16 spoken answers in about 35 minutes. */
export const EXAM_TASK_COUNT = 16
export const EXAM_MINUTES = 35

/** Below this, there is not enough audio to be worth a model call. */
export const MIN_ANSWER_SECONDS = 2

const DONE_KEY = 'dutch-spreken-done'
const BEST_KEY = 'dutch-spreken-scores'

export function getSpreekTasks(): SpreekTask[] {
  return tasks
}

export function getTaskById(id: string): SpreekTask | undefined {
  return tasks.find((t) => t.id === id)
}

export function getTasksByType(type: TaskType): SpreekTask[] {
  return tasks.filter((t) => t.type === type)
}

/** The next unfinished task, so the module can offer one obvious next step. */
export function getNextTask(): SpreekTask | undefined {
  return tasks.find((t) => !isTaskDone(t.id))
}

// --------------------------------------------------------------- done state

function readSet(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return new Set()
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? new Set(parsed.filter((v) => typeof v === 'string')) : new Set()
  } catch {
    return new Set()
  }
}

function writeSet(key: string, set: Set<string>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify([...set]))
  } catch {
    /* storage unavailable, state is best-effort */
  }
}

export function isTaskDone(id: string): boolean {
  return readSet(DONE_KEY).has(id)
}

export function markTaskDone(id: string): void {
  const s = readSet(DONE_KEY)
  s.add(id)
  writeSet(DONE_KEY, s)
}

export function unmarkTaskDone(id: string): void {
  const s = readSet(DONE_KEY)
  s.delete(id)
  writeSet(DONE_KEY, s)
}

export function getDoneCount(): number {
  const ids = new Set(tasks.map((t) => t.id))
  return [...readSet(DONE_KEY)].filter((id) => ids.has(id)).length
}

// -------------------------------------------------------------- best scores

export type Band = 'not yet' | 'nearly' | 'pass' | 'strong'

/** Ranked worst to best, so a later attempt only replaces a weaker one. */
export const BANDS: Band[] = ['not yet', 'nearly', 'pass', 'strong']

export function bandRank(b: Band): number {
  const i = BANDS.indexOf(b)
  return i === -1 ? 0 : i
}

function readScores(): Record<string, Band> {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem(BEST_KEY)
    if (!stored) return {}
    const parsed = JSON.parse(stored)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const out: Record<string, Band> = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === 'string' && (BANDS as string[]).includes(v)) out[k] = v as Band
    }
    return out
  } catch {
    return {}
  }
}

export function getBestBand(id: string): Band | undefined {
  return readScores()[id]
}

/** Keeps the best band ever reached, so a bad day never erases a good one. */
export function recordBand(id: string, band: Band): void {
  if (typeof window === 'undefined') return
  try {
    const all = readScores()
    const prev = all[id]
    if (prev && bandRank(prev) >= bandRank(band)) return
    all[id] = band
    localStorage.setItem(BEST_KEY, JSON.stringify(all))
  } catch {
    /* storage unavailable */
  }
}

/** How many tasks have ever reached a passing band. */
export function getPassedCount(): number {
  const scores = readScores()
  return tasks.filter((t) => {
    const b = scores[t.id]
    return b ? bandRank(b) >= bandRank('pass') : false
  }).length
}
