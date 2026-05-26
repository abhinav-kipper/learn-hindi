# Dutch Bilingual Study + Lezen Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** (Patch A) Add English translations alongside Dutch in KNM study mode while keeping drill mode Dutch-only. (Phase 2) Ship a re-tiered `/dutch/lezen` module with 5 A1 + 4 A2 + 1 B1 texts, bilingual study mode, Dutch-only timed mock.

**Architecture:** Extend `KnmQuestion` with optional `question_en` + `options_en`; re-author `content/dutch/knm.json` to populate them on all 100. Add `content/dutch/lezen.json` (10 texts, each bilingual body + 4 bilingual MCQs). Add `lib/dutch/lezen.ts` (mirrors `lib/dutch/knm.ts` patterns — loader, drawMockSet, scoring, study tracking, TDD'd). Add `/dutch/lezen/`, `/dutch/lezen/[textId]/`, `/dutch/lezen/mock/` pages. Modify KNM study card to render English alongside Dutch. Flip the Reading skill card on Dutch home from "soon" → live. Add 2 new Chaina moments.

**Tech Stack:** Next.js 16 App Router, TypeScript, Vitest, Framer Motion, localStorage, design tokens via `@/components/design`. Existing Chaina moments + frequency-cap system. Existing `useLanguage()` for branching.

**Spec:** `docs/superpowers/specs/2026-05-26-dutch-bilingual-study-and-lezen-phase2-design.md`
**Repo:** `abhinav-kipper/learn-hindi`, branch: `main` (user has authorized working on main).

---

## Reference paths

- `lib/dutch/knm.ts` — current KNM loader. Mirror its pattern for `lezen.ts`.
- `lib/dutch/knm.test.ts` — 11 tests; pattern to mirror for `lezen.test.ts`.
- `content/dutch/knm.json` — 100 questions with `question_nl`, `options_nl`, `correct_index`, `explanation_en`. Add bilingual fields.
- `app/dutch/knm/page.tsx` — study mode UI to extend with bilingual rendering. **Drill page at `app/dutch/knm/drill/page.tsx` must NOT be modified — exam-realistic Dutch-only stays.**
- `components/design/moments.ts` — add 2 new Chaina moments.
- `app/page.tsx` — Dutch branch already has 5 skill cards (KNM live, 4 "soon"). Flip the Reading card to live.
- `CONTENT.md` — Dutch exam-prep section to update.

**Token names confirmed in prior implementation:** `COLORS.lav` (not lavender), `COLORS.peach`, `COLORS.butter`, `COLORS.orange`, `COLORS.mint`, `COLORS.ink`. `BORDER.sticker`. White literal uses `const W = '#fff' // @design-allow: white literal` pattern. Semantic green/red in score screens uses the same `@design-allow:` escape.

---

## Task 1: Extend KnmQuestion type with bilingual fields (TDD)

**Files:**
- Modify: `lib/dutch/knm.ts`
- Modify: `lib/dutch/knm.test.ts`

- [ ] **Step 1: Add the failing test**

Open `/home/user/learn-hindi/lib/dutch/knm.test.ts`. Add this test at the end of the `describe('knm', ...)` block (before the closing `})`):

```ts
  it('every question has bilingual fields (question_en + options_en)', () => {
    for (const q of getKnmQuestions()) {
      expect(q.question_en).toBeDefined()
      expect(q.question_en!.length).toBeGreaterThan(0)
      expect(q.options_en).toBeDefined()
      expect(q.options_en!.length).toBe(4)
      q.options_en!.forEach((opt) => expect(opt.length).toBeGreaterThan(0))
    }
  })
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run lib/dutch/knm.test.ts -t "bilingual"
```

Expected: FAIL — `q.question_en` is undefined on the existing 100 questions.

- [ ] **Step 3: Update the type to declare the fields as optional**

In `lib/dutch/knm.ts`, find the `KnmQuestion` interface:

```ts
export interface KnmQuestion {
  id: string
  category: Category
  question_nl: string
  options_nl: [string, string, string, string]
  correct_index: 0 | 1 | 2 | 3
  explanation_en: string
  references?: string[]
}
```

Replace with:

```ts
export interface KnmQuestion {
  id: string
  category: Category
  question_nl: string
  question_en?: string
  options_nl: [string, string, string, string]
  options_en?: [string, string, string, string]
  correct_index: 0 | 1 | 2 | 3
  explanation_en: string
  references?: string[]
}
```

(Type change only — no runtime impact yet. The test still fails because the JSON content doesn't have the new fields.)

- [ ] **Step 4: Verify tsc clean**

```bash
npx tsc --noEmit
```

Clean. Test is still expected to fail until Task 2 populates the JSON.

- [ ] **Step 5: Commit**

```bash
git add lib/dutch/knm.ts lib/dutch/knm.test.ts
git commit -m "feat(dutch): add bilingual fields to KnmQuestion type (test pending content)"
```

---

## Task 2: Translate all 100 KNM questions

**Files:**
- Modify: `content/dutch/knm.json`

This is the biggest content task in the plan. You'll add `question_en` and `options_en` to all 100 entries.

- [ ] **Step 1: Add bilingual fields to all 100 questions**

For each of the 100 entries in `content/dutch/knm.json`, add:
- `question_en`: an accurate English translation of `question_nl` (5-15 words typically)
- `options_en`: a 4-element array, each element an accurate English translation of the corresponding `options_nl` entry

**Translation guidelines:**
- Preserve the form of the question (yes/no question stays yes/no in English; how-much-question stays how-much).
- Distractors should preserve their wrongness — if Dutch option "De minister-president" is a distractor (wrong answer for "head of state"), the English translation "The prime minister" should also be plausibly wrong in the same way.
- Keep Dutch proper nouns un-translated where appropriate: "Tweede Kamer" can stay as-is or be glossed as "Tweede Kamer (House of Representatives)" — pick consistent. **Rule: keep Dutch institutional names as-is** (Tweede Kamer, Eerste Kamer, DigiD, BSN, AOW, UWV, etc.) without parenthetical gloss. The learner is expected to learn these names.
- Numbers/dates/figures stay identical: "36-40 uur" → "36-40 hours".
- Idioms: translate the *meaning*, not word-for-word.

**Sample diff for `knm-001`:**

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
   "explanation_en": "...",
   "references": ["..."]
 }
```

Place `question_en` IMMEDIATELY after `question_nl`, and `options_en` IMMEDIATELY after `options_nl`. Field ordering matters for diff readability.

- [ ] **Step 2: Validate the JSON parses + distribution unchanged**

```bash
node -e "const d = JSON.parse(require('fs').readFileSync('content/dutch/knm.json','utf8')); console.log('count:', d.questions.length); const cats = {}; d.questions.forEach(q => cats[q.category] = (cats[q.category]||0)+1); console.log(cats); const missing_q = d.questions.filter(q => !q.question_en).length; const missing_o = d.questions.filter(q => !q.options_en || q.options_en.length !== 4).length; console.log('missing question_en:', missing_q); console.log('missing options_en:', missing_o);"
```

Expected:
```
count: 100
{ politiek: 17, werk: 17, onderwijs: 17, wonen: 17, gezondheid: 16, geschiedenis: 16 }
missing question_en: 0
missing options_en: 0
```

- [ ] **Step 3: Run the bilingual test from Task 1 — now passes**

```bash
npx vitest run lib/dutch/knm.test.ts
```

Expected: all 12 tests pass (11 existing + 1 new bilingual).

- [ ] **Step 4: Full suite + tsc + lint**

```bash
npx vitest run
npx tsc --noEmit
node scripts/lint-design.mjs
```

All clean.

- [ ] **Step 5: Commit**

```bash
git add content/dutch/knm.json
git commit -m "content(dutch): add English translations to all 100 KNM questions + options"
```

---

## Task 3: Render bilingual KNM study cards (drill stays Dutch-only)

**Files:**
- Modify: `app/dutch/knm/page.tsx`

**Critical:** Do NOT modify `app/dutch/knm/drill/page.tsx`. The drill is exam-realistic and stays Dutch-only.

- [ ] **Step 1: Find the StudyCard component in page.tsx**

```bash
grep -n 'function StudyCard\|q.question_nl\|q.options_nl' app/dutch/knm/page.tsx
```

This identifies the `StudyCard` function and where Dutch text is rendered.

- [ ] **Step 2: Update the StudyCard JSX to render English alongside Dutch**

In `app/dutch/knm/page.tsx`, locate the `StudyCard` component's JSX. It currently looks roughly like:

```tsx
return (
  <Sticker color={W} radius={14} padding={12}>
    <div style={{ fontFamily: FONTS.body, fontWeight: 700, color: COLORS.ink, fontSize: 14, marginBottom: 8 }}>
      {q.question_nl}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
      {q.options_nl.map((opt, i) => (
        <div key={i} style={{ ...optionStyle(i, q.correct_index) }}>
          {String.fromCharCode(65 + i)}. {opt} {i === q.correct_index && '✓'}
        </div>
      ))}
    </div>
    ...
  </Sticker>
)
```

Replace with this bilingual version (preserve existing styling, just add the English subtitle layer):

```tsx
return (
  <Sticker color={W} radius={14} padding={12}>
    <div style={{ fontFamily: FONTS.body, fontWeight: 700, color: COLORS.ink, fontSize: 14, marginBottom: 2 }}>
      {q.question_nl}
    </div>
    {q.question_en && (
      <div style={{
        fontFamily: FONTS.body, fontSize: 12, color: COLORS.ink, opacity: 0.65,
        fontStyle: 'italic', marginBottom: 8,
      }}>
        {q.question_en}
      </div>
    )}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
      {q.options_nl.map((opt, i) => (
        <div key={i}>
          <div
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
          {q.options_en?.[i] && (
            <div style={{
              fontFamily: FONTS.body, fontSize: 11, color: COLORS.ink,
              opacity: 0.6, fontStyle: 'italic', paddingLeft: 22, marginTop: 1,
            }}>
              {q.options_en[i]}
            </div>
          )}
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
```

Adapt whatever local variable names exist (e.g. `W` for white literal, `toggle`, `learned`). The key change is: under each Dutch line, add a smaller italic English line.

- [ ] **Step 3: Confirm drill page is unchanged**

```bash
git diff app/dutch/knm/drill/page.tsx
```

Expected: empty diff. Drill stays Dutch-only.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
npx vitest run
node scripts/lint-design.mjs
```

All clean.

- [ ] **Step 5: Commit**

```bash
git add app/dutch/knm/page.tsx
git commit -m "feat(dutch): bilingual KNM study cards (drill stays Dutch-only)"
```

---

## Task 4: Author `content/dutch/lezen.json` (10 texts × 4 MCQs)

**Files:**
- Create: `content/dutch/lezen.json`

This is the second-heaviest content task — 10 Dutch texts with English translations and 40 bilingual MCQs.

Quality bar:
- Each text reads as natural Dutch at the stated CEFR level.
- English translations are smooth (not word-for-word literal).
- MCQ distractors are plausible (a learner would have to actually read the text to choose correctly).
- Explanations teach, not just confirm.

- [ ] **Step 1: Create the JSON file**

Create `/home/user/learn-hindi/content/dutch/lezen.json`:

```json
{
  "texts": [
    /* ... 10 entries — see Step 2 for shape and content list ... */
  ]
}
```

- [ ] **Step 2: Author each text in turn**

Use this schema and quality bar for every entry:

```ts
{
  id: 'lezen-001',                            // 'lezen-001'..'lezen-010', sequential
  tier: 'A1' | 'A2' | 'B1',
  topic: 'daily-routine' | 'supermarket' | ...,  // see table below
  title_nl: string,                            // 3-6 word Dutch title
  title_en: string,                            // 3-6 word English title
  body_nl: string,                             // Dutch text body
  body_en: string,                             // full English translation
  word_count: number,                          // computed by you: split body_nl on whitespace and count
  questions: [                                 // exactly 4 entries
    {
      type: 'hoofdgedachte' | 'detail' | 'woordbetekenis' | 'gevolg',
      question_nl: string,
      question_en: string,
      options_nl: [string, string, string, string],
      options_en: [string, string, string, string],
      correct_index: 0 | 1 | 2 | 3,
      explanation_en: string,                  // 1-2 sentences in English
    },
    // ... 3 more
  ],
  references: ['rijksoverheid.nl style', 'Naar Nederland'] // optional, descriptive
}
```

**The 10 texts (use exactly these IDs / tiers / topics / titles):**

| id | tier | topic | title_en | title_nl | word_count target | Question type distribution |
|---|---|---|---|---|---|---|
| lezen-001 | A1 | daily-routine | My day | Mijn dag | 60-80 | 2 detail + 2 hoofdgedachte |
| lezen-002 | A1 | supermarket | At the supermarket | In de supermarkt | 60-80 | 2 detail + 2 hoofdgedachte |
| lezen-003 | A1 | weather | The weather today | Het weer vandaag | 60-80 | 2 detail + 2 hoofdgedachte |
| lezen-004 | A1 | food | What I eat | Wat ik eet | 60-80 | 2 detail + 2 hoofdgedachte |
| lezen-005 | A1 | family | My family | Mijn familie | 60-80 | 2 detail + 2 hoofdgedachte |
| lezen-006 | A2 | gp-visit | Going to the doctor | Naar de huisarts | 120-180 | 1 detail + 1 hoofdgedachte + 2 woordbetekenis |
| lezen-007 | A2 | ov-chipkaart | Buying an OV-chipkaart | Een ov-chipkaart kopen | 120-180 | 1 detail + 1 hoofdgedachte + 2 woordbetekenis |
| lezen-008 | A2 | appointment | Making an appointment | Een afspraak maken | 120-180 | 1 detail + 1 hoofdgedachte + 2 woordbetekenis |
| lezen-009 | A2 | library | At the library | In de bibliotheek | 120-180 | 1 detail + 1 hoofdgedachte + 2 woordbetekenis |
| lezen-010 | B1 | bsn-digid | Getting a BSN and DigiD | Een BSN en DigiD aanvragen | 250-350 | 1 of each: detail + hoofdgedachte + woordbetekenis + gevolg |

**Sample fully-drafted entry for `lezen-001` (use as the quality bar; draft the other 9 in the same style):**

```json
{
  "id": "lezen-001",
  "tier": "A1",
  "topic": "daily-routine",
  "title_nl": "Mijn dag",
  "title_en": "My day",
  "body_nl": "Ik sta elke dag om zeven uur op. Eerst neem ik een douche en daarna eet ik ontbijt. Ik drink koffie en eet brood met kaas. Om acht uur ga ik naar mijn werk. Ik werk op een kantoor in Utrecht. Tussen de middag eet ik een broodje in de kantine. 's Avonds ben ik om zes uur weer thuis. Ik kook eten en kijk soms televisie. Om elf uur ga ik naar bed.",
  "body_en": "I get up every day at seven o'clock. First I take a shower and then I eat breakfast. I drink coffee and eat bread with cheese. At eight o'clock I go to my work. I work in an office in Utrecht. At lunchtime I eat a sandwich in the canteen. In the evening I am back home at six o'clock. I cook food and sometimes watch television. At eleven o'clock I go to bed.",
  "word_count": 78,
  "questions": [
    {
      "type": "detail",
      "question_nl": "Hoe laat staat de schrijver op?",
      "question_en": "What time does the writer get up?",
      "options_nl": ["Om zes uur", "Om zeven uur", "Om acht uur", "Om elf uur"],
      "options_en": ["At six o'clock", "At seven o'clock", "At eight o'clock", "At eleven o'clock"],
      "correct_index": 1,
      "explanation_en": "The text says 'Ik sta elke dag om zeven uur op' — every day at seven."
    },
    {
      "type": "detail",
      "question_nl": "Waar werkt de schrijver?",
      "question_en": "Where does the writer work?",
      "options_nl": ["In een fabriek", "In een winkel", "Op een kantoor", "Thuis"],
      "options_en": ["In a factory", "In a shop", "In an office", "At home"],
      "correct_index": 2,
      "explanation_en": "The text says 'Ik werk op een kantoor in Utrecht' — I work in an office in Utrecht."
    },
    {
      "type": "hoofdgedachte",
      "question_nl": "Waar gaat de tekst vooral over?",
      "question_en": "What is the text mainly about?",
      "options_nl": [
        "De vakantie van de schrijver",
        "Een dag in het leven van de schrijver",
        "Het werk van de schrijver",
        "Eten en drinken in Nederland"
      ],
      "options_en": [
        "The writer's holiday",
        "A day in the writer's life",
        "The writer's job",
        "Food and drink in the Netherlands"
      ],
      "correct_index": 1,
      "explanation_en": "The text describes the writer's daily routine from morning to night — a typical day in their life."
    },
    {
      "type": "hoofdgedachte",
      "question_nl": "Wat doet de schrijver 's avonds?",
      "question_en": "What does the writer do in the evening?",
      "options_nl": [
        "Werkt op kantoor",
        "Gaat naar Utrecht",
        "Kookt en kijkt televisie",
        "Drinkt koffie"
      ],
      "options_en": [
        "Works at the office",
        "Goes to Utrecht",
        "Cooks and watches television",
        "Drinks coffee"
      ],
      "correct_index": 2,
      "explanation_en": "The text says 'Ik kook eten en kijk soms televisie' — I cook food and sometimes watch television."
    }
  ],
  "references": ["Naar Nederland A1", "rijksoverheid.nl style"]
}
```

**Now draft the remaining 9 entries (lezen-002 through lezen-010) in the same shape and quality.** Each must:
- Hit its tier's word count (A1: 60-80, A2: 120-180, B1: 250-350)
- Use vocabulary + grammar appropriate for the tier
  - A1: simple present tense, common nouns, basic verbs (gaan / komen / zijn / hebben / eten / drinken / werken)
  - A2: add past tense ("gisteren ging ik..."), modal verbs (moeten / kunnen / mogen), reflexive verbs (zich aanmelden), and conditional constructions
  - B1: formal register, subordinate clauses (als / omdat / hoewel), passive voice ("wordt verstuurd"), abstract nouns
- Include the exact `type` distribution from the table

**B1 text guidance (lezen-010, "Een BSN en DigiD aanvragen"):**
- Topic: getting a BSN (Burgerservicenummer) and a DigiD account when you arrive in the Netherlands.
- Mention: registering at the gemeente (BRP), wait for BSN to be issued, then DigiD application online via digid.nl, activation code by post within 5 working days, used for taxes / health insurance / parking permits.
- Tone: formal-but-accessible, like rijksoverheid.nl info pages.
- 4 questions: 1 detail (e.g. "How does the activation code arrive?"), 1 hoofdgedachte (overall topic), 1 woordbetekenis (e.g. what does "aanvragen" or "geldig" mean in context), 1 gevolg ("If you don't have a BSN, what can you not do?").

- [ ] **Step 3: Validate the file structure**

```bash
node -e "
const d = JSON.parse(require('fs').readFileSync('content/dutch/lezen.json','utf8'));
console.log('texts:', d.texts.length);
const tiers = {}; d.texts.forEach(t => tiers[t.tier] = (tiers[t.tier]||0)+1);
console.log('tiers:', tiers);
const qcounts = d.texts.map(t => t.questions.length);
console.log('questions per text:', qcounts);
const allHaveBilingual = d.texts.every(t => t.body_en && t.questions.every(q => q.question_en && q.options_en && q.options_en.length === 4));
console.log('all bilingual:', allHaveBilingual);
const totalQ = qcounts.reduce((a,b)=>a+b,0);
console.log('total questions:', totalQ);
"
```

Expected output:
```
texts: 10
tiers: { A1: 5, A2: 4, B1: 1 }
questions per text: [ 4, 4, 4, 4, 4, 4, 4, 4, 4, 4 ]
all bilingual: true
total questions: 40
```

If any number is off, fix the JSON until it matches.

- [ ] **Step 4: Commit**

```bash
git add content/dutch/lezen.json
git commit -m "content(dutch): add 10 Lezen texts (5 A1 + 4 A2 + 1 B1) with bilingual translations and 40 MCQs"
```

---

## Task 5: TDD `lib/dutch/lezen.ts`

**Files:**
- Create: `lib/dutch/lezen.ts`
- Create: `lib/dutch/lezen.test.ts`

- [ ] **Step 1: Write failing tests**

Create `/home/user/learn-hindi/lib/dutch/lezen.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import {
  getLezenTexts,
  getTextById,
  getTextsByTier,
  drawMockSet,
  scoreMockAttempt,
  saveMockAttempt,
  getMockHistory,
  markTextStudied,
  isStudied,
  getStudiedCount,
  PASS_THRESHOLD,
  MOCK_SIZE,
  QUESTIONS_PER_TEXT,
  MOCK_TIMER_MS,
  STUDIED_KEY,
  MOCK_ATTEMPTS_KEY,
} from './lezen'

beforeEach(() => {
  localStorage.clear()
})

describe('lezen', () => {
  it('loads 10 texts', () => {
    expect(getLezenTexts().length).toBe(10)
  })

  it('every text has bilingual body + 4 bilingual questions', () => {
    for (const t of getLezenTexts()) {
      expect(t.id).toMatch(/^lezen-\d{3}$/)
      expect(['A1','A2','B1']).toContain(t.tier)
      expect(t.body_nl.length).toBeGreaterThan(0)
      expect(t.body_en.length).toBeGreaterThan(0)
      expect(t.questions.length).toBe(QUESTIONS_PER_TEXT)
      for (const q of t.questions) {
        expect(['hoofdgedachte','detail','woordbetekenis','gevolg']).toContain(q.type)
        expect(q.question_nl.length).toBeGreaterThan(0)
        expect(q.question_en.length).toBeGreaterThan(0)
        expect(q.options_nl.length).toBe(4)
        expect(q.options_en.length).toBe(4)
        expect([0,1,2,3]).toContain(q.correct_index)
      }
    }
  })

  it('getTextById returns the matching text', () => {
    expect(getTextById('lezen-001')?.tier).toBe('A1')
    expect(getTextById('lezen-010')?.tier).toBe('B1')
    expect(getTextById('nope')).toBeUndefined()
  })

  it('getTextsByTier filters correctly', () => {
    expect(getTextsByTier('A1').length).toBe(5)
    expect(getTextsByTier('A2').length).toBe(4)
    expect(getTextsByTier('B1').length).toBe(1)
  })

  it('drawMockSet returns MOCK_SIZE unique texts', () => {
    const m = drawMockSet()
    expect(m.length).toBe(MOCK_SIZE)
    const ids = new Set(m.map((t) => t.id))
    expect(ids.size).toBe(MOCK_SIZE)
  })

  it('drawMockSet randomness sanity', () => {
    const a = drawMockSet().map((t) => t.id).join(',')
    const b = drawMockSet().map((t) => t.id).join(',')
    expect(a).not.toBe(b)
  })

  it('scoreMockAttempt counts correct answers across all 20 questions', () => {
    const m = drawMockSet()
    const allCorrect = m.flatMap((t) => t.questions.map((q) => q.correct_index))
    const r = scoreMockAttempt(m, allCorrect)
    expect(r.score).toBe(MOCK_SIZE * QUESTIONS_PER_TEXT)
    expect(r.total).toBe(MOCK_SIZE * QUESTIONS_PER_TEXT)
    expect(r.passed).toBe(true)

    const allWrong = m.flatMap((t) => t.questions.map((q) => ((q.correct_index + 1) % 4) as 0|1|2|3))
    const r2 = scoreMockAttempt(m, allWrong)
    expect(r2.score).toBe(0)
    expect(r2.passed).toBe(false)
  })

  it('PASS_THRESHOLD is 0.8 (80%)', () => {
    expect(PASS_THRESHOLD).toBe(0.8)
  })

  it('MOCK_TIMER_MS is 25 minutes', () => {
    expect(MOCK_TIMER_MS).toBe(25 * 60 * 1000)
  })

  it('saveMockAttempt + getMockHistory persist (most recent first)', () => {
    saveMockAttempt({ ts: 1000, score: 18, total: 20, passed: true, text_ids: ['lezen-001'] })
    saveMockAttempt({ ts: 2000, score: 12, total: 20, passed: false, text_ids: ['lezen-002'] })
    const hist = getMockHistory()
    expect(hist.length).toBe(2)
    expect(hist[0].ts).toBe(2000)
  })

  it('getMockHistory caps at 50', () => {
    for (let i = 0; i < 60; i++) {
      saveMockAttempt({ ts: i, score: 0, total: 20, passed: false, text_ids: [] })
    }
    expect(getMockHistory().length).toBe(50)
  })

  it('markTextStudied + isStudied + getStudiedCount track per-text learning', () => {
    expect(isStudied('lezen-001')).toBe(false)
    expect(getStudiedCount()).toBe(0)
    markTextStudied('lezen-001')
    markTextStudied('lezen-002')
    markTextStudied('lezen-001') // idempotent
    expect(isStudied('lezen-001')).toBe(true)
    expect(getStudiedCount()).toBe(2)
  })
})
```

- [ ] **Step 2: Run tests, expect FAIL**

```bash
npx vitest run lib/dutch/lezen.test.ts
```

Expected: cannot resolve './lezen'.

- [ ] **Step 3: Implement**

Create `/home/user/learn-hindi/lib/dutch/lezen.ts`:

```ts
import lezenData from '@/content/dutch/lezen.json'

export const MOCK_SIZE = 5
export const QUESTIONS_PER_TEXT = 4
export const PASS_THRESHOLD = 0.8
export const MOCK_TIMER_MS = 25 * 60 * 1000
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

export interface LezenScoreResult {
  score: number
  total: number
  passed: boolean
}

function safeWindow(): Window | null {
  return typeof window === 'undefined' ? null : window
}

export function getLezenTexts(): LezenText[] {
  return lezenData.texts as LezenText[]
}

export function getTextById(id: string): LezenText | undefined {
  return getLezenTexts().find((t) => t.id === id)
}

export function getTextsByTier(tier: Tier): LezenText[] {
  return getLezenTexts().filter((t) => t.tier === tier)
}

export function drawMockSet(): LezenText[] {
  const all = [...getLezenTexts()]
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  return all.slice(0, MOCK_SIZE)
}

export function scoreMockAttempt(
  texts: LezenText[],
  answers: Array<0 | 1 | 2 | 3>,
): LezenScoreResult {
  let score = 0
  let total = 0
  let aIdx = 0
  for (const t of texts) {
    for (const q of t.questions) {
      if (answers[aIdx] === q.correct_index) score++
      total++
      aIdx++
    }
  }
  const passed = total > 0 && score / total >= PASS_THRESHOLD
  return { score, total, passed }
}

export function saveMockAttempt(attempt: LezenMockAttempt): void {
  const w = safeWindow()
  if (!w) return
  const existing = getMockHistory()
  const next = [attempt, ...existing].slice(0, MAX_ATTEMPTS)
  w.localStorage.setItem(MOCK_ATTEMPTS_KEY, JSON.stringify(next))
}

export function getMockHistory(): LezenMockAttempt[] {
  const w = safeWindow()
  if (!w) return []
  const raw = w.localStorage.getItem(MOCK_ATTEMPTS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as LezenMockAttempt[]
  } catch {
    return []
  }
}

function readStudiedSet(): Set<string> {
  const w = safeWindow()
  if (!w) return new Set()
  const raw = w.localStorage.getItem(STUDIED_KEY)
  if (!raw) return new Set()
  try {
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function writeStudiedSet(set: Set<string>): void {
  const w = safeWindow()
  if (!w) return
  w.localStorage.setItem(STUDIED_KEY, JSON.stringify([...set]))
}

export function markTextStudied(id: string): void {
  const set = readStudiedSet()
  set.add(id)
  writeStudiedSet(set)
}

export function isStudied(id: string): boolean {
  return readStudiedSet().has(id)
}

export function getStudiedCount(): number {
  return readStudiedSet().size
}
```

- [ ] **Step 4: Tests PASS**

```bash
npx vitest run lib/dutch/lezen.test.ts
```

Expected: all 12 tests pass.

- [ ] **Step 5: Full suite + tsc + lint**

```bash
npx vitest run
npx tsc --noEmit
node scripts/lint-design.mjs
```

All clean.

- [ ] **Step 6: Commit**

```bash
git add lib/dutch/lezen.ts lib/dutch/lezen.test.ts
git commit -m "feat(dutch): lezen loader + tier filter + mock draw + scoring + studied tracking"
```

---

## Task 6: Add 2 Dutch Chaina moments

**Files:**
- Modify: `components/design/moments.ts`

- [ ] **Step 1: Add LINES entries**

In the `LINES` object, append:

```ts
  lezenStudyDone: [
    { main: 'tekst gelezen!', caption: 'doorgaan',     speak: 'Tekst gelezen! Doorgaan.' },
    { main: 'mooi gedaan',     caption: 'nog een tekst', speak: 'Mooi gedaan. Nog een tekst.' },
  ],
  lezenMockPassed: [
    { main: 'lezen geslaagd!',  caption: 'lekker bezig',   speak: 'Lezen geslaagd! Lekker bezig.' },
    { main: 'top, Lezen pass!', caption: 'B1 dichterbij',  speak: 'Top, Lezen pass. B1 dichterbij.' },
  ],
```

- [ ] **Step 2: Add MOMENTS entries**

In the `MOMENTS` object, append:

```ts
  lezenStudyDone: {
    label: 'Lezen text studied',
    when: 'User marks a Lezen text as studied',
    anchor: 'bottom-right',
    enter: 'peek-up-right', enterMs: 700, holdMs: 3000, exit: 'dismiss-down', exitMs: 500,
    mood: 'wave', moodAnim: 'wave-tilt 1.2s ease-in-out 2',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.lezenStudyDone, sizePct: 0.32,
  },
  lezenMockPassed: {
    label: 'Lezen mock passed (>=80%)',
    when: 'Lezen timed mock finishes with score >=80%',
    anchor: 'center',
    enter: 'bubble-pop', enterMs: 700, holdMs: 3400, exit: 'dismiss-down', exitMs: 600,
    mood: 'happy', moodAnim: 'happy-hop 0.6s ease-in-out 2',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.lezenMockPassed, sizePct: 0.45,
  },
```

- [ ] **Step 3: Update the registry-completeness test**

```bash
grep -rn 'Object.keys(MOMENTS)\|expected.*moments\|moment.*registry' __tests__/lib 2>/dev/null | head -10
```

Find the test (likely `__tests__/lib/moments-pick-line.test.ts` or similar) that enumerates moment keys. Current expected count is 19; bump to 21. Add the 2 new keys (`'lezenStudyDone'`, `'lezenMockPassed'`) to the expected key list in alphabetical order.

```bash
npx vitest run -t "moments"
```

Read the failure message, update the test to match.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
npx vitest run
```

All clean.

- [ ] **Step 5: Commit**

```bash
git add components/design/moments.ts __tests__/
git commit -m "feat(chaina): add 2 Dutch Lezen moments (lezenStudyDone, lezenMockPassed)"
```

---

## Task 7: Create `/dutch/lezen/` module home page

**Files:**
- Create: `app/dutch/lezen/page.tsx`

- [ ] **Step 1: Create directory**

```bash
mkdir -p app/dutch/lezen/mock
```

(The `[textId]` sub-route is created in Task 8.)

- [ ] **Step 2: Write the module home page**

Create `/home/user/learn-hindi/app/dutch/lezen/page.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sticker,
  Tag,
  Cutting,
  COLORS,
  FONTS,
  BORDER,
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

        <Sticker color={COLORS.orange} radius={22} padding={16} onClick={onStartMock} style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Cutting size={56} mood="happy" />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 18, color: W }}>
                Start timed mock
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 13, color: W, opacity: 0.9, marginTop: 2 }}>
                5 texts · 20 questions · 25 min · Dutch only
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 11, color: W, opacity: 0.75, marginTop: 4, fontStyle: 'italic' }}>
                Study first if you're new — bilingual mode helps.
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
                  {texts.map((t) => (
                    <TextCard key={t.id} text={t} onOpen={() => router.push(`/dutch/lezen/${t.id}`)} />
                  ))}
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
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
npx vitest run
node scripts/lint-design.mjs
```

All clean. If `lint-design` flags any literal, ensure it's wrapped in the `@design-allow:` pattern.

- [ ] **Step 4: Commit**

```bash
git add app/dutch/lezen/page.tsx
git commit -m "feat(dutch): /dutch/lezen module home — 3 tier sections + mock CTA + history"
```

---

## Task 8: Create `/dutch/lezen/[textId]/` study mode

**Files:**
- Create: `app/dutch/lezen/[textId]/page.tsx`

- [ ] **Step 1: Create the file**

Create `/home/user/learn-hindi/app/dutch/lezen/[textId]/page.tsx`:

```tsx
'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sticker, Tag, Cutting,
  COLORS, FONTS, BORDER,
  useChaina, canFire, markFired,
} from '@/components/design'
import {
  getTextById,
  markTextStudied,
  isStudied,
  type LezenText,
  type LezenQuestion,
} from '@/lib/dutch/lezen'
import { playSound } from '@/lib/sounds'

