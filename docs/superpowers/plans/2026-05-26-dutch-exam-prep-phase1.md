# Dutch Exam-Prep Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pivot the Dutch section of the app into a focused Inburgeringsexamen B1 + KNM prep track. Phase 1 ships: 3-stage A1/A2/B1 framework on the Dutch home, a 100-question KNM module with study + drill modes, a B1/A2 exam-target toggle, an updated Dutch welcome modal, and 3 new Dutch Chaina moments.

**Architecture:** Add `content/dutch/knm.json` (100 questions, 6 categories). Add `lib/dutch/knm.ts` (TDD'd loaders + 30-question drill draw + scoring + attempt history) and `lib/dutch/exam-target.ts` (settings). Add `lib/dutch/level-map.ts` to tag existing 5 lessons + 7 foundations with A1/A2/B1. Add `/dutch/knm` and `/dutch/knm/drill` pages. Reorient `app/page.tsx` Dutch branch with goal banner + 3-stage path + 5 skill cards. UI labels all English; Dutch only for: KNM question text, Chaina voice lines, Dutch-skill-name subtitles for exposure-learning.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Vitest, Framer Motion, localStorage. Design primitives via `@/components/design` barrel. Existing Chaina moment system + frequency caps. Existing `useLanguage()` for branching.

**Spec:** `docs/superpowers/specs/2026-05-26-dutch-exam-prep-phase1-design.md`
**Repo:** `abhinav-kipper/learn-hindi`, branch: `main` (user has authorized working on main).

---

## Reference paths

- `app/page.tsx` — home; lines 73-76 split Hindi/Dutch loaders; line 208 mounts `<DutchWelcomeModal />`; line 611+ is the lesson list. The Dutch branch needs goal-banner + 3-stage path + 5 skill cards INSERTED before the existing lesson list (which stays as supplementary).
- `components/dutch-welcome-modal.tsx` (157 lines) — rewrite copy + add A2/B1 toggle.
- `components/design/moments.ts` — add 3 new entries to LINES + MOMENTS objects.
- `lib/dutch/lessons.ts` + `lib/dutch/foundations.ts` — existing loaders; do NOT modify.
- `content/dutch/lessons/*.json` (5 files) + `content/dutch/foundations/*.json` (7 files) — leave untouched; level mapping lives separately in `lib/dutch/level-map.ts`.
- `components/design/index.ts` — barrel; Sticker, Tag, Cutting, MotifIcon, COLORS, FONTS, BORDER, SHADOW, useChaina, canFire, markFired.
- `components/design/chainaFrequency.ts` — modes `'once-per-session'` / `'once-per-day'` / `'debounce-800ms'`.

KNM data shape (from spec §6):
```ts
{
  questions: Array<{
    id: string,                            // 'knm-001' .. 'knm-100'
    category: 'politiek' | 'werk' | 'onderwijs' | 'wonen' | 'gezondheid' | 'geschiedenis',
    question_nl: string,
    options_nl: [string, string, string, string],
    correct_index: 0 | 1 | 2 | 3,
    explanation_en: string,
    references?: string[]
  }>
}
```

---

## Task 1: Create `lib/dutch/exam-target.ts` with TDD

**Files:**
- Create: `lib/dutch/exam-target.ts`
- Create: `lib/dutch/exam-target.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `/home/user/learn-hindi/lib/dutch/exam-target.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { getExamTarget, setExamTarget, EXAM_TARGET_KEY } from './exam-target'

beforeEach(() => {
  localStorage.clear()
})

describe('dutch exam-target', () => {
  it('returns "b1" by default when nothing is stored', () => {
    expect(getExamTarget()).toBe('b1')
  })

  it('returns "a2" when explicitly set', () => {
    setExamTarget('a2')
    expect(getExamTarget()).toBe('a2')
  })

  it('returns "b1" when explicitly set', () => {
    setExamTarget('a2')
    setExamTarget('b1')
    expect(getExamTarget()).toBe('b1')
  })

  it('persists to localStorage under EXAM_TARGET_KEY', () => {
    setExamTarget('a2')
    expect(localStorage.getItem(EXAM_TARGET_KEY)).toBe('a2')
  })

  it('treats unknown values as b1 (safe default)', () => {
    localStorage.setItem(EXAM_TARGET_KEY, 'gibberish')
    expect(getExamTarget()).toBe('b1')
  })
})
```

- [ ] **Step 2: Run tests, expect FAIL**

```bash
npx vitest run lib/dutch/exam-target.test.ts
```

Expected: tests fail with "Cannot resolve module './exam-target'".

- [ ] **Step 3: Implement**

Create `/home/user/learn-hindi/lib/dutch/exam-target.ts`:

```ts
export const EXAM_TARGET_KEY = 'dutch-exam-target'

export type ExamTarget = 'a2' | 'b1'

function safeWindow(): Window | null {
  return typeof window === 'undefined' ? null : window
}

export function getExamTarget(): ExamTarget {
  const w = safeWindow()
  if (!w) return 'b1'
  const raw = w.localStorage.getItem(EXAM_TARGET_KEY)
  return raw === 'a2' ? 'a2' : 'b1'
}

export function setExamTarget(target: ExamTarget): void {
  const w = safeWindow()
  if (!w) return
  w.localStorage.setItem(EXAM_TARGET_KEY, target)
}
```

- [ ] **Step 4: Tests pass + tsc clean**

```bash
npx vitest run lib/dutch/exam-target.test.ts
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add lib/dutch/exam-target.ts lib/dutch/exam-target.test.ts
git commit -m "feat(dutch): exam-target preference (a2 | b1, default b1)"
```

---

## Task 2: Create `lib/dutch/level-map.ts`

**Files:**
- Create: `lib/dutch/level-map.ts`
- Create: `lib/dutch/level-map.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest'
import { getLevel, getItemsByLevel, ALL_LEVELS } from './level-map'

describe('dutch level-map', () => {
  it('returns the level for a known lesson id', () => {
    expect(getLevel('supermarket')).toBe('A1')
    expect(getLevel('introductions')).toBe('A1')
  })

  it('returns the level for a known foundation id', () => {
    expect(getLevel('numbers')).toBe('A1')
    expect(getLevel('past-tense')).toBe('A2')
  })

  it('returns "A1" as safe default for unknown ids', () => {
    expect(getLevel('nonexistent-thing')).toBe('A1')
  })

  it('getItemsByLevel groups all known items by level', () => {
    const a1 = getItemsByLevel('A1')
    expect(a1.length).toBeGreaterThan(0)
    expect(a1).toContain('supermarket')
  })

  it('ALL_LEVELS is the canonical [A1, A2, B1] order', () => {
    expect(ALL_LEVELS).toEqual(['A1', 'A2', 'B1'])
  })
})
```

- [ ] **Step 2: Run tests, expect FAIL**

```bash
npx vitest run lib/dutch/level-map.test.ts
```

- [ ] **Step 3: Implement**

```ts
export type Level = 'A1' | 'A2' | 'B1'

export const ALL_LEVELS: Level[] = ['A1', 'A2', 'B1']

// Best-effort level tagging for existing 5 lessons + 7 foundations.
// Update as content grows.
const LEVEL_MAP: Record<string, Level> = {
  // Lessons (situational)
  'supermarket':    'A1',
  'introductions':  'A1',
  'cafe':           'A1',
  'doctor':         'A2',
  'transport':      'A2',
  // Foundations (grammar)
  'numbers':        'A1',
  'pronunciation':  'A1',
  'present-tense':  'A1',
  'de-het':         'A1',
  'word-order':     'A2',
  'past-tense':     'A2',
  'modals':         'A2',
}

export function getLevel(id: string): Level {
  return LEVEL_MAP[id] ?? 'A1'
}

export function getItemsByLevel(level: Level): string[] {
  return Object.entries(LEVEL_MAP)
    .filter(([, lvl]) => lvl === level)
    .map(([id]) => id)
}
```

- [ ] **Step 4: Tests pass + tsc clean**

```bash
npx vitest run lib/dutch/level-map.test.ts
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add lib/dutch/level-map.ts lib/dutch/level-map.test.ts
git commit -m "feat(dutch): level-map tagging existing 12 items A1/A2"
```

---

## Task 3: Author `content/dutch/knm.json` (100 questions)

**Files:**
- Create: `content/dutch/knm.json`

The KNM exam tests Knowledge of Dutch Society. 100 questions across 6 categories, evenly distributed (17 / 17 / 17 / 17 / 16 / 16 = 100).

Quality bar: Each question is a 4-option multiple choice in Dutch, with one correct answer, plus an English explanation. Topics must reflect what the **Naar Nederland** handbook + **DUO oefenen.nl** practice exams cover. **Do NOT copy DUO's exact wording** — write original questions in the same format on the same factual topics.

### Step 1: Draft the structure with 6 exemplar questions (one per category)

Start `content/dutch/knm.json`:

```json
{
  "questions": [
    {
      "id": "knm-001",
      "category": "politiek",
      "question_nl": "Wie is het staatshoofd van Nederland?",
      "options_nl": [
        "De minister-president",
        "De koning",
        "De voorzitter van de Tweede Kamer",
        "De burgemeester van Amsterdam"
      ],
      "correct_index": 1,
      "explanation_en": "The Netherlands is a constitutional monarchy. The King (currently King Willem-Alexander) is the head of state, while the prime minister leads the government.",
      "references": ["Naar Nederland Ch. 2"]
    },
    {
      "id": "knm-018",
      "category": "werk",
      "question_nl": "Hoeveel uur per week is een fulltime baan in Nederland meestal?",
      "options_nl": ["32 uur", "36-40 uur", "45 uur", "50 uur"],
      "correct_index": 1,
      "explanation_en": "A full-time job in the Netherlands is typically 36-40 hours per week. Many Dutch people also work part-time (32 hours or less).",
      "references": ["Naar Nederland Ch. 5"]
    },
    {
      "id": "knm-035",
      "category": "onderwijs",
      "question_nl": "Tot welke leeftijd is school verplicht in Nederland?",
      "options_nl": ["12 jaar", "16 jaar", "18 jaar", "21 jaar"],
      "correct_index": 2,
      "explanation_en": "Education is compulsory until age 16 (leerplicht), and partial schooling (qualificatieplicht) continues until 18 if you don't have a basic qualification yet.",
      "references": ["Naar Nederland Ch. 6"]
    },
    {
      "id": "knm-052",
      "category": "wonen",
      "question_nl": "Wat doe je als je een huurwoning wilt huren via de gemeente?",
      "options_nl": [
        "Je belt direct de huurder",
        "Je schrijft je in bij een woningcorporatie",
        "Je koopt het huis eerst",
        "Je vraagt het aan een makelaar"
      ],
      "correct_index": 1,
      "explanation_en": "Social housing (sociale huur) is allocated by housing corporations (woningcorporaties). You register on a waiting list — wait times can be many years in larger cities.",
      "references": ["Naar Nederland Ch. 4"]
    },
    {
      "id": "knm-068",
      "category": "gezondheid",
      "question_nl": "Wie moet je in Nederland eerst bezoeken als je ziek bent?",
      "options_nl": [
        "Een specialist in het ziekenhuis",
        "De spoedeisende hulp",
        "Je huisarts",
        "Een apotheker"
      ],
      "correct_index": 2,
      "explanation_en": "The huisarts (general practitioner) is the gateway to Dutch healthcare. You see them first for any non-emergency issue; they refer you to a specialist if needed.",
      "references": ["Naar Nederland Ch. 7"]
    },
    {
      "id": "knm-085",
      "category": "geschiedenis",
      "question_nl": "In welk jaar werd Nederland bevrijd van de Duitse bezetting?",
      "options_nl": ["1940", "1942", "1945", "1948"],
      "correct_index": 2,
      "explanation_en": "The Netherlands was liberated in 1945, at the end of World War II. May 5th is celebrated as Liberation Day (Bevrijdingsdag) every year.",
      "references": ["Naar Nederland Ch. 1"]
    }
  ]
}
```

### Step 2: Draft the remaining 94 questions

Topics to cover (use these as a checklist; balance across the 6 categories to reach 17/17/17/17/16/16):

**Politiek (17 total):** King's role, prime minister, Tweede Kamer / Eerste Kamer, voting (active at 18, passive at 18), gemeenteraad, provinciale staten, EU membership, coalitie, parliamentary system, separation of church and state, basic rights (right to vote, freedom of religion, freedom of speech, equal treatment), monarchy vs republic, what a wethouder is, what a burgemeester does, basic constitutional rights, the role of the Senate vs House.

**Werk (17 total):** Full-time vs part-time, minimum wage, vakantiedagen, BSN number, payslip (bruto / netto / loonbelasting), arbeidsovereenkomst (contract types: bepaalde tijd / onbepaalde tijd / oproep), zelfstandige / zzp'er, UWV unemployment insurance, work permit for non-EU, sick leave (ziekteverlof) rules, pension (AOW vs pensioenfonds), CAO collective agreements, equal-treatment law at work, work council (OR), pregnancy leave, paternity leave, gender pay gap policy.

**Onderwijs (17 total):** Compulsory schooling ages, school system levels (basisschool / VMBO / HAVO / VWO / MBO / HBO / WO), CITO test, exam structure, free vs religious schools, school holidays, kinderopvang, studie­financiering (student finance), Erasmus exchange, school registration, language requirements for primary school, special education, language requirements for the inburgering, education-to-work pathways, where to register a new child for school, sport / extracurricular.

**Wonen (17 total):** Social housing waiting list, housing corporation registration, private rental market, koophuis vs huurhuis, energy label (A-G), gemeentelijke belasting (OZB / afvalstoffenheffing / rioolheffing), huurtoeslag (rent subsidy), huurder rights, deposit (waarborgsom), maintenance responsibilities, energy contract (gas + electricity), water company, internet provider, registering at gemeente when you move, GBA / BRP registration, neighbour disputes, smoking laws in apartments.

**Gezondheid (16 total):** Huisarts as gateway, ziekenhuis specialist referral, zorgverzekering mandatory at 18, basisverzekering vs aanvullende, eigen risico (excess), apotheek, GGD vaccinations, dentist not in basic insurance, mental health (GGZ), emergency number 112, pregnancy + verloskundige, kraamzorg, abortion legal, euthanasia legal under strict conditions, organ donation default, donor registry.

**Geschiedenis (16 total):** WWII liberation 1945, German occupation 1940-1945, Anne Frank, William of Orange founder, golden age (Gouden Eeuw) 17th century, Dutch East India Company (VOC), independence from Spain, slavery abolished 1863, women's suffrage 1919, EU founding (1957 Treaty of Rome), euro adopted 2002, Schengen agreement, monarchy restored 1815, Belgian independence 1830, Watersnoodramp 1953 flood, Delta Works.

### Step 3: Validate

```bash
node -e "const d = JSON.parse(require('fs').readFileSync('content/dutch/knm.json','utf8')); console.log('questions:', d.questions.length); const cats = {}; d.questions.forEach(q => cats[q.category] = (cats[q.category]||0)+1); console.log(cats);"
```

Expected output:
```
questions: 100
{ politiek: 17, werk: 17, onderwijs: 17, wonen: 17, gezondheid: 16, geschiedenis: 16 }
```

If the counts don't match exactly (17/17/17/17/16/16 = 100), adjust until they do. IDs must be `knm-001` through `knm-100` in order.

### Step 4: Commit

```bash
git add content/dutch/knm.json
git commit -m "content(dutch): add 100 KNM questions across 6 categories"
```

---

## Task 4: Create `lib/dutch/knm.ts` with TDD

**Files:**
- Create: `lib/dutch/knm.ts`
- Create: `lib/dutch/knm.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getKnmQuestions,
  getQuestionsByCategory,
  drawDrillSet,
  scoreAttempt,
  saveAttempt,
  getAttemptHistory,
  PASS_THRESHOLD,
  DRILL_SIZE,
  ATTEMPTS_KEY,
  LEARNED_KEY,
  markLearned,
  isLearned,
  getLearnedCount,
} from './knm'

