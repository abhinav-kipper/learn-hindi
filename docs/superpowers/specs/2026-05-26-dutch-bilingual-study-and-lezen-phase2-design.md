# Dutch Bilingual Study + Lezen Phase 2 (Re-tiered A1/A2/B1) — Spec

**Status:** approved 2026-05-26
**Repo:** `abhinav-kipper/learn-hindi`

## 1. Scope

Two thematically-linked Dutch UX improvements shipped together:

**Patch A — Bilingual study mode for KNM (and forward to all future modules).** Study mode currently shows Dutch-only questions + options, which is opaque at A0-A1 level. Add English translations beside each Dutch question and option in study mode. **Drill/mock mode stays Dutch-only** to mirror real exam conditions.

**Phase 2 — Lezen module re-tiered for A0-A1 learners.** The original Lezen plan went straight to B1, which is unrealistic for a learner at A0-A1. Re-tier the 10-text shipment as 5 A1 texts + 4 A2 texts + 1 B1 preview. Each text includes a Dutch body, English translation (study mode), and 4 MCQs. Mock drill draws 5 random texts.

After this ships, the user can: (a) finally read what each KNM question is asking, (b) start Lezen at a level they can actually handle, (c) progress through A1→A2→B1 reading instead of bouncing off B1 immediately.

## 2. Decisions (settled in brainstorming)

| Decision | Choice |
|---|---|
| KNM study mode | Show English question + English options alongside Dutch |
| KNM drill mode | Dutch-only (exam-realistic) |
| Lezen tiering | 5 A1 + 4 A2 + 1 B1 preview = 10 texts total |
| Lezen study mode | Dutch text + English translation visible (study mode); 4 MCQs with Dutch + English crutches |
| Lezen drill (timed mock) | 5 random texts × 4 MCQs = 20 questions, 25-min timer, ≥80% pass. Dutch-only. |
| Question types per text | A1: `detail` + `hoofdgedachte` weighted. A2: + `woordbetekenis`. B1: all 4 types including `gevolg` (inference) |
| Translation scope | All 100 KNM questions get `question_en` + `options_en`. Drafted by implementing agent. |
| Backwards-compat | Missing English fields → fall back to Dutch-only render (graceful, no crash) |

## 3. Architecture overview

```
content/dutch/
  ├── knm.json              ← MODIFY: add question_en + options_en to all 100 entries
  └── lezen.json            ← NEW: 10 texts (5 A1 + 4 A2 + 1 B1), each with translation + 4 MCQs

lib/dutch/
  ├── knm.ts                ← MODIFY: update KnmQuestion type to include optional question_en + options_en
  └── lezen.ts              ← NEW: loader + drawMockSet + scoring + study tracking (mirrors knm.ts)

app/dutch/
  ├── knm/page.tsx          ← MODIFY: render English alongside Dutch in study cards (drill stays Dutch-only)
  └── lezen/
      ├── page.tsx          ← NEW: module home (3 tier sections, mock CTA, history)
      ├── [textId]/page.tsx ← NEW: study mode (bilingual text + 4 Qs)
      └── mock/page.tsx     ← NEW: 5-text timed drill (Dutch-only, 25-min timer)

app/page.tsx                ← MODIFY: Reading skill card flips from "soon" to live ({studiedCount}/10)
components/design/moments.ts ← MODIFY: add 2 Dutch moments (lezenStudyDone, lezenMockPassed)
CONTENT.md                  ← MODIFY: Lezen row from "not yet" to "shipped"
```

## 4. Patch A — Bilingual KNM study mode

### 4.1 Data schema change

Extend `KnmQuestion` in `lib/dutch/knm.ts`:

```ts
export interface KnmQuestion {
  id: string
  category: Category
  question_nl: string
  question_en?: string                                          // NEW (optional for backwards-compat)
  options_nl: [string, string, string, string]
  options_en?: [string, string, string, string]                 // NEW (optional)
  correct_index: 0 | 1 | 2 | 3
  explanation_en: string
  references?: string[]
}
```

### 4.2 Content update

Re-author `content/dutch/knm.json` to include `question_en` + `options_en` on all 100 questions. Translations are short (5-10 words each). Implementer drafts them; English options should preserve the meaning + form of the Dutch options (so wrong distractors stay plausibly wrong in English).

Example diff for one question:

