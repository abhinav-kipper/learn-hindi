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
  getVocabKnown,
  getVocabReview,
  addVocabKnown,
  addVocabReview,
  removeVocabKnown,
  removeVocabReview,
} from '@/lib/vocab-review'
import { speak, stopSpeaking, isSpeaking } from '@/lib/speech'
import { playSound } from '@/lib/sounds'
import { useLanguage } from '@/lib/language-context'
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
  type MotifKind,
} from '@/components/design'

const CATEGORY_PALETTE_BY_INDEX: Array<{ bg: string; motifBg: string; motif: MotifKind }> = [
  { bg: COLORS.peach2, motifBg: COLORS.orange, motif: 'marigold' },
  { bg: COLORS.mint2, motifBg: COLORS.teal, motif: 'chai' },
  { bg: COLORS.butter, motifBg: '#d4a44a', motif: 'auto' },
  { bg: COLORS.lav2, motifBg: '#7a5da8', motif: 'film' },
  { bg: COLORS.peach, motifBg: COLORS.orange, motif: 'phone' },
  { bg: COLORS.mint, motifBg: COLORS.teal, motif: 'map' },
]

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const { language, config } = useLanguage()
  const categoryId = params.category as string

  const [category, setCategory] = useState<VocabCategory | null>(null)
  const [categoryIdx, setCategoryIdx] = useState(0)
  const [learnedSet, setLearnedSet] = useState<Set<string>>(new Set())
  const [knownSet, setKnownSet] = useState<Set<string>>(new Set())
  const [reviewSet, setReviewSet] = useState<Set<string>>(new Set())
  const [flippedCard, setFlippedCard] = useState<string | null>(null)

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
      // dynamic import is overkill — just compute via the same algorithm
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

    setKnownSet(new Set(getVocabKnown()))
    setReviewSet(new Set(getVocabReview()))
  }, [categoryId, router, isDutch])

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
      addVocabKnown(word.hindi)
      removeVocabReview(word.hindi)
      setKnownSet((prev) => new Set([...prev, word.hindi]))
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
    [categoryId, learnedSet, isDutch],
  )

  const handleSwipeLeft = useCallback(
    (word: VocabWord) => {
      playSound('swipe')
      addVocabReview(word.hindi)
      removeVocabKnown(word.hindi)
      setReviewSet((prev) => new Set([...prev, word.hindi]))
      setKnownSet((prev) => {
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
    [categoryId, learnedSet, isDutch],
  )

  const sortedWords = useMemo(() => {
    if (!category) return []
    return [...category.words].sort((a, b) => {
      const aKnown = knownSet.has(a.hindi) ? 1 : 0
      const bKnown = knownSet.has(b.hindi) ? 1 : 0
      return aKnown - bKnown
    })
  }, [category, knownSet])

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
            border: `3px solid ${COLORS.ink}`,
            borderTopColor: 'transparent',
          }}
        />
      </div>
    )
  }

  const learnedCount = learnedSet.size
  const totalCount = category.words.length
  const learnedPct = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0
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
              background: '#fff',
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
                background: learnedPct === 100 ? COLORS.green : COLORS.orange,
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
          tap to flip · swipe → known · swipe ← review
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sortedWords.map((word, index) => (
            <SwipeableWordCard
              key={word.hindi}
              word={word}
              index={index}
              isFlipped={flippedCard === word.hindi}
              isKnown={knownSet.has(word.hindi)}
              isReview={reviewSet.has(word.hindi)}
              onTap={handleCardTap}
              onSwipeRight={handleSwipeRight}
              onSwipeLeft={handleSwipeLeft}
              ttsLocale={config.ttsLocale}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function SwipeableWordCard({
  word,
  index,
  isFlipped,
  isKnown,
  isReview,
  onTap,
  onSwipeRight,
  onSwipeLeft,
  ttsLocale,
}: {
  word: VocabWord
  index: number
  isFlipped: boolean
  isKnown: boolean
  isReview: boolean
  onTap: (word: VocabWord) => void
  onSwipeRight: (word: VocabWord) => void
  onSwipeLeft: (word: VocabWord) => void
  ttsLocale: string
}) {
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

  const bg = isFlipped ? '#fff' : isKnown ? COLORS.mint2 : isReview ? COLORS.butter : '#fff'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.3) }}
      style={{ position: 'relative' }}
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
        ✓ KNOWN
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
                      background: speaking ? COLORS.orange : '#fff',
                      color: speaking ? '#fff' : COLORS.ink,
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
                  {isKnown && (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 99,
                        background: COLORS.green,
                        border: `1.4px solid ${COLORS.ink}`,
                      }}
                      title="known"
                    />
                  )}
                  {isReview && (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 99,
                        background: COLORS.orange,
                        border: `1.4px solid ${COLORS.ink}`,
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
