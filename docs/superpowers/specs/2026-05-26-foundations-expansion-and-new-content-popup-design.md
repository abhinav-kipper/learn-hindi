# Foundations Expansion + New-Content Surfacing — Spec

**Status:** approved 2026-05-26
**Repo:** `abhinav-kipper/learn-hindi`

## 1. Scope

Two thematically-linked features shipped together:

**Feature A — Foundations content expansion.** Backfill the empty `skill_breakdown` arrays on 6 existing Hindi foundations (01-numbers, 02-present-tense, 03-past-tense, 04-future-tense, 05-postpositions, 06-pronouns-verbs) and add 2 new foundations (`08-compound-verbs`, `09-ne-rule`).

**Feature B — "New content for you" surfacing.** When a user opens the app after new lessons have been added to the catalog, a Chaina moment fires (Hinglish, "arrey! naye lessons aaye hain") and a small chai-orange NEW dot appears on each unseen lesson/foundation card. Existing users get a silent baseline on first detection (no false-positive popup for content that has been there for weeks).

After this ships, Hindi foundations are fully fleshed out, and any future content addition automatically gets the popup + dots without further code changes.

## 2. Decisions (settled in brainstorming)

| Decision | Choice |
|---|---|
| Foundations scope | Backfill existing 6 + add 2 new (compound-verbs, ne-rule) |
| Popup format | Chaina moment + per-lesson NEW dots (both) |
| Existing-user migration | Silent baseline — on first localStorage detection, all current IDs marked seen; no popup fires |
| Tone | Hinglish + Chaina voice |
| Frequency cap | `once-per-session` (re-fires next session if unseen lessons still exist) |
| Storage scope | Per-language (`learn-hindi:seen-lesson-ids:<lang>`) so Dutch can use the same module later |
| Dot disappears | When user taps the lesson card (`markAsSeen` called from the card's onClick) |

## 3. Architecture overview

**Feature A** is pure content — JSON edits + register in `lib/foundations.ts`. No app code changes besides the new lesson registration.

**Feature B** has 4 small components:

```
lib/seen-lessons.ts             ← localStorage tracking module (new)
components/design/moments.ts    ← add `newContent` moment (modify)
app/page.tsx                    ← detection + play() on mount (modify)
components/design/LessonStickerCard.tsx (or wherever cards render)
                                ← NEW dot when id ∈ unseen (modify)
```

Data flows: home page mounts → reads `getUnseenIds(currentLessonIds + currentFoundationIds)` → if list empty or localStorage key absent (first ever) → `initBaseline()` and skip; else fire `play('newContent')` if frequency-cap allows. Card render checks `seenSet.has(id)` and conditionally renders the dot.

## 4. File changes

### Modified

| Path | Change |
|---|---|
| `content/foundations/01-numbers.json` | Add 3 `skill_breakdown` entries (counting/money/ordinals) |
| `content/foundations/02-present-tense.json` | Add 3 skill_breakdown entries (habitual/continuous/copula) |
| `content/foundations/03-past-tense.json` | Add 3 skill_breakdown entries (simple/habitual/continuous) |
| `content/foundations/04-future-tense.json` | Add 3 skill_breakdown entries (simple/obligation/promises) |
| `content/foundations/05-postpositions.json` | Add 3 skill_breakdown entries (basic/possessive/compound) |
| `content/foundations/06-pronouns-verbs.json` | Add 3 skill_breakdown entries (agreement/polite/gender) |
| `lib/foundations.ts` | Import + register `08-compound-verbs`, `09-ne-rule` |
| `components/design/moments.ts` | Add `newContent` lines + Moment entry |
| `app/page.tsx` | On mount: detect unseen → `play('newContent')` (+ initBaseline first-ever) |
| `components/design/LessonStickerCard.tsx` (or equivalent) | Optional `isNew?: boolean` prop → render dot |
| `CONTENT.md` | Update Foundations inventory: 7 → 9 lessons; row updates |

### New

| Path | Purpose |
|---|---|
| `lib/seen-lessons.ts` | localStorage-backed Set<string> + helpers |
| `content/foundations/08-compound-verbs.json` | New lesson: le lena / de dena / kar dena patterns |
| `content/foundations/09-ne-rule.json` | New lesson: ergative-past construction (maine khaaya, usne kaha) |

### Deleted

None.

## 5. Feature A details — Foundations content

### 5.1 Backfill schema

Every backfilled foundation gets `skill_breakdown: [{...}, {...}, {...}]` (3 entries) matching the schema in `scripts/generate-lesson.mjs`:

```ts
{
  skill: string,
  explanation: string,           // 1-2 sentences
  more_examples: { hindi, english }[3..5]
}
```

### 5.2 Backfill plan (per file)

**01-numbers** — `Counting basics` / `Money & quantities` / `Ordinals (pehla/dusra/tisra)`.

**02-present-tense** — `Present habitual (-ta hai)` / `Present continuous (-raha hai)` / `Copula (hai/hain) with adjectives`.

**03-past-tense** — `Simple past with -a/-i agreement` / `Past habitual (-ta tha)` / `Past continuous (-raha tha)`.

**04-future-tense** — `Simple future (-unga/-egi/-engi)` / `Obligation future (-na hai/padega)` / `Promises with pakka/zaroor`.

**05-postpositions** — `Basic postpositions (ko, se, mein, par)` / `Possessive (ka/ki/ke)` / `Compound postpositions (ke baare mein, ke saath, ke liye)`.

**06-pronouns-verbs** — `Pronoun-verb agreement` / `Polite forms (aap → -hain, tum → -ho, tu → -hai)` / `Gender agreement in verb endings`.

### 5.3 New foundations

**`08-compound-verbs.json`** — Topic: completion-compound verbs. References: Snell & Weightman Ch. 13. 10 phrases. Skills: `le lena (take up)`, `de dena (give over)`, `kar dena (do over)`, plus the politeness nuance these add. 3 skill_breakdowns.

**`09-ne-rule.json`** — Topic: the ergative `ne` marker for transitive perfectives. References: Snell & Weightman Ch. 12, Afroz Taj Lesson 8. 10 phrases. Skills: `ne marker on perfective subjects`, `object agreement (verb agrees with object, not subject)`, `compound exceptions`. 3 skill_breakdowns.

Both follow the existing schema (validated by Zod in `scripts/generate-lesson.mjs`).

## 6. Feature B details — New-content surfacing

### 6.1 `lib/seen-lessons.ts` API

```ts
const STORAGE_KEY = 'learn-hindi:seen-lesson-ids:hindi'  // per-language

/** Returns the persisted set, or null if never initialized (first-ever launch). */
function readSeenSet(): Set<string> | null

/** Persist the set. */
function writeSeenSet(set: Set<string>): void

/** First-ever launch: silently mark all current IDs as seen so no false-positive popup. */
export function initBaseline(allCurrentIds: string[]): void

/** Add one ID. */
export function markAsSeen(id: string): void

/** Returns IDs from allCurrentIds that are NOT in the seen set. Returns [] if uninitialized. */
export function getUnseenIds(allCurrentIds: string[]): string[]

/** Pure read — true if id has been seen. Returns false if uninitialized (safe default for cards). */
export function hasBeenSeen(id: string): boolean
```

SSR-safe: every function guards `typeof window === 'undefined'`. Returns sensible defaults (empty set / false) on server.

### 6.2 `newContent` moment

In `components/design/moments.ts`:

```ts
// Add to LINES object:
newContent: [
  { main: 'arrey! naye lessons aaye hain', caption: 'try karke dekho ✨', speak: 'Arrey, naye lessons aaye hain. Try karke dekho.' },
  { main: 'kuch naya hai!', caption: 'check karo 👋',                    speak: 'Kuch naya hai. Check karo.' },
  { main: 'naya content unlocked',         caption: 'mazaa aayega',     speak: 'Naya content unlocked. Mazaa aayega.' },
],

// Add to MOMENTS object:
newContent: {
  label: 'New content available',
  when: 'New lessons added since last detection',
  anchor: 'bottom-right',
  enter: 'peek-up-right', enterMs: 700, holdMs: 3400, exit: 'dismiss-down', exitMs: 600,
  mood: 'wave', moodAnim: 'wave-tilt 1.2s ease-in-out 2',
  bubbleTail: 'bottom-right', bubbleSide: 'left',
  voice: true, lines: LINES.newContent, sizePct: 0.34,
},
```

Anchor matches `welcomeBack` — non-blocking corner peek. Sizing matches.

### 6.3 `app/page.tsx` integration

Inside the existing mount effect (the one that already handles `welcomeBack` / `firstOpenToday`):

```tsx
import { initBaseline, getUnseenIds } from '@/lib/seen-lessons'

// After existing welcomeBack/firstOpenToday logic:
const allIds = [...allLessons.map(l => l.id), ...allFoundations.map(f => f.id)]
const hadKey = typeof window !== 'undefined'
             && localStorage.getItem('learn-hindi:seen-lesson-ids:hindi') !== null
if (!hadKey) {
  initBaseline(allIds)               // silent baseline, no popup
} else {
  const unseen = getUnseenIds(allIds)
  if (unseen.length > 0 && canFire('newContent', 'once-per-session')) {
    play('newContent')
    markFired('newContent', 'once-per-session')
  }
}
```

Order: this check runs AFTER welcomeBack/firstOpenToday — those moments take priority on a returning-user session. The `once-per-session` cap on `newContent` prevents stacking.

### 6.4 NEW dot on cards

Modify the lesson-card component that renders on the home page (likely `LessonStickerCard` from the design system; if not, the inline card render in `app/page.tsx`). Add an `isNew?: boolean` prop:

```tsx
{isNew && (
  <span
    aria-label="new"
    className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--chai-orange)]"
  />
)}
```

Tailwind / inline styles per existing pattern. Use `COLORS.accent` or whatever the chai-orange token is in the design system. 8px solid dot, no border.

In the home page's card-mapping, pass `isNew={!hasBeenSeen(lesson.id)}`. When user taps the card, call `markAsSeen(lesson.id)` before navigating (so the dot is gone on back-navigation).

### 6.5 Behavioral edge cases

- **First-ever launch (no localStorage key)**: `initBaseline` runs silently. No popup, no dots. From this moment forward, only NEW additions trigger anything.
- **Returning user, no new content**: `getUnseenIds` returns `[]`. No popup. No dots.
- **Returning user, new content added**: Popup fires once per session. Dots show on each unseen card. User taps a card → that dot disappears. Closes app, reopens → popup re-fires only if any cards still have dots.
- **User dismisses popup but doesn't open new lessons**: Next session, popup fires again. Indefinite reminder.
- **User opens all new lessons**: `getUnseenIds` returns `[]`. No more popup, no more dots. Returns to steady state.
- **localStorage cleared mid-session**: `initBaseline` runs on next load. Effectively treats user as "new" but silently — no spam.

## 7. CONTENT.md inventory update

- Foundations section header: "7 lessons" → "9 lessons".
- Add 2 rows to the foundations inventory table for `08-compound-verbs` and `09-ne-rule`.
- Add a note under "Resolved" that the foundations `skill_breakdown` gap is now closed for Hindi (Dutch still pending).

## 8. Out of scope

- Dutch foundations expansion (same module + pattern, separate session).
- Cohort-aware copy ("3 new lessons this week" with count). The popup is generic.
- A standalone "What's new" page listing recent additions. The popup + dots are sufficient discovery.
- Push notifications (no push infrastructure; in-app only).
- Analytics on popup dismissal / lesson-tap correlation (`analytics.ts` tracks neither, and adding it is YAGNI for now).
- Animating the NEW dot (pulse / glow). Static dot for now.

## 9. Validation

After this ships:
- All existing tests pass (`npx vitest run`).
- `npx tsc --noEmit` clean.
- `node scripts/lint-design.mjs` clean.
- Open `/` in incognito (fresh localStorage) → `initBaseline` runs, no popup. Verify localStorage key is set.
- Open `/` with localStorage key present + a deliberately-removed lesson ID → popup fires, dots show. Dismiss popup. Tap a "new" card → dot disappears. Refresh page (same session) → popup does NOT re-fire (once-per-session). Close & reopen tab → popup fires again.
- Foundations tab shows 9 cards (was 7). All 6 backfilled foundations have `skill_breakdown` populated when opened.

## 10. Open questions

None — all settled in brainstorming.