```diff
 {
   "id": "knm-001",
   "category": "politiek",
   "question_nl": "Wie is het staatshoofd van Nederland?",
+  "question_en": "Who is the head of state of the Netherlands?",
   "options_nl": [
     "De minister-president",
     "De koning",
     "De voorzitter van de Tweede Kamer",
     "De burgemeester van Amsterdam"
   ],
+  "options_en": [
+    "The prime minister",
+    "The king",
+    "The chair of the Tweede Kamer",
+    "The mayor of Amsterdam"
+  ],
   "correct_index": 1,
   "explanation_en": "..."
 }
```

### 4.3 KNM study-card UI change

In `app/dutch/knm/page.tsx`, the `StudyCard` component renders:

```tsx
// CURRENT
<div>{q.question_nl}</div>
<div>{q.options_nl.map(...)}</div>

// NEW
<div style={{ /* Dutch headline */ }}>{q.question_nl}</div>
{q.question_en && (
  <div style={{ /* English subtle subtitle */ fontStyle: 'italic', opacity: 0.7 }}>
    {q.question_en}
  </div>
)}
{q.options_nl.map((opt, i) => (
  <div key={i}>
    <div>{String.fromCharCode(65 + i)}. {opt} {i === q.correct_index && '✓'}</div>
    {q.options_en?.[i] && (
      <div style={{ fontStyle: 'italic', opacity: 0.65, fontSize: 11, marginLeft: 18 }}>
        {q.options_en[i]}
      </div>
    )}
  </div>
))}
```

Drill mode (`app/dutch/knm/drill/page.tsx`) renders **only** `question_nl` + `options_nl` — no change. The drill stays exam-realistic.

### 4.4 Tests for Patch A

`lib/dutch/knm.test.ts` already covers KnmQuestion shape. Add:

```ts
it('every question has bilingual fields after Patch A', () => {
  for (const q of getKnmQuestions()) {
    expect(q.question_en).toBeDefined()
    expect(q.question_en!.length).toBeGreaterThan(0)
    expect(q.options_en).toBeDefined()
    expect(q.options_en!.length).toBe(4)
  }
})
```

If we want partial migration, leave the field optional in the type but assert presence in the test. (Decision: hard-require on all 100.)

## 5. Phase 2 — Lezen module

### 5.1 The 10 texts

| # | Tier | Topic | Title (EN) | Title (NL) | Word count target |
|---|---|---|---|---|---|
| 1 | A1 | Daily routine | My day | Mijn dag | 60-80 |
| 2 | A1 | Shopping | At the supermarket | In de supermarkt | 60-80 |
| 3 | A1 | Weather | The weather today | Het weer vandaag | 60-80 |
| 4 | A1 | Food/Drink | What I eat | Wat ik eet | 60-80 |
| 5 | A1 | Family | My family | Mijn familie | 60-80 |
| 6 | A2 | GP visit | Going to the doctor | Naar de huisarts | 120-180 |
| 7 | A2 | Public transport | Buying an OV-chipkaart | Een ov-chipkaart kopen | 120-180 |
| 8 | A2 | Making appointments | Making a doctor's appointment | Een afspraak maken | 120-180 |
| 9 | A2 | Library | At the library | In de bibliotheek | 120-180 |
| 10 | B1 | Government | Getting a BSN and DigiD | Een BSN en DigiD aanvragen | 250-350 |

The 9 A1/A2 topics are everyday-life scenarios with simple grammar. The B1 text is a single "preview" — formal government info — so the user sees what they're working toward without being overwhelmed.

### 5.2 Schema (`content/dutch/lezen.json`)

```ts
{
  texts: Array<{
    id: string,                  // 'lezen-001'..'lezen-010'
    tier: 'A1' | 'A2' | 'B1',
    topic: string,               // 'daily-routine', 'supermarket', etc.
    title_nl: string,
    title_en: string,
    body_nl: string,             // text body in Dutch
    body_en: string,             // full English translation (study mode only)
    word_count: number,
    questions: Array<{
      type: 'hoofdgedachte' | 'detail' | 'woordbetekenis' | 'gevolg',
      question_nl: string,
      question_en: string,                          // bilingual from the start (no optional)
      options_nl: [string, string, string, string],
      options_en: [string, string, string, string],
      correct_index: 0 | 1 | 2 | 3,
      explanation_en: string,
    }>,
    references?: string[]
  }>
}
```

