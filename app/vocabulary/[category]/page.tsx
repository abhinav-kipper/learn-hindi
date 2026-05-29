'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import {
  getCategory,
  markWordLearned,
  isWordLearned,
  VocabWord,
  VocabCategory,
} from '@/lib/vocabulary'
import {
  getDutchCategory,
  markDutchWordLearned,
  isDutchWordLearned,
} from '@/lib/dutch/vocabulary'
import {
  getVocabReview,
  addVocabReview,
  removeVocabReview,
} from '@/lib/vocab-review'
import {
  addArchived,
  removeArchived,
  getArchived,
  migrateLegacyKnown,
} from '@/lib/vocab-archive'
import { speak, stopSpeaking, isSpeaking } from '@/lib/speech'
import { playSound } from '@/lib/sounds'
import { useLanguage } from '@/lib/language-context'
import {
  Sticker,
  Tag,
  DottedBg,
  MotifIcon,
  COLORS,
  FONTS,
  BORDER,
  SHADOW,
  useTheme,
  type MotifKind,
} from '@/components/design'
const W = '#fff' // @design-allow: white literal
const BUTTER_MOTIF = '#d4a44a' // @design-allow: butter motif palette accent
const LAV_MOTIF = '#7a5da8' // @design-allow: lav motif palette accent
const VISIBLE_CAP = 10

