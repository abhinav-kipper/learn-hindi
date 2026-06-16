import { Lesson } from '@/types/lesson'

import numbers from '@/content/foundations/01-numbers.json'
import presentTense from '@/content/foundations/02-present-tense.json'
import pastTense from '@/content/foundations/03-past-tense.json'
import futureTense from '@/content/foundations/04-future-tense.json'
import postpositions from '@/content/foundations/05-postpositions.json'
import pronounsVerbs from '@/content/foundations/06-pronouns-verbs.json'
import nounGender from '@/content/foundations/07-noun-gender.json'
import compoundVerbs from '@/content/foundations/08-compound-verbs.json'
import neRule from '@/content/foundations/09-ne-rule.json'
import adjectives from '@/content/foundations/10-adjectives.json'

const foundations: Lesson[] = [
  numbers,
  presentTense,
  pastTense,
  futureTense,
  postpositions,
  pronounsVerbs,
  nounGender,
  compoundVerbs,
  neRule,
  adjectives,
] as Lesson[]

export function getAllFoundations(): Lesson[] {
  return foundations
}

export function getFoundationById(id: string): Lesson | undefined {
  return foundations.find((lesson) => lesson.id === id)
}

export function getFoundationIds(): string[] {
  return foundations.map((lesson) => lesson.id)
}
