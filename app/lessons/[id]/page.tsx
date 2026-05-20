import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getLessonById, getAllLessons } from '@/lib/lessons'
import { PhraseCard } from '@/components/phrase-card'
import { SkillBreakdown } from '@/components/skill-breakdown'
import { LessonCompleteButton } from './complete-button'

interface LessonPageProps {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return getAllLessons().map((lesson) => ({ id: lesson.id }))
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params
  const lesson = getLessonById(id)

  if (!lesson) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-orange-600 hover:text-orange-700">
          ← Back to lessons
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{lesson.title}</h1>
      </div>

      <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
        <p className="text-sm font-medium text-orange-700 mb-1">The Situation</p>
        <p className="text-gray-800">{lesson.situation}</p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Key Phrases</h2>
        <div className="space-y-2">
          {lesson.phrases.map((phrase, index) => (
            <PhraseCard key={index} phrase={phrase} index={index} />
          ))}
        </div>
      </div>

      {lesson.grammar_notes.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Grammar Notes</h2>
          <ul className="space-y-2">
            {lesson.grammar_notes.map((note, index) => (
              <li key={index} className="flex gap-2 text-sm text-gray-700">
                <span className="text-orange-400">•</span>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {lesson.culture_notes.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Culture Tips</h2>
          <ul className="space-y-2">
            {lesson.culture_notes.map((note, index) => (
              <li key={index} className="flex gap-2 text-sm text-gray-700">
                <span className="text-amber-500">💡</span>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Skills You&apos;re Learning</h2>
        <div className="space-y-2">
          {lesson.skill_breakdown.map((skill, index) => (
            <SkillBreakdown key={index} skill={skill} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
        <Link
          href={`/practice/${lesson.id}`}
          className="block w-full text-center py-3 px-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
        >
          Practice This Lesson →
        </Link>
        <LessonCompleteButton lessonId={lesson.id} />
      </div>
    </div>
  )
}
