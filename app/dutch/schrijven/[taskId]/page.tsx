'use client'

import { use, useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
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
  getDraft,
  saveDraft,
  countSentences,
  isLongEnough,
  type SchrijfTask,
} from '@/lib/dutch/schrijven'
import { playSound } from '@/lib/sounds'
import { speak } from '@/lib/speech'

const W = '#fff' // @design-allow: white literal
const GREEN = '#1f8a3a' // @design-allow: semantic pass color
const RED = '#b94a4a' // @design-allow: semantic fail color

interface Feedback {
  covered: boolean[]
  verdict: string
  band: 'not yet' | 'nearly' | 'pass' | 'strong'
  strength: string
  fixes: Array<{ original: string; fix: string; note: string }>
  corrected: string
}

const BAND_COLOR: Record<Feedback['band'], string> = {
  'not yet': COLORS.redBg,
  nearly: COLORS.butter,
  pass: COLORS.mint2,
  strong: COLORS.mint,
}

export default function SchrijfTaskPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = use(params)
  const task = getTaskById(taskId)
  // Resolve before any hook runs, so the view below can treat `task` as
  // definite and the rules of hooks are not bent around an early return.
  if (!task) notFound()
  return <TaskView task={task} />
}

function TaskView({ task }: { task: SchrijfTask }) {
  const router = useRouter()
  const theme = useTheme()

  const [text, setText] = useState('')
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [state, setState] = useState<'idle' | 'checking' | 'done' | 'error'>('idle')
  const [errorKind, setErrorKind] = useState<'busy' | 'offline' | 'other'>('other')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [showModel, setShowModel] = useState(false)
  const [done, setDone] = useState(false)
  const [burst, setBurst] = useState(false)
  const [ready, setReady] = useState(false)

  const isForm = task.type === 'formulier'

  useEffect(() => {
    const saved = getDraft(task.id)
    if (isForm) {
      try {
        const parsed = saved ? JSON.parse(saved) : {}
        setFieldValues(parsed && typeof parsed === 'object' ? parsed : {})
      } catch {
        setFieldValues({})
      }
    } else {
      setText(saved)
    }
    setDone(isTaskDone(task.id))
    setReady(true)
  }, [task, isForm])

  // What gets sent to the marker. A form is flattened to "Label: value" lines
  // so the grader sees the same thing the learner filled in.
  const answer = useMemo(() => {
    if (!isForm) return text
    return (task.fields ?? [])
      .map((f) => `${f.label_nl}: ${(fieldValues[f.label_nl] ?? '').trim()}`)
      .join('\n')
  }, [task, isForm, text, fieldValues])

  const persist = (nextText: string, nextFields: Record<string, string>) => {
    saveDraft(task.id, isForm ? JSON.stringify(nextFields) : nextText)
  }

  const onText = (v: string) => {
    setText(v)
    persist(v, fieldValues)
  }

  const onField = (label: string, v: string) => {
    const nextFields = { ...fieldValues, [label]: v }
    setFieldValues(nextFields)
    persist(text, nextFields)
  }

  const sentences = countSentences(text)
  const enough = isLongEnough(task, answer)

  async function check() {
    if (!enough || state === 'checking') return
    setState('checking')
    setFeedback(null)
    playSound('tap')
    try {
      const res = await fetch('/api/schrijven-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer,
          taskType: task.type,
          promptNl: task.prompt_nl,
          promptEn: task.prompt_en,
          mustInclude: task.must_include,
        }),
      })
      if (!res.ok) {
        setErrorKind(res.status === 503 || res.status === 429 ? 'busy' : 'other')
        setState('error')
        return
      }
      const data = (await res.json()) as Feedback
      setFeedback(data)
      setState('done')
      playSound(data.band === 'pass' || data.band === 'strong' ? 'complete' : 'pop')
    } catch {
      // No network: fall back to the task's own checklist and model answer,
      // which is the whole reason both are carried in the content.
      setErrorKind(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'other')
      setState('error')
      setShowModel(true)
    }
  }

  function toggleDone() {
    if (done) {
      unmarkTaskDone(task.id)
      setDone(false)
      playSound('tap')
      return
    }
    markTaskDone(task.id)
    setDone(true)
    playSound('complete')
    setBurst(true)
    setTimeout(() => setBurst(false), 2200)
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.lav, padding: '24px 16px 120px', position: 'relative', overflow: 'hidden' }}>
      {burst && <Confetti active />}
      <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <button
          onClick={() => router.push('/dutch/schrijven')}
          style={{
            background: 'transparent', border: 'none', color: COLORS.ink,
            fontSize: 14, fontFamily: FONTS.body, fontWeight: 700, cursor: 'pointer', marginBottom: 8,
          }}
        >
          ← Writing
        </button>
        <Tag>{task.type === 'vrij' ? 'Vrije tekst' : task.type === 'email' ? 'E-mail' : task.type === 'briefje' ? 'Briefje' : 'Formulier'}</Tag>
        <h1 style={{ fontFamily: FONTS.display, fontSize: 24, fontWeight: 800, color: COLORS.ink, margin: '6px 0 14px' }}>
          {task.title_en}
        </h1>

        {/* The task, in Dutch as the exam gives it, with an English gloss. */}
        <Sticker color={W} radius={18} padding={14} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <p style={{ fontFamily: FONTS.body, fontSize: 14.5, color: COLORS.ink, margin: 0, lineHeight: 1.55, flex: 1 }}>
              {task.prompt_nl}
            </p>
            <button
              onClick={() => { playSound('tap'); speak(task.prompt_nl, 'nl') }}
              aria-label="Read the task aloud"
              style={{
                background: COLORS.butter, border: BORDER.sticker, boxShadow: SHADOW.chip,
                borderRadius: 999, width: 34, height: 34, cursor: 'pointer', flexShrink: 0, fontSize: 14,
              }}
            >
              🔊
            </button>
          </div>
          <p style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, opacity: 0.65, margin: '8px 0 0', lineHeight: 1.5, fontStyle: 'italic' }}>
            {task.prompt_en}
          </p>
        </Sticker>

        {/* The marking checklist. This is how the real paper is scored, so it
            is shown up front rather than hidden behind the feedback. */}
        <Sticker color={COLORS.mint2} radius={18} padding={14} style={{ marginBottom: 14 }}>
          <div style={{
            fontFamily: FONTS.display, fontWeight: 800, fontSize: 12.5, color: COLORS.ink,
            textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
          }}>
            Your answer must
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontFamily: FONTS.body, fontSize: 13.5, color: COLORS.ink, lineHeight: 1.65 }}>
            {task.must_include.map((p, i) => {
              const hit = feedback?.covered?.[i]
              return (
                <li key={i} style={{ marginBottom: 2 }}>
                  {p}
                  {feedback && (
                    <span style={{ fontWeight: 800, color: hit ? GREEN : RED, marginLeft: 6 }}>
                      {hit ? '✓' : '✗'}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </Sticker>

        {/* The answer area. */}
        {isForm ? (
          <Sticker color={W} radius={18} padding={14} style={{ marginBottom: 12 }}>
            {(task.fields ?? []).map((f) => (
              <div key={f.label_nl} style={{ marginBottom: 12 }}>
                <label style={{
                  display: 'block', fontFamily: FONTS.display, fontWeight: 800,
                  fontSize: 13, color: COLORS.ink, marginBottom: 3,
                }}>
                  {f.label_nl}
                  <span style={{ fontWeight: 400, fontStyle: 'italic', opacity: 0.6, marginLeft: 6 }}>
                    {f.label_en}
                  </span>
                </label>
                {f.hint_en && (
                  <div style={{ fontFamily: FONTS.body, fontSize: 11.5, color: COLORS.ink, opacity: 0.6, marginBottom: 4 }}>
                    {f.hint_en}
                  </div>
                )}
                <input
                  value={fieldValues[f.label_nl] ?? ''}
                  onChange={(e) => onField(f.label_nl, e.target.value)}
                  style={{
                    width: '100%', padding: '8px 10px', border: BORDER.sticker,
                    borderRadius: 10, fontFamily: FONTS.body, fontSize: 14,
                    color: COLORS.ink, background: COLORS.creamBg, boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}
          </Sticker>
        ) : (
          <Sticker color={W} radius={18} padding={14} style={{ marginBottom: 12 }}>
            <textarea
              value={text}
              onChange={(e) => onText(e.target.value)}
              rows={9}
              placeholder="Schrijf hier..."
              style={{
                width: '100%', border: BORDER.sticker, borderRadius: 12, padding: 12,
                fontFamily: FONTS.body, fontSize: 15, lineHeight: 1.7, color: COLORS.ink,
                background: COLORS.creamBg, resize: 'vertical', boxSizing: 'border-box',
              }}
            />
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontFamily: FONTS.body, fontSize: 12, color: COLORS.ink, opacity: 0.7, marginTop: 6,
            }}>
              <span>{sentences} {sentences === 1 ? 'sentence' : 'sentences'}</span>
              <span style={{ color: enough ? GREEN : COLORS.ink, fontWeight: enough ? 800 : 400 }}>
                {enough ? 'long enough ✓' : `aim for ${task.min_sentences}+`}
              </span>
            </div>
          </Sticker>
        )}

        <button
          onClick={check}
          disabled={!enough || state === 'checking'}
          style={{
            width: '100%', padding: '14px', marginBottom: 14,
            background: enough ? theme.primary : COLORS.lav2,
            color: enough ? W : COLORS.ink,
            border: BORDER.sticker, boxShadow: SHADOW.sticker, borderRadius: 18,
            fontFamily: FONTS.display, fontWeight: 800, fontSize: 16,
            cursor: enough && state !== 'checking' ? 'pointer' : 'not-allowed',
            textTransform: 'lowercase',
          }}
        >
          {state === 'checking' ? 'checking...' : 'check my writing'}
        </button>

        {state === 'error' && (
          <Sticker color={COLORS.butter} radius={18} padding={14} style={{ marginBottom: 14 }} dashed>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink, marginBottom: 4 }}>
              {errorKind === 'offline' ? "You're offline" : errorKind === 'busy' ? 'The checker is busy' : "Couldn't check that"}
            </div>
            <p style={{ fontFamily: FONTS.body, fontSize: 13.5, color: COLORS.ink, margin: 0, lineHeight: 1.55 }}>
              Mark yourself against the checklist above, then compare with the model answer below.
              That is exactly how the real paper is scored.
            </p>
          </Sticker>
        )}

        {feedback && (
          <>
            <Sticker color={BAND_COLOR[feedback.band] ?? COLORS.butter} radius={18} padding={14} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <Mascot size={40} mood={feedback.band === 'pass' || feedback.band === 'strong' ? 'happy' : 'idle'} />
                <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 17, color: COLORS.ink, textTransform: 'capitalize' }}>
                  {feedback.band}
                </div>
              </div>
              <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, margin: '0 0 6px', lineHeight: 1.55 }}>
                {feedback.verdict}
              </p>
              {feedback.strength && (
                <p style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, margin: 0, opacity: 0.8, lineHeight: 1.5 }}>
                  👍 {feedback.strength}
                </p>
              )}
            </Sticker>

            {feedback.fixes?.length > 0 && (
              <Sticker color={W} radius={18} padding={14} style={{ marginBottom: 12 }}>
                <div style={{
                  fontFamily: FONTS.display, fontWeight: 800, fontSize: 12.5, color: COLORS.ink,
                  textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
                }}>
                  Fixes
                </div>
                {feedback.fixes.map((f, i) => (
                  <div key={i} style={{ marginBottom: i < feedback.fixes.length - 1 ? 10 : 0 }}>
                    <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink }}>
                      <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>{f.original}</span>
                      {'  '}
                      <span style={{ fontWeight: 800, color: GREEN }}>{f.fix}</span>
                    </div>
                    <div style={{ fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.ink, opacity: 0.7, marginTop: 1 }}>
                      {f.note}
                    </div>
                  </div>
                ))}
              </Sticker>
            )}

            {feedback.corrected && (
              <Sticker color={COLORS.creamBg} radius={18} padding={14} style={{ marginBottom: 12 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6,
                }}>
                  <div style={{
                    fontFamily: FONTS.display, fontWeight: 800, fontSize: 12.5, color: COLORS.ink,
                    textTransform: 'uppercase', letterSpacing: 1,
                  }}>
                    Your answer, corrected
                  </div>
                  <button
                    onClick={() => { playSound('tap'); speak(feedback.corrected, 'nl') }}
                    aria-label="Read the corrected answer aloud"
                    style={{
                      background: COLORS.butter, border: BORDER.sticker, boxShadow: SHADOW.chip,
                      borderRadius: 999, width: 30, height: 30, cursor: 'pointer', fontSize: 13,
                    }}
                  >
                    🔊
                  </button>
                </div>
                <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {feedback.corrected}
                </p>
              </Sticker>
            )}
          </>
        )}

        {/* The model answer is always available, not gated behind the AI, so
            the task still teaches when the network is gone. */}
        <Sticker
          color={COLORS.peach2}
          radius={18}
          padding={14}
          onClick={() => { playSound('tap'); setShowModel((v) => !v) }}
          style={{ marginBottom: showModel ? 12 : 14 }}
        >
          <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink }}>
            {showModel ? 'Hide the model answer' : 'Show a model answer'}
          </div>
        </Sticker>

        {showModel && (
          <Sticker color={W} radius={18} padding={14} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{
                fontFamily: FONTS.display, fontWeight: 800, fontSize: 12.5, color: COLORS.ink,
                textTransform: 'uppercase', letterSpacing: 1,
              }}>
                One good answer
              </div>
              <button
                onClick={() => { playSound('tap'); speak(task.model_answer_nl, 'nl') }}
                aria-label="Read the model answer aloud"
                style={{
                  background: COLORS.butter, border: BORDER.sticker, boxShadow: SHADOW.chip,
                  borderRadius: 999, width: 30, height: 30, cursor: 'pointer', fontSize: 13,
                }}
              >
                🔊
              </button>
            </div>
            <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, margin: '0 0 8px', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {task.model_answer_nl}
            </p>
            <p style={{ fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.ink, opacity: 0.65, margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>
              {task.model_answer_en}
            </p>
            <div style={{ borderTop: `2.5px solid ${COLORS.lav}`, margin: '10px 0 8px' }} />
            <ul style={{ margin: 0, paddingLeft: 18, fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, lineHeight: 1.6 }}>
              {task.tips_en.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </Sticker>
        )}

        {ready && (
          <button
            onClick={toggleDone}
            style={{
              width: '100%', padding: '13px',
              background: done ? COLORS.mint : W,
              color: COLORS.ink, border: BORDER.sticker, boxShadow: SHADOW.sticker,
              borderRadius: 18, fontFamily: FONTS.display, fontWeight: 800, fontSize: 15,
              cursor: 'pointer', textTransform: 'lowercase',
            }}
          >
            {done ? '✓ done' : 'mark as done'}
          </button>
        )}
      </div>
    </div>
  )
}
