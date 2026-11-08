'use client'

import { use, useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, notFound } from 'next/navigation'
import {
  Sticker,
  Tag,
  Mascot,
  Confetti,
  COLORS,
  FONTS,
  BORDER,
  SHADOW,
  useTheme,
} from '@/components/design'
import {
  getTaskById,
  isTaskDone,
  markTaskDone,
  unmarkTaskDone,
  recordBand,
  getBestBand,
  MIN_ANSWER_SECONDS,
  type SpreekTask,
  type Band,
} from '@/lib/dutch/spreken'
import {
  pickMime,
  blobToWav,
  blobToBase64,
  isRecordingSupported,
  wavDurationSeconds,
} from '@/lib/audio-recorder'
import { playSound } from '@/lib/sounds'
import { speak } from '@/lib/speech'

const W = '#fff' // @design-allow: white literal
const GREEN = '#1f8a3a' // @design-allow: semantic pass color
const RED = '#b94a4a' // @design-allow: semantic fail color

interface Feedback {
  transcript: string
  audible: boolean
  dutch: boolean
  covered: boolean[]
  band: Band
  verdict: string
  strength: string
  fluency: string
  pronunciation: string
  fixes: Array<{ original: string; fix: string; note: string }>
}

const BAND_BG: Record<Band, string> = {
  'not yet': COLORS.redBg,
  nearly: COLORS.butter,
  pass: COLORS.mint2,
  strong: COLORS.mint,
}

type Phase = 'idle' | 'recording' | 'checking' | 'result' | 'error'
type ErrKind = 'offline' | 'busy' | 'mic' | 'tooShort' | 'unsupported' | 'other'

const ERR_TEXT: Record<ErrKind, string> = {
  offline: "You're offline, so nobody can listen to this one right now.",
  busy: 'The examiner is busy. Give it a moment and try again.',
  mic: 'No microphone. Allow mic access in your browser, then try again.',
  tooShort: "That was too short to judge. Try again and keep going for a few sentences.",
  unsupported: 'This browser cannot record audio. Try Chrome, or Safari on a recent iPhone.',
  other: "Couldn't check that one. Your recording is fine, the examiner is not.",
}

export default function SpreekTaskPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = use(params)
  const task = getTaskById(taskId)
  // Resolve before any hook runs, so the view can treat `task` as definite.
  if (!task) notFound()
  return <TaskView task={task} />
}

