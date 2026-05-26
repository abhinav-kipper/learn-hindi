# Dutch Exam-Prep Pivot (Inburgeringsexamen B1 + KNM) — Spec

**Status:** approved 2026-05-26
**Repo:** `abhinav-kipper/learn-hindi`

## 1. Scope

Pivot the existing Dutch section of the app from "casual conversational Dutch" to a focused exam-prep track for the **Inburgeringsexamen B1 + KNM** — the Dutch civic-integration exam that, for HSM holders, is required to naturalize and get a Dutch passport.

**This spec covers Phase 1 only:** strategic framework + KNM module + Dutch home reorientation. Subsequent specs (Phases 2-6) will add Lezen / Luisteren / Schrijven / Spreken modules and the full mock exam.

After Phase 1 ships, the user can use the app to: (a) see a clear A1 → A2 → B1 progress arc with the exam as the goal, (b) practice all 100 KNM questions in study mode, (c) take 30-question KNM mock exams with 80% pass tracking, (d) receive Chaina celebration moments on KNM milestones.

## 2. Decisions (settled in brainstorming)

| Decision | Choice |
|---|---|
| Exam target | Inburgeringsexamen B1 + KNM |
| Starting level | A0-A1 (effectively scratch) |
| Timeline | 4-9 months (medium-term) |
| Architecture | Pivot Dutch section in this app; keep existing 5 lessons + 7 foundations; add new exam-skill modules |
| Build-target level | **B1** (always strictly a superset of A2; future-proofs against requirement changes) |
| A2 stop-out option | Settings toggle + Chaina checkpoint moment when A2 stage completes |
| KNM pool size | 100 original questions across 6 categories (Politiek / Werk / Onderwijs / Wonen / Gezondheid / Geschiedenis) |
| KNM mock format | 30 questions drawn randomly from the 100-pool, 80% pass threshold (mirrors real exam) |
| First exam-skill module to ship | KNM (lowest-complexity to author, no Gemini grading needed, fixed answer keys) |
| Sources for KNM authoring | Naar Nederland handbook (free PDF), DUO oefenen.nl, Bart de Pau YouTube, Marlou Lemmens YouTube |

## 3. Strategic framework (the 3-stage arc)

```
A1 (months 1-2)  ──→  A2 (months 3-5)  ──→  B1 (months 6-9)  ──→  EXAM
build fundamentals    consolidate +         exam-target +
(existing lessons     exam-skill drills     full mock prep
+ foundations)        (Phases 2-5)          (Phase 6)
```

Surfaced visually on the Dutch home page as a vertical 3-card milestone path with progress fill on each stage. The user always knows what stage they're at and what's next.

### The 6 exam skills to cover (across all phases)

| Skill | What it tests | Phase |
|---|---|---|
| **KNM** (Kennis van de Nederlandse Maatschappij) | 30 MCQs from a pool. Government / healthcare / work / housing / education / culture / history | **1** (this spec) |
| **Lezen** (Reading B1) | 200-400-word texts + comprehension MCQs | 2 |
| **Luisteren** (Listening B1) | Audio clips (TTS → recorded later) + MCQs | 3 |
| **Schrijven** (Writing B1) | Short emails/letters/opinions; Gemini-graded against a B1 rubric | 4 |
| **Spreken** (Speaking B1) | Verbal responses; extends existing `/practice/` infra; Gemini-graded | 5 |
| **Full mock exam** | All 4 skills + KNM with realistic timing | 6 |

## 4. Architecture overview

```
content/dutch/
  ├── lessons/              ← existing 5 (keep as A1-A2 conversational)
  ├── foundations/          ← existing 7 (keep as A1-A2 grammar)
  ├── vocabulary.json       ← existing
  └── knm.json              ← NEW: 100 KNM questions, categorized

app/
  └── dutch/
      ├── knm/
      │   ├── page.tsx          ← NEW: KNM module home (study mode + drill mode entry)
      │   └── drill/page.tsx    ← NEW: 30-question mock exam runner

lib/
  ├── dutch/
  │   ├── knm.ts            ← NEW: load KNM, draw 30, scoring, attempt history
  │   └── exam-target.ts    ← NEW: read/write 'a2' | 'b1' user preference
  └── (existing dutch/* unchanged)

components/
  ├── design/moments.ts     ← MODIFY: add knmAttemptComplete + knmPassed + a2Milestone Dutch lines
  └── dutch-welcome-modal.tsx ← MODIFY: reorient copy around exam-prep mission
```

Dutch home page (`app/page.tsx` Dutch tab branch) gets a major reorientation: exam-goal banner, 3-stage progress card, 5 skill module cards.

