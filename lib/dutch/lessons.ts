import { Lesson } from '@/types/lesson'
import { getDutchFoundationById, getDutchFoundations } from '@/lib/dutch/foundations'

import supermarket from '@/content/dutch/lessons/01-supermarket.json'
import introductions from '@/content/dutch/lessons/02-introductions.json'
import cafe from '@/content/dutch/lessons/03-cafe.json'
import doctor from '@/content/dutch/lessons/04-doctor.json'
import transport from '@/content/dutch/lessons/05-transport.json'

const lessons: Lesson[] = [
  supermarket,
  introductions,
  cafe,
  doctor,
  transport,
] as Lesson[]

export function getDutchLessons(): Lesson[] {
  return lessons
}

export function getDutchLessonById(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id)
}

/** Get any Dutch lesson by ID — checks both situations and foundations */
export function getDutchAnyLessonById(id: string): Lesson | undefined {
  return getDutchLessonById(id) || getDutchFoundationById(id)
}

/** Get all Dutch content — situations + foundations combined */
export function getDutchAllContent(): Lesson[] {
  return [...lessons, ...getDutchFoundations()]
}