function TaskView({ task }: { task: SpreekTask }) {
  const router = useRouter()
  const theme = useTheme()

  const [phase, setPhase] = useState<Phase>('idle')
  const [errKind, setErrKind] = useState<ErrKind>('other')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [clipUrl, setClipUrl] = useState<string>('')
  const [showModel, setShowModel] = useState(false)
  const [showPhrases, setShowPhrases] = useState(false)
  const [done, setDone] = useState(false)
  const [best, setBest] = useState<Band | undefined>(undefined)
  const [celebrate, setCelebrate] = useState(false)
  const [supported, setSupported] = useState(true)

  const recRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tick = useRef<ReturnType<typeof setInterval> | null>(null)
  const clipUrlRef = useRef<string>('')

  useEffect(() => {
    setDone(isTaskDone(task.id))
    setBest(getBestBand(task.id))
    setSupported(isRecordingSupported())
  }, [task.id])

  const releaseMic = useCallback(() => {
    if (stopTimer.current) clearTimeout(stopTimer.current)
    if (tick.current) clearInterval(tick.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  // Drop the mic and the object URL on unmount, or the recording light stays
  // on after the learner navigates away.
  useEffect(() => {
    return () => {
      releaseMic()
      if (clipUrlRef.current) URL.revokeObjectURL(clipUrlRef.current)
    }
  }, [releaseMic])

  const check = useCallback(
    async (mimeType: string) => {
      releaseMic()
      try {
        const rawBlob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
        const wav = await blobToWav(rawBlob)

        // Let them hear themselves back whatever the examiner says.
        if (clipUrlRef.current) URL.revokeObjectURL(clipUrlRef.current)
        const url = URL.createObjectURL(wav)
        clipUrlRef.current = url
        setClipUrl(url)

        if (wavDurationSeconds(wav.size) < MIN_ANSWER_SECONDS) {
          setErrKind('tooShort')
          setPhase('error')
          return
        }
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
          setErrKind('offline')
          setPhase('error')
          return
        }

        setPhase('checking')
        const audioBase64 = await blobToBase64(wav)
        const res = await fetch('/api/spreken-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64,
            mimeType: 'audio/wav',
            taskType: task.type,
            promptNl: task.prompt_nl,
            promptEn: task.prompt_en,
            mustCover: task.must_cover,
            seconds: task.seconds,
          }),
        })
        if (res.status === 429 || res.status === 503) {
          setErrKind('busy')
          setPhase('error')
          return
        }
        if (!res.ok) {
          setErrKind('other')
          setPhase('error')
          return
        }
        const data = (await res.json()) as Feedback
        setFeedback(data)
        setPhase('result')
        const passed = data.band === 'pass' || data.band === 'strong'
        recordBand(task.id, data.band)
        setBest(getBestBand(task.id))
        playSound(passed ? 'correct' : 'pop')
        if (passed) setCelebrate(true)
      } catch {
        setErrKind(typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'other')
        setPhase('error')
      }
    },
    [task, releaseMic],
  )

  const stop = useCallback(() => {
    if (stopTimer.current) clearTimeout(stopTimer.current)
    if (tick.current) clearInterval(tick.current)
    try {
      if (recRef.current && recRef.current.state !== 'inactive') recRef.current.stop()
    } catch {
      /* already stopped */
    }
  }, [])

  const start = useCallback(async () => {
    if (!isRecordingSupported()) {
      setErrKind('unsupported')
      setPhase('error')
      return
    }
    setFeedback(null)
    setCelebrate(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType = pickMime()
      const rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      recRef.current = rec
      chunksRef.current = []
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data)
      }
      rec.onstop = () => void check(rec.mimeType || mimeType)
      rec.start()
      playSound('pop')
      setPhase('recording')
      setElapsed(0)
      let ms = 0
      tick.current = setInterval(() => {
        ms += 100
        setElapsed(ms)
      }, 100)
      // The real paper cuts you off. So does this.
      stopTimer.current = setTimeout(() => stop(), task.seconds * 1000)
    } catch {
      setErrKind('mic')
      setPhase('error')
    }
  }, [check, stop, task.seconds])

  const toggleDone = () => {
    const next = !done
    setDone(next)
    if (next) markTaskDone(task.id)
    else unmarkTaskDone(task.id)
    playSound(next ? 'complete' : 'tap')
  }

  const remaining = Math.max(0, task.seconds - elapsed / 1000)
  const lowOnTime = remaining <= 10

  return (
    <div style={{ minHeight: '100vh', background: COLORS.lav, padding: '20px 16px 130px', position: 'relative', overflow: 'hidden' }}>
      {celebrate && <Confetti active />}
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {/* ---------------------------------------------------------- header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <button
            onClick={() => router.push('/dutch/spreken')}
            style={{
              background: 'transparent', border: 'none', color: COLORS.ink,
              fontSize: 14, fontFamily: FONTS.body, fontWeight: 700, cursor: 'pointer', padding: 0,
            }}
          >
            ← Speaking
          </button>
          <Tag>{task.title_nl}</Tag>
        </div>
        <h1 style={{ fontFamily: FONTS.display, fontSize: 25, fontWeight: 800, color: COLORS.ink, margin: '0 0 12px' }}>
          {task.title_en}
        </h1>

        {/* ---------------------------------------------------------- prompt */}
        <Sticker color={W} radius={18} padding={14} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <p style={{ flex: 1, fontFamily: FONTS.body, fontSize: 15, fontWeight: 700, color: COLORS.ink, margin: 0, lineHeight: 1.5 }}>
              {task.prompt_nl}
            </p>
            <button
              onClick={() => { playSound('tap'); speak(task.prompt_nl, 'nl') }}
              aria-label="Hear the question in Dutch"
              style={{
                flexShrink: 0, width: 34, height: 34, borderRadius: 999, cursor: 'pointer',
                border: BORDER.sticker, background: COLORS.butter, fontSize: 15,
              }}
            >
              🔊
            </button>
          </div>
          <p style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, opacity: 0.62, margin: '8px 0 0', fontStyle: 'italic', lineHeight: 1.5 }}>
            {task.prompt_en}
          </p>
        </Sticker>

        {/* The picture, in words. Said plainly so it is not mistaken for the
            exam's own photo. */}
        {task.scene_en && (
          <Sticker color={COLORS.peach2} radius={16} padding={13} style={{ marginBottom: 12 }}>
            <div style={{
              fontFamily: FONTS.display, fontWeight: 800, fontSize: 11.5, color: COLORS.ink,
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5,
            }}>
              The picture shows
            </div>
            <p style={{ fontFamily: FONTS.body, fontSize: 13.5, color: COLORS.ink, margin: 0, lineHeight: 1.55 }}>
              {task.scene_en}
            </p>
          </Sticker>
        )}

        {task.options && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            {task.options.map((o, i) => (
              <Sticker key={o} color={i === 0 ? COLORS.mint2 : COLORS.butter} radius={14} padding={11}>
                <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 12.5, color: COLORS.ink, textAlign: 'center' }}>
                  {o}
                </div>
              </Sticker>
            ))}
          </div>
        )}

        {task.panels && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {task.panels.map((p, i) => (
              <Sticker key={p} color={COLORS.peach2} radius={14} padding={11}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{
                    flexShrink: 0, width: 24, height: 24, borderRadius: 999, background: W,
                    border: BORDER.sticker, fontFamily: FONTS.display, fontWeight: 800, fontSize: 12,
                    color: COLORS.ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {i + 1}
                  </span>
                  <p style={{ flex: 1, fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, margin: 0, lineHeight: 1.5 }}>
                    {p}
                  </p>
                </div>
              </Sticker>
            ))}
          </div>
        )}

        {/* ----------------------------------------------------------- frame */}
        {/* Shown before recording, deliberately. Under a one-minute timer a
            pattern you can fill in is worth more than anything you could read
            afterwards. */}
        <Sticker color={COLORS.mint2} radius={18} padding={14} style={{ marginBottom: 12 }}>
          <div style={{
            fontFamily: FONTS.display, fontWeight: 800, fontSize: 12, color: COLORS.ink,
            textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
          }}>
            Say it like this
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {task.frame.map((line) => (
              <div key={line} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ flex: 1, fontFamily: FONTS.body, fontSize: 14, fontWeight: 700, color: COLORS.ink, lineHeight: 1.45 }}>
                  {line}
                </span>
                <button
                  onClick={() => { playSound('tap'); speak(line.replace(/___/g, '...'), 'nl') }}
                  aria-label={`Hear: ${line}`}
                  style={{
                    flexShrink: 0, width: 28, height: 28, borderRadius: 999, cursor: 'pointer',
                    border: BORDER.sticker, background: W, fontSize: 12,
                  }}
                >
                  🔊
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => { playSound('tap'); setShowPhrases((s) => !s) }}
            style={{
              marginTop: 10, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
              fontFamily: FONTS.display, fontWeight: 800, fontSize: 12.5, color: COLORS.ink, opacity: 0.75,
            }}
          >
            {showPhrases ? 'Hide the words to fill it with' : `Words to fill it with (${task.phrases.length})`}
          </button>
          {showPhrases && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
              {task.phrases.map((p) => (
                <div
                  key={p.nl}
                  style={{
                    display: 'flex', gap: 8, alignItems: 'baseline', background: W,
                    border: BORDER.thin, borderRadius: 10, padding: '6px 9px',
                  }}
                >
                  <button
                    onClick={() => { playSound('tap'); speak(p.nl, 'nl') }}
                    aria-label={`Hear: ${p.nl}`}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, padding: 0 }}
                  >
                    🔊
                  </button>
                  <span style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 700, color: COLORS.ink }}>{p.nl}</span>
                  <span style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.ink, opacity: 0.6 }}>{p.en}</span>
                </div>
              ))}
            </div>
          )}
        </Sticker>

        {/* ------------------------------------------------------- checklist */}
        <Sticker color={COLORS.mint2} radius={18} padding={14} style={{ marginBottom: 14 }}>
          <div style={{
            fontFamily: FONTS.display, fontWeight: 800, fontSize: 12, color: COLORS.ink,
            textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7,
          }}>
            Your answer must
          </div>
          <ul style={{ margin: 0, paddingLeft: 4, listStyle: 'none' }}>
            {task.must_cover.map((point, i) => {
              const mark = feedback ? feedback.covered[i] : undefined
              return (
                <li
                  key={point}
                  style={{
                    fontFamily: FONTS.body, fontSize: 13.5, color: COLORS.ink,
                    lineHeight: 1.5, marginBottom: 3, display: 'flex', gap: 7,
                  }}
                >
                  <span style={{ flexShrink: 0, width: 14 }}>{mark === undefined ? '·' : mark ? '✓' : '✗'}</span>
                  <span style={{ flex: 1, color: mark === false ? RED : COLORS.ink }}>{point}</span>
                </li>
              )
            })}
          </ul>
          <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.ink, opacity: 0.6, marginTop: 7 }}>
            Aim for {task.min_sentences}+ sentences. You have {task.seconds} seconds.
          </div>
        </Sticker>

        {/* ----------------------------------------------------- record / go */}
        {!supported ? (
          <Sticker color={COLORS.butter} radius={16} padding={13} style={{ marginBottom: 12 }}>
            <p style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, margin: 0, lineHeight: 1.5 }}>
              {ERR_TEXT.unsupported} You can still say the answer out loud to yourself and compare it with
              the model answer below. That is most of the value.
            </p>
          </Sticker>
        ) : phase === 'recording' ? (
          <button
            onClick={stop}
            style={{
              width: '100%', borderRadius: 16, padding: '15px 16px', cursor: 'pointer',
              border: BORDER.sticker, background: lowOnTime ? COLORS.redBg : COLORS.peach2,
              boxShadow: SHADOW.sticker, fontFamily: FONTS.display, fontWeight: 800, fontSize: 16,
              color: COLORS.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              marginBottom: 12,
            }}
          >
            <span style={{
              width: 11, height: 11, borderRadius: 999, background: COLORS.red,
              animation: 'flame-flicker 0.8s infinite',
            }} />
            Stop · {remaining.toFixed(0)}s left
          </button>
        ) : phase === 'checking' ? (
          <Sticker color={W} radius={16} padding={14} style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink, textAlign: 'center' }}>
              Listening to your answer… 👂
            </div>
          </Sticker>
        ) : (
          <button
            onClick={start}
            style={{
              width: '100%', borderRadius: 16, padding: '15px 16px', cursor: 'pointer',
              border: BORDER.sticker, background: theme.primary, boxShadow: SHADOW.sticker,
              fontFamily: FONTS.display, fontWeight: 800, fontSize: 16, color: W, marginBottom: 12,
            }}
          >
            🎙 {phase === 'idle' ? 'Record my answer' : 'Record again'}
          </button>
        )}

        {/* Hearing yourself back is half of what fixes speaking, and it costs
            nothing, so it survives even when the check fails. */}
        {clipUrl && phase !== 'recording' && (
          <Sticker color={W} radius={14} padding={11} style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 11.5, color: COLORS.ink, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
              Hear yourself back
            </div>
            <audio src={clipUrl} controls style={{ width: '100%' }} />
          </Sticker>
        )}

        {phase === 'error' && (
          <Sticker color={COLORS.butter} radius={16} padding={13} style={{ marginBottom: 12 }}>
            <p style={{ fontFamily: FONTS.body, fontSize: 13.5, color: COLORS.ink, margin: 0, lineHeight: 1.5 }}>
              {ERR_TEXT[errKind]}
            </p>
            <p style={{ fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.ink, opacity: 0.7, margin: '6px 0 0', lineHeight: 1.5 }}>
              Mark yourself against the checklist above, then compare with the model answer below.
            </p>
          </Sticker>
        )}

        {/* -------------------------------------------------------- feedback */}
        {phase === 'result' && feedback && (
          <>
            <Sticker color={BAND_BG[feedback.band]} radius={18} padding={14} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mascot size={42} mood={feedback.band === 'pass' || feedback.band === 'strong' ? 'happy' : 'idle'} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 18, color: COLORS.ink, textTransform: 'capitalize' }}>
                    {feedback.band}
                  </div>
                  <div style={{ fontFamily: FONTS.body, fontSize: 13.5, color: COLORS.ink, marginTop: 2, lineHeight: 1.45 }}>
                    {feedback.verdict}
                  </div>
                </div>
              </div>
            </Sticker>

            {/* The transcript is the point of the whole screen: it is the only
                way to tell "I said it wrong" from "I said it unclearly". */}
            <Sticker color={W} radius={16} padding={13} style={{ marginBottom: 12 }}>
              <div style={{
                fontFamily: FONTS.display, fontWeight: 800, fontSize: 11.5, color: COLORS.ink,
                textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
              }}>
                What was heard
              </div>
              {feedback.transcript ? (
                <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
                  “{feedback.transcript}”
                </p>
              ) : (
                <p style={{ fontFamily: FONTS.body, fontSize: 13.5, color: COLORS.ink, opacity: 0.7, margin: 0, lineHeight: 1.5 }}>
                  Nothing came through. Check your microphone, get a bit closer, and try again.
                </p>
              )}
              {feedback.dutch === false && (
                <p style={{ fontFamily: FONTS.body, fontSize: 13, color: RED, margin: '8px 0 0', lineHeight: 1.5 }}>
                  That was not in Dutch. On the real paper a perfect answer in English scores nothing.
                </p>
              )}
            </Sticker>

            {feedback.strength && (
              <Sticker color={COLORS.mint2} radius={14} padding={12} style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: FONTS.body, fontSize: 13.5, color: COLORS.ink, lineHeight: 1.5 }}>
                  ✓ {feedback.strength}
                </div>
              </Sticker>
            )}

            {(feedback.fluency || feedback.pronunciation) && (
              <Sticker color={W} radius={14} padding={12} style={{ marginBottom: 10 }}>
                <div style={{
                  fontFamily: FONTS.display, fontWeight: 800, fontSize: 11.5, color: COLORS.ink,
                  textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
                }}>
                  How it sounded
                </div>
                {feedback.fluency && (
                  <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, lineHeight: 1.5 }}>
                    🗣 {feedback.fluency}
                  </div>
                )}
                {feedback.pronunciation && (
                  <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, lineHeight: 1.5, marginTop: 4 }}>
                    👂 {feedback.pronunciation}
                  </div>
                )}
              </Sticker>
            )}

            {feedback.fixes.length > 0 && (
              <Sticker color={W} radius={14} padding={12} style={{ marginBottom: 12 }}>
                <div style={{
                  fontFamily: FONTS.display, fontWeight: 800, fontSize: 11.5, color: COLORS.ink,
                  textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7,
                }}>
                  Fixes
                </div>
                {feedback.fixes.map((f) => (
                  <div key={f.original + f.fix} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'baseline' }}>
                      <span style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, opacity: 0.55, textDecoration: 'line-through' }}>
                        {f.original}
                      </span>
                      <span style={{ fontFamily: FONTS.body, fontSize: 13.5, fontWeight: 800, color: GREEN }}>
                        {f.fix}
                      </span>
                      <button
                        onClick={() => { playSound('tap'); speak(f.fix, 'nl') }}
                        aria-label={`Hear: ${f.fix}`}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, padding: 0 }}
                      >
                        🔊
                      </button>
                    </div>
                    <div style={{ fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.ink, opacity: 0.68, marginTop: 1 }}>
                      {f.note}
                    </div>
                  </div>
                ))}
              </Sticker>
            )}
          </>
        )}

        {/* The model answer never needs the network, so this screen is still
            worth opening with no signal. */}
        <Sticker
          color={COLORS.peach2}
          radius={14}
          padding={12}
          onClick={() => { playSound('tap'); setShowModel((s) => !s) }}
          style={{ marginBottom: showModel ? 10 : 12 }}
        >
          <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink }}>
            {showModel ? 'Hide the model answer' : 'Show a model answer'}
          </div>
        </Sticker>

        {showModel && (
          <Sticker color={COLORS.cream} radius={16} padding={13} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{
                fontFamily: FONTS.display, fontWeight: 800, fontSize: 11.5, color: COLORS.ink,
                textTransform: 'uppercase', letterSpacing: 1,
              }}>
                One good answer
              </div>
              <button
                onClick={() => { playSound('tap'); speak(task.model_answer_nl, 'nl') }}
                aria-label="Hear the model answer"
                style={{
                  width: 30, height: 30, borderRadius: 999, cursor: 'pointer',
                  border: BORDER.sticker, background: COLORS.butter, fontSize: 13,
                }}
              >
                🔊
              </button>
            </div>
            <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {task.model_answer_nl}
            </p>
            <p style={{ fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.ink, opacity: 0.62, margin: '8px 0 0', lineHeight: 1.55, fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
              {task.model_answer_en}
            </p>
            {task.tips_en.length > 0 && (
              <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
                {task.tips_en.map((tip) => (
                  <li key={tip} style={{ fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.ink, lineHeight: 1.5, marginBottom: 3 }}>
                    {tip}
                  </li>
                ))}
              </ul>
            )}
          </Sticker>
        )}

        <button
          onClick={toggleDone}
          style={{
            width: '100%', borderRadius: 14, padding: '12px 16px', cursor: 'pointer',
            border: BORDER.sticker, background: done ? COLORS.mint2 : W, boxShadow: SHADOW.sticker,
            fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink,
          }}
        >
          {done ? '✓ done' : 'mark as done'}
          {best ? ` · best: ${best}` : ''}
        </button>
      </div>
    </div>
  )
}
