# Foundation Chapters v2 — Interactive Page Deck — Design

**Status:** approved 2026-05-26
**Repo:** `abhinav-kipper/learn-hindi`
**Builds on:** `2026-05-26-foundation-theory-chapters-design.md`

## 1. Goal

The v1 textbook chapter (just shipped) was structurally correct but read as a static wall of text. User feedback: boring. Convert it into an **interactive paged deck** that combines:
- **A.** Swipe-paginated pages (one section = one page, top progress dots, slide transitions)
- **B.** Cutting narrates each page (speech bubble with conversational opening line)
- **C.** Quick-check micro-quiz at the bottom of each section page (gates advancement — must answer correctly to swipe forward)
- **D.** Animations: page transitions, Cutting reactions, confetti on quick-check pass, highlight pulses on key examples

Pilot stays `07-noun-gender`. Apply the v2 treatment to the same chapter content; other foundations beefed up in follow-ups will inherit the new format.

## 2. Schema additions

Extend the v1 schema (additive only — v1 chapters still render in v2 with the quick-check / cutting_intro fields omitted):

```ts
export interface QuickCheck {
  question: string
  options: string[]          // 2-4 options
  correct_index: number
  explanation?: string       // shown on reveal after correct answer
}

export interface TheorySection {
  heading: string
  body: string
  table?: TheoryTable
  examples?: TheoryExample[]
  callout?: TheoryCallout
  cutting_intro?: string     // NEW — what Cutting says when this section opens (1 sentence)
  quick_check?: QuickCheck   // NEW — optional gate question
}

// Theory + Lesson interfaces unchanged.
```

## 3. UI shape — paged deck

### Page structure

For a chapter with N sections, the deck has **N + 2** pages:

| Page index | Content | Quick-check? |
|---|---|---|
| 0 | Intro: chapter title + Cutting welcome speech + theory.intro paragraph + "let's go →" CTA | no |
| 1..N | Section page: top Cutting speech bubble (cutting_intro) + heading + body paragraphs + optional table/examples/callout + optional quick_check | yes (if section.quick_check defined) |
| N+1 | Wrap-up: theory.wrap_up + final Cutting cheer + "got it — try the phrases →" CTA (this CTA fires onStartPhrases) | no |

### Per-section page layout (top to bottom)

```
┌──────────────────────────────────────────┐
│  ← Back         ● ● ● ○ ○ ○ ○   1/7      │  ← progress dots + counter
├──────────────────────────────────────────┤
│  [Cutting mascot]                         │
│       └→  "Hindi has two genders.        │  ← Cutting speech bubble (right pointing)
│            Let's look at how to spot     │     speech opens with cutting_intro
│            them..."                       │
├──────────────────────────────────────────┤
│                                          │
│  ## Section heading                      │
│                                          │
│  Body paragraph one.                     │
│                                          │
│  Body paragraph two.                     │
│                                          │
│  [optional table]                        │
│  [optional examples]                     │
│  [optional callout]                      │
│                                          │
├──────────────────────────────────────────┤
│  QUICK CHECK                             │  ← gate component
│  Is `ladki` masculine or feminine?       │
│  [ masculine ] [ feminine ]              │
│  (after correct → confetti + explanation │
│   + next button unlocks)                 │
├──────────────────────────────────────────┤
│  ← prev                next →            │  ← bottom nav (next gated until quick-check ✓)
└──────────────────────────────────────────┘
```

### Navigation

- Swipe-left / swipe-right gestures (Framer Motion `drag="x"` with snap thresholds) advance pages
- Right-edge tap also advances (no quick-check section needs to be tapped to advance)
- Bottom `← prev` and `next →` pill buttons
- `next →` is disabled until quick-check (if present) is answered correctly
- Pages with no quick-check (intro, wrap-up, sections without `quick_check`) advance freely

### QuickCheck behavior

- Renders inside section page after the main content, before the bottom nav
- Question + 2-4 option pills (Sticker-style)
- Tap correct → mint-pulse animation on the option + `playSound('correct')` + Confetti shower (small, contained) + reveals `explanation` if provided + unlocks `next →`
- Tap wrong → shake animation on the option + `playSound('wrong')` + option fades to muted state; user can retry (any of the other options remain tappable)
- Once correct, all options lock; the explanation block stays visible

