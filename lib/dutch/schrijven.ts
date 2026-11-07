import raw from '@/content/dutch/schrijven.json'

/**
 * Schrijven (writing), the A2 inburgeringsexamen paper.
 *
 * The real paper is four tasks in about 40 minutes, on paper: a form, a short
 * note, a semi-formal email and a short free text. It is marked on whether you
 * covered every point the task asked for, which is why each task here carries
 * a `must_include` checklist. That list is what the AI grades against and what
 * the learner self-marks against when they are offline.
 */
export type TaskType = 'formulier' | 'briefje' | 'email' | 'vrij'
export type Tier = 'A1' | 'A2'

export interface FormField {
  label_nl: string
  label_en: string
  hint_en: string
}

export interface SchrijfTask {
  id: string
  type: TaskType
  tier: Tier
  title_nl: string
  title_en: string
  situation_en: string
  prompt_nl: string
  prompt_en: string
  /** Minimum sentences the task asks for. 0 for a form. */
  min_sentences: number
  /** The points the paper is marked on. */
  must_include: string[]
  /** Forms only: the fields to render. */
  fields?: FormField[]
  model_answer_nl: string
  model_answer_en: string
  tips_en: string[]
}

const tasks = (raw as { tasks: SchrijfTask[] }).tasks

/** Ordered the way the real paper runs: form, note, email, free text. */
export const TASK_TYPES: Array<{ key: TaskType; en: string; nl: string; blurb: string }> = [
  { key: 'formulier', en: 'Form', nl: 'Formulier', blurb: 'Details only. Accuracy is the whole mark.' },
  { key: 'briefje', en: 'Short note', nl: 'Briefje', blurb: '3 to 5 sentences, informal.' },
  { key: 'email', en: 'Email', nl: 'E-mail', blurb: '4 to 6 sentences, semi-formal.' },
  { key: 'vrij', en: 'Free writing', nl: 'Vrije tekst', blurb: 'A few sentences on an everyday topic.' },
]

/** The real paper: 4 tasks, roughly 40 minutes. Sources vary between 35 and 40. */
export const EXAM_TASK_COUNT = 4
export const EXAM_MINUTES = 40

const DONE_KEY = 'dutch-schrijven-done'
const DRAFT_KEY = 'dutch-schrijven-drafts'

export function getSchrijfTasks(): SchrijfTask[] {
  return tasks
}

export function getTaskById(id: string): SchrijfTask | undefined {
  return tasks.find((t) => t.id === id)
}

export function getTasksByType(type: TaskType): SchrijfTask[] {
  return tasks.filter((t) => t.type === type)
}

/** The next unfinished task, so the module can offer a single obvious step. */
export function getNextTask(): SchrijfTask | undefined {
  return tasks.find((t) => !isTaskDone(t.id))
}

// --------------------------------------------------------------- done state

function readSet(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
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

// ------------------------------------------------------------------ drafts

/**
 * Writing takes real effort, so a half-finished answer must survive a reload
 * or an accidental back-tap. Drafts are per task and never expire.
 */
function readDrafts(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

export function getDraft(id: string): string {
  const d = readDrafts()[id]
  return typeof d === 'string' ? d : ''
}

export function saveDraft(id: string, text: string): void {
  if (typeof window === 'undefined') return
  try {
    const all = readDrafts()
    if (text.trim()) all[id] = text
    else delete all[id]
    localStorage.setItem(DRAFT_KEY, JSON.stringify(all))
  } catch {
    /* storage unavailable */
  }
}

// ------------------------------------------------------------------ counting

/**
 * Rough sentence count, used to tell the learner whether they have written
 * enough for the task. Splits on . ! ? and on blank lines, so the form-style
 * answers and the multi-line notes both count sensibly.
 */
export function countSentences(text: string): number {
  if (!text || !text.trim()) return 0
  return text
    .split(/[.!?]+|\n{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1).length
}

export function countWords(text: string): number {
  if (!text || !text.trim()) return 0
  return text.trim().split(/\s+/).length
}

/**
 * Has the learner written enough to be worth checking? Guards against sending
 * an empty or one-word answer to the grader.
 */
export function isLongEnough(task: SchrijfTask, text: string): boolean {
  if (task.type === 'formulier') return countWords(text) >= 5
  return countSentences(text) >= task.min_sentences
}
