'use client'

import { motion } from 'framer-motion'
import { QuizQuestion } from '@/types/quiz'
import { speak } from '@/lib/speech'
import { useLanguage } from '@/lib/language-context'
import { playSound } from '@/lib/sounds'
import { Sticker, Tag, COLORS, FONTS, BORDER, SHADOW } from '@/components/design'
const W = '#fff' // @design-allow: white literal

interface QuizCardProps {
  question: QuizQuestion
  selectedAnswerId: string | null
  onSelectAnswer: (answerId: string) => void
  showResult: boolean
  index: number
  total: number
}

const PASTELS = [COLORS.peach2, COLORS.mint2, COLORS.butter, COLORS.lav2]
const LETTERS = ['A', 'B', 'C', 'D']

const TYPE_LABELS: Record<string, string> = {
  'translate-to-english': 'translate to english',
  'translate-to-hindi': 'translate to hindi',
  'fill-in-blank': 'fill in the blank',
  'context-match': 'context match',
}

export function QuizCard({
  question,
  selectedAnswerId,
  onSelectAnswer,
  showResult,
  index,
  total,
}: QuizCardProps) {
  const { config } = useLanguage()

  const isHindiPrompt = question.type === 'translate-to-english'

  const handleHear = (e: React.MouseEvent) => {
    e.stopPropagation()
    playSound('pop')
    speak(question.prompt, config.ttsLocale)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.25 }}
      style={{ width: '100%', maxWidth: 480, margin: '0 auto' }}
    >
      {/* Question sticker */}
      <Sticker color={W} radius={26} padding={22}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontFamily: FONTS.tag,
              fontSize: 10,
              background: COLORS.orange,
              color: W,
              padding: '3px 9px',
              borderRadius: 99,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              border: BORDER.thin,
            }}
          >
            question {index + 1} of {total}
          </span>
          <Tag bg={COLORS.lav2} color={COLORS.ink}>
            {TYPE_LABELS[question.type] ?? question.type}
          </Tag>
        </div>

        <div
          style={{
            marginTop: 14,
            fontFamily: FONTS.body,
            fontWeight: 700,
            fontSize: 13,
            color: COLORS.ink60,
            textTransform: 'lowercase',
            letterSpacing: 0.2,
          }}
        >
          what does this mean?
        </div>
        <div
          style={{
            marginTop: 6,
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: isHindiPrompt ? 28 : 22,
            color: COLORS.ink,
            lineHeight: 1.15,
            letterSpacing: isHindiPrompt ? -0.5 : -0.3,
          }}
        >
          {question.prompt}
        </div>
        {question.subPrompt && (
          <div
            style={{
              marginTop: 6,
              fontFamily: FONTS.body,
              fontSize: 12,
              fontWeight: 600,
              color: COLORS.ink60,
            }}
          >
            {question.subPrompt}
          </div>
        )}

        {isHindiPrompt && (
          <button
            type="button"
            onClick={handleHear}
            style={{
              marginTop: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: 99,
              background: COLORS.butter,
              border: BORDER.sticker,
              boxShadow: SHADOW.chip,
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 12,
              color: COLORS.ink,
              cursor: 'pointer',
              textTransform: 'lowercase',
            }}
          >
            📢 hear it
          </button>
        )}
      </Sticker>

      {/* Options */}
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {question.answers.map((answer, i) => {
          const isPickedWrong = showResult && selectedAnswerId === answer.id && !answer.isCorrect
          const isCorrectShown = showResult && answer.isCorrect
          const isUntouched = !showResult
          const pastel: string = PASTELS[i % PASTELS.length]

          let bg: string = pastel
          if (isCorrectShown) bg = COLORS.mint
          else if (isPickedWrong) bg = COLORS.redBg

          const fadedNotPicked =
            showResult && !answer.isCorrect && selectedAnswerId !== answer.id

          return (
            <motion.button
              key={answer.id}
              whileTap={isUntouched ? { scale: 0.97 } : undefined}
              animate={
                isPickedWrong
                  ? { x: [0, -8, 8, -8, 8, 0], transition: { duration: 0.4 } }
                  : { x: 0 }
              }
              onClick={() => onSelectAnswer(answer.id)}
              disabled={showResult}
              style={{
                display: 'flex',
                alignItems: 'stretch',
                background: bg,
                border: BORDER.sticker,
                borderRadius: 18,
                boxShadow: SHADOW.chip,
                cursor: showResult ? 'default' : 'pointer',
                overflow: 'hidden',
                padding: 0,
                opacity: fadedNotPicked ? 0.55 : 1,
                transition: 'opacity 0.2s',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: 44,
                  background: COLORS.ink,
                  color: COLORS.cream,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 18,
                  flexShrink: 0,
                  borderRight: BORDER.sticker,
                }}
              >
                {LETTERS[i] ?? '?'}
              </div>
              <div
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 700,
                    fontSize: 15,
                    color: COLORS.ink,
                    lineHeight: 1.3,
                  }}
                >
                  {answer.text}
                </span>
                {isCorrectShown && (
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 99,
                      background: COLORS.green,
                      color: W,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      flexShrink: 0,
                      border: BORDER.thin,
                    }}
                  >
                    ✓
                  </span>
                )}
                {isPickedWrong && (
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 99,
                      background: COLORS.red,
                      color: W,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      flexShrink: 0,
                      border: BORDER.thin,
                    }}
                  >
                    ✕
                  </span>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
