# Vocab Archive With Replacement — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a per-card archive that actually hides known vocab words from the visible deck, capped at 10 visible cards with a fresh card sliding in from the pool when one is archived. Pair with a one-shot Gemini script that expands `content/vocabulary.json` from 100 → ~300 words so the replacement experience keeps landing.

**Architecture:** A new per-language `${prefix}-vocab-archived` localStorage set, an idempotent one-time migration from the legacy global `vocab-known`, a refactored category page that filters + caps + slide-ins, an archived fold with tap-to-restore, and a standalone `scripts/generate-vocab.mjs` modeled on `scripts/generate-lesson.mjs`.

**Tech Stack:** TypeScript / Next.js 16 App Router / Tailwind v4 / Framer Motion / Vitest / Gemini 2.5 Flash via Vercel AI SDK + Zod / `@/components/design` Chai Galli primitives.

---

## File Structure

| Path | Responsibility | Status |
|------|----------------|--------|
| `lib/vocab-archive.ts` | Pure localStorage I/O for the archived set (per language). No UI imports. | Create |
| `lib/vocab-archive.test.ts` | Co-located unit tests for the lib. | Create |
| `app/vocabulary/[category]/page.tsx` | Refactor to filter+cap+slide-in+fold+restore+empty-state. | Modify |
| `app/vocabulary/page.tsx` | Add per-category archive count chip in the subtitle. | Modify |
| `scripts/generate-vocab.mjs` | Gemini-drafted vocab expansion writing to `content/vocabulary-draft.json`. | Create |
| `content/vocabulary-draft.json` | Output of the script — user reviews and merges into `vocabulary.json`. | Generated artifact, not hand-edited |

---

## Task 1: Create `lib/vocab-archive.ts` — basic get/add/remove/isArchived (TDD)

**Files:**
- Create: `lib/vocab-archive.ts`
- Test: `lib/vocab-archive.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/vocab-archive.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import {
  getArchived,
  addArchived,
  removeArchived,
  isArchived,
  storageKey,
} from './vocab-archive'

beforeEach(() => {
  localStorage.clear()
})

describe('vocab-archive', () => {
  it('storageKey is per-language', () => {
    expect(storageKey('hindi')).toBe('hindi-vocab-archived')
    expect(storageKey('dutch')).toBe('dutch-vocab-archived')
  })

  it('getArchived returns empty array when not set', () => {
    expect(getArchived('hindi')).toEqual([])
  })

  it('addArchived appends a hindi headword', () => {
    addArchived('hindi', 'namaste')
    expect(getArchived('hindi')).toEqual(['namaste'])
  })

  it('addArchived is idempotent (no duplicates)', () => {
    addArchived('hindi', 'namaste')
    addArchived('hindi', 'namaste')
    expect(getArchived('hindi')).toEqual(['namaste'])
  })

  it('removeArchived drops the entry', () => {
    addArchived('hindi', 'namaste')
    addArchived('hindi', 'shukriya')
    removeArchived('hindi', 'namaste')
    expect(getArchived('hindi')).toEqual(['shukriya'])
  })

  it('removeArchived is a no-op for missing entries', () => {
    addArchived('hindi', 'namaste')
    removeArchived('hindi', 'not-present')
    expect(getArchived('hindi')).toEqual(['namaste'])
  })

  it('isArchived reflects add/remove', () => {
    expect(isArchived('hindi', 'chai')).toBe(false)
    addArchived('hindi', 'chai')
    expect(isArchived('hindi', 'chai')).toBe(true)
    removeArchived('hindi', 'chai')
    expect(isArchived('hindi', 'chai')).toBe(false)
  })

  it('per-language sets are isolated', () => {
    addArchived('hindi', 'chai')
    expect(getArchived('hindi')).toEqual(['chai'])
    expect(getArchived('dutch')).toEqual([])
  })

  it('getArchived returns empty array on corrupt JSON', () => {
    localStorage.setItem('hindi-vocab-archived', 'not-json{')
    expect(getArchived('hindi')).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/vocab-archive.test.ts`
