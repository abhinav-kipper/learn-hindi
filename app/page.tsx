import { getAllLessons } from '@/lib/lessons'
import { LessonCard } from '@/components/lesson-card'
import { StreakCounter } from '@/components/streak-counter'

export default function Home() {
  const lessons = getAllLessons()

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bolna Seekho</h1>
          <p className="text-sm text-slate-500 mt-1">Learn to speak Hindi naturally</p>
        </div>
        <StreakCounter />
      </div>

      <div className="h-[calc(100dvh-140px)] overflow-y-auto snap-y snap-mandatory space-y-4 pb-8 scrollbar-hide">
        {lessons.map((lesson, index) => (
          <div key={lesson.id} className="snap-start">
            <LessonCard lesson={lesson} index={index} />
          </div>
        ))}
      </div>
    </div>
  )
}
