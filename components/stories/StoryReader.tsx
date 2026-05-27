'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sticker,
  Cutting,
  Confetti,
  COLORS,
  FONTS,
  BORDER,
  SHADOW,
  useTheme,
} from '@/components/design'
import { SCENES } from './scenes'
import { Nani } from './characters/Nani'
import { Customer } from './characters/Customer'
import { Shopkeeper } from './characters/Shopkeeper'
import { markStoryRead } from '@/lib/stories-progress'
import { speak } from '@/lib/speech'
import { playSound } from '@/lib/sounds'
import type { Story } from '@/types/story'

const W = '#fff' // @design-allow: white literal

type StoryReaderProps = { story: Story }

export function StoryReader({ story }: StoryReaderProps) {
  const theme = useTheme()
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [englishRevealed, setEnglishRevealed] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [completed, setCompleted] = useState(false)

  const panel = story.panels[index]
  const isLast = index === story.panels.length - 1

  useEffect(() => {
    setEnglishRevealed(false)
  }, [index])

  useEffect(() => {
    if (isLast && !completed) {
      setCompleted(true)
      markStoryRead(story.id)
      playSound('complete')
    }
  }, [isLast, completed, story.id])

  const next = () => {
    if (index < story.panels.length - 1) {
      playSound('swipe')
      setIndex(index + 1)
    } else {
      playSound('tap')
      router.push('/')
    }
  }

  const prev = () => {
    if (index > 0) {
      playSound('swipe')
      setIndex(index - 1)
    }
  }

  const playTts = () => {
    if (speaking) return
    setSpeaking(true)
    speak(panel.hindi, 'hi-IN', () => setSpeaking(false))
  }

  const SceneComponent = SCENES[panel.scene]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.lav,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Top bar: back + progress */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px 8px',
          maxWidth: 480,
          width: '100%',
          margin: '0 auto',
        }}
      >
        <button
          onClick={() => {
            playSound('tap')
            router.push('/')
          }}
          aria-label="Back to home"
          style={{
            background: W,
            border: BORDER.sticker,
            boxShadow: SHADOW.chip,
            borderRadius: 999,
            padding: '6px 14px',
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 14,
            color: COLORS.ink,
            cursor: 'pointer',
          }}
        >
          ◀ Back
        </button>
        <div
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 12,
            color: COLORS.ink60,
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          Panel {index + 1} of {story.panels.length}
        </div>
      </div>

      {/* Scene area */}
      <div
        style={{
          flex: '0 0 auto',
          padding: '0 16px',
          maxWidth: 480,
          width: '100%',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            position: 'relative',
            height: 240,
            borderRadius: 18,
            border: BORDER.sticker,
            boxShadow: SHADOW.sticker,
            overflow: 'hidden',
            background: COLORS.creamBg,
          }}
        >
          <SceneComponent />

          {/* Character layer */}
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent:
                  panel.speaker_position === 'left'
                    ? 'flex-start'
                    : panel.speaker_position === 'right'
                    ? 'flex-end'
                    : 'center',
                padding: '0 18px 8px',
                pointerEvents: 'none',
              }}
            >
              <CharacterFor speaker={panel.speaker} storyId={story.id} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Text card */}
      <div
        style={{
          flex: 1,
          padding: '18px 16px',
          maxWidth: 480,
          width: '100%',
          margin: '0 auto',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <Sticker color={W} radius={18} padding={16}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <button
                  onClick={playTts}
                  disabled={speaking}
                  aria-label="Hear it"
                  style={{
                    background: speaking ? theme.primary : COLORS.butter,
                    border: BORDER.sticker,
                    boxShadow: SHADOW.chip,
                    borderRadius: 999,
                    padding: '6px 12px',
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 13,
                    color: COLORS.ink,
                    cursor: speaking ? 'default' : 'pointer',
                  }}
                >
                  🔊 hear it
                </button>
                <button
                  onClick={() => setEnglishRevealed(true)}
                  aria-label="Show English"
                  style={{
                    background: englishRevealed ? COLORS.mint : COLORS.peach,
                    border: BORDER.sticker,
                    boxShadow: SHADOW.chip,
                    borderRadius: 999,
                    padding: '6px 12px',
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 13,
                    color: COLORS.ink,
                    cursor: 'pointer',
                  }}
                >
                  {englishRevealed ? '✓ shown' : 'Show English'}
                </button>
              </div>

              <div
                style={{
                  fontFamily: FONTS.display,
                  fontWeight: 700,
                  fontSize: 22,
                  color: COLORS.ink,
                  lineHeight: 1.3,
                  marginBottom: 12,
                }}
              >
                {panel.hindi}
              </div>

              {panel.pronunciation && (
                <div
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 13,
                    color: COLORS.ink45,
                    fontStyle: 'italic',
                    marginBottom: 12,
                  }}
                >
                  {panel.pronunciation}
                </div>
              )}

              <motion.div
                initial={false}
                animate={{
                  background: englishRevealed ? COLORS.mint2 : COLORS.lav2,
                  borderColor: COLORS.ink,
                }}
                onClick={() => setEnglishRevealed(true)}
                role={englishRevealed ? undefined : 'button'}
                tabIndex={englishRevealed ? undefined : 0}
                style={{
                  border: BORDER.stickerDashed,
                  borderRadius: 12,
                  padding: '12px 14px',
                  cursor: englishRevealed ? 'default' : 'pointer',
                  fontFamily: FONTS.body,
                  fontSize: 15,
                  color: COLORS.ink,
                  minHeight: 40,
                }}
              >
                {englishRevealed ? panel.english : 'Tap to reveal English'}
              </motion.div>
            </Sticker>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 18,
            gap: 10,
          }}
        >
          <button
            onClick={prev}
            disabled={index === 0}
            aria-label="Previous panel"
            style={{
              background: index === 0 ? COLORS.peach2 : W,
              border: BORDER.sticker,
              boxShadow: index === 0 ? 'none' : SHADOW.chip,
              borderRadius: 999,
              padding: '10px 18px',
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 14,
              color: COLORS.ink,
              opacity: index === 0 ? 0.4 : 1,
              cursor: index === 0 ? 'default' : 'pointer',
            }}
          >
            ◀ prev
          </button>
          <button
            onClick={next}
            aria-label={isLast ? 'Finish story' : 'Next panel'}
            style={{
              background: isLast ? COLORS.mint : theme.primary,
              border: BORDER.sticker,
              boxShadow: SHADOW.chip,
              borderRadius: 999,
              padding: '10px 22px',
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 15,
              color: isLast ? COLORS.ink : W,
              cursor: 'pointer',
            }}
          >
            {isLast ? '✓ read more stories' : 'next ▶'}
          </button>
        </div>
      </div>

      {/* Completion confetti overlay */}
      {completed && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
          <Confetti active={completed} />
        </div>
      )}
    </div>
  )
}

function CharacterFor({ speaker, storyId }: { speaker?: string; storyId: string }) {
  const size = 130
  if (!speaker || speaker === 'narrator') return null
  if (speaker === 'cutting') return <Cutting size={size} mood="happy" />
  if (speaker === 'nani') return <Nani size={size} />
  if (speaker === 'customer') {
    const shirtColor = storyId === 'lost-in-bazaar' ? COLORS.peach : COLORS.mint
    return <Customer size={size} shirtColor={shirtColor} />
  }
  if (speaker === 'shopkeeper1') return <Shopkeeper size={size} shirtColor={COLORS.peach} accentColor={COLORS.mint} />
  if (speaker === 'shopkeeper2') return <Shopkeeper size={size} shirtColor={COLORS.butter} accentColor={COLORS.lav} />
  if (speaker === 'child') return <Customer size={Math.round(size * 0.78)} shirtColor={COLORS.butter} />
  return null
}