Expected: FAIL with "Cannot find module './vocab-archive'" (module doesn't exist yet).

- [ ] **Step 3: Write minimal implementation**

Create `lib/vocab-archive.ts`:

```ts
export function storageKey(prefix: string): string {
  return `${prefix}-vocab-archived`
}

function read(prefix: string): string[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(storageKey(prefix))
  if (raw === null) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

function write(prefix: string, items: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(storageKey(prefix), JSON.stringify(items))
}

export function getArchived(prefix: string): string[] {
  return read(prefix)
}

export function addArchived(prefix: string, hindi: string): void {
  const items = read(prefix)
  if (items.includes(hindi)) return
  items.push(hindi)
  write(prefix, items)
}

export function removeArchived(prefix: string, hindi: string): void {
  const items = read(prefix)
  const next = items.filter((w) => w !== hindi)
  if (next.length === items.length) return
  write(prefix, next)
}

export function isArchived(prefix: string, hindi: string): boolean {
  return read(prefix).includes(hindi)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/vocab-archive.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/vocab-archive.ts lib/vocab-archive.test.ts
git commit -m "feat(vocab): vocab-archive lib — per-language archived set"
```

---

## Task 2: Add legacy `vocab-known` → `vocab-archived` migration (TDD)

**Files:**
- Modify: `lib/vocab-archive.ts`
- Modify: `lib/vocab-archive.test.ts`

Migration is one-time per language. Copy whatever is in the global `vocab-known` set into the per-language archived set (additive — does not wipe legacy entries). Idempotent — runs safely on every page mount.

- [ ] **Step 1: Append failing migration tests**

Append to `lib/vocab-archive.test.ts`:

```ts
import { migrateLegacyKnown } from './vocab-archive'

describe('vocab-archive: legacy migration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('copies legacy vocab-known entries into per-language archived', () => {
    localStorage.setItem('vocab-known', JSON.stringify(['namaste', 'chai']))
    migrateLegacyKnown('hindi')
    expect(getArchived('hindi').sort()).toEqual(['chai', 'namaste'])
  })

  it('preserves words that were already archived', () => {
    addArchived('hindi', 'pre-existing')
    localStorage.setItem('vocab-known', JSON.stringify(['namaste']))
    migrateLegacyKnown('hindi')
    expect(getArchived('hindi').sort()).toEqual(['namaste', 'pre-existing'])
  })

  it('does not wipe the legacy vocab-known key', () => {
    localStorage.setItem('vocab-known', JSON.stringify(['namaste']))
    migrateLegacyKnown('hindi')
    expect(JSON.parse(localStorage.getItem('vocab-known') ?? '[]')).toEqual([
      'namaste',
    ])
  })

  it('is idempotent — running twice does not duplicate', () => {
    localStorage.setItem('vocab-known', JSON.stringify(['namaste']))
    migrateLegacyKnown('hindi')
    migrateLegacyKnown('hindi')
    expect(getArchived('hindi')).toEqual(['namaste'])
  })

  it('is a no-op when legacy vocab-known is absent', () => {
    migrateLegacyKnown('hindi')
    expect(getArchived('hindi')).toEqual([])
  })

  it('handles corrupt legacy JSON gracefully', () => {
    localStorage.setItem('vocab-known', 'broken{')
    migrateLegacyKnown('hindi')
    expect(getArchived('hindi')).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/vocab-archive.test.ts`
Expected: FAIL with "migrateLegacyKnown is not a function" (or export-missing error).

- [ ] **Step 3: Append the migration implementation**

Append to `lib/vocab-archive.ts`:

```ts
const LEGACY_KNOWN_KEY = 'vocab-known'

export function migrateLegacyKnown(prefix: string): void {
  if (typeof window === 'undefined') return
  const raw = localStorage.getItem(LEGACY_KNOWN_KEY)
  if (raw === null) return
  let legacy: string[] = []
  try {
    const parsed = JSON.parse(raw)
    legacy = Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return
  }
  for (const word of legacy) {
    addArchived(prefix, word)
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/vocab-archive.test.ts`
Expected: PASS (15 tests total).

- [ ] **Step 5: Commit**

```bash
git add lib/vocab-archive.ts lib/vocab-archive.test.ts
git commit -m "feat(vocab): legacy vocab-known → vocab-archived migration"
```

---

## Task 3: Wire archive set into category page — filter + cap + swipe writes to archived

**Files:**
- Modify: `app/vocabulary/[category]/page.tsx`

This task swaps the right-swipe-marks-known behavior for right-swipe-archives, filters the visible list to non-archived words, caps at 10, and runs the legacy migration on mount. No animation work yet (Task 4 handles slide-in) and no fold (Task 6).

- [ ] **Step 1: Add the visible cap constant + import the archive lib**

In `app/vocabulary/[category]/page.tsx`, near the other top-level constants (around line 41):

```ts
const VISIBLE_CAP = 10
```

Add to the imports block:

```ts
import {
  addArchived,
  removeArchived,
  getArchived,
  isArchived,
  migrateLegacyKnown,
} from '@/lib/vocab-archive'
```

- [ ] **Step 2: Replace `knownSet` state with `archivedSet` and run migration on mount**

Find the existing `knownSet` state declaration (around line 62) and replace with:

```ts
const [archivedSet, setArchivedSet] = useState<Set<string>>(new Set())
```

Remove the line declaring `knownSet`. (The `reviewSet` state stays untouched.)

In the initial `useEffect` that loads category data (around line 68), replace `setKnownSet(new Set(getVocabKnown()))` with:

```ts
migrateLegacyKnown(config.storagePrefix)
setArchivedSet(new Set(getArchived(config.storagePrefix)))
```

(Add `config` to the effect's dependency array via `config.storagePrefix`.)

Remove the now-unused `getVocabKnown` import line.

- [ ] **Step 3: Rewrite `handleSwipeRight` to archive (not mark known)**

Replace the existing `handleSwipeRight` callback with:

```ts
const handleSwipeRight = useCallback(
  (word: VocabWord) => {
    playSound('correct')
    addArchived(config.storagePrefix, word.hindi)
    removeVocabReview(word.hindi)
    setArchivedSet((prev) => new Set([...prev, word.hindi]))
    setReviewSet((prev) => {
      const next = new Set(prev)
      next.delete(word.hindi)
      return next
    })
    if (!learnedSet.has(word.hindi)) {
      if (isDutch) markDutchWordLearned(categoryId, word.hindi)
      else markWordLearned(categoryId, word.hindi)
      setLearnedSet((prev) => new Set([...prev, word.hindi]))
    }
  },
  [categoryId, learnedSet, isDutch, config.storagePrefix],
)
```

In `handleSwipeLeft`, replace `removeVocabKnown(word.hindi)` (and the corresponding `setKnownSet(...)`) with the archived-set equivalent:

```ts
removeArchived(config.storagePrefix, word.hindi)
setArchivedSet((prev) => {
  const next = new Set(prev)
  next.delete(word.hindi)
  return next
})
```

Remove the now-unused `removeVocabKnown` and `addVocabKnown` imports.

- [ ] **Step 4: Replace the sort-known-to-bottom memo with a filter+cap memo**

Find the existing `sortedWords` memo (around line 175) and replace with:

```ts
const visibleWords = useMemo(() => {
  if (!category) return []
  const fresh = category.words.filter((w) => !archivedSet.has(w.hindi))
  return fresh.slice(0, VISIBLE_CAP)
}, [category, archivedSet])

const archivedWords = useMemo(() => {
  if (!category) return []
  return category.words.filter((w) => archivedSet.has(w.hindi))
}, [category, archivedSet])
```

- [ ] **Step 5: Update the map call to use `visibleWords` + drop the now-stale `isKnown` prop**

Find the `.map((word, index) => <SwipeableWordCard ...)` block (around line 367) and change `sortedWords.map` → `visibleWords.map`. Drop `isKnown={knownSet.has(word.hindi)}` from the prop list (we don't surface "archived" tint in the visible deck — archived words are simply not present).

In `SwipeableWordCard` (around line 387), remove the `isKnown` prop from the type signature and the green-dot indicator block (lines 600-611). Remove the `isKnown` branch from the `bg = isFlipped ? W : isKnown ? COLORS.mint2 : isReview ? COLORS.butter : W` calculation — simplify to:

```ts
const bg = isFlipped ? W : isReview ? COLORS.butter : W
```

- [ ] **Step 6: Update the swipe-overlay label from "✓ KNOWN" to "✓ ARCHIVE"**

In `SwipeableWordCard`, find the right-swipe overlay label text `✓ KNOWN` (around line 472) and change to `✓ ARCHIVE`.

Also update the hint line near the top of the category body (around line 363):

```ts
tap to flip · swipe → archive · swipe ← review
```

- [ ] **Step 7: Smoke-run TypeScript + tests**

```bash
npx tsc --noEmit 2>&1 | grep -v "__tests__" | head -20
npx vitest run --reporter=dot 2>&1 | tail -8
```

Expected: no new errors from these files; 228+ tests still passing.

- [ ] **Step 8: Commit**

```bash
git add app/vocabulary/[category]/page.tsx
git commit -m "feat(vocab): swipe-right archives + cap visible list at 10"
```

---

## Task 4: Slide-in animation for the next-from-pool card

**Files:**
- Modify: `app/vocabulary/[category]/page.tsx`

Framer Motion's `AnimatePresence` with the existing list of cards (each keyed by `word.hindi`) is enough — entering cards get an `initial` slide-up + fade, exiting cards get a height-collapse + fade.

- [ ] **Step 1: Wrap the visible-list cards in `AnimatePresence` with a layout animation**

`AnimatePresence` is already imported (line 5). In the map block (around line 367):

```tsx
<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
  <AnimatePresence initial={false}>
    {visibleWords.map((word, index) => (
      <SwipeableWordCard
        key={word.hindi}
        word={word}
        index={index}
        isFlipped={flippedCard === word.hindi}
        isReview={reviewSet.has(word.hindi)}
        onTap={handleCardTap}
        onSwipeRight={handleSwipeRight}
        onSwipeLeft={handleSwipeLeft}
        ttsLocale={config.ttsLocale}
      />
    ))}
  </AnimatePresence>
</div>
```

- [ ] **Step 2: Replace the card's outer wrapper `motion.div` enter/exit animations**

In `SwipeableWordCard`, find the outermost `<motion.div>` (around line 444) and replace its props with:

```tsx
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, transition: { duration: 0.22 } }}
  transition={{ delay: Math.min(index * 0.02, 0.18), type: 'spring', stiffness: 380, damping: 28 }}
  style={{ position: 'relative', overflow: 'hidden' }}
  layout
>
```

The `layout` prop tells Framer to animate siblings into the gap left by the exiting card.

- [ ] **Step 3: Manual verification**

Run dev server: `npm run dev`. Open `http://localhost:3000/vocabulary/people` in a desktop browser. Swipe a card right (drag with mouse). Expected: card collapse-fades out, the next card from the visible list animates into its slot with a soft spring. After 10 archives in a row in one category, the visible list shrinks and eventually shows the empty state from Task 7.

- [ ] **Step 4: Commit**

```bash
git add app/vocabulary/[category]/page.tsx
git commit -m "feat(vocab): collapse-fade exit + spring slide-in for archive replacement"
```

---

## Task 5: Deck-health pill in the header

**Files:**
- Modify: `app/vocabulary/[category]/page.tsx`

The header band already shows the category title + a 12px progress bar (lines 304-341). Insert a new "deck health" pill between the `<Tag>` (line 305) and the category title — `🃏 N fresh · N archived`.

- [ ] **Step 1: Add the deck-health pill markup**

Find the existing `<Tag>` line that renders `vocab · {learnedCount} / {totalCount} explored` (around line 305). Just below it (still inside the same `<div style={{ marginTop: 10, maxWidth: 480, margin: '10px auto 0' }}>` block), add:

```tsx
<div
  style={{
    marginTop: 8,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 12px',
    borderRadius: 99,
    background: W,
    border: BORDER.sticker,
    boxShadow: SHADOW.chip,
    fontFamily: FONTS.display,
    fontWeight: 800,
    fontSize: 12,
    color: COLORS.ink,
    letterSpacing: 0.2,
  }}
>
  🃏 <span style={{ color: COLORS.orange }}>{freshCount}</span> fresh
  <span style={{ color: COLORS.ink45, marginInline: 4 }}>·</span>
  <span style={{ color: COLORS.green }}>{archivedCount}</span> archived
</div>
```

- [ ] **Step 2: Derive `freshCount` + `archivedCount` near the existing `learnedCount` derivation**

Just above the `return` (around line 210, near `const learnedCount = learnedSet.size`):

```ts
const archivedCount = archivedWords.length
const freshCount = (category?.words.length ?? 0) - archivedCount
```

- [ ] **Step 3: Manual verification**

Open the dev server, navigate to a vocab category. Confirm the pill appears below the cream `vocab · N/M explored` tag, reads `🃏 X fresh · 0 archived` on first load. Swipe a card right. The pill updates live: `X-1 fresh · 1 archived`.

- [ ] **Step 4: Commit**

```bash
git add app/vocabulary/[category]/page.tsx
git commit -m "feat(vocab): deck-health pill (fresh / archived) in category header"
```

---

## Task 6: Archived fold with tap-to-restore

**Files:**
- Modify: `app/vocabulary/[category]/page.tsx`

Below the visible list, add a collapsed-by-default fold. Expanded: muted archived cards each with an `↺ restore` pill.

- [ ] **Step 1: Add fold expanded-state**

Near the other `useState` declarations at the top of `CategoryPage`:

```ts
const [archivedFoldOpen, setArchivedFoldOpen] = useState(false)
```

- [ ] **Step 2: Add the restore handler**

Below the existing swipe handlers:

```ts
const handleRestore = useCallback(
  (word: VocabWord) => {
    playSound('pop')
    removeArchived(config.storagePrefix, word.hindi)
    setArchivedSet((prev) => {
      const next = new Set(prev)
      next.delete(word.hindi)
      return next
    })
  },
  [config.storagePrefix],
)
```

- [ ] **Step 3: Render the fold below the visible list**

Just below the `</AnimatePresence></div>` that wraps the visible cards (the end of the existing map block around line 381), still inside the outer body `<div>`:

```tsx
{archivedWords.length > 0 && (
  <div style={{ marginTop: 18 }}>
    <button
      type="button"
      onClick={() => {
        setArchivedFoldOpen((v) => !v)
        playSound('tap')
      }}
      style={{
        width: '100%',
        padding: '12px 16px',
        background: W,
        color: COLORS.ink,
        border: BORDER.sticker,
        boxShadow: SHADOW.chip,
        borderRadius: 99,
        fontFamily: FONTS.display,
        fontWeight: 800,
        fontSize: 13,
        cursor: 'pointer',
        textTransform: 'lowercase',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      aria-expanded={archivedFoldOpen}
    >
      <span>✓ {archivedWords.length} archived</span>
      <span style={{ color: COLORS.ink60 }}>{archivedFoldOpen ? 'hide ▴' : 'show ▾'}</span>
    </button>

    <AnimatePresence initial={false}>
      {archivedFoldOpen && (
        <motion.div
          key="archived-fold"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          style={{ overflow: 'hidden' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            {archivedWords.map((word) => (
              <Sticker key={word.hindi} color={COLORS.creamBg} radius={14} padding={12}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.78 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: FONTS.display,
                        fontWeight: 800,
                        fontSize: 15,
                        color: COLORS.ink,
                        letterSpacing: -0.2,
                      }}
                    >
                      {word.hindi}
                    </div>
                    <div
                      style={{
                        marginTop: 2,
                        fontFamily: FONTS.body,
                        fontWeight: 700,
                        fontSize: 12,
                        color: COLORS.ink60,
                      }}
                    >
                      {word.english}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRestore(word)}
                    aria-label={`Restore ${word.hindi}`}
                    style={{
                      padding: '6px 12px',
                      background: W,
                      color: COLORS.ink,
                      border: BORDER.thin,
                      borderRadius: 99,
                      fontFamily: FONTS.display,
                      fontWeight: 800,
                      fontSize: 11,
                      cursor: 'pointer',
                      textTransform: 'lowercase',
                      flexShrink: 0,
                    }}
                  >
                    ↺ restore
                  </button>
                </div>
              </Sticker>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)}
```

- [ ] **Step 4: Manual verification**

Dev server. Archive 3-4 cards. Confirm the `✓ N archived — show ▾` button appears below the deck. Tap to expand → muted cards visible with restore pills. Tap restore on one → fold count decrements, restored word reappears in the visible deck at its sorted position (next archive draws it back if it's first-in-order; immediately visible if the deck has < 10 cards).

- [ ] **Step 5: Commit**

```bash
git add app/vocabulary/[category]/page.tsx
git commit -m "feat(vocab): archived fold with tap-to-restore"
```

---

## Task 7: "All done!" empty state

**Files:**
- Modify: `app/vocabulary/[category]/page.tsx`

When `visibleWords.length === 0` (everything is archived in this category), replace the deck area with a celebration sticker.

- [ ] **Step 1: Render the empty-state block conditionally before the deck**

Replace the body content block (the `<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>...AnimatePresence...</div>` from Task 4) with:

```tsx
{visibleWords.length === 0 ? (
  <Sticker color={COLORS.mint2} radius={22} padding={24}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 42 }}>🎉</div>
      <div
        style={{
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 22,
          color: COLORS.ink,
          marginTop: 8,
          letterSpacing: -0.4,
        }}
      >
        all done in this category!
      </div>
      <div
        style={{
          fontFamily: FONTS.body,
          fontWeight: 700,
          fontSize: 13,
          color: COLORS.ink60,
          marginTop: 6,
        }}
      >
        {archivedCount} {archivedCount === 1 ? 'word' : 'words'} archived — nice work
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
        {archivedWords.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setArchivedFoldOpen(true)
              playSound('tap')
            }}
            style={{
              padding: '10px 16px',
              background: W,
              color: COLORS.ink,
              border: BORDER.sticker,
              boxShadow: SHADOW.chip,
              borderRadius: 99,
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 12,
              cursor: 'pointer',
              textTransform: 'lowercase',
            }}
          >
            show archived ▾
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            playSound('tap')
            router.push('/vocabulary')
          }}
          style={{
            padding: '10px 16px',
            background: COLORS.orange,
            color: W,
            border: BORDER.sticker,
            boxShadow: SHADOW.chip,
            borderRadius: 99,
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 12,
            cursor: 'pointer',
            textTransform: 'lowercase',
          }}
        >
          other categories →
        </button>
      </div>
    </div>
  </Sticker>
) : (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    <AnimatePresence initial={false}>
      {visibleWords.map((word, index) => (
        <SwipeableWordCard
          key={word.hindi}
          word={word}
          index={index}
          isFlipped={flippedCard === word.hindi}
          isReview={reviewSet.has(word.hindi)}
          onTap={handleCardTap}
          onSwipeRight={handleSwipeRight}
          onSwipeLeft={handleSwipeLeft}
          ttsLocale={config.ttsLocale}
        />
      ))}
    </AnimatePresence>
  </div>
)}
```

- [ ] **Step 2: Manual verification**

Dev server. In a small test category (or via DevTools console: archive all words via `localStorage`), confirm the empty state appears with the correct word count and that both CTAs work. Tap `show archived ▾` → fold below expands. Tap `other categories →` → routes to `/vocabulary`.

- [ ] **Step 3: Commit**

```bash
git add app/vocabulary/[category]/page.tsx
git commit -m "feat(vocab): all-done empty state when category fully archived"
```

---

## Task 8: Per-category archive count chip on `/vocabulary` home

**Files:**
- Modify: `app/vocabulary/page.tsx`

Each category card on the home grid currently shows `N / total explored`. Add an archived count chip beside it.

- [ ] **Step 1: Read the existing vocab home page to find the subtitle line**

Run: `grep -n "explored" /home/user/learn-hindi/app/vocabulary/page.tsx`

Identify the line that renders the per-category progress text (the `explored` substring). Confirm the structure so the chip can be slotted nearby.

- [ ] **Step 2: Import the archive lib**

Add to the imports near the top of `app/vocabulary/page.tsx`:

```ts
import { getArchived } from '@/lib/vocab-archive'
```

- [ ] **Step 3: Compute the archived intersection per category**

Inside the component, derive a `Map<categoryId, number>` of archive counts. Place this near where the page already builds its per-category stats (e.g., right after the existing learned-count computation):

```ts
const archivedByCategory = useMemo(() => {
  if (typeof window === 'undefined') return new Map<string, number>()
  const archived = new Set(getArchived(config.storagePrefix))
  const out = new Map<string, number>()
  for (const cat of categories) {
    const count = cat.words.reduce((sum, w) => (archived.has(w.hindi) ? sum + 1 : sum), 0)
    out.set(cat.id, count)
  }
  return out
}, [categories, config.storagePrefix])
```

(If the page already imports `useMemo`, no import change needed. If `categories` is named differently in the file — `allCategories`, etc. — match the local binding.)

- [ ] **Step 4: Render the archived chip beside each category's explored count**

In the JSX for each category card, immediately after the existing `N / total explored` line, render:

```tsx
{(archivedByCategory.get(category.id) ?? 0) > 0 && (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      marginLeft: 6,
      padding: '2px 8px',
      borderRadius: 99,
      background: COLORS.mint2,
      border: BORDER.thin,
      fontFamily: FONTS.display,
      fontWeight: 800,
      fontSize: 10,
      color: COLORS.ink,
      letterSpacing: 0.3,
    }}
  >
    ✓ {archivedByCategory.get(category.id)}
  </span>
)}
```

- [ ] **Step 5: Smoke-run + manual verification**

```bash
npx tsc --noEmit 2>&1 | grep -v "__tests__" | head -10
```

Then in the dev server, visit `/vocabulary`. Each category card should show its existing `N / M explored` plus a mint chip `✓ K` to the right when K > 0.

- [ ] **Step 6: Commit**

```bash
git add app/vocabulary/page.tsx
git commit -m "feat(vocab): show archived count chip per category on home grid"
```

---

## Task 9: Write `scripts/generate-vocab.mjs`

**Files:**
- Create: `scripts/generate-vocab.mjs`

A one-shot Node script (not a cron) that drafts N new vocab words for a given category via Gemini, validates them against a Zod schema, and writes the output to `content/vocabulary-draft.json` for the user to eyeball and merge. Modeled on `scripts/generate-lesson.mjs`.

- [ ] **Step 1: Read the existing generator for the established patterns**

Run: `head -60 /home/user/learn-hindi/scripts/generate-lesson.mjs`

Note: ai-sdk `google` factory, `generateObject` from `ai`, Zod schema, `repoRoot` calc, dry-run flag handling.

- [ ] **Step 2: Create `scripts/generate-vocab.mjs`**

```js
#!/usr/bin/env node
// scripts/generate-vocab.mjs
//
// One-shot vocab expansion generator. Drafts N new words for a single
// category via Gemini, validates them against the existing VocabWord
// schema, writes the draft to content/vocabulary-draft.json. The user
// reviews and merges the entries into content/vocabulary.json manually.
//
// Usage:
//   GOOGLE_GENERATIVE_AI_API_KEY=… node scripts/generate-vocab.mjs --category food --count 35
//   GOOGLE_GENERATIVE_AI_API_KEY=… node scripts/generate-vocab.mjs --category everyday --count 35 --dry-run

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const repoRoot = resolve(__dirname, '..')

const args = process.argv.slice(2)
const categoryId = args.find((a) => a.startsWith('--category='))?.split('=')[1]
  ?? (args.includes('--category') ? args[args.indexOf('--category') + 1] : null)
const countArg = args.find((a) => a.startsWith('--count='))?.split('=')[1]
  ?? (args.includes('--count') ? args[args.indexOf('--count') + 1] : '35')
const count = Number(countArg)
const dryRun = args.includes('--dry-run')

if (!categoryId) {
  console.error('Usage: node scripts/generate-vocab.mjs --category <id> [--count N] [--dry-run]')
  process.exit(2)
}
if (!Number.isFinite(count) || count < 1 || count > 100) {
  console.error('--count must be a finite number between 1 and 100')
  process.exit(2)
}

const VOCAB_PATH = join(repoRoot, 'content', 'vocabulary.json')
const DRAFT_PATH = join(repoRoot, 'content', 'vocabulary-draft.json')

const vocabRaw = JSON.parse(readFileSync(VOCAB_PATH, 'utf8'))
const category = vocabRaw.categories.find((c) => c.id === categoryId)
if (!category) {
  console.error(`Unknown category '${categoryId}'. Available: ${vocabRaw.categories.map((c) => c.id).join(', ')}`)
  process.exit(2)
}

const existingHindi = new Set(category.words.map((w) => w.hindi))

const STYLE_GUIDE = `
ROMANIZATION RULES (canonical from CONTENT.md):
- No Devanagari. Romanized Hindi only.
- 'chh' not 'cc' for aspirated cha (e.g., 'achchha', 'pakka' is fine).
- Single-vowel endings: 'karta' (not 'kartaa'), 'doosra' (not 'dusra'), 'woh' (not 'wo'), 'hum' (not 'ham').
- Pronunciation hints use lowercase hyphenated syllables with CAPS on stressed syllables (e.g., 'naa-MUS-tay').
- A1-A2 difficulty: everyday vocab, no obscure literary words.

VOCAB WORD SCHEMA (must match exactly):
- hindi: the romanized headword (string)
- pronunciation: hyphenated syllable hint (string)
- english: short English gloss (string, lowercase preferred unless proper noun)
- example: one short Hindi example sentence using the word, romanized (string)
- type: part of speech in lowercase (string) — e.g., 'noun', 'verb', 'adjective', 'adverb', 'pronoun', 'phrase'

STYLE:
- No AI clichés ('certainly', 'absolutely', emojis).
- Examples should sound like real conversational Hindi, not textbook prose.
- Avoid duplicates of the existing words listed below.
`

const VocabWordSchema = z.object({
  hindi: z.string().min(1),
  pronunciation: z.string().min(1),
  english: z.string().min(1),
  example: z.string().min(1),
  type: z.string().min(1),
})
const ResponseSchema = z.object({
  words: z.array(VocabWordSchema).min(1),
})

const existingList = category.words
  .map((w) => `- ${w.hindi} (${w.english})`)
  .join('\n')

const prompt = `You are a Hindi vocab content author for a romanized-Hindi learning app.

Generate ${count} NEW vocab words for the "${category.title}" category (id: ${category.id}, emoji ${category.emoji}).

${STYLE_GUIDE}

The following words ALREADY EXIST in this category — do NOT include any of them or close variants:
${existingList}

Return exactly ${count} words.`

const model = google('gemini-2.5-flash')

console.log(`Generating ${count} new '${categoryId}' words via Gemini…`)
const { object } = await generateObject({
  model,
  schema: ResponseSchema,
  prompt,
})

const filtered = object.words.filter((w) => !existingHindi.has(w.hindi))
const dropped = object.words.length - filtered.length
if (dropped > 0) {
  console.log(`Dropped ${dropped} duplicates of existing words.`)
}

const draftPayload = {
  generatedAt: new Date().toISOString(),
  categoryId: category.id,
  categoryTitle: category.title,
  emoji: category.emoji,
  count: filtered.length,
  words: filtered,
}

if (dryRun) {
  console.log('\n--- DRY RUN — would write to', DRAFT_PATH, '---')
  console.log(JSON.stringify(draftPayload, null, 2))
  process.exit(0)
}

let existingDraft = []
if (existsSync(DRAFT_PATH)) {
  try {
    const raw = JSON.parse(readFileSync(DRAFT_PATH, 'utf8'))
    existingDraft = Array.isArray(raw) ? raw : raw.batches ?? []
  } catch {
    existingDraft = []
  }
}

const merged = { batches: [...existingDraft.filter((b) => b.categoryId !== category.id), draftPayload] }
writeFileSync(DRAFT_PATH, JSON.stringify(merged, null, 2) + '\n')

console.log(`\n✓ Wrote ${filtered.length} draft words to ${DRAFT_PATH}.`)
console.log(`Review the draft, then merge approved words into content/vocabulary.json under category '${category.id}'.`)
```

- [ ] **Step 3: Dry-run the script against one category**

```bash
GOOGLE_GENERATIVE_AI_API_KEY="${GOOGLE_GENERATIVE_AI_API_KEY:-noop}" node scripts/generate-vocab.mjs --category food --count 5 --dry-run
```

Expected (if API key valid): JSON with 5 generated `food` words on stdout, no file written. If the API key isn't set, the script will fail with an auth error — that's the trigger for the user to run it locally instead.

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-vocab.mjs
git commit -m "feat(vocab): scripts/generate-vocab.mjs — one-shot Gemini expansion"
```

---

## Task 10: Update CONTENT.md inventory + storage-key docs

**Files:**
- Modify: `CLAUDE.md`
- Modify: `CONTENT.md` if it exists

Document the new lib + storage key + script so future sessions don't chase ghosts.

- [ ] **Step 1: Add a one-line entry to CLAUDE.md under Libraries**

Find the table near "### Libraries (`lib/`)" in `CLAUDE.md`. Add a new row:

```md
| `vocab-archive.ts` | Per-language archived-vocab set. `getArchived/addArchived/removeArchived/isArchived/migrateLegacyKnown`. TDD'd, 15 tests. Powers the swipe-right-archive behavior on `/vocabulary/[category]`. |
```

- [ ] **Step 2: Add the storage key to the "Storage keys (localStorage)" block in CLAUDE.md**

Append below the other `${prefix}-…` keys:

```md
- `${prefix}-vocab-archived` — JSON array of romanized Hindi headwords the user has archived from the vocab category pages. Migrated additively from the legacy global `vocab-known` on first read.
```

- [ ] **Step 3: Add a note to the Recent feature work section in CLAUDE.md**

Append at the top of the "Recent feature work log" section:

```md
**2026-05-27 wave — Vocab archive with replacement**

- New per-language archive primitive (`lib/vocab-archive.ts`, 15 tests). Right-swipe on a vocab card on `/vocabulary/[category]` now archives instead of just sorting to the bottom — the card collapse-fades out and the next unarchived word from the category pool slides in (visible list capped at 10).
- Header gains a `🃏 N fresh · N archived` deck-health pill. Below the deck, a collapsed-by-default archived fold with tap-to-restore. When a category fully archives, the deck swaps for a celebration empty state with "show archived" + "other categories" CTAs.
- `/vocabulary` grid shows a mint `✓ K` archive-count chip beside each category's explored count.
- One-shot `scripts/generate-vocab.mjs` (modeled on `scripts/generate-lesson.mjs`) drafts ~35 new words per category via Gemini, writes to `content/vocabulary-draft.json` for user review. Run per category, merge approved entries into `vocabulary.json`. Target: ~300 total words once all 6 categories are expanded.
- Legacy global `vocab-known` is preserved read-only; migration runs additively on every category page mount (idempotent).
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: vocab-archive feature in CLAUDE.md inventory + storage keys"
```

---

## Task 11: Final verification

- [ ] **Step 1: Run the full test suite**

```bash
npx vitest run --reporter=dot 2>&1 | tail -10
```

Expected: previous 228 + 15 new vocab-archive tests = **243+ tests passing**. Same 7 pre-existing test-infra failures (`@testing-library/dom` missing) — unrelated to this work.

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -v "__tests__" | head -10
```

Expected: empty output (no new errors).

- [ ] **Step 3: Run the design lint**

```bash
npm run lint:design 2>&1 | tail -5
```

Expected: `✓ lint-design: N files clean` (N is total component count — should be unchanged or one higher).

- [ ] **Step 4: Manual smoke test in the dev server**

```bash
npm run dev
```

Walk through:
1. Open `http://localhost:3000/vocabulary` — confirm the `✓ N` chip appears beside categories that have archived items.
2. Open a category. Confirm the `🃏 N fresh · 0 archived` pill.
3. Swipe a card right. Confirm collapse-fade + slide-in. Pill ticks. `✓ N archived — show ▾` button appears below.
4. Tap the fold open. Confirm muted archived card with a working `↺ restore` pill.
5. Swipe a card left. Confirm it stays in the deck with butter tint + `↺ REVIEW` indicator.
6. In another category, archive every word until empty. Confirm the celebration sticker appears with "show archived ▾" + "other categories →" CTAs and both navigate correctly.

- [ ] **Step 5: Push the branch**

```bash
git push -u origin claude/settings-daily-goals-3UPgI
```

Per branch policy, do NOT merge to `main` without explicit user approval. The user will run `/code-review` or similar before merging.

---

## Out of scope (deliberately deferred)

- Content expansion run + merge. The script exists; the user runs it locally with their `GOOGLE_GENERATIVE_AI_API_KEY` and reviews each batch by hand. Not a plan task.
- Lesson-level archive. Same primitive lifts; deferred.
- Bulk-archive triage screen.
- Swipe-to-restore.
- Dutch vocab expansion via the same script.
- Spaced-repetition reordering inside the deck.

---

## Self-review notes

- **Spec coverage:** Every spec section is implemented — data model (Task 1-2), category page UX (Tasks 3-7), home grid chip (Task 8), content pipeline (Task 9), docs (Task 10), verification (Task 11). Migration is idempotent + additive per spec. Restore-does-not-auto-insert is preserved by sourcing `visibleWords` purely from the archive set + JSON order.
- **Placeholders:** None — every code step has full code; every command is exact.
- **Type consistency:** `archivedSet` / `archivedWords` / `archivedCount` / `freshCount` / `archivedFoldOpen` consistent across Tasks 3-7. `getArchived` / `addArchived` / `removeArchived` / `isArchived` / `migrateLegacyKnown` signatures match between Task 1, Task 2, and consumers in Tasks 3, 6, 8.
- **YAGNI:** No premature category-toggle, no view-mode toggle, no dual list/deck (single-surface design from brainstorm). Restore is tap-only.
