'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sticker,
  Tag,
  Mascot,
  COLORS,
  FONTS,
  useTheme,
} from '@/components/design'
import {
  getClips,
  getClipsByTier,
  getStudiedCount,
  isStudied,
  getMockHistory,
  type Tier,
  type LuisterClip,
} from '@/lib/dutch/luisteren'
import { playSound } from '@/lib/sounds'

const W = '#fff' // @design-allow: white literal
const GREEN = '#1f8a3a' // @design-allow: semantic pass color
const RED = '#b94a4a' // @design-allow: semantic fail color

const TIERS: Array<{ key: Tier; label: string; subtitle: string; color: string }> = [
  { key: 'A1', label: 'Beginner', subtitle: 'A1 · announcements & short talk', color: COLORS.mint },
  { key: 'A2', label: 'Elementary', subtitle: 'A2 · everyday conversations', color: COLORS.butter },
  { key: 'B1', label: 'Intermediate', subtitle: 'B1 · interviews & news', color: COLORS.peach },
]

export default function LuisterenModulePage() {
  const router = useRouter()
  const theme = useTheme()
  const [studiedCount, setStudiedCount] = useState(0)
  const [attempts, setAttempts] = useState<ReturnType<typeof getMockHistory>>([])
  const [openTiers, setOpenTiers] = useState<Set<Tier>>(new Set<Tier>(['A1']))

  useEffect(() => {
    setStudiedCount(getStudiedCount())
    setAttempts(getMockHistory())
  }, [])

  const total = getClips().length

  const toggleTier = (t: Tier) => {
    playSound('tap')
    setOpenTiers((prev) => {
      const next = new Set(prev)
      if (next.has(t)) next.delete(t)
      else next.add(t)
      return next
    })
  }

  const onStartMock = () => {
    playSound('pop')
    router.push('/dutch/luisteren/mock')
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
          <Tag>Luisteren</Tag>
          <h1 style={{
            fontFamily: FONTS.display, fontSize: 28, fontWeight: 800, color: COLORS.ink,
            margin: '6px 0 4px',
          }}>
            Listening practice
          </h1>
          <p style={{
            fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, opacity: 0.7, margin: 0,
          }}>
            <em>Luisteren oefenen</em> · {studiedCount} / {total} studied
          </p>
          <p style={{
            fontFamily: FONTS.body, fontSize: 12, color: COLORS.ink, opacity: 0.6, margin: '6px 0 0', fontStyle: 'italic',
          }}>
            Audio is read aloud by your device&apos;s Dutch voice. Listen first, then reveal the transcript to check.
          </p>
        </div>

        <Sticker color={theme.primary} radius={22} padding={16} onClick={onStartMock} style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Mascot size={56} mood="happy" />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 18, color: W }}>
                Start timed mock
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 13, color: W, opacity: 0.9, marginTop: 2 }}>
                5 clips · 20 questions · 25 min · audio only
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 11, color: W, opacity: 0.75, marginTop: 4, fontStyle: 'italic' }}>
                Study first if you&apos;re new — the transcript helps.
              </div>
            </div>
          </div>
        </Sticker>

        {TIERS.map((tier) => {
          const clips = getClipsByTier(tier.key)
          const studiedInTier = clips.filter((c) => isStudied(c.id)).length
          const isOpen = openTiers.has(tier.key)
          return (
            <div key={tier.key} style={{ marginBottom: 16 }}>
              <Sticker color={tier.color} radius={16} padding={12} onClick={() => toggleTier(tier.key)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 16, color: COLORS.ink }}>
                      {tier.label}
                    </div>
                    <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.ink, opacity: 0.7, fontStyle: 'italic' }}>
                      {tier.subtitle}
                    </div>
                  </div>
                  <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, fontWeight: 700 }}>
                    {studiedInTier} / {clips.length} {isOpen ? '▴' : '▾'}
                  </div>
                </div>
              </Sticker>
              {isOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, paddingLeft: 8 }}>
                  {clips.map((c) => (
                    <ClipCard key={c.id} clip={c} onOpen={() => router.push(`/dutch/luisteren/${c.id}`)} />
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {attempts.length > 0 && (
          <details style={{ marginTop: 16 }}>
            <summary style={{
              fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink, cursor: 'pointer',
            }}>
              Past mocks ({attempts.length})
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

function ClipCard({ clip, onOpen }: { clip: LuisterClip; onOpen: () => void }) {
  const [studied, setStudiedLocal] = useState(false)
  useEffect(() => { setStudiedLocal(isStudied(clip.id)) }, [clip.id])

  return (
    <Sticker color={W} radius={12} padding={12} onClick={onOpen}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 15, color: COLORS.ink }}>
            🔊 {clip.title_en}
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.ink, opacity: 0.6, fontStyle: 'italic' }}>
            {clip.title_nl} · {clip.format === 'dialogue' ? 'dialogue' : 'monologue'}
          </div>
        </div>
        {studied && (
          <div style={{
            fontFamily: FONTS.body, fontSize: 11, color: COLORS.ink, fontWeight: 700,
            background: COLORS.mint, padding: '2px 8px', borderRadius: 999,
          }}>
            ✓ studied
          </div>
        )}
      </div>
    </Sticker>
  )
}
