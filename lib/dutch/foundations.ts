import { Lesson } from '@/types/lesson'

import numbers from '@/content/dutch/foundations/01-numbers.json'
import pronunciation from '@/content/dutch/foundations/02-pronunciation.json'
import presentTense from '@/content/dutch/foundations/03-present-tense.json'
import deHet from '@/content/dutch/foundations/04-de-het.json'
import wordOrder from '@/content/dutch/foundations/05-word-order.json'
import pastTense from '@/content/dutch/foundations/06-past-tense.json'
import modals from '@/content/dutch/foundations/07-modals.json'

const foundations: Lesson[] = [
  numbers,
  pronunciation,
  presentTense,
  deHet,
  wordOrder,
  pastTense,
  modals,
] as Lesson[]

export function getDutchFoundations(): Lesson[] {
  return foundations
}

export function getDutchFoundationById(id: string): Lesson | undefined {
  return foundations.find((lesson) => lesson.id === id)
}