beforeEach(() => {
  localStorage.clear()
})

describe('knm', () => {
  it('loads 100 questions', () => {
    expect(getKnmQuestions().length).toBe(100)
  })

  it('every question has all required fields', () => {
    for (const q of getKnmQuestions()) {
      expect(q.id).toMatch(/^knm-\d{3}$/)
      expect(['politiek','werk','onderwijs','wonen','gezondheid','geschiedenis']).toContain(q.category)
      expect(q.options_nl.length).toBe(4)
      expect([0,1,2,3]).toContain(q.correct_index)
      expect(q.question_nl.length).toBeGreaterThan(0)
      expect(q.explanation_en.length).toBeGreaterThan(0)
    }
  })

  it('getQuestionsByCategory filters correctly', () => {
    const politiek = getQuestionsByCategory('politiek')
    expect(politiek.length).toBeGreaterThan(0)
    politiek.forEach((q) => expect(q.category).toBe('politiek'))
  })

  it('drawDrillSet returns DRILL_SIZE unique questions', () => {
    const drill = drawDrillSet()
    expect(drill.length).toBe(DRILL_SIZE)
    const ids = new Set(drill.map((q) => q.id))
    expect(ids.size).toBe(DRILL_SIZE)
  })

  it('drawDrillSet returns different sets on repeated calls (randomness sanity)', () => {
    const a = drawDrillSet().map((q) => q.id).join(',')
    const b = drawDrillSet().map((q) => q.id).join(',')
    // With 30 of 100, chance of identical draw is astronomically low
    expect(a).not.toBe(b)
  })

  it('scoreAttempt counts correct answers', () => {
    const drill = drawDrillSet()
    const allCorrect = drill.map((q) => q.correct_index)
    expect(scoreAttempt(drill, allCorrect).score).toBe(DRILL_SIZE)
    expect(scoreAttempt(drill, allCorrect).passed).toBe(true)

    const allWrong = drill.map((q) => (q.correct_index + 1) % 4 as 0|1|2|3)
    expect(scoreAttempt(drill, allWrong).score).toBe(0)
    expect(scoreAttempt(drill, allWrong).passed).toBe(false)
  })

  it('PASS_THRESHOLD is 0.8 (80%)', () => {
    expect(PASS_THRESHOLD).toBe(0.8)
  })

  it('scoreAttempt passes at exactly 80%', () => {
    const drill = drawDrillSet()
    const need = Math.ceil(DRILL_SIZE * 0.8) // 24 of 30
    const answers = drill.map((q, i) => (i < need ? q.correct_index : (q.correct_index + 1) % 4 as 0|1|2|3))
    expect(scoreAttempt(drill, answers).passed).toBe(true)
  })

  it('saveAttempt + getAttemptHistory persist across calls', () => {
    saveAttempt({ ts: 1000, score: 25, total: 30, passed: true })
    saveAttempt({ ts: 2000, score: 20, total: 30, passed: false })
    const hist = getAttemptHistory()
    expect(hist.length).toBe(2)
    expect(hist[0].ts).toBe(2000)  // most recent first
    expect(hist[1].ts).toBe(1000)
  })

  it('getAttemptHistory caps at 50 attempts (most recent first)', () => {
    for (let i = 0; i < 60; i++) {
      saveAttempt({ ts: i, score: 0, total: 30, passed: false })
    }
    const hist = getAttemptHistory()
    expect(hist.length).toBe(50)
    expect(hist[0].ts).toBe(59)
  })

  it('markLearned + isLearned + getLearnedCount track per-question learning', () => {
    expect(isLearned('knm-001')).toBe(false)
    expect(getLearnedCount()).toBe(0)
    markLearned('knm-001')
    markLearned('knm-002')
    markLearned('knm-001') // idempotent
    expect(isLearned('knm-001')).toBe(true)
    expect(getLearnedCount()).toBe(2)
  })
})
```

- [ ] **Step 2: Run tests, expect FAIL**

```bash
npx vitest run lib/dutch/knm.test.ts
```

- [ ] **Step 3: Implement**

Create `/home/user/learn-hindi/lib/dutch/knm.ts`:

```ts
import knmData from '@/content/dutch/knm.json'