## 5. File changes

### Modified

| Path | Change |
|---|---|
| `app/page.tsx` | When `language === 'dutch'`, replace the current home layout with: Doel banner ("Inburgeringsexamen B1 + KNM"), 3-stage A1/A2/B1 milestone card with progress, 5 skill cards (KNM live, 4 placeholder "binnenkort") |
| `components/dutch-welcome-modal.tsx` | Rewrite copy: exam-prep mission, what each skill covers, expected timeline |
| `components/design/moments.ts` | Add Dutch lines: `knmAttemptComplete`, `knmPassed`, `a2Milestone`. Add corresponding MOMENTS entries |
| `CONTENT.md` | New "Dutch Exam-Prep" section: target exam, framework, sources, content inventory |
| `lib/dutch/lessons.ts` | (No structural change; just keep existing lesson loaders intact) |
| `lib/language-context.tsx` | (No change in Phase 1; future phases may add `examTarget` to config) |

### New

| Path | Purpose |
|---|---|
| `content/dutch/knm.json` | 100 KNM questions (Dutch text + 4-option MCQ + correct index + English explanation + category). Schema below. |
| `app/dutch/knm/page.tsx` | KNM module home: 6 category cards (Politiek / Werk / Onderwijs / Wonen / Gezondheid / Geschiedenis) for study mode + a "Start drill" CTA for 30-question mock |
| `app/dutch/knm/drill/page.tsx` | 30-question runner: progress bar, per-question feedback, score screen, attempt history saved |
| `lib/dutch/knm.ts` | `getKnmQuestions()`, `drawDrillSet(count = 30)`, `scoreAttempt(answers)`, `saveAttempt(...)`, `getAttemptHistory()`, `getPassRate()` |
| `lib/dutch/exam-target.ts` | `getExamTarget(): 'a2' \| 'b1'`, `setExamTarget(t)`. localStorage key `dutch-exam-target` |

### Deleted

None.

## 6. KNM data model

`content/dutch/knm.json`:

```ts
{
  questions: [
    {
      id: 'knm-001',
      category: 'politiek' | 'werk' | 'onderwijs' | 'wonen' | 'gezondheid' | 'geschiedenis',
      question_nl: string,                 // The question in Dutch
      options_nl: [string, string, string, string],
      correct_index: 0 | 1 | 2 | 3,
      explanation_en: string,              // Why this is correct (in English for learning)
      references?: string[]                // e.g. ["Naar Nederland Ch. 3"]
    },
    // ... 100 entries
  ]
}
```

**Distribution:** roughly 17 questions per category (3 categories get 17, 3 get 16 = 99; +1 spillover to politiek = 100).

**Authoring approach:** drafted by Claude (the implementing agent) using knowledge of the Naar Nederland handbook + DUO practice exam topics. Original wording — not lifted verbatim from any copyrighted source. User spot-checks against current DUO practice tests before relying on the pass-logic.

## 7. KNM module behavior

### Study mode (`/dutch/knm/`)

- 6 category cards (one per `category` enum value).
- Tap a category → list of questions in that category as scrollable cards.
- Each card shows: Dutch question, all 4 options, correct answer highlighted in mint, English explanation below.
- Per-question "learned" toggle — saves to `dutch-knm-learned` localStorage Set<string> (question IDs).
- Progress per category: "16/17 learned" displayed on the category card.

### Drill mode (`/dutch/knm/drill/`)

- On mount: `drawDrillSet(30)` — random 30 questions from pool, balanced across categories where possible.
- Question runner: shows one Q at a time, 4 options as tappable Sticker cards (mirrors `/quiz` UX).
- After each answer: green/red sticker reveal + brief English explanation, 1.2s auto-advance.
- Final score screen:
  - **Pass (≥80% = 24/30)**: Chaina `knmPassed` moment + confetti + "Geslaagd! 🎉 X / 30" stat sticker. Played sound: `levelup`.
  - **Fail (<80%)**: Chaina `knmAttemptComplete` (encouraging, not celebratory) + "X / 30 — bijna! Try again." Played sound: `complete`.
- Attempt saved to `dutch-knm-attempts` localStorage: `Array<{ ts: number, score: number, total: 30, passed: boolean }>`.
- Last 10 attempts visible in a fold-out section on the KNM module home.

## 8. Dutch home page reorientation

Replace the current Dutch home (which mirrors Hindi situations + foundations tabs) with:

