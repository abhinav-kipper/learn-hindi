'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sticker,
  Tag,
  Mascot,
  DoneFold,
  COLORS,
  FONTS,
  BORDER,
  useTheme,
} from '@/components/design'
import {
  getLezenTexts,
  getTextsByTier,
  getStudiedCount,
  isStudied,
  getMockHistory,
  type Tier,
  type LezenText,
} from '@/lib/dutch/lezen'
import { playSound } from '@/lib/sounds'

const W = '#fff' // @design-allow: white literal
const GREEN = '#1f8a3a' // @design-allow: semantic pass color
const RED = '#b94a4a' // @design-allow: semantic fail color

const TIERS: Array<{ key: Tier; label: string; subtitle: string; color: string }> = [
  { key: 'A1', label: 'Beginner',     subtitle: 'A1 · simple texts',           color: COLORS.mint },
  { key: 'A2', label: 'Elementary',   subtitle: 'A2 · everyday scenarios',     color: COLORS.butter },
  { key: 'B1', label: 'Intermediate', subtitle: 'B1 · government info (preview)', color: COLORS.peach },
]

export default function LezenModulePage() {
  const router = useRouter()
  const theme = useTheme()
  const [studiedCount, setStudiedCount] = useState(0)
  const [attempts, setAttempts] = useState<ReturnType<typeof getMockHistory>>([])
  const [openTiers, setOpenTiers] = useState<Set<Tier>>(new Set<Tier>(['A1']))

  useEffect(() => {
    setStudiedCount(getStudiedCount())
    setAttempts(getMockHistory())
  }, [])

  const total = getLezenTexts().length

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
    router.push('/dutch/lezen/mock')
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
          <Tag>Lezen</Tag>
          <h1 style={{
            fontFamily: FONTS.display, fontSize: 28, fontWeight: 800, color: COLORS.ink,
            margin: '6px 0 4px',
          }}>
            Reading practice
          </h1>
          <p style={{
            fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, opacity: 0.7, margin: 0,
          }}>
            <em>Lezen oefenen</em> · {studiedCount} / {total} studied
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
                5 texts · 20 questions · 25 min · Dutch only
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 11, color: W, opacity: 0.75, marginTop: 4, fontStyle: 'italic' }}>
                Study first if you&apos;re new, bilingual mode helps.
              </div>
            </div>
          </div>
        </Sticker>

        {TIERS.map((tier) => {
          const texts = getTextsByTier(tier.key)
          const studiedInTier = texts.filter((t) => isStudied(t.id)).length
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
                    {studiedInTier} / {texts.length} {isOpen ? '▴' : '▾'}
                  </div>
                </div>
              </Sticker>
              {isOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, paddingLeft: 8 }}>
                  {texts.filter((t) => !isStudied(t.id)).map((t) => (
                    <TextCard key={t.id} text={t} onOpen={() => router.push(`/dutch/lezen/${t.id}`)} />
                  ))}
                  <DoneFold
                    count={studiedInTier}
                    noun="studied"
                    gap={8}
                    storageKey={`dutch-lezen-${tier.key}-studied-fold`}
                  >
                    {texts.filter((t) => isStudied(t.id)).map((t) => (
                      <TextCard key={t.id} text={t} onOpen={() => router.push(`/dutch/lezen/${t.id}`)} />
                    ))}
                  </DoneFold>
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

function TextCard({ text, onOpen }: { text: LezenText; onOpen: () => void }) {
  const [studied, setStudiedLocal] = useState(false)
  useEffect(() => { setStudiedLocal(isStudied(text.id)) }, [text.id])

  return (
    <Sticker color={W} radius={12} padding={12} onClick={onOpen}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 15, color: COLORS.ink }}>
            {text.title_en}
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.ink, opacity: 0.6, fontStyle: 'italic' }}>
            {text.title_nl} · {text.word_count} words
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
