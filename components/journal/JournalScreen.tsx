'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import confetti from 'canvas-confetti'
import { Mascot, COLORS, FONTS, BORDER, SHADOW, HOLI_DOTS } from '@/components/design'
import { useLanguage } from '@/lib/language-context'
import { playSound } from '@/lib/sounds'
import { speak, stopSpeaking } from '@/lib/speech'
import { addMistake, deleteMistake } from '@/lib/mistakes'
import {
  promptForDate,
  dateKey,
  weekdayLabel,
  shortLabel,
  getEntry,
  saveEntry,
  getArchive,
  getJournalStreak,
  getCalendar,
  analyzeEntryOffline,
  keepRealFixes,
  type JournalCheck,
  type JournalFix,
  type ArchivePage,
  type CalendarCell,
} from '@/lib/journal'

const W = '#fff' // @design-allow: white literal
const RULE = 32 // ruled-line spacing
const JOURNAL_MISTAKE_ID = '__journal__'

// ── async check: model first (/api/journal-check), offline fallback ──────────
async function runCheck(entry: string, prompt: string, language: string): Promise<JournalCheck> {
  try {
    const res = await fetch('/api/journal-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry, prompt, language }),
    })
    if (!res.ok) throw new Error(String(res.status))
    const data = await res.json()
    // Only keep fixes whose `original` actually appears in the entry (drops
    // hallucinated/empty corrections), capped at 5.
    const fixes: JournalFix[] = keepRealFixes(entry, data.fixes)
    // Always surface the gentle "did you mean..." suggestion if the model gave
    // one (e.g. for a garbled clause it couldn't safely correct) — as an extra
    // card alongside the fixes, not only when there are zero fixes.
    const enrichNote = typeof data.enrich === 'string' ? data.enrich.trim() : ''
    if (enrichNote) fixes.push({ enrich: true, original: '', fix: '', note: enrichNote })
    if (fixes.length === 0) fixes.push({ enrich: true, original: '', fix: '', note: 'Already clean. Lovely, keep going.' })
    return {
      reaction: data.reaction || 'Padh liya. Likhte raho.',
      mood: data.mood === 'happy' || data.mood === 'sympathy' ? data.mood : 'neutral',
      fixes,
      translation: data.translation || undefined,
    }
  } catch {
    return analyzeEntryOffline(entry)
  }
}

