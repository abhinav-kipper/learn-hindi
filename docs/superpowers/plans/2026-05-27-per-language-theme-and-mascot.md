# Per-language Theme + Mascot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split brand identity per language — Hindi gets a Holi-pink primary accent + keeps Cutting; Dutch keeps orange + gets a new mascot (Mr. Stroopwafels with handlebar mustache and round sunglasses).

**Architecture:** New tokens (`pink`, `pink2`) land in `tokens.ts`. A `useTheme()` hook reads `useLanguage()` and returns `{ primary, primary2, Mascot }`. A `<Mascot>` wrapper component renders the right SVG. ~30 brand-primary `COLORS.orange*` call sites flip to `theme.primary`; ~15 `<Cutting>` call sites flip to `<Mascot>`. Lesson palettes / motif tiles / status semantics unchanged.

**Tech Stack:** TypeScript / Next.js 16 App Router / Framer Motion / inline SVG / `@/components/design` Chai Galli primitives. No new deps.

---

## File Structure

| Path | Responsibility | Status |
|------|----------------|--------|
| `components/design/tokens.ts` | Add `pink`, `pink2` to COLORS | Modify |
| `components/design/MrStroopwafel.tsx` | New mascot SVG, drop-in API parity with Cutting | Create |
| `components/design/theme.ts` | `useTheme()` hook returning `{ primary, primary2, Mascot }` | Create |
| `components/design/Mascot.tsx` | Wrapper that picks Cutting vs MrStroopwafel via theme | Create |
| `components/design/index.ts` | Re-export new theme/Mascot/MrStroopwafel | Modify |
| `app/_dev/components/page.tsx` | Showcase both mascots side-by-side | Modify |
| `app/page.tsx` | Refactor brand-primary + Cutting→Mascot | Modify |
| `app/progress/page.tsx` | Refactor brand-primary + Cutting→Mascot | Modify |
| `app/vocabulary/page.tsx` | Refactor brand-primary + Cutting→Mascot | Modify |
| `app/vocabulary/[category]/page.tsx` | Refactor brand-primary (no Cutting here) | Modify |
| `app/quiz/page.tsx` | Refactor brand-primary | Modify |
| `app/practice/[id]/page.tsx` | Refactor brand-primary | Modify |
| `app/lessons/[id]/page.tsx` | Possibly refactor (uses LessonChaiGalli — check) | Verify |
| `components/design/LessonChaiGalli.tsx` | If orange CTAs there, refactor brand-primary | Verify/Modify |
| `app/mistakes/page.tsx` | Refactor brand-primary | Modify |
| `app/drill/conjugation/page.tsx` | Refactor brand-primary + Cutting→Mascot | Modify |
| `app/favorites/page.tsx` | Refactor brand-primary (playing-button state) | Modify |
| `app/onboarding/page.tsx` | Refactor PrimaryCTA orange + Cutting renders (intentional) | Modify (partial) |
| `app/settings/page.tsx` | Refactor brand-primary + Cutting→Mascot | Modify |
| `app/dutch/knm/page.tsx`, `drill/page.tsx` | Already on Dutch — refactor to `theme.primary` (no visual change since Dutch primary IS orange) | Modify |
| `app/dutch/lezen/page.tsx`, `mock/page.tsx`, `[textId]/page.tsx` | Same — refactor to `theme.primary` | Modify |
| `components/daily-review-popup.tsx` | Refactor brand-primary | Modify |
| `components/voice-button.tsx` | Refactor mic-orange to `theme.primary` | Modify |
| `components/notification-prompt.tsx` | Refactor CTA orange | Modify |
| `components/layout-shell.tsx` | Refactor daily-goal celebration card orange | Modify |
| `components/feature-tooltip.tsx` | Refactor CTA orange | Modify |
| `components/bottom-nav.tsx` | Refactor active-tab orange | Modify |
| `components/stories/StoryReader.tsx` | Refactor speaking-button orange | Modify |
| `components/design/MomentStage.tsx` | Replace direct Cutting import with Mascot | Modify |
| `components/design/StreakChip.tsx` | If it hardcodes orange — refactor | Verify/Modify |
| `components/dutch-welcome-modal.tsx` | Uses orange for Dutch onboarding — leave as-is (Dutch brand) OR refactor for consistency | Verify |
| `CLAUDE.md` | Add per-language theme + Mr. Stroopwafels mascot note | Modify |

**Decoration sites kept as `COLORS.orange` (no change):**
- `CATEGORY_PALETTE[*].motifBg` arrays in vocab pages, conjugation drill
- `tokens.ts:69` `paletteToMotifBg('peach') → COLORS.orange` (per-lesson palette derivation)
- `components/stories/characters/Nani.tsx` (sari color)
- `components/stories/scenes/NaniHouseScene.tsx` (decorative scenery)
- LessonStickerCard's "✓ DONE" badge is green, not orange — already unaffected

**Decision rule between brand vs decoration when classifying any orange call site:**
- Brand: the orange acts as the "active accent" of the current view (CTAs, progress bars, active states, streak/goal indicators, mic, speaking-button while playing)
- Decoration: the orange is fixed to a piece of lesson/cultural identity (motif tile fills, character SVGs, scene illustrations, lesson-palette per-card colors)

---

## Task 1: Add `pink` and `pink2` tokens

**Files:**
- Modify: `components/design/tokens.ts`

- [ ] **Step 1: Add the two new color constants**

In `components/design/tokens.ts`, find the `COLORS` const (the existing block with `ink`, `cream`, `peach`, `orange`, `mint`, `green`, `butter`, `rose`, `red`, etc.). Add two new entries between `orange2` and `mint`:

