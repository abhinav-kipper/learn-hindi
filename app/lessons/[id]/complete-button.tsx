'use client'

import { useState, useEffect } from 'react'
import { markLessonComplete, isLessonComplete } from '@/lib/progress'

interface LessonCompleteButtonProps {
  lessonId: string
}

export function LessonCompleteButton({ lessonId }: LessonCompleteButtonProps) {
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    setCompleted(isLessonComplete(lessonId))
  }, [lessonId])

  const handleComplete = () => {
    markLessonComplete(lessonId)
    setCompleted(true)
  }

  if (completed) {
    return (
      <div className="text-center py-2 text-green-600 font-medium text-sm">
        ✓ Lesson completed
      </div>
    )
  }

  return (
    <button
      onClick={handleComplete}
      className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
    >
      Mark as Complete
    </button>
  )
}
