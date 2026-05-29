import courseData from '@/content/dutch/pronunciation-course.json'

export const CARDS_DONE_KEY = 'dutch-pron-cards-done'
export const EARQUIZ_DONE_KEY = 'dutch-pron-earquiz-done'
/** Completing a stage unlocks this many stages ahead of it. */
export const UNLOCK_WINDOW = 2

export type CardKind = 'letter' | 'vowel' | 'consonant' | 'digraph'

export interface PronCard {
  id: string
  grapheme: string
  hint: string
  anchor: { word: string; en: string }
  kind: CardKind
  note?: string
}

export interface EarQuizItem {
  say: string
  options: string[]
  correctIndex: number
}

export interface EarQuiz {
  prompt: string
  items: EarQuizItem[]
}

export interface BlendWord {
  parts: { text: string }[]
  whole: string
  en: string
}

export interface BlendSet {
  words: BlendWord[]
}

export interface PronStage {
  id: string
  order: number
  title: string
  subtitle: string
  goal: string
  intro: string
  cards: PronCard[]
  earQuiz?: EarQuiz
  blend?: BlendSet
}

function safeWindow(): Window | null {
  return typeof window === 'undefined' ? null : window
}

export function getStages(): PronStage[] {
  return [...(courseData.stages as PronStage[])].sort((a, b) => a.order - b.order)
}

export function getStage(id: string): PronStage | undefined {
  return getStages().find((s) => s.id === id)
}

/** Stable id used to track a blend word's completion in the cards-done set. */
export function blendWordId(whole: string): string {
  return `blend:${whole}`
}

function readSet(key: string): Set<string> {
  const w = safeWindow()
  if (!w) return new Set()
  const raw = w.localStorage.getItem(key)
  if (!raw) return new Set()
  try {
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function writeSet(key: string, set: Set<string>): void {
  const w = safeWindow()
  if (!w) return
  w.localStorage.setItem(key, JSON.stringify([...set]))
}

export function isCardDone(cardId: string): boolean {
  return readSet(CARDS_DONE_KEY).has(cardId)
}

export function markCardDone(cardId: string): void {
  const set = readSet(CARDS_DONE_KEY)
  if (set.has(cardId)) return
  set.add(cardId)
  writeSet(CARDS_DONE_KEY, set)
}

export function isEarQuizPassed(stageId: string): boolean {
  return readSet(EARQUIZ_DONE_KEY).has(stageId)
}

export function markEarQuizPassed(stageId: string): void {
  const set = readSet(EARQUIZ_DONE_KEY)
  if (set.has(stageId)) return
  set.add(stageId)
  writeSet(EARQUIZ_DONE_KEY, set)
}

/** A stage is complete once every card is done, its ear-quiz (if any) passed,
 *  and every blend word (if any) built. */
export function isStageComplete(stage: PronStage): boolean {
  const cardsDone = readSet(CARDS_DONE_KEY)
  for (const c of stage.cards) {
    if (!cardsDone.has(c.id)) return false
  }
  if (stage.blend) {
    for (const w of stage.blend.words) {
      if (!cardsDone.has(blendWordId(w.whole))) return false
    }
  }
  if (stage.earQuiz && !isEarQuizPassed(stage.id)) return false
  return true
}

/** Highest `order` among completed stages, or -1 if none complete. */
function maxCompletedOrder(): number {
  let max = -1
  for (const s of getStages()) {
    if (isStageComplete(s) && s.order > max) max = s.order
  }
  return max
}

export function isStageUnlocked(stage: PronStage): boolean {
  return stage.order <= maxCompletedOrder() + UNLOCK_WINDOW
}

export function unlockedStageIds(): string[] {
  const frontier = maxCompletedOrder() + UNLOCK_WINDOW
  return getStages()
    .filter((s) => s.order <= frontier)
    .map((s) => s.id)
}

/** How many of a stage's checkpoints (cards + blend words + ear-quiz) are done. */
export function getStageProgress(stage: PronStage): { done: number; total: number } {
  const cardsDone = readSet(CARDS_DONE_KEY)
  let done = 0
  let total = 0
  for (const c of stage.cards) {
    total++
    if (cardsDone.has(c.id)) done++
  }
  if (stage.blend) {
    for (const w of stage.blend.words) {
      total++
      if (cardsDone.has(blendWordId(w.whole))) done++
    }
  }
  if (stage.earQuiz) {
    total++
    if (isEarQuizPassed(stage.id)) done++
  }
  return { done, total }
}

export function getCourseProgress(): { completed: number; total: number } {
  const stages = getStages()
  return {
    completed: stages.filter((s) => isStageComplete(s)).length,
    total: stages.length,
  }
}