### Cutting narration

- Each section page renders a `<CuttingSpeech>` block at top
- Cutting (100px size) on left, speech bubble (white Sticker with triangular tail) on right with `cutting_intro` text
- If section lacks `cutting_intro`, derive a generic version: `"now let's look at ${section.heading}."`
- Cutting mood varies per page index to feel alive: intro → wave, section pages → happy / idle / wink (rotates), wrap-up → excited

### Animations

- **Page transitions:** AnimatePresence with `mode="wait"`. Exiting page slides left + fades; new page slides in from right (or reverse for `prev`)
- **Cutting entrance:** `motion.div` with `initial={{ opacity: 0, x: -20 }}` `animate={{ opacity: 1, x: 0 }}` `transition={{ delay: 0.15 }}`
- **Speech bubble:** pops with `scale: [0, 1.08, 1]`, slight delay after Cutting
- **Quick-check correct:** chosen option scales to 1.1 then back, mint-green pulse, Confetti pours from top (existing Confetti component, contained to the QuickCheck area via wrapping div)
- **Quick-check wrong:** chosen option does a shake (`x: [-6, 6, -4, 4, 0]` over 0.4s), then fades to 0.5 opacity
- **Progress dots:** new dot fills with a quick scale-bounce when page advances

## 4. Files

### Modified
| Path | Change |
|---|---|
| `types/lesson.ts` | Add `QuickCheck` interface. Add `cutting_intro?: string` and `quick_check?: QuickCheck` to `TheorySection`. |
| `content/foundations/07-noun-gender.json` | Add `cutting_intro` (1 per section, 5 total) and `quick_check` (1 per section, 5 total) inside each section. |
| `components/lesson/TheoryView.tsx` | Rewrite as paged deck. Add inline `QuickCheckBlock` + `CuttingSpeech` sub-components. AnimatePresence transitions. Bottom nav. Progress dots. |
| `__tests__/components/theory-view.test.tsx` | Update tests: progress dots render, navigation between pages, quick-check gates next button until correct, Cutting speech renders, CTA on final page fires onStartPhrases. |

### New
None — keep everything inside the same TheoryView.tsx file (sub-components inline).

### Deleted
None.

## 5. Verbatim Noun Gender additions

Each of the 5 sections in `07-noun-gender.json` gets these fields added:

### Section 1: "The two genders"
```json
"cutting_intro": "Hi! Let's start simple. Every Hindi noun has a gender — and it changes everything else in the sentence. Watch.",
"quick_check": {
  "question": "How many grammatical genders does Hindi have?",
  "options": ["Two — masculine and feminine", "Three — masculine, feminine, neuter", "One — gender doesn't matter"],
  "correct_index": 0,
  "explanation": "Hindi has only two — masculine and feminine. No neuter at all."
}
```

### Section 2: "Spot the pattern from the ending"
```json
"cutting_intro": "Now — most nouns hint at their gender through their ending. Pattern works ~75% of the time. Let's see the pattern.",
"quick_check": {
  "question": "A noun ending in `-i` like `ladki` or `kursi` is usually...",
  "options": ["masculine", "feminine", "depends on the word"],
  "correct_index": 1,
  "explanation": "Yes! `-i` / `-ii` ending = usually feminine. Patterns aren't 100% (aadmi is the famous exception) but it's your best first guess."
}
```

### Section 3: "Adjective agreement"
```json
"cutting_intro": "Here's where it ripples outward. Adjectives ending in -aa change to match the noun's gender. Like clothes, the adjective dresses up to match.",
"quick_check": {
  "question": "Which adjective form goes with `chai` (feminine)?",
  "options": ["acchaa chai", "acchhi chai", "acchhe chai"],
  "correct_index": 1,
  "explanation": "Correct! `chai` is feminine, so the -aa adjective shifts to -i. acchhi chai = good tea."
}
```

