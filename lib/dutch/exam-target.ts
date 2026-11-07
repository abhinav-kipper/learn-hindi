import type { Level } from './level-map'

export const EXAM_TARGET_KEY = 'dutch-exam-target'

export type ExamTarget = 'a2' | 'b1'

/**
 * The level a target actually sits at, so a target can be compared against the
 * `Level` tags carried by lessons, Lezen texts and Luisteren clips.
 */
export const TARGET_LEVEL: Record<ExamTarget, Level> = { a2: 'A2', b1: 'B1' }

/** Ordered low to high, used to decide what counts as "beyond" a target. */
const LEVEL_ORDER: Level[] = ['A1', 'A2', 'B1']

function safeWindow(): Window | null {
  return typeof window === 'undefined' ? null : window
}

/**
 * Defaults to A2, the level most people actually sit. Someone aiming at B1 can
 * say so in the welcome modal or in Settings; the stored choice always wins.
 */
export function getExamTarget(): ExamTarget {
  const w = safeWindow()
  if (!w) return 'a2'
  const raw = w.localStorage.getItem(EXAM_TARGET_KEY)
  return raw === 'b1' ? 'b1' : 'a2'
}

export function setExamTarget(target: ExamTarget): void {
  const w = safeWindow()
  if (!w) return
  w.localStorage.setItem(EXAM_TARGET_KEY, target)
}

/** 'A2' / 'B1', for labelling the goal banner and section headers. */
export function targetLabel(target: ExamTarget): Level {
  return TARGET_LEVEL[target]
}

/** The levels that count toward the target, in order. A2 stops at A2. */
export function levelsForTarget(target: ExamTarget): Level[] {
  const cutoff = LEVEL_ORDER.indexOf(TARGET_LEVEL[target])
  return LEVEL_ORDER.slice(0, cutoff + 1)
}

/**
 * True when a piece of content sits above what the learner is preparing for.
 * Such content stays reachable, but is labelled and de-emphasized rather than
 * presented as something they still have to get through.
 */
export function isBeyondTarget(level: Level | undefined, target: ExamTarget): boolean {
  if (!level) return false
  return LEVEL_ORDER.indexOf(level) > LEVEL_ORDER.indexOf(TARGET_LEVEL[target])
}
