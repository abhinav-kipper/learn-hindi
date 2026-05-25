'use client'

import { use, useMemo } from 'react'
import { notFound } from 'next/navigation'
import { getAllLessons } from '@/lib/lessons'
import { getAllFoundations } from '@/lib/foundations'
import { getDutchLessons } from '@/lib/dutch/lessons'
import { getDutchFoundations } from '@/lib/dutch/foundations'
import { getUniversalLessonById } from '@/lib/all-content'
import { LessonChaiGalli } from '@/components/design/LessonChaiGalli'
import { useLanguage } from '@/lib/language-context'

interface LessonPageProps {
  params: Promise<{ id: string }>
}

export default function LessonPage({ params }: LessonPageProps) {
  const { id } = use(params)
  const { language } = useLanguage()
  const lesson = getUniversalLessonById(id)

  // Resolve a 1-based chapter number + kind (situations vs foundations) within
  // the language's content lists. Used by the header tag.
  const { chapterNumber, kind } = useMemo<{
    chapterNumber: number
    kind: 'situations' | 'foundations'
  }>(() => {
    if (!lesson) return { chapterNumber: 1, kind: 'situations' }
    const situations = language === 'dutch' ? getDutchLessons() : getAllLessons()
    const sIdx = situations.findIndex((l) => l.id === lesson.id)
    if (sIdx >= 0) return { chapterNumber: sIdx + 1, kind: 'situations' }
    const foundations = language === 'dutch' ? getDutchFoundations() : getAllFoundations()
    const fIdx = foundations.findIndex((l) => l.id === lesson.id)
    if (fIdx >= 0) return { chapterNumber: fIdx + 1, kind: 'foundations' }
    return { chapterNumber: 1, kind: 'situations' }
  }, [lesson, language])

  if (!lesson) {
    notFound()
  }

  return <LessonChaiGalli lesson={lesson} chapterNumber={chapterNumber} kind={kind} />
}
