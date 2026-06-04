'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getDuels, getDuelBest } from '@/lib/games'
import { getSentenceGames, getSentenceBest } from '@/lib/sentence-game'
import { useLanguage } from '@/lib/language-context'
import { playSound } from '@/lib/sounds'
import {
  Sticker,
  Tag,
  Mascot,
  DottedBg,
  COLORS,
  FONTS,
  BORDER,
  SHADOW,
  useTheme,
} from '@/components/design'

const W = '#fff' // @design-allow: white literal

export default function PlayPage() {
  const { language, config } = useLanguage()
  const theme = useTheme()
  const duels = getDuels(language)
  const sentenceGames = getSentenceGames(language)
  const [bests, setBests] = useState<Record<string, string>>({})

  useEffect(() => {
    const next: Record<string, string> = {}
    for (const d of duels) {
      const b = getDuelBest(config.storagePrefix, d.id)
      if (b) next[d.id] = `🏆 ${b.score}/${b.total}`
    }
    for (const g of sentenceGames) {
      const b = getSentenceBest(config.storagePrefix, g.id)
      if (b) next[g.id] = `🏆 ${b.score}/${b.total}`
    }
    setBests(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', background: COLORS.lav, paddingBottom: 96 }}>
      <DottedBg />

      {/* Header band */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '50px 20px 18px',
          background: COLORS.mint2,
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
          borderBottom: BORDER.sticker,
          boxShadow: SHADOW.headerBand,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', maxWidth: 480, margin: '0 auto' }}>
          <div>
            <Tag>play time</Tag>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 28, color: COLORS.ink, lineHeight: 1.05, marginTop: 6, letterSpacing: -0.5 }}>
              quizzes & games
            </div>
          </div>
          <div style={{ marginRight: -4, marginTop: -4 }}>
            <Mascot size={62} mood="happy" />
          </div>
        </div>
      </motion.div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 480, margin: '0 auto', padding: '18px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* QUIZ */}
        <SectionLabel>quiz</SectionLabel>
        <Link href="/quiz" style={{ textDecoration: 'none' }} onClick={() => playSound('tap')}>
          <Sticker color={W} radius={20} padding={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <TileIcon emoji="📝" bg={theme.primary} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 17, color: COLORS.ink }}>lesson quiz</div>
                <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 12.5, color: COLORS.ink60, marginTop: 2 }}>
                  test the phrases you have learned
                </div>
              </div>
              <Chevron />
            </div>
          </Sticker>
        </Link>

        {/* GAMES */}
        <SectionLabel>games</SectionLabel>
        {duels.length === 0 && sentenceGames.length === 0 ? (
          <Sticker color={W} radius={20} padding={18} dashed>
            <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 13.5, color: COLORS.ink60, textAlign: 'center' }}>
              more games coming soon for this language 🎮
            </div>
          </Sticker>
        ) : (
          <>
            {sentenceGames.map((g) => (
              <GameCard key={g.id} href={`/play/sentence/${g.id}`} emoji="🧩" bg={COLORS.teal} title={g.title} subtitle={g.subtitle} best={bests[g.id]} />
            ))}
            {duels.map((d) => (
              <GameCard key={d.id} href={`/play/duel/${d.id}`} emoji="⚔️" bg={COLORS.orange} title={d.title} subtitle={d.subtitle} best={bests[d.id]} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function GameCard({ href, emoji, bg, title, subtitle, best }: { href: string; emoji: string; bg: string; title: string; subtitle: string; best?: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }} onClick={() => playSound('tap')}>
      <Sticker color={COLORS.butter} radius={20} padding={16}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <TileIcon emoji={emoji} bg={bg} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 17, color: COLORS.ink }}>{title}</div>
            <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 12.5, color: COLORS.ink60, marginTop: 2 }}>{subtitle}</div>
            {best && <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 12, color: COLORS.ink45, marginTop: 4 }}>{best}</div>}
          </div>
          <Chevron />
        </div>
      </Sticker>
    </Link>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 13, color: COLORS.ink, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 4 }}>
      {children}
    </div>
  )
}

function TileIcon({ emoji, bg }: { emoji: string; bg: string }) {
  return (
    <div style={{ width: 46, height: 46, borderRadius: 14, background: bg, border: BORDER.sticker, boxShadow: SHADOW.chip, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
      {emoji}
    </div>
  )
}

function Chevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.ink45} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}