export const DRILL_SIZE = 30
export const PASS_THRESHOLD = 0.8
export const ATTEMPTS_KEY = 'dutch-knm-attempts'
export const LEARNED_KEY = 'dutch-knm-learned'
const MAX_ATTEMPTS = 50

export type Category = 'politiek' | 'werk' | 'onderwijs' | 'wonen' | 'gezondheid' | 'geschiedenis'

export interface KnmQuestion {
  id: string
  category: Category
  question_nl: string
  options_nl: [string, string, string, string]
  correct_index: 0 | 1 | 2 | 3
  explanation_en: string
  references?: string[]
}

export interface KnmAttempt {
  ts: number
  score: number
  total: number
  passed: boolean
}

export interface KnmScoreResult {
  score: number
  total: number
  passed: boolean
}

function safeWindow(): Window | null {
  return typeof window === 'undefined' ? null : window
}

export function getKnmQuestions(): KnmQuestion[] {
  return knmData.questions as KnmQuestion[]
}

export function getQuestionsByCategory(category: Category): KnmQuestion[] {
  return getKnmQuestions().filter((q) => q.category === category)
}

export function drawDrillSet(): KnmQuestion[] {
  const all = [...getKnmQuestions()]
  // Fisher-Yates shuffle, then take first DRILL_SIZE
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  return all.slice(0, DRILL_SIZE)
}

