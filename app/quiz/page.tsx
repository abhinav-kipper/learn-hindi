'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { generateQuiz, saveQuizScore } from '@/lib/quiz'
import { getProgress, updateStreak } from '@/lib/progress'
import { QuizQuestion, QuizResult } from '@/types/quiz'
import { QuizCard } from '@/components/quiz/quiz-card'
import { QuizResults } from '@/components/quiz/quiz-results'
import { FeatureTooltip } from '@/components/feature-tooltip'
import { playSound } from '@/lib/sounds'

export default function QuizPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [results, setResults] = useState<QuizResult[]>([])
  const [quizComplete, setQuizComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [locked, setLocked] = useState(false)

  const startQuiz = useCallback(() => {
    const progress = getProgress()

    if (progress.completedLessons.length === 0) {
      setLocked(true)
      setLoading(false)
      return
    }

    const lessonIds = progress.completedLessons
    const generated = generateQuiz(lessonIds, 10)
    setQuestions(generated)
    setCurrentIndex(0)
    setSelectedAnswerId(null)
    setShowResult(false)
    setResults([])
    setQuizComplete(false)
    setLoading(false)
  }, [])

  useEffect(() => {
    startQuiz()
  }, [startQuiz])

  const handleSelectAnswer = (answerId: string) => {
    if (showResult) return
    setSelectedAnswerId(answerId)
    setShowResult(true)

    const question = questions[currentIndex]
    const isCorrect = question.answers.find(a => a.id === answerId)?.isCorrect ?? false

    // Play sound based on answer
    if (isCorrect) {
      playSound('correct')
    } else {
      playSound('wrong')
    }

    const result: QuizResult = {
      questionId: question.id,
      selectedAnswerId: answerId,
      isCorrect,
    }
    setResults(prev => [...prev, result])

    // Auto-advance after delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1)
        setSelectedAnswerId(null)
        setShowResult(false)
      } else {
        // Quiz complete
        const allResults = [...results, result]
        const score = allResults.filter(r => r.isCorrect).length
        const progress = getProgress()
        const lessonIds = progress.completedLessons
        saveQuizScore(score, questions.length, lessonIds)
        updateStreak()
        setQuizComplete(true)
        // Play complete sound if good score (50%+)
        if (score >= questions.length / 2) {
          playSound('complete')
        }
      }
    }, 1200)
  }

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (locked) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Quiz Locked</h2>
        <p className="text-base text-slate-600 text-center mb-6">Complete your first lesson to unlock quizzes!</p>
        <button
          onClick={() => router.push('/')}
          className="py-3 px-6 bg-indigo-600 text-white font-semibold rounded-xl"
        >
          Go to Lessons
        </button>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <p className="text-lg text-slate-600 text-center mb-4">Complete a lesson first to take a quiz!</p>
        <button
          onClick={() => router.push('/')}
          className="py-3 px-6 bg-indigo-600 text-white font-semibold rounded-xl"
        >
          Go to Lessons
        </button>
      </div>
    )
  }

  const score = results.filter(r => r.isCorrect).length

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 safe-top safe-bottom">
      {!quizComplete && (
        <>
          {/* Progress bar */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => router.push('/')}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                &times; Close
              </button>
              <span className="text-sm font-medium text-slate-600">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>
            <FeatureTooltip
              id="quiz"
              message="Test what you've learned! 10 questions from completed lessons."
              position="bottom"
            >
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </FeatureTooltip>
          </div>

          {/* Question */}
          <div className="flex-1 flex items-center justify-center px-4 py-6">
            <AnimatePresence mode="wait">
              <QuizCard
                key={questions[currentIndex].id}
                question={questions[currentIndex]}
                selectedAnswerId={selectedAnswerId}
                onSelectAnswer={handleSelectAnswer}
                showResult={showResult}
              />
            </AnimatePresence>
          </div>
        </>
      )}

      {quizComplete && (
        <div className="flex-1 flex items-center justify-center">
          <QuizResults
            score={score}
            total={questions.length}
            onTryAgain={startQuiz}
            onGoHome={() => router.push('/')}
          />
        </div>
      )}
    </div>
  )
}
