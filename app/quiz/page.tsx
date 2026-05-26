'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { generateQuiz, saveQuizScore } from '@/lib/quiz'
import { getProgress, getStreak, getSeenStreakMilestones, markStreakMilestoneSeen, updateStreak } from '@/lib/progress'
import { addMistake } from '@/lib/mistakes'
import { QuizQuestion, QuizResult } from '@/types/quiz'
import { QuizCard } from '@/components/quiz/quiz-card'
import { QuizResults } from '@/components/quiz/quiz-results'
import { FeatureTooltip } from '@/components/feature-tooltip'
import { playSound } from '@/lib/sounds'
import { useLanguage } from '@/lib/language-context'
import { useChaina, canFire, markFired } from '@/components/design'
import {
  Tag,
  Cutting,
  DottedBg,
  COLORS,
  FONTS,
  BORDER,
  SHADOW,
} from '@/components/design'
const W = '#fff' // @design-allow: white literal

export default function QuizPage() {
  const router = useRouter()
  const { language, config } = useLanguage()
  const { play } = useChaina()
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [results, setResults] = useState<QuizResult[]>([])
  const [quizComplete, setQuizComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [locked, setLocked] = useState(false)

  const startQuiz = useCallback(() => {
    const progress = getProgress(config.storagePrefix)
    if (progress.completedLessons.length === 0) {
      setLocked(true)
      setLoading(false)
      return
    }
    const generated = generateQuiz(progress.completedLessons, 10, language)
    setQuestions(generated)
    setCurrentIndex(0)
    setSelectedAnswerId(null)
    setShowResult(false)
    setResults([])
    setQuizComplete(false)
    setLoading(false)
  }, [language, config.storagePrefix])

  useEffect(() => {
    startQuiz()
  }, [startQuiz])

  const handleSelectAnswer = (answerId: string) => {
    if (showResult) return
    setSelectedAnswerId(answerId)
    setShowResult(true)

    const question = questions[currentIndex]
    const selectedAnswer = question.answers.find((a) => a.id === answerId)
    const isCorrect = selectedAnswer?.isCorrect ?? false

    if (isCorrect) {
      playSound('correct')
      play('correctAnswer')
    } else {
      playSound('wrong')
      play('wrongAnswer')
      const correctAnswer = question.answers.find((a) => a.isCorrect)
      if (selectedAnswer && correctAnswer) {
        addMistake(
          {
            original: selectedAnswer.text,
            correction: correctAnswer.text,
            reason: `Quiz prompt: ${question.prompt}`,
          },
          question.lessonId,
          config.storagePrefix,
          'quiz',
        )
        if (canFire('firstMistake', 'once-per-day')) {
          play('firstMistake')
          markFired('firstMistake', 'once-per-day')
        }
      }
    }

    const result: QuizResult = {
      questionId: question.id,
      selectedAnswerId: answerId,
      isCorrect,
    }
    setResults((prev) => [...prev, result])

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1)
        setSelectedAnswerId(null)
        setShowResult(false)
      } else {
        const allResults = [...results, result]
        const finalScore = allResults.filter((r) => r.isCorrect).length
        const progress = getProgress(config.storagePrefix)
        saveQuizScore(finalScore, questions.length, progress.completedLessons, config.storagePrefix)
        updateStreak(config.storagePrefix)
        const newStreak = getStreak(config.storagePrefix)
        const milestones = [7, 14, 30, 50, 100]
        if (
          milestones.includes(newStreak) &&
          !getSeenStreakMilestones(config.storagePrefix).includes(newStreak)
        ) {
          play('streakMilestone')
          markStreakMilestoneSeen(newStreak, config.storagePrefix)
        }
        setQuizComplete(true)
        if (finalScore >= questions.length / 2) {
          playSound('complete')
        }
      }
    }, 1200)
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: COLORS.lav,
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 99,
            border: `3px solid ${COLORS.ink}`, // @design-allow: CSS spinner ring, not a sticker surface
            borderTopColor: 'transparent',
          }}
        />
      </div>
    )
  }

  if (locked) {
    return (
      <LockedScreen
        title="quiz locked"
        body="complete your first lesson to unlock quizzes!"
        onGo={() => router.push('/')}
      />
    )
  }

  if (questions.length === 0) {
    return (
      <LockedScreen
        title="no questions yet"
        body="complete a lesson first to take a quiz!"
        onGo={() => router.push('/')}
      />
    )
  }

  const score = results.filter((r) => r.isCorrect).length

  if (quizComplete) {
    return (
      <QuizResults
        score={score}
        total={questions.length}
        onTryAgain={startQuiz}
        onGoHome={() => router.push('/')}
        questions={questions}
        results={results}
      />
    )
  }

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', background: COLORS.lav, paddingBottom: 100 }}>
      <DottedBg />

      {/* HEADER BAND */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        style={{
          position: 'relative',
          padding: '50px 20px 18px',
          background: COLORS.mint,
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
          borderBottom: BORDER.sticker,
          boxShadow: SHADOW.headerBand,
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            maxWidth: 480,
            margin: '0 auto',
          }}
        >
          <button
            type="button"
            onClick={() => {
              playSound('tap')
              router.push('/')
            }}
            aria-label="Close quiz"
            style={{
              width: 40,
              height: 40,
              borderRadius: 99,
              background: W,
              border: BORDER.sticker,
              boxShadow: SHADOW.chip,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: COLORS.ink,
              padding: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div style={{ marginRight: -6, marginTop: -6 }}>
            <Cutting
              size={66}
              mood={showResult && results[results.length - 1]?.isCorrect ? 'happy' : 'idle'}
            />
          </div>
        </div>

        <div style={{ marginTop: 10, maxWidth: 480, margin: '10px auto 0' }}>
          <Tag>quiz · level a1</Tag>
          <div
            style={{
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 28,
              color: COLORS.ink,
              lineHeight: 1.05,
              marginTop: 6,
              letterSpacing: -0.5,
            }}
          >
            quick check
          </div>
        </div>
      </motion.div>

      {/* PROGRESS DOTS — one segment per question */}
      <FeatureTooltip
        id="quiz"
        message="Test what you've learned! 10 questions from completed lessons."
        position="bottom"
      >
        <div
          style={{
            padding: '14px 20px 0',
            display: 'flex',
            gap: 4,
            position: 'relative',
            zIndex: 2,
            maxWidth: 480,
            margin: '0 auto',
          }}
        >
          {questions.map((_, i) => {
            const past = i < currentIndex
            const current = i === currentIndex
            return (
              <div
                key={i}
                style={{
                  height: 8,
                  flex: current ? 2 : 1,
                  borderRadius: 99,
                  background: past
                    ? results[i]?.isCorrect
                      ? COLORS.green
                      : COLORS.red
                    : current
                    ? COLORS.orange
                    : W,
                  border: BORDER.thin,
                  transition: 'all 0.3s',
                }}
              />
            )
          })}
        </div>
      </FeatureTooltip>

      {/* QUESTION CARD */}
      <div
        style={{
          padding: '18px 20px 0',
          position: 'relative',
          zIndex: 2,
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        <AnimatePresence mode="wait">
          <QuizCard
            key={questions[currentIndex].id}
            question={questions[currentIndex]}
            selectedAnswerId={selectedAnswerId}
            onSelectAnswer={handleSelectAnswer}
            showResult={showResult}
            index={currentIndex}
            total={questions.length}
          />
        </AnimatePresence>
      </div>
    </div>
  )
}

function LockedScreen({ title, body, onGo }: { title: string; body: string; onGo: () => void }) {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100dvh',
        background: COLORS.lav,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <DottedBg />
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 320 }}>
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
          <Cutting size={120} />
        </div>
        <Tag>locked</Tag>
        <div
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 24,
            color: COLORS.ink,
            marginTop: 10,
            lineHeight: 1.1,
            letterSpacing: -0.4,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: FONTS.body,
            fontWeight: 700,
            fontSize: 13,
            color: COLORS.ink60,
            marginTop: 8,
          }}
        >
          {body}
        </div>
        <button
          type="button"
          onClick={onGo}
          style={{
            marginTop: 20,
            padding: '14px 24px',
            borderRadius: 22,
            background: COLORS.orange,
            color: W,
            border: BORDER.sticker,
            boxShadow: SHADOW.sticker,
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
            textTransform: 'lowercase',
          }}
        >
          go to lessons →
        </button>
      </div>
    </div>
  )
}