export function JournalScreen() {
  const router = useRouter()
  const { config } = useLanguage()
  const prefix = config.storagePrefix
  const prompt = promptForDate()
  const todayKey = dateKey()

  const [view, setView] = useState<'today' | 'diary'>('today')
  const [entry, setEntry] = useState('')
  const [done, setDone] = useState(false)
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<JournalCheck | null>(null)
  const [streak, setStreak] = useState(0)
  const [hydrated, setHydrated] = useState(false)
  // the entry text `result` was computed for (so a check goes stale on edit)
  const [checkedFor, setCheckedFor] = useState<string | null>(null)
  // ids of the mistakes logged for today's entry, so an edit reconciles them
  const mistakeIdsRef = useRef<string[]>([])

  useEffect(() => {
    const saved = getEntry(prefix, todayKey)
    if (saved) {
      setEntry(saved.entry)
      setDone(saved.done)
      mistakeIdsRef.current = saved.mistakeIds || []
      if (saved.done && saved.reaction) {
        setResult({ reaction: saved.reaction, mood: saved.mood || 'neutral', fixes: saved.fixes || [], translation: saved.translation })
        setCheckedFor(saved.entry)
      }
    }
    setStreak(getJournalStreak(prefix))
    setHydrated(true)
  }, [prefix, todayKey])

  // autosave the in-progress draft (only while not yet tucked in). Preserve the
  // logged mistake ids so a mid-edit reload can still reconcile them on re-tuck.
  useEffect(() => {
    if (!hydrated || done) return
    saveEntry(prefix, todayKey, { entry, done: false, ts: new Date().toISOString(), mistakeIds: mistakeIdsRef.current })
  }, [entry, done, hydrated, prefix, todayKey])

  // write the tucked-in entry; idempotent so it can run on optimistic + final.
  const saveEntryData = useCallback(
    (text: string, check: JournalCheck, mistakeIds: string[]) => {
      saveEntry(prefix, todayKey, {
        entry: text,
        done: true,
        ts: new Date().toISOString(),
        reaction: check.reaction,
        mood: check.mood,
        fixes: check.fixes,
        translation: check.translation,
        mistakeIds,
      })
    },
    [prefix, todayKey],
  )

  // Reconcile drillable mistakes for today's entry: drop the previously-logged
  // ones (so editing doesn't leave stale fixes), log the current fixes, and
  // return the new ids to store on the entry.
  const syncMistakes = useCallback(
    (check: JournalCheck): string[] => {
      for (const id of mistakeIdsRef.current) deleteMistake(id, prefix)
      const ids: string[] = []
      for (const f of check.fixes) {
        if (!f.enrich && f.original && f.fix) {
          const id = addMistake({ original: f.original, correction: f.fix, reason: f.note }, JOURNAL_MISTAKE_ID, prefix, 'practice')
          if (id) ids.push(id)
        }
      }
      mistakeIdsRef.current = ids
      return ids
    },
    [prefix],
  )

  const tuck = useCallback(
    async () => {
      const text = entry
      if (!text.trim()) return
      setChecking(false)
      setDone(true)
      playSound('levelup')
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 }, colors: [...HOLI_DOTS], ticks: 90, scalar: 0.9 })
      setStreak(getJournalStreak(prefix))

      // Reuse a fresh check if we have one for this exact text; otherwise show an
      // instant offline reaction, then upgrade to the model result. Mistakes are
      // reconciled ONCE per tuck, from the final check (drops any prior ones).
      const fresh = result && checkedFor === text ? result : null
      if (fresh) {
        saveEntryData(text, fresh, syncMistakes(fresh))
        return
      }
      const optimistic = analyzeEntryOffline(text)
      setResult(optimistic)
      // keep the existing mistake ids in storage until the final check reconciles
      saveEntryData(text, optimistic, mistakeIdsRef.current)
      const real = await runCheck(text, prompt.hinglish, config.code)
      setCheckedFor(text)
      setResult(real)
      saveEntryData(text, real, syncMistakes(real))
    },
    [entry, result, checkedFor, saveEntryData, syncMistakes, prefix, prompt.hinglish, config.code],
  )

  // Edit a tucked-in entry: return to the writing state with the text
  // pre-filled. The day's prompt is unchanged. Mistakes are reconciled on the
  // next tuck (syncMistakes drops the old ids before re-logging).
  const editEntry = useCallback(() => {
    playSound('tap')
    setChecking(false)
    setDone(false)
  }, [])

  const openCheck = useCallback(async () => {
    if (!entry.trim()) return
    playSound('pop')
    setChecking(true)
    // (re)fetch if we have no result, or the result is stale for the edited text
    if (!result || checkedFor !== entry) {
      const text = entry
      const real = await runCheck(text, prompt.hinglish, config.code)
      setCheckedFor(text)
      setResult(real)
    }
  }, [entry, result, checkedFor, prompt.hinglish, config.code])

  return (
    <div style={{ minHeight: '100dvh', position: 'relative', background: COLORS.journalBg, fontFamily: FONTS.body, color: COLORS.ink }}>
      <div className="no-scrollbar" style={{ minHeight: '100dvh', paddingTop: 50 }}>
        <Header view={view} setView={setView} streak={streak + (done ? 0 : 0)} onBack={() => { playSound('tap'); router.push('/') }} />
        {view === 'today' ? (
          <TodayPage
            prompt={prompt}
            entry={entry}
            setEntry={setEntry}
            done={done}
            result={result}
            onCheck={openCheck}
            onTuck={() => tuck()}
            onEdit={editEntry}
          />
        ) : (
          <DiaryView prefix={prefix} streak={streak} />
        )}
        <div style={{ height: 28 }} />
      </div>
      {checking && (
        <CheckSheet
          loading={!result || checkedFor !== entry}
          result={!result || checkedFor !== entry ? null : result}
          onClose={() => { playSound('tap'); setChecking(false) }}
          onTuck={() => tuck()}
        />
      )}
    </div>
  )
}

