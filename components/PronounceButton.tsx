'use client'

import { useEffect, useRef, useState } from 'react'
import { Sticker, COLORS, FONTS, BORDER, SHADOW, useTheme } from '@/components/design'
import { playSound } from '@/lib/sounds'

const W = '#fff' // @design-allow: white literal
const MAX_MS = 5000

type Feedback = { score: number; verdict: string; good: string; fix: string; close: boolean }
type Phase = 'idle' | 'recording' | 'scoring' | 'result' | 'error'

function pickMime(): string {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/aac', 'audio/ogg']
  if (typeof MediaRecorder === 'undefined') return ''
  return types.find((t) => { try { return MediaRecorder.isTypeSupported(t) } catch { return false } }) || ''
}

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onloadend = () => resolve(String(r.result).split(',')[1] ?? '')
    r.onerror = reject
    r.readAsDataURL(blob)
  })

/** Decode the recorded blob (webm/mp4 — formats Gemini won't accept) and
 *  re-encode to 16 kHz mono 16-bit WAV, which the Gemini audio API does accept. */
async function blobToWav(blob: Blob): Promise<Blob> {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const ctx = new AC()
  try {
    const audio = await ctx.decodeAudioData(await blob.arrayBuffer())
    const sr = audio.sampleRate
    const ch0 = audio.getChannelData(0)
    let mono = ch0
    if (audio.numberOfChannels > 1) {
      const ch1 = audio.getChannelData(1)
      mono = new Float32Array(ch0.length)
      for (let i = 0; i < ch0.length; i++) mono[i] = (ch0[i] + ch1[i]) / 2
    }
    const target = 16000
    const ratio = Math.max(1, sr / target)
    const outLen = Math.floor(mono.length / ratio)
    const dataSize = outLen * 2
    const buf = new ArrayBuffer(44 + dataSize)
    const dv = new DataView(buf)
    const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)) }
    w(0, 'RIFF'); dv.setUint32(4, 36 + dataSize, true); w(8, 'WAVE'); w(12, 'fmt ')
    dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true)
    dv.setUint32(24, target, true); dv.setUint32(28, target * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true)
    w(36, 'data'); dv.setUint32(40, dataSize, true)
    let off = 44
    for (let i = 0; i < outLen; i++) {
      const s = Math.max(-1, Math.min(1, mono[Math.floor(i * ratio)]))
      dv.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true)
      off += 2
    }
    return new Blob([buf], { type: 'audio/wav' })
  } finally {
    try { await ctx.close() } catch {}
  }
}

/** 🎙 record-and-compare: the learner says a word, Gemini coaches them. */
export default function PronounceButton({
  target,
  reference,
  language,
}: {
  target: string
  reference?: string
  language: string
}) {
  const theme = useTheme()
  const [phase, setPhase] = useState<Phase>('idle')
  const [fb, setFb] = useState<Feedback | null>(null)
  const [err, setErr] = useState<string>('')
  const [elapsed, setElapsed] = useState(0)

  const recRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tick = useRef<ReturnType<typeof setInterval> | null>(null)

  const cleanup = () => {
    if (stopTimer.current) clearTimeout(stopTimer.current)
    if (tick.current) clearInterval(tick.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }
  useEffect(() => cleanup, [])

  const supported =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'

  const start = async () => {
    if (!supported) { setErr('recording not supported here'); setPhase('error'); return }
    setFb(null); setErr('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType = pickMime()
      const rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      recRef.current = rec
      chunksRef.current = []
      rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data) }
      rec.onstop = () => void score(rec.mimeType || mimeType)
      rec.start()
      playSound('pop')
      setPhase('recording'); setElapsed(0)
      let ms = 0
      tick.current = setInterval(() => { ms += 100; setElapsed(ms) }, 100)
      stopTimer.current = setTimeout(() => stop(), MAX_MS)
    } catch {
      setErr('mic permission needed'); setPhase('error')
    }
  }

  const stop = () => {
    if (stopTimer.current) clearTimeout(stopTimer.current)
    if (tick.current) clearInterval(tick.current)
    try { if (recRef.current && recRef.current.state !== 'inactive') recRef.current.stop() } catch {}
  }

  const score = async (mimeType: string) => {
    setPhase('scoring')
    streamRef.current?.getTracks().forEach((t) => t.stop())
    try {
      const raw = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
      if (raw.size < 800) { setErr("didn't catch that, try again"); setPhase('error'); return }
      // Gemini accepts wav/mp3/ogg/flac/aac — not the webm/mp4 MediaRecorder
      // gives us — so transcode to WAV client-side first.
      const wav = await blobToWav(raw)
      const audioBase64 = await blobToBase64(wav)
      const res = await fetch('/api/pronounce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64, mimeType: 'audio/wav', target, reference, language }),
      })
      if (res.status === 429) { setErr('one sec, try again in a moment'); setPhase('error'); return }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setErr(j.detail ? `err: ${j.detail}` : 'could not check, try again')
        setPhase('error')
        return
      }
      const data = (await res.json()) as Feedback
      setFb(data)
      setPhase('result')
      playSound(data.close ? 'correct' : 'pop')
    } catch {
      setErr('could not check, try again'); setPhase('error')
    }
  }

  const scoreColor = (s: number) => (s >= 80 ? COLORS.green : s >= 55 ? COLORS.butter : COLORS.peach2)

  return (
    <div style={{ marginTop: 8 }}>
      {(phase === 'idle' || phase === 'result' || phase === 'error') && (
        <button
          onClick={start}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999,
            padding: '7px 14px', border: BORDER.sticker, background: theme.primary, color: W,
            boxShadow: SHADOW.chip, fontFamily: FONTS.display, fontWeight: 800, fontSize: 13,
            cursor: 'pointer', textTransform: 'lowercase',
          }}
        >
          🎙 {phase === 'idle' ? 'say it' : 'try again'}
        </button>
      )}

      {phase === 'recording' && (
        <button
          onClick={stop}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 999,
            padding: '7px 14px', border: BORDER.sticker, background: COLORS.peach2, color: COLORS.ink,
            boxShadow: SHADOW.chip, fontFamily: FONTS.display, fontWeight: 800, fontSize: 13, cursor: 'pointer',
          }}
        >
          <span style={{ width: 9, height: 9, borderRadius: 999, background: COLORS.red, animation: 'flame-flicker 0.8s infinite' }} />
          stop · {(elapsed / 1000).toFixed(1)}s
        </button>
      )}

      {phase === 'scoring' && (
        <span style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink60 }}>listening… 👂</span>
      )}

      {phase === 'error' && err && (
        <span style={{ marginLeft: 10, fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.ink60 }}>{err}</span>
      )}

      {phase === 'result' && fb && (
        <div style={{ marginTop: 8 }}>
          <Sticker color={W} radius={14} padding={12}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 44, height: 44, flexShrink: 0, borderRadius: 999, background: scoreColor(fb.score),
                  border: BORDER.thin, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FONTS.display, fontWeight: 800, fontSize: 15, color: COLORS.ink,
                }}
              >
                {Math.round(fb.score)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink }}>{fb.verdict}</div>
                {fb.good && <div style={{ fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.ink, marginTop: 2 }}>✓ {fb.good}</div>}
                {fb.fix && <div style={{ fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.ink60, marginTop: 2 }}>{fb.fix}</div>}
              </div>
            </div>
          </Sticker>
        </div>
      )}
    </div>
  )
}
