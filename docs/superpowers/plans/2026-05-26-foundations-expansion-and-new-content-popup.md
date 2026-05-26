# Foundations Expansion + New-Content Surfacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Backfill Hindi foundations' empty `skill_breakdown` arrays, add 2 new foundation lessons (compound-verbs, ne-rule), and add a "new content for you" surfacing layer (Chaina moment + per-lesson NEW dots) that automatically activates whenever future content lands.

**Architecture:** Feature A is pure content (edit existing 6 JSON files, create 2 new ones, register in `lib/foundations.ts`). Feature B adds a new `lib/seen-lessons.ts` tracking module, a new `newContent` Chaina moment, wires detection into `app/page.tsx`, and modifies `LessonStickerCard` to render a NEW dot. Existing users get a silent baseline so no false-positive popup fires.

**Tech Stack:** TypeScript/Next.js 16, Vitest (for tests), localStorage (for tracking), Framer Motion (existing Chaina moments).

**Spec:** `docs/superpowers/specs/2026-05-26-foundations-expansion-and-new-content-popup-design.md`
**Repo:** `abhinav-kipper/learn-hindi`, branch: `main` (user has authorized working on main)

---

## Reference paths

- `content/foundations/*.json` — 7 existing foundations; 01-06 have empty `skill_breakdown: []`; 07-noun-gender is the gold-standard reference for a fully populated lesson.
- `lib/foundations.ts` — imports + registers each foundation (parallel of `lib/lessons.ts`).
- `lib/seen-lessons.ts` — NEW, the tracking module.
- `components/design/moments.ts` — Chaina moments registry. `LINES` object + `MOMENTS` object.
- `components/design/LessonStickerCard.tsx` — card component used by both lessons + foundations.
- `components/design/chainaFrequency.ts` — already exports `canFire(key, mode)` + `markFired(key, mode)`. Use `'once-per-session'` mode.
- `app/page.tsx` — home page, mounts the welcomeBack/firstOpenToday Chaina checks. Add new-content check after those.
- `CONTENT.md` — Foundations inventory section + section header.

Foundation schema (same as Lesson schema in `scripts/generate-lesson.mjs:86-98`):
```ts
{
  id, title, situation, skills,
  phrases: { hindi, english, context, pronunciation }[],
  grammar_notes: string[],
  culture_notes: string[],
  skill_breakdown: { skill, explanation, more_examples: {hindi,english}[3..5] }[2..3],
  practice_prompt,
  references: string[]
}
```

---

## Task 1: Create lib/seen-lessons.ts with TDD

**Files:**
- Create: `lib/seen-lessons.ts`
- Create: `lib/seen-lessons.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `/home/user/learn-hindi/lib/seen-lessons.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import {
  initBaseline,
  markAsSeen,
  getUnseenIds,
  hasBeenSeen,
  isInitialized,
  STORAGE_KEY,
} from './seen-lessons'

beforeEach(() => {
  localStorage.clear()
})

describe('seen-lessons', () => {
  it('isInitialized is false when localStorage key is absent', () => {
    expect(isInitialized()).toBe(false)
  })

  it('isInitialized is true after initBaseline', () => {
    initBaseline(['a', 'b'])
    expect(isInitialized()).toBe(true)
  })

  it('initBaseline marks all current ids as seen', () => {
    initBaseline(['a', 'b', 'c'])
    expect(hasBeenSeen('a')).toBe(true)
    expect(hasBeenSeen('b')).toBe(true)
    expect(hasBeenSeen('c')).toBe(true)
  })

  it('getUnseenIds returns empty array when not initialized (safe default)', () => {
    expect(getUnseenIds(['a', 'b'])).toEqual([])
  })

  it('getUnseenIds returns only new ids after baseline', () => {
    initBaseline(['a', 'b'])
    expect(getUnseenIds(['a', 'b', 'c', 'd'])).toEqual(['c', 'd'])
  })

  it('markAsSeen removes an id from the unseen set', () => {
    initBaseline(['a'])
    expect(getUnseenIds(['a', 'b'])).toEqual(['b'])
    markAsSeen('b')
    expect(getUnseenIds(['a', 'b'])).toEqual([])
  })

  it('hasBeenSeen returns false for unknown ids before baseline', () => {
    expect(hasBeenSeen('a')).toBe(false)
  })

  it('hasBeenSeen returns true after markAsSeen', () => {
    initBaseline([])
    expect(hasBeenSeen('x')).toBe(false)
    markAsSeen('x')
    expect(hasBeenSeen('x')).toBe(true)
  })

  it('persists across calls (same localStorage key)', () => {
    initBaseline(['a'])
    markAsSeen('b')
    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw!)).toEqual(expect.arrayContaining(['a', 'b']))
  })
})
```

- [ ] **Step 2: Run tests, expect FAIL**

```bash
npx vitest run lib/seen-lessons.test.ts
```

Expected: all 9 tests fail with "Cannot resolve module './seen-lessons'".

- [ ] **Step 3: Implement lib/seen-lessons.ts**

Create `/home/user/learn-hindi/lib/seen-lessons.ts`:

```ts
export const STORAGE_KEY = 'learn-hindi:seen-lesson-ids:hindi'

function safeWindow(): Window | null {
  return typeof window === 'undefined' ? null : window
}

function readSet(): Set<string> | null {
  const w = safeWindow()
  if (!w) return null
  const raw = w.localStorage.getItem(STORAGE_KEY)
  if (raw === null) return null
  try {
    const arr = JSON.parse(raw) as string[]
    return new Set(arr)
  } catch {
    return new Set()
  }
}

function writeSet(set: Set<string>): void {
  const w = safeWindow()
  if (!w) return
  w.localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
}

export function isInitialized(): boolean {
  const w = safeWindow()
  if (!w) return false
  return w.localStorage.getItem(STORAGE_KEY) !== null
}

export function initBaseline(allCurrentIds: string[]): void {
  if (isInitialized()) return
  writeSet(new Set(allCurrentIds))
}

export function markAsSeen(id: string): void {
  const set = readSet() ?? new Set<string>()
  set.add(id)
  writeSet(set)
}

