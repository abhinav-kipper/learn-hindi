import { getAllLessons } from '@/lib/lessons'
import { LessonCard } from '@/components/lesson-card'
import { StreakCounter } from '@/components/streak-counter'

export default function Home() {
  const lessons = getAllLessons()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bolna Seekho</h1>
          <p className="text-sm text-slate-500 mt-1">Learn to speak Hindi naturally</p>
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
