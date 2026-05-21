'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { getAnyLessonById } from '@/lib/lessons'
import { LessonFlow } from '@/components/lesson-flow/lesson-flow'

interface LessonPageProps {
  params: Promise<{ id: string }>
}

export default function LessonPage({ params }: LessonPageProps) {
  const { id } = use(params)
  const lesson = getAnyLessonById(id)

  if (!lesson) {
    notFound()
  }

  return <LessonFlow lesson={lesson} />
}
