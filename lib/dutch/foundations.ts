import { Lesson } from '@/types/lesson'

import pronounsZijnHebben from '@/content/dutch/foundations/08-pronouns-zijn-hebben.json'
import numbers from '@/content/dutch/foundations/01-numbers.json'
import pronunciation from '@/content/dutch/foundations/02-pronunciation.json'
import presentTense from '@/content/dutch/foundations/03-present-tense.json'
import questions from '@/content/dutch/foundations/09-questions.json'
import negation from '@/content/dutch/foundations/10-negation.json'
import simpleSentences from '@/content/dutch/foundations/11-simple-sentences.json'
import deHet from '@/content/dutch/foundations/04-de-het.json'
import plurals from '@/content/dutch/foundations/15-plurals.json'
import wordOrder from '@/content/dutch/foundations/05-word-order.json'
import connectors from '@/content/dutch/foundations/12-connectors.json'
import pastTense from '@/content/dutch/foundations/06-past-tense.json'
import future from '@/content/dutch/foundations/13-future.json'
import modals from '@/content/dutch/foundations/07-modals.json'
import reflexiveVerbs from '@/content/dutch/foundations/17-reflexive-verbs.json'
import comparatives from '@/content/dutch/foundations/14-comparatives.json'
import prepositions from '@/content/dutch/foundations/16-prepositions.json'
import er from '@/content/dutch/foundations/18-er.json'

// Ordered ground-up. A1 first: key verbs + pronouns, then numbers/sounds/present
// tense, then questions/negation/simple sentences, then de-het and plurals
// (plurals follows de-het because the de/het chapter leans on "every plural is
// a de-word"). Then the A2 grammar: word order, connectors, past, future,
// modals, reflexive verbs, comparatives, and finally prepositions and `er`.
// Prepositions must come before `er`, since you cannot build `ermee` without
// knowing which preposition the verb takes.
const foundations: Lesson[] = [
  pronounsZijnHebben,
  numbers,
  pronunciation,
  presentTense,
  questions,
  negation,
  simpleSentences,
  deHet,
  plurals,
  wordOrder,
  connectors,
  pastTense,
  future,
  modals,
  reflexiveVerbs,
  comparatives,
  prepositions,
  er,
] as Lesson[]

export function getDutchFoundations(): Lesson[] {
  return foundations
}

export function getDutchFoundationById(id: string): Lesson | undefined {
  return foundations.find((lesson) => lesson.id === id)
}