export function getUnseenIds(allCurrentIds: string[]): string[] {
  const set = readSet()
  if (set === null) return []
  return allCurrentIds.filter((id) => !set.has(id))
}

export function hasBeenSeen(id: string): boolean {
  const set = readSet()
  if (set === null) return false
  return set.has(id)
}
```

- [ ] **Step 4: Run tests, expect PASS**

```bash
npx vitest run lib/seen-lessons.test.ts
```

Expected: 9/9 pass.

- [ ] **Step 5: Run full suite + tsc**

```bash
npx vitest run
npx tsc --noEmit
```

Expected: all pass, tsc clean.

- [ ] **Step 6: Commit**

```bash
git add lib/seen-lessons.ts lib/seen-lessons.test.ts
git commit -m "feat(seen-lessons): localStorage tracking for which lessons a user has seen"
```

---

## Task 2: Add `newContent` Chaina moment

**Files:**
- Modify: `components/design/moments.ts`

- [ ] **Step 1: Add LINES.newContent**

Open `components/design/moments.ts`. Find the `LINES` object. Add a new entry:

```ts
  newContent: [
    { main: 'arrey! naye lessons aaye hain', caption: 'try karke dekho ✨', speak: 'Arrey, naye lessons aaye hain. Try karke dekho.' },
    { main: 'kuch naya hai!',                  caption: 'check karo 👋',     speak: 'Kuch naya hai. Check karo.' },
    { main: 'naya content unlocked',           caption: 'mazaa aayega',     speak: 'Naya content unlocked. Mazaa aayega.' },
  ],
```

Place it alphabetically near other entries, or at the end of the LINES object — order doesn't matter functionally.

- [ ] **Step 2: Add MOMENTS.newContent**

In the same file, find the `MOMENTS` object. Add (near `welcomeBack` since it uses the same anchor/sizing):

```ts
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

- [ ] **Step 3: Verify tsc + tests**

```bash
npx tsc --noEmit
npx vitest run
```

Both clean.

- [ ] **Step 4: Commit**

```bash
git add components/design/moments.ts
git commit -m "feat(chaina): add newContent moment for surfacing fresh lessons"
```

---

## Task 3: Modify LessonStickerCard to show NEW dot + markAsSeen on click

**Files:**
- Modify: `components/design/LessonStickerCard.tsx`

- [ ] **Step 1: Add isNew prop + markAsSeen import**

Open `components/design/LessonStickerCard.tsx`. Add import at the top with the other lib imports:

```ts
import { markAsSeen } from '@/lib/seen-lessons'
```

Update the Props interface:

```ts
interface Props {
  lesson: Lesson
  index: number
  routeBase?: 'lessons' | 'foundations'
  locked?: boolean
  isNew?: boolean
}
```

Update the component signature destructuring:

```ts
export function LessonStickerCard({ lesson, index, routeBase = 'lessons', locked = false, isNew = false }: Props) {
```

- [ ] **Step 2: Call markAsSeen in onClick**

Find the `onClick` handler (around line 51):

```ts
  const onClick = () => {
    if (locked) return
    playSound('pop')
    router.push(`/${routeBase}/${lesson.id}`)
  }
```

Replace with:

```ts
  const onClick = () => {
    if (locked) return
    playSound('pop')
    if (isNew) markAsSeen(lesson.id)
    router.push(`/${routeBase}/${lesson.id}`)
  }
```

- [ ] **Step 3: Render the NEW dot**

In the JSX return, find the outermost wrapper `<div style={{ opacity: locked ? 0.5 : 1, ...}}>`. Add `position: 'relative'` to its style so the absolute-positioned dot anchors correctly:

```tsx
    <div style={{ opacity: locked ? 0.5 : 1, pointerEvents: locked ? 'none' : 'auto', position: 'relative' }}>
```

Then immediately INSIDE this div (before the `<Sticker>`), add:

```tsx
      {isNew && (
        <span
          aria-label="new"
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: COLORS.chaiOrange ?? '#E76F2C',
            zIndex: 2,
            boxShadow: '0 0 0 2px #fff',
          }}
        />
      )}
```

If `COLORS.chaiOrange` doesn't exist in the design tokens, the fallback `'#E76F2C'` covers it. Run `grep -n 'chaiOrange\|chai_orange\|orange' components/design/tokens.ts` first to check the actual token name. If the project uses a different name (e.g. `COLORS.orange` or `COLORS.accent`), use that.

- [ ] **Step 4: Verify tsc + tests**

```bash
npx tsc --noEmit
npx vitest run
```

Both clean.

- [ ] **Step 5: Commit**

```bash
git add components/design/LessonStickerCard.tsx
git commit -m "feat(card): NEW dot + markAsSeen on tap"
```

---

## Task 4: Wire detection into app/page.tsx

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Read app/page.tsx and find the welcomeBack/firstOpenToday mount effect**

Run: `grep -n 'welcomeBack\|firstOpenToday\|useEffect' app/page.tsx | head -20`

Look for the `useEffect` that calls `play('welcomeBack')` or `play('firstOpenToday')`. The new content check goes inside the same effect, AFTER those.

- [ ] **Step 2: Add imports**

Add at the top of `app/page.tsx`, near other `lib/` imports:

```ts
import { initBaseline, isInitialized, getUnseenIds, hasBeenSeen } from '@/lib/seen-lessons'
```

- [ ] **Step 3: Add detection logic to the mount effect**

Inside the existing welcomeBack/firstOpenToday `useEffect`, after the welcomeBack/firstOpenToday `play(...)` calls and any `markFired(...)` calls, add:

```ts
    // New-content detection (Feature B)
    const allHindiLessons = getAllLessons()
    const allHindiFoundations = getAllFoundations()
    const allIds = [
      ...allHindiLessons.map((l) => l.id),
      ...allHindiFoundations.map((f) => f.id),
    ]
    if (!isInitialized()) {
      initBaseline(allIds)
    } else {
      const unseen = getUnseenIds(allIds)
      if (unseen.length > 0 && canFire('newContent', 'once-per-session')) {
        play('newContent')
        markFired('newContent', 'once-per-session')
      }
    }
```