export function scoreAttempt(
  drill: KnmQuestion[],
  answers: Array<0 | 1 | 2 | 3>,
): KnmScoreResult {
  let score = 0
  drill.forEach((q, i) => {
    if (answers[i] === q.correct_index) score++
  })
  const total = drill.length
  const passed = score / total >= PASS_THRESHOLD
  return { score, total, passed }
}

export function saveAttempt(attempt: KnmAttempt): void {
  const w = safeWindow()
  if (!w) return
  const existing = getAttemptHistory()
  const next = [attempt, ...existing].slice(0, MAX_ATTEMPTS)
  w.localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(next))
}

export function getAttemptHistory(): KnmAttempt[] {
  const w = safeWindow()
  if (!w) return []
  const raw = w.localStorage.getItem(ATTEMPTS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as KnmAttempt[]
  } catch {
    return []
  }
}

function readLearnedSet(): Set<string> {
  const w = safeWindow()
  if (!w) return new Set()
  const raw = w.localStorage.getItem(LEARNED_KEY)
  if (!raw) return new Set()
  try {
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function writeLearnedSet(set: Set<string>): void {
  const w = safeWindow()
  if (!w) return
  w.localStorage.setItem(LEARNED_KEY, JSON.stringify([...set]))
}

export function markLearned(id: string): void {
  const set = readLearnedSet()
  set.add(id)
  writeLearnedSet(set)
}

export function isLearned(id: string): boolean {
  return readLearnedSet().has(id)
}

export function getLearnedCount(): number {
  return readLearnedSet().size
}
```

- [ ] **Step 4: Tests pass + tsc clean**

```bash
npx vitest run lib/dutch/knm.test.ts
npx tsc --noEmit
```

If a test fails because of randomness (very rare — astronomical odds), re-run; if it consistently fails, investigate.

- [ ] **Step 5: Commit**

```bash
git add lib/dutch/knm.ts lib/dutch/knm.test.ts
git commit -m "feat(dutch): KNM loader + drill draw + scoring + attempt history"
```

---

## Task 5: Add 3 Dutch Chaina moments

**File:** `components/design/moments.ts`

- [ ] **Step 1: Add LINES entries**

In the `LINES` object, append:

```ts
  knmAttemptComplete: [
    { main: 'goed bezig!',  caption: 'oefenen blijft loon',  speak: 'Goed bezig! Oefenen blijft loon.' },
    { main: 'niet slecht',  caption: 'volgende keer beter',  speak: 'Niet slecht. Volgende keer beter.' },
  ],
  knmPassed: [
    { main: 'Geslaagd! 🎉', caption: 'goed gedaan!',         speak: 'Geslaagd! Goed gedaan!' },
    { main: 'top!',          caption: 'examen-klaar',         speak: 'Top! Examen klaar.' },
  ],
  a2Milestone: [
    { main: 'A2 bereikt!',   caption: 'door naar B1, of examen?', speak: 'A2 bereikt! Door naar B1, of examen?' },
  ],
```

- [ ] **Step 2: Add MOMENTS entries**

In the `MOMENTS` object, append (near `welcomeBack` style):

```ts
  knmAttemptComplete: {
    label: 'KNM attempt complete (under pass threshold)',
    when: 'KNM drill finishes with score <80%',
    anchor: 'bottom-right',
    enter: 'peek-up-right', enterMs: 700, holdMs: 3400, exit: 'dismiss-down', exitMs: 600,
    mood: 'wave', moodAnim: 'wave-tilt 1.2s ease-in-out 2',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.knmAttemptComplete, sizePct: 0.34,
  },
  knmPassed: {
    label: 'KNM passed (>=80%)',
    when: 'KNM drill finishes with score >=80%',
    anchor: 'center',
    enter: 'bubble-pop', enterMs: 700, holdMs: 3400, exit: 'dismiss-down', exitMs: 600,
    mood: 'happy', moodAnim: 'happy-hop 0.6s ease-in-out 2',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.knmPassed, sizePct: 0.45,
  },
  a2Milestone: {
    label: 'A2 stage complete',
    when: 'A1 completion crosses 100% (Dutch home detection)',
    anchor: 'center',
    enter: 'bubble-pop', enterMs: 700, holdMs: 4200, exit: 'dismiss-down', exitMs: 600,
    mood: 'wave', moodAnim: 'wave-tilt 1.2s ease-in-out 2',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.a2Milestone, sizePct: 0.45,
  },
```

- [ ] **Step 3: Update the registry-completeness test**

There's a test in `__tests__/lib/moments-pick-line.test.ts` (or wherever the moments registry tests live) that enumerates all moment keys. After adding 3 new moments, that test will fail with an updated count. Add `'knmAttemptComplete', 'knmPassed', 'a2Milestone'` to the expected list. Run the test, see the failure message, copy the keys it expects you to add.

```bash
grep -rn 'knmAttemptComplete\|moments-pick-line\|moment.*registry\|MOMENTS\[' __tests__/ 2>/dev/null | head -10
npx vitest run -t "moments"
```

If the test asserts `Object.keys(MOMENTS).length === 16`, bump to 19. If it asserts a specific list of keys, add the 3 new ones.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
npx vitest run
```

- [ ] **Step 5: Commit**

```bash
git add components/design/moments.ts __tests__/
git commit -m "feat(chaina): add 3 Dutch moments (knmAttemptComplete, knmPassed, a2Milestone)"
```

---

## Task 6: Create `/dutch/knm/` module home page

**File:** `app/dutch/knm/page.tsx`

- [ ] **Step 1: Create directory**

```bash
mkdir -p app/dutch/knm/drill
```

- [ ] **Step 2: Write the page**

Create `/home/user/learn-hindi/app/dutch/knm/page.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Sticker,
  Tag,
  Cutting,
  COLORS,
  FONTS,
  BORDER,
  SHADOW,
} from '@/components/design'
import {
  getKnmQuestions,
  getQuestionsByCategory,
  getLearnedCount,
  isLearned,
  getAttemptHistory,
  type Category,
} from '@/lib/dutch/knm'
import { playSound } from '@/lib/sounds'

const CATEGORIES: Array<{ key: Category; en: string; nl: string; motif: string }> = [
  { key: 'politiek',     en: 'Politics',   nl: 'Politiek',     motif: '🏛️' },
  { key: 'werk',         en: 'Work',       nl: 'Werk',         motif: '💼' },
  { key: 'onderwijs',    en: 'Education',  nl: 'Onderwijs',    motif: '🎓' },
  { key: 'wonen',        en: 'Housing',    nl: 'Wonen',        motif: '🏠' },
  { key: 'gezondheid',   en: 'Healthcare', nl: 'Gezondheid',   motif: '🩺' },
  { key: 'geschiedenis', en: 'History',    nl: 'Geschiedenis', motif: '📜' },
]

export default function KnmModulePage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [learnedCount, setLearnedCount] = useState(0)
  const [attempts, setAttempts] = useState<ReturnType<typeof getAttemptHistory>>([])

  useEffect(() => {
    setLearnedCount(getLearnedCount())
    setAttempts(getAttemptHistory())
  }, [])

  const totalQuestions = getKnmQuestions().length

  const onStartDrill = () => {
    playSound('pop')
    router.push('/dutch/knm/drill')
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.lavender, padding: '24px 16px 120px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {/* Header */}
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
          <Tag>KNM</Tag>
          <h1 style={{
            fontFamily: FONTS.display, fontSize: 28, fontWeight: 800, color: COLORS.ink,
            margin: '6px 0 4px',
          }}>
            Knowledge of Dutch Society
          </h1>
          <p style={{
            fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, opacity: 0.7, margin: 0,
          }}>
            <em>Kennis van de Nederlandse Maatschappij</em> · {learnedCount} / {totalQuestions} learned
          </p>
        </div>

        {/* Drill CTA */}
        <Sticker color={COLORS.orange} radius={22} padding={16} onClick={onStartDrill} style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Cutting size={56} mood="happy" />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 18, color: '#fff' }}>
                Start drill (30 questions)
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 13, color: '#fff', opacity: 0.9, marginTop: 2 }}>
                Pass at 80% (24 / 30) — mirrors the real exam
              </div>
            </div>
          </div>
        </Sticker>

        {/* Categories */}
        <div style={{
          fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink,
          textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
        }}>
          Study by category
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 26 }}>
          {CATEGORIES.map((cat) => {
            const qs = getQuestionsByCategory(cat.key)
            const learnedInCat = qs.filter((q) => isLearned(q.id)).length
            return (
              <Sticker
                key={cat.key}
                color={COLORS.butter}
                radius={18}
                padding={14}
                onClick={() => { playSound('pop'); setActiveCategory(cat.key) }}
              >
                <div style={{ fontSize: 28, marginBottom: 4 }}>{cat.motif}</div>
                <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 16, color: COLORS.ink }}>
                  {cat.en}
                </div>
                <div style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.ink, opacity: 0.6, fontStyle: 'italic' }}>
                  {cat.nl}
                </div>
                <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.ink, marginTop: 6 }}>
                  {learnedInCat} / {qs.length} learned
                </div>
              </Sticker>
            )
          })}
        </div>

        {/* Active category cards */}
        {activeCategory && (
          <div style={{ marginBottom: 22 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
            }}>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink }}>
                {CATEGORIES.find(c => c.key === activeCategory)?.en} questions
              </div>
              <button
                onClick={() => setActiveCategory(null)}
                style={{
                  background: 'transparent', border: 'none', fontFamily: FONTS.body,
                  fontSize: 12, fontWeight: 700, color: COLORS.ink, cursor: 'pointer',
                }}
              >
                Close ✕
              </button>
            </div>
            <StudyCardList category={activeCategory} onLearnedChange={() => setLearnedCount(getLearnedCount())} />
          </div>
        )}

        {/* Attempt history */}
        {attempts.length > 0 && (
          <details style={{ marginTop: 10 }}>
            <summary style={{
              fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink, cursor: 'pointer',
            }}>
              Past attempts ({attempts.length})
            </summary>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {attempts.slice(0, 10).map((a, i) => (
                <Sticker key={i} color="#fff" radius={12} padding={10}>
                  <div style={{
                    fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, display: 'flex',
                    justifyContent: 'space-between',
                  }}>
                    <span>{new Date(a.ts).toLocaleDateString()}</span>
                    <span style={{ fontWeight: 700, color: a.passed ? '#1f8a3a' : '#b94a4a' }}>
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

function StudyCardList({
  category,
  onLearnedChange,
}: {
  category: Category
  onLearnedChange: () => void
}) {
  const [items, setItems] = useState(() => getQuestionsByCategory(category))
  useEffect(() => { setItems(getQuestionsByCategory(category)) }, [category])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((q) => (
        <StudyCard key={q.id} q={q} onToggle={onLearnedChange} />
      ))}
    </div>
  )
}

function StudyCard({
  q,
  onToggle,
}: {
  q: ReturnType<typeof getKnmQuestions>[number]
  onToggle: () => void
}) {
  const [learned, setLearnedLocal] = useState(false)
  useEffect(() => { setLearnedLocal(isLearned(q.id)) }, [q.id])

  const toggle = async () => {
    const { markLearned } = await import('@/lib/dutch/knm')
    markLearned(q.id)
    setLearnedLocal(true)
    onToggle()
  }

  return (
    <Sticker color="#fff" radius={14} padding={12}>
      <div style={{ fontFamily: FONTS.body, fontWeight: 700, color: COLORS.ink, fontSize: 14, marginBottom: 8 }}>
        {q.question_nl}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
        {q.options_nl.map((opt, i) => (
          <div
            key={i}
            style={{
              fontFamily: FONTS.body, fontSize: 13,
              padding: '4px 8px', borderRadius: 6,
              background: i === q.correct_index ? COLORS.mint : 'transparent',
              color: COLORS.ink,
              fontWeight: i === q.correct_index ? 700 : 400,
            }}
          >
            {String.fromCharCode(65 + i)}. {opt} {i === q.correct_index && '✓'}
          </div>
        ))}
      </div>
      <div style={{
        fontFamily: FONTS.body, fontSize: 12, color: COLORS.ink, opacity: 0.75,
        fontStyle: 'italic', marginBottom: 8,
      }}>
        {q.explanation_en}
      </div>
      <button
        onClick={toggle}
        disabled={learned}
        style={{
          fontFamily: FONTS.body, fontWeight: 700, fontSize: 12, cursor: learned ? 'default' : 'pointer',
          padding: '6px 12px', borderRadius: 999,
          background: learned ? COLORS.mint : COLORS.butter,
          color: COLORS.ink, border: BORDER.sticker,
        }}
      >
        {learned ? '✓ Learned' : 'Mark as learned'}
      </button>
    </Sticker>
  )
}
```

If `COLORS.orange` / `COLORS.mint` / `COLORS.lavender` / `COLORS.butter` don't exist exactly with those names, check `components/design/tokens.ts` and use the actual token names. If `BORDER.sticker` doesn't exist, use `BORDER.thick` or similar.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
npx vitest run
node scripts/lint-design.mjs
```

If `lint-design.mjs` flags raw hex literals, replace with tokens; if it flags soft shadows, audit and use only the hard-shadow pattern from existing primitives.

- [ ] **Step 4: Commit**

```bash
git add app/dutch/knm/page.tsx
git commit -m "feat(dutch): KNM module home — study by category + drill CTA + attempt history"
```

---

## Task 7: Create `/dutch/knm/drill/` page

**File:** `app/dutch/knm/drill/page.tsx`

- [ ] **Step 1: Write the page**

Create `/home/user/learn-hindi/app/dutch/knm/drill/page.tsx`:

```tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Sticker, Tag, Cutting, Confetti,
  COLORS, FONTS, BORDER, SHADOW,
  useChaina, canFire, markFired,
} from '@/components/design'
import {
  drawDrillSet,
  scoreAttempt,
  saveAttempt,
  DRILL_SIZE,
  PASS_THRESHOLD,
  type KnmQuestion,
} from '@/lib/dutch/knm'
import { playSound } from '@/lib/sounds'

export default function KnmDrillPage() {
  const router = useRouter()
  const drill = useMemo<KnmQuestion[]>(() => drawDrillSet(), [])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Array<0 | 1 | 2 | 3 | null>>(
    () => Array(DRILL_SIZE).fill(null) as Array<0 | 1 | 2 | 3 | null>,
  )
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(false)
  const { play } = useChaina()

  const current = drill[currentIdx]
  const result = useMemo(() => done
    ? scoreAttempt(drill, answers.map((a) => a ?? 0 as 0|1|2|3))
    : null, [done, drill, answers])

  useEffect(() => {
    if (!done || !result) return
    const attempt = { ts: Date.now(), score: result.score, total: result.total, passed: result.passed }
    saveAttempt(attempt)
    if (result.passed) {
      playSound('levelup')
      if (canFire('knmPassed', 'debounce-800ms')) { play('knmPassed'); markFired('knmPassed', 'debounce-800ms') }
    } else {
      playSound('complete')
      if (canFire('knmAttemptComplete', 'debounce-800ms')) { play('knmAttemptComplete'); markFired('knmAttemptComplete', 'debounce-800ms') }
    }
  }, [done, result, play])

  const onSelect = (idx: 0 | 1 | 2 | 3) => {
    if (revealed) return
    const next = [...answers]
    next[currentIdx] = idx
    setAnswers(next)
    setRevealed(true)
    playSound(idx === current.correct_index ? 'correct' : 'wrong')
    setTimeout(() => {
      if (currentIdx === DRILL_SIZE - 1) {
        setDone(true)
      } else {
        setCurrentIdx(currentIdx + 1)
        setRevealed(false)
      }
    }, 1500)
  }

  if (done && result) {
    return (
      <div style={{
        minHeight: '100vh', background: COLORS.lavender, padding: '24px 16px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {result.passed && <Confetti active />}
        <Cutting size={120} mood={result.passed ? 'happy' : 'idle'} />
        <h1 style={{
          fontFamily: FONTS.display, fontWeight: 800, fontSize: 32, color: COLORS.ink, margin: '16px 0 4px',
        }}>
          {result.passed ? 'Geslaagd! 🎉' : 'Bijna!'}
        </h1>
        <div style={{
          fontFamily: FONTS.display, fontSize: 56, fontWeight: 800,
          color: result.passed ? '#1f8a3a' : '#b94a4a',
        }}>
          {result.score} / {result.total}
        </div>
        <div style={{
          fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, opacity: 0.75, marginTop: 4,
        }}>
          {result.passed ? `Above the ${Math.round(PASS_THRESHOLD * 100)}% pass threshold` : `Need ${Math.ceil(DRILL_SIZE * PASS_THRESHOLD)} / ${DRILL_SIZE} to pass`}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <Sticker color={COLORS.orange} radius={16} padding={12} onClick={() => router.push('/dutch/knm')}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, color: '#fff', padding: '0 8px' }}>Back to KNM</div>
          </Sticker>
          <Sticker color={COLORS.butter} radius={16} padding={12} onClick={() => location.reload()}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, color: COLORS.ink, padding: '0 8px' }}>Try again</div>
          </Sticker>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.lavender, padding: '24px 16px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
        }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'transparent', border: 'none', color: COLORS.ink,
              fontSize: 14, fontFamily: FONTS.body, fontWeight: 700, cursor: 'pointer',
            }}
          >
            ← Exit
          </button>
          <Tag>{`Question ${currentIdx + 1} / ${DRILL_SIZE}`}</Tag>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 8, background: '#fff', borderRadius: 4, border: BORDER.sticker, marginBottom: 18,
          overflow: 'hidden',
        }}>
          <motion.div
            initial={false}
            animate={{ width: `${((currentIdx + (revealed ? 1 : 0)) / DRILL_SIZE) * 100}%` }}
            style={{ height: '100%', background: COLORS.orange }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          />
        </div>

        {/* Question sticker */}
        <Sticker color="#fff" radius={20} padding={18} style={{ marginBottom: 18 }}>
          <Tag bg={COLORS.butter}>{current.category}</Tag>
          <div style={{
            fontFamily: FONTS.display, fontWeight: 800, fontSize: 20, color: COLORS.ink,
            marginTop: 10, lineHeight: 1.4,
          }}>
            {current.question_nl}
          </div>
        </Sticker>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {current.options_nl.map((opt, i) => {
            const isSelected = answers[currentIdx] === i
            const isCorrect = i === current.correct_index
            const showCorrect = revealed && isCorrect
            const showWrong = revealed && isSelected && !isCorrect
            const bg = showCorrect ? COLORS.mint
                     : showWrong   ? '#f4c5c5'
                     : isSelected  ? COLORS.butter
                     : '#fff'
            return (
              <Sticker
                key={i}
                color={bg}
                radius={14}
                padding={14}
                onClick={() => onSelect(i as 0 | 1 | 2 | 3)}
              >
                <div style={{
                  fontFamily: FONTS.body, fontWeight: 700, fontSize: 15, color: COLORS.ink,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <span style={{
                    fontFamily: FONTS.display, fontWeight: 800, fontSize: 18,
                    width: 28, height: 28, borderRadius: '50%', background: COLORS.lavender,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span style={{ flex: 1 }}>{opt}</span>
                  {showCorrect && <span style={{ fontSize: 22 }}>✓</span>}
                  {showWrong && <span style={{ fontSize: 22 }}>✕</span>}
                </div>
              </Sticker>
            )
          })}
        </div>

        {/* Explanation appears after reveal */}
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 14 }}
          >
            <Sticker color={COLORS.butter} radius={12} padding={12}>
              <div style={{
                fontFamily: FONTS.body, fontSize: 13, fontStyle: 'italic',
                color: COLORS.ink, lineHeight: 1.5,
              }}>
                {current.explanation_en}
              </div>
            </Sticker>
          </motion.div>
        )}
      </div>
    </div>
  )
}
```

Same token-name caveat as Task 6 — if a token doesn't exist by that exact name, look it up in `components/design/tokens.ts`.

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npx vitest run
node scripts/lint-design.mjs
```

