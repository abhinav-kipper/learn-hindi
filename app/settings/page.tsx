'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { getUserProfile, saveUserProfile } from '@/lib/onboarding'
import { isMuted, toggleMute, playSound } from '@/lib/sounds'
import { isAmbientOn, setAmbientOn } from '@/lib/ambient'
import { warmOfflineCache } from '@/lib/offline-cache'
import { useLanguage } from '@/lib/language-context'
import {
  Sticker,
  Tag,
  Mascot,
  DottedBg,
  COLORS,
  FONTS,
  BORDER,
  SHADOW,
} from '@/components/design'

const W = '#fff' // @design-allow: white literal

const reasons = [
  { id: 'family', label: 'partner/family speaks Hindi', emoji: '👨‍👩‍👧' },
  { id: 'bollywood', label: 'want to understand Bollywood', emoji: '🎬' },
  { id: 'moving', label: 'moving to India', emoji: '✈️' },
  { id: 'curious', label: 'just curious yaar', emoji: '🤷' },
]

const goalPresets = [5, 10, 15]

export default function SettingsPage() {
  const router = useRouter()
  const { language, setLanguage, config } = useLanguage()
  const [ready, setReady] = useState(false)
  const [name, setName] = useState('')
  const [reason, setReason] = useState('')
  const [gender, setGender] = useState<'female' | 'male'>('female')
  const [dailyGoal, setDailyGoal] = useState(5)
  const [muted, setMuted] = useState(false)
  const [ambient, setAmbient] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [justReset, setJustReset] = useState(false)
  const [dlState, setDlState] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [dlPct, setDlPct] = useState(0)
  const [dlLabel, setDlLabel] = useState('')
  const [savedDate, setSavedDate] = useState<string | null>(null)

  const OFFLINE_SAVED_KEY = 'bs-offline-full-saved-date'

  useEffect(() => {
    const p = getUserProfile()
    setName(p.name || '')
    setReason(p.reason || '')
    setGender(p.gender || 'female')
    setDailyGoal(p.dailyGoal || 5)
    setMuted(isMuted())
    setAmbient(isAmbientOn())
    try {
      setSavedDate(localStorage.getItem(OFFLINE_SAVED_KEY))
    } catch {
      /* ignore */
    }
    setReady(true)
  }, [])

  async function downloadOffline() {
    if (dlState === 'running') return
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setDlState('error')
      setDlLabel('connect to the internet first')
      return
    }
    setDlState('running')
    setDlPct(0)
    setDlLabel('lessons')
    playSound('tap')
    try {
      const res = await warmOfflineCache({
        audio: true,
        language: language === 'dutch' ? 'dutch' : 'hindi',
        onProgress: (p) => {
          const frac = p.total ? p.done / p.total : 0
          if (p.phase === 'pages') {
            setDlPct(Math.round(frac * 25))
            setDlLabel('lessons')
          } else if (p.phase === 'assets') {
            setDlPct(25 + Math.round(frac * 20))
            setDlLabel('app files')
          } else if (p.phase === 'audio') {
            setDlPct(45 + Math.round(frac * 55))
            setDlLabel('audio clips')
          } else {
            setDlPct(100)
          }
        },
      })
      if (res.pages === 0) {
        setDlState('error')
        setDlLabel('could not download, check your connection')
        return
      }
      const today = new Date().toISOString().split('T')[0]
      try {
        localStorage.setItem(OFFLINE_SAVED_KEY, today)
      } catch {
        /* ignore */
      }
      setSavedDate(today)
      setDlState('done')
      playSound('levelup')
    } catch {
      setDlState('error')
      setDlLabel('something went wrong')
    }
  }

  function updateGoal(g: number) {
    const clamped = Math.max(1, Math.min(120, Math.round(g)))
    setDailyGoal(clamped)
    saveUserProfile({ dailyGoal: clamped })
    playSound('pop')
  }

  function updateName(n: string) {
    setName(n)
    saveUserProfile({ name: n.trim() || 'Friend' })
  }

  function updateReason(r: string) {
    setReason(r)
    saveUserProfile({ reason: r })
    playSound('pop')
  }

  function updateGender(g: 'female' | 'male') {
    setGender(g)
    saveUserProfile({ gender: g })
    playSound('pop')
  }

  function handleMute() {
    const m = toggleMute()
    setMuted(m)
    if (!m) playSound('tap')
  }

  function handleAmbient() {
    const next = !ambient
    setAmbient(next)
    setAmbientOn(next, language === 'dutch' ? 'dutch' : 'hindi')
    if (next) playSound('tap')
  }

  function handleLanguage(next: 'hindi' | 'dutch') {
    if (next === language) return
    setLanguage(next)
    playSound('swipe')
  }

  function resetProgress() {
    if (typeof window === 'undefined') return
    const prefix = config.storagePrefix
    const toDelete: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(`${prefix}-`)) toDelete.push(key)
    }
    toDelete.forEach((k) => localStorage.removeItem(k))
    setConfirmReset(false)
    setJustReset(true)
    playSound('levelup')
    setTimeout(() => setJustReset(false), 2200)
  }

  if (!ready) {
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
            border: `3px solid ${COLORS.ink}`, // @design-allow: CSS spinner ring
            borderTopColor: 'transparent',
          }}
        />
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', background: COLORS.lav, paddingBottom: 110 }}>
      <DottedBg />

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        style={{
          position: 'relative',
          padding: '50px 20px 18px',
          background: COLORS.cream,
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
            <button
              type="button"
              onClick={() => {
                playSound('tap')
                router.back()
              }}
              aria-label="Go back"
              style={{
                background: W,
                border: BORDER.sticker,
                boxShadow: SHADOW.chip,
                borderRadius: 99,
                width: 34,
                height: 34,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginBottom: 10,
                color: COLORS.ink,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <Tag>⚙ settings</Tag>
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
              tinker, tweak
            </div>
          </div>
          <div style={{ marginRight: -6, marginTop: -6 }}>
            <Mascot size={62} />
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
        {/* DAILY GOAL */}
        <Section title="daily goal" subtitle="minutes per day">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {goalPresets.map((g) => (
              <Sticker
                key={g}
                color={dailyGoal === g ? COLORS.mint : W}
                radius={16}
                padding={12}
                selected={dailyGoal === g}
                onClick={() => updateGoal(g)}
              >
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontFamily: FONTS.display,
                      fontWeight: 800,
                      fontSize: 22,
                      color: COLORS.ink,
                      lineHeight: 1,
                    }}
                  >
                    {g}
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.body,
                      fontWeight: 700,
                      fontSize: 11,
                      color: COLORS.ink60,
                      marginTop: 4,
                    }}
                  >
                    min
                  </div>
                </div>
              </Sticker>
            ))}
          </div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                fontFamily: FONTS.body,
                fontWeight: 700,
                fontSize: 13,
                color: COLORS.ink60,
              }}
            >
              custom:
            </div>
            <input
              type="number"
              min={1}
              max={120}
              value={dailyGoal}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (Number.isFinite(v)) updateGoal(v)
              }}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 99,
                border: BORDER.sticker,
                background: W,
                color: COLORS.ink,
                fontFamily: FONTS.body,
                fontSize: 15,
                fontWeight: 700,
                boxShadow: SHADOW.chip,
                outline: 'none',
                boxSizing: 'border-box',
                minWidth: 0,
              }}
            />
            <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 13, color: COLORS.ink }}>min</div>
          </div>
        </Section>

        {/* ABOUT YOU */}
        <Section title="about you">
          <Label>your name</Label>
          <input
            type="text"
            value={name}
            onChange={(e) => updateName(e.target.value)}
            placeholder="dost"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 99,
              border: BORDER.sticker,
              background: W,
              color: COLORS.ink,
              fontFamily: FONTS.body,
              fontSize: 15,
              fontWeight: 700,
              boxShadow: SHADOW.chip,
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: 14,
            }}
          />

          <Label>you are</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            {(['female', 'male'] as const).map((g) => (
              <Sticker
                key={g}
                color={gender === g ? COLORS.mint : W}
                radius={16}
                padding={10}
                selected={gender === g}
                onClick={() => updateGender(g)}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22 }}>{g === 'female' ? '👩' : '👨'}</div>
                  <div
                    style={{
                      marginTop: 4,
                      fontFamily: FONTS.body,
                      fontWeight: 700,
                      fontSize: 11,
                      color: COLORS.ink,
                      lineHeight: 1.2,
                    }}
                  >
                    {g}
                  </div>
                </div>
              </Sticker>
            ))}
          </div>

          <Label>why are you here?</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {reasons.map((r) => (
              <Sticker
                key={r.id}
                color={reason === r.id ? COLORS.mint : W}
                radius={16}
                padding={10}
                selected={reason === r.id}
                onClick={() => updateReason(r.id)}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24 }}>{r.emoji}</div>
                  <div
                    style={{
                      marginTop: 4,
                      fontFamily: FONTS.body,
                      fontWeight: 700,
                      fontSize: 11,
                      color: COLORS.ink,
                      lineHeight: 1.2,
                    }}
                  >
                    {r.label}
                  </div>
                </div>
              </Sticker>
            ))}
          </div>
        </Section>

        {/* SOUNDS */}
        <Section title="sounds">
          <Sticker color={muted ? W : COLORS.butter} radius={16} padding={14} onClick={handleMute}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 26 }}>{muted ? '🔇' : '🔊'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 15,
                    color: COLORS.ink,
                    lineHeight: 1.1,
                  }}
                >
                  {muted ? 'sounds off' : 'sounds on'}
                </div>
                <div
                  style={{
                    fontFamily: FONTS.body,
                    fontWeight: 700,
                    fontSize: 12,
                    color: COLORS.ink60,
                    marginTop: 2,
                  }}
                >
                  taps, chimes, celebrations
                </div>
              </div>
              <div
                style={{
                  width: 44,
                  height: 26,
                  borderRadius: 99,
                  border: BORDER.sticker,
                  background: muted ? W : COLORS.green,
                  position: 'relative',
                  flexShrink: 0,
                  transition: 'background 0.2s',
                }}
              >
                <motion.div
                  animate={{ x: muted ? 0 : 18 }}
                  transition={{ type: 'spring', stiffness: 480, damping: 30 }}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 99,
                    background: W,
                    border: BORDER.thin,
                    position: 'absolute',
                    top: 2,
                    left: 2,
                  }}
                />
              </div>
            </div>
          </Sticker>

          <div style={{ height: 8 }} />

          <Sticker color={ambient ? COLORS.mint2 : W} radius={16} padding={14} onClick={handleAmbient}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 26 }}>{ambient ? '🎧' : '🫧'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 15,
                    color: COLORS.ink,
                    lineHeight: 1.1,
                  }}
                >
                  {ambient ? 'ambient on' : 'ambient off'}
                </div>
                <div
                  style={{
                    fontFamily: FONTS.body,
                    fontWeight: 700,
                    fontSize: 12,
                    color: COLORS.ink60,
                    marginTop: 2,
                  }}
                >
                  {language === 'dutch' ? 'faint café hum on home' : 'faint chai-stall hum on home'}
                </div>
              </div>
              <div
                style={{
                  width: 44,
                  height: 26,
                  borderRadius: 99,
                  border: BORDER.sticker,
                  background: ambient ? COLORS.green : W,
                  position: 'relative',
                  flexShrink: 0,
                  transition: 'background 0.2s',
                }}
              >
                <motion.div
                  animate={{ x: ambient ? 18 : 0 }}
                  transition={{ type: 'spring', stiffness: 480, damping: 30 }}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 99,
                    background: W,
                    border: BORDER.thin,
                    position: 'absolute',
                    top: 2,
                    left: 2,
                  }}
                />
              </div>
            </div>
          </Sticker>
        </Section>

        {/* OFFLINE */}
        <Section title="offline" subtitle="save the app so lessons work with no internet">
          <Sticker color={dlState === 'done' ? COLORS.mint2 : COLORS.butter} radius={16} padding={14}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 26 }}>{dlState === 'done' ? '✅' : '📥'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 15,
                    color: COLORS.ink,
                    lineHeight: 1.1,
                  }}
                >
                  download for offline
                </div>
                <div
                  style={{
                    fontFamily: FONTS.body,
                    fontWeight: 700,
                    fontSize: 12,
                    color: COLORS.ink60,
                    marginTop: 2,
                    lineHeight: 1.35,
                  }}
                >
                  {dlState === 'running'
                    ? `downloading ${dlLabel}… ${dlPct}%`
                    : dlState === 'error'
                    ? dlLabel
                    : dlState === 'done'
                    ? 'saved! all lessons + audio work offline now'
                    : savedDate
                    ? `last saved ${savedDate} · tap to update`
                    : 'grabs every lesson, grammar chapter + "hear it" audio'}
                </div>
              </div>
            </div>

            {dlState === 'running' && (
              <div
                style={{
                  marginTop: 12,
                  height: 12,
                  borderRadius: 99,
                  border: BORDER.thin,
                  background: W,
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  animate={{ width: `${dlPct}%` }}
                  transition={{ ease: 'easeOut', duration: 0.3 }}
                  style={{ height: '100%', background: COLORS.green }}
                />
              </div>
            )}

            <button
              type="button"
              onClick={downloadOffline}
              disabled={dlState === 'running'}
              style={{
                marginTop: 12,
                width: '100%',
                padding: '11px',
                background: dlState === 'done' ? W : COLORS.orange,
                color: dlState === 'done' ? COLORS.ink : W,
                border: BORDER.sticker,
                boxShadow: SHADOW.chip,
                borderRadius: 99,
                fontFamily: FONTS.display,
                fontWeight: 800,
                fontSize: 14,
                cursor: dlState === 'running' ? 'wait' : 'pointer',
                opacity: dlState === 'running' ? 0.6 : 1,
                textTransform: 'lowercase',
              }}
            >
              {dlState === 'running'
                ? `downloading… ${dlPct}%`
                : dlState === 'done'
                ? 'download again'
                : savedDate
                ? 'update offline files'
                : 'save everything for offline'}
            </button>
          </Sticker>
        </Section>

        {/* LANGUAGE */}
        <Section title="language" subtitle="progress is kept separately per language">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {(['hindi', 'dutch'] as const).map((l) => (
              <Sticker
                key={l}
                color={language === l ? COLORS.peach : W}
                radius={16}
                padding={12}
                selected={language === l}
                onClick={() => handleLanguage(l)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                  <div style={{ fontSize: 24 }}>{l === 'hindi' ? '🇮🇳' : '🇳🇱'}</div>
                  <div
                    style={{
                      fontFamily: FONTS.display,
                      fontWeight: 800,
                      fontSize: 15,
                      color: COLORS.ink,
                      lineHeight: 1,
                    }}
                  >
                    {l === 'hindi' ? 'hindi' : 'dutch'}
                  </div>
                </div>
              </Sticker>
            ))}
          </div>
        </Section>

        {/* DANGER ZONE */}
        <Sticker color={COLORS.redBg} radius={22} padding={18}>
          <div
            style={{
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 13,
              color: COLORS.red,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
            }}
          >
            ⚠ danger zone
          </div>
          <div
            style={{
              fontFamily: FONTS.body,
              fontWeight: 700,
              fontSize: 13,
              color: COLORS.ink,
              marginTop: 6,
              lineHeight: 1.4,
            }}
          >
            wipe your {language === 'hindi' ? 'Hindi' : 'Dutch'} progress, streak, completed lessons, mistakes, favorites, quiz scores. your profile stays.
          </div>
          {justReset ? (
            <div
              style={{
                marginTop: 12,
                fontFamily: FONTS.display,
                fontWeight: 800,
                fontSize: 14,
                color: COLORS.green,
              }}
            >
              ✓ wiped, fresh start
            </div>
          ) : !confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              style={{
                marginTop: 12,
                padding: '10px 18px',
                background: W,
                color: COLORS.red,
                border: `2.5px solid ${COLORS.red}`,
                borderRadius: 99,
                fontFamily: FONTS.display,
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                textTransform: 'lowercase',
              }}
            >
              reset progress
            </button>
          ) : (
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={resetProgress}
                style={{
                  flex: 1,
                  padding: '10px 18px',
                  background: COLORS.red,
                  color: W,
                  border: BORDER.sticker,
                  boxShadow: SHADOW.chip,
                  borderRadius: 99,
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  textTransform: 'lowercase',
                }}
              >
                yes, wipe it
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                style={{
                  flex: 1,
                  padding: '10px 18px',
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
                }}
              >
                nope, cancel
              </button>
            </div>
          )}
        </Sticker>
      </div>
    </div>
  )
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <Sticker color={W} radius={22} padding={18}>
      <div
        style={{
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 13,
          color: COLORS.ink,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontFamily: FONTS.body,
            fontWeight: 700,
            fontSize: 12,
            color: COLORS.ink60,
            marginTop: 2,
            marginBottom: 4,
          }}
        >
          {subtitle}
        </div>
      )}
      <div style={{ marginTop: 12 }}>{children}</div>
    </Sticker>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: FONTS.display,
        fontWeight: 800,
        fontSize: 12,
        color: COLORS.ink,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  )
}
