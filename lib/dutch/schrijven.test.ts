import { describe, it, expect, beforeEach } from 'vitest'
import {
  getSchrijfTasks,
  getTaskById,
  getTasksByType,
  getNextTask,
  isTaskDone,
  markTaskDone,
  unmarkTaskDone,
  getDoneCount,
  getDraft,
  saveDraft,
  countSentences,
  countWords,
  isLongEnough,
  TASK_TYPES,
  EXAM_TASK_COUNT,
  EXAM_MINUTES,
} from './schrijven'

beforeEach(() => {
  localStorage.clear()
})

describe('schrijven content', () => {
  const tasks = getSchrijfTasks()

  it('loads a usable bank of tasks', () => {
    expect(tasks.length).toBeGreaterThanOrEqual(12)
  })

  it('covers all four task types the real paper uses', () => {
    const types = new Set(tasks.map((t) => t.type))
    expect([...types].sort()).toEqual(['briefje', 'email', 'formulier', 'vrij'])
    // Every declared type must actually have tasks behind it.
    for (const t of TASK_TYPES) expect(getTasksByType(t.key).length).toBeGreaterThan(0)
  })

  it('states the real paper shape', () => {
    expect(EXAM_TASK_COUNT).toBe(4)
    expect(EXAM_MINUTES).toBe(40)
  })

  it('every task is well-formed', () => {
    for (const t of tasks) {
      expect(t.id, 'id').toMatch(/^schrijven-\d{3}$/)
      expect(t.title_nl && t.title_en, `${t.id} titles`).toBeTruthy()
      expect(t.prompt_nl && t.prompt_en, `${t.id} prompts`).toBeTruthy()
      expect(t.situation_en, `${t.id} situation`).toBeTruthy()
      expect(t.model_answer_nl && t.model_answer_en, `${t.id} model answer`).toBeTruthy()
      expect(t.tips_en.length, `${t.id} tips`).toBeGreaterThan(0)
      expect(['A1', 'A2']).toContain(t.tier)
    }
  })

  // The paper is marked on covering every point the task asks for, so this
  // checklist is the feature, not decoration: the AI grades against it and the
  // learner self-marks against it offline.
  it('every task carries a marking checklist of at least three points', () => {
    for (const t of tasks) {
      expect(t.must_include.length, `${t.id} checklist`).toBeGreaterThanOrEqual(3)
      for (const p of t.must_include) expect(p.trim().length).toBeGreaterThan(0)
    }
  })

  it('forms declare their fields and writing tasks declare a length', () => {
    for (const t of tasks) {
      if (t.type === 'formulier') {
        expect(t.fields, `${t.id} fields`).toBeTruthy()
        expect(t.fields!.length).toBeGreaterThanOrEqual(5)
        for (const f of t.fields!) expect(f.label_nl && f.label_en).toBeTruthy()
      } else {
        expect(t.min_sentences, `${t.id} min_sentences`).toBeGreaterThanOrEqual(3)
      }
    }
  })

  it('has no duplicate ids', () => {
    const ids = tasks.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('looks a task up by id', () => {
    expect(getTaskById(tasks[0].id)?.title_en).toBe(tasks[0].title_en)
    expect(getTaskById('nope')).toBeUndefined()
  })
})

describe('done tracking', () => {
  it('marks, reads and clears', () => {
    const id = getSchrijfTasks()[0].id
    expect(isTaskDone(id)).toBe(false)
    markTaskDone(id)
    expect(isTaskDone(id)).toBe(true)
    expect(getDoneCount()).toBe(1)
    unmarkTaskDone(id)
    expect(isTaskDone(id)).toBe(false)
    expect(getDoneCount()).toBe(0)
  })

  it('is idempotent', () => {
    const id = getSchrijfTasks()[0].id
    markTaskDone(id)
    markTaskDone(id)
    expect(getDoneCount()).toBe(1)
  })

  it('ignores ids that are no longer in the bank', () => {
    localStorage.setItem('dutch-schrijven-done', JSON.stringify(['schrijven-999']))
    expect(getDoneCount()).toBe(0)
  })

  it('survives malformed storage', () => {
    localStorage.setItem('dutch-schrijven-done', 'not json')
    expect(() => getDoneCount()).not.toThrow()
    expect(getDoneCount()).toBe(0)
  })

  it('getNextTask returns the first unfinished task', () => {
    const tasks = getSchrijfTasks()
    expect(getNextTask()?.id).toBe(tasks[0].id)
    markTaskDone(tasks[0].id)
    expect(getNextTask()?.id).toBe(tasks[1].id)
  })
})

describe('drafts', () => {
  // Writing is effortful; a half-finished answer must survive a reload.
  it('round-trips a draft per task', () => {
    saveDraft('schrijven-004', 'Hallo buurvrouw,')
    expect(getDraft('schrijven-004')).toBe('Hallo buurvrouw,')
    expect(getDraft('schrijven-005')).toBe('')
  })

  it('clears a draft when the text is emptied', () => {
    saveDraft('schrijven-004', 'iets')
    saveDraft('schrijven-004', '   ')
    expect(getDraft('schrijven-004')).toBe('')
  })

  it('survives malformed storage', () => {
    localStorage.setItem('dutch-schrijven-drafts', '[]')
    expect(getDraft('schrijven-004')).toBe('')
  })
})

describe('length helpers', () => {
  it('counts sentences across terminators and blank lines', () => {
    expect(countSentences('')).toBe(0)
    expect(countSentences('Ik woon hier.')).toBe(1)
    expect(countSentences('Ik woon hier. Het is leuk! Kom je?')).toBe(3)
    // A note written as separate blocks still counts.
    expect(countSentences('Hallo\n\nIk ben weg\n\nGroetjes')).toBe(3)
  })

  it('counts words', () => {
    expect(countWords('')).toBe(0)
    expect(countWords('  Ik  woon hier ')).toBe(3)
  })

  it('judges whether a writing task is long enough', () => {
    const email = getSchrijfTasks().find((t) => t.type === 'email')!
    expect(isLongEnough(email, 'Te kort.')).toBe(false)
    expect(
      isLongEnough(email, 'Een. Twee. Drie. Vier. Vijf.'),
    ).toBe(true)
  })

  it('judges a form by words, since a form has no sentences', () => {
    const form = getSchrijfTasks().find((t) => t.type === 'formulier')!
    expect(isLongEnough(form, 'Jan')).toBe(false)
    expect(isLongEnough(form, 'Jan Jansen 03-01-1990 Amsterdam 1015CJ')).toBe(true)
  })
})