const W = '#fff' // @design-allow: white literal

export default function LezenStudyPage({ params }: { params: Promise<{ textId: string }> }) {
  const { textId } = use(params)
  const router = useRouter()
  const text = getTextById(textId)
  const [showEn, setShowEn] = useState(false)
  const [alreadyStudied, setAlreadyStudied] = useState(false)
  const { play } = useChaina()

  useEffect(() => { setAlreadyStudied(isStudied(textId)) }, [textId])

  if (!text) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.lav, padding: 24 }}>
        <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: FONTS.body, color: COLORS.ink }}>
          Text not found.
          <button onClick={() => router.push('/dutch/lezen')} style={{
            background: COLORS.butter, border: BORDER.sticker, padding: '6px 12px',
            borderRadius: 8, marginLeft: 12, cursor: 'pointer',
          }}>← Back</button>
        </div>
      </div>
    )
  }

  const onStudied = () => {
    if (alreadyStudied) return
    markTextStudied(text.id)
    setAlreadyStudied(true)
    playSound('complete')
    if (canFire('lezenStudyDone', 'debounce-800ms')) {
      play('lezenStudyDone')
      markFired('lezenStudyDone', 'debounce-800ms')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.lav, padding: '24px 16px 120px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'transparent', border: 'none', color: COLORS.ink,
            fontSize: 14, fontFamily: FONTS.body, fontWeight: 700, cursor: 'pointer', marginBottom: 8,
          }}
        >
          ← Back
        </button>
        <Tag>{text.tier}</Tag>
        <h1 style={{
          fontFamily: FONTS.display, fontSize: 24, fontWeight: 800, color: COLORS.ink,
          margin: '6px 0 2px',
        }}>
          {text.title_en}
        </h1>
        <div style={{
          fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, opacity: 0.65,
          fontStyle: 'italic', marginBottom: 16,
        }}>
          {text.title_nl} · {text.word_count} words
        </div>

        {/* Text body */}
        <Sticker color={W} radius={18} padding={16} style={{ marginBottom: 12 }}>
          <div style={{
            fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink, lineHeight: 1.6, whiteSpace: 'pre-wrap',
          }}>
            {text.body_nl}
          </div>
        </Sticker>

        <button
          onClick={() => { playSound('tap'); setShowEn((v) => !v) }}
          style={{
            background: COLORS.butter, border: BORDER.sticker, padding: '8px 14px',
            borderRadius: 999, fontFamily: FONTS.body, fontWeight: 700, fontSize: 13,
            color: COLORS.ink, cursor: 'pointer', marginBottom: 12,
          }}
        >
          {showEn ? 'Hide English translation' : 'Show English translation'}
        </button>

        {showEn && (
          <Sticker color={COLORS.mint} radius={14} padding={14} style={{ marginBottom: 18 }}>
            <div style={{
              fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, lineHeight: 1.6,
              fontStyle: 'italic', whiteSpace: 'pre-wrap',
            }}>
              {text.body_en}
            </div>
          </Sticker>
        )}

        {/* Questions */}
        <div style={{
          fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink,
          textTransform: 'uppercase', letterSpacing: 1, marginTop: 6, marginBottom: 10,
        }}>
          Questions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {text.questions.map((q, idx) => (
            <QuestionCard key={idx} q={q} index={idx} />
          ))}
        </div>

        {/* Mark studied button */}
        <button
          onClick={onStudied}
          disabled={alreadyStudied}
          style={{
            marginTop: 18,
            background: alreadyStudied ? COLORS.mint : COLORS.orange,
            border: BORDER.sticker, padding: '12px 18px',
            borderRadius: 14, fontFamily: FONTS.display, fontWeight: 800, fontSize: 15,
            color: alreadyStudied ? COLORS.ink : W,
            cursor: alreadyStudied ? 'default' : 'pointer', width: '100%',
          }}
        >
          {alreadyStudied ? '✓ Studied' : 'Mark as studied'}
        </button>
      </div>
    </div>
  )
}