```ts
export const COLORS = {
  ink: '#36281e',
  ink60: '#5b4839',
  ink45: '#8a6a4a',

  cream: '#fff3cf',
  creamBg: '#fbf5e8',

  lav: '#ebe2f6',
  lav2: '#d6c8ec',

  peach: '#ffc9a8',
  peach2: '#ffe1cf',
  orange: '#f0701a',
  orange2: '#ff9b5a',

  pink: '#d63f8b',
  pink2: '#f37bb1',

  mint: '#b8e0c8',
  mint2: '#d6efde',
  teal: '#2f7d7d',
  green: '#3aa66a',

  butter: '#fde9a8',

  rose: '#f6b6c0',
  redBg: '#ffd6d6',
  red: '#e85a5a',
} as const
```

- [ ] **Step 2: Run type check + design lint**

```bash
npx tsc --noEmit 2>&1 | grep -v "__tests__" | head -10
npm run lint:design 2>&1 | tail -3
```

Expected: empty TS output; `✓ lint-design: 64 files clean` (or one higher if the dev showcase file counts).

- [ ] **Step 3: Commit**

```bash
git add components/design/tokens.ts
git commit -m "design(tokens): add pink + pink2 (Holi-pink Hindi primary)"
```

---

## Task 2: Build `MrStroopwafel.tsx` (the new mascot)

**Files:**
- Create: `components/design/MrStroopwafel.tsx`

This is the big visual component. Mirror Cutting's structure: inline SVG, mood-keyed mouth, sticker style (hard shadow on the outer wrapper handled by parent — the SVG itself has no shadow). Use the same prop API.

- [ ] **Step 1: Create the file with the full component**

Write the full file at `components/design/MrStroopwafel.tsx`:

```tsx
'use client'

import { COLORS } from './tokens'

const W = '#fff' // @design-allow: white literal
const WAFFLE_BODY = '#c89556' // @design-allow: caramel-bronze waffle body
const WAFFLE_FILLING = '#8a5a2e' // @design-allow: dark caramel sliver

type MrStroopwafelMood = 'idle' | 'happy' | 'wave' | 'sympathy' | 'wink' | 'excited' | 'sleepy'

type Props = {
  size?: number
  mood?: MrStroopwafelMood
  blink?: boolean // accepted for API parity with Cutting; no-op (sunglasses cover eyes)
  style?: React.CSSProperties
}

/**
 * Mr. Stroopwafels — the Dutch-track mascot. A caramel-waffle cookie with
 * a cream face panel, round sunglasses, a thick handlebar mustache, and a
 * sliver of dark-caramel filling peeking out the bottom edge.
 *
 * Moods (mirror Cutting's set so <Mascot> swaps drop-in):
 *   idle     — neutral mouth, flat mustache, lens sparkles
 *   happy    — open smile, mustache tips up, bigger sparkles
 *   wave     — small open smile, raised mustache on one side
 *   sympathy — slight downturn, drooping mustache
 *   wink     — one lens lifted briefly, winking eye dot underneath
 *   excited  — wide open smile, mustache tips up, lens starbursts
 *   sleepy   — sunglasses lowered, Zzz floats above, flat mouth
 */
export function MrStroopwafel({ size = 100, mood = 'idle', style }: Props) {
  const cx = 50
  const cy = 52
  const r = 38

  const mustacheUp = mood === 'happy' || mood === 'excited' || mood === 'wave'
  const mustacheDown = mood === 'sympathy'
  const winkingLeft = mood === 'wink'
  const sleepy = mood === 'sleepy'
  const excited = mood === 'excited'

  // Mouth path keyed by mood (same shape language as Cutting)
  const mouthPath =
    mood === 'happy' || mood === 'excited'
      ? `M ${cx - 6} 64 Q ${cx} 70 ${cx + 6} 64`
      : mood === 'sympathy'
        ? `M ${cx - 5} 67 Q ${cx} 63 ${cx + 5} 67`
        : mood === 'wave' || mood === 'wink'
          ? `M ${cx - 5} 65 Q ${cx} 68 ${cx + 5} 65`
          : `M ${cx - 4} 65 L ${cx + 4} 65`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={style}
      role="img"
      aria-label="Mr. Stroopwafels"
    >
      {/* Caramel filling sliver — drawn behind so it peeks out below the body */}
      <ellipse
        cx={cx}
        cy={cy + r - 6}
        rx={r - 6}
        ry={6}
        fill={WAFFLE_FILLING}
        stroke={COLORS.ink}
        strokeWidth={2.5}
      />

      {/* Body — circular waffle */}
      <circle cx={cx} cy={cy} r={r} fill={WAFFLE_BODY} stroke={COLORS.ink} strokeWidth={2.5} />

      {/* Waffle grid (4x4) — diamond crosshatch using two sets of lines, clipped to body */}
      <defs>
        <clipPath id="ms-body-clip">
          <circle cx={cx} cy={cy} r={r - 2} />
        </clipPath>
      </defs>
      <g clipPath="url(#ms-body-clip)" stroke={COLORS.ink} strokeWidth={1.4} opacity={0.55}>
        {/* horizontal grid lines */}
        {[-24, -12, 0, 12, 24].map((dy) => (
          <line key={`h${dy}`} x1={cx - r} y1={cy + dy} x2={cx + r} y2={cy + dy} />
        ))}
        {/* vertical grid lines */}
        {[-24, -12, 0, 12, 24].map((dx) => (
          <line key={`v${dx}`} x1={cx + dx} y1={cy - r} x2={cx + dx} y2={cy + r} />
        ))}
      </g>

      {/* Cream face panel */}
      <circle cx={cx} cy={cy + 2} r={22} fill={COLORS.cream} stroke={COLORS.ink} strokeWidth={2} />

      {/* Sunglasses — two round lenses + bridge */}
      <g transform={sleepy ? `translate(0,4)` : undefined}>
        {/* left lens */}
        <g transform={winkingLeft ? `translate(0,-6)` : undefined}>
          <circle
            cx={cx - 8}
            cy={cy - 2}
            r={6}
            fill={winkingLeft ? COLORS.cream : COLORS.ink}
            stroke={COLORS.ink}
            strokeWidth={2.2}
          />
          {!winkingLeft && (
            <circle cx={cx - 9.5} cy={cy - 3.5} r={1.6} fill={W} opacity={excited ? 1 : 0.85} />
          )}
          {winkingLeft && <line x1={cx - 11} y1={cy - 2} x2={cx - 5} y2={cy - 2} stroke={COLORS.ink} strokeWidth={2.2} strokeLinecap="round" />}
        </g>
        {/* right lens */}
        <circle cx={cx + 8} cy={cy - 2} r={6} fill={COLORS.ink} stroke={COLORS.ink} strokeWidth={2.2} />
        <circle cx={cx + 6.5} cy={cy - 3.5} r={1.6} fill={W} opacity={excited ? 1 : 0.85} />
        {/* bridge */}
        <line x1={cx - 2} y1={cy - 2} x2={cx + 2} y2={cy - 2} stroke={COLORS.ink} strokeWidth={2.2} strokeLinecap="round" />
      </g>

      {/* Handlebar mustache */}
      <path
        d={
          mustacheUp
            ? `M ${cx - 12} 60 Q ${cx - 8} 56 ${cx} 58 Q ${cx + 8} 56 ${cx + 12} 60 Q ${cx + 9} 62 ${cx + 6} 60 Q ${cx + 3} 62 ${cx} 60 Q ${cx - 3} 62 ${cx - 6} 60 Q ${cx - 9} 62 ${cx - 12} 60 Z`
            : mustacheDown
              ? `M ${cx - 12} 62 Q ${cx - 8} 65 ${cx} 60 Q ${cx + 8} 65 ${cx + 12} 62 Q ${cx + 9} 63 ${cx + 6} 61 Q ${cx + 3} 63 ${cx} 61 Q ${cx - 3} 63 ${cx - 6} 61 Q ${cx - 9} 63 ${cx - 12} 62 Z`
              : `M ${cx - 12} 60 Q ${cx - 8} 58 ${cx} 60 Q ${cx + 8} 58 ${cx + 12} 60 Q ${cx + 9} 62 ${cx + 6} 60 Q ${cx + 3} 62 ${cx} 60 Q ${cx - 3} 62 ${cx - 6} 60 Q ${cx - 9} 62 ${cx - 12} 60 Z`
        }
        fill={COLORS.ink}
        stroke={COLORS.ink}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />

      {/* Mouth */}
      <path d={mouthPath} fill="none" stroke={COLORS.ink} strokeWidth={2.4} strokeLinecap="round" />

      {/* Excited starbursts above lenses */}
      {excited && (
        <>
          <path d={`M ${cx - 14} ${cy - 13} l 2 0 m -1 -1 l 0 2`} stroke={COLORS.ink} strokeWidth={1.6} strokeLinecap="round" />
          <path d={`M ${cx + 14} ${cy - 13} l 2 0 m -1 -1 l 0 2`} stroke={COLORS.ink} strokeWidth={1.6} strokeLinecap="round" />
        </>
      )}

      {/* Sleepy Zzz */}
      {sleepy && (
        <text
          x={cx + 22}
          y={cy - 26}
          fill={COLORS.ink}
          fontFamily="var(--font-bricolage), sans-serif"
          fontSize="14"
          fontWeight="800"
        >
          Zz
        </text>
      )}
    </svg>
  )
}

export type { MrStroopwafelMood }
```