### 5.3 Question-type distribution by tier

4 questions per text. Distribution scales with tier complexity:

- **A1 texts (5)**: 2 × `detail` + 2 × `hoofdgedachte` — simple fact-finding + main-idea only.
- **A2 texts (4)**: 1 × `detail` + 1 × `hoofdgedachte` + 2 × `woordbetekenis` — adds vocab-in-context.
- **B1 text (1)**: 1 of each type — including `gevolg` (inference).

Total: (5×4) + (4×4) + (1×4) = 40 MCQs.

### 5.4 Library `lib/dutch/lezen.ts` (mirrors `knm.ts`)

```ts
import lezenData from '@/content/dutch/lezen.json'

export const MOCK_SIZE = 5
export const QUESTIONS_PER_TEXT = 4
export const PASS_THRESHOLD = 0.8
export const MOCK_TIMER_MS = 25 * 60 * 1000  // 25 minutes
export const STUDIED_KEY = 'dutch-lezen-studied'
export const MOCK_ATTEMPTS_KEY = 'dutch-lezen-mock-attempts'
const MAX_ATTEMPTS = 50

export type Tier = 'A1' | 'A2' | 'B1'
export type QuestionType = 'hoofdgedachte' | 'detail' | 'woordbetekenis' | 'gevolg'

export interface LezenQuestion {
  type: QuestionType
  question_nl: string
  question_en: string
  options_nl: [string, string, string, string]
  options_en: [string, string, string, string]
  correct_index: 0 | 1 | 2 | 3
  explanation_en: string
}

export interface LezenText {
  id: string
  tier: Tier
  topic: string
  title_nl: string
  title_en: string
  body_nl: string
  body_en: string
  word_count: number
  questions: LezenQuestion[]
  references?: string[]
}

export interface LezenMockAttempt {
  ts: number
  score: number
  total: number
  passed: boolean
  text_ids: string[]
}

export function getLezenTexts(): LezenText[]
export function getTextById(id: string): LezenText | undefined
export function getTextsByTier(tier: Tier): LezenText[]
export function drawMockSet(): LezenText[]   // 5 random; balanced where possible
export function scoreMockAttempt(texts: LezenText[], answers: Array<0|1|2|3>): {
  score: number, total: number, passed: boolean
}
export function saveMockAttempt(a: LezenMockAttempt): void
export function getMockHistory(): LezenMockAttempt[]
export function markTextStudied(id: string): void
export function isStudied(id: string): boolean
export function getStudiedCount(): number
```

TDD'd same as KNM — at minimum 10 tests covering loader, tier filtering, mock draw uniqueness, scoring at 80%, attempt history cap, studied tracking.

### 5.5 Pages

**`/dutch/lezen` — module home:**
- Header: "Reading practice / Lezen oefenen"
- 3 collapsed tier sections (A1 / A2 / B1). A1 expanded by default. Each section header shows `X/N studied`.
- Inside each section: text cards (English title big, Dutch title italic subtitle, "X/4 answered" or "✓ studied" badge).
- "Start timed mock (5 texts, 25 min)" orange CTA.
- Past attempts fold (last 10).

**`/dutch/lezen/[textId]` — study mode:**
- Back button + tier tag + title (EN + NL subtitle).
- Sticker with the Dutch body. Below it: a "Show English translation" toggle button. Tapping reveals `body_en` in italic below the Dutch body.
- 4 question cards. Each shows Dutch question + English subtitle, 4 options (Dutch + English subtitle each). Reveal correct answer + explanation on tap.
- After all 4 answered: "✓ Mark as studied" button → marks + returns to module home.

**`/dutch/lezen/mock` — timed drill (Dutch-only):**
- Top bar: timer countdown (`25:00` → `00:00`), `Question X / 20`.
- `drawMockSet()` on mount = 5 texts × 4 Qs = 20 questions.
- Text body rendered Dutch-only (no English crutches in mock).
- 4 options Dutch-only.
- Auto-advance after answer reveal (1.5s).
- Timer hits 0 OR all 20 done → score screen: `X / 20`. Pass ≥16/20 (80%).
- Pass → Chaina `lezenMockPassed` + Confetti + `playSound('levelup')`.
- Fail → Chaina `knmAttemptComplete` (re-uses encouraging line) + `playSound('complete')`.
- Save attempt to `dutch-lezen-mock-attempts`.