- [ ] **Step 3: Commit**

```bash
git add app/dutch/knm/drill/page.tsx
git commit -m "feat(dutch): KNM drill — 30-question runner with Chaina + Confetti on pass"
```

---

## Task 8: Update `components/dutch-welcome-modal.tsx`

**File:** `components/dutch-welcome-modal.tsx`

- [ ] **Step 1: Read current modal**

```bash
cat components/dutch-welcome-modal.tsx
```

Understand the current structure: it's a one-time modal triggered via localStorage; check the visible field/key it uses for "first time".

- [ ] **Step 2: Rewrite copy + add target toggle**

Replace the modal body content with the new exam-prep welcome. Keep the existing component shape (Sticker, dismiss button, "first-time-only" localStorage logic). The new body should render:

- Heading: `Hallo! Ready for your inburgeringsexamen?`
- Body paragraph: `This Dutch track is built to prep you for the **Inburgeringsexamen B1 + KNM** — the exam HSM holders take to naturalize and get a Dutch passport.`
- Skills list:
  - `KNM` — knowledge of Dutch society (live now)
  - `Reading` (*Lezen*), `Listening` (*Luisteren*), `Writing` (*Schrijven*), `Speaking` (*Spreken*) — coming soon
- Target-level toggle (2 radio-style Stickers side-by-side):
  - `A2` — basic, faster path
  - `B1` — full coverage, future-proof (selected by default)
  - On change: call `setExamTarget('a2'|'b1')` from `lib/dutch/exam-target`