- [ ] **Step 2: Run type check + design lint**

```bash
npx tsc --noEmit 2>&1 | grep -v "__tests__" | head -10
npm run lint:design 2>&1 | tail -3
```

Expected: empty TS output; lint clean.

- [ ] **Step 3: Commit**

```bash
git add components/design/MrStroopwafel.tsx
git commit -m "feat(design): Mr. Stroopwafels mascot — waffle cookie with sunglasses + handlebar mustache"
```

---

## Task 3: Add `useTheme()` hook + `<Mascot>` wrapper

**Files:**
- Create: `components/design/theme.ts`
- Create: `components/design/Mascot.tsx`

- [ ] **Step 1: Create the theme hook**

Write `components/design/theme.ts`:

```ts
'use client'

import type { ComponentType } from 'react'
import { useLanguage } from '@/lib/language-context'
import { COLORS } from './tokens'
import { Cutting } from './Cutting'
import { MrStroopwafel } from './MrStroopwafel'

export type MascotMood = 'idle' | 'happy' | 'wave' | 'sympathy' | 'wink' | 'excited' | 'sleepy'

export interface MascotProps {
  size?: number
  mood?: MascotMood
  blink?: boolean
  style?: React.CSSProperties
}

export interface Theme {
  primary: string
  primary2: string
  Mascot: ComponentType<MascotProps>
}

/**
 * Resolve the active visual theme from the current language.
 * Hindi → Holi pink + Cutting (chai-cup mascot).
 * Dutch → orange (national color) + Mr. Stroopwafels (waffle-cookie mascot).
 */
export function useTheme(): Theme {
  const { language } = useLanguage()
  if (language === 'dutch') {
    return { primary: COLORS.orange, primary2: COLORS.orange2, Mascot: MrStroopwafel }
  }
  return { primary: COLORS.pink, primary2: COLORS.pink2, Mascot: Cutting }
}
```

- [ ] **Step 2: Create the Mascot wrapper**

Write `components/design/Mascot.tsx`:

```tsx
'use client'

import { useTheme, type MascotProps } from './theme'

/**
 * Theme-aware mascot. Renders Cutting for Hindi, Mr. Stroopwafels for Dutch.
 * Drop-in replacement for direct <Cutting> use anywhere in the app.
 */
export function Mascot(props: MascotProps) {
  const { Mascot: Resolved } = useTheme()
  return <Resolved {...props} />
}
```

- [ ] **Step 3: Export from the design barrel**

In `components/design/index.ts`, add at the end of the named-component exports section (around the SpeechBubble exports):

```ts
export { Mascot } from './Mascot'
export { MrStroopwafel } from './MrStroopwafel'
export { useTheme } from './theme'
export type { Theme, MascotProps, MascotMood } from './theme'
```

- [ ] **Step 4: Type check + commit**

```bash
npx tsc --noEmit 2>&1 | grep -v "__tests__" | head -10
git add components/design/theme.ts components/design/Mascot.tsx components/design/index.ts
git commit -m "feat(design): useTheme hook + Mascot wrapper for per-language identity"
```

---

## Task 4: Show Mr. Stroopwafels in the dev showcase

**Files:**
- Modify: `app/_dev/components/page.tsx`

- [ ] **Step 1: Inspect the existing Cutting showcase section**

```bash
grep -n "Cutting" /home/user/learn-hindi/app/_dev/components/page.tsx | head -10
```

Confirm the structure of the existing Cutting section (it shows all moods in a grid). Note the surrounding `<Section>` wrapper pattern.

- [ ] **Step 2: Add a parallel MrStroopwafel section right after the Cutting one**

In `app/_dev/components/page.tsx`, find the existing block:

```tsx
<Section id="cutting" title="Cutting (all 7 moods)">
```

Add `MrStroopwafel` to the import block at the top of the file (alongside `Cutting`):

```ts
import { Cutting, MrStroopwafel /* keep other existing imports */ } from '@/components/design'
```

Then add a new `<Section>` right after the closing tag of the existing Cutting section, mirroring its structure:

```tsx
<Section id="stroopwafel" title="Mr. Stroopwafels (Dutch mascot, all 7 moods)">
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
    {MOODS.map((mood) => (
      <div key={mood} style={{ textAlign: 'center' }}>
        <MrStroopwafel size={68} mood={mood} />
        <div style={{ fontSize: 10, marginTop: 4, color: '#666' }}>{mood}</div>
      </div>
    ))}
  </div>
  <div style={{ marginTop: 18 }}>
    <MrStroopwafel size={170} mood="happy" />
  </div>
</Section>
```

(Match the local color literal style used by neighboring `<div>` labels — `'#666'` is a dev-only utility color used elsewhere in this file.)

- [ ] **Step 3: Type check + commit**

```bash
npx tsc --noEmit 2>&1 | grep -v "__tests__" | head -10
git add app/_dev/components/page.tsx
git commit -m "design(dev): Mr. Stroopwafels showcase in /_dev/components"
```

---

## Task 5: Refactor brand-primary + mascot in `app/page.tsx` (home)

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Import the theme + Mascot, drop the direct Cutting import**

Find the existing barrel import in `app/page.tsx`:

```tsx
import {
  Sticker,
  Tag,
  Cutting,
  MotifIcon,
  MarigoldStrip,
  StreakChip,
  DottedBg,
  LessonStickerCard,
  COLORS,
  FONTS,
  BORDER,
  SHADOW,
  useChaina,
  canFire,
  markFired,
} from '@/components/design'
```

Replace `Cutting,` with `Mascot,` and add `useTheme,`:

```tsx
import {
  Sticker,
  Tag,
  Mascot,
  MotifIcon,
  MarigoldStrip,
  StreakChip,
  DottedBg,
  LessonStickerCard,
  COLORS,
  FONTS,
  BORDER,
  SHADOW,
  useChaina,
  useTheme,
  canFire,
  markFired,
} from '@/components/design'
```

- [ ] **Step 2: Read the theme at the top of the component**

Find the line `const { play } = useChaina()` in the `Home()` component and add the theme hook right after:

```tsx
const { play } = useChaina()
const theme = useTheme()
```

- [ ] **Step 3: Flip Cutting usage to Mascot**

Find `<Cutting size={92} />` (around line 347 of the home page header) and change to:

```tsx
<Mascot size={92} />
```

If there are additional `<Cutting>` usages further down (e.g. in the daily-goal celebration card), flip those too.

- [ ] **Step 4: Refactor brand-primary call sites**

In `app/page.tsx` find and update these specific brand-primary references:

- **Daily-goal count display:** `style={{ color: COLORS.orange }}>{todayMinutes}` → `style={{ color: theme.primary }}>{todayMinutes}`
- **Daily-goal bar gradient:** `linear-gradient(90deg, ${COLORS.orange2}, ${COLORS.orange})` → `linear-gradient(90deg, ${theme.primary2}, ${theme.primary})`
- **Continue chip progress fill** (around line 672, `background: COLORS.orange`): → `background: theme.primary`

Leave alone: any `COLORS.orange` inside `CATEGORY_PALETTE` arrays or motif tile definitions (none in this file, but verify with `grep -n "COLORS.orange" app/page.tsx`).

- [ ] **Step 5: Type check + commit**

```bash
npx tsc --noEmit 2>&1 | grep -v "__tests__" | head -10
git add app/page.tsx
git commit -m "feat(theme): wire Hindi pink primary + theme mascot on home"
```

---

## Task 6: Refactor `app/progress/page.tsx`

**Files:**
- Modify: `app/progress/page.tsx`

- [ ] **Step 1: Import swap**

Replace `Cutting,` with `Mascot,` in the design barrel import, and add `useTheme,`.

- [ ] **Step 2: Add theme hook inside the component**

Find the `export default function ProgressPage()` and add near the other top-level hook calls (after `const { language, config } = useLanguage()`):