```
┌─────────────────────────────────────────────┐
│  Hi, {name}                  [search] [🔊]  │
│  🇳🇱 Doel: Inburgeringsexamen B1 + KNM      │  ← peach Sticker banner
│  [streak chip]                              │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐    │
│  │  Jouw pad                           │    │  ← 3-stage path Sticker
│  │  ① A1 ████████░░  (8/10 done)       │    │
│  │  ② A2 ░░░░░░░░░░  (locked at A1≥80%)│    │
│  │  ③ B1 ░░░░░░░░░░  (locked at A2≥80%)│    │
│  └─────────────────────────────────────┘    │
├─────────────────────────────────────────────┤
│  Examen-vaardigheden  (Exam skills)         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │   KNM    │ │  Lezen   │ │ Luisteren│    │
│  │ 17/100   │ │ binnenkort│ │ binnenkort│   │
│  └──────────┘ └──────────┘ └──────────┘    │
│  ┌──────────┐ ┌──────────┐                  │
│  │ Schrijven│ │  Spreken │                  │
│  │binnenkort│ │binnenkort│                  │
│  └──────────┘ └──────────┘                  │
├─────────────────────────────────────────────┤
│  Lessen & Grammatica  (kept as-is)          │
│  [existing lesson + foundation list]        │
└─────────────────────────────────────────────┘
```

- The Doel banner is a peach Sticker with the Dutch flag motif.
- The "Jouw pad" card shows three stage rows with progress bars as **read-only progress indicators** (not content gates). **A1 progress** = (lessons + foundations completed in level A1) / total A1 items. Each existing lesson + foundation gets a level tag via the `lib/dutch/level-map.ts` lookup. **No hard locking** — all content remains accessible from the Lessen & Grammatica list; the stage card just visualises where you are.
- The 5 skill cards: KNM has live progress count + "Start" CTA, the other 4 say "binnenkort" (coming soon) and are visually dimmed but tappable to show a "Coming in Phase N — voor nu, focus op KNM" message.
- The existing Lessons & Grammar list stays below as supplementary content. The two tabs (Situations/Foundations) collapse into one "Lessen & Grammatica" section.

Hindi home page is **untouched** — this reorientation only applies when `language === 'dutch'`.

## 9. Welcome modal copy update

Current welcome modal (`components/dutch-welcome-modal.tsx`): first-time Dutch users see a generic "Hallo! Welcome to Dutch!" intro.

New copy:

> **Hallo! Klaar voor je inburgeringsexamen?**
>
> This Dutch track is built to prep you for the **Inburgeringsexamen B1 + KNM** — the exam HSM holders take to naturalize and get a Dutch passport.
>
> You'll cover all 5 exam skills:
> - **KNM** — knowledge of Dutch society (live now)
> - **Lezen** (Reading), **Luisteren** (Listening), **Schrijven** (Writing), **Spreken** (Speaking) — *binnenkort*
>
> Target level: **B1** (covers both A2 + B1 exam variants — toggle in settings if you want A2-only).
>
> Tip: book your exam date on **inburgeren.nl** before you start. A deadline focuses the mind.
>
> [Start with KNM]   [Browse all]

## 10. Chaina moments (Dutch additions)

In `components/design/moments.ts`, add 3 new entries:

**`knmAttemptComplete`** (non-celebratory, encouraging):
```ts
lines: [
  { main: 'goed bezig!', caption: 'oefenen blijft loon', speak: 'Goed bezig! Oefenen blijft loon.' },
  { main: 'niet slecht', caption: 'volgende keer beter', speak: 'Niet slecht. Volgende keer beter.' },
]
```

**`knmPassed`** (celebratory, fires on ≥80%):
```ts
lines: [
  { main: 'Geslaagd! 🎉',        caption: 'goed gedaan!',  speak: 'Geslaagd! Goed gedaan!' },
  { main: 'top!',                 caption: 'examen-klaar',  speak: 'Top! Examen klaar.' },
]
```

**`a2Milestone`** (fires when A1 stage completes, prompting A2 vs continue-to-B1 decision):
```ts
lines: [
  { main: 'A2 bereikt!', caption: 'klaar voor het examen of door naar B1?', speak: 'A2 bereikt! Klaar voor het examen, of door naar B1?' },
]
```

All three use the standard moment frame (anchor: `bottom-right`, mood: `wave`/`happy`, voice: true). The `a2Milestone` moment also opens a small action sheet with two buttons: `Book the exam` (opens inburgeren.nl in a new tab) / `Continue to B1` (dismisses).

## 11. Settings: Exam target toggle (A2 vs B1)

Add a small section to the Dutch welcome modal (and surface it later in `/progress` for permanent access):

```
Examen-doel
  ( ) A2  — basic, faster path
  (●) B1  — full coverage, future-proof  (default)
```

