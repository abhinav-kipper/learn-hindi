'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sticker,
  Tag,
  Cutting,
  COLORS,
  FONTS,
  BORDER,
} from '@/components/design'
import {
  getKnmQuestions,
  getQuestionsByCategory,
  getLearnedCount,
  isLearned,
  getAttemptHistory,
  markLearned,
  type Category,
  type KnmQuestion,
} from '@/lib/dutch/knm'
import { playSound } from '@/lib/sounds'

const W = '#fff' // @design-allow: white literal
const GREEN = '#1f8a3a' // @design-allow: semantic pass color
const RED = '#b94a4a' // @design-allow: semantic fail color

const CATEGORIES: Array<{ key: Category; en: string; nl: string; motif: string }> = [
  { key: 'politiek',     en: 'Politics',   nl: 'Politiek',     motif: '🏛️' },
  { key: 'werk',         en: 'Work',       nl: 'Werk',         motif: '💼' },
  { key: 'onderwijs',    en: 'Education',  nl: 'Onderwijs',    motif: '🎓' },
  { key: 'wonen',        en: 'Housing',    nl: 'Wonen',        motif: '🏠' },
  { key: 'gezondheid',   en: 'Healthcare', nl: 'Gezondheid',   motif: '🩺' },
  { key: 'geschiedenis', en: 'History',    nl: 'Geschiedenis', motif: '📜' },
]