// ── header: back · title · streak · segmented · holi dots ────────────────────
function Header({ view, setView, streak, onBack }: { view: 'today' | 'diary'; setView: (v: 'today' | 'diary') => void; streak: number; onBack: () => void }) {
  return (
    <div style={{ padding: '8px 16px 12px', position: 'relative', zIndex: 4, maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button type="button" aria-label="Back" onClick={onBack} style={iconBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div style={{ textAlign: 'center', lineHeight: 1 }}>
          <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 19, color: COLORS.ink, letterSpacing: -0.3 }}>Chai Diary</div>
          <div style={{ fontFamily: FONTS.script, fontWeight: 600, fontSize: 14, color: COLORS.ink45, marginTop: 1 }}>your tiny daily diary</div>
        </div>
        <StreakChip count={streak} />
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 12, background: W, border: BORDER.sticker, borderRadius: 999, padding: 4, boxShadow: SHADOW.chip }}>
        {([['today', "today's page"], ['diary', 'the diary']] as const).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => { playSound('tap'); setView(k) }}
            style={{
              flex: 1, padding: '7px 0', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: view === k ? COLORS.ink : 'transparent', color: view === k ? COLORS.cream : COLORS.ink60,
              fontFamily: FONTS.display, fontWeight: 800, fontSize: 13, textTransform: 'lowercase',
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <HoliDots style={{ marginTop: 12 }} />
    </div>
  )
}

function StreakChip({ count, small }: { count: number; small?: boolean }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 3, background: COLORS.journalAccent2, color: W,
      border: BORDER.sticker, borderRadius: 999, padding: small ? '4px 11px' : '4px 9px', boxShadow: SHADOW.chip,
      fontFamily: FONTS.display, fontWeight: 800, fontSize: small ? 14 : 13,
    }}>
      <span style={{ animation: 'flame-flicker 0.9s ease-in-out infinite', display: 'inline-block' }}>🔥</span>
      {count}{small ? ' days' : ''}
    </div>
  )
}

function HoliDots({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', gap: 7, alignItems: 'center', justifyContent: 'center', ...style }}>
      {HOLI_DOTS.map((c, i) => (
        <span key={i} style={{ width: i % 2 ? 7 : 9, height: i % 2 ? 7 : 9, borderRadius: 999, background: c, border: `1.8px solid `, transform: `translateY(${i % 2 ? 3 : -2}px)` }} />
      ))}
    </div>
  )
}

// ── ruled diary page surface ─────────────────────────────────────────────────
function PageSurface({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: COLORS.journalPaper, border: BORDER.sticker, borderRadius: 16, boxShadow: SHADOW.sticker, position: 'relative', overflow: 'hidden', ...style }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 34, width: 1.6, background: COLORS.journalLine }} />
      <div style={{ position: 'absolute', top: 18, bottom: 18, left: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ width: 9, height: 9, borderRadius: 999, background: COLORS.journalLine, border: `1px solid 33` }} />
        ))}
      </div>
      {children}
    </div>
  )
}
const ruled = (extra?: React.CSSProperties): React.CSSProperties => ({ fontFamily: FONTS.script, fontWeight: 600, fontSize: 21, lineHeight: `${RULE}px`, color: COLORS.ink, ...extra })
const ruledBg = (top = 6) => ({
  backgroundImage: `repeating-linear-gradient(transparent, transparent ${RULE - 1}px, ${COLORS.ink}22 ${RULE - 1}px, ${COLORS.ink}22 ${RULE}px)`,
  backgroundPositionY: `${top}px`,
})

// ── Chaina's voice button ────────────────────────────────────────────────────
function ChainaSpeak({ speaking, onSpeak }: { speaking: boolean; onSpeak: () => void }) {
  return (
    <button
      type="button"
      onClick={onSpeak}
      aria-label="Chaina reads the question aloud"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0,
        background: speaking ? COLORS.journalAccent : W, color: speaking ? W : COLORS.ink,
        border: BORDER.sticker, borderRadius: 999, padding: '5px 12px 5px 6px', boxShadow: SHADOW.chip,
        cursor: 'pointer', fontFamily: FONTS.display, fontWeight: 800, fontSize: 13, textTransform: 'lowercase', transition: 'background 0.15s',
      }}
    >
      <span style={{ width: 24, height: 28, display: 'inline-flex', alignItems: 'flex-end', animation: speaking ? 'galli-bob 0.5s ease-in-out infinite' : 'none' }}>
        <Mascot size={24} mood={speaking ? 'happy' : 'idle'} />
      </span>
      {speaking ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Bars />
          bol rahi…
        </span>
      ) : 'Chaina padhegi'}
    </button>
  )
}
function Bars() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 2.5, height: 13 }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 3, height: 13, borderRadius: 2, background: W, transformOrigin: 'bottom', animation: `jbar 0.7s ease-in-out ${i * 0.13}s infinite` }} />
      ))}
    </span>
  )
}

