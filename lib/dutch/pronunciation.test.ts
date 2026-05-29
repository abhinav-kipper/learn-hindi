import { describe, it, expect, beforeEach } from 'vitest'
import {
  getStages,
  getStage,
  isCardDone,
  markCardDone,
  markEarQuizPassed,
  isEarQuizPassed,
  isStageComplete,
  isStageUnlocked,
  unlockedStageIds,
  getCourseProgress,
  blendWordId,
  type PronStage,
} from './pronunciation'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v
    },
    removeItem: (k: string) => {
      delete store[k]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

/** Fully complete a stage: mark every card, blend word, and pass its ear-quiz. */
function completeStage(stage: PronStage): void {
  for (const c of stage.cards) markCardDone(c.id)
  if (stage.blend) for (const w of stage.blend.words) markCardDone(blendWordId(w.whole))
  if (stage.earQuiz) markEarQuizPassed(stage.id)
}

describe('lib/dutch/pronunciation', () => {
  beforeEach(() => localStorage.clear())

  it('loads 8 stages in ascending order', () => {
    const stages = getStages()
    expect(stages).toHaveLength(8)
    expect(stages.map((s) => s.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    expect(stages[0].id).toBe('alphabet')
    expect(stages[7].id).toBe('linking')
  })

  it('looks up a stage by id', () => {
    expect(getStage('guttural-g')?.title).toContain('guttural')
    expect(getStage('nope')).toBeUndefined()
  })

  it('every card has a unique id', () => {
    const ids = getStages().flatMap((s) => s.cards.map((c) => c.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('marks and reads card completion, persisting to storage', () => {
    expect(isCardDone('a-appel')).toBe(false)
    markCardDone('a-appel')
    expect(isCardDone('a-appel')).toBe(true)
    expect(JSON.parse(localStorage.getItem('dutch-pron-cards-done')!)).toContain('a-appel')
  })

  it('a stage with cards + ear-quiz is incomplete until both are done', () => {
    const stage = getStage('short-vowels')!
    expect(isStageComplete(stage)).toBe(false)
    for (const c of stage.cards) markCardDone(c.id)
    // cards done but ear-quiz not passed yet
    expect(isStageComplete(stage)).toBe(false)
    markEarQuizPassed(stage.id)
    expect(isStageComplete(stage)).toBe(true)
  })

  it('a blend stage completes when every blend word is built', () => {
    const stage = getStage('blending')!
    expect(stage.cards).toHaveLength(0)
    expect(isStageComplete(stage)).toBe(false)
    for (const w of stage.blend!.words) markCardDone(blendWordId(w.whole))
    expect(isStageComplete(stage)).toBe(true)
  })

  it('opens stages 0 and 1 before anything is completed', () => {
    expect(unlockedStageIds()).toEqual(['alphabet', 'short-vowels'])
    expect(isEarQuizPassed('alphabet')).toBe(false)
  })

  it('completing a stage unlocks the next two', () => {
    completeStage(getStage('alphabet')!)
    // frontier = 0 + 2 = 2 → orders 0,1,2 open
    expect(unlockedStageIds()).toEqual(['alphabet', 'short-vowels', 'long-vowels'])

    completeStage(getStage('short-vowels')!)
    // frontier = 1 + 2 = 3
    expect(unlockedStageIds()).toContain('consonants')
    expect(isStageUnlocked(getStage('guttural-g')!)).toBe(false)
  })

  it('tracks course progress count', () => {
    expect(getCourseProgress()).toEqual({ completed: 0, total: 8 })
    completeStage(getStage('alphabet')!)
    completeStage(getStage('short-vowels')!)
    expect(getCourseProgress()).toEqual({ completed: 2, total: 8 })
  })
})
