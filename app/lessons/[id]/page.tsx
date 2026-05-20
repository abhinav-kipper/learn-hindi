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
    <div className="space-y-8">
      <div>
        <Link href="/" className="text-sm text-indigo-500 hover:text-indigo-600 font-medium transition-colors">
          ← Back to lessons
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-3 tracking-tight">{lesson.title}</h1>
      </div>

      <div className="p-5 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100">
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1.5">The Situation</p>
        <p className="text-slate-700 leading-relaxed">{lesson.situation}</p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Key Phrases</h2>
        <div className="space-y-2.5">
          {lesson.phrases.map((phrase, index) => (
            <PhraseCard key={index} phrase={phrase} index={index} />
          ))}
        </div>
      </div>

      {lesson.grammar_notes.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-3">Grammar Notes</h2>
          <ul className="space-y-2.5">
            {lesson.grammar_notes.map((note, index) => (
              <li key={index} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                <span className="text-indigo-400 font-bold mt-0.5">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {lesson.culture_notes.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-3">Culture Tips</h2>
          <ul className="space-y-2.5">
            {lesson.culture_notes.map((note, index) => (
              <li key={index} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                <span className="mt-0.5">💡</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3">Skills You&apos;re Learning</h2>
        <div className="space-y-2.5">
          {lesson.skill_breakdown.map((skill, index) => (
            <SkillBreakdown key={index} skill={skill} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-6 border-t border-slate-200">
        <Link
          href={`/practice/${lesson.id}`}
          className="block w-full text-center py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-2xl hover:from-indigo-600 hover:to-violet-600 transition-all duration-200 shadow-md shadow-indigo-200"
        >
          Practice This Lesson →
        </Link>
        <LessonCompleteButton lessonId={lesson.id} />
      </div>
    </div>
  )
}