function PeekPill({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
        background: on ? COLORS.mint : W, color: COLORS.ink, border: BORDER.sticker, borderRadius: 999,
        padding: '5px 13px', boxShadow: SHADOW.chip, cursor: 'pointer', fontFamily: FONTS.display, fontWeight: 800, fontSize: 13, textTransform: 'lowercase',
      }}
    >
      <span style={{ fontSize: 14, lineHeight: 1 }}>{on ? '🙈' : '👁'}</span>
      {on ? 'hide' : 'peek'}
    </button>
  )
}

// ── one gentle fix card ──────────────────────────────────────────────────────
function CorrectionCard({ fix }: { fix: JournalFix }) {
  if (fix.enrich) {
    return (
      <div style={{ background: COLORS.mint2, border: BORDER.stickerDashed, borderRadius: 14, padding: '9px 12px', fontFamily: FONTS.body, fontWeight: 700, fontSize: 12.5, color: COLORS.ink, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 14 }}>✨</span>
        <span>{fix.note}</span>
      </div>
    )
  }
  return (
    <div style={{ background: W, border: BORDER.thin, borderRadius: 14, padding: '9px 12px', fontFamily: FONTS.body, fontWeight: 700, fontSize: 12.5, color: COLORS.ink }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
        <span style={{ textDecoration: 'line-through', textDecorationColor: COLORS.red, textDecorationThickness: 2, color: COLORS.ink60 }}>{fix.original}</span>
        <span style={{ color: COLORS.ink45 }}>→</span>
        <span style={{ background: COLORS.mint, border: `1.8px solid ${COLORS.ink}`, borderRadius: 999, padding: '1px 9px', fontWeight: 800 }}>{fix.fix}</span>
      </div>
      <div style={{ fontFamily: FONTS.script, fontWeight: 600, fontSize: 13.5, color: COLORS.ink45, marginTop: 3 }}>{fix.note}</div>
    </div>
  )
}

// ── today's page ─────────────────────────────────────────────────────────────
function TodayPage({ prompt, entry, setEntry, done, result, onCheck, onTuck, onEdit }: {
  prompt: ReturnType<typeof promptForDate>
  entry: string
  setEntry: (v: string) => void
  done: boolean
  result: JournalCheck | null
  onCheck: () => void
  onTuck: () => void
  onEdit: () => void
}) {
  const { config } = useLanguage()
  const [speaking, setSpeaking] = useState(false)
  const [peek, setPeek] = useState(false)

  const doSpeak = () => {
    if (speaking) { stopSpeaking(); setSpeaking(false); return }
    setSpeaking(true)
    speak(prompt.hinglish, config.ttsLocale, () => setSpeaking(false))
  }
  useEffect(() => () => stopSpeaking(), [])

  return (
    <div style={{ padding: '2px 16px 48px', maxWidth: 480, margin: '0 auto', animation: 'jrise 0.3s ease-out' }}>
      <PageSurface style={{ padding: '14px 18px 18px 46px', minHeight: done ? undefined : 430 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: `1.8px solid 22`, paddingBottom: 4, marginBottom: 10 }}>
          <div style={ruled({ fontSize: 24 })}>
            {weekdayLabel(new Date())}, {shortLabel(new Date())}
            <div style={{ fontFamily: FONTS.script, fontSize: 16, color: COLORS.ink45, lineHeight: 1 }}>Dear diary,</div>
          </div>
          <div style={{ marginTop: -6, marginRight: -6, animation: speaking ? 'galli-bob 0.5s ease-in-out infinite' : 'float-y 3.4s ease-in-out infinite', transformOrigin: 'bottom center' }}>
            <Mascot size={52} mood={speaking ? 'happy' : 'wave'} />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: FONTS.body, fontWeight: 800, fontSize: 15.5, color: COLORS.ink, lineHeight: 1.35 }}>{prompt.hinglish}</div>
          {peek && <div style={{ fontFamily: FONTS.script, fontWeight: 600, fontSize: 16, color: COLORS.ink45, marginTop: 2, animation: 'jpop 0.2s ease-out' }}>{prompt.en}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 9 }}>
            <ChainaSpeak speaking={speaking} onSpeak={doSpeak} />
            <PeekPill on={peek} onToggle={() => { playSound('tap'); setPeek((v) => !v) }} />
          </div>
        </div>

        {!done ? (
          <div style={{ position: 'relative', ...ruledBg(6), minHeight: RULE * 5 }}>
            <textarea
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder={`${prompt.starter}…  (Hinglish mein likho)`}
              spellCheck={false}
              rows={5}
              style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', resize: 'none', ...ruled(), paddingTop: 6, minHeight: RULE * 5, display: 'block' }}
            />
          </div>
        ) : (
          <div style={{ ...ruledBg(6), minHeight: RULE * 3 }}>
            <div style={{ ...ruled(), paddingTop: 6, whiteSpace: 'pre-wrap' }}>{entry}</div>
          </div>
        )}
      </PageSurface>

      {!done ? (
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button type="button" disabled={!entry.trim()} onClick={onCheck} style={{
            flexShrink: 0, padding: '14px 16px', border: BORDER.sticker, borderRadius: 16,
            background: entry.trim() ? COLORS.journalAccentSoft : W, color: COLORS.ink,
            boxShadow: entry.trim() ? SHADOW.sticker : 'none', cursor: entry.trim() ? 'pointer' : 'default', opacity: entry.trim() ? 1 : 0.5,
            fontFamily: FONTS.display, fontWeight: 800, fontSize: 14.5, textTransform: 'lowercase',
          }}>🔍 check</button>
          <button type="button" disabled={!entry.trim()} onClick={onTuck} style={{
            flex: 1, padding: 14, border: BORDER.sticker, borderRadius: 16,
            background: entry.trim() ? COLORS.journalAccent : COLORS.journalDisabled, color: entry.trim() ? W : COLORS.ink60,
            boxShadow: SHADOW.sticker, cursor: entry.trim() ? 'pointer' : 'default',
            fontFamily: FONTS.display, fontWeight: 800, fontSize: 16, textTransform: 'lowercase',
          }}>tuck into the diary →</button>
        </div>
      ) : (
        <DoneBlock result={result} onEdit={onEdit} />
      )}
    </div>
  )
}

