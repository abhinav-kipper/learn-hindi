'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getMistakes,
  deleteMistake,
  clearMistakes,
  type Mistake,
  type MistakeSource,
} from '@/lib/mistakes'
import { useLanguage } from '@/lib/language-context'
import { getUniversalLessonById } from '@/lib/all-content'
import { speak } from '@/lib/speech'
import { playSound } from '@/lib/sounds'
import { useChaina } from '@/components/design'
import {
  Sticker,
  Tag,
  Cutting,
  DottedBg,
  MotifIcon,
  COLORS,
  FONTS,
  BORDER,
  SHADOW,
  deriveLessonStyle,
  paletteToBg,
  paletteToMotifBg,
} from '@/components/design'

function SourceChip({ source }: { source: MistakeSource }) {
  const isQuiz = source === 'quiz'
  return (
    <Tag bg={isQuiz ? COLORS.lav2 : COLORS.mint2} color={COLORS.ink} border={COLORS.ink}>
      {isQuiz ? '🎯 quiz' : '💬 practice'}
    </Tag>
  )
}

export default function MistakesPage() {
  const router = useRouter()
  const { config } = useLanguage()
  const prefix = config.storagePrefix
  const [mistakes, setMistakes] = useState<Mistake[]>([])
  const [confirmClear, setConfirmClear] = useState(false)
  const [drilling, setDrilling] = useState(false)

  useEffect(() => {
    setMistakes(getMistakes(prefix))
  }, [prefix])

  const handleDelete = (id: string) => {
    deleteMistake(id, prefix)
    setMistakes(getMistakes(prefix))
    playSound('tap')
  }

  const handleClearAll = () => {
    clearMistakes(prefix)
    setMistakes([])
    setConfirmClear(false)
  }

  // Group by lesson, newest first within each group (reduceRight reverses)
  const groups = mistakes.reduceRight<Record<string, Mistake[]>>((acc, m) => {
    if (!acc[m.lessonId]) acc[m.lessonId] = []
    acc[m.lessonId].push(m)
    return acc
  }, {})

  const oldestIso = mistakes.length > 0 ? mistakes[0].timestamp : null
  const oldestStr = oldestIso
    ? new Date(oldestIso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : ''

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', background: COLORS.lav, paddingBottom: 110 }}>
      <DottedBg />

      {/* HEADER BAND */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        style={{
          position: 'relative',
          padding: '50px 20px 18px',
          background: COLORS.redBg,
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
              router.back()
            }}
            aria-label="Back"
            style={{
              width: 40,
              height: 40,
              borderRadius: 99,
              background: '#fff',
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
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div style={{ marginRight: -6, marginTop: -6 }}>
            <Cutting size={66} />
          </div>
        </div>

        <div style={{ marginTop: 10, maxWidth: 480, margin: '10px auto 0' }}>
          <Tag>
            {mistakes.length} {mistakes.length === 1 ? 'mistake' : 'mistakes'}
            {oldestStr ? ` · since ${oldestStr}` : ''}
          </Tag>
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
            where you slipped
          </div>
        </div>
      </motion.div>

      <div
        style={{
          padding: '14px 20px 0',
          maxWidth: 480,
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {/* DRILL-ALL CTA */}
        {mistakes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 240, damping: 22 }}
          >
            <Sticker
              color={COLORS.orange}
              radius={22}
              padding={16}
              onClick={() => {
                playSound('pop')
                setDrilling(true)
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    background: '#fff',
                    borderRadius: 14,
                    border: BORDER.sticker,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    flexShrink: 0,
                  }}
                >
                  <span style={{ animation: 'wobble-z 2.4s ease-in-out infinite' }}>🎯</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Tag bg={COLORS.butter} color={COLORS.ink} border={COLORS.ink}>
                    tap to start
                  </Tag>
                  <div
                    style={{
                      fontFamily: FONTS.display,
                      fontWeight: 800,
                      fontSize: 22,
                      color: COLORS.cream,
                      marginTop: 6,
                      letterSpacing: -0.4,
                      textTransform: 'lowercase',
                    }}
                  >
                    drill all {mistakes.length} →
                  </div>
                </div>
              </div>
            </Sticker>
          </motion.div>
        )}

        {mistakes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ textAlign: 'center', padding: '32px 16px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <Cutting size={110} mood="happy" />
            </div>
            <Tag>spotless</Tag>
            <div
              style={{
                fontFamily: FONTS.display,
                fontWeight: 800,
                fontSize: 22,
                color: COLORS.ink,
                marginTop: 10,
                letterSpacing: -0.4,
              }}
            >
              no mistakes yet
            </div>
            <div
              style={{
                fontFamily: FONTS.body,
                fontWeight: 600,
                fontSize: 12,
                color: COLORS.ink60,
                marginTop: 6,
              }}
            >
              corrections from practice + wrong quiz answers will show up here.
            </div>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.entries(groups).map(([lessonId, items], gIdx) => {
              const lesson = getUniversalLessonById(lessonId)
              const groupTitle =
                lesson?.title ??
                (lessonId === 'vocab' || lessonId.startsWith('vocab-')
                  ? 'Vocabulary'
                  : lessonId)
              const { palette, motif } = deriveLessonStyle(lessonId, gIdx)
              const groupBg = paletteToBg(palette)
              const motifBg = paletteToMotifBg(palette)
              return (
                <motion.div
                  key={lessonId}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + gIdx * 0.05 }}
                >
                  <Sticker color={groupBg} radius={22} padding={14}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          background: motifBg,
                          borderRadius: 10,
                          border: BORDER.thin,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          overflow: 'hidden',
                        }}
                      >
                        <div style={{ transform: 'scale(0.42)', transformOrigin: 'center' }}>
                          <MotifIcon kind={motif} size={64} />
                        </div>
                      </div>
                      <div
                        style={{
                          flex: 1,
                          fontFamily: FONTS.display,
                          fontWeight: 800,
                          fontSize: 14,
                          color: COLORS.ink,
                          letterSpacing: -0.2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {groupTitle}
                      </div>
                      <Tag>
                        {items.length}
                      </Tag>
                    </div>
                    <AnimatePresence initial={false}>
                      {items.map((m, i) => (
                        <motion.div
                          key={m.id}
                          layout
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 8,
                            padding: '8px 0',
                            borderTop: i > 0 ? `1px dashed ${COLORS.ink45}55` : 'none',
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <SourceChip source={m.source ?? 'practice'} />
                            <div
                              style={{
                                marginTop: 6,
                                fontFamily: FONTS.display,
                                fontWeight: 800,
                                fontSize: 14,
                                color: COLORS.ink,
                              }}
                            >
                              <span style={{ textDecoration: 'line-through', color: '#cc4a4a' }}>
                                {m.original}
                              </span>{' '}
                              →{' '}
                              <span style={{ color: COLORS.green }}>✓ {m.correction}</span>
                            </div>
                            {m.reason && (
                              <div
                                style={{
                                  marginTop: 4,
                                  fontFamily: FONTS.body,
                                  fontWeight: 600,
                                  fontSize: 11,
                                  color: COLORS.ink60,
                                }}
                              >
                                {m.reason}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDelete(m.id)}
                            aria-label="Delete mistake"
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 99,
                              background: '#fff',
                              border: BORDER.thin,
                              cursor: 'pointer',
                              flexShrink: 0,
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: COLORS.ink60,
                            }}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                            >
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </Sticker>
                </motion.div>
              )
            })}

            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              style={{
                marginTop: 8,
                width: '100%',
                padding: '10px',
                background: 'transparent',
                border: 'none',
                fontFamily: FONTS.display,
                fontWeight: 800,
                fontSize: 12,
                color: COLORS.red,
                cursor: 'pointer',
                textTransform: 'lowercase',
              }}
            >
              clear all mistakes
            </button>
          </div>
        )}
      </div>

      {/* Clear-confirmation modal */}
      <AnimatePresence>
        {confirmClear && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmClear(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(54,40,30,0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 40,
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 50,
                background: '#fff',
                border: BORDER.sticker,
                borderRadius: 22,
                boxShadow: SHADOW.sticker,
                padding: 22,
                width: '90%',
                maxWidth: 340,
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 18,
                  color: COLORS.ink,
                  letterSpacing: -0.3,
                }}
              >
                clear all mistakes?
              </div>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontWeight: 600,
                  fontSize: 13,
                  color: COLORS.ink60,
                  marginTop: 8,
                  marginBottom: 16,
                }}
              >
                this permanently deletes {mistakes.length}{' '}
                {mistakes.length === 1 ? 'mistake' : 'mistakes'}.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 16,
                    background: '#fff',
                    color: COLORS.ink,
                    border: BORDER.sticker,
                    boxShadow: SHADOW.chip,
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer',
                    textTransform: 'lowercase',
                  }}
                >
                  cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 16,
                    background: COLORS.red,
                    color: '#fff',
                    border: BORDER.sticker,
                    boxShadow: SHADOW.chip,
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer',
                    textTransform: 'lowercase',
                  }}
                >
                  clear
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {drilling && (
          <DrillOverlay mistakes={mistakes} onClose={() => setDrilling(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function DrillOverlay({ mistakes, onClose }: { mistakes: Mistake[]; onClose: () => void }) {
  const { config } = useLanguage()
  const [order] = useState(() => [...mistakes].sort(() => Math.random() - 0.5))
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [gotItCount, setGotItCount] = useState(0)
  const { play } = useChaina()
  const current = order[index]
  const isLast = index === order.length - 1
  const complete = index >= order.length

  const advance = (gotIt: boolean) => {
    if (gotIt) {
      setGotItCount((c) => c + 1)
      playSound('correct')
      play('drillGotIt')
    } else {
      playSound('pop')
    }
    if (isLast) {
      setIndex(order.length)
    } else {
      setIndex((i) => i + 1)
      setRevealed(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(54,40,30,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 40,
        }}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            background: COLORS.butter,
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
            borderTop: BORDER.sticker,
            borderLeft: BORDER.sticker,
            borderRight: BORDER.sticker,
            boxShadow: SHADOW.sheet,
            padding: '18px 20px 50px',
          }}
        >
          {/* drag handle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <div
              style={{
                width: 48,
                height: 5,
                background: COLORS.ink,
                opacity: 0.5,
                borderRadius: 99,
              }}
            />
          </div>

          {complete ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', padding: '16px 0' }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <div style={{ animation: 'happy-hop 1.4s ease-in-out infinite' }}>
                  <Cutting size={90} mood="happy" />
                </div>
              </div>
              <Tag>drill complete</Tag>
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 22,
                  color: COLORS.ink,
                  marginTop: 8,
                  letterSpacing: -0.3,
                }}
              >
                {gotItCount}/{order.length} nailed
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  marginTop: 16,
                  width: '100%',
                  padding: 14,
                  borderRadius: 22,
                  background: COLORS.orange,
                  color: '#fff',
                  border: BORDER.sticker,
                  boxShadow: SHADOW.sticker,
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  textTransform: 'lowercase',
                }}
              >
                done
              </button>
            </motion.div>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <Tag bg={COLORS.orange} color="#fff" border={COLORS.ink}>
                  drill · {index + 1} / {order.length}
                </Tag>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close drill"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 99,
                    background: '#fff',
                    border: BORDER.thin,
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: COLORS.ink,
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                {order.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: i === index ? 2 : 1,
                      height: 6,
                      background: i < index ? COLORS.green : i === index ? COLORS.orange : '#fff',
                      borderRadius: 99,
                      border: BORDER.thin,
                      transition: 'all 0.3s',
                    }}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ x: 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -60, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                >
                  <Sticker
                    color="#fff"
                    radius={20}
                    padding={18}
                    onClick={() => {
                      if (!revealed) {
                        setRevealed(true)
                        playSound('pop')
                      }
                    }}
                  >
                    <div
                      style={{
                        fontFamily: FONTS.tag,
                        fontSize: 10,
                        color: COLORS.ink60,
                        textTransform: 'uppercase',
                        letterSpacing: 0.6,
                      }}
                    >
                      you said
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        fontFamily: FONTS.display,
                        fontWeight: 800,
                        fontSize: 22,
                        color: '#cc4a4a',
                        textDecoration: 'line-through',
                        lineHeight: 1.15,
                      }}
                    >
                      {current.original}
                    </div>
                    {revealed ? (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          marginTop: 12,
                          padding: 14,
                          background: COLORS.mint2,
                          border: `2px solid ${COLORS.ink}`,
                          borderRadius: 14,
                        }}
                      >
                        <div
                          style={{
                            fontFamily: FONTS.tag,
                            fontSize: 10,
                            color: COLORS.green,
                            textTransform: 'uppercase',
                            letterSpacing: 0.6,
                            fontWeight: 800,
                          }}
                        >
                          correct
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginTop: 4,
                          }}
                        >
                          <div
                            style={{
                              fontFamily: FONTS.display,
                              fontWeight: 800,
                              fontSize: 18,
                              color: COLORS.ink,
                              flex: 1,
                            }}
                          >
                            {current.correction}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              playSound('pop')
                              speak(current.correction, config.ttsLocale)
                            }}
                            aria-label="Hear correction"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 99,
                              background: '#fff',
                              border: BORDER.thin,
                              cursor: 'pointer',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: COLORS.ink,
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>
                        </div>
                        {current.reason && (
                          <div
                            style={{
                              marginTop: 8,
                              fontFamily: FONTS.body,
                              fontWeight: 600,
                              fontSize: 12,
                              color: COLORS.ink60,
                            }}
                          >
                            {current.reason}
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <div
                        style={{
                          marginTop: 12,
                          fontFamily: FONTS.body,
                          fontWeight: 700,
                          fontSize: 12,
                          color: COLORS.ink45,
                          textAlign: 'center',
                        }}
                      >
                        tap to reveal the fix
                      </div>
                    )}
                  </Sticker>

                  {revealed && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ display: 'flex', gap: 10, marginTop: 14 }}
                    >
                      <button
                        type="button"
                        onClick={() => advance(false)}
                        style={{
                          flex: 1,
                          padding: 14,
                          borderRadius: 18,
                          background: '#fff',
                          color: COLORS.ink,
                          border: BORDER.sticker,
                          boxShadow: SHADOW.chip,
                          fontFamily: FONTS.display,
                          fontWeight: 800,
                          fontSize: 14,
                          cursor: 'pointer',
                          textTransform: 'lowercase',
                        }}
                      >
                        still learning
                      </button>
                      <button
                        type="button"
                        onClick={() => advance(true)}
                        style={{
                          flex: 1,
                          padding: 14,
                          borderRadius: 18,
                          background: COLORS.green,
                          color: '#fff',
                          border: BORDER.sticker,
                          boxShadow: SHADOW.chip,
                          fontFamily: FONTS.display,
                          fontWeight: 800,
                          fontSize: 14,
                          cursor: 'pointer',
                          textTransform: 'lowercase',
                        }}
                      >
                        got it!
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>
    </>
  )
}
