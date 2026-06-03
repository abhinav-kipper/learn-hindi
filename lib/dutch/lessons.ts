import { Lesson } from '@/types/lesson'
import { getDutchFoundationById, getDutchFoundations } from '@/lib/dutch/foundations'

import firstWords from '@/content/dutch/lessons/12-first-words.json'
import smallTalk from '@/content/dutch/lessons/13-small-talk.json'
import familyHome from '@/content/dutch/lessons/14-family-home.json'
import dailyRoutine from '@/content/dutch/lessons/15-daily-routine.json'
import makingPlans from '@/content/dutch/lessons/16-making-plans.json'
import askingDirections from '@/content/dutch/lessons/17-asking-directions.json'
import phoneBasics from '@/content/dutch/lessons/19-phone-basics.json'
import supermarket from '@/content/dutch/lessons/01-supermarket.json'
import introductions from '@/content/dutch/lessons/02-introductions.json'
import cafe from '@/content/dutch/lessons/03-cafe.json'
import restaurant from '@/content/dutch/lessons/18-restaurant.json'
import doctor from '@/content/dutch/lessons/04-doctor.json'
import transport from '@/content/dutch/lessons/05-transport.json'
import gemeente from '@/content/dutch/lessons/06-gemeente.json'
import housingProblem from '@/content/dutch/lessons/07-housing-problem.json'
import bank from '@/content/dutch/lessons/08-bank.json'
import huisartsCall from '@/content/dutch/lessons/09-huisarts-call.json'
import jobInterview from '@/content/dutch/lessons/10-job-interview.json'
import primarySchool from '@/content/dutch/lessons/11-primary-school.json'

// Ground-up first: survival phrases + everyday social chats, then the original
// errand scenarios, then the A2/B1 exam-targeted lessons.
const lessons: Lesson[] = [
  firstWords,
  smallTalk,
  familyHome,
  dailyRoutine,
  makingPlans,
  askingDirections,
  phoneBasics,
  supermarket,
  introductions,
  cafe,
  restaurant,
  doctor,
  transport,
  gemeente,
  housingProblem,
  bank,
  huisartsCall,
  jobInterview,
  primarySchool,
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
