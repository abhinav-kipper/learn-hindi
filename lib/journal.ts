// Chai Diary — the daily journal engine. Once a day Chaina asks one warm,
// personal question; the learner answers in romanised Hindi (Hinglish, never
// Devanagari). Devanagari is kept ONLY as the TTS input so Chaina reads the
// question aloud in her natural (Anika) voice.
//
// Storage is namespaced per language prefix (like lib/progress, lib/mistakes):
//   `${prefix}-journal-<YYYY-MM-DD>` → { entry, done, ts, reaction, mood, fixes, translation }
// The archive + streak + calendar are derived from the real saved history.

export interface JournalFix {
  original: string
  fix: string
  note: string
  /** an encouragement nudge instead of a correction (already-clean entry) */
  enrich?: boolean
}

export type JournalMood = 'happy' | 'sympathy' | 'neutral'

export interface JournalCheck {
  reaction: string
  mood: JournalMood
  fixes: JournalFix[]
  /** English rendering of the entry, for the archive "translate" reveal */
  translation?: string
}

export interface JournalEntry {
  entry: string
  done: boolean
  ts: string // ISO timestamp of the last save
  reaction?: string
  mood?: JournalMood
  fixes?: JournalFix[]
  translation?: string
  /** ids of the mistakes logged for this entry, so an edit can reconcile them */
  mistakeIds?: string[]
}

export interface JournalPrompt {
  id: string
  hi: string // Devanagari — spoken by Chaina (TTS only, never shown to type)
  hinglish: string // shown, and answered in this script
  en: string // peek translation
  starter: string // placeholder scaffold
  tag: string
}

export interface ArchivePage {
  dateKey: string
  label: string // "16 Jun"
  prompt: string // the prompt's hinglish for that day
  entry: string
  translation?: string
}

// ── the daily prompt rotation — warm, personal, answerable in 1-3 lines ──
// Romanisation follows the app's house style (accha/acchi, khaaya, theek).
export const PROMPTS: JournalPrompt[] = [
  { id: 'day-did', hi: 'आज तुमने क्या किया?', hinglish: 'Aaj tumne kya kiya?', en: 'What did you do today?', starter: 'Aaj maine', tag: 'your day' },
  { id: 'feeling-now', hi: 'अभी तुम कैसा महसूस कर रहे हो?', hinglish: 'Abhi tum kaisa mehsoos kar rahe ho?', en: 'How are you feeling right now?', starter: 'Main', tag: 'feelings' },
  { id: 'best-part', hi: 'आज की सबसे अच्छी बात क्या थी?', hinglish: 'Aaj ki sabse acchi baat kya thi?', en: 'What was the best part of today?', starter: 'Sabse acchi baat', tag: 'small joys' },
  { id: 'tomorrow', hi: 'कल तुम क्या करने वाले हो?', hinglish: 'Kal tum kya karne waale ho?', en: 'What are you going to do tomorrow?', starter: 'Kal main', tag: 'plans' },
  { id: 'ate', hi: 'आज तुमने क्या खाया?', hinglish: 'Aaj tumne kya khaaya?', en: 'What did you eat today?', starter: 'Aaj maine', tag: 'your day' },
  { id: 'grateful', hi: 'तुम किस बात के लिए शुक्रिया कहना चाहते हो?', hinglish: 'Tum kis baat ke liye shukriya kehna chahte ho?', en: 'What do you want to say thank you for?', starter: 'Main shukriya', tag: 'gratitude' },
  { id: 'who', hi: 'आज किससे बात हुई?', hinglish: 'Aaj kisse baat hui?', en: 'Who did you talk to today?', starter: 'Aaj maine', tag: 'people' },
  { id: 'made-happy', hi: 'आज कौन सी बात ने तुम्हें खुश किया?', hinglish: 'Aaj kaun si baat ne tumhe khush kiya?', en: 'What made you happy today?', starter: 'Mujhe khushi hui', tag: 'small joys' },
  { id: 'learn-week', hi: 'इस हफ़्ते तुम क्या सीखना चाहते हो?', hinglish: 'Is hafte tum kya seekhna chahte ho?', en: 'What do you want to learn this week?', starter: 'Is hafte main', tag: 'plans' },
  { id: 'before-bed', hi: 'सोने से पहले तुम क्या सोच रहे हो?', hinglish: 'Soney se pehle tum kya soch rahe ho?', en: 'What are you thinking about before bed?', starter: 'Main soch raha hoon', tag: 'feelings' },
  { id: 'weather', hi: 'आज मौसम कैसा था?', hinglish: 'Aaj mausam kaisa tha?', en: 'How was the weather today?', starter: 'Aaj mausam', tag: 'your day' },
  { id: 'new', hi: 'आज कुछ नया हुआ क्या?', hinglish: 'Aaj kuch naya hua kya?', en: 'Did anything new happen today?', starter: 'Aaj', tag: 'small joys' },
  { id: 'family', hi: 'आज तुमने अपने परिवार को याद किया?', hinglish: 'Aaj tumne apne parivaar ko yaad kiya?', en: 'Did you think about your family today?', starter: 'Haan, maine', tag: 'people' },
  { id: 'laugh', hi: 'आज किस चीज़ ने तुम्हें हँसाया?', hinglish: 'Aaj kis cheez ne tumhe hansaaya?', en: 'What made you laugh today?', starter: 'Aaj', tag: 'small joys' },
]