```ts
const theme = useTheme()
```

- [ ] **Step 3: Replace `<Cutting size={62} />` with `<Mascot size={62} />`**

- [ ] **Step 4: Flip brand-primary call sites**

In `app/progress/page.tsx`:

- Streak chip Sticker color (around line 277): `<Sticker color={COLORS.orange2}` → `<Sticker color={theme.primary2}`
- Flame square background (around line 283): `background: COLORS.orange` → `background: theme.primary`
- 7-day calendar active-state (around line 343): `state === 'active' ? COLORS.orange` → `state === 'active' ? theme.primary`
- LessonRow active bar color (around line 812): `const barColor = done ? COLORS.green : pct > 0 ? COLORS.orange : 'transparent'` — refactor so the `pct > 0` branch uses `theme.primary` (LessonRow lives inside the same file; if it needs the theme, lift the value or call `useTheme()` inside it):

If `LessonRow` is a separate child component in this file, add `useTheme` there:

```ts
function LessonRow({ title, pct }: { title: string; pct: number }) {
  const theme = useTheme()
  const done = pct === 100
  const barColor = done ? COLORS.green : pct > 0 ? theme.primary : 'transparent'
  // ... rest unchanged
}
```

- [ ] **Step 5: Type check + commit**

```bash
npx tsc --noEmit 2>&1 | grep -v "__tests__" | head -10
git add app/progress/page.tsx
git commit -m "feat(theme): theme-aware progress page (streak, calendar, lesson rows)"
```

---

## Task 7: Refactor `app/vocabulary/page.tsx` + `app/vocabulary/[category]/page.tsx`

**Files:**
- Modify: `app/vocabulary/page.tsx`
- Modify: `app/vocabulary/[category]/page.tsx`

- [ ] **Step 1: `app/vocabulary/page.tsx` — import + theme hook + Cutting→Mascot**

- Swap `Cutting,` → `Mascot,` in the design import, add `useTheme,`.
- Inside `VocabularyPage()`, after `const { language, config } = useLanguage()` add `const theme = useTheme()`.
- Replace `<Cutting size={66} />` with `<Mascot size={66} />`.

- [ ] **Step 2: `app/vocabulary/page.tsx` — flip brand-primary**

- `<span style={{ color: COLORS.orange }}>{totalLearned}</span>` → `<span style={{ color: theme.primary }}>{totalLearned}</span>`
- `linear-gradient(90deg, ${COLORS.orange2}, ${COLORS.orange})` → `linear-gradient(90deg, ${theme.primary2}, ${theme.primary})`
- Per-category progress bar fill `progressPct === 100 ? COLORS.green : COLORS.orange` → `progressPct === 100 ? COLORS.green : theme.primary`

LEAVE the `CATEGORY_PALETTE` array unchanged — those `motifBg: COLORS.orange` entries are decoration.

- [ ] **Step 3: `app/vocabulary/[category]/page.tsx` — import + theme hook**

- Add `useTheme,` to the design import.
- Inside `CategoryPage()`, after `const { language, config } = useLanguage()` add `const theme = useTheme()`.
- No `<Cutting>` to swap in this file.

- [ ] **Step 4: `app/vocabulary/[category]/page.tsx` — flip brand-primary**

- `🃏 <span style={{ color: COLORS.orange }}>{freshCount}</span>` → `theme.primary`
- Progress bar gradient (line ~382): `background: learnedPct === 100 ? COLORS.green : COLORS.orange` → `theme.primary` in the not-100 branch
- Empty-state CTA "other categories →" `background: COLORS.orange` → `theme.primary`
- Archived-fold restore button playing state `background: speaking ? COLORS.orange` → `theme.primary` (the orange used as "currently speaking" indicator on the TTS pill is brand-accent)

LEAVE: `CATEGORY_PALETTE_BY_INDEX` array entries with `motifBg: COLORS.orange`.

The `SwipeableWordCard` (defined later in the same file) uses `background: speaking ? COLORS.orange : W` for its TTS pill. That's a brand-accent — flip to use `theme.primary`. Since `SwipeableWordCard` is a child component, the cleanest approach is to thread `theme.primary` as a new `accentColor` prop (or call `useTheme()` inside the child):

```ts
function SwipeableWordCard({ /* existing props */ }) {
  const theme = useTheme()
  // ...
  // later in JSX:
  // background: speaking ? theme.primary : W
}
```

- [ ] **Step 5: Type check + commit**

```bash
npx tsc --noEmit 2>&1 | grep -v "__tests__" | head -10
git add app/vocabulary/page.tsx app/vocabulary/[category]/page.tsx
git commit -m "feat(theme): theme-aware vocabulary home + category pages"
```

---

## Task 8: Refactor `app/quiz/page.tsx`, `app/practice/[id]/page.tsx`, `app/lessons/[id]/page.tsx` + `LessonChaiGalli.tsx`

**Files:**
- Modify: `app/quiz/page.tsx`
- Modify: `app/practice/[id]/page.tsx`
- Modify: `app/lessons/[id]/page.tsx` (verify; likely no direct changes since it delegates to LessonChaiGalli)
- Modify: `components/design/LessonChaiGalli.tsx`

- [ ] **Step 1: Quiz — flip brand-primary**

```bash
grep -n "COLORS.orange" /home/user/learn-hindi/app/quiz/page.tsx
```

Add `useTheme,` to the design import. Inside the `QuizPage()` component, call `const theme = useTheme()`. Replace each brand-primary `COLORS.orange` with `theme.primary`:
- Active question pill indicator (line ~304): the orange used to highlight current question state → `theme.primary`
- The orange Sticker/CTA at line ~392 → `theme.primary`

Leave any `COLORS.orange` inside per-question palette derivation (none here, but verify).

- [ ] **Step 2: Practice — flip brand-primary**