(`getAllLessons`, `getAllFoundations`, `play`, `canFire`, `markFired` are all already imported at the top of `app/page.tsx`. If not, add them.)

- [ ] **Step 4: Pass isNew to LessonStickerCard renders**

In `app/page.tsx`, find where `<LessonStickerCard>` is rendered (likely in both situations + foundations tab maps). Pass `isNew={!hasBeenSeen(lesson.id)}` to each. Example pattern:

```tsx
{lessons.map((lesson, idx) => (
  <LessonStickerCard
    key={lesson.id}
    lesson={lesson}
    index={idx}
    isNew={!hasBeenSeen(lesson.id)}
  />
))}
```

Do this for BOTH the situations list AND the foundations list. The Dutch tab renders also use LessonStickerCard but the seen-lessons module is hindi-only for now — pass `isNew={false}` (or omit the prop) for Dutch cards. To do this cleanly, only pass `isNew` when `language === 'hindi'`.

Look at the existing render to see how language is detected (search for `useLanguage` or `config`). The condition pattern:

```tsx
isNew={config.code === 'hindi' && !hasBeenSeen(lesson.id)}
```

(Adjust to the actual property name — could be `config.id` or `config.code` or similar.)

- [ ] **Step 5: Verify tsc + tests + lint**

```bash
npx tsc --noEmit
npx vitest run
node scripts/lint-design.mjs
```

All clean.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx
git commit -m "feat(home): detect new content on mount, fire newContent moment, propagate isNew to cards"
```

---

## Task 5: Backfill `01-numbers` skill_breakdown

**Files:**
- Modify: `content/foundations/01-numbers.json`

- [ ] **Step 1: Replace the empty skill_breakdown array**

Open `content/foundations/01-numbers.json`. Find `"skill_breakdown": []`. Replace with:

```json
  "skill_breakdown": [
    {
      "skill": "Counting 1-10 essentials",
      "explanation": "Hindi numbers 1-10 don't follow a predictable pattern — each must be memorized. Once you've got these, 11-19 are recognizable variations. Practice them out loud daily until they're automatic.",
      "more_examples": [
        { "hindi": "ek, do, teen", "english": "one, two, three" },
        { "hindi": "chaar, paanch, chhe", "english": "four, five, six" },
        { "hindi": "saat, aath, nau, das", "english": "seven, eight, nine, ten" },
        { "hindi": "mere paas das rupaye hain", "english": "I have ten rupees" }
      ]
    },
    {
      "skill": "Money in rupees",
      "explanation": "Hindi uses 'sau' (hundred), 'hazaar' (thousand), and 'lakh' (hundred-thousand) instead of 'thousand/million'. 1 lakh = 100,000. Indian currency conversations use lakhs and crores constantly.",
      "more_examples": [
        { "hindi": "sau rupaye", "english": "one hundred rupees" },
        { "hindi": "paanch sau rupaye", "english": "five hundred rupees" },
        { "hindi": "ek hazaar", "english": "one thousand" },
        { "hindi": "ek lakh", "english": "one hundred thousand (1,00,000)" }
      ]
    },
    {
      "skill": "Ordinals (pehla/dusra/tisra)",
      "explanation": "Ordinals agree with the gender of the noun they modify: pehla/pehli (first M/F), dusra/dusri (second), tisra/tisri (third). After third, just attach '-vaan' to the cardinal: chauthaa (fourth), paanchvaan (fifth).",
      "more_examples": [
        { "hindi": "pehla din", "english": "the first day" },
        { "hindi": "dusri baar", "english": "the second time (feminine)" },
        { "hindi": "tisra ladka", "english": "the third boy" },
        { "hindi": "paanchvaan saal", "english": "the fifth year" }
      ]
    }
  ],
```

If the file already has fields AFTER `skill_breakdown` (like `practice_prompt`, `references`), preserve those — just replace the empty array.

- [ ] **Step 2: Verify**

```bash
node -e "JSON.parse(require('fs').readFileSync('content/foundations/01-numbers.json','utf8'))"
npx tsc --noEmit
```

Valid JSON + tsc clean.

- [ ] **Step 3: Commit**

```bash
git add content/foundations/01-numbers.json
git commit -m "content(hindi): backfill 01-numbers skill_breakdown — counting, money, ordinals"
```

---

## Task 6: Backfill `02-present-tense` skill_breakdown

**Files:**
- Modify: `content/foundations/02-present-tense.json`

- [ ] **Step 1: Replace the empty array**

Open the file. Replace `"skill_breakdown": []` with:

```json
  "skill_breakdown": [
    {
      "skill": "Habitual present (-ta hai)",
      "explanation": "Used for things you do regularly or always do. Verb stem + '-ta'/'-ti' (agreeing with subject gender) + auxiliary (hoon/hai/hain). 'main jaati hoon' = 'I go' (regularly).",
      "more_examples": [
        { "hindi": "main roz chai peeti hoon", "english": "I drink chai every day" },
        { "hindi": "wo Hindi bolta hai", "english": "he speaks Hindi" },
        { "hindi": "hum subah jaldi uthte hain", "english": "we wake up early in the morning" },
        { "hindi": "tum kya khaate ho?", "english": "what do you (usually) eat?" }
      ]
    },
    {
      "skill": "Present continuous (-raha hai)",
      "explanation": "Used for ongoing actions happening right now. Verb stem + 'raha'/'rahi'/'rahe' (gender + number) + auxiliary. 'main jaa rahi hoon' = 'I am going' (right now).",
      "more_examples": [
        { "hindi": "main abhi khaana khaa rahi hoon", "english": "I'm eating food right now" },
        { "hindi": "wo phone par baat kar raha hai", "english": "he's talking on the phone" },
        { "hindi": "ham TV dekh rahe hain", "english": "we are watching TV" },
        { "hindi": "kya tum so rahi ho?", "english": "are you sleeping?" }
      ]
    },
    {
      "skill": "Copula (hai/hain) with adjectives",
      "explanation": "Hindi uses 'hai' (singular) and 'hain' (plural/polite) as 'is/are'. The adjective placed BEFORE the noun must agree with gender. 'yeh ladki accchi hai' (this girl is good) vs 'yeh ladka accha hai' (this boy is good).",
      "more_examples": [
        { "hindi": "yeh khaana bahut tasty hai", "english": "this food is very tasty" },
        { "hindi": "wo ladki bahut samajhdaar hai", "english": "that girl is very smart" },
        { "hindi": "mere dost bahut acche hain", "english": "my friends are very good" },
        { "hindi": "aap kaise hain?", "english": "how are you (polite)?" }
      ]
    }
  ],