- Footer tip: `Tip: book your exam date on inburgeren.nl before you start. A deadline focuses the mind.`
- Two CTAs:
  - `[Start with KNM]` → `router.push('/dutch/knm')`
  - `[Browse all]` → dismiss modal

Add import:
```ts
import { getExamTarget, setExamTarget, type ExamTarget } from '@/lib/dutch/exam-target'
```

Add state hook in the component:
```ts
const [target, setTarget] = useState<ExamTarget>('b1')
useEffect(() => { setTarget(getExamTarget()) }, [])
const onChangeTarget = (t: ExamTarget) => { setExamTarget(t); setTarget(t) }
```

Render the toggle as two Sticker buttons; the `selected` prop on Sticker (lifts it) indicates the active choice.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
npx vitest run
node scripts/lint-design.mjs
```

- [ ] **Step 4: Commit**

```bash
git add components/dutch-welcome-modal.tsx
git commit -m "feat(dutch): welcome modal exam-prep copy + B1/A2 target toggle"
```

---

## Task 9: Reorient Dutch branch in `app/page.tsx`

**File:** `app/page.tsx`

This is the most surgical task. Goal: when `language === 'dutch'`, insert a new section (Doel banner + 3-stage path + 5 skill cards) BEFORE the existing tab/lesson list. Hindi branch untouched.

- [ ] **Step 1: Add imports**

Near other lib imports:
```ts
import { getKnmQuestions, getLearnedCount } from '@/lib/dutch/knm'
import { getLevel, getItemsByLevel, ALL_LEVELS, type Level } from '@/lib/dutch/level-map'
```

- [ ] **Step 2: Compute Dutch-only state in the component body**

After existing `useEffect`s, add (gated to dutch-only):
```ts
const [dutchKnmLearned, setDutchKnmLearned] = useState(0)
useEffect(() => {
  if (language === 'dutch') setDutchKnmLearned(getLearnedCount())
}, [language])