```bash
grep -n "COLORS.orange" /home/user/learn-hindi/app/practice/[id]/page.tsx
```

Add `useTheme,` import, call inside the component. Replace orange that drives the send-button or active-mic background with `theme.primary`. The orange at line ~846 (`background: COLORS.orange`) is the active send-button — brand-primary, flip.

- [ ] **Step 3: LessonChaiGalli — verify + flip if needed**

```bash
grep -n "COLORS.orange" /home/user/learn-hindi/components/design/LessonChaiGalli.tsx
```

If this file has `COLORS.orange` for "next phrase" / "mark complete" CTAs or progress segments, flip those to `theme.primary` via `useTheme()`. The lesson palette derivation (`deriveLessonStyle`) is decoration — leave it.

- [ ] **Step 4: Lessons page** — likely no direct `COLORS.orange` references (delegates to LessonChaiGalli). Verify with:

```bash
grep -n "COLORS.orange" /home/user/learn-hindi/app/lessons/\[id\]/page.tsx
```

If nothing matches, no edit needed.

- [ ] **Step 5: Type check + commit**

```bash
npx tsc --noEmit 2>&1 | grep -v "__tests__" | head -10
git add app/quiz/page.tsx app/practice/[id]/page.tsx components/design/LessonChaiGalli.tsx app/lessons/\[id\]/page.tsx
git commit -m "feat(theme): theme-aware quiz / practice / lesson views"
```

---

## Task 9: Refactor `app/mistakes/page.tsx` + `app/drill/conjugation/page.tsx`

**Files:**
- Modify: `app/mistakes/page.tsx`
- Modify: `app/drill/conjugation/page.tsx`

- [ ] **Step 1: Mistakes — import + theme + brand-primary flips**

- Add `useTheme,` to design import (no `<Cutting>` in this file based on the grep).
- Inside `MistakesPage()`, add `const theme = useTheme()`.
- Flip these brand-primary lines:
  - Drill-all CTA `color={COLORS.orange}` (line ~189) → `color={theme.primary}`
  - Drill bottom-sheet active button `background: COLORS.orange` (line ~670) → `theme.primary`
  - Tag bg `bg={COLORS.orange}` (line ~694) → `bg={theme.primary}`
  - Drill progress dots active state `i === index ? COLORS.orange : W` (line ~736) → `theme.primary`

- [ ] **Step 2: Conjugation drill — import + theme + Cutting→Mascot + brand-primary**

- Swap `Cutting,` → `Mascot,`, add `useTheme,`.
- `const theme = useTheme()` inside the component.
- Replace both `<Cutting size={66} />` and `<Cutting size={150} mood={...} />` with `<Mascot ... />`.
- Flip brand-primary:
  - Done-screen Sticker active accent (line ~470) `background: COLORS.orange` → `theme.primary`
  - Progress dots active (line ~630) → `theme.primary`
  - Mascot reaction sticker (line ~668) → `theme.primary`

Leave `CATEGORY_PALETTE` motifBg entries — those are decoration.

- [ ] **Step 3: Type check + commit**

```bash
npx tsc --noEmit 2>&1 | grep -v "__tests__" | head -10
git add app/mistakes/page.tsx app/drill/conjugation/page.tsx
git commit -m "feat(theme): theme-aware mistakes + conjugation drill"
```

---

## Task 10: Refactor onboarding, settings, favorites

**Files:**
- Modify: `app/onboarding/page.tsx`
- Modify: `app/settings/page.tsx`
- Modify: `app/favorites/page.tsx`

- [ ] **Step 1: Onboarding — partial refactor**

Onboarding runs BEFORE the user picks a language. Cutting is intentionally always the mascot here (Hindi-coded welcome flow). **Do NOT swap Cutting for Mascot in onboarding.** The PrimaryCTA orange button (line ~209) is also intentional — the onboarding is the first impression of the Hindi track and should use the brand primary the user is signing up for.

For onboarding only: keep `COLORS.orange` for the PrimaryCTA and the progress-pill `i < slide ? COLORS.orange : W` (line ~129) as-is. **No changes to this file in this task.** Skip step 1.

- [ ] **Step 2: Settings — import + theme + Cutting→Mascot + brand-primary**

- Swap `Cutting,` → `Mascot,`, add `useTheme,`.
- `const theme = useTheme()` inside `SettingsPage()`.
- Replace `<Cutting size={62} />` with `<Mascot size={62} />`.
- Flip the orange "reset progress" confirm button background (the `yes, wipe it` button uses `COLORS.red`, not orange — leave it). Search for `COLORS.orange` in the file:

```bash
grep -n "COLORS.orange" /home/user/learn-hindi/app/settings/page.tsx
```

The "more settings" tap / language toggle "Hindi" selected sticker uses `COLORS.peach` — that's a palette tile, not brand-primary. Leave it. **If the grep returns no brand-primary `COLORS.orange*` lines, no flips needed.**

- [ ] **Step 3: Favorites — flip brand-primary playing state**

- Add `useTheme,` to import. `const theme = useTheme()` inside the component.
- The TTS playing-button at line ~291 uses `background: isPlaying ? COLORS.orange : W` — flip to `theme.primary`.

- [ ] **Step 4: Type check + commit**

```bash
npx tsc --noEmit 2>&1 | grep -v "__tests__" | head -10
git add app/settings/page.tsx app/favorites/page.tsx
git commit -m "feat(theme): theme-aware settings + favorites (onboarding stays Hindi-coded)"
```

---

## Task 11: Refactor Dutch-track pages (KNM, Lezen)

**Files:**
- Modify: `app/dutch/knm/page.tsx`
- Modify: `app/dutch/knm/drill/page.tsx`
- Modify: `app/dutch/lezen/page.tsx`
- Modify: `app/dutch/lezen/mock/page.tsx`
- Modify: `app/dutch/lezen/[textId]/page.tsx`

