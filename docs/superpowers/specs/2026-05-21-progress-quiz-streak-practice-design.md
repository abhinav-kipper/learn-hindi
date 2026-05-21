# Progress + Quiz + Streak + Practice-Complete — Design

**Date:** 2026-05-21
**Status:** Approved
**Scope:** Four user-facing improvements to hindi-app, implemented as a single batch.

## Goals

1. **Phrase-level lesson progress** — replace binary (0% / 100%) with per-phrase tracking.
2. **Vocabulary in quizzes** — mix vocab words (30%) with lesson phrases (70%).
3. **Streak calendar correctness** — fix day-label indexing, DST drift, and add a "pending today" visual state.
4. **Practice completion moment** — a Finish button + celebration overlay that closes the loop on practice sessions and also fixes two latent bugs (no streak credit, inflated practice count).

## Non-goals

- True interval-based SRS (separate future work).
- Onboarding `reason` personalization.
- Notifications wiring.
- Mobile/desktop responsive overhaul.

## Section 1 — Phrase-level progress

### Data model

New localStorage key: `hindi-phrase-progress` → `Record<lessonId, number[]>` (viewed phrase indices, deduplicated, order doesn't matter).

### New module: `lib/phrase-progress.ts`

```ts
export function markPhraseViewed(lessonId: string, phraseIndex: number): void
export function getViewedPhrases(lessonId: string): number[]
export function getLessonPercent(lesson: Lesson): number
```

`getLessonPercent` returns `100` if the lesson is in `progress.completedLessons` (back-compat for lessons completed before this feature), else `round(viewed.length / lesson.phrases.length * 100)`.

### Wiring

1. **`components/lesson-flow/swipeable-carousel.tsx`** — add optional `onIndexChange?: (index: number) => void` prop. Fire on mount with index 0, then on every navigation (next/prev/drag).
2. **`components/lesson-flow/section-phrases.tsx`** — pass an `onIndexChange={(i) => markPhraseViewed(lessonId, i)}` callback into the carousel. Will need `lessonId` prop added (currently it only receives phrases/notes).
3. **`components/lesson-flow/lesson-flow.tsx`** — pass `lessonId` down to `<SectionPhrases>`.
4. **`app/progress/page.tsx`** — replace `isComplete ? '100%' : '0%'` with `getLessonPercent(lesson)`. Bar fill width uses the same percent.

### Open question (resolved at implementation time)

Home lesson cards (`components/lesson-card.tsx`) — leave alone for v1 unless trivially small. Progress page is the canonical place users check progress.

## Section 2 — Vocabulary in quizzes

### Helper: `getExploredVocabWords()` in `lib/vocabulary.ts`

Returns `VocabWord[]` — flattens all categories, includes only words that appear in the `hindi-vocab-learned` localStorage record (i.e., user has tapped/flipped at least once).

### Type extension in `types/quiz.ts`

Add optional `source: 'phrase' | 'vocab'` to `QuizQuestion`. Default `'phrase'` for back-compat.

### `lib/quiz.ts` — `generateQuiz` changes

1. Compute `vocabCount = Math.round(count * 0.3)` and `phraseCount = count - vocabCount`.
2. Fetch eligible vocab via `getExploredVocabWords()`. If fewer than 3 are available, set `vocabCount = 0` and `phraseCount = count` (preserves current behavior for fresh users).
3. Generate phrase questions as today.
4. Generate vocab questions reusing the existing generators, adapted:
   - `translate-to-english`: prompt = `word.hindi`, correct answer = `word.english`, distractors from other vocab words.
   - `translate-to-hindi`: inverse.
   - `context-match`: prompt = `word.example` (since vocab has no `context` field), correct = `word.hindi`, distractors = other vocab `hindi` strings.
   - `fill-in-blank`: **skipped for vocab** (single-word vocab entries don't decompose meaningfully).
5. Distractor pool: vocab questions draw distractors from other vocab words only; phrase questions from other phrases only. Keeps semantic level consistent.
6. Shuffle the combined array before returning.

### Internal data shape

Adapt vocab words to a shared `Targetable` interface inside `quiz.ts` so the existing generator helpers don't need duplication. `Targetable` has `prompt`, `answer`, `pool` slot (English variant) — kept private to the module.

## Section 3 — Streak calendar fix (in `app/progress/page.tsx`)

### Bug A — Day labels mis-indexed

Current:
```ts
const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']  // assumes Mon=0
const today = new Date().getDay()                       // but getDay() returns Sun=0
```

Fix: change array to `['S', 'M', 'T', 'W', 'T', 'F', 'S']` so `dayLabels[getDay()]` is correct (Sun→S, Mon→M, etc.).

### Bug B — DST drift

Current:
```ts
const daysDiff = Math.floor((lastActive.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
```

On spring-forward / fall-back days this can return one fewer/more day than calendar-correct.

Fix: compare `YYYY-MM-DD` strings directly. Build a `Set<string>` of all active dates (each `lastActiveDate - i` for `i in [0, currentStreak)`), then for each calendar column check `activeSet.has(dateStr)`.

```ts
// pseudo
const activeSet = new Set<string>()
if (progress.currentStreak > 0 && progress.lastActiveDate) {
  const last = new Date(progress.lastActiveDate)
  for (let i = 0; i < progress.currentStreak; i++) {
    const d = new Date(last)
    d.setDate(d.getDate() - i)
    activeSet.add(d.toISOString().split('T')[0])
  }
}
// For each calendar column, check activeSet.has(dateStr)
```

### Feature — Pending today visual state

When `lastActiveDate !== today`, the today column gets a distinct outlined style:
- Dashed border in accent color (`border-orange-300 border-dashed`)
- Empty fill (`bg-transparent`)
- Day letter in muted accent color

Active days keep filled orange. Inactive days keep empty grey. Today-pending is the third state.

Implementation: render-side branch on `dateStr === todayStr` and `!activeSet.has(dateStr)`.

## Section 4 — Practice complete moment (in `app/practice/[id]/page.tsx`)

### UI changes

- Replace the static `💬 Practice` chip with a **Finish** button (filled accent style, right-aligned in header).
- Button always visible. Disabled state if 0 user messages sent (prevents accidental no-op completion).

### Completion overlay

- Fullscreen modal (z-50 backdrop + centered card)
- Confetti burst (reuse the `canvas-confetti` setup from `section-cta.tsx`)
- Content:
  - Headline: `🎉 Nice practice!`
  - Stats line: "X messages exchanged"
  - Lesson title sub-line
- Buttons:
  - **Back to lesson** → router.push(`/lessons/${id}`)
  - **Home** → router.push('/')

### Side effects on Finish

In order:
1. `markLessonComplete(lessonId)` — gives lesson credit (fixes the long-standing gap where practice never marked completion)
2. `updateStreak()` — fixes streak-not-updated-by-lessons gap
3. `incrementPracticeCount()` — **moved here from the mount useEffect** (fixes inflation bug)

### Mount useEffect change

Remove the `incrementPracticeCount()` call from the mount effect. It now only runs on Finish.

## Migration considerations

- Existing `progress.completedLessons` users keep 100% via the back-compat branch in `getLessonPercent`.
- `hindi-phrase-progress` key starts empty for everyone — no migration needed.
- Quiz scores already include `lessonIds` but not vocab provenance; future quiz scores will mix sources transparently. Average computation unaffected.

## Testing

Existing tests in `__tests__/`:
- `lib/progress.test.ts` — unchanged (`markLessonComplete` semantics preserved).
- `lib/system-prompt.test.ts` — unchanged.

New tests:
- `lib/phrase-progress.test.ts` — `markPhraseViewed` dedupes, `getLessonPercent` respects completed back-compat and computes from viewed otherwise.
- `lib/quiz.test.ts` — `generateQuiz` produces ~30% vocab when enough are explored, falls back to all phrases when too few, never emits `fill-in-blank` for vocab source.
- Streak calendar tests are tricky (component test) — verify by manual smoke + unit-testing the active-set builder if extracted to a helper.

## Risks

- **Carousel onIndexChange firing on mount with index 0** could double-count if the user re-enters the lesson — fine, `markPhraseViewed` dedupes via array `.includes` check.
- **Quiz vocab pool size** — if user has explored ≥3 but <vocabCount vocab words, we'll have to either reduce `vocabCount` or allow repeats. Plan: clamp `vocabCount = min(vocabCount, exploredVocab.length)` and grow `phraseCount` accordingly.
- **Practice Finish without messages** — disabled state handles this; users can't accidentally complete an empty session.