const dutchStageProgress: Record<Level, { done: number; total: number }> = useMemo(() => {
  if (language !== 'dutch') return { A1: {done:0,total:0}, A2: {done:0,total:0}, B1: {done:0,total:0} }
  const result = { A1: {done:0,total:0}, A2: {done:0,total:0}, B1: {done:0,total:0} } as Record<Level, {done:number;total:number}>
  for (const lvl of ALL_LEVELS) {
    const ids = getItemsByLevel(lvl)
    result[lvl].total = ids.length
    result[lvl].done = ids.filter((id) => isLessonComplete(id, 'dutch')).length
  }
  return result
}, [language])
```

(`isLessonComplete` is already imported from `@/lib/progress`. `useMemo` from React — add to imports if not present.)

- [ ] **Step 3: Insert the Dutch exam-prep section**

Find the section right after the streak/header/daily-goal area but BEFORE the tab switcher (Situations/Foundations) and lesson list. The natural insertion point is just before the existing tab pill renders.

Add (inside the JSX, gated on `language === 'dutch'`):

```tsx
{language === 'dutch' && (
  <>
    {/* Goal banner */}
    <div style={{ padding: '8px 20px 0', maxWidth: 480, margin: '0 auto' }}>
      <Sticker color={COLORS.peach} radius={18} padding={14}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>🇳🇱</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Goal
            </div>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 18, color: COLORS.ink, marginTop: 2 }}>
              Inburgeringsexamen B1 + KNM
            </div>
          </div>
        </div>
      </Sticker>
    </div>

    {/* Your path: 3 stages */}
    <div style={{ padding: '14px 20px 0', maxWidth: 480, margin: '0 auto' }}>
      <Sticker color="#fff" radius={18} padding={16}>
        <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          Your path
        </div>
        {ALL_LEVELS.map((lvl, i) => {
          const p = dutchStageProgress[lvl]
          const pct = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0
          return (
            <div key={lvl} style={{ marginBottom: i < 2 ? 12 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.body, fontWeight: 700, fontSize: 13, color: COLORS.ink, marginBottom: 4 }}>
                <span>{i + 1}. {lvl}</span>
                <span>{p.done} / {p.total}</span>
              </div>
              <div style={{ height: 8, background: COLORS.lavender, borderRadius: 4, overflow: 'hidden', border: BORDER.sticker }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  style={{ height: '100%', background: COLORS.orange }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 + i * 0.1 }}
                />
              </div>
            </div>
          )
        })}
      </Sticker>
    </div>

    {/* 5 skill cards */}
    <div style={{ padding: '14px 20px 0', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, padding: '0 4px' }}>
        Exam skills
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <SkillCard label="KNM" subtitle="Knowledge" subDutch="van NL" status={`${dutchKnmLearned}/100`} live onClick={() => router.push('/dutch/knm')} />
        <SkillCard label="Reading"   subtitle="Lezen"     subDutch=""  status="soon" />
        <SkillCard label="Listening" subtitle="Luisteren" subDutch=""  status="soon" />
        <SkillCard label="Writing"   subtitle="Schrijven" subDutch=""  status="soon" />
        <SkillCard label="Speaking"  subtitle="Spreken"   subDutch=""  status="soon" />
      </div>
    </div>

    {/* Section separator label for the existing lessons list */}
    <div style={{ padding: '20px 20px 8px', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink, textTransform: 'uppercase', letterSpacing: 1 }}>
        Lessons & Grammar <span style={{ opacity: 0.5, fontStyle: 'italic', fontSize: 11, marginLeft: 6 }}>Lessen & Grammatica</span>
      </div>
    </div>
  </>
)}
```

- [ ] **Step 4: Add SkillCard helper at the bottom of `app/page.tsx`**

Below the `export default function Home(...)` body, add:

```tsx
function SkillCard({
  label, subtitle, subDutch, status, live = false, onClick,
}: {
  label: string
  subtitle: string
  subDutch: string
  status: string
  live?: boolean
  onClick?: () => void
}) {
  return (
    <Sticker
      color={live ? COLORS.butter : '#fff'}
      radius={14}
      padding={10}
      onClick={onClick}
      style={{ opacity: live ? 1 : 0.55, cursor: live ? 'pointer' : 'default' }}
    >
      <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 13, color: COLORS.ink }}>
        {label}
      </div>
      <div style={{ fontFamily: FONTS.body, fontSize: 9, color: COLORS.ink, opacity: 0.6, fontStyle: 'italic' }}>
        {subtitle}{subDutch && ` ${subDutch}`}
      </div>
      <div style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.ink, fontWeight: 700, marginTop: 4 }}>
        {status}
      </div>
    </Sticker>
  )
}
```

- [ ] **Step 5: Update the dutch-only "Start with lesson 1" helper text**

The current text at line ~611 reads `'Start with lesson 1 — or jump to Foundations to learn the grammar core first!'`. With the new exam-prep frame on top, this is now redundant — change to:
```ts
language === 'dutch'
  ? 'Lessons + grammar below build your A1-B1 foundation alongside the exam skills above.'
  : 'Start with lesson 1 — everything builds from here'
