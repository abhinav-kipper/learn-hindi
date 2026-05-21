import { describe, it, expect, beforeEach } from 'vitest'
import { computeLessonResume, markPhraseViewed } from '@/lib/phrase-progress'
import { markLessonComplete } from '@/lib/progress'
import type { Lesson } from '@/types/lesson'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

function fakeLesson(id: string, phraseCount: number): Lesson {
  return {
    id,
    title: 'T',
    situation: 's',
    skills: [],
    practice_prompt: '',
    grammar_notes: [],
    culture_notes: [],
    skill_breakdown: [],
    phrases: Array.from({ length: phraseCount }, (_, i) => ({
      hindi: `h${i}`, english: `e${i}`, pronunciation: 'p', context: 'c',
    })),
  } as Lesson
}

describe('computeLessonResume', () => {
  beforeEach(() => localStorage.clear())

  it('starts fresh on an untouched lesson', () => {
    const lesson = fakeLesson('greetings', 5)
    expect(computeLessonResume(lesson, 'hindi')).toEqual({ sectionIndex: 0, phraseIndex: 0 })
  })

  it('starts fresh on a completed lesson (user is reviewing)', () => {
    const lesson = fakeLesson('greetings', 5)
    markPhraseViewed('greetings', 4, 'hindi')
    markLessonComplete('greetings', 'hindi')
    expect(computeLessonResume(lesson, 'hindi')).toEqual({ sectionIndex: 0, phraseIndex: 0 })
  })

  it('resumes on Phrases at the last-viewed index', () => {
    const lesson = fakeLesson('greetings', 5)
    markPhraseViewed('greetings', 0, 'hindi')
    markPhraseViewed('greetings', 1, 'hindi')
    markPhraseViewed('greetings', 2, 'hindi')
    expect(computeLessonResume(lesson, 'hindi')).toEqual({ sectionIndex: 1, phraseIndex: 2 })
  })

  it('handles out-of-order viewed indices (max wins)', () => {
    const lesson = fakeLesson('greetings', 5)
    markPhraseViewed('greetings', 3, 'hindi')
    markPhraseViewed('greetings', 0, 'hindi')
    markPhraseViewed('greetings', 1, 'hindi')
    expect(computeLessonResume(lesson, 'hindi').phraseIndex).toBe(3)
  })

  it('jumps to CTA when every phrase has been viewed but lesson is not marked complete', () => {
    const lesson = fakeLesson('greetings', 3)
    markPhraseViewed('greetings', 0, 'hindi')
    markPhraseViewed('greetings', 1, 'hindi')
    markPhraseViewed('greetings', 2, 'hindi')
    expect(computeLessonResume(lesson, 'hindi')).toEqual({ sectionIndex: 2, phraseIndex: 2 })
  })

  it('respects the language prefix — Dutch resume reads from dutch-phrase-progress', () => {
    const lesson = fakeLesson('dutch-cafe', 4)
    markPhraseViewed('dutch-cafe', 2, 'dutch')
    // Hindi: untouched
    expect(computeLessonResume(lesson, 'hindi')).toEqual({ sectionIndex: 0, phraseIndex: 0 })
    // Dutch: resume on phrase 2
    expect(computeLessonResume(lesson, 'dutch')).toEqual({ sectionIndex: 1, phraseIndex: 2 })
  })

  it('handles a lesson with no phrases (edge case)', () => {
    const lesson = fakeLesson('empty', 0)
    expect(computeLessonResume(lesson, 'hindi')).toEqual({ sectionIndex: 0, phraseIndex: 0 })
  })
})