// ── date helpers (local-time, matches the user's calendar day) ──────────────
export function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d.getTime() - start.getTime()) / 86400000)
}

/** Local YYYY-MM-DD (not UTC) so "today" matches the user's wall clock. */
export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function shortLabel(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}
export function weekdayLabel(d: Date): string {
  return WEEKDAYS[d.getDay()]
}

/** Deterministic prompt-of-the-day, stable for the whole calendar day. */
export function promptForDate(d: Date = new Date()): JournalPrompt {
  return PROMPTS[dayOfYear(d) % PROMPTS.length]
}

/** Recover the prompt that was shown on a past date (for the archive). */
function promptForKey(key: string): JournalPrompt {
  const [y, m, day] = key.split('-').map(Number)
  return promptForDate(new Date(y, m - 1, day))
}

// ── storage ─────────────────────────────────────────────────────────────────
const keyFor = (prefix: string, dk: string) => `${prefix}-journal-${dk}`

export function getEntry(prefix: string, dk: string = dateKey()): JournalEntry | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(keyFor(prefix, dk))
    return raw ? (JSON.parse(raw) as JournalEntry) : null
  } catch {
    return null
  }
}

export function saveEntry(prefix: string, dk: string, data: JournalEntry): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(keyFor(prefix, dk), JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

/** All journal date keys with a tucked-in (done) entry, newest first. */
export function getJournaledDateKeys(prefix: string): string[] {
  if (typeof window === 'undefined') return []
  const out: string[] = []
  const pre = `${prefix}-journal-`
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k || !k.startsWith(pre)) continue
    try {
      const data = JSON.parse(localStorage.getItem(k) || '{}') as JournalEntry
      if (data.done) out.push(k.slice(pre.length))
    } catch {
      /* skip */
    }
  }
  return out.sort((a, b) => (a < b ? 1 : -1))
}

/** Past tucked-in entries as flip-back archive pages, newest first. */
export function getArchive(prefix: string): ArchivePage[] {
  return getJournaledDateKeys(prefix).map((dk) => {
    const e = getEntry(prefix, dk)!
    const [y, m, day] = dk.split('-').map(Number)
    return {
      dateKey: dk,
      label: shortLabel(new Date(y, m - 1, day)),
      prompt: promptForKey(dk).hinglish,
      entry: e.entry,
      translation: e.translation,
    }
  })
}

/**
 * Journal streak: consecutive days with a tucked-in entry, counting back from
 * today (or from yesterday if today isn't done yet, so an unfinished today
 * doesn't break a live streak).
 */