```

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit
npx vitest run
node scripts/lint-design.mjs
```

Tsc may complain about missing token names; check `components/design/tokens.ts` and substitute. Likely actual names: `COLORS.peach`, `COLORS.butter`, `COLORS.lavender`, `COLORS.orange`, `COLORS.mint` should all exist (used widely elsewhere in the file).

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx
git commit -m "feat(dutch): home page exam-prep reorientation (goal banner + 3-stage path + 5 skill cards)"
```

---

## Task 10: Update CONTENT.md with Dutch exam-prep section

**File:** `CONTENT.md`

- [ ] **Step 1: Append a new section**

After the existing Hindi inventory section, append:

```markdown
## Dutch — Exam-Prep Track (Inburgeringsexamen B1 + KNM)

### Target exam
Inburgeringsexamen B1 + KNM. HSM holders need this (or equivalent) to naturalize for the Dutch passport.

### Strategic framework
A1 (months 1-2) → A2 (months 3-5) → B1 (months 6-9). A2 = optional stop-out (settings toggle).

### UI language
All UI/labels in English. Dutch only for: KNM question text, Chaina voice lines, italic Dutch-skill-name subtitles (Lezen / Luisteren / Schrijven / Spreken) for exposure-learning.

### Content inventory
| Track | Status | Notes |
|---|---|---|
| Lessons (A1-A2) | 5 existing | supermarket, introductions, cafe, doctor, transport |
| Foundations (A1-A2) | 7 existing | numbers, pronunciation, present, de/het, word-order, past, modals |
| KNM | 100 questions, 6 categories | Phase 1 (shipped 2026-05-26) |
| Lezen (Reading) | not yet | Phase 2 |
| Luisteren (Listening) | not yet | Phase 3 |
| Schrijven (Writing) | not yet | Phase 4 |
| Spreken (Speaking) | not yet | Phase 5 |
| Mock exam | not yet | Phase 6 |

### Canonical sources
- **DUO oefenen.nl** — official practice + answer keys. Primary KNM reference.
- **inburgeren.nl** — official 38-video KNM series ("Naar Nederland").
- **Naar Nederland handbook** (free PDF) — the inburgering spine.
- **"Nederland en je rechten"** — KNM reference book.
- **TaalCompleet** textbook series — A1 → B1.
- **Bart de Pau "Learn Dutch"** YouTube — 1000-words course.
- **Marlou Lemmens "Learn Dutch with Marlou"** — A1 → B1 videos.
- **NedLes** YouTube — KNM-focused.

### Authoring approach for KNM
Questions written from scratch using knowledge of the Naar Nederland material — NOT copied from copyrighted DUO sources. User should spot-check against current DUO practice tests before relying on pass-logic.

### Storage keys (Dutch additions)
- `dutch-exam-target` — `'a2' | 'b1'`, default `'b1'`
- `dutch-knm-learned` — `Set<string>` of question IDs
- `dutch-knm-attempts` — `Array<{ts, score, total, passed}>` capped at 50
```

- [ ] **Step 2: Commit**

```bash
git add CONTENT.md
git commit -m "docs(dutch): add exam-prep track section to CONTENT.md inventory"
```

---

## Task 11: Final QA + push

- [ ] **Step 1: Full local verification**

```bash
npx vitest run
npx tsc --noEmit
node scripts/lint-design.mjs
```

Expected: all tests pass (existing 223 + new from tasks 1, 2, 4 ≈ 245+), tsc clean, lint clean.

- [ ] **Step 2: Manual smoke (if dev boots quickly)**

```bash
npm run dev &
sleep 8
# Browser visits:
# 1. Switch language to Dutch.
# 2. Welcome modal should show new copy + A2/B1 toggle.
# 3. Close modal. Home shows: Goal banner / Your path (3 stages with progress) / Exam skills (KNM live, 4 dimmed) / Lessons & Grammar list still below.
# 4. Tap KNM card → /dutch/knm/ renders.
# 5. Tap a category card → study cards expand inline.
# 6. Tap "Start drill" → 30-question runner.
# 7. Answer all questions; pass screen or near-miss screen renders accordingly.
# 8. Switch language to Hindi → home looks identical to before this work (no regression).
```

Kill dev server.

- [ ] **Step 3: Push**

```bash
git push origin main
```

- [ ] **Step 4: Verify CI green**

CI workflow runs tsc + vitest + lint. Wait for green.

---

## Self-review checklist (for the implementing engineer)

- [ ] `lib/dutch/exam-target.ts` + tests committed
- [ ] `lib/dutch/level-map.ts` + tests committed
- [ ] `content/dutch/knm.json` has exactly 100 questions, balanced 17/17/17/17/16/16 across the 6 categories
- [ ] `lib/dutch/knm.ts` + tests committed (loader, drill draw, scoring with 80% threshold, attempt history, learned tracking)
- [ ] `components/design/moments.ts` has 3 new Dutch moments; registry-completeness test updated
- [ ] `app/dutch/knm/page.tsx` renders 6 categories + drill CTA + attempt history fold
- [ ] `app/dutch/knm/drill/page.tsx` renders 30-Q runner with Chaina + Confetti on pass
- [ ] `components/dutch-welcome-modal.tsx` has new exam-prep copy + A2/B1 toggle
- [ ] `app/page.tsx` Dutch branch renders Goal banner + 3-stage path + 5 skill cards above the existing lessons list. Hindi branch unchanged.
- [ ] `CONTENT.md` has the new Dutch exam-prep section
- [ ] All tests green; tsc clean; design-lint clean
- [ ] All 11 commits pushed to main