Stored in `dutch-exam-target` localStorage. Used by future mock exams to set difficulty; **no effect on KNM** (the KNM pool is the same regardless of level).

## 12. CONTENT.md additions

New section after the Hindi inventory:

```markdown
## Dutch — Exam-Prep Track (Inburgeringsexamen B1 + KNM)

### Target exam
Inburgeringsexamen B1 + KNM. HSM holders need this (or equivalent) to naturalize for the Dutch passport.

### Strategic framework
A1 (months 1-2) → A2 (months 3-5) → B1 (months 6-9). A2 = optional stop-out (settings toggle).

### Content inventory
| Track | Status | Notes |
|---|---|---|
| Lessons (A1-A2) | 5 existing | supermarket, introductions, cafe, doctor, transport |
| Foundations (A1-A2) | 7 existing | numbers, pronunciation, present, de/het, word-order, past, modals |
| KNM | 100 questions, 6 categories | Phase 1 (this spec) |
| Lezen | not yet | Phase 2 |
| Luisteren | not yet | Phase 3 |
| Schrijven | not yet | Phase 4 |
| Spreken | not yet | Phase 5 |
| Mock exam | not yet | Phase 6 |

### Canonical sources
- **DUO oefenen.nl** — official practice + answer keys. Primary KNM reference.
- **inburgeren.nl** — official 38-video KNM series.
- **Naar Nederland handbook** (free PDF) — the inburgering spine.
- **"Nederland en je rechten"** — KNM reference book.
- **TaalCompleet** textbook series — A1→B1.
- **Bart de Pau "Learn Dutch"** YouTube — 1000-words course.
- **Marlou Lemmens "Learn Dutch with Marlou"** — A1→B1 videos.
- **NedLes** YouTube — KNM-focused.

### Authoring approach for KNM
Questions are written from scratch using knowledge of the Naar Nederland material — NOT copied from copyrighted DUO sources. User spot-checks against current DUO practice tests before relying on pass-logic.
```

## 13. Out of scope (later specs)

- **Lezen / Luisteren / Schrijven / Spreken modules** (Phases 2-5). Each gets its own spec + plan + ship cycle.
- **A2/B1 lesson + foundation expansion** — the existing 5 lessons + 7 foundations stay as-is. Adding more A1/A2/B1 lessons is a separate content-cycle.
- **Native Dutch audio recordings** — Browser TTS for now (Phase 3 Luisteren may need real audio).
- **Voice-grading for Spreken** — extends `/practice/` infra later.
- **Full mock exam mode** (Phase 6).
- **Removing or hiding the Hindi section** — Hindi work stays untouched.
- **Notification reminders for daily KNM practice** — existing notification infrastructure may surface this naturally; no new code in this spec.
- **Tagging existing lessons with `level: 'A1' | 'A2' | 'B1'`** — Phase 1 hardcodes the level mapping in `lib/dutch/level-map.ts` (simple lookup table) so the JSON files stay untouched.

## 14. Validation

After Phase 1 ships:
- All existing tests pass (`npx vitest run`).
- `npx tsc --noEmit` clean.
- `node scripts/lint-design.mjs` clean.
- New unit tests: `lib/dutch/knm.test.ts` (loading, drawDrillSet randomness/balance, scoreAttempt, pass-threshold logic). At least 8 tests.
- Open the app in incognito with `language=dutch` → Dutch welcome modal shows new copy → "Start with KNM" navigates to `/dutch/knm/`.
- KNM home shows 6 category cards + Drill CTA + attempt history (empty initially).
- Tap a category → study cards render with Dutch + options + correct answer + English explanation.
- Start drill → 30 questions render, scoring works, ≥80% triggers `knmPassed` Chaina moment + confetti, <80% triggers `knmAttemptComplete`.
- Attempt history populates correctly across drill sessions.

## 15. Risks / open considerations (not blocking)

- **KNM question authenticity** — drafted from my knowledge, NOT from current DUO official questions (which are copyrighted). Real exam questions may use slightly different phrasings or test different facts. User should spot-check against a current DUO practice exam before treating pass-logic as authoritative.
- **B1 requirement uncertainty** — naturalization level (A2 vs B1) depends on IND policy at the time of application. App is built for B1; toggle exists for A2. User must verify with IND directly before booking.
- **No native Dutch audio in Phase 1** — KNM is text-only, so no audio gap. Luisteren (Phase 3) will need audio.
- **5 existing lessons may not all map cleanly to A1/A2/B1** — best-effort tagging in `level-map.ts`; user can tweak.

## 16. Open questions

None — all settled in brainstorming.
