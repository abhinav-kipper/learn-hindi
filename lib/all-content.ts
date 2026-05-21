import { Lesson } from '@/types/lesson'
import { getAnyLessonById as getHindiAnyLessonById } from '@/lib/lessons'
import { getDutchAnyLessonById } from '@/lib/dutch/lessons'

/** Look up a lesson by ID across all languages */
export function getUniversalLessonById(id: string): Lesson | undefined {
  return getHindiAnyLessonById(id) || getDutchAnyLessonById(id)
}