function DoneBlock({ result, onEdit }: { result: JournalCheck | null; onEdit: () => void }) {
  if (!result) return null
  return (
    <div style={{ marginTop: 16, animation: 'jrise 0.35s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          background: COLORS.journalAccent2, color: W, border: BORDER.sticker, borderRadius: 999,
          padding: '5px 16px', boxShadow: SHADOW.chip, fontFamily: FONTS.display, fontWeight: 800, fontSize: 13,
          textTransform: 'lowercase', animation: 'jstamp 0.4s ease-out',
        }}>✓ tucked in for today</div>
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit today's entry"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, background: W, color: COLORS.ink,
            border: BORDER.sticker, borderRadius: 999, padding: '5px 12px', boxShadow: SHADOW.chip,
            cursor: 'pointer', fontFamily: FONTS.display, fontWeight: 800, fontSize: 12, textTransform: 'lowercase',
          }}
        >
          ✎ edit
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 12 }}>
        <div style={{ flexShrink: 0 }}><Mascot size={62} mood={result.mood === 'sympathy' ? 'sympathy' : 'happy'} /></div>
        <div style={{ flex: 1, background: W, border: BORDER.sticker, borderRadius: 16, borderBottomLeftRadius: 5, padding: '10px 13px', boxShadow: SHADOW.chip, fontFamily: FONTS.body, fontWeight: 700, fontSize: 13.5, color: COLORS.ink, lineHeight: 1.4 }}>
          {result.reaction}
        </div>
      </div>
      <Divider label="chaina's little notes" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {result.fixes.map((f, i) => <CorrectionCard key={i} fix={f} />)}
      </div>
    </div>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 8px' }}>
      <div style={{ height: 1.5, flex: 1, background: `${COLORS.ink}22` }} />
      <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 11, color: COLORS.ink45, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</span>
      <div style={{ height: 1.5, flex: 1, background: `${COLORS.ink}22` }} />
    </div>
  )
}