```

- [ ] **Step 2: Verify + commit**

```bash
node -e "JSON.parse(require('fs').readFileSync('content/foundations/02-present-tense.json','utf8'))"
git add content/foundations/02-present-tense.json
git commit -m "content(hindi): backfill 02-present-tense skill_breakdown — habitual, continuous, copula"
```

---

## Task 7: Backfill `03-past-tense` skill_breakdown

**Files:**
- Modify: `content/foundations/03-past-tense.json`

- [ ] **Step 1: Replace the empty array**

```json
  "skill_breakdown": [
    {
      "skill": "Simple past with -a/-i agreement",
      "explanation": "For intransitive verbs (go, come, sit, sleep): verb stem + '-a' (M) or '-i' (F) — agrees with subject gender. 'main aaya' = I came (male), 'main aayi' = I came (female).",
      "more_examples": [
        { "hindi": "main kal aayi", "english": "I came yesterday (female speaker)" },
        { "hindi": "wo subah uthi", "english": "she got up in the morning" },
        { "hindi": "ham raat ko soye", "english": "we slept at night" },
        { "hindi": "tum kab gaye?", "english": "when did you go? (masc)" }
      ]
    },
    {
      "skill": "Past habitual (-ta tha)",
      "explanation": "Used for habits or repeated actions in the past — 'used to'. Verb stem + '-ta'/'-ti' + 'tha'/'thi'/'the'. 'main school jaati thi' = I used to go to school.",
      "more_examples": [
        { "hindi": "bachpan mein main bahut khelta tha", "english": "as a child, I used to play a lot (male)" },
        { "hindi": "wo har Sunday chai peeti thi", "english": "she used to drink chai every Sunday" },
        { "hindi": "hum saath padhte the", "english": "we used to study together" },
        { "hindi": "papa roz shaam ko ghar aate the", "english": "papa used to come home every evening" }
      ]
    },
    {
      "skill": "Past continuous (-raha tha)",
      "explanation": "Used for ongoing action in the past. Verb stem + 'raha'/'rahi'/'rahe' + 'tha'/'thi'/'the'. 'main jaa rahi thi' = I was going. Think of it as the past form of '-raha hai'.",
      "more_examples": [
        { "hindi": "jab aap aaye, main khaana banaa rahi thi", "english": "when you came, I was making food" },
        { "hindi": "wo phone par baat kar raha tha", "english": "he was talking on the phone" },
        { "hindi": "hum movie dekh rahe the", "english": "we were watching a movie" },
        { "hindi": "tum kahaan jaa rahi thi?", "english": "where were you going? (fem)" }
      ]
    }
  ],
```

- [ ] **Step 2: Verify + commit**

```bash
node -e "JSON.parse(require('fs').readFileSync('content/foundations/03-past-tense.json','utf8'))"
git add content/foundations/03-past-tense.json
git commit -m "content(hindi): backfill 03-past-tense skill_breakdown — simple, habitual, continuous"
```

---

## Task 8: Backfill `04-future-tense` skill_breakdown

**Files:**
- Modify: `content/foundations/04-future-tense.json`

- [ ] **Step 1: Replace the empty array**

```json
  "skill_breakdown": [
    {
      "skill": "Simple future (-unga/-egi/-engi)",
      "explanation": "First person feminine: '-ungi' (main jaaungi). Masculine: '-unga'. Second/third: '-egi'/'-ega', plural: '-engi'/'-enge'. Pattern: stem + gender-marker + person-marker.",
      "more_examples": [
        { "hindi": "main kal aaungi", "english": "I'll come tomorrow (fem)" },
        { "hindi": "wo dilli jaayega", "english": "he'll go to Delhi" },
        { "hindi": "ham agle saal milenge", "english": "we'll meet next year" },
        { "hindi": "tum kya karoge?", "english": "what will you do? (masc)" }
      ]
    },
    {
      "skill": "Obligation future (-na hai / padega)",
      "explanation": "'-na hai' = soft obligation (I have to / I need to). '-na padega' = stronger obligation (I'll have to / will be forced to). Subject takes 'ko' marker: 'mujhe', 'aapko'.",
      "more_examples": [
        { "hindi": "mujhe abhi jaana hai", "english": "I have to go now" },
        { "hindi": "aapko kal aana hai", "english": "you need to come tomorrow" },
        { "hindi": "mujhe doctor ke paas jaana padega", "english": "I'll have to go to the doctor" },
        { "hindi": "ham sabko milkar kaam karna padega", "english": "we'll all have to work together" }
      ]
    },
    {
      "skill": "Promises with pakka / zaroor",
      "explanation": "'pakka' (definitely / for sure) and 'zaroor' (certainly) are essential filler-words that make a future promise sound sincere. Drop them and you sound noncommittal.",
      "more_examples": [
        { "hindi": "zaroor aaungi, pakka", "english": "I'll definitely come, for sure" },
        { "hindi": "kal pakka phone karungi", "english": "I'll definitely call tomorrow" },
        { "hindi": "zaroor batayenge", "english": "we'll definitely tell (you)" },
        { "hindi": "pakka karenge kya?", "english": "will you definitely do it?" }
      ]
    }
  ],