### 5.6 2 new Chaina moments

**`lezenStudyDone`** (when user marks a text as studied):
```ts
{
  main: 'tekst gelezen!',
  caption: 'doorgaan',
  speak: 'Tekst gelezen! Doorgaan.'
}
```
Frequency: `debounce-800ms` (fires per text, not per drill).

**`lezenMockPassed`** (≥80% on timed mock):
```ts
[
  { main: 'lezen geslaagd!', caption: 'lekker bezig',     speak: 'Lezen geslaagd! Lekker bezig.' },
  { main: 'top, Lezen pass!', caption: 'B1 dichterbij',    speak: 'Top, Lezen pass. B1 dichterbij.' },
]
```
Frequency: `debounce-800ms`. Same MOMENTS shape as `knmPassed` (anchor: center, mood: happy, voice: true).

### 5.7 Home page integration

In `app/page.tsx` Dutch branch, the "Reading" skill card moves from "soon" → live:

```tsx
<SkillCard
  label="Reading"
  subtitle="Lezen"
  subDutch=""
  status={`${dutchLezenStudied}/10 studied`}
  live
  onClick={() => router.push('/dutch/lezen')}
/>
```

Add state:
```ts
const [dutchLezenStudied, setDutchLezenStudied] = useState(0)
useEffect(() => {
  if (language === 'dutch') setDutchLezenStudied(getStudiedCount())
}, [language])
```

Other 3 cards (Listening / Writing / Speaking) stay "soon".

### 5.8 CONTENT.md update

Bump the Lezen row:
```diff
- | Lezen (Reading) | not yet | Phase 2 |
+ | Lezen (Reading) | 10 texts (5 A1 + 4 A2 + 1 B1), 40 MCQs | Phase 2 (shipped 2026-05-26) |
```

Add storage keys:
- `dutch-lezen-studied` — Set of text IDs
- `dutch-lezen-mock-attempts` — capped at 50

Add note: KNM now has bilingual fields (`question_en`, `options_en`); shown in study mode, hidden in drill.

## 6. Out of scope (later phases)

- Adding MORE Lezen texts beyond 10 (later content cycle).
- Re-translating KNM explanation_en (already exists; leave as-is).
- A real-audio TTS layer on the Lezen texts (would pair with Phase 3 Luisteren).
- Per-question time tracking inside the timed mock (only overall countdown).
- Spaced repetition for missed Lezen MCQs.
- Customizable mock size or timer length.
- Auto-tier-promotion (e.g. unlock A2 only when A1 ≥80% studied) — all tiers visible from start.

## 7. Validation

After this ships:
- All existing tests pass.
- `lib/dutch/lezen.test.ts` ≥10 new tests, all pass.
- `lib/dutch/knm.test.ts` bilingual-field test passes (all 100 questions have `question_en` + `options_en`).
- `npx tsc --noEmit` clean.
- `node scripts/lint-design.mjs` clean.
- Open `/dutch/knm/` → tap any category → study cards show Dutch + English. Open `/dutch/knm/drill/` → cards Dutch-only.
- Open `/dutch/lezen/` → 3 tiers visible, A1 cards expanded. Tap an A1 text → study mode, body shows Dutch + toggle to reveal English, 4 questions bilingual.
- Start timed mock → 20 questions, timer counts down, Dutch-only.
- Pass ≥16/20 → Chaina + Confetti. Fail → Chaina encouragement.
- Home skill card shows `X/10 studied` and is tappable.

## 8. Risks / open considerations

- **Translation quality on KNM bilinguality** — all 500 strings (100 questions × 1 question + 4 options) need accurate English. Implementing agent has to translate them mid-task; review for accuracy on first few before assuming all 500 are good.
- **B1 preview text difficulty** — single B1 text in an A1/A2 module may demoralise if user tries it too early. Counter: mark it with a clear "B1 preview" tier badge so user knows it's stretch material.
- **Mock-mode no-English realism** — at A0-A1 level, the user might not be able to do the mock at all. That's expected — the mock is for later, when they've moved through study mode. The module home should make this clear via a "Study first, then try the mock" line on the CTA card.

## 9. Open questions

None — all settled in brainstorming.