// ── check modal ──────────────────────────────────────────────────────────────
function CheckSheet({ loading, result, onClose, onTuck }: { loading: boolean; result: JournalCheck | null; onClose: () => void; onTuck: () => void }) {
  const clean = !!result && result.fixes.length === 1 && !!result.fixes[0].enrich
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(54,40,30,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 22, animation: 'jfade 0.18s ease-out' }}>
      <div onClick={(e) => e.stopPropagation()} className="no-scrollbar" style={{
        width: '100%', maxWidth: 332, background: COLORS.journalPaper, border: BORDER.sticker, borderRadius: 24,
        boxShadow: '6px 6px 0 ' + COLORS.ink, padding: '16px 18px 18px', animation: 'jspring 0.34s cubic-bezier(.2,.9,.3,1.1)', position: 'relative', maxHeight: '82vh', overflowY: 'auto',
      }}>
        <div style={{ position: 'absolute', top: -42, left: '50%', transform: 'translateX(-50%)' }}>
          <Mascot size={64} mood={loading ? 'idle' : clean ? 'excited' : 'happy'} />
        </div>
        <div style={{ textAlign: 'center', marginTop: 26, marginBottom: 12 }}>
          <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 18, color: COLORS.ink }}>
            {loading ? 'Chaina padh rahi…' : clean ? 'sab sahi hai! 🎉' : 'Chaina ne padh liya 👀'}
          </div>
          <div style={{ fontFamily: FONTS.script, fontWeight: 600, fontSize: 16, color: COLORS.ink45, marginTop: 1 }}>
            {loading ? 'ek pal ruko' : clean ? 'ek chhoti si tip neeche' : 'kuch chhote sudhaar, phir tuck karo'}
          </div>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 14px' }}><Bars /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {result?.fixes.map((f, i) => <CorrectionCard key={i} fix={f} />)}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 14, border: BORDER.sticker, background: W, color: COLORS.ink, boxShadow: SHADOW.chip, cursor: 'pointer', fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, textTransform: 'lowercase' }}>theek karun</button>
          <button type="button" disabled={loading} onClick={onTuck} style={{ flex: 1, padding: 12, borderRadius: 14, border: BORDER.sticker, background: loading ? COLORS.journalDisabled : COLORS.journalAccent, color: loading ? COLORS.ink60 : W, boxShadow: SHADOW.chip, cursor: loading ? 'default' : 'pointer', fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, textTransform: 'lowercase' }}>tuck it in →</button>
        </div>
      </div>
    </div>
  )
}