export function getJournalStreak(prefix: string, today: Date = new Date()): number {
  const done = new Set(getJournaledDateKeys(prefix))
  if (done.size === 0) return 0
  let streak = 0
  const cursor = new Date(today)
  // If today isn't journaled yet, start the count from yesterday.
  if (!done.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (done.has(dateKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/** Calendar cells for the last `days` days, oldest → today. */
export interface CalendarCell {
  dateKey: string
  date: number
  journaled: boolean
  isToday: boolean
}
export function getCalendar(prefix: string, days = 21, today: Date = new Date()): CalendarCell[] {
  const done = new Set(getJournaledDateKeys(prefix))
  const cells: CalendarCell[] = []
  for (let off = days - 1; off >= 0; off--) {
    const d = new Date(today.getTime() - off * 86400000)
    const dk = dateKey(d)
    cells.push({ dateKey: dk, date: d.getDate(), journaled: done.has(dk), isToday: off === 0 })
  }
  return cells
}

// ── offline gentle-fix fallback ──────────────────────────────────────────────
// The real check calls the model (/api/journal-check). These few SAFE rules are
// only used when offline / the model is unreachable. They flag genuine beginner
// slips and deliberately do NOT contradict the app's taught romanisation
// (no accha->achha style nitpicks — the lessons teach "accha").
const FIX_RULES: { re: RegExp; fix: string; note: string }[] = [
  { re: /\bmai\b/i, fix: 'main', note: 'main means I. Keep the n so it does not read like may.' },
  { re: /\bhu\b/i, fix: 'hoon', note: 'hoon feels warmer and complete, like main khush hoon.' },
  { re: /\bmuje\b/i, fix: 'mujhe', note: 'There is a soft h in there, mujhe.' },
  { re: /\bthik\b/i, fix: 'theek', note: 'A slightly longer ee, theek hoon.' },
  { re: /\bkhaya\b/i, fix: 'khaaya', note: 'Double the aa to hold the long vowel, khaaya.' },
  { re: /\bnai\b/i, fix: 'nahi', note: 'For not / no, nahi is the fuller spelling.' },
]
const SAD_WORDS = /(thaka|thaki|udaas|akela|akeli|pareshaan|dukh|bura|nahi accha)/i
const HAPPY_WORDS = /(khush|accha|acchi|maza|pyaar|shukriya|sundar|badhiya|mast)/i
const WARM_HAPPY = [
  'Arre wah, padh ke main bhi muskura di.',
  'Bahut sundar likha. Tumhari Hindi roz behtar ho rahi hai.',
  'Kya baat hai. Aise hi roz thoda likhte raho.',
]
const WARM_SOFT = [
  'Aaram se. Har din halka nahi hota, likhne ke liye shabaash.',
  'Main yahan hoon. Kal naya din, nayi chai.',
  'Itna likhna bhi badi baat hai. Apna khayal rakhna.',
]
const WARM_NEUTRAL = [
  'Padh liya, accha laga tumhare din mein jhaankna.',
  'Shabaash. Roz ka ek chhota panna padhna mujhe pasand hai.',
  'Likhte raho, main har panna padhti hoon.',
]

/**
 * Keep only fixes that are real: a non-empty `original` that actually appears
 * in what the learner wrote, a different non-empty `fix`, capped at 3. Guards
 * against a model hallucinating a correction for text that isn't there (which
 * would strike through phantom words and save a bogus drillable mistake).
 */
export function keepRealFixes(entry: string, fixes: JournalFix[] | undefined): JournalFix[] {
  const lower = (entry || '').toLowerCase()
  return (fixes || [])
    .filter(
      (f) =>
        !!f &&
        typeof f.original === 'string' &&
        typeof f.fix === 'string' &&
        f.original.trim().length > 0 &&
        f.fix.trim().length > 0 &&
        f.original.trim().toLowerCase() !== f.fix.trim().toLowerCase() &&
        lower.includes(f.original.trim().toLowerCase()),
    )
    .slice(0, 3)
    .map((f) => ({ original: f.original.trim(), fix: f.fix.trim(), note: (f.note || '').trim() }))
}

/** Offline fallback analysis (no network). The model path is preferred. */
export function analyzeEntryOffline(text: string): JournalCheck {
  const t = (text || '').trim()
  const mood: JournalMood = SAD_WORDS.test(t) ? 'sympathy' : HAPPY_WORDS.test(t) ? 'happy' : 'neutral'
  const pool = mood === 'sympathy' ? WARM_SOFT : mood === 'happy' ? WARM_HAPPY : WARM_NEUTRAL
  const reaction = pool[t.length % pool.length]

  const fixes: JournalFix[] = []
  for (const r of FIX_RULES) {
    const m = t.match(r.re)
    if (m && !fixes.some((f) => f.fix === r.fix)) {
      fixes.push({ original: m[0], fix: r.fix, note: r.note })
    }
    if (fixes.length >= 3) break
  }
  if (fixes.length === 0) {
    fixes.push({ enrich: true, original: '', fix: '', note: 'Already clean. Next time try a feeling word like khush, thaka or shaant to add some colour.' })
  }
  return { reaction, mood, fixes }
}