export default function KnmModulePage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [learnedCount, setLearnedCount] = useState(0)
  const [attempts, setAttempts] = useState<ReturnType<typeof getAttemptHistory>>([])

  useEffect(() => {
    setLearnedCount(getLearnedCount())
    setAttempts(getAttemptHistory())
  }, [])

  const totalQuestions = getKnmQuestions().length

  const onStartDrill = () => {
    playSound('pop')
    router.push('/dutch/knm/drill')
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.lav, padding: '24px 16px 120px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ marginBottom: 18 }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'transparent', border: 'none', color: COLORS.ink,
              fontSize: 14, fontFamily: FONTS.body, fontWeight: 700, cursor: 'pointer', marginBottom: 8,
            }}
          >
            ← Back
          </button>
          <Tag>KNM</Tag>
          <h1 style={{
            fontFamily: FONTS.display, fontSize: 28, fontWeight: 800, color: COLORS.ink,
            margin: '6px 0 4px',
          }}>
            Knowledge of Dutch Society
          </h1>
          <p style={{
            fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, opacity: 0.7, margin: 0,
          }}>
            <em>Kennis van de Nederlandse Maatschappij</em> · {learnedCount} / {totalQuestions} learned
          </p>
        </div>

        <Sticker color={COLORS.orange} radius={22} padding={16} onClick={onStartDrill} style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Cutting size={56} mood="happy" />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 18, color: W }}>
                Start drill (30 questions)
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 13, color: W, opacity: 0.9, marginTop: 2 }}>
                Pass at 80% (24 / 30) — mirrors the real exam
              </div>
            </div>
          </div>
        </Sticker>

        <div style={{
          fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink,
          textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
        }}>
          Study by category
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 26 }}>
          {CATEGORIES.map((cat) => {
            const qs = getQuestionsByCategory(cat.key)
            const learnedInCat = qs.filter((q) => isLearned(q.id)).length
            return (
              <Sticker
                key={cat.key}
                color={COLORS.butter}
                radius={18}
                padding={14}
                onClick={() => { playSound('pop'); setActiveCategory(cat.key) }}
              >
                <div style={{ fontSize: 28, marginBottom: 4 }}>{cat.motif}</div>
                <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 16, color: COLORS.ink }}>
                  {cat.en}
                </div>
                <div style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.ink, opacity: 0.6, fontStyle: 'italic' }}>
                  {cat.nl}
                </div>
                <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.ink, marginTop: 6 }}>
                  {learnedInCat} / {qs.length} learned
                </div>
              </Sticker>
            )
          })}
        </div>

        {activeCategory && (
          <div style={{ marginBottom: 22 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
            }}>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink }}>
                {CATEGORIES.find(c => c.key === activeCategory)?.en} questions
              </div>
              <button
                onClick={() => setActiveCategory(null)}
                style={{
                  background: 'transparent', border: 'none', fontFamily: FONTS.body,
                  fontSize: 12, fontWeight: 700, color: COLORS.ink, cursor: 'pointer',
                }}
              >
                Close ✕
              </button>
            </div>
            <StudyCardList category={activeCategory} onLearnedChange={() => setLearnedCount(getLearnedCount())} />
          </div>
        )}

        {attempts.length > 0 && (
          <details style={{ marginTop: 10 }}>
            <summary style={{
              fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink, cursor: 'pointer',
            }}>
              Past attempts ({attempts.length})
            </summary>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {attempts.slice(0, 10).map((a, i) => (
                <Sticker key={i} color={W} radius={12} padding={10}>
                  <div style={{
                    fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, display: 'flex',
                    justifyContent: 'space-between',
                  }}>
                    <span>{new Date(a.ts).toLocaleDateString()}</span>
                    <span style={{ fontWeight: 700, color: a.passed ? GREEN : RED }}>
                      {a.score} / {a.total} {a.passed ? '✓' : ''}
                    </span>
                  </div>
                </Sticker>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}

function StudyCardList({
  category,
  onLearnedChange,
}: {
  category: Category
  onLearnedChange: () => void
}) {
  const [items, setItems] = useState<KnmQuestion[]>(() => getQuestionsByCategory(category))
  useEffect(() => { setItems(getQuestionsByCategory(category)) }, [category])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((q) => (
        <StudyCard key={q.id} q={q} onToggle={onLearnedChange} />
      ))}
    </div>
  )
}

function StudyCard({ q, onToggle }: { q: KnmQuestion; onToggle: () => void }) {
  const [learned, setLearnedLocal] = useState(false)
  useEffect(() => { setLearnedLocal(isLearned(q.id)) }, [q.id])

  const toggle = () => {
    markLearned(q.id)
    setLearnedLocal(true)
    onToggle()
  }

  return (
    <Sticker color={W} radius={14} padding={12}>
      <div style={{ fontFamily: FONTS.body, fontWeight: 700, color: COLORS.ink, fontSize: 14, marginBottom: 2 }}>
        {q.question_nl}
      </div>
      {q.question_en && (
        <div style={{
          fontFamily: FONTS.body, fontSize: 12, color: COLORS.ink, opacity: 0.65,
          fontStyle: 'italic', marginBottom: 8,
        }}>
          {q.question_en}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
        {q.options_nl.map((opt, i) => (
          <div key={i}>
            <div
              style={{
                fontFamily: FONTS.body, fontSize: 13,
                padding: '4px 8px', borderRadius: 6,
                background: i === q.correct_index ? COLORS.mint : 'transparent',
                color: COLORS.ink,
                fontWeight: i === q.correct_index ? 700 : 400,
              }}
            >
              {String.fromCharCode(65 + i)}. {opt} {i === q.correct_index && '✓'}
            </div>
            {q.options_en?.[i] && (
              <div style={{
                fontFamily: FONTS.body, fontSize: 11, color: COLORS.ink,
                opacity: 0.6, fontStyle: 'italic', paddingLeft: 22, marginTop: 1,
              }}>
                {q.options_en[i]}
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{
        fontFamily: FONTS.body, fontSize: 12, color: COLORS.ink, opacity: 0.75,
        fontStyle: 'italic', marginBottom: 8,
      }}>
        {q.explanation_en}
      </div>
      <button
        onClick={toggle}
        disabled={learned}
        style={{
          fontFamily: FONTS.body, fontWeight: 700, fontSize: 12, cursor: learned ? 'default' : 'pointer',
          padding: '6px 12px', borderRadius: 999,
          background: learned ? COLORS.mint : COLORS.butter,
          color: COLORS.ink, border: BORDER.sticker,
        }}
      >
        {learned ? '✓ Learned' : 'Mark as learned'}
      </button>
    </Sticker>
  )
}
