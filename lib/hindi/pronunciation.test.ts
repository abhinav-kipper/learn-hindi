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

describe('lib/hindi/pronunciation', () => {
  beforeEach(() => localStorage.clear())

  it('loads 6 stages in ascending order', () => {
    const stages = getStages()
    expect(stages).toHaveLength(6)
    expect(stages.map((s) => s.order)).toEqual([0, 1, 2, 3, 4, 5])
    expect(stages[0].id).toBe('vowels')
    expect(stages[5].id).toBe('blending')
  })

  it('looks up a stage by id', () => {
    expect(getStage('aspiration')?.title.toLowerCase()).toContain('puff')
    expect(getStage('nope')).toBeUndefined()
  })

  it('every card has a unique id', () => {
    const ids = getStages().flatMap((s) => s.cards.map((c) => c.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every spoken string carries a Devanagari form for TTS', () => {
    for (const s of getStages()) {
      for (const c of s.cards) {
        expect(c.dev, `card ${c.id} dev`).toBeTruthy()
        expect(c.anchor.dev, `anchor ${c.id} dev`).toBeTruthy()
      }
      for (const item of s.earQuiz?.items ?? []) expect(item.dev, `quiz ${item.say}`).toBeTruthy()
      for (const w of s.blend?.words ?? []) expect(w.whole_dev, `blend ${w.whole}`).toBeTruthy()
    }
  })

  it('marks and reads card completion, persisting to storage', () => {
    expect(isCardDone('v-aa')).toBe(false)
    markCardDone('v-aa')
    expect(isCardDone('v-aa')).toBe(true)
    expect(JSON.parse(localStorage.getItem('hindi-pron-cards-done')!)).toContain('v-aa')
  })

  it('a stage with cards + ear-quiz is incomplete until both are done', () => {
    const stage = getStage('aspiration')!
    expect(isStageComplete(stage)).toBe(false)
    for (const c of stage.cards) markCardDone(c.id)
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
    expect(unlockedStageIds()).toEqual(['vowels', 'easy-consonants'])
  })

  it('completing a stage unlocks the next two', () => {
    completeStage(getStage('vowels')!)
    expect(unlockedStageIds()).toEqual(['vowels', 'easy-consonants', 'aspiration'])
    completeStage(getStage('easy-consonants')!)
    expect(unlockedStageIds()).toContain('retroflex')
    expect(isStageUnlocked(getStage('special-sounds')!)).toBe(false)
  })

  it('tracks course progress count', () => {
    expect(getCourseProgress()).toEqual({ completed: 0, total: 6 })
    completeStage(getStage('vowels')!)
    completeStage(getStage('easy-consonants')!)
    expect(getCourseProgress()).toEqual({ completed: 2, total: 6 })
  })
})
