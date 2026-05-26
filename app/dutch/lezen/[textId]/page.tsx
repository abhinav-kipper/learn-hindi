'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sticker, Tag, Cutting,
  COLORS, FONTS, BORDER,
  useChaina, canFire, markFired,
} from '@/components/design'
import {
  getTextById,
  markTextStudied,
  isStudied,
  type LezenQuestion,
} from '@/lib/dutch/lezen'
import { playSound } from '@/lib/sounds'

const W = '#fff' // @design-allow: white literal
const ROSE_LIGHT = '#f4c5c5' // @design-allow: wrong-answer highlight

export default function LezenStudyPage({ params }: { params: Promise<{ textId: string }> }) {
  const { textId } = use(params)
  const router = useRouter()
  const text = getTextById(textId)
  const [showEn, setShowEn] = useState(false)
  const [alreadyStudied, setAlreadyStudied] = useState(false)
  const { play } = useChaina()

  useEffect(() => { setAlreadyStudied(isStudied(textId)) }, [textId])

  if (!text) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.lav, padding: 24 }}>
        <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: FONTS.body, color: COLORS.ink }}>
          Text not found.
          <button onClick={() => router.push('/dutch/lezen')} style={{
            background: COLORS.butter, border: BORDER.sticker, padding: '6px 12px',
            borderRadius: 8, marginLeft: 12, cursor: 'pointer',
          }}>← Back</button>
        </div>
      </div>
    )
  }

  const onStudied = () => {
    if (alreadyStudied) return
    markTextStudied(text.id)
    setAlreadyStudied(true)
    playSound('complete')
    if (canFire('lezenStudyDone', 'debounce-800ms')) {
      play('lezenStudyDone')
      markFired('lezenStudyDone', 'debounce-800ms')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.lav, padding: '24px 16px 120px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'transparent', border: 'none', color: COLORS.ink,
            fontSize: 14, fontFamily: FONTS.body, fontWeight: 700, cursor: 'pointer', marginBottom: 8,
          }}
        >
          ← Back
        </button>
        <Tag>{text.tier}</Tag>
        <h1 style={{
          fontFamily: FONTS.display, fontSize: 24, fontWeight: 800, color: COLORS.ink,
          margin: '6px 0 2px',
        }}>
          {text.title_en}
        </h1>
        <div style={{
          fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, opacity: 0.65,
          fontStyle: 'italic', marginBottom: 16,
        }}>
          {text.title_nl} · {text.word_count} words
        </div>

        <Sticker color={W} radius={18} padding={16} style={{ marginBottom: 12 }}>
          <div style={{
            fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink, lineHeight: 1.6, whiteSpace: 'pre-wrap',
          }}>
            {text.body_nl}
          </div>
        </Sticker>

        <button
          onClick={() => { playSound('tap'); setShowEn((v) => !v) }}
          style={{
            background: COLORS.butter, border: BORDER.sticker, padding: '8px 14px',
            borderRadius: 999, fontFamily: FONTS.body, fontWeight: 700, fontSize: 13,
            color: COLORS.ink, cursor: 'pointer', marginBottom: 12,
          }}
        >
          {showEn ? 'Hide English translation' : 'Show English translation'}
        </button>

        {showEn && (
          <Sticker color={COLORS.mint} radius={14} padding={14} style={{ marginBottom: 18 }}>
            <div style={{
              fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, lineHeight: 1.6,
              fontStyle: 'italic', whiteSpace: 'pre-wrap',
            }}>
              {text.body_en}
            </div>
          </Sticker>
        )}

        <div style={{
          fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink,
          textTransform: 'uppercase', letterSpacing: 1, marginTop: 6, marginBottom: 10,
        }}>
          Questions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {text.questions.map((q, idx) => (
            <QuestionCard key={idx} q={q} index={idx} />
          ))}
        </div>

        <button
          onClick={onStudied}
          disabled={alreadyStudied}
          style={{
            marginTop: 18,
            background: alreadyStudied ? COLORS.mint : COLORS.orange,
            border: BORDER.sticker, padding: '12px 18px',
            borderRadius: 14, fontFamily: FONTS.display, fontWeight: 800, fontSize: 15,
            color: alreadyStudied ? COLORS.ink : W,
            cursor: alreadyStudied ? 'default' : 'pointer', width: '100%',
          }}
        >
          {alreadyStudied ? '✓ Studied' : 'Mark as studied'}
        </button>
      </div>
    </div>
  )
}

function QuestionCard({ q, index }: { q: LezenQuestion; index: number }) {
  const [picked, setPicked] = useState<0 | 1 | 2 | 3 | null>(null)
  const revealed = picked !== null

  const onPick = (i: 0 | 1 | 2 | 3) => {
    if (revealed) return
    setPicked(i)
    playSound(i === q.correct_index ? 'correct' : 'wrong')
  }

  return (
    <Sticker color={W} radius={14} padding={12}>
      <div style={{
        fontFamily: FONTS.display, fontWeight: 800, fontSize: 11, color: COLORS.ink,
        opacity: 0.55, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4,
      }}>
        Q{index + 1} · {q.type}
      </div>
      <div style={{ fontFamily: FONTS.body, fontWeight: 700, color: COLORS.ink, fontSize: 14, marginBottom: 2 }}>
        {q.question_nl}
      </div>
      <div style={{
        fontFamily: FONTS.body, fontSize: 12, color: COLORS.ink, opacity: 0.65,
        fontStyle: 'italic', marginBottom: 10,
      }}>
        {q.question_en}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
        {q.options_nl.map((opt, i) => {
          const isCorrect = i === q.correct_index
          const isPicked = picked === i
          const showCorrect = revealed && isCorrect
          const showWrong = revealed && isPicked && !isCorrect
          return (
            <div
              key={i}
              onClick={() => onPick(i as 0 | 1 | 2 | 3)}
              style={{
                cursor: revealed ? 'default' : 'pointer',
                padding: '6px 10px', borderRadius: 8,
                background: showCorrect ? COLORS.mint : showWrong ? ROSE_LIGHT : isPicked ? COLORS.butter : 'transparent',
                border: BORDER.sticker,
              }}
            >
              <div style={{
                fontFamily: FONTS.body, fontSize: 13, fontWeight: showCorrect ? 700 : 400, color: COLORS.ink,
              }}>
                {String.fromCharCode(65 + i)}. {opt}
                {showCorrect && ' ✓'}
                {showWrong && ' ✕'}
              </div>
              <div style={{
                fontFamily: FONTS.body, fontSize: 11, color: COLORS.ink, opacity: 0.6,
                fontStyle: 'italic', paddingLeft: 16,
              }}>
                {q.options_en[i]}
              </div>
            </div>
          )
        })}
      </div>
      {revealed && (
        <div style={{
          fontFamily: FONTS.body, fontSize: 12, color: COLORS.ink, opacity: 0.8,
          fontStyle: 'italic', marginTop: 4,
        }}>
          {q.explanation_en}
        </div>
      )}
    </Sticker>
  )
}
