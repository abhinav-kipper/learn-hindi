import { describe, it, expect, beforeEach } from 'vitest'
import {
  getSpreekTasks,
  getTaskById,
  getTasksByType,
  getNextTask,
  isTaskDone,
  markTaskDone,
  unmarkTaskDone,
  getDoneCount,
  getBestBand,
  recordBand,
  getPassedCount,
  bandRank,
  TASK_TYPES,
  BANDS,
  EXAM_TASK_COUNT,
  EXAM_MINUTES,
} from './spreken'

const store: Record<string, string> = {}
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v
    },
    removeItem: (k: string) => {
      delete store[k]
    },
    clear: () => Object.keys(store).forEach((k) => delete store[k]),
  },
  writable: true,
})

beforeEach(() => localStorage.clear())

// The content is the product here, so these assertions are CI gates on it as
// much as they are unit tests.
describe('spreken content', () => {
  const tasks = getSpreekTasks()

  it('has one task per question on the real paper', () => {
    expect(tasks).toHaveLength(EXAM_TASK_COUNT)
    expect(EXAM_MINUTES).toBe(35)
  })

  it('covers every task type the paper uses', () => {
    const seen = new Set(tasks.map((t) => t.type))
    for (const { key } of TASK_TYPES) expect(seen).toContain(key)
  })

  it('gives every task a unique id', () => {
    const ids = tasks.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every task a frame to speak from, which is the point of the module', () => {
    for (const t of tasks) {
      expect(t.frame.length, t.id).toBeGreaterThanOrEqual(3)
      // A frame is a skeleton with a gap, or a whole ready-made line. At least
      // one line must have a blank to fill, or it is not a frame at all.
      expect(t.frame.some((f) => f.includes('___')), t.id).toBe(true)
    }
  })

  it('gives every task enough phrases to fill its frame', () => {
    for (const t of tasks) expect(t.phrases.length, t.id).toBeGreaterThanOrEqual(5)
  })

  it('gives every phrase both a Dutch and an English side', () => {
    for (const t of tasks) {
      for (const p of t.phrases) {
        expect(p.nl.trim(), t.id).not.toBe('')
        expect(p.en.trim(), t.id).not.toBe('')
      }
    }
  })

  it('tells the learner what each answer is marked on', () => {
    for (const t of tasks) expect(t.must_cover.length, t.id).toBeGreaterThanOrEqual(3)
  })

  it('gives every task a model answer in both languages', () => {
    for (const t of tasks) {
      expect(t.model_answer_nl.length, t.id).toBeGreaterThan(40)
      expect(t.model_answer_en.length, t.id).toBeGreaterThan(40)
    }
  })

  it('allows a realistic recording time for every task', () => {
    for (const t of tasks) {
      expect(t.seconds, t.id).toBeGreaterThanOrEqual(45)
      expect(t.seconds, t.id).toBeLessThanOrEqual(90)
    }
  })

  it('gives the three-picture story the longest time and the most to say', () => {
    for (const t of tasks.filter((x) => x.type === 'verhaal')) {
      expect(t.seconds, t.id).toBe(90)
      expect(t.min_sentences, t.id).toBeGreaterThanOrEqual(6)
      expect(t.panels, t.id).toHaveLength(3)
    }
  })

  it('describes the scene for every picture task, since there are no photos', () => {
    for (const t of tasks.filter((x) => x.type === 'foto')) {
      expect(t.scene_en, t.id).toBeTruthy()
    }
  })

  it('gives every choice task exactly two options to choose between', () => {
    for (const t of tasks.filter((x) => x.type === 'keuze')) {
      expect(t.options, t.id).toHaveLength(2)
    }
  })

  it('asks for at least three sentences everywhere', () => {
    for (const t of tasks) expect(t.min_sentences, t.id).toBeGreaterThanOrEqual(3)
  })

  it('never leaves an unfilled placeholder in learner-facing prose', () => {
    for (const t of tasks) {
      expect(t.prompt_nl, t.id).not.toContain('___')
      expect(t.model_answer_nl, t.id).not.toContain('___')
    }
  })
})

describe('lookups', () => {
  it('finds a task by id', () => {
    expect(getTaskById('spreken-001')?.type).toBe('warmup')
  })

  it('returns undefined for an unknown id', () => {
    expect(getTaskById('nope')).toBeUndefined()
  })

  it('filters by type', () => {
    const foto = getTasksByType('foto')
    expect(foto.length).toBeGreaterThan(0)
    expect(foto.every((t) => t.type === 'foto')).toBe(true)
  })
})

describe('done tracking', () => {
  it('starts with nothing done', () => {
    expect(getDoneCount()).toBe(0)
    expect(isTaskDone('spreken-001')).toBe(false)
  })

  it('marks and unmarks a task', () => {
    markTaskDone('spreken-001')
    expect(isTaskDone('spreken-001')).toBe(true)
    unmarkTaskDone('spreken-001')
    expect(isTaskDone('spreken-001')).toBe(false)
  })

  it('does not double count a task marked twice', () => {
    markTaskDone('spreken-001')
    markTaskDone('spreken-001')
    expect(getDoneCount()).toBe(1)
  })

  it('ignores ids that are no longer in the content', () => {
    localStorage.setItem('dutch-spreken-done', JSON.stringify(['spreken-001', 'deleted-task']))
    expect(getDoneCount()).toBe(1)
  })

  it('survives corrupt storage without throwing', () => {
    localStorage.setItem('dutch-spreken-done', 'not json')
    expect(getDoneCount()).toBe(0)
  })

  it('offers the first unfinished task as the next step', () => {
    expect(getNextTask()?.id).toBe('spreken-001')
    markTaskDone('spreken-001')
    expect(getNextTask()?.id).toBe('spreken-002')
  })

  it('offers nothing once every task is done', () => {
    getSpreekTasks().forEach((t) => markTaskDone(t.id))
    expect(getNextTask()).toBeUndefined()
  })
})

describe('best band', () => {
  it('ranks the bands worst to best', () => {
    expect(bandRank('not yet')).toBeLessThan(bandRank('nearly'))
    expect(bandRank('nearly')).toBeLessThan(bandRank('pass'))
    expect(bandRank('pass')).toBeLessThan(bandRank('strong'))
    expect(BANDS).toHaveLength(4)
  })

  it('records a band', () => {
    recordBand('spreken-001', 'pass')
    expect(getBestBand('spreken-001')).toBe('pass')
  })

  it('keeps the better band when a later attempt is worse', () => {
    recordBand('spreken-001', 'strong')
    recordBand('spreken-001', 'not yet')
    expect(getBestBand('spreken-001')).toBe('strong')
  })

  it('upgrades when a later attempt is better', () => {
    recordBand('spreken-001', 'nearly')
    recordBand('spreken-001', 'pass')
    expect(getBestBand('spreken-001')).toBe('pass')
  })

  it('counts only tasks that reached a passing band', () => {
    recordBand('spreken-001', 'pass')
    recordBand('spreken-002', 'strong')
    recordBand('spreken-003', 'nearly')
    expect(getPassedCount()).toBe(2)
  })

  it('ignores a band that is not one of the four', () => {
    localStorage.setItem('dutch-spreken-scores', JSON.stringify({ 'spreken-001': 'excellent' }))
    expect(getBestBand('spreken-001')).toBeUndefined()
  })

  it('survives corrupt storage without throwing', () => {
    localStorage.setItem('dutch-spreken-scores', '{{{')
    expect(getPassedCount()).toBe(0)
  })
})