// ── the diary archive: streak + calendar + flip-back book ────────────────────
function DiaryView({ prefix, streak }: { prefix: string; streak: number }) {
  const [archive, setArchive] = useState<ArchivePage[]>([])
  const [calendar, setCalendar] = useState<CalendarCell[]>([])
  const [idx, setIdx] = useState(0)
  const [flip, setFlip] = useState<'next' | 'prev'>('next')
  const [trans, setTrans] = useState(false)

  useEffect(() => {
    setArchive(getArchive(prefix))
    setCalendar(getCalendar(prefix))
  }, [prefix])

  const page = archive[idx]
  const turn = (dir: 'next' | 'prev') => {
    playSound('swipe')
    setTrans(false)
    setFlip(dir)
    setIdx((i) => (dir === 'next' ? Math.min(archive.length - 1, i + 1) : Math.max(0, i - 1)))
  }

  return (
    <div style={{ padding: '2px 16px 28px', maxWidth: 480, margin: '0 auto', animation: 'jrise 0.3s ease-out' }}>
      {/* streak + calendar */}
      <div style={{ background: W, border: BORDER.sticker, borderRadius: 18, boxShadow: SHADOW.sticker, padding: 14, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 15, color: COLORS.ink }}>your streak</div>
          <StreakChip count={streak} small />
        </div>
        <CalendarStrip cells={calendar} />
      </div>

      {archive.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 12px', fontFamily: FONTS.script, fontWeight: 600, fontSize: 18, color: COLORS.ink45 }}>
          <div style={{ marginBottom: 8 }}><Mascot size={64} mood="idle" /></div>
          abhi tak koi panna nahi. aaj se shuru karo.
        </div>
      ) : (
        <>
          <div style={{ position: 'relative', perspective: 1500 }}>
            <PageSurface key={idx} style={{ padding: '14px 16px 16px 46px', minHeight: 220, animation: `${flip === 'next' ? 'book-next' : 'book-prev'} 0.46s ease-out`, backfaceVisibility: 'hidden' }}>
              <div style={{ ...ruled({ fontSize: 21 }), borderBottom: `1.8px solid 22`, paddingBottom: 2, marginBottom: 8, paddingRight: 28 }}>{page.label}</div>
              <div style={{ fontFamily: FONTS.body, fontWeight: 800, fontSize: 13, color: COLORS.ink60, fontStyle: 'italic', marginBottom: 8 }}>“{page.prompt}”</div>
              <div style={ruledBg(4)}>
                <div style={{ ...ruled({ fontSize: 20 }), paddingTop: 4, whiteSpace: 'pre-wrap' }}>{page.entry}</div>
              </div>
              {page.translation && (
                <div style={{ marginTop: 10 }}>
                  <button type="button" onClick={() => { playSound('tap'); setTrans((v) => !v) }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: FONTS.body, fontWeight: 800, fontSize: 12, color: COLORS.journalAccent, borderBottom: `1.8px dashed `, lineHeight: 1.3 }}>
                    {trans ? 'hide English' : 'translate ↓'}
                  </button>
                  {trans && <div style={{ marginTop: 6, fontFamily: FONTS.body, fontWeight: 600, fontSize: 13, color: COLORS.ink60, lineHeight: 1.5, animation: 'jpop 0.2s ease-out' }}>{page.translation}</div>}
                </div>
              )}
            </PageSurface>
            <div style={{ position: 'absolute', top: -6, right: 18, width: 18, height: 40, background: COLORS.journalAccent2, border: `1.8px solid `, borderTop: 'none', clipPath: 'polygon(0 0,100% 0,100% 100%,50% 80%,0 100%)' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
            <button type="button" disabled={idx >= archive.length - 1} onClick={() => turn('next')} style={flipBtn(idx < archive.length - 1)}>← older</button>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontFamily: FONTS.script, fontWeight: 600, fontSize: 15, color: COLORS.ink45 }}>{idx === 0 ? 'most recent page' : page.label}</div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 10, color: COLORS.ink45, opacity: 0.75, marginTop: 1 }}>page {archive.length - idx} of {archive.length}</div>
            </div>
            <button type="button" disabled={idx <= 0} onClick={() => turn('prev')} style={flipBtn(idx > 0)}>newer →</button>
          </div>
        </>
      )}
    </div>
  )
}

function CalendarStrip({ cells }: { cells: CalendarCell[] }) {
  const dows = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
        {dows.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontFamily: FONTS.display, fontWeight: 800, fontSize: 10, color: COLORS.ink45 }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {cells.map((c) => {
          const j = c.journaled
          const tileBg = j ? COLORS.journalFill : c.isToday ? COLORS.cream : `${COLORS.ink}08`
          return (
            <div key={c.dateKey} style={{
              aspectRatio: '1', borderRadius: 10,
              border: c.isToday ? `2.5px solid ${COLORS.journalAccent}` : j ? `1px solid 22` : `1px solid 18`,
              background: tileBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: c.isToday ? `2px 2px 0 ${COLORS.journalAccent}55` : 'none',
            }}>
              {!j && <span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 10, color: COLORS.ink45 }}>{c.date}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const iconBtn: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 999, background: W, border: BORDER.sticker, boxShadow: SHADOW.chip,
  cursor: 'pointer', color: COLORS.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0,
}
function flipBtn(enabled: boolean): React.CSSProperties {
  return {
    padding: '8px 14px', borderRadius: 999, background: enabled ? W : 'transparent',
    border: `2.5px solid ${COLORS.ink}${enabled ? '' : '40'}`, boxShadow: enabled ? SHADOW.chip : 'none',
    cursor: enabled ? 'pointer' : 'default', color: enabled ? COLORS.ink : COLORS.ink45,
    fontFamily: FONTS.display, fontWeight: 800, fontSize: 12.5, textTransform: 'lowercase',
  }
}
