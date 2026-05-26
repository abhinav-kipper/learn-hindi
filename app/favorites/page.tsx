'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getFavorites, removeFavorite, type FavoritePhrase } from '@/lib/favorites'
import { speak, stopSpeaking, isSpeaking } from '@/lib/speech'
import { useLanguage } from '@/lib/language-context'
import { getUniversalLessonById } from '@/lib/all-content'
import { playSound } from '@/lib/sounds'
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
const W = '#fff' // @design-allow: white literal

export default function FavoritesPage() {
  const router = useRouter()
  const { config } = useLanguage()
  const prefix = config.storagePrefix
  const [favorites, setFavorites] = useState<FavoritePhrase[]>([])
  const [speakingKey, setSpeakingKey] = useState<string | null>(null)

  useEffect(() => {
    setFavorites(getFavorites(prefix))
  }, [prefix])

  useEffect(() => {
    if (!speakingKey) return
    const interval = setInterval(() => {
      if (!isSpeaking()) setSpeakingKey(null)
    }, 300)
    return () => clearInterval(interval)
  }, [speakingKey])

  const handleRemove = (lessonId: string, hindi: string) => {
    removeFavorite(lessonId, hindi, prefix)
    setFavorites(getFavorites(prefix))
    playSound('tap')
  }

  const handlePlay = (key: string, text: string) => {
    if (speakingKey === key) {
      stopSpeaking()
      setSpeakingKey(null)
      return
    }
    playSound('pop')
    setSpeakingKey(key)
    speak(text, config.ttsLocale, () => setSpeakingKey(null))
  }

  // Group by lesson, newest first within each group
  const groups = favorites.reduce<Record<string, FavoritePhrase[]>>((acc, f) => {
    if (!acc[f.lessonId]) acc[f.lessonId] = []
    acc[f.lessonId].push(f)
    return acc
  }, {})

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
          background: COLORS.butter,
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
            ⭐ saved · {favorites.length} {favorites.length === 1 ? 'phrase' : 'phrases'}
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
            your favorites
          </div>
        </div>
      </motion.div>

      <div
        style={{
          padding: '16px 20px 0',
          maxWidth: 480,
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ textAlign: 'center', padding: '32px 16px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <Cutting size={110} />
            </div>
            <Tag>empty</Tag>
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
              no saved phrases yet
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
              open any lesson, tap the star on a phrase card to save it.
            </div>
          </motion.div>
        ) : (
          Object.entries(groups).map(([lessonId, items], gIdx) => {
            const lesson = getUniversalLessonById(lessonId)
            const groupTitle = lesson?.title ?? lessonId
            const { palette, motif } = deriveLessonStyle(lessonId, gIdx)
            const groupBg = paletteToBg(palette)
            const motifBg = paletteToMotifBg(palette)
            return (
              <motion.div
                key={lessonId}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + gIdx * 0.05 }}
              >
                <Sticker color={groupBg} radius={22} padding={14}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
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
                      <div style={{ transform: 'scale(0.42)' }}>
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
                    <Tag>{items.length}</Tag>
                  </div>

                  <AnimatePresence initial={false}>
                    {items.map((f, i) => {
                      const key = `${f.lessonId}::${f.hindi}`
                      const isPlaying = speakingKey === key
                      return (
                        <motion.div
                          key={key}
                          layout
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 0',
                            borderTop: i > 0 ? `1px dashed ${COLORS.ink45}55` : 'none',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handlePlay(key, f.hindi)}
                            aria-label={isPlaying ? 'Stop' : 'Play'}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 99,
                              background: isPlaying ? COLORS.orange : W,
                              color: isPlaying ? W : COLORS.ink,
                              border: BORDER.thin,
                              cursor: 'pointer',
                              flexShrink: 0,
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              {isPlaying ? (
                                <rect x="6" y="6" width="12" height="12" rx="2" />
                              ) : (
                                <path d="M8 5v14l11-7z" />
                              )}
                            </svg>
                          </button>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontFamily: FONTS.display,
                                fontWeight: 800,
                                fontSize: 14,
                                color: COLORS.ink,
                                lineHeight: 1.2,
                              }}
                            >
                              {f.hindi}
                            </div>
                            <div
                              style={{
                                marginTop: 2,
                                fontFamily: FONTS.body,
                                fontWeight: 600,
                                fontSize: 11,
                                color: COLORS.ink60,
                              }}
                            >
                              {f.english}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemove(f.lessonId, f.hindi)}
                            aria-label="Remove from favorites"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              padding: 4,
                              cursor: 'pointer',
                              fontSize: 20,
                              flexShrink: 0,
                            }}
                          >
                            ⭐
                          </button>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </Sticker>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
