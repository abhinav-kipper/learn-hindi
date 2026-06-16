'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mascot, COLORS, FONTS, BORDER, SHADOW } from '@/components/design'
import { useLanguage } from '@/lib/language-context'
import { playSound } from '@/lib/sounds'
import { speak, stopSpeaking } from '@/lib/speech'
import { promptForDate, dateKey, getEntry, getJournalStreak } from '@/lib/journal'

const W = '#fff' // @design-allow: white literal

/**
 * The home-screen entry point for Chai Diary: "aaj ka sawaal" — today's prompt
 * with Chaina's read-aloud + a CTA into /diary. Mirrors the daily ritual.
 */
export function DiaryHomeCard() {
  const router = useRouter()
  const { config } = useLanguage()
  const prompt = promptForDate()
  const [speaking, setSpeaking] = useState(false)
  const [streak, setStreak] = useState(0)
  const [doneToday, setDoneToday] = useState(false)

  useEffect(() => {
    setStreak(getJournalStreak(config.storagePrefix))
    setDoneToday(!!getEntry(config.storagePrefix, dateKey())?.done)
  }, [config.storagePrefix])
  useEffect(() => () => stopSpeaking(), [])

  const doSpeak = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (speaking) { stopSpeaking(); setSpeaking(false); return }
    setSpeaking(true)
    speak(prompt.hinglish, config.ttsLocale, () => setSpeaking(false))
  }

  const open = () => { playSound('pop'); router.push('/diary') }

  return (
    <div style={{ background: W, border: BORDER.sticker, borderRadius: 22, boxShadow: SHADOW.sticker, padding: 16, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ display: 'inline-block', background: COLORS.cream, color: COLORS.ink, border: BORDER.thin, borderRadius: 999, padding: '3px 10px', fontFamily: FONTS.tag, fontSize: 9.5, letterSpacing: 0.3 }}>AAJ KA SAWAAL ☕</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: COLORS.journalAccent2, color: W, border: BORDER.thin, borderRadius: 999, padding: '3px 9px', boxShadow: SHADOW.chip, fontFamily: FONTS.display, fontWeight: 800, fontSize: 12 }}>
          <span style={{ animation: 'flame-flicker 0.9s infinite', display: 'inline-block' }}>🔥</span>{streak}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
        <div style={{ flexShrink: 0, animation: speaking ? 'galli-bob 0.5s ease-in-out infinite' : 'float-y 3.4s ease-in-out infinite', transformOrigin: 'bottom center' }}>
          <Mascot size={66} mood={speaking ? 'happy' : 'wave'} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 18, color: COLORS.ink, lineHeight: 1.2, letterSpacing: -0.2 }}>{prompt.hinglish}</div>
          <button type="button" onClick={doSpeak} style={{ marginTop: 7, display: 'inline-flex', alignItems: 'center', gap: 6, background: speaking ? COLORS.journalAccent : W, color: speaking ? W : COLORS.ink, border: BORDER.thin, borderRadius: 999, padding: '4px 11px 4px 5px', boxShadow: SHADOW.chip, cursor: 'pointer', fontFamily: FONTS.display, fontWeight: 800, fontSize: 12, textTransform: 'lowercase' }}>
            <span style={{ width: 18, height: 22, display: 'inline-flex', alignItems: 'flex-end' }}><Mascot size={18} mood={speaking ? 'happy' : 'idle'} /></span>
            {speaking ? 'bol rahi…' : 'Chaina padhegi'}
          </button>
        </div>
      </div>
      <button type="button" onClick={open} style={{ width: '100%', marginTop: 14, padding: 13, border: BORDER.sticker, borderRadius: 16, background: COLORS.journalAccent, color: W, boxShadow: SHADOW.sticker, cursor: 'pointer', fontFamily: FONTS.display, fontWeight: 800, fontSize: 15.5, textTransform: 'lowercase' }}>
        {doneToday ? 'aaj ka panna dekho →' : 'likhne baitho →'}
      </button>
    </div>
  )
}