function QuestionCard({ q, index }: { q: LezenQuestion; index: number }) {
  const [picked, setPicked] = useState<0 | 1 | 2 | 3 | null>(null)
  const revealed = picked !== null

  const onPick = (i: 0 | 1 | 2 | 3) => {
    if (revealed) return
    setPicked(i)
    playSound(i === q.correct_index ? 'correct' : 'wrong')
  }

  return (
    <Sticker color={W} radius={14} padding={12}>
      <div style={{
        fontFamily: FONTS.display, fontWeight: 800, fontSize: 11, color: COLORS.ink,
        opacity: 0.55, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4,
      }}>
        Q{index + 1} · {q.type}
      </div>
      <div style={{ fontFamily: FONTS.body, fontWeight: 700, color: COLORS.ink, fontSize: 14, marginBottom: 2 }}>
        {q.question_nl}
      </div>
      <div style={{
        fontFamily: FONTS.body, fontSize: 12, color: COLORS.ink, opacity: 0.65,
        fontStyle: 'italic', marginBottom: 10,
      }}>
        {q.question_en}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
        {q.options_nl.map((opt, i) => {
          const isCorrect = i === q.correct_index
          const isPicked = picked === i
          const showCorrect = revealed && isCorrect
          const showWrong = revealed && isPicked && !isCorrect
          return (
            <div
              key={i}
              onClick={() => onPick(i as 0 | 1 | 2 | 3)}
              style={{
                cursor: revealed ? 'default' : 'pointer',
                padding: '6px 10px', borderRadius: 8,
                background: showCorrect ? COLORS.mint : showWrong ? '#f4c5c5' : isPicked ? COLORS.butter : 'transparent',
                border: BORDER.sticker,
              }}
            >
              <div style={{
                fontFamily: FONTS.body, fontSize: 13, fontWeight: showCorrect ? 700 : 400, color: COLORS.ink,
              }}>
                {String.fromCharCode(65 + i)}. {opt}
                {showCorrect && ' ✓'}
                {showWrong && ' ✕'}
              </div>
              <div style={{
                fontFamily: FONTS.body, fontSize: 11, color: COLORS.ink, opacity: 0.6,
                fontStyle: 'italic', paddingLeft: 16,
              }}>
                {q.options_en[i]}
              </div>
            </div>
          )
        })}
      </div>
      {revealed && (
        <div style={{
          fontFamily: FONTS.body, fontSize: 12, color: COLORS.ink, opacity: 0.8,
          fontStyle: 'italic', marginTop: 4,
        }}>
          {q.explanation_en}
        </div>
      )}
    </Sticker>
  )
}
```

Note: the wrong-answer pink `'#f4c5c5'` is already a precedent literal from the drill page — if `lint-design` flags it, add `// @design-allow:` to that line by extracting `const ROSE_LIGHT = '#f4c5c5' // @design-allow: wrong-answer highlight` at file top, matching the pattern used in `app/dutch/knm/drill/page.tsx`.

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npx vitest run
node scripts/lint-design.mjs
```

- [ ] **Step 3: Commit**

```bash
git add app/dutch/lezen/\[textId\]/page.tsx
git commit -m "feat(dutch): /dutch/lezen/[textId] study mode — bilingual body + Q cards"
```

---

## Task 9: Create `/dutch/lezen/mock/` timed drill (Dutch-only)

**Files:**
- Create: `app/dutch/lezen/mock/page.tsx`

- [ ] **Step 1: Write the page**

Create `/home/user/learn-hindi/app/dutch/lezen/mock/page.tsx`:

```tsx
'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Sticker, Tag, Cutting, Confetti,
  COLORS, FONTS, BORDER,
  useChaina, canFire, markFired,
} from '@/components/design'
import {
  drawMockSet,
  scoreMockAttempt,
  saveMockAttempt,
  MOCK_SIZE,
  QUESTIONS_PER_TEXT,
  PASS_THRESHOLD,
  MOCK_TIMER_MS,
  type LezenText,
} from '@/lib/dutch/lezen'
import { playSound } from '@/lib/sounds'