```

- [ ] **Step 2: Verify + commit**

```bash
node -e "JSON.parse(require('fs').readFileSync('content/foundations/04-future-tense.json','utf8'))"
git add content/foundations/04-future-tense.json
git commit -m "content(hindi): backfill 04-future-tense skill_breakdown — simple, obligation, promises"
```

---

## Task 9: Backfill `05-postpositions` skill_breakdown

**Files:**
- Modify: `content/foundations/05-postpositions.json`

- [ ] **Step 1: Replace the empty array**

```json
  "skill_breakdown": [
    {
      "skill": "Basic postpositions (ko, se, mein, par)",
      "explanation": "Hindi uses postpositions (after the noun) instead of prepositions. 'ko' = to/for (direct/indirect object), 'se' = from/with/by, 'mein' = in/inside, 'par' = on/at.",
      "more_examples": [
        { "hindi": "main aapko phone karungi", "english": "I'll call you (you-to)" },
        { "hindi": "wo dilli se aayi hai", "english": "she has come from Delhi" },
        { "hindi": "kitab mez par hai", "english": "the book is on the table" },
        { "hindi": "ghar mein chai hai", "english": "there's chai in the house" }
      ]
    },
    {
      "skill": "Possessive (ka/ki/ke)",
      "explanation": "Hindi possessive agrees with the OBJECT possessed, not the owner. 'mera bhai' (my brother, masc) vs 'meri behen' (my sister, fem). 'X ka' (masc), 'X ki' (fem), 'X ke' (masc-plural / before postposition).",
      "more_examples": [
        { "hindi": "mummy ka phone", "english": "mummy's phone (phone is masc)" },
        { "hindi": "papa ki gaadi", "english": "papa's car (gaadi is fem)" },
        { "hindi": "didi ke kapde", "english": "didi's clothes (plural masc)" },
        { "hindi": "Rahul ka ghar bahut bada hai", "english": "Rahul's house is very big" }
      ]
    },
    {
      "skill": "Compound postpositions (ke baare mein, ke saath, ke liye)",
      "explanation": "Combine 'ke' with another word: 'ke baare mein' (about), 'ke saath' (with), 'ke liye' (for), 'ke paas' (near / in possession of), 'ke piche' (behind). Always uses oblique 'ke' regardless of gender.",
      "more_examples": [
        { "hindi": "aapke baare mein bata rahe the", "english": "(they) were talking about you" },
        { "hindi": "mere saath chalo", "english": "come with me" },
        { "hindi": "yeh tumhare liye hai", "english": "this is for you" },
        { "hindi": "mere paas paise nahi hain", "english": "I don't have money (lit: near me money is not)" }
      ]
    }
  ],
```

- [ ] **Step 2: Verify + commit**

```bash
node -e "JSON.parse(require('fs').readFileSync('content/foundations/05-postpositions.json','utf8'))"
git add content/foundations/05-postpositions.json
git commit -m "content(hindi): backfill 05-postpositions skill_breakdown — basic, possessive, compound"
```

---

## Task 10: Backfill `06-pronouns-verbs` skill_breakdown

**Files:**
- Modify: `content/foundations/06-pronouns-verbs.json`

- [ ] **Step 1: Replace the empty array**

```json
  "skill_breakdown": [
    {
      "skill": "Pronoun-verb agreement",
      "explanation": "Each pronoun pairs with a specific auxiliary ending in present tense: main+hoon, tu+hai, tum+ho, aap+hain, wo+hai (sg) / hain (pl), ham+hain. Mismatched pairings sound jarring to native speakers.",
      "more_examples": [
        { "hindi": "main theek hoon", "english": "I am fine" },
        { "hindi": "tum kahaan ho?", "english": "where are you? (friend)" },
        { "hindi": "aap kaise hain?", "english": "how are you? (polite)" },
        { "hindi": "wo school mein hai", "english": "he/she is in school" }
      ]
    },
    {
      "skill": "Polite forms (aap → -hain, tum → -ho, tu → -hai)",
      "explanation": "Three levels of formality: 'aap' (respectful, strangers/elders), 'tum' (friends/peers), 'tu' (intimate/anger only). Each takes a different verb ending. Default to 'aap' when unsure.",
      "more_examples": [
        { "hindi": "aap kya kar rahe hain?", "english": "what are you doing? (polite)" },
        { "hindi": "tum kya kar rahe ho?", "english": "what are you doing? (friend)" },
        { "hindi": "tu kya kar raha hai?", "english": "what are you doing? (intimate, very informal)" },
        { "hindi": "aap baith jaaiye", "english": "please sit (polite imperative)" }
      ]
    },
    {
      "skill": "Gender agreement in verb endings",
      "explanation": "In past tense and continuous forms, verbs agree with subject gender: 'main aaya' (male, came) vs 'main aayi' (female). 'jaa raha hoon' (male) vs 'jaa rahi hoon' (female). Get this wrong and you sound like a tourist.",
      "more_examples": [
        { "hindi": "main thaka hua hoon", "english": "I am tired (male)" },
        { "hindi": "main thaki hui hoon", "english": "I am tired (female)" },
        { "hindi": "wo Hindi bol raha hai", "english": "he is speaking Hindi" },
        { "hindi": "wo Hindi bol rahi hai", "english": "she is speaking Hindi" }
      ]
    }
  ],
