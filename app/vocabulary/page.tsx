'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  getAllCategories,
  getTotalWordCount,
  getTotalLearnedCount,
  getLearnedCountForCategory,
  VocabCategory,
} from '@/lib/vocabulary'
import {
  getDutchAllCategories,
  getDutchTotalWordCount,
  getDutchTotalLearnedCount,
  getDutchLearnedCountForCategory,
} from '@/lib/dutch/vocabulary'
import { useLanguage } from '@/lib/language-context'
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
  type MotifKind,
} from '@/components/design'

const CATEGORY_PALETTE: Array<{ bg: string; motifBg: string; motif: MotifKind }> = [
  { bg: COLORS.peach2, motifBg: COLORS.orange, motif: 'marigold' },
  { bg: COLORS.mint2, motifBg: COLORS.teal, motif: 'chai' },
  { bg: COLORS.butter, motifBg: '#d4a44a', motif: 'auto' },
  { bg: COLORS.lav2, motifBg: '#7a5da8', motif: 'film' },
  { bg: COLORS.peach, motifBg: COLORS.orange, motif: 'phone' },
  { bg: COLORS.mint, motifBg: COLORS.teal, motif: 'map' },
]

export default function VocabularyPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const [categories, setCategories] = useState<VocabCategory[]>([])
  const [totalLearned, setTotalLearned] = useState(0)
  const [totalWords, setTotalWords] = useState(0)
  const [categoryProgress, setCategoryProgress] = useState<Record<string, number>>({})

  useEffect(() => {
    const cats = language === 'dutch' ? getDutchAllCategories() : getAllCategories()
    setCategories(cats)
    setTotalWords(language === 'dutch' ? getDutchTotalWordCount() : getTotalWordCount())
    setTotalLearned(language === 'dutch' ? getDutchTotalLearnedCount() : getTotalLearnedCount())

    const progress: Record<string, number> = {}
    cats.forEach((cat) => {
      progress[cat.id] =
        language === 'dutch'
          ? getDutchLearnedCountForCategory(cat.id)
          : getLearnedCountForCategory(cat.id)
    })
    setCategoryProgress(progress)
  }, [language])

  const totalPct = totalWords > 0 ? Math.round((totalLearned / totalWords) * 100) : 0

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
          <div>
            <Tag>📚 vocabulary</Tag>
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
              your word bank
            </div>
          </div>
          <div style={{ marginRight: -6, marginTop: -6 }}>
            <Cutting size={66} />
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
        {/* OVERALL PROGRESS */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 240, damping: 22 }}
        >
          <Sticker color="#fff" radius={22} padding={16}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 14,
                  color: COLORS.ink,
                  textTransform: 'uppercase',
                  letterSpacing: 0.4,
                }}
              >
                overall
              </div>
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 16,
                  color: COLORS.ink,
                }}
              >
                <span style={{ color: COLORS.orange }}>{totalLearned}</span> / {totalWords}{' '}
                <span style={{ color: COLORS.ink60, fontSize: 12, fontWeight: 700 }}>· {totalPct}%</span>
              </div>
            </div>
            <div
              style={{
                height: 14,
                background: '#fff',
                borderRadius: 99,
                border: BORDER.sticker,
                overflow: 'hidden',
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${totalPct}%` }}
                transition={{ delay: 0.3, duration: 0.9, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: `linear-gradient(90deg, ${COLORS.orange2}, ${COLORS.orange})`,
                  borderRight: totalPct > 0 && totalPct < 100 ? BORDER.sticker : 'none',
                }}
              />
            </div>
          </Sticker>
        </motion.div>

        {/* CATEGORY GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {categories.map((category, index) => {
            const learned = categoryProgress[category.id] || 0
            const total = category.words.length
            const progressPct = total > 0 ? Math.round((learned / total) * 100) : 0
            const palette = CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.2 + index * 0.06,
                  type: 'spring',
                  stiffness: 240,
                  damping: 22,
                }}
              >
                <Link href={`/vocabulary/${category.id}`} style={{ display: 'block' }}>
                  <Sticker
                    color={palette.bg}
                    radius={20}
                    padding={14}
                    onClick={() => {
                      playSound('pop')
                      router.push(`/vocabulary/${category.id}`)
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        background: palette.motifBg,
                        borderRadius: 14,
                        border: BORDER.thin,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        marginBottom: 10,
                      }}
                    >
                      <div style={{ transform: 'scale(0.65)' }}>
                        <MotifIcon kind={palette.motif} size={64} />
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: FONTS.display,
                        fontWeight: 800,
                        fontSize: 15,
                        color: COLORS.ink,
                        letterSpacing: -0.2,
                        lineHeight: 1.15,
                      }}
                    >
                      {category.title}
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        fontFamily: FONTS.body,
                        fontWeight: 700,
                        fontSize: 11,
                        color: COLORS.ink60,
                      }}
                    >
                      {learned}/{total} words
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        height: 6,
                        background: '#fff',
                        borderRadius: 99,
                        border: BORDER.thin,
                        overflow: 'hidden',
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ delay: 0.35 + index * 0.05, duration: 0.7, ease: 'easeOut' }}
                        style={{
                          height: '100%',
                          background: progressPct === 100 ? COLORS.green : COLORS.orange,
                        }}
                      />
                    </div>
                  </Sticker>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