const W = '#fff' // @design-allow: white literal
const GREEN = '#1f8a3a' // @design-allow: semantic pass color
const RED = '#b94a4a' // @design-allow: semantic fail color
const ROSE_LIGHT = '#f4c5c5' // @design-allow: wrong-answer highlight

const TOTAL_Q = MOCK_SIZE * QUESTIONS_PER_TEXT  // 20

export default function LezenMockPage() {
  const router = useRouter()
  const texts = useMemo<LezenText[]>(() => drawMockSet(), [])
  const [textIdx, setTextIdx] = useState(0)
  const [qIdx, setQIdx] = useState(0)
  const [answers, setAnswers] = useState<Array<0 | 1 | 2 | 3 | null>>(() =>
    Array(TOTAL_Q).fill(null) as Array<0 | 1 | 2 | 3 | null>,
  )
  const [done, setDone] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [timeLeftMs, setTimeLeftMs] = useState(MOCK_TIMER_MS)
  const { play } = useChaina()
  const tickRef = useRef<NodeJS.Timeout | null>(null)

  // Global timer
  useEffect(() => {
    if (done) return
    tickRef.current = setInterval(() => {
      setTimeLeftMs((ms) => {
        if (ms <= 1000) {
          if (tickRef.current) clearInterval(tickRef.current)
          setDone(true)
          return 0
        }
        return ms - 1000
      })
    }, 1000)
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [done])

  const flatIndex = textIdx * QUESTIONS_PER_TEXT + qIdx
  const text = texts[textIdx]
  const q = text?.questions[qIdx]

  const result = useMemo(() => done
    ? scoreMockAttempt(texts, answers.map((a) => (a ?? 0) as 0|1|2|3))
    : null, [done, texts, answers])

  useEffect(() => {
    if (!done || !result) return
    saveMockAttempt({
      ts: Date.now(),
      score: result.score,
      total: result.total,
      passed: result.passed,
      text_ids: texts.map((t) => t.id),
    })
    if (result.passed) {
      playSound('levelup')
      if (canFire('lezenMockPassed', 'debounce-800ms')) {
        play('lezenMockPassed')
        markFired('lezenMockPassed', 'debounce-800ms')
      }
    } else {
      playSound('complete')
      if (canFire('knmAttemptComplete', 'debounce-800ms')) {
        play('knmAttemptComplete')
        markFired('knmAttemptComplete', 'debounce-800ms')
      }
    }
  }, [done, result, texts, play])

  const onSelect = (i: 0 | 1 | 2 | 3) => {
    if (revealed) return
    const next = [...answers]
    next[flatIndex] = i
    setAnswers(next)
    setRevealed(true)
    playSound(i === q!.correct_index ? 'correct' : 'wrong')
    setTimeout(() => {
      if (qIdx === QUESTIONS_PER_TEXT - 1) {
        if (textIdx === texts.length - 1) {
          setDone(true)
        } else {
          setTextIdx(textIdx + 1)
          setQIdx(0)
          setRevealed(false)
        }
      } else {
        setQIdx(qIdx + 1)
        setRevealed(false)
      }
    }, 1500)
  }

  // Final score screen
  if (done && result) {
    return (
      <div style={{
        minHeight: '100vh', background: COLORS.lav, padding: '24px 16px',
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
          color: result.passed ? GREEN : RED,
        }}>
          {result.score} / {result.total}
        </div>
        <div style={{
          fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, opacity: 0.75, marginTop: 4,
        }}>
          {result.passed
            ? `Above the ${Math.round(PASS_THRESHOLD * 100)}% pass threshold`
            : `Need ${Math.ceil(TOTAL_Q * PASS_THRESHOLD)} / ${TOTAL_Q} to pass`}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <Sticker color={COLORS.orange} radius={16} padding={12} onClick={() => router.push('/dutch/lezen')}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, color: W, padding: '0 8px' }}>Back to Lezen</div>
          </Sticker>
          <Sticker color={COLORS.butter} radius={16} padding={12} onClick={() => location.reload()}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, color: COLORS.ink, padding: '0 8px' }}>Try again</div>
          </Sticker>
        </div>
      </div>
    )
  }

  const min = Math.floor(timeLeftMs / 60000)
  const sec = Math.floor((timeLeftMs % 60000) / 1000)
  const timerStr = `${min}:${sec.toString().padStart(2, '0')}`
  const timerLow = timeLeftMs < 5 * 60 * 1000

  return (
    <div style={{ minHeight: '100vh', background: COLORS.lav, padding: '24px 16px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
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
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Tag>{`Q ${flatIndex + 1} / ${TOTAL_Q}`}</Tag>
            <Tag bg={timerLow ? ROSE_LIGHT : COLORS.butter}>
              {timerStr}
            </Tag>
          </div>
        </div>

        <div style={{
          height: 8, background: W, borderRadius: 4, border: BORDER.sticker, marginBottom: 18,
          overflow: 'hidden',
        }}>
          <motion.div
            initial={false}
            animate={{ width: `${((flatIndex + (revealed ? 1 : 0)) / TOTAL_Q) * 100}%` }}
            style={{ height: '100%', background: COLORS.orange }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          />
        </div>

        {/* Text body (Dutch-only in mock) */}
        <Sticker color={W} radius={18} padding={14} style={{ marginBottom: 12 }}>
          <div style={{
            fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink, marginBottom: 6,
            textTransform: 'uppercase', letterSpacing: 1,
          }}>
            {text.title_nl}
          </div>
          <div style={{
            fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, lineHeight: 1.55,
            whiteSpace: 'pre-wrap',
          }}>
            {text.body_nl}
          </div>
        </Sticker>

        {/* Question (Dutch-only) */}
        <Sticker color={W} radius={16} padding={14} style={{ marginBottom: 12 }}>
          <Tag bg={COLORS.butter}>{q!.type}</Tag>
          <div style={{
            fontFamily: FONTS.display, fontWeight: 800, fontSize: 17, color: COLORS.ink,
            marginTop: 8, lineHeight: 1.4,
          }}>
            {q!.question_nl}
          </div>
        </Sticker>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {q!.options_nl.map((opt, i) => {
            const isSelected = answers[flatIndex] === i
            const isCorrect = i === q!.correct_index
            const showCorrect = revealed && isCorrect
            const showWrong = revealed && isSelected && !isCorrect
            const bg = showCorrect ? COLORS.mint
                     : showWrong   ? ROSE_LIGHT
                     : isSelected  ? COLORS.butter
                     : W
            return (
              <Sticker
                key={i}
                color={bg}
                radius={12}
                padding={12}
                onClick={() => onSelect(i as 0 | 1 | 2 | 3)}
              >
                <div style={{
                  fontFamily: FONTS.body, fontWeight: 700, fontSize: 14, color: COLORS.ink,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{
                    fontFamily: FONTS.display, fontWeight: 800, fontSize: 16,
                    width: 26, height: 26, borderRadius: '50%', background: COLORS.lav,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span style={{ flex: 1 }}>{opt}</span>
                  {showCorrect && <span style={{ fontSize: 20 }}>✓</span>}
                  {showWrong && <span style={{ fontSize: 20 }}>✕</span>}
                </div>
              </Sticker>
            )
          })}
        </div>

        {revealed && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 12 }}>
            <Sticker color={COLORS.butter} radius={10} padding={10}>
              <div style={{
                fontFamily: FONTS.body, fontSize: 12, fontStyle: 'italic', color: COLORS.ink, lineHeight: 1.4,
              }}>
                {q!.explanation_en}
              </div>
            </Sticker>
          </motion.div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npx vitest run
node scripts/lint-design.mjs
```

- [ ] **Step 3: Commit**

```bash
git add app/dutch/lezen/mock/page.tsx
git commit -m "feat(dutch): /dutch/lezen/mock — 25-min Dutch-only timed drill with Chaina + Confetti"
```

---

## Task 10: Flip Reading skill card to live + CONTENT.md

**Files:**
- Modify: `app/page.tsx`
- Modify: `CONTENT.md`

- [ ] **Step 1: Add lezen import + state to app/page.tsx**

```bash
grep -n 'getLearnedCount\|getDutchLezenStudied\|dutchKnmLearned' app/page.tsx | head
```

Near the existing `import { getLearnedCount } from '@/lib/dutch/knm'`, add a sibling line:

```ts
import { getStudiedCount as getLezenStudiedCount } from '@/lib/dutch/lezen'
```

Add state alongside `dutchKnmLearned`:

```ts
const [dutchLezenStudied, setDutchLezenStudied] = useState(0)
useEffect(() => {
  if (language === 'dutch') setDutchLezenStudied(getLezenStudiedCount())
}, [language])
```

- [ ] **Step 2: Flip the Reading skill card**

Find the SkillCard for Reading. Currently:
```tsx
<SkillCard label="Reading"   subtitle="Lezen"     subDutch=""  status="soon" />
```

Replace with:
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

- [ ] **Step 3: Update CONTENT.md**

In `CONTENT.md`, find the Dutch exam-prep section. Update the Lezen row:

```diff
- | Lezen (Reading) | not yet | Phase 2 |
+ | Lezen (Reading) | 10 texts (5 A1 + 4 A2 + 1 B1), 40 MCQs, bilingual study mode | Phase 2 (shipped 2026-05-26) |
```

Append to the storage-keys list at the end of that section:

```diff
+ - `dutch-lezen-studied` — `Set<string>` of text IDs
+ - `dutch-lezen-mock-attempts` — `Array<{ts, score, total, passed, text_ids}>` capped at 50
```

Add a note under "UI language" (or as a new sub-bullet):

```
- KNM study mode now shows English question + options alongside Dutch (drill stays Dutch-only).
- Lezen study mode shows English translation toggle for the text body; questions are bilingual. Mock is Dutch-only.
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
npx vitest run
node scripts/lint-design.mjs
```

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx CONTENT.md
git commit -m "feat(dutch): Reading skill card live; update CONTENT.md Phase 2 status"
```

---

## Task 11: Final QA + push

- [ ] **Step 1: Full local verification**

```bash
npx vitest run
npx tsc --noEmit
node scripts/lint-design.mjs
git log --oneline 8ea1376..HEAD
```

Expected:
- vitest: 244 + 12 (Lezen) + 1 (KNM bilingual) ≈ 257 passing
- tsc clean
- lint-design clean

- [ ] **Step 2: Smoke (optional, only if dev boots quickly)**

```bash
npm run dev &
sleep 8
# Browser:
# 1. Switch to Dutch. Home shows Reading card with "0/10 studied" and tappable.
# 2. Tap Reading → /dutch/lezen renders 3 tier sections, A1 open by default.
# 3. Tap a text card → study mode renders body + 4 Qs. English toggle works. Mark as studied → confetti? no but Chaina fires.
# 4. Back to /dutch/lezen → "Start timed mock" → mock with 25-min timer + Dutch-only Qs.
# 5. Open /dutch/knm/ → tap any category → study cards now show English under Dutch.
# 6. Open /dutch/knm/drill/ → Dutch-only (no English).
```

Kill dev server.

- [ ] **Step 3: Push**

```bash
git push origin main
```

- [ ] **Step 4: CI**

Wait for CI green.

---

## Self-review checklist (for the implementing engineer)

- [ ] `KnmQuestion` type extended with optional `question_en` + `options_en`
- [ ] All 100 KNM questions have `question_en` + `options_en` populated
- [ ] KNM `lib/dutch/knm.test.ts` has bilingual-fields test that passes
- [ ] KNM study card renders English under Dutch
- [ ] KNM drill page UNCHANGED — verify with `git diff` empty on that file
- [ ] `content/dutch/lezen.json` has exactly 10 texts (5 A1 + 4 A2 + 1 B1), 40 MCQs total, every Q has bilingual fields
- [ ] `lib/dutch/lezen.ts` + tests committed; 12 tests passing
- [ ] 2 new Chaina moments registered + registry test updated
- [ ] `/dutch/lezen/` module home renders with 3 tier sections + mock CTA + history
- [ ] `/dutch/lezen/[textId]/` study mode renders bilingual + mark-studied
- [ ] `/dutch/lezen/mock/` runs 20-question Dutch-only drill with 25-min timer
- [ ] `app/page.tsx` Reading skill card live
- [ ] `CONTENT.md` updated
- [ ] All tests green, tsc clean, design-lint clean
- [ ] All commits pushed
