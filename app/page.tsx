import { getAllLessons } from '@/lib/lessons'
import { LessonCard } from '@/components/lesson-card'
import { StreakCounter } from '@/components/streak-counter'

export default function Home() {
  const lessons = getAllLessons()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bolna Seekho</h1>
          <p className="text-sm text-gray-500">Learn to speak Hindi naturally</p>
        </div>
        <StreakCounter />
      </div>

      <div className="space-y-3">
        {lessons.map((lesson, index) => (
          <LessonCard key={lesson.id} lesson={lesson} index={index} />
        ))}
      </div>
    </div>
  )
}