```

- [ ] **Step 2: Verify + commit**

```bash
node -e "JSON.parse(require('fs').readFileSync('content/foundations/06-pronouns-verbs.json','utf8'))"
git add content/foundations/06-pronouns-verbs.json
git commit -m "content(hindi): backfill 06-pronouns-verbs skill_breakdown — agreement, polite, gender"
```

---

## Task 11: Author `08-compound-verbs.json`

**Files:**
- Create: `content/foundations/08-compound-verbs.json`

- [ ] **Step 1: Write the JSON**

Create `/home/user/learn-hindi/content/foundations/08-compound-verbs.json`:

```json
{
  "id": "compound-verbs",
  "title": "Compound Verbs (le/de/kar dena)",
  "situation": "Hindi loves attaching a 'completion verb' to a main verb to add nuance: politeness, finality, totality. 'le lena' (take up), 'de dena' (give over), 'kar dena' (do over) — these tiny additions transform meaning.",
  "skills": ["completion compounds", "politeness via compounding", "common patterns: le lena, de dena, kar dena, ho jaana"],
  "phrases": [
    { "hindi": "yeh chai pee lo", "english": "drink this chai (fully)", "context": "'pee lo' vs just 'pee' — adding 'lo' (from le lena) makes it sound completion-oriented and gently insistent.", "pronunciation": "YEH chai PEE lo" },
    { "hindi": "main yeh kaam kar dungi", "english": "I'll get this work done", "context": "'kar dungi' (kar + dena) implies 'I'll do it for you / I'll get it over with'. More committed than just 'karungi'.", "pronunciation": "MAIN yeh KAAM kar DOON-gi" },
    { "hindi": "yeh kitaab mujhe de dijiye", "english": "please hand me this book", "context": "'de dijiye' (de + dena polite) is more polite than just 'dijiye'. The compound softens.", "pronunciation": "YEH ki-TAAB mu-JHE DE di-JI-ye" },
    { "hindi": "bachhe so gaye", "english": "the kids have fallen asleep", "context": "'so jaana' (sleep + jaana = go) is the standard compound for 'fall asleep'. 'gaye' is past perfective.", "pronunciation": "BACH-che SO ga-YE" },
    { "hindi": "khaana khaa lo, theek se", "english": "eat your food properly", "context": "'khaa lo' (khaa + le) = eat (it up). Without 'lo', sounds incomplete. Mothers say this constantly.", "pronunciation": "khaa-NA KHAA lo, THEEK se" },
    { "hindi": "darwaza band kar do", "english": "shut the door", "context": "'kar do' (kar + de) = do it (over). Standard instruction-completion compound — softer than just 'karo'.", "pronunciation": "dar-WAA-za BAND kar do" },
    { "hindi": "main aapka number save kar leti hoon", "english": "let me save your number", "context": "'kar leti hoon' (kar + le, present) — 'I'll just take care of saving it'. The compound implies the action is small/quick.", "pronunciation": "MAIN AAP-ka NUM-ber SAVE kar LE-ti hoon" },
    { "hindi": "wo ghar pahunch gayi", "english": "she reached home", "context": "'pahunch gayi' (reach + jaana) — completion via 'jaana'. Same as 'so gayi' for sleep. Native pattern: motion verbs commonly take jaana-compound for completion.", "pronunciation": "WO GHAR pa-HUNCH ga-YI" },
    { "hindi": "thoda paani pila do na", "english": "give me some water, won't you", "context": "'pila do' (causative pilana + dena). 'do na' adds friendly insistence — the 'na' is a soft tag-question.", "pronunciation": "tho-DA paa-NI pi-LA do na" },
    { "hindi": "yeh sab samjha do bachon ko", "english": "explain all this to the kids", "context": "'samjha do' (samjhana + dena) — explain (it over), 'do' marks the completion of the explaining for the listeners' benefit.", "pronunciation": "YEH sab sam-JHA do ba-CHON ko" }
  ],
  "grammar_notes": [
    "Compound verbs = main verb stem + auxiliary (le/de/kar/jaa/ho). The auxiliary loses its own meaning and just adds aspect/politeness.",
    "'le lena' (take up): the main verb's action benefits the doer. 'khaa lo' = eat (for yourself).",
    "'de dena' (give over): the main verb's action benefits someone else. 'de do' = hand it over (to them).",
    "'kar dena' (do over): emphasizes completion + politeness. 'kar do' is softer/more polite than bare 'karo'.",
    "'jaa jaana' (go): used with motion or change-of-state verbs to mark completion. 'so jaana' (fall asleep), 'pahunch jaana' (arrive).",
    "'ho jaana' (become): change-of-state. 'theek ho gaya' (got better), 'pareshaan ho gayi' (became worried)."
  ],
  "culture_notes": [
    "Compound verbs are EVERYWHERE in spoken Hindi. Refusing to use them makes you sound like a foreigner reading from a textbook.",
    "Mothers and aunties use 'kha lo / pee lo / so jaao' as their core vocabulary for caring instructions. Internalize these.",
    "The compound choice (le/de/kar/jaa) carries social information — 'le' = for you, 'de' = for me, 'kar' = polite, 'jaa' = complete."
  ],
  "skill_breakdown": [
    {
      "skill": "le lena (take up)",
      "explanation": "Attached to a verb when the action benefits the doer or is self-directed. 'khaa lo' (eat — for yourself), 'pee lo' (drink up), 'samajh lo' (got it / understand for yourself).",
      "more_examples": [
        { "hindi": "yeh dawaai khaa lo", "english": "take this medicine" },
        { "hindi": "araam kar lo", "english": "take some rest (for yourself)" },
        { "hindi": "main ticket book kar leti hoon", "english": "let me book the ticket" }
      ]
    },
    {
      "skill": "de dena (give over)",
      "explanation": "Attached when the action benefits the listener or someone other than the doer. 'de do' (hand it over), 'bata do' (tell — to them), 'kar do' (do it — for them).",
      "more_examples": [
        { "hindi": "phone mujhe de do", "english": "give me the phone" },
        { "hindi": "papa ko bata dena", "english": "tell papa (do this for me)" },
        { "hindi": "yeh kaam kal kar dena", "english": "get this work done tomorrow" }
      ]
    },
    {
      "skill": "kar dena / jaa jaana / ho jaana",
      "explanation": "'kar dena' = do over (politeness + completion). 'jaa jaana' = go (motion / state-completion). 'ho jaana' = become (change of state). All three add a sense of 'completedness' that bare verbs lack.",
      "more_examples": [
        { "hindi": "khaana taiyaar ho gaya", "english": "food is ready (lit: has become ready)" },
        { "hindi": "main thak gayi hoon", "english": "I've gotten tired" },
        { "hindi": "kaam khatm kar do", "english": "finish the work" }
      ]
    }
  ],
  "practice_prompt": "You are a Hindi conversational tutor helping the user master compound verbs. Give them everyday situations (asking for water, telling a kid to sleep, requesting a favor) and have them respond using a compound verb. Correct gently when they use a bare verb where a compound is natural. Use 'aap' (the user is your student, polite default).",
  "references": ["Snell & Weightman Ch. 13"]
}
```

- [ ] **Step 2: Verify + commit**

```bash
node -e "JSON.parse(require('fs').readFileSync('content/foundations/08-compound-verbs.json','utf8'))"
git add content/foundations/08-compound-verbs.json
git commit -m "content(hindi): add 08-compound-verbs foundation — Snell & Weightman Ch. 13"
```

---

## Task 12: Author `09-ne-rule.json`

**Files:**
- Create: `content/foundations/09-ne-rule.json`

- [ ] **Step 1: Write the JSON**

Create `/home/user/learn-hindi/content/foundations/09-ne-rule.json`:

```json
{
  "id": "ne-rule",
  "title": "The 'ne' Rule (Ergative Past)",
  "situation": "Hindi's most-feared grammar rule: in the perfective past, TRANSITIVE verbs flip the construction. The subject gets 'ne' attached, and the verb agrees with the OBJECT, not the subject. 'maine khaaya' (I ate) — pure black magic until it clicks.",
  "skills": ["the 'ne' marker", "object-verb agreement", "transitive vs intransitive in past"],
  "phrases": [
    { "hindi": "maine chai pi", "english": "I drank chai", "context": "'maine' = main + ne. 'pi' agrees with 'chai' (fem). Notice: NOT 'pee' (which would be masculine).", "pronunciation": "MAI-ne CHAI pi" },
    { "hindi": "usne kitaab padhi", "english": "he/she read the book", "context": "'usne' = us + ne. Verb 'padhi' agrees with 'kitaab' (fem). The subject's gender is IRRELEVANT — only the object matters.", "pronunciation": "US-ne ki-TAAB pa-DHI" },
    { "hindi": "humne movie dekhi", "english": "we watched a movie", "context": "'humne' = ham + ne. 'dekhi' agrees with 'movie' (fem in Hindi). Always check the OBJECT's gender first.", "pronunciation": "HUM-ne MO-vie de-KHI" },
    { "hindi": "main ghar gayi", "english": "I went home", "context": "Contrast: 'jaana' is INTRANSITIVE → no 'ne'. Subject takes 'gayi' (fem, agrees with main = female speaker). Compare to the 'maine' phrases above.", "pronunciation": "MAIN GHAR ga-YI" },
    { "hindi": "papa ne khaana banaya", "english": "papa made food", "context": "Even with named subjects, attach 'ne'. 'banaya' (M) agrees with 'khaana' (M). If it had been 'sabzi' (F), would be 'banayi'.", "pronunciation": "PA-pa ne khaa-NA ba-NA-ya" },
    { "hindi": "tumne kya kaha?", "english": "what did you say?", "context": "Question form. 'tumne' = tum + ne. 'kaha' is a special case — fixed form, doesn't agree (because 'kya' doesn't have inherent gender).", "pronunciation": "TUM-ne KYA KA-ha?" },
    { "hindi": "maine usse phone kiya", "english": "I called him/her", "context": "'phone kiya' — 'kiya' agrees with 'phone' (M loanword). Even English loanwords get assigned a Hindi gender; phone is M.", "pronunciation": "MAI-ne US-se PHONE ki-YA" },
    { "hindi": "usne mujhe yeh batayi", "english": "she told me this thing (fem)", "context": "'batayi' (F) — what's the object? Implicit 'baat' (story/thing, fem). The verb agrees with whatever was told, not the speaker or listener.", "pronunciation": "US-ne mu-JHE YEH ba-TAA-yi" },
    { "hindi": "mein roya / mein royi", "english": "I cried (M/F)", "context": "'rona' (to cry) is INTRANSITIVE — no 'ne', subject takes normal agreement. Compare with 'rulaya' (caused to cry, transitive) which would need 'ne'.", "pronunciation": "MAIN RO-ya / MAIN RO-yi" },
    { "hindi": "humne saara kaam kar liya", "english": "we got all the work done", "context": "Compound verb 'kar liya' (kar + le, perfective) — still triggers 'ne'. 'liya' agrees with 'kaam' (M). All compounds inherit the transitivity of their main verb.", "pronunciation": "HUM-ne SAA-ra KAAM kar li-YA" }
  ],
  "grammar_notes": [
    "The 'ne' rule applies ONLY in the perfective past of TRANSITIVE verbs. Present, future, habitual, continuous past — no 'ne'.",
    "Pronoun + 'ne' forms: main→maine, tu→tune, tum→tumne, aap→aapne, wo→usne (sg) / unhone (pl), ham→humne.",
    "Verb agreement: with 'ne', the verb agrees with the DIRECT OBJECT (gender + number). NOT with the subject.",
    "If the object also takes 'ko' (marking specificity), the verb stays in the default masculine-singular form. 'maine usko dekha' (I saw him/her) — 'dekha' is fixed.",
    "Intransitive verbs (aana, jaana, baithna, sona, rona) NEVER take 'ne'. They use normal subject-verb agreement.",
    "Compound verbs (kar liya, de diya, kha liya) inherit transitivity from the main verb. 'maine kar liya' (transitive → ne). 'mein so gayi' (intransitive → no ne)."
  ],
  "culture_notes": [
    "Even native Hindi speakers occasionally trip over 'ne' in fast speech, especially in casual contexts. Getting it 80% right is good enough socially.",
    "The 'ne' rule is one of the few grammar features that Bollywood films sometimes ignore for poetic effect — don't trust song lyrics as a reference.",
    "Learners often over-apply 'ne' (using it in present/future) — be careful. It is ONLY for perfective past of transitive verbs."
  ],
  "skill_breakdown": [
    {
      "skill": "When to use 'ne' (transitive perfective past only)",
      "explanation": "Two conditions must BOTH be true: (1) verb is transitive (has a direct object), (2) tense is perfective past. Anywhere else, no 'ne'.",
      "more_examples": [
        { "hindi": "maine kitaab padhi (✓ past + transitive)", "english": "I read the book" },
        { "hindi": "main kitaab padhungi (✗ no ne — future)", "english": "I will read the book" },
        { "hindi": "main ghar gayi (✗ no ne — intransitive)", "english": "I went home" }
      ]
    },
    {
      "skill": "Object-verb agreement with 'ne'",
      "explanation": "The verb agrees with the OBJECT (its gender + number), not the subject. Always check: what's the object's gender?",
      "more_examples": [
        { "hindi": "maine chai (F) pi", "english": "I drank chai (verb fem to match chai)" },
        { "hindi": "maine pani (M) piya", "english": "I drank water (verb masc to match pani)" },
        { "hindi": "usne kitaabein (F-pl) padhi", "english": "she read the books (verb fem-plural)" }
      ]
    },
    {
      "skill": "Transitive vs intransitive trap",
      "explanation": "Some verbs are tricky: 'bolna' (speak) — transitive in Hindi → ne. 'rona' (cry) — intransitive → no ne. 'hasna' (laugh) — intransitive. When in doubt: does the verb take a direct object?",
      "more_examples": [
        { "hindi": "maine bola (ne — bolna is transitive)", "english": "I said/spoke" },
        { "hindi": "main hansi (no ne — hasna intransitive)", "english": "I laughed (fem)" },
        { "hindi": "main rota tha (no ne)", "english": "I used to cry (also no ne in habitual, regardless)" }
      ]
    }
  ],
  "practice_prompt": "You are a Hindi grammar tutor specializing in the 'ne' rule. Give the user a short past-tense scenario and ask them to translate. They'll make mistakes — gently flag whether (a) they should/shouldn't have used 'ne', and (b) whether the verb agrees with the right gender. Use 'aap' (polite tutor).",
  "references": ["Snell & Weightman Ch. 12", "Afroz Taj Lesson 8"]
}
```

- [ ] **Step 2: Verify + commit**

```bash
node -e "JSON.parse(require('fs').readFileSync('content/foundations/09-ne-rule.json','utf8'))"
git add content/foundations/09-ne-rule.json
git commit -m "content(hindi): add 09-ne-rule foundation — Snell & Weightman Ch. 12 + Afroz Taj Lesson 8"
```

---

## Task 13: Register new foundations + update CONTENT.md inventory

**Files:**
- Modify: `lib/foundations.ts`
- Modify: `CONTENT.md`

- [ ] **Step 1: Add imports to lib/foundations.ts**

Open `lib/foundations.ts`. After `import nounGender from '@/content/foundations/07-noun-gender.json'`, add:

```ts
import compoundVerbs from '@/content/foundations/08-compound-verbs.json'
import neRule from '@/content/foundations/09-ne-rule.json'
```

- [ ] **Step 2: Add to the foundations array**

Update the array:

```ts
const foundations: Lesson[] = [
  numbers,
  presentTense,
  pastTense,
  futureTense,
  postpositions,
  pronounsVerbs,
  nounGender,
  compoundVerbs,
  neRule,
] as Lesson[]
```

- [ ] **Step 3: Update CONTENT.md inventory**

Find the Foundations section header — should mention a count ("7 lessons" or similar). Update to "9 lessons".

Add 2 rows to the foundations inventory table (the column layout matches the existing rows):

```markdown
| `08-compound-verbs` | Compound Verbs (le/de/kar dena) | Completion-compound patterns | le lena, de dena, kar dena, jaa jaana, ho jaana |
| `09-ne-rule` | The 'ne' Rule (Ergative Past) | Transitive perfective + object agreement | ne marker, object-verb agreement, transitive vs intransitive |
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
npx vitest run
node scripts/lint-design.mjs
```

All clean.

- [ ] **Step 5: Commit**

```bash
git add lib/foundations.ts CONTENT.md
git commit -m "feat(foundations): register 08-compound-verbs + 09-ne-rule; bump inventory to 9"
```

---

## Task 14: Final QA + push

- [ ] **Step 1: Full local verification**

```bash
npx vitest run
npx tsc --noEmit
node scripts/lint-design.mjs
```

Expected:
- vitest: all pass (214 existing + 9 new from seen-lessons.test.ts = 223+)
- tsc: clean
- design-lint: clean

- [ ] **Step 2: Smoke check the new behavior**

If dev server boots quickly:

```bash
npm run dev &
sleep 8
# In browser:
# 1. open localhost:3000 in incognito — should NOT show newContent popup (silent baseline runs)
# 2. inspect localStorage → key 'learn-hindi:seen-lesson-ids:hindi' should exist with all 9 foundation IDs + 10 lesson IDs
# 3. manually edit the array in localStorage to remove (say) 'compound-verbs' and reload — Chaina popup should appear, plus a NEW dot on the compound-verbs card
# 4. tap the card — dot disappears
# 5. close + reopen → no popup (because the only "unseen" was already tapped)
```

Kill the dev server. Skip this step if the env can't boot the server quickly.

- [ ] **Step 3: Push**

```bash
git push origin main
```

- [ ] **Step 4: Confirm CI**

- `ci` workflow should be green (eslint + tsc + design-lint + vitest)
- `visual` workflow may still fail (no baselines, pre-existing)

---

## Self-review checklist (for the implementing engineer)

- [ ] `lib/seen-lessons.ts` + tests committed; tests pass
- [ ] `components/design/moments.ts` has `newContent` in both LINES and MOMENTS
- [ ] `components/design/LessonStickerCard.tsx` accepts `isNew?: boolean`, renders dot, calls `markAsSeen` on click
- [ ] `app/page.tsx` imports `seen-lessons`, runs `initBaseline` on first detection, fires `newContent` moment when unseen > 0, passes `isNew` to cards (hindi only)
- [ ] All 6 existing foundations (01-06) have populated `skill_breakdown` arrays (3 entries each)
- [ ] 2 new foundation JSONs exist (`08-compound-verbs.json`, `09-ne-rule.json`)
- [ ] `lib/foundations.ts` imports + registers all 9 foundations
- [ ] `CONTENT.md` foundations inventory shows 9 lessons; 2 new rows added
- [ ] All commits pushed
