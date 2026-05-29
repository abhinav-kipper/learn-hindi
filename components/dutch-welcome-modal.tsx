'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { playSound } from '@/lib/sounds'
import { Sticker, Tag, Cutting, Confetti as ChaiConfetti, COLORS, FONTS, BORDER, SHADOW } from '@/components/design'
import { getExamTarget, setExamTarget, type ExamTarget } from '@/lib/dutch/exam-target'
const W = '#fff' // @design-allow: white literal

const WELCOMED_KEY = 'dutch-welcomed'

export function DutchWelcomeModal() {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [target, setTarget] = useState<ExamTarget>('b1')

  useEffect(() => {
    if (!localStorage.getItem(WELCOMED_KEY)) {
      setShow(true)
    }
  }, [])

  useEffect(() => { setTarget(getExamTarget()) }, [])

  const dismiss = () => {
    localStorage.setItem(WELCOMED_KEY, '1')
    setShow(false)
    playSound('tap')
  }

  const onChangeTarget = (t: ExamTarget) => { setExamTarget(t); setTarget(t) }

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              background: 'rgba(54,40,30,0.5)',
              backdropFilter: 'blur(4px)',
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                pointerEvents: 'auto',
                background: W,
                border: BORDER.sticker,
                boxShadow: SHADOW.sticker,
                borderRadius: 24,
                padding: 28,
                maxWidth: 360,
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <ChaiConfetti active count={20} />
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <Cutting size={100} mood="happy" />
              </div>
              <div style={{ position: 'relative', zIndex: 10 }}>
                <Tag>🇳🇱 welkom</Tag>

                <h2 style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 22, color: COLORS.ink, margin: '8px 0 6px' }}>
                  Hallo! Ready for your inburgeringsexamen?
                </h2>
                <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, lineHeight: 1.5, margin: '0 0 14px' }}>
                  This Dutch track is built to prep you for the <strong>Inburgeringsexamen B1 + KNM</strong>, the exam HSM holders take to naturalize and get a Dutch passport.
                </p>

                <div style={{ marginBottom: 14 }}>
                  <div style={{
                    fontFamily: FONTS.display, fontWeight: 800, fontSize: 12, color: COLORS.ink,
                    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
                  }}>
                    Exam skills
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, lineHeight: 1.6 }}>
                    <li><strong>KNM</strong>, knowledge of Dutch society <em style={{ opacity: 0.7 }}>(live now)</em></li>
                    <li><strong>Reading</strong> <em style={{ opacity: 0.6 }}>(Lezen)</em> · <strong>Listening</strong> <em style={{ opacity: 0.6 }}>(Luisteren)</em> · <strong>Writing</strong> <em style={{ opacity: 0.6 }}>(Schrijven)</em> · <strong>Speaking</strong> <em style={{ opacity: 0.6 }}>(Spreken)</em>, <em style={{ opacity: 0.7 }}>coming soon</em></li>
                  </ul>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{
                    fontFamily: FONTS.display, fontWeight: 800, fontSize: 12, color: COLORS.ink,
                    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
                  }}>
                    Exam target
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Sticker
                      color={target === 'a2' ? COLORS.butter : W}
                      radius={12}
                      padding={10}
                      selected={target === 'a2'}
                      onClick={() => onChangeTarget('a2')}
                      style={{ flex: 1 }}
                    >
                      <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink, textAlign: 'center' }}>A2</div>
                      <div style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.ink, opacity: 0.7, textAlign: 'center' }}>basic, faster</div>
                    </Sticker>
                    <Sticker
                      color={target === 'b1' ? COLORS.butter : W}
                      radius={12}
                      padding={10}
                      selected={target === 'b1'}
                      onClick={() => onChangeTarget('b1')}
                      style={{ flex: 1 }}
                    >
                      <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink, textAlign: 'center' }}>B1 ✓</div>
                      <div style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.ink, opacity: 0.7, textAlign: 'center' }}>full coverage</div>
                    </Sticker>
                  </div>
                </div>

                <p style={{
                  fontFamily: FONTS.body, fontSize: 12, color: COLORS.ink, opacity: 0.75, fontStyle: 'italic',
                  margin: '0 0 16px',
                }}>
                  Tip: book your exam date on <strong>inburgeren.nl</strong> before you start. A deadline focuses the mind.
                </p>

                <div style={{ display: 'flex', gap: 10 }}>
                  <Sticker
                    color={COLORS.orange}
                    radius={14}
                    padding={12}
                    onClick={() => { dismiss(); router.push('/dutch/knm') }}
                    style={{ flex: 1 }}
                  >
                    <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: W, textAlign: 'center' }}>
                      Start with KNM
                    </div>
                  </Sticker>
                  <Sticker
                    color={COLORS.butter}
                    radius={14}
                    padding={12}
                    onClick={dismiss}
                    style={{ flex: 1 }}
                  >
                    <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink, textAlign: 'center' }}>
                      Browse all
                    </div>
                  </Sticker>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
