'use client'

import { motion } from 'framer-motion'
import { QuizQuestion } from '@/types/quiz'

interface QuizCardProps {
  question: QuizQuestion
  selectedAnswerId: string | null
  onSelectAnswer: (answerId: string) => void
  showResult: boolean
}

export function QuizCard({ question, selectedAnswerId, onSelectAnswer, showResult }: QuizCardProps) {
  const typeLabels: Record<string, string> = {
    'translate-to-english': 'Translate to English',
    'translate-to-hindi': 'Translate to Hindi',
    'fill-in-blank': 'Fill in the Blank',
    'context-match': 'Context Match',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Question type badge */}
      <div className="mb-4">
        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          {typeLabels[question.type]}
        </span>
      </div>

      {/* Question prompt */}
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-slate-900 leading-tight">
          {question.prompt}
        </h2>
        {question.subPrompt && (
          <p className="text-sm text-slate-500 mt-2">{question.subPrompt}</p>
        )}
      </div>

      {/* Answer options */}
      <div className="space-y-3 mt-6">
        {question.answers.map((answer) => {
          let bgClass = 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
          let textClass = 'text-slate-800'

          if (showResult && answer.isCorrect) {
            bgClass = 'bg-emerald-50 border-emerald-400'
            textClass = 'text-emerald-800'
          } else if (showResult && selectedAnswerId === answer.id && !answer.isCorrect) {
            bgClass = 'bg-red-50 border-red-400'
            textClass = 'text-red-800'
          } else if (selectedAnswerId === answer.id && !showResult) {
            bgClass = 'bg-indigo-50 border-indigo-400'
            textClass = 'text-indigo-800'
          }

          return (
            <motion.button
              key={answer.id}
              whileTap={!showResult ? { scale: 0.98 } : undefined}
              animate={showResult && selectedAnswerId === answer.id && !answer.isCorrect ? {
                x: [0, -8, 8, -8, 8, 0],
              } : undefined}
              transition={{ duration: 0.4 }}
              onClick={() => !showResult && onSelectAnswer(answer.id)}
              disabled={showResult}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${bgClass}`}
            >
              <span className={`text-base font-medium ${textClass}`}>
                {answer.text}
              </span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