These pages are Dutch-only — they already use orange because Dutch's brand primary IS orange. Refactoring them to `theme.primary` produces NO visual change in production (the theme resolves to orange for Dutch). The point of the refactor here is consistency — if someone later toggles the language switch from a Dutch route (unusual but possible), the page would render correctly.

- [ ] **Step 1: Per file, add `useTheme` import + hook call**

Repeat the same recipe for each of the five Dutch files: add `useTheme,` to the design import, call `const theme = useTheme()`, and replace each `COLORS.orange` brand-primary use with `theme.primary`. Leave `COLORS.orange2` decorative uses (e.g., scenery in `NaniHouseScene`) untouched — those aren't on Dutch routes anyway.

Specific lines to flip (from grep):
- `app/dutch/knm/page.tsx:83`: `<Sticker color={COLORS.orange}` → `<Sticker color={theme.primary}`
- `app/dutch/knm/drill/page.tsx:99`: same pattern, flip
- `app/dutch/knm/drill/page.tsx:135`: progress bar background `background: COLORS.orange` → `theme.primary`
- `app/dutch/lezen/page.tsx:89`: same pattern, flip
- `app/dutch/lezen/mock/page.tsx:142`: same, flip
- `app/dutch/lezen/mock/page.tsx:188`: same, flip
- `app/dutch/lezen/[textId]/page.tsx:129`: `background: alreadyStudied ? COLORS.mint : COLORS.orange` → keep mint, flip the not-studied state to `theme.primary`

- [ ] **Step 2: Type check + commit**

```bash
npx tsc --noEmit 2>&1 | grep -v "__tests__" | head -10
git add app/dutch/knm/page.tsx app/dutch/knm/drill/page.tsx app/dutch/lezen/page.tsx app/dutch/lezen/mock/page.tsx app/dutch/lezen/[textId]/page.tsx
git commit -m "feat(theme): theme-aware Dutch KNM + Lezen pages (visible primary unchanged)"
```

---

## Task 12: Refactor shared components

**Files:**
- Modify: `components/daily-review-popup.tsx`
- Modify: `components/voice-button.tsx`
- Modify: `components/notification-prompt.tsx`
- Modify: `components/layout-shell.tsx`
- Modify: `components/feature-tooltip.tsx`
- Modify: `components/bottom-nav.tsx`
- Modify: `components/stories/StoryReader.tsx`
- Modify: `components/design/MomentStage.tsx`
- Modify: `components/design/StreakChip.tsx` (verify)

- [ ] **Step 1: For each component above, add `useTheme` and flip brand-primary**

Recipe for each file:

1. Add `useTheme,` to the `@/components/design` import line.
2. Call `const theme = useTheme()` at the top of the component (it must be a client component — most are).
3. Replace `COLORS.orange` with `theme.primary` and `COLORS.orange2` with `theme.primary2` for each brand-accent use.

Specific lines from grep above:
- `components/daily-review-popup.tsx:281` (next button), `:352` (Tag), `:364` (progress dot active) — all brand, flip.
- `components/voice-button.tsx:208`: `background: isListening ? COLORS.red : COLORS.orange` → mic uses orange when idle; flip the orange branch to `theme.primary`. Leave the red.
- `components/notification-prompt.tsx:134`: CTA → `theme.primary`.
- `components/layout-shell.tsx:203`, `:242`: daily-goal celebration card — `color: COLORS.orange` and `background: COLORS.orange` → `theme.primary`.
- `components/feature-tooltip.tsx:112`: CTA → `theme.primary`.
- `components/bottom-nav.tsx:221`: `const fill = active ? COLORS.orange : 'none'` → `active ? theme.primary : 'none'`.
- `components/stories/StoryReader.tsx:208`: `background: speaking ? COLORS.orange : COLORS.butter` → `speaking ? theme.primary : COLORS.butter`. Stories are Hindi-only in v1 so this will reliably read pink.

- [ ] **Step 2: MomentStage — Cutting → Mascot**

```bash
grep -n "Cutting" /home/user/learn-hindi/components/design/MomentStage.tsx | head -8
```

Replace each `<Cutting ...>` JSX usage with `<Mascot ...>`. Update the import from:

```ts
import { Cutting } from './Cutting'
```

to:

```ts
import { Mascot } from './Mascot'
```

(The voice and frequency-cap logic stays untouched — only the rendered mascot swaps.)

- [ ] **Step 3: StreakChip — verify**

```bash
grep -n "COLORS.orange" /home/user/learn-hindi/components/design/StreakChip.tsx
```

If the StreakChip hardcodes `COLORS.orange` for its flame background, refactor to use `useTheme().primary`. Note: StreakChip is in the design layer; if it adopts `useTheme()` it remains a client component. If StreakChip currently has no brand-primary hex and just uses the COLORS palette indirectly, leave it.

- [ ] **Step 4: Type check + commit**

```bash
npx tsc --noEmit 2>&1 | grep -v "__tests__" | head -10
git add components/daily-review-popup.tsx components/voice-button.tsx components/notification-prompt.tsx components/layout-shell.tsx components/feature-tooltip.tsx components/bottom-nav.tsx components/stories/StoryReader.tsx components/design/MomentStage.tsx components/design/StreakChip.tsx
git commit -m "feat(theme): theme-aware shared components + MomentStage mascot swap"
```

---

## Task 13: Sweep — any remaining orange call sites

**Files:** (verify; may be empty)

- [ ] **Step 1: Run the inventory grep**

```bash
grep -rn "COLORS.orange\b\|COLORS.orange2\b" /home/user/learn-hindi/app /home/user/learn-hindi/components --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v test\. | grep -v "_dev"
```

