'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sticker, Tag, Mascot, COLORS, FONTS, BORDER, useTheme } from '@/components/design'
import {
  getPacks,
  getPacksByStage,
  getPackProgress,
  getStageProgress,
  getDueCount,
  getMasteredCount,
  getAllEntries,
  getNextPack,
  STAGES,
  type Stage,
  type WordPack,
} from '@/lib/dutch/woorden'
import { playSound } from '@/lib/sounds'

const W = '#fff' // @design-allow: white literal
const GREEN = '#1f8a3a' // @design-allow: semantic pass color

const STAGE_LABEL: Record<Stage, string> = {
  A0: 'From zero',
  A1: 'Getting by',
  A2: 'Exam level',
}

export default function WoordenHub() {
  const router = useRouter()
  const theme = useTheme()
  const [ready, setReady] = useState(false)
  const [due, setDue] = useState(0)
  const [mastered, setMastered] = useState(0)
  const [next, setNext] = useState<WordPack | undefined>(undefined)

  useEffect(() => {
    setDue(getDueCount())
    setMastered(getMasteredCount())
    setNext(getNextPack())
    setReady(true)
  }, [])

  const total = getAllEntries().length

  const go = (href: string) => {
    playSound('pop')
    router.push(href)
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
          <Tag>Word Lab</Tag>
          <h1 style={{
            fontFamily: FONTS.display, fontSize: 28, fontWeight: 800, color: COLORS.ink,
            margin: '6px 0 4px',
          }}>
            Words that stick
          </h1>
          <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, opacity: 0.7, margin: 0 }}>
            <em>woordenschat</em> · {ready ? mastered : 0} / {total} known
          </p>
        </div>

        {/* Say what makes this different from a flashcard deck, because the
            difference is the whole point. */}
        <Sticker color={COLORS.butter} radius={18} padding={14} style={{ marginBottom: 14 }}>
          <div style={{
            fontFamily: FONTS.display, fontWeight: 800, fontSize: 13, color: COLORS.ink,
            textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
          }}>
            How this works
          </div>
          <p style={{ fontFamily: FONTS.body, fontSize: 13.5, color: COLORS.ink, margin: 0, lineHeight: 1.55 }}>
            You learn <strong>whole chunks</strong>, not bare words. So <strong>elke dag</strong>, not
            elke. And <strong>het huis</strong>, never huis on its own, because the article is the part
            that stays wrong longest. Each chunk comes back on a spacing schedule until you have
            recalled it eight times from memory.
          </p>
        </Sticker>

        {ready && due > 0 && (
          <Sticker
            color={theme.primary}
            radius={22}
            padding={16}
            onClick={() => go('/dutch/woorden/review')}
            style={{ marginBottom: 14 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Mascot size={56} mood="happy" />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 18, color: W }}>
                  Review {due} {due === 1 ? 'chunk' : 'chunks'}
                </div>
                <div style={{ fontFamily: FONTS.body, fontSize: 12.5, color: W, opacity: 0.9, marginTop: 3, lineHeight: 1.45 }}>
                  Due today. Typing them from memory is what makes them stick.
                </div>
              </div>
              <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 20, color: W }}>→</span>
            </div>
          </Sticker>
        )}

        {ready && due === 0 && next && (
          <Sticker
            color={theme.primary}
            radius={22}
            padding={16}
            onClick={() => go(`/dutch/woorden/${next.id}`)}
            style={{ marginBottom: 14 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Mascot size={56} mood="happy" />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 18, color: W }}>
                  Nothing due. Learn more?
                </div>
                <div style={{ fontFamily: FONTS.body, fontSize: 12.5, color: W, opacity: 0.9, marginTop: 3 }}>
                  Next up: {next.title}
                </div>
              </div>
              <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 20, color: W }}>→</span>
            </div>
          </Sticker>
        )}

        {ready && due === 0 && !next && (
          <Sticker color={COLORS.mint2} radius={18} padding={14} style={{ marginBottom: 14 }}>
            <p style={{ fontFamily: FONTS.body, fontSize: 13.5, color: COLORS.ink, margin: 0, lineHeight: 1.5 }}>
              Nothing due right now, and you have met every chunk. Come back tomorrow: the whole point
              of the spacing is that you return just as it starts to fade.
            </p>
          </Sticker>
        )}

        {STAGES.map((stage) => {
          const sp = ready ? getStageProgress(stage) : { met: 0, mastered: 0, total: 0 }
          return (
            <div key={stage} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                <span style={{
                  background: COLORS.lav, border: BORDER.sticker, borderRadius: 999,
                  padding: '1px 9px', fontFamily: FONTS.display, fontWeight: 800,
                  fontSize: 11, color: COLORS.ink,
                }}>
                  {stage}
                </span>
                <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 15, color: COLORS.ink }}>
                  {STAGE_LABEL[stage]}
                </div>
                <div style={{ marginLeft: 'auto', fontFamily: FONTS.body, fontSize: 12, color: COLORS.ink, opacity: 0.6 }}>
                  {sp.mastered}/{sp.total} known
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {getPacksByStage(stage).map((p) => {
                  const pr = ready ? getPackProgress(p.id) : { met: 0, mastered: 0, total: p.entries.length }
                  const pct = pr.total ? Math.round((pr.mastered / pr.total) * 100) : 0
                  return (
                    <Sticker key={p.id} color={W} radius={16} padding={12} onClick={() => go(`/dutch/woorden/${p.id}`)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <span style={{ fontSize: 22, flexShrink: 0 }}>{p.emoji}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 15, color: COLORS.ink }}>
                            {p.title}
                          </div>
                          <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.ink, opacity: 0.65, marginTop: 1 }}>
                            <em>{p.subtitle_nl}</em> · {pr.total} chunks
                          </div>
                          <div style={{
                            marginTop: 6, height: 7, borderRadius: 999, background: COLORS.lav,
                            border: BORDER.thin, overflow: 'hidden',
                          }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: GREEN }} />
                          </div>
                        </div>
                        {pr.mastered === pr.total && pr.total > 0 && (
                          <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 13, color: GREEN, flexShrink: 0 }}>
                            ✓
                          </span>
                        )}
                      </div>
                    </Sticker>
                  )
                })}
              </div>
            </div>
          )
        })}

        <Sticker color={COLORS.mint2} radius={14} padding={12}>
          <p style={{ fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.ink, margin: 0, lineHeight: 1.5 }}>
            <strong>Why chunks:</strong> studies of collocation learning find better retention when a
            phrase is met whole than when you assemble it from parts, and naming the pattern out loud
            helps again on top of that. The packs are ordered by frequency because the common core is
            where the coverage is: roughly two thousand word families already carry about 96% of
            everyday spoken Dutch, which is what the exam is made of.
          </p>
        </Sticker>
      </div>
    </div>
  )
}
