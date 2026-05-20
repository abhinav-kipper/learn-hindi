import { Lesson } from '@/types/lesson'

import greetings from '@/content/lessons/01-greetings.json'
import autoNegotiation from '@/content/lessons/02-auto-negotiation.json'
import orderingFood from '@/content/lessons/03-ordering-food.json'
import expressingOpinions from '@/content/lessons/04-expressing-opinions.json'
import makingPlans from '@/content/lessons/05-making-plans.json'
import givingDirections from '@/content/lessons/06-giving-directions.json'

const lessons: Lesson[] = [
  greetings,
  autoNegotiation,
  orderingFood,
  expressingOpinions,
  makingPlans,
  givingDirections,
] as Lesson[]

export function getAllLessons(): Lesson[] {
  return lessons
}

export function getLessonById(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id)
}

export function getLessonIds(): string[] {
  return lessons.map((lesson) => lesson.id)
}
