import { Lesson } from '@/types/lesson'

import pronounsZijnHebben from '@/content/dutch/foundations/08-pronouns-zijn-hebben.json'
import numbers from '@/content/dutch/foundations/01-numbers.json'
import pronunciation from '@/content/dutch/foundations/02-pronunciation.json'
import presentTense from '@/content/dutch/foundations/03-present-tense.json'
import questions from '@/content/dutch/foundations/09-questions.json'
import negation from '@/content/dutch/foundations/10-negation.json'
import simpleSentences from '@/content/dutch/foundations/11-simple-sentences.json'
import deHet from '@/content/dutch/foundations/04-de-het.json'
import wordOrder from '@/content/dutch/foundations/05-word-order.json'
import pastTense from '@/content/dutch/foundations/06-past-tense.json'
import modals from '@/content/dutch/foundations/07-modals.json'

// Ordered ground-up: key verbs + pronouns first, then numbers/sounds/present
// tense, then questions/negation/simple sentences, then de-het and the A2 grammar.
const foundations: Lesson[] = [
  pronounsZijnHebben,
  numbers,
  pronunciation,
  presentTense,
  questions,
  negation,
  simpleSentences,
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