For each line in the output:
- If the file already has `useTheme()` and a brand-primary line was missed → flip it.
- If the line is inside a `CATEGORY_PALETTE` array, `paletteToMotifBg`, character SVG, scene SVG, or `Cutting.tsx` chai-cup body — leave it. That's decoration.
- If it's `Nani.tsx` or `NaniHouseScene.tsx` — leave (Hindi-story character/scene art).
- If it's `dutch-welcome-modal.tsx` — leave (intentionally orange for Dutch onboarding moment).

- [ ] **Step 2: Run design lint to catch any palette violations**

```bash
npm run lint:design 2>&1 | tail -5
```

Expected: `✓ lint-design: N files clean`.

- [ ] **Step 3: Commit if any changes**

```bash
git add -A
git commit -m "feat(theme): final brand-primary sweep" || echo "nothing to commit"
```

---

## Task 14: CLAUDE.md doc update

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add a recent-feature note at the top of the work log**

In `CLAUDE.md`, find `### Recent feature work log` and add this entry as the newest one:

```md
**2026-05-27 wave — Per-language theme + mascot split**

- New `useTheme()` hook + `<Mascot>` wrapper component (`components/design/theme.ts`, `components/design/Mascot.tsx`). Resolves brand identity from the active language: Hindi → Holi pink (`#d63f8b` / `#f37bb1`) + Cutting; Dutch → orange (national color) + Mr. Stroopwafels.
- New `MrStroopwafel.tsx` mascot: caramel-bronze waffle disc with 4×4 ink-grid crosshatch, cream face panel, round black sunglasses (cream sparkle dots inside), thick ink handlebar mustache, and a thin darker-caramel filling sliver peeking out the bottom edge. Same 7 mood set as Cutting (`idle/happy/wave/sympathy/wink/excited/sleepy`). Sleepy mood gets a floating `Zz` glyph; excited gets lens-starbursts; wink lifts one sunglass to reveal an eye underneath.
- ~30 brand-primary call sites flipped from hardcoded `COLORS.orange*` to `theme.primary*` across home / progress / vocab / quiz / practice / mistakes / drill / settings / favorites / daily-review / voice-button / notification-prompt / layout-shell / feature-tooltip / bottom-nav / story-reader / MomentStage.
- Lesson palette tiles, motif backgrounds (rickshaw/marigold/chai/etc.), status semantics (green = correct/done, red = wrong, butter = review), Nani/NaniHouseScene/Cutting illustrations, and the onboarding flow (intentionally Hindi-coded) are unchanged.
- Cutting unchanged; existing imports of `Cutting` swapped to `Mascot` everywhere except `/_dev/components` (which shows both) and `onboarding/page.tsx` (which intentionally always uses Cutting).
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(CLAUDE.md): per-language theme + Mr. Stroopwafels note"
```

---

## Task 15: Final verification

- [ ] **Step 1: Run the full test suite**

```bash
npx vitest run --reporter=dot 2>&1 | tail -8
```

Expected: 243 tests pass. Same 7 pre-existing test-infra failures (`@testing-library/dom` missing) untouched.

- [ ] **Step 2: TypeScript clean**

```bash
npx tsc --noEmit 2>&1 | grep -v "__tests__" | head -10
```

Expected: empty.

- [ ] **Step 3: Design lint clean**

```bash
npm run lint:design 2>&1 | tail -5
```

Expected: `✓ lint-design: N files clean`.

- [ ] **Step 4: Manual smoke test in dev**

```bash
npm run dev
```

Walk through:
- Visit `http://localhost:3000/_dev/components` — confirm Mr. Stroopwafels renders cleanly across all 7 moods. Eyeball the sunglasses (sparkles), mustache (handlebar shape), waffle grid (crosshatch visible without overpowering the face panel), and filling sliver.
- Visit `/` (Hindi default) — confirm pink streak chip flame, pink daily-goal bar, pink CTAs. Cutting still in the header.
- Toggle language to Dutch (in Settings or via the bottom-nav flag). All those return to orange. Mr. Stroopwafels appears in the header instead of Cutting.
- Visit `/progress`, `/vocabulary`, a lesson, a quiz, `/practice/<id>`, `/mistakes`, `/drill/conjugation`. Confirm brand-primary swap reads correctly on each.

- [ ] **Step 5: Push the branch**

```bash
git push -u origin <current-branch-name>
```

Confirm push succeeds. Per branch policy, do NOT merge to `main` without explicit user approval — the user runs the final merge.

---

## Out of scope (deliberately deferred)

- Visual-regression baseline refresh (`npm run test:visual:update`) — needs to be run by the user after merge.
- Chaina voice MP3 swap for Mr. Stroopwafels — currently the Dutch moments speak in the same voice as before (no audio file change). Possible follow-up if it feels off.
- Theme picker in `/settings` — not needed unless a third language ships.

---

## Self-review notes

- **Spec coverage:** Section 1 (tokens + theme hook) ↔ Tasks 1, 3. Section 2 (Mr. Stroopwafels + sunglasses + mustache) ↔ Task 2. Section 3 (rollout + boundaries) ↔ Tasks 5-13. Onboarding deliberately left out per spec ↔ called out in Task 10 step 1.
- **Placeholders:** None. Every step has concrete file paths + code. The "verify with grep" steps for ambiguous files (Lessons, StreakChip, settings) include the exact grep + the decision rule for what to flip.
- **Type consistency:** `useTheme()` returns `{ primary, primary2, Mascot }` across all tasks. `<Mascot>` accepts `size`/`mood`/`blink`/`style`. `MrStroopwafel` matches the same prop set. No naming drift.
- **YAGNI:** No SSR-flicker prevention layer (already documented as a 1-frame hydration flash, identical to existing behavior). No new audio. No new dependencies. No premature theme picker UI.
