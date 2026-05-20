'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Lesson } from '@/types/lesson'
import { isLessonComplete } from '@/lib/progress'

interface LessonCardProps {
  lesson: Lesson
  index: number
}

export function LessonCard({ lesson, index }: LessonCardProps) {
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    setCompleted(isLessonComplete(lesson.id))
  }, [lesson.id])

  return (
    <Link href={`/lessons/${lesson.id}`}>
      <div className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
        completed
          ? 'border-green-300 bg-green-50'
          : 'border-orange-200 bg-white hover:border-orange-400'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-orange-500">
                Lesson {index + 1}
              </span>
              {completed && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Done
                </span>
              )}
            </div>
            <h3 className="font-bold text-gray-900 mt-1">{lesson.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{lesson.situation}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {lesson.skills.map((skill) => (
            <span
              key={skill}
              className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