const CATEGORY_PALETTE_BY_INDEX: Array<{ bg: string; motifBg: string; motif: MotifKind }> = [
  { bg: COLORS.peach2, motifBg: COLORS.orange, motif: 'marigold' },
  { bg: COLORS.mint2, motifBg: COLORS.teal, motif: 'chai' },
  { bg: COLORS.butter, motifBg: BUTTER_MOTIF, motif: 'auto' },
  { bg: COLORS.lav2, motifBg: LAV_MOTIF, motif: 'film' },
  { bg: COLORS.peach, motifBg: COLORS.orange, motif: 'phone' },
  { bg: COLORS.mint, motifBg: COLORS.teal, motif: 'map' },
]

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const { language, config } = useLanguage()
  const theme = useTheme()
  const categoryId = params.category as string

  const [category, setCategory] = useState<VocabCategory | null>(null)
  const [categoryIdx, setCategoryIdx] = useState(0)
  const [learnedSet, setLearnedSet] = useState<Set<string>>(new Set())
  const [archivedSet, setArchivedSet] = useState<Set<string>>(new Set())
  const [reviewSet, setReviewSet] = useState<Set<string>>(new Set())
  const [flippedCard, setFlippedCard] = useState<string | null>(null)
  const [archivedFoldOpen, setArchivedFoldOpen] = useState(false)

  const isDutch = language === 'dutch'

  useEffect(() => {
    const cat = isDutch ? getDutchCategory(categoryId) : getCategory(categoryId)
    if (!cat) {
      router.replace('/vocabulary')
      return
    }
    setCategory(cat)

    // Find the category's position in the master list for palette derivation
    if (typeof window !== 'undefined') {
      // dynamic import is overkill, just compute via the same algorithm
      import('@/lib/vocabulary').then((m) => {
        const all = isDutch ? [] : m.getAllCategories()
        const idx = all.findIndex((c) => c.id === categoryId)
        setCategoryIdx(idx >= 0 ? idx : 0)
      })
    }

    const learned = new Set<string>()
    cat.words.forEach((word) => {
      const isLearned = isDutch
        ? isDutchWordLearned(categoryId, word.hindi)
        : isWordLearned(categoryId, word.hindi)
      if (isLearned) learned.add(word.hindi)
    })
    setLearnedSet(learned)

    migrateLegacyKnown(config.storagePrefix)
    setArchivedSet(new Set(getArchived(config.storagePrefix)))
    setReviewSet(new Set(getVocabReview()))
  }, [categoryId, router, isDutch, config.storagePrefix])

  const scrollKey = `${config.storagePrefix}-vocab-scroll-${categoryId}`
  useEffect(() => {
    if (!category) return
    const saved = sessionStorage.getItem(scrollKey)
    if (saved) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: parseInt(saved, 10) || 0, behavior: 'auto' })
      })
    }
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        sessionStorage.setItem(scrollKey, String(window.scrollY))
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [category, scrollKey])

  const handleCardTap = (word: VocabWord) => {
    if (flippedCard === word.hindi) {
      setFlippedCard(null)
    } else {
      setFlippedCard(word.hindi)
      playSound('pop')
      if (!learnedSet.has(word.hindi)) {
        if (isDutch) markDutchWordLearned(categoryId, word.hindi)
        else markWordLearned(categoryId, word.hindi)
        setLearnedSet((prev) => new Set([...prev, word.hindi]))
      }
    }
  }

  const handleSwipeRight = useCallback(
    (word: VocabWord) => {
      playSound('correct')
      addArchived(config.storagePrefix, word.hindi)
      removeVocabReview(word.hindi)
      setArchivedSet((prev) => new Set([...prev, word.hindi]))
      setReviewSet((prev) => {
        const next = new Set(prev)
        next.delete(word.hindi)
        return next
      })
      if (!learnedSet.has(word.hindi)) {
        if (isDutch) markDutchWordLearned(categoryId, word.hindi)
        else markWordLearned(categoryId, word.hindi)
        setLearnedSet((prev) => new Set([...prev, word.hindi]))
      }
    },
    [categoryId, learnedSet, isDutch, config.storagePrefix],
  )

  const handleSwipeLeft = useCallback(
    (word: VocabWord) => {
      playSound('swipe')
      addVocabReview(word.hindi)
      removeArchived(config.storagePrefix, word.hindi)
      setReviewSet((prev) => new Set([...prev, word.hindi]))
      setArchivedSet((prev) => {
        const next = new Set(prev)
        next.delete(word.hindi)
        return next
      })
      if (!learnedSet.has(word.hindi)) {
        if (isDutch) markDutchWordLearned(categoryId, word.hindi)
        else markWordLearned(categoryId, word.hindi)
        setLearnedSet((prev) => new Set([...prev, word.hindi]))
      }
    },
    [categoryId, learnedSet, isDutch, config.storagePrefix],
  )

  const handleRestore = useCallback(
    (word: VocabWord) => {
      playSound('pop')
      removeArchived(config.storagePrefix, word.hindi)
      setArchivedSet((prev) => {
        const next = new Set(prev)
        next.delete(word.hindi)
        return next
      })
    },
    [config.storagePrefix],
  )

  const visibleWords = useMemo(() => {
    if (!category) return []
    const fresh = category.words.filter((w) => !archivedSet.has(w.hindi))
    return fresh.slice(0, VISIBLE_CAP)
  }, [category, archivedSet])

  const archivedWords = useMemo(() => {
    if (!category) return []
    return category.words.filter((w) => archivedSet.has(w.hindi))
  }, [category, archivedSet])

  if (!category) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: COLORS.lav,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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

  const learnedCount = learnedSet.size
  const totalCount = category.words.length
  const learnedPct = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0
  const archivedCount = archivedWords.length
  const freshCount = totalCount - archivedCount
  const palette = CATEGORY_PALETTE_BY_INDEX[categoryIdx % CATEGORY_PALETTE_BY_INDEX.length]

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100dvh',
        background: COLORS.lav,
        paddingBottom: 110,
      }}
    >
      <DottedBg />

      {/* HEADER BAND */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        style={{
          position: 'relative',
          padding: '50px 20px 18px',
          background: palette.bg,
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
              router.push('/vocabulary')
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
          <div
            style={{
              width: 64,
              height: 64,
              background: palette.motifBg,
              borderRadius: 16,
              border: BORDER.sticker,
              boxShadow: SHADOW.chip,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <MotifIcon kind={palette.motif} size={48} />
          </div>
        </div>

        <div style={{ marginTop: 10, maxWidth: 480, margin: '10px auto 0' }}>
          <Tag>
            vocab · {learnedCount} / {totalCount} explored
          </Tag>
          <div
            style={{
              marginTop: 8,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: 99,
              background: W,
              border: BORDER.sticker,
              boxShadow: SHADOW.chip,
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 12,
              color: COLORS.ink,
              letterSpacing: 0.2,
            }}
          >
            🃏 <span style={{ color: theme.primary }}>{freshCount}</span> fresh
            <span style={{ color: COLORS.ink45, marginInline: 4 }}>·</span>
            <span style={{ color: COLORS.green }}>{archivedCount}</span> archived
          </div>
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
            {category.title}
          </div>
          <div
            style={{
              marginTop: 12,
              height: 12,
              background: W,
              borderRadius: 99,
              border: BORDER.thin,
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${learnedPct}%` }}
              transition={{ delay: 0.25, duration: 0.8, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: learnedPct === 100 ? COLORS.green : theme.primary,
              }}
            />
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
        }}
      >
        <div
          style={{
            fontFamily: FONTS.body,
            fontWeight: 700,
            fontSize: 11,
            color: COLORS.ink60,
            marginBottom: 12,
            textAlign: 'center',
          }}
        >
          tap to flip · swipe → archive · swipe ← review
        </div>

        {visibleWords.length === 0 ? (
          <Sticker color={COLORS.mint2} radius={22} padding={24}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 42 }}>🎉</div>
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 22,
                  color: COLORS.ink,
                  marginTop: 8,
                  letterSpacing: -0.4,
                }}
              >
                all done in this category!
              </div>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontWeight: 700,
                  fontSize: 13,
                  color: COLORS.ink60,
                  marginTop: 6,
                }}
              >
                {archivedCount} {archivedCount === 1 ? 'word' : 'words'} archived, nice work
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                {archivedWords.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setArchivedFoldOpen(true)
                      playSound('tap')
                    }}
                    style={{
                      padding: '10px 16px',
                      background: W,
                      color: COLORS.ink,
                      border: BORDER.sticker,
                      boxShadow: SHADOW.chip,
                      borderRadius: 99,
                      fontFamily: FONTS.display,
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: 'pointer',
                      textTransform: 'lowercase',
                    }}
                  >
                    show archived ▾
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    playSound('tap')
                    router.push('/vocabulary')
                  }}
                  style={{
                    padding: '10px 16px',
                    background: theme.primary,
                    color: W,
                    border: BORDER.sticker,
                    boxShadow: SHADOW.chip,
                    borderRadius: 99,
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: 'pointer',
                    textTransform: 'lowercase',
                  }}
                >
                  other categories →
                </button>
              </div>
            </div>
          </Sticker>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <AnimatePresence initial={false}>
              {visibleWords.map((word, index) => (
                <SwipeableWordCard
                  key={word.hindi}
                  word={word}
                  index={index}
                  isFlipped={flippedCard === word.hindi}
                  isReview={reviewSet.has(word.hindi)}
                  onTap={handleCardTap}
                  onSwipeRight={handleSwipeRight}
                  onSwipeLeft={handleSwipeLeft}
                  ttsLocale={config.ttsLocale}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {archivedWords.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <button
              type="button"
              onClick={() => {
                setArchivedFoldOpen((v) => !v)
                playSound('tap')
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: W,
                color: COLORS.ink,
                border: BORDER.sticker,
                boxShadow: SHADOW.chip,
                borderRadius: 99,
                fontFamily: FONTS.display,
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                textTransform: 'lowercase',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              aria-expanded={archivedFoldOpen}
            >
              <span>✓ {archivedWords.length} archived</span>
              <span style={{ color: COLORS.ink60 }}>{archivedFoldOpen ? 'hide ▴' : 'show ▾'}</span>
            </button>

            <AnimatePresence initial={false}>
              {archivedFoldOpen && (
                <motion.div
                  key="archived-fold"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                    {archivedWords.map((word) => (
                      <Sticker key={word.hindi} color={COLORS.creamBg} radius={14} padding={12}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.78 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontFamily: FONTS.display,
                                fontWeight: 800,
                                fontSize: 15,
                                color: COLORS.ink,
                                letterSpacing: -0.2,
                              }}
                            >
                              {word.hindi}
                            </div>
                            <div
                              style={{
                                marginTop: 2,
                                fontFamily: FONTS.body,
                                fontWeight: 700,
                                fontSize: 12,
                                color: COLORS.ink60,
                              }}
                            >
                              {word.english}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRestore(word)}
                            aria-label={`Restore ${word.hindi}`}
                            style={{
                              padding: '6px 12px',
                              background: W,
                              color: COLORS.ink,
                              border: BORDER.thin,
                              borderRadius: 99,
                              fontFamily: FONTS.display,
                              fontWeight: 800,
                              fontSize: 11,
                              cursor: 'pointer',
                              textTransform: 'lowercase',
                              flexShrink: 0,
                            }}
                          >
                            ↺ restore
                          </button>
                        </div>
                      </Sticker>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

function SwipeableWordCard({
  word,
  index,
  isFlipped,
  isReview,
  onTap,
  onSwipeRight,
  onSwipeLeft,
  ttsLocale,
}: {
  word: VocabWord
  index: number
  isFlipped: boolean
  isReview: boolean
  onTap: (word: VocabWord) => void
  onSwipeRight: (word: VocabWord) => void
  onSwipeLeft: (word: VocabWord) => void
  ttsLocale: string
}) {
  const theme = useTheme()
  const x = useMotionValue(0)
  const rightOpacity = useTransform(x, [0, 100], [0, 1])
  const leftOpacity = useTransform(x, [-100, 0], [1, 0])
  const cardRotate = useTransform(x, [-150, 0, 150], [-3, 0, 3])
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    if (!speaking) return
    const interval = setInterval(() => {
      if (!isSpeaking()) setSpeaking(false)
    }, 300)
    return () => clearInterval(interval)
  }, [speaking])

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 80 || info.velocity.x > 500) {
      onSwipeRight(word)
    } else if (info.offset.x < -80 || info.velocity.x < -500) {
      onSwipeLeft(word)
    }
  }

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (speaking) {
      stopSpeaking()
      setSpeaking(false)
      return
    }
    playSound('pop')
    setSpeaking(true)
    speak(word.hindi, ttsLocale, () => setSpeaking(false))
  }

  const bg = isFlipped ? W : isReview ? COLORS.butter : W

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, transition: { duration: 0.22 } }}
      transition={{ delay: Math.min(index * 0.02, 0.18), type: 'spring', stiffness: 380, damping: 28 }}
      style={{ position: 'relative', overflow: 'hidden' }}
      layout
    >
      {/* Swipe-indicator overlays (behind the card) */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: COLORS.mint,
          border: BORDER.sticker,
          borderRadius: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingLeft: 24,
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 14,
          color: COLORS.ink,
          textTransform: 'uppercase',
          opacity: rightOpacity,
          letterSpacing: 0.5,
        }}
      >
        ✓ ARCHIVE
      </motion.div>
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: COLORS.butter,
          border: BORDER.sticker,
          borderRadius: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: 24,
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 14,
          color: COLORS.ink,
          textTransform: 'uppercase',
          opacity: leftOpacity,
          letterSpacing: 0.5,
        }}
      >
        REVIEW ↺
      </motion.div>

      <motion.div
        style={{ x, rotate: cardRotate, position: 'relative' }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        dragMomentum={false}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 30 }}
        onDragEnd={handleDragEnd}
        onClick={() => onTap(word)}
      >
        <Sticker color={bg} radius={18} padding={0}>
          <div style={{ padding: '12px 14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONTS.display,
                      fontWeight: 800,
                      fontSize: 18,
                      color: COLORS.ink,
                      letterSpacing: -0.3,
                    }}
                  >
                    {word.hindi}
                  </span>
                  <button
                    type="button"
                    onClick={handlePlay}
                    aria-label={speaking ? 'Stop' : 'Play'}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 99,
                      background: speaking ? theme.primary : W,
                      color: speaking ? W : COLORS.ink,
                      border: BORDER.thin,
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      {speaking ? (
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                      ) : (
                        <path d="M8 5v14l11-7z" />
                      )}
                    </svg>
                  </button>
                </div>
                <div
                  style={{
                    marginTop: 2,
                    fontFamily: FONTS.body,
                    fontWeight: 600,
                    fontSize: 11,
                    color: COLORS.ink45,
                  }}
                >
                  {word.pronunciation}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontFamily: FONTS.body,
                    fontWeight: 700,
                    fontSize: 13,
                    color: COLORS.ink60,
                  }}
                >
                  {word.english}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <Tag bg={COLORS.creamBg} color={COLORS.ink60} border={COLORS.ink}>
                  {word.type}
                </Tag>
                <div style={{ display: 'flex', gap: 4 }}>
                  {isReview && (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 99,
                        background: COLORS.orange,
                        border: `1.4px solid ${COLORS.ink}`, // @design-allow: status dot indicator, not a sticker surface
                      }}
                      title="needs review"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isFlipped && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div
                  style={{
                    margin: '0 12px 12px',
                    padding: 12,
                    background: COLORS.mint2,
                    border: BORDER.thin,
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONTS.tag,
                      fontSize: 9,
                      color: COLORS.green,
                      textTransform: 'uppercase',
                      letterSpacing: 0.6,
                      fontWeight: 800,
                      marginBottom: 4,
                    }}
                  >
                    ✨ example
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.body,
                      fontWeight: 700,
                      fontSize: 13,
                      color: COLORS.ink,
                      fontStyle: 'italic',
                    }}
                  >
                    {word.example}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Sticker>
      </motion.div>
    </motion.div>
  )
}