### Section 4: "Verb agreement (the harder bit)"
```json
"cutting_intro": "Heads up — this one trips up every English speaker. In some past-tense constructions, the VERB tracks the OBJECT's gender, not the subject's.",
"quick_check": {
  "question": "`Maine roti khaayi.` Why does the verb end in `-i`?",
  "options": ["Because the speaker (main) is feminine", "Because the object (roti) is feminine", "It's just how past tense works"],
  "correct_index": 1,
  "explanation": "Yes! With `ne`, the verb agrees with the OBJECT's gender. `roti` is feminine, so the verb ends in -i. The speaker could be any gender — it doesn't matter."
}
```

### Section 5: "Gendering English loanwords"
```json
"cutting_intro": "Real-life Hindi mixes English words all the time. Speakers assign gender on instinct, tracking a similar Hindi noun. Want to guess?",
"quick_check": {
  "question": "What gender does Hindi typically assign to the English word `car`?",
  "options": ["masculine", "feminine"],
  "correct_index": 1,
  "explanation": "Feminine — it tracks `gaadi` (vehicle, feminine). Same for `bus` and other vehicles. Tech words like computer / mobile go masculine instead."
}
```

The intro page also gets a Cutting greeting line (rendered in TheoryView, not stored in JSON):
> *"Welcome to your first textbook chapter! I'm Cutting — I'll walk you through this one. Tap when you're ready..."*

(implementation detail: this is a constant string in TheoryView, not a content field, since it's the same on every chapter)

## 6. Lock / unlock logic

```ts
type PageState = {
  index: number              // current page
  quickCheckPassed: boolean[] // per-page; true if no quick_check on that page
}

function canAdvance(state: PageState, theory: Theory): boolean {
  const totalPages = theory.sections.length + 2  // intro + sections + wrap-up
  if (state.index >= totalPages - 1) return false  // last page = no next
  // If current page is a section page with a quick_check, must have passed
  const sectionIdx = state.index - 1  // section 0 is at page 1
  if (sectionIdx >= 0 && sectionIdx < theory.sections.length) {
    const sec = theory.sections[sectionIdx]
    if (sec.quick_check && !state.quickCheckPassed[state.index]) return false
  }
  return true
}
```

Quick-check pass state is held in component state (not persisted across reloads). If user re-opens the chapter, they'll re-answer the quick-checks. That's intentional — passing the check IS the engagement beat. Persisting it would dull the interaction.

## 7. Out of scope

- Letter-morph animations (acchaa → acchhi as live character transform) — too complex; defer. We may add a simple highlight-pulse on `-aa` endings in the adjective-agreement examples but not full morphing.
- Drag-to-match buckets (proposed direction D) — defer to v3 if needed. Tap-to-answer is sufficient for MVP.
- Persisting quick-check pass state across reloads — intentional re-engagement on revisit.
- Audio narration of theory paragraphs — already deferred from v1.
- Quick-checks on intro or wrap-up pages — only section pages.
- More than 1 quick-check per section.
- Backwards-compat with v1 lessons that have no `cutting_intro` / `quick_check` — they still render via the default fallback (generic Cutting intro, no quick-check gate, all next buttons enabled).

## 8. Validation

- `npx tsc --noEmit` clean
- `npx vitest run` — all 278 existing tests still pass + updated TheoryView tests (target ~10 cases including: renders intro page, renders section pages, progress dots count, next button disabled while quick-check unanswered, correct answer unlocks next, wrong answer can retry, swipe-left advances, CTA on wrap-up fires onStartPhrases, Cutting speech bubble renders with section's cutting_intro)
- `node scripts/lint-design.mjs` clean
- Manual: open Noun Gender → see intro page with Cutting greeting + chapter intro paragraph + "let's go →" CTA → swipe right → land on section 1 with Cutting saying "Hi! Let's start simple..." + heading + body + table + examples + quick-check → answer correctly → confetti + next unlocks → swipe through all 5 sections → land on wrap-up page → tap "got it — try the phrases" → enter phrase carousel. Mark complete still gated on revealing every phrase.

## 9. Open questions

None — settled.
