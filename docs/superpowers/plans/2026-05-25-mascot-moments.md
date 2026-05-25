# Chaina Mascot Moments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the 11-moment Chaina mascot animation system into the Hindi app, replace the existing `cute-moments.tsx` popup with 3 new moments to cover its triggers, and ship on Web Speech (TTS) with the ElevenLabs MP3 path intact-but-dormant.

**Architecture:** A single `<ChainaProvider>` mounted in `app/layout.tsx` exposes a `useChaina()` hook returning `{ play, stop }`. The provider renders one fixed-position `<MomentStage/>` overlay that, on `play(key)`, picks a random line from `MOMENTS[key]`, renders `<Cutting>` + `<SpeechBubble>` with the configured entrance/hold/exit animations, and fires voice via a singleton `chainaVoice` (MP3 → speechSynthesis fallback). Frequency caps are gated at the consumer site via `canFire`/`markFired` helpers.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, Framer Motion (already in use), pure inline SVG (no new deps).

**Spec:** `docs/superpowers/specs/2026-05-25-mascot-moments-design.md`
**Branch:** `claude/mascot-design-impl-IseIB`

---

## Reference: paths the plan will touch

- `components/design/Cutting.tsx` — existing mascot, gets new moods
- `components/design/animations.css` — existing keyframes (don't edit)
- `app/layout.tsx` — existing `CuteMomentsProvider` wrap
- `app/page.tsx` — header `<Cutting size={92}/>` at line 177
- `components/design/LessonChaiGalli.tsx` — uses `useCuteMoments()` at lines 21, 374, 394
- `app/quiz/page.tsx` — uses `cheer()` at line 71
- `app/drill/conjugation/page.tsx` — uses `cheer()` at line 87
- `app/mistakes/page.tsx` — uses `cheer()` at line 569
- `app/practice/[id]/page.tsx` — `addMistake` call at line 230, `updateStreak` at line 302
- `components/layout-shell.tsx` — visibility-change handler at lines 24-32
- `lib/progress.ts` — `updateStreak` (void) + `getStreak` + `getSeenStreakMilestones` + `markStreakMilestoneSeen` already exist
- `lib/mistakes.ts` — `addMistake` (void) at line 82
- `components/cute-moments.tsx` — to be deleted

---

## Task 1: Add cutting-animations.css

**Files:**
- Create: `components/design/cutting-animations.css`

- [ ] **Step 1: Create the CSS file with all keyframes**

Write the file byte-identical to the handover source at `/tmp/hindi_app_2/mascot_moments/cutting-animations.css`, then append the reduced-motion override at the bottom. Final file content:

```css
/* Chaina Moment animations
 * Companion to Chai Galli animations.css.
 * Imported in app/layout.tsx after animations.css.
 */

@keyframes peek-up-right {
  0%   { transform: translate(20px, 120%) rotate(8deg); opacity: 0; }
  40%  { transform: translate(0, -10px) rotate(-4deg); opacity: 1; }
  60%  { transform: translate(0, 4px) rotate(2deg); }
  100% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
}

@keyframes peek-up-left {
  0%   { transform: translate(-20px, 120%) rotate(-8deg); opacity: 0; }
  40%  { transform: translate(0, -10px) rotate(4deg); opacity: 1; }
  60%  { transform: translate(0, 4px) rotate(-2deg); }
  100% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
}

@keyframes peek-down {
  0%   { transform: translateY(-120%) rotate(-6deg); opacity: 0; }
  50%  { transform: translateY(10px) rotate(4deg); opacity: 1; }
  100% { transform: translateY(0) rotate(0); opacity: 1; }
}

@keyframes dismiss-down {
  0%   { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(120%); opacity: 0; }
}

@keyframes wave-tilt {
  0%, 100% { transform: rotate(-10deg); }
  25%      { transform: rotate(12deg); }
  50%      { transform: rotate(-8deg); }
  75%      { transform: rotate(10deg); }
}

@keyframes excited-spin {
  0%   { transform: rotate(0) scale(1); }
  30%  { transform: rotate(-15deg) scale(0.9); }
  60%  { transform: rotate(380deg) scale(1.15); }
  100% { transform: rotate(360deg) scale(1); }
}

@keyframes walk-across {
  0%   { transform: translateX(-120px) translateY(0) rotate(-3deg); opacity: 0; }
  10%  { opacity: 1; }
  25%  { transform: translateX(25vw) translateY(-4px) rotate(2deg); }
  50%  { transform: translateX(50vw) translateY(0) rotate(-3deg); }
  75%  { transform: translateX(75vw) translateY(-4px) rotate(2deg); }
  90%  { opacity: 1; }
  100% { transform: translateX(110vw) translateY(0) rotate(-3deg); opacity: 0; }
}

@keyframes sympathy-nod {
  0%, 100% { transform: rotate(0) translateY(0); }
  30%      { transform: rotate(-6deg) translateY(2px); }
  60%      { transform: rotate(4deg) translateY(2px); }
}

@keyframes bubble-pop {
  0%   { transform: scale(0.3) translateY(8px); opacity: 0; }
  60%  { transform: scale(1.08) translateY(0); opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

@keyframes bubble-fade {
  0%   { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.92) translateY(-4px); opacity: 0; }
}

@keyframes thumb-flash {
  0%   { transform: scale(0.4) rotate(-20deg); opacity: 0; }
  40%  { transform: scale(1.2) rotate(8deg); opacity: 1; }
  70%  { transform: scale(1) rotate(0); opacity: 1; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

@keyframes poke-wobble {
  0%, 100% { transform: rotate(0) scale(1); }
  20%      { transform: rotate(-14deg) scale(1.06); }
  40%      { transform: rotate(10deg) scale(1.04); }
  60%      { transform: rotate(-6deg) scale(1.02); }
  80%      { transform: rotate(4deg) scale(1.01); }
}

@keyframes idle-peek {
  0%   { transform: translateY(70%); opacity: 0; }
  30%  { transform: translateY(40%); opacity: 1; }
  60%  { transform: translateY(45%); opacity: 1; }
  100% { transform: translateY(40%); opacity: 1; }
}

@keyframes chaina-fade-in {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  [data-chaina-moment],
  [data-chaina-moment] * {
    animation: chaina-fade-in 200ms ease forwards !important;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add components/design/cutting-animations.css
git commit -m "feat(chaina): add mascot moment keyframes"
```

---

## Task 2: Extend Cutting.tsx with new moods

**Files:**
- Modify: `components/design/Cutting.tsx`
- Create: `__tests__/components/cutting-moods.test.tsx`

The existing `idle` and `happy` cases must stay byte-identical. We add five new mood cases (`wave`, `sympathy`, `wink`, `excited`, `sleepy`) plus a `blink?: boolean` prop.

- [ ] **Step 1: Write the failing test**

Create `__tests__/components/cutting-moods.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Cutting } from '@/components/design/Cutting'

describe('Cutting moods', () => {
  it('renders idle by default', () => {
    const { container } = render(<Cutting />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders all 7 moods without throwing', () => {
    const moods = ['idle', 'happy', 'wave', 'sympathy', 'wink', 'excited', 'sleepy'] as const
    for (const mood of moods) {
      const { container } = render(<Cutting mood={mood} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    }
  })

  it('renders sparkle paths in excited eyes', () => {
    const { container } = render(<Cutting mood="excited" />)
    // sparkle path uses a star polygon: M 0 -4 L 1 -1 L 4 0...
    expect(container.innerHTML).toContain('M 0 -4 L 1 -1 L 4 0')
  })

  it('renders a wink path on the right eye when mood=wink', () => {
    const { container } = render(<Cutting mood="wink" />)
    // wink right-eye closed curve: M 68 84 Q 74 78, 80 84
    expect(container.innerHTML).toContain('M 68 84 Q 74 78, 80 84')
  })

  it('renders sympathetic downturned mouth when mood=sympathy', () => {
    const { container } = render(<Cutting mood="sympathy" />)
    // sympathy mouth: M 50 108 Q 60 100, 70 108
    expect(container.innerHTML).toContain('M 50 108 Q 60 100, 70 108')
  })

  it('renders sleepy half-lidded eyes when mood=sleepy', () => {
    const { container } = render(<Cutting mood="sleepy" />)
    // sleepy left-eye curve: M 40 82 Q 46 86, 52 82
    expect(container.innerHTML).toContain('M 40 82 Q 46 86, 52 82')
  })

  it('renders raised brows when mood=wave', () => {
    const { container } = render(<Cutting mood="wave" />)
    // wave brow: M 40 72 Q 46 68, 52 72
    expect(container.innerHTML).toContain('M 40 72 Q 46 68, 52 72')
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run __tests__/components/cutting-moods.test.tsx`
Expected: All mood-specific assertions fail (the new moods aren't implemented yet).

- [ ] **Step 3: Replace Cutting.tsx with the extended version**

Overwrite `components/design/Cutting.tsx` with:

```tsx
"use client";

import { COLORS } from "./tokens";

type CuttingMood = "idle" | "happy" | "wave" | "sympathy" | "wink" | "excited" | "sleepy";

type CuttingProps = {
  size?: number;
  mood?: CuttingMood;
  blink?: boolean;
  style?: React.CSSProperties;
};

/**
 * Cutting — the Chai Galli mascot. Anthropomorphic cutting-chai glass with
 * face, steam-arms, and saucer. Pure inline SVG.
 *
 * Moods:
 *   idle     — default smile
 *   happy    — open mouth + tongue
 *   wave     — small open smile + raised brow
 *   sympathy — slight downturn (used for wrong-answer / koi baat nahin)
 *   wink     — one eye closed, half-smirk
 *   excited  — open mouth + sparkle eyes (streak / celebration)
 *   sleepy   — half-lidded eyes, neutral mouth (idle nudge)
 */
export function Cutting({ size = 110, mood = "idle", blink = true, style }: CuttingProps) {
  const happy = mood === "happy" || mood === "excited";
  const sympathetic = mood === "sympathy";
  const sleepy = mood === "sleepy";
  const wink = mood === "wink";
  const wave = mood === "wave";

  return (
    <div style={{ width: size, height: size * 1.2, position: "relative", ...style }}>
      <svg viewBox="0 0 120 144" width="100%" height="100%" style={{ overflow: "visible" }}>
        {/* steam swirls */}
        <g style={{ transformOrigin: "40px 30px", animation: "float-y 2.6s ease-in-out infinite" }}>
          <path d="M 32 24 Q 36 14, 44 18 Q 50 22, 44 30" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.85" />
          <path d="M 32 24 Q 36 14, 44 18 Q 50 22, 44 30" stroke={COLORS.lav2} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>
        <g style={{ transformOrigin: "78px 30px", animation: "float-y 2.6s ease-in-out 0.4s infinite" }}>
          <path d="M 88 24 Q 84 14, 76 18 Q 70 22, 76 30" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.85" />
          <path d="M 88 24 Q 84 14, 76 18 Q 70 22, 76 30" stroke={COLORS.lav2} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>

        {/* saucer */}
        <ellipse cx="60" cy="132" rx="46" ry="8" fill={COLORS.ink} />
        <ellipse cx="60" cy="129" rx="44" ry="7" fill={COLORS.orange2} />
        <ellipse cx="60" cy="127" rx="38" ry="5" fill={COLORS.peach} />

        {/* cup body */}
        <path d="M 26 38 L 30 124 L 90 124 L 94 38 Z" fill={COLORS.creamBg} stroke={COLORS.ink} strokeWidth="3.5" strokeLinejoin="round" />

        {/* chai liquid */}
        <path d="M 28 44 L 30 60 L 90 60 L 92 44 Z" fill="#a55a36" />
        <ellipse cx="60" cy="44" rx="32" ry="3.5" fill="#7d4226" />

        {/* shine */}
        <path d="M 32 50 L 34 110" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.7" />

        {/* cheeks — pinker for happy/excited */}
        <ellipse cx="40" cy="92" rx={happy ? 7 : 6} ry={happy ? 5 : 4.5} fill={COLORS.rose} opacity={happy ? 1 : 0.85} />
        <ellipse cx="80" cy="92" rx={happy ? 7 : 6} ry={happy ? 5 : 4.5} fill={COLORS.rose} opacity={happy ? 1 : 0.85} />

        {/* eyes */}
        {sleepy ? (
          <>
            <path d="M 40 82 Q 46 86, 52 82" stroke={COLORS.ink} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 68 82 Q 74 86, 80 82" stroke={COLORS.ink} strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : mood === "excited" ? (
          <>
            <g transform="translate(46 82)">
              <ellipse cx="0" cy="0" rx="6" ry="8" fill={COLORS.ink} />
              <path d="M 0 -4 L 1 -1 L 4 0 L 1 1 L 0 4 L -1 1 L -4 0 L -1 -1 Z" fill="#fff" />
            </g>
            <g transform="translate(74 82)">
              <ellipse cx="0" cy="0" rx="6" ry="8" fill={COLORS.ink} />
              <path d="M 0 -4 L 1 -1 L 4 0 L 1 1 L 0 4 L -1 1 L -4 0 L -1 -1 Z" fill="#fff" />
            </g>
          </>
        ) : wink ? (
          <>
            <g style={{ transformOrigin: "46px 82px", animation: blink ? "blink 5.2s ease-in-out infinite" : "none" }}>
              <ellipse cx="46" cy="82" rx="6" ry="8" fill={COLORS.ink} />
              <circle cx="48" cy="80" r="2.2" fill="#fff" />
            </g>
            <path d="M 68 84 Q 74 78, 80 84" stroke={COLORS.ink} strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <g style={{ transformOrigin: "46px 82px", animation: blink ? "blink 5.2s ease-in-out infinite" : "none" }}>
              <ellipse cx="46" cy="82" rx="6" ry="8" fill={COLORS.ink} />
              <circle cx="48" cy="80" r="2.2" fill="#fff" />
              <circle cx="45" cy="85" r="1.2" fill="#fff" />
            </g>
            <g style={{ transformOrigin: "74px 82px", animation: blink ? "blink 5.2s ease-in-out infinite" : "none" }}>
              <ellipse cx="74" cy="82" rx="6" ry="8" fill={COLORS.ink} />
              <circle cx="76" cy="80" r="2.2" fill="#fff" />
              <circle cx="73" cy="85" r="1.2" fill="#fff" />
            </g>
            {wave && (
              <>
                <path d="M 40 72 Q 46 68, 52 72" stroke={COLORS.ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
                <path d="M 68 72 Q 74 68, 80 72" stroke={COLORS.ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
              </>
            )}
          </>
        )}

        {/* mouth */}
        {happy ? (
          <>
            <path d="M 48 102 Q 60 116, 72 102 L 72 104 Q 60 118 48 104 Z" fill={COLORS.ink} />
            <ellipse cx="60" cy="111" rx="5" ry="3" fill={COLORS.rose} />
          </>
        ) : sympathetic ? (
          <path d="M 50 108 Q 60 100, 70 108" stroke={COLORS.ink} strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : sleepy ? (
          <path d="M 54 104 L 66 104" stroke={COLORS.ink} strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : wink ? (
          <path d="M 50 102 Q 62 112, 72 100" stroke={COLORS.ink} strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M 50 102 Q 60 110, 70 102" stroke={COLORS.ink} strokeWidth="3" fill="none" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
}

export type { CuttingMood, CuttingProps };
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npx vitest run __tests__/components/cutting-moods.test.tsx`
Expected: All 7 tests pass.

- [ ] **Step 5: Run the full test suite to confirm no regressions**

Run: `npx vitest run`
Expected: All tests pass (including existing `lesson-chai-galli`, `sticker`, etc.).

- [ ] **Step 6: Commit**

```bash
git add components/design/Cutting.tsx __tests__/components/cutting-moods.test.tsx
git commit -m "feat(chaina): add wave/sympathy/wink/excited/sleepy moods to Cutting"
```

---

## Task 3: SpeechBubble component

**Files:**
- Create: `components/design/SpeechBubble.tsx`
- Create: `__tests__/components/speech-bubble.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `__tests__/components/speech-bubble.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SpeechBubble } from '@/components/design/SpeechBubble'

describe('SpeechBubble', () => {
  it('renders children as main text', () => {
    render(<SpeechBubble>hello</SpeechBubble>)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('renders caption when provided', () => {
    render(<SpeechBubble caption="missed you">arrey!</SpeechBubble>)
    expect(screen.getByText('arrey!')).toBeInTheDocument()
    expect(screen.getByText('missed you')).toBeInTheDocument()
  })

  it('applies the Chai Galli sticker recipe (2.5px ink border + 4px offset shadow)', () => {
    const { container } = render(<SpeechBubble>hi</SpeechBubble>)
    const bubble = container.firstChild as HTMLElement
    expect(bubble).toHaveStyle({
      border: '2.5px solid #36281e',
      boxShadow: '4px 4px 0 #36281e',
    })
  })

  it('renders a tail SVG', () => {
    const { container } = render(<SpeechBubble tail="bottom-right">hi</SpeechBubble>)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run __tests__/components/speech-bubble.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Create the component**

Create `components/design/SpeechBubble.tsx`:

```tsx
"use client";

import { COLORS, FONTS } from "./tokens";

type TailPos = "bottom-right" | "bottom-left" | "top-right" | "top-left";

type SpeechBubbleProps = {
  children: React.ReactNode;
  caption?: string;
  tail?: TailPos;
  bg?: string;
  width?: number;
  style?: React.CSSProperties;
};

/**
 * Sticker-style speech bubble. Same hard-shadow recipe as <Sticker>:
 * 2.5px ink border + 4px offset shadow, no blur. Tail is two stacked
 * triangles to mimic the offset shadow.
 */
export function SpeechBubble({
  children,
  caption,
  tail = "bottom-right",
  bg = "#fff",
  width = 220,
  style,
}: SpeechBubbleProps) {
  return (
    <div
      style={{
        position: "relative",
        background: bg,
        border: `2.5px solid ${COLORS.ink}`,
        borderRadius: 18,
        boxShadow: `4px 4px 0 ${COLORS.ink}`,
        padding: "10px 14px 11px",
        maxWidth: width,
        minWidth: 90,
        fontFamily: FONTS.body,
        fontSize: 14,
        fontWeight: 700,
        lineHeight: 1.25,
        color: COLORS.ink,
        ...style,
      }}
    >
      <div>{children}</div>
      {caption && (
        <div
          style={{
            fontFamily: FONTS.script,
            fontWeight: 600,
            fontSize: 14,
            lineHeight: 1,
            color: "#8a6a4a",
            marginTop: 4,
          }}
        >
          {caption}
        </div>
      )}
      <BubbleTail position={tail} />
    </div>
  );
}

function BubbleTail({ position }: { position: TailPos }) {
  const size = 14;
  const styles: Record<TailPos, React.CSSProperties> = {
    "bottom-right": { right: 14, bottom: -size + 1, transform: "rotate(0deg)" },
    "bottom-left": { left: 14, bottom: -size + 1, transform: "scaleX(-1)" },
    "top-right": { right: 14, top: -size + 1, transform: "rotate(180deg) scaleX(-1)" },
    "top-left": { left: 14, top: -size + 1, transform: "rotate(180deg)" },
  };
  return (
    <svg
      width={size + 6}
      height={size + 4}
      viewBox="0 0 20 18"
      style={{ position: "absolute", overflow: "visible", ...styles[position] }}
    >
      <path d="M 1 0 L 18 0 L 1 16 Z" fill={COLORS.ink} transform="translate(3 3)" />
      <path d="M 1 0 L 18 0 L 1 16 Z" fill="#fff" stroke={COLORS.ink} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="0" y="-2" width="20" height="3" fill="#fff" />
    </svg>
  );
}

export type { SpeechBubbleProps, TailPos };
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npx vitest run __tests__/components/speech-bubble.test.tsx`
Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add components/design/SpeechBubble.tsx __tests__/components/speech-bubble.test.tsx
git commit -m "feat(chaina): add SpeechBubble component"
```

---

## Task 4: chaina-voice singleton (lib/chaina-voice.ts)

**Files:**
- Create: `lib/chaina-voice.ts`
- Create: `__tests__/lib/chaina-voice.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/lib/chaina-voice.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('chainaVoice', () => {
  let originalAudio: typeof Audio
  let originalSpeechSynth: typeof window.speechSynthesis

  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    originalAudio = global.Audio
    originalSpeechSynth = window.speechSynthesis
  })

  afterEach(() => {
    global.Audio = originalAudio
    Object.defineProperty(window, 'speechSynthesis', { value: originalSpeechSynth, configurable: true })
  })

  it('falls back to speechSynthesis when Audio fails', async () => {
    const speakSpy = vi.fn()
    Object.defineProperty(window, 'speechSynthesis', {
      value: { speak: speakSpy, cancel: vi.fn(), getVoices: () => [], onvoiceschanged: null },
      configurable: true,
    })
    global.Audio = vi.fn().mockImplementation(() => ({
      play: vi.fn().mockRejectedValue(new Error('404')),
      pause: vi.fn(),
      set src(_: string) {},
      get src() { return '' },
      set onerror(fn: () => void) { setTimeout(fn, 0) },
      volume: 1,
    })) as unknown as typeof Audio

    const { chainaVoice } = await import('@/lib/chaina-voice')
    chainaVoice.setClipBase('/chaina')
    chainaVoice.play('tap', 0, 'fallback text')

    await new Promise(r => setTimeout(r, 50))
    expect(speakSpy).toHaveBeenCalled()
  })

  it('respects the global bolna-seekho-muted key', async () => {
    localStorage.setItem('bolna-seekho-muted', '1')
    const speakSpy = vi.fn()
    Object.defineProperty(window, 'speechSynthesis', {
      value: { speak: speakSpy, cancel: vi.fn(), getVoices: () => [], onvoiceschanged: null },
      configurable: true,
    })
    const { chainaVoice } = await import('@/lib/chaina-voice')
    chainaVoice.speak('hello')
    expect(speakSpy).not.toHaveBeenCalled()
  })

  it('respects the chaina-voice-muted key', async () => {
    localStorage.setItem('chaina-voice-muted', '1')
    const speakSpy = vi.fn()
    Object.defineProperty(window, 'speechSynthesis', {
      value: { speak: speakSpy, cancel: vi.fn(), getVoices: () => [], onvoiceschanged: null },
      configurable: true,
    })
    const { chainaVoice } = await import('@/lib/chaina-voice')
    chainaVoice.speak('hello')
    expect(speakSpy).not.toHaveBeenCalled()
  })

  it('setMuted(true) persists to chaina-voice-muted', async () => {
    const { chainaVoice } = await import('@/lib/chaina-voice')
    chainaVoice.setMuted(true)
    expect(localStorage.getItem('chaina-voice-muted')).toBe('1')
    expect(chainaVoice.isMuted()).toBe(true)
  })

  it('is a no-op when window is undefined (SSR-safe)', async () => {
    // Just confirm the module imports without throwing in jsdom
    const mod = await import('@/lib/chaina-voice')
    expect(mod.chainaVoice).toBeDefined()
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run __tests__/lib/chaina-voice.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Create the module**

Create `lib/chaina-voice.ts`:

```ts
/**
 * Chaina's voice — prefers pre-recorded MP3 clips, falls back to
 * window.speechSynthesis. SSR-safe (all window/localStorage access guarded).
 *
 * Architecture:
 *   1. Each line in moments.ts has a stable key + idx + speak string.
 *   2. Optionally pre-generate one MP3 per line via ElevenLabs into
 *      /public/chaina/<momentKey>-<idx>.mp3 (script in scripts/).
 *   3. chainaVoice.play(momentKey, idx, fallbackText) tries the MP3 first.
 *      If it 404s (or no MP3s shipped), falls back to speechSynthesis.
 *
 * Mute keys:
 *   bolna-seekho-muted  ← existing global SFX mute (also silences voice)
 *   chaina-voice-muted  ← reserved for future fine-grained toggle
 */

const PREFERRED_NAMES = [
  'Lekha', 'Veena', 'Rishi', 'Microsoft Heera',
  'Google हिन्दी',
  'Samantha', 'Karen', 'Tessa', 'Google UK English Female',
];

type SpeakOpts = {
  pitch?: number;
  rate?: number;
  volume?: number;
  lang?: string;
  voiceName?: string;
};

class ChainaVoice {
  private voices: SpeechSynthesisVoice[] = [];
  private picked: SpeechSynthesisVoice | null = null;
  private muted = false;
  private clipBase = '/chaina';
  private audio: HTMLAudioElement | null = null;
  private missing = new Set<string>();
  private initialized = false;

  private ensureInit() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;
    if ('speechSynthesis' in window) {
      this.refreshVoices();
      window.speechSynthesis.onvoiceschanged = () => this.refreshVoices();
      setTimeout(() => this.refreshVoices(), 250);
      setTimeout(() => this.refreshVoices(), 1200);
    }
    try {
      this.muted =
        localStorage.getItem('bolna-seekho-muted') === '1' ||
        localStorage.getItem('chaina-voice-muted') === '1';
    } catch {}
  }

  private refreshVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.voices = window.speechSynthesis.getVoices() || [];
    this.picked =
      this.voices.find(v => v.lang && v.lang.toLowerCase().startsWith('hi')) ||
      this.voices.find(v => v.lang === 'en-IN') ||
      PREFERRED_NAMES.map(n => this.voices.find(v => (v.name || '').includes(n))).find(Boolean) ||
      this.voices.find(v => /female|samantha|karen|tessa/i.test(v.name || '')) ||
      null;
  }

  private stopAudio() {
    if (this.audio) {
      try { this.audio.pause(); this.audio.src = ''; } catch {}
      this.audio = null;
    }
  }

  private isMutedNow(): boolean {
    if (typeof window === 'undefined') return true;
    try {
      return (
        this.muted ||
        localStorage.getItem('bolna-seekho-muted') === '1' ||
        localStorage.getItem('chaina-voice-muted') === '1'
      );
    } catch {
      return this.muted;
    }
  }

  play(momentKey: string, idx: number, fallbackText?: string): void {
    this.ensureInit();
    if (typeof window === 'undefined') return;
    if (this.isMutedNow()) return;
    this.stopAudio();
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
    const url = `${this.clipBase}/${momentKey}-${idx}.mp3`;
    if (this.missing.has(url)) {
      if (fallbackText) this.speak(fallbackText);
      return;
    }
    const audio = new Audio(url);
    audio.volume = 0.95;
    audio.onerror = () => {
      this.missing.add(url);
      if (fallbackText) this.speak(fallbackText);
    };
    audio.play().catch(() => {
      this.missing.add(url);
      if (fallbackText) this.speak(fallbackText);
    });
    this.audio = audio;
  }

  speak(text: string, opts: SpeakOpts = {}): void {
    this.ensureInit();
    if (typeof window === 'undefined') return;
    if (this.isMutedNow() || !text) return;
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text));
      u.pitch = opts.pitch ?? 1.7;
      u.rate = opts.rate ?? 0.95;
      u.volume = opts.volume ?? 0.9;
      u.lang = opts.lang ?? (this.picked?.lang) ?? 'en-IN';
      if (opts.voiceName) {
        const named = this.voices.find(v => v.name === opts.voiceName);
        if (named) u.voice = named;
      } else if (this.picked) {
        u.voice = this.picked;
      }
      window.speechSynthesis.speak(u);
    } catch {}
  }

  cancel(): void {
    this.stopAudio();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
  }

  setMuted(b: boolean): void {
    this.muted = !!b;
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('chaina-voice-muted', this.muted ? '1' : '0'); } catch {}
    }
    if (this.muted) this.cancel();
  }

  isMuted(): boolean {
    return this.isMutedNow();
  }

  setClipBase(url: string): void {
    this.clipBase = url.replace(/\/$/, '');
    this.missing.clear();
  }
}

export const chainaVoice = new ChainaVoice();
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npx vitest run __tests__/lib/chaina-voice.test.ts`
Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/chaina-voice.ts __tests__/lib/chaina-voice.test.ts
git commit -m "feat(chaina): add chainaVoice singleton with MP3-fallback-to-TTS"
```

---

## Task 5: Moments registry + line picker (components/design/moments.ts)

**Files:**
- Create: `components/design/moments.ts`
- Create: `__tests__/lib/moments-pick-line.test.ts`

The registry has 14 moments (11 from spec + 3 new: `favoriteSaved`, `conjugationCorrect`, `drillGotIt`).

- [ ] **Step 1: Write the failing test**

Create `__tests__/lib/moments-pick-line.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { MOMENTS, pickLine, resetPickLineHistory } from '@/components/design/moments'

describe('MOMENTS registry', () => {
  it('has all 14 moments', () => {
    const keys = Object.keys(MOMENTS).sort()
    expect(keys).toEqual([
      'conjugationCorrect',
      'correctAnswer',
      'drillGotIt',
      'favoriteSaved',
      'firstEver',
      'firstMistake',
      'firstOpenToday',
      'idleNudge',
      'lessonComplete',
      'phraseStreak',
      'sessionEnd',
      'streakMilestone',
      'tap',
      'welcomeBack',
      'wrongAnswer',
    ])
  })

  it('every moment has at least one line with main + speak', () => {
    for (const [key, cfg] of Object.entries(MOMENTS)) {
      expect(cfg.lines.length, `${key} has no lines`).toBeGreaterThan(0)
      for (const line of cfg.lines) {
        expect(line.main, `${key} missing main`).toBeTruthy()
        expect(line.speak, `${key} missing speak`).toBeTruthy()
      }
    }
  })

  it('silent moments have voice=false', () => {
    expect(MOMENTS.phraseStreak.voice).toBe(false)
    expect(MOMENTS.idleNudge.voice).toBe(false)
    expect(MOMENTS.favoriteSaved.voice).toBe(false)
    expect(MOMENTS.conjugationCorrect.voice).toBe(false)
    expect(MOMENTS.drillGotIt.voice).toBe(false)
  })
})

describe('pickLine', () => {
  beforeEach(() => resetPickLineHistory())

  it('returns a line and its index', () => {
    const r = pickLine('correctAnswer')
    expect(r.line).toBeDefined()
    expect(r.idx).toBeGreaterThanOrEqual(0)
    expect(MOMENTS.correctAnswer.lines[r.idx]).toBe(r.line)
  })

  it('never repeats the same index twice in a row when >1 line', () => {
    let prev = -1
    for (let i = 0; i < 50; i++) {
      const r = pickLine('welcomeBack')
      expect(r.idx).not.toBe(prev)
      prev = r.idx
    }
  })

  it('returns the only line when there is just one', () => {
    const r1 = pickLine('firstEver')
    const r2 = pickLine('firstEver')
    expect(r1.idx).toBe(0)
    expect(r2.idx).toBe(0)
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run __tests__/lib/moments-pick-line.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Create components/design/moments.ts**

```ts
/**
 * Moment registry — every Chaina appearance the app can trigger.
 * Pure data + a small line picker. No React.
 *
 * Voice strategy:
 *   - voice: true   → on play, MomentStage calls chainaVoice.play(key, idx, line.speak).
 *                     chainaVoice tries /chaina/<key>-<idx>.mp3 first, falls back to
 *                     window.speechSynthesis with the speak string.
 *   - voice: false  → silent moment (idleNudge, phraseStreak, favoriteSaved,
 *                     conjugationCorrect, drillGotIt) — don't startle / interrupt.
 */

import type { CuttingMood } from './Cutting';

export type MomentAnchor =
  | 'center'
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-edge'
  | 'inline-right'
  | 'inplace'
  | 'walk';

export type BubbleTail = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
export type BubbleSide = 'left' | 'right';

export interface Line {
  main: string;
  caption?: string;
  speak: string;
}

export interface Moment {
  label: string;
  when: string;
  anchor: MomentAnchor;
  enter: string;
  enterMs: number;
  holdMs: number;
  exit: string;
  exitMs: number;
  mood: CuttingMood;
  moodAnim?: string;
  bubbleTail: BubbleTail;
  bubbleSide: BubbleSide;
  voice: boolean;
  lines: Line[];
  sizePct: number;
}

const LINES: Record<string, Line[]> = {
  firstEver: [
    { main: 'Hi, I’m Chaina!', caption: 'your chai-buddy', speak: 'Hi, I am Chaina, your chai buddy.' },
  ],
  welcomeBack: [
    { main: 'arrey! kahan the?', caption: 'missed you, dost', speak: 'Arrey, kahan the? Missed you, dost.' },
    { main: 'chai’s getting cold!', caption: 'kab aaoge?', speak: 'Chai is getting cold. Kab aaoge?' },
    { main: 'hey, missed you', caption: 'wapas aa gaye', speak: 'Hey, missed you.' },
  ],
  firstOpenToday: [
    { main: 'namaste, dost ☸', speak: 'Namaste, dost.' },
    { main: 'shubh prabhat!', caption: 'chalo, shuru karein?', speak: 'Shubh prabhat. Chalo, shuru karein?' },
    { main: 'aaj kya seekhenge?', speak: 'Aaj kya seekhenge?' },
  ],
  phraseStreak: [
    { main: 'shabash!', speak: 'Shabash!' },
    { main: 'wah! kya baat', caption: 'on fire', speak: 'Wah, kya baat!' },
    { main: 'ekdum sahi', caption: 'keep going', speak: 'Ekdum sahi.' },
  ],
  correctAnswer: [
    { main: 'bilkul sahi!', speak: 'Bilkul sahi!' },
    { main: 'ekdum perfect', speak: 'Ekdum perfect.' },
    { main: 'kya baat hai', caption: 'aisi hi chalo', speak: 'Kya baat hai!' },
  ],
  wrongAnswer: [
    { main: 'koi baat nahin', caption: 'we’ll get it', speak: 'Koi baat nahin.' },
    { main: 'arrey, almost!', caption: 'thoda aur try karo', speak: 'Arrey, almost! Thoda aur try karo.' },
    { main: 'no worries, dost', speak: 'No worries, dost.' },
  ],
  lessonComplete: [
    { main: 'wah! shabash ✨', caption: 'chapter done!', speak: 'Wah, shabash! Chapter done.' },
    { main: 'kya baat hai!', caption: 'aage badho', speak: 'Kya baat hai. Aage badho.' },
  ],
  streakMilestone: [
    { main: '🔥 streak!', caption: 'mehnat rang laayi', speak: 'Streak! Mehnat rang laayi.' },
    { main: 'streak strong, dost', caption: 'aise hi chalte raho', speak: 'Streak strong, dost. Aise hi chalte raho.' },
  ],
  idleNudge: [
    { main: 'kya soch rahe ho?', caption: 'chalo, ek aur phrase', speak: 'Kya soch rahe ho?' },
    { main: 'thoda focus, dost', speak: 'Thoda focus, dost.' },
    { main: 'main yahaan hoon', caption: 'whenever you’re ready', speak: 'Main yahan hoon.' },
  ],
  firstMistake: [
    { main: 'saved for later', caption: 'drill karenge baad mein', speak: 'Saved for later. Drill karenge baad mein.' },
  ],
  sessionEnd: [
    { main: 'phir milte hain!', caption: 'kal milte hain', speak: 'Phir milte hain!' },
    { main: 'tata, dost ✌', caption: 'don’t forget tomorrow', speak: 'Tata, dost.' },
  ],
  tap: [
    { main: 'haan? kya hua', speak: 'Haan, kya hua?' },
    { main: 'oye!', speak: 'Oye!' },
    { main: 'chai garam hai ☕', speak: 'Chai garam hai.' },
    { main: 'bolo, dost', speak: 'Bolo, dost.' },
    { main: 'I’m Chaina!', caption: 'nice to meet you', speak: 'I am Chaina. Nice to meet you.' },
  ],
  favoriteSaved: [
    { main: 'saved ⭐', caption: 'yaad rahega', speak: 'Saved.' },
    { main: 'star added', speak: 'Star added.' },
  ],
  conjugationCorrect: [
    { main: 'sahi!', speak: 'Sahi.' },
    { main: 'ekdum theek', speak: 'Ekdum theek.' },
  ],
  drillGotIt: [
    { main: 'got it!', speak: 'Got it.' },
    { main: 'pakka', caption: 'yaad rahega', speak: 'Pakka.' },
  ],
};

export const MOMENTS: Record<string, Moment> = {
  firstEver: {
    label: 'First ever launch',
    when: 'Brand-new install',
    anchor: 'center',
    enter: 'bubble-pop', enterMs: 700, holdMs: 3200, exit: 'dismiss-down', exitMs: 600,
    mood: 'wave', moodAnim: 'wave-tilt 1.2s ease-in-out 2',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.firstEver, sizePct: 0.45,
  },
  welcomeBack: {
    label: 'Welcome back', when: '≥24h since last session',
    anchor: 'bottom-right',
    enter: 'peek-up-right', enterMs: 700, holdMs: 3400, exit: 'dismiss-down', exitMs: 600,
    mood: 'wave', moodAnim: 'wave-tilt 1.2s ease-in-out 2',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.welcomeBack, sizePct: 0.34,
  },
  firstOpenToday: {
    label: 'First open today', when: 'Same calendar day',
    anchor: 'bottom-right',
    enter: 'peek-up-right', enterMs: 600, holdMs: 1800, exit: 'dismiss-down', exitMs: 500,
    mood: 'idle', moodAnim: 'float-y 2.6s ease-in-out infinite',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.firstOpenToday, sizePct: 0.30,
  },
  phraseStreak: {
    label: 'Phrase streak', when: '3 consecutive phrase reveals',
    anchor: 'inline-right',
    enter: 'peek-up-right', enterMs: 500, holdMs: 1400, exit: 'dismiss-down', exitMs: 400,
    mood: 'happy', moodAnim: 'happy-hop 1.4s ease-in-out 1',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: false, lines: LINES.phraseStreak, sizePct: 0.24,
  },
  correctAnswer: {
    label: 'Quiz correct', when: 'User picks correct quiz option',
    anchor: 'top-right',
    enter: 'peek-down', enterMs: 500, holdMs: 1500, exit: 'dismiss-down', exitMs: 400,
    mood: 'happy', moodAnim: 'happy-hop 1.4s ease-in-out 1',
    bubbleTail: 'top-right', bubbleSide: 'left',
    voice: true, lines: LINES.correctAnswer, sizePct: 0.26,
  },
  wrongAnswer: {
    label: 'Quiz wrong', when: 'User picks wrong quiz option',
    anchor: 'top-right',
    enter: 'peek-down', enterMs: 500, holdMs: 2000, exit: 'dismiss-down', exitMs: 400,
    mood: 'sympathy', moodAnim: 'sympathy-nod 1.6s ease-in-out 1',
    bubbleTail: 'top-right', bubbleSide: 'left',
    voice: true, lines: LINES.wrongAnswer, sizePct: 0.26,
  },
  lessonComplete: {
    label: 'Lesson complete', when: 'User taps "mark chapter complete"',
    anchor: 'center',
    enter: 'bubble-pop', enterMs: 600, holdMs: 2200, exit: 'dismiss-down', exitMs: 600,
    mood: 'excited', moodAnim: 'happy-hop 1.4s ease-in-out infinite',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.lessonComplete, sizePct: 0.55,
  },
  streakMilestone: {
    label: 'Streak milestone', when: 'Streak crosses 7/14/30/50/100',
    anchor: 'walk',
    enter: 'walk-across', enterMs: 4200, holdMs: 0, exit: 'walk-across', exitMs: 0,
    mood: 'excited', moodAnim: 'wobble-z 1.0s ease-in-out infinite',
    bubbleTail: 'bottom-left', bubbleSide: 'right',
    voice: true, lines: LINES.streakMilestone, sizePct: 0.32,
  },
  idleNudge: {
    label: 'Idle nudge', when: '25s no input on lesson/practice',
    anchor: 'bottom-edge',
    enter: 'idle-peek', enterMs: 800, holdMs: 2800, exit: 'dismiss-down', exitMs: 500,
    mood: 'sleepy', moodAnim: 'float-y 3s ease-in-out infinite',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: false, lines: LINES.idleNudge, sizePct: 0.32,
  },
  firstMistake: {
    label: 'First mistake of day', when: 'First [[CORRECTION]] today',
    anchor: 'bottom-right',
    enter: 'peek-up-right', enterMs: 600, holdMs: 2000, exit: 'dismiss-down', exitMs: 500,
    mood: 'wink', moodAnim: 'float-y 2.6s ease-in-out infinite',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.firstMistake, sizePct: 0.28,
  },
  sessionEnd: {
    label: 'Session end', when: 'Backgrounded after 5+ min',
    anchor: 'bottom-right',
    enter: 'peek-up-right', enterMs: 600, holdMs: 2200, exit: 'dismiss-down', exitMs: 600,
    mood: 'wave', moodAnim: 'wave-tilt 1.2s ease-in-out 2',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.sessionEnd, sizePct: 0.30,
  },
  tap: {
    label: 'Tap on Chaina', when: 'User pokes a persistent Chaina',
    anchor: 'inplace',
    enter: 'poke-wobble', enterMs: 700, holdMs: 1300, exit: 'bubble-fade', exitMs: 300,
    mood: 'happy', moodAnim: 'poke-wobble 0.7s ease-in-out 1',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.tap, sizePct: 0.24,
  },
  favoriteSaved: {
    label: 'Favorite saved', when: 'User stars a phrase',
    anchor: 'bottom-right',
    enter: 'peek-up-right', enterMs: 500, holdMs: 1400, exit: 'dismiss-down', exitMs: 400,
    mood: 'wink', moodAnim: 'float-y 2.6s ease-in-out infinite',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: false, lines: LINES.favoriteSaved, sizePct: 0.24,
  },
  conjugationCorrect: {
    label: 'Conjugation drill correct', when: 'Correct conjugation pick',
    anchor: 'top-right',
    enter: 'peek-down', enterMs: 500, holdMs: 1400, exit: 'dismiss-down', exitMs: 400,
    mood: 'happy', moodAnim: 'happy-hop 1.4s ease-in-out 1',
    bubbleTail: 'top-right', bubbleSide: 'left',
    voice: false, lines: LINES.conjugationCorrect, sizePct: 0.24,
  },
  drillGotIt: {
    label: 'Mistakes drill got it', when: 'User taps "got it" in drill',
    anchor: 'inline-right',
    enter: 'peek-up-right', enterMs: 500, holdMs: 1400, exit: 'dismiss-down', exitMs: 400,
    mood: 'happy', moodAnim: 'happy-hop 1.4s ease-in-out 1',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: false, lines: LINES.drillGotIt, sizePct: 0.24,
  },
};

const _lastLine: Record<string, number> = {};

export function resetPickLineHistory(): void {
  for (const k of Object.keys(_lastLine)) delete _lastLine[k];
}

export function pickLine(momentKey: string): { line: Line; idx: number } {
  const cfg = MOMENTS[momentKey];
  if (!cfg) throw new Error(`Unknown moment: ${momentKey}`);
  const lines = cfg.lines;
  if (lines.length === 1) return { line: lines[0], idx: 0 };
  let i = Math.floor(Math.random() * lines.length);
  if (i === _lastLine[momentKey]) {
    i = (i + 1) % lines.length;
  }
  _lastLine[momentKey] = i;
  return { line: lines[i], idx: i };
}

export type MomentKey = keyof typeof MOMENTS;
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npx vitest run __tests__/lib/moments-pick-line.test.ts`
Expected: 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add components/design/moments.ts __tests__/lib/moments-pick-line.test.ts
git commit -m "feat(chaina): add moments registry + pickLine"
```

---

## Task 6: Frequency-cap helpers

**Files:**
- Create: `components/design/chainaFrequency.ts`
- Create: `__tests__/lib/chaina-frequency.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/lib/chaina-frequency.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { canFire, markFired } from '@/components/design/chainaFrequency'

describe('chainaFrequency', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('once-per-session', () => {
    it('returns true the first time', () => {
      expect(canFire('foo', 'once-per-session')).toBe(true)
    })

    it('returns false after markFired in the same session', () => {
      markFired('foo', 'once-per-session')
      expect(canFire('foo', 'once-per-session')).toBe(false)
    })
  })

  describe('once-per-day', () => {
    it('returns true the first time', () => {
      expect(canFire('foo', 'once-per-day')).toBe(true)
    })

    it('returns false after markFired today', () => {
      markFired('foo', 'once-per-day')
      expect(canFire('foo', 'once-per-day')).toBe(false)
    })

    it('returns true if last fired on a different day', () => {
      localStorage.setItem('chaina-freq-foo', 'Wed May 21 2025')
      expect(canFire('foo', 'once-per-day')).toBe(true)
    })
  })

  describe('debounce-800ms', () => {
    it('returns true the first time', () => {
      expect(canFire('foo', 'debounce-800ms')).toBe(true)
    })

    it('returns false within 800ms of markFired', () => {
      markFired('foo', 'debounce-800ms')
      expect(canFire('foo', 'debounce-800ms')).toBe(false)
    })

    it('returns true after >800ms', () => {
      localStorage.setItem('chaina-freq-foo', String(Date.now() - 1000))
      expect(canFire('foo', 'debounce-800ms')).toBe(true)
    })
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run __tests__/lib/chaina-frequency.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Create the module**

Create `components/design/chainaFrequency.ts`:

```ts
/**
 * Frequency-cap helpers for Chaina moments. Keeps moments from spamming.
 *
 * Modes:
 *   once-per-session  → sessionStorage flag, cleared on tab close
 *   once-per-day      → localStorage with toDateString, resets at local midnight
 *   debounce-800ms    → localStorage with timestamp, 800ms minimum gap
 *
 * Usage:
 *   if (canFire('phraseStreak', 'once-per-session')) {
 *     play('phraseStreak')
 *     markFired('phraseStreak', 'once-per-session')
 *   }
 */

export type FreqMode = 'once-per-session' | 'once-per-day' | 'debounce-800ms';

const k = (s: string) => `chaina-freq-${s}`;
const today = () => new Date().toDateString();

export function canFire(key: string, mode: FreqMode): boolean {
  if (typeof window === 'undefined') return false;
  switch (mode) {
    case 'once-per-day': {
      const last = localStorage.getItem(k(key));
      return last !== today();
    }
    case 'debounce-800ms': {
      const last = localStorage.getItem(k(key));
      if (!last) return true;
      return Date.now() - Number(last) > 800;
    }
    case 'once-per-session': {
      return !sessionStorage.getItem(k(key));
    }
  }
}

export function markFired(key: string, mode: FreqMode): void {
  if (typeof window === 'undefined') return;
  switch (mode) {
    case 'once-per-day':
      localStorage.setItem(k(key), today());
      break;
    case 'debounce-800ms':
      localStorage.setItem(k(key), String(Date.now()));
      break;
    case 'once-per-session':
      sessionStorage.setItem(k(key), '1');
      break;
  }
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npx vitest run __tests__/lib/chaina-frequency.test.ts`
Expected: 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add components/design/chainaFrequency.ts __tests__/lib/chaina-frequency.test.ts
git commit -m "feat(chaina): add frequency-cap helpers"
```

---

## Task 7: MomentStage + ChainaProvider

**Files:**
- Create: `components/design/MomentStage.tsx`
- Create: `__tests__/components/moment-stage.test.tsx`

The provider is mounted once in `app/layout.tsx`. The stage is fixed-position, pointer-events:none (so it never blocks taps), z-index 30.

- [ ] **Step 1: Write the failing test**

Create `__tests__/components/moment-stage.test.tsx`:

```tsx
import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ChainaProvider, useChaina } from '@/components/design/MomentStage'

function Trigger({ momentKey }: { momentKey: string }) {
  const { play } = useChaina()
  return <button onClick={() => play(momentKey)}>fire</button>
}

describe('MomentStage', () => {
  it('renders nothing when no moment is active', () => {
    render(
      <ChainaProvider>
        <div>app</div>
      </ChainaProvider>
    )
    // The dotted overlay container is always there; check the inner bubble is absent.
    expect(screen.queryByTestId('chaina-bubble')).not.toBeInTheDocument()
  })

  it('renders the bubble after play() is called', async () => {
    vi.useFakeTimers()
    render(
      <ChainaProvider>
        <Trigger momentKey="tap" />
      </ChainaProvider>
    )
    await act(async () => {
      screen.getByText('fire').click()
    })
    expect(screen.getByTestId('chaina-bubble')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('clears the moment after its duration', async () => {
    vi.useFakeTimers()
    render(
      <ChainaProvider>
        <Trigger momentKey="tap" />
      </ChainaProvider>
    )
    await act(async () => {
      screen.getByText('fire').click()
    })
    expect(screen.getByTestId('chaina-bubble')).toBeInTheDocument()
    // tap: enterMs 700 + holdMs 1300 + exitMs 300 = 2300ms
    await act(async () => {
      vi.advanceTimersByTime(2400)
    })
    expect(screen.queryByTestId('chaina-bubble')).not.toBeInTheDocument()
    vi.useRealTimers()
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run __tests__/components/moment-stage.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Create components/design/MomentStage.tsx**

```tsx
'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Cutting } from './Cutting'
import { SpeechBubble } from './SpeechBubble'
import { MOMENTS, pickLine, type Moment, type Line } from './moments'
import { chainaVoice } from '@/lib/chaina-voice'

type ActiveState = {
  key: string
  line: Line
  idx: number
  phase: 'enter' | 'hold' | 'exit'
}

interface ChainaAPI {
  play: (key: string) => void
  stop: () => void
}

const Ctx = createContext<ChainaAPI | null>(null)

export function ChainaProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveState | null>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => () => clearTimers(), [])

  const play = useCallback((key: string) => {
    const cfg = MOMENTS[key]
    if (!cfg) return
    clearTimers()
    const { line, idx } = pickLine(key)
    setActive({ key, line, idx, phase: 'enter' })

    if (cfg.voice && line.speak) {
      timersRef.current.push(
        setTimeout(() => chainaVoice.play(key, idx, line.speak), 200)
      )
    }

    timersRef.current.push(
      setTimeout(() => {
        setActive(s => (s && s.key === key ? { ...s, phase: 'hold' } : s))
      }, cfg.enterMs)
    )
    timersRef.current.push(
      setTimeout(() => {
        setActive(s => (s && s.key === key ? { ...s, phase: 'exit' } : s))
      }, cfg.enterMs + cfg.holdMs)
    )
    timersRef.current.push(
      setTimeout(() => {
        setActive(s => (s && s.key === key ? null : s))
      }, cfg.enterMs + cfg.holdMs + cfg.exitMs)
    )
  }, [])

  const stop = useCallback(() => {
    clearTimers()
    setActive(null)
    chainaVoice.cancel()
  }, [])

  return (
    <Ctx.Provider value={{ play, stop }}>
      {children}
      <MomentStage active={active} onTap={() => play('tap')} />
    </Ctx.Provider>
  )
}

export function useChaina(): ChainaAPI {
  const ctx = useContext(Ctx)
  if (!ctx) return { play: () => {}, stop: () => {} }
  return ctx
}

function MomentStage({ active, onTap }: { active: ActiveState | null; onTap: () => void }) {
  if (!active) return null
  const cfg = MOMENTS[active.key]
  return (
    <div
      data-chaina-moment
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 30,
        pointerEvents: 'none',
      }}
    >
      <MomentRender cfg={cfg} line={active.line} phase={active.phase} onTap={onTap} />
    </div>
  )
}

function anchorStyle(cfg: Moment, cuttingSize: number): React.CSSProperties {
  switch (cfg.anchor) {
    case 'bottom-right': return { right: 12, bottom: 16, position: 'absolute' }
    case 'bottom-left':  return { left: 12, bottom: 16, position: 'absolute' }
    case 'top-right':    return { right: 12, top: 60, position: 'absolute' }
    case 'top-left':     return { left: 12, top: 60, position: 'absolute' }
    case 'center':       return { left: '50%', top: '40%', transform: 'translate(-50%, -50%)', position: 'absolute' }
    case 'bottom-edge':  return { right: 24, bottom: -cuttingSize * 0.55, position: 'absolute' }
    case 'walk':         return { left: 0, bottom: 16, position: 'absolute' }
    case 'inline-right': return { right: 24, top: 240, position: 'absolute' }
    case 'inplace':      return { right: 18, bottom: 18, position: 'absolute' }
    default:             return { right: 12, bottom: 16, position: 'absolute' }
  }
}

function MomentRender({
  cfg,
  line,
  phase,
  onTap,
}: {
  cfg: Moment
  line: Line
  phase: 'enter' | 'hold' | 'exit'
  onTap: () => void
}) {
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 390
  const cuttingSize = Math.round(Math.min(viewportW, 480) * cfg.sizePct)
  const animByPhase: Record<typeof phase, string> = {
    enter: `${cfg.enter} ${cfg.enterMs}ms cubic-bezier(.34,1.56,.64,1) forwards`,
    hold: cfg.moodAnim || 'none',
    exit: `${cfg.exit} ${cfg.exitMs}ms ease-in forwards`,
  }
  const aStyle = anchorStyle(cfg, cuttingSize)
  const walkAnchor = cfg.anchor === 'walk'
  const bubblePos: React.CSSProperties = cfg.bubbleSide === 'left'
    ? { right: cuttingSize + 8, bottom: cuttingSize * 0.55, position: 'absolute' }
    : { left: cuttingSize + 8, bottom: cuttingSize * 0.55, position: 'absolute' }

  return (
    <>
      {phase !== 'exit' && !walkAnchor && (
        <div style={{ ...aStyle, pointerEvents: 'none' }}>
          <div
            data-testid="chaina-bubble"
            style={{
              ...bubblePos,
              animation: `bubble-pop ${Math.max(cfg.enterMs - 100, 240)}ms cubic-bezier(.34,1.56,.64,1) ${Math.max(cfg.enterMs - 280, 80)}ms backwards`,
            }}
          >
            <SpeechBubble tail={cfg.bubbleTail} caption={line.caption}>
              {line.main}
            </SpeechBubble>
          </div>
        </div>
      )}
      <div
        onClick={onTap}
        style={{
          ...aStyle,
          width: cuttingSize,
          animation: animByPhase[phase],
          cursor: 'pointer',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            animation: phase === 'hold' ? animByPhase.hold : 'none',
            transformOrigin: 'center bottom',
          }}
        >
          <Cutting size={cuttingSize} mood={cfg.mood} blink={cfg.mood !== 'sleepy'} />
        </div>
        {walkAnchor && phase !== 'exit' && (
          <div
            data-testid="chaina-bubble"
            style={{
              position: 'absolute',
              left: cuttingSize - 18,
              bottom: cuttingSize * 0.5,
              animation: 'bubble-pop 360ms cubic-bezier(.34,1.56,.64,1) 200ms backwards',
            }}
          >
            <SpeechBubble tail="bottom-left" caption={line.caption}>
              {line.main}
            </SpeechBubble>
          </div>
        )}
      </div>
    </>
  )
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npx vitest run __tests__/components/moment-stage.test.tsx`
Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add components/design/MomentStage.tsx __tests__/components/moment-stage.test.tsx
git commit -m "feat(chaina): add MomentStage + ChainaProvider with useChaina hook"
```

---

## Task 8: Update design barrel exports

**Files:**
- Modify: `components/design/index.ts`

- [ ] **Step 1: Add new exports**

Edit `components/design/index.ts`. Find the existing `export { ChaiGalliChatMessage, TypingDots } from './ChaiGalliChatMessage'` line and add below it:

```ts
export { SpeechBubble } from './SpeechBubble'
export { ChainaProvider, useChaina } from './MomentStage'
export { MOMENTS, pickLine, resetPickLineHistory } from './moments'
export type { Moment, MomentKey, Line, MomentAnchor } from './moments'
export { canFire, markFired } from './chainaFrequency'
export type { FreqMode } from './chainaFrequency'
export type { CuttingMood, CuttingProps } from './Cutting'
```

- [ ] **Step 2: Run typecheck to ensure exports resolve**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/design/index.ts
git commit -m "chore(chaina): re-export Chaina API from design barrel"
```

---

## Task 9: Wire app/layout.tsx — replace provider, mount stage, import CSS

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace CuteMomentsProvider with ChainaProvider**

Edit `app/layout.tsx`:

- Replace import `import { CuteMomentsProvider } from '@/components/cute-moments'` with `import { ChainaProvider } from '@/components/design'`
- Add `import '@/components/design/cutting-animations.css'` directly below the existing `import '@/components/design/animations.css'` line
- Replace the `<CuteMomentsProvider>...</CuteMomentsProvider>` wrap with `<ChainaProvider>...</ChainaProvider>`

The relevant before/after diff:

```diff
 import './globals.css'
 import '@/components/design/animations.css'
+import '@/components/design/cutting-animations.css'
 import { InstallPrompt } from '@/components/install-prompt'
 import { LayoutShell } from '@/components/layout-shell'
 import { LanguageProvider } from '@/lib/language-context'
-import { CuteMomentsProvider } from '@/components/cute-moments'
+import { ChainaProvider } from '@/components/design'
 ...
       <body
         className={`${bricolage.variable} ${nunito.variable} ${mochiy.variable} ${caveat.variable} min-h-screen`}
       >
         <LanguageProvider>
-          <CuteMomentsProvider>
+          <ChainaProvider>
             <LayoutShell>{children}</LayoutShell>
             <InstallPrompt />
-          </CuteMomentsProvider>
+          </ChainaProvider>
         </LanguageProvider>
       </body>
```

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: errors only for the remaining files still importing `cute-moments` (those are wired in later tasks). The layout itself should typecheck.

- [ ] **Step 3: Do NOT commit yet**

We'll commit at the end of Task 19 once all `cute-moments` callers are migrated and the file can be deleted in one atomic commit.

---

## Task 10: Wire app/page.tsx — header tap + last-session moments

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add imports and `useChaina`/frequency hooks**

In `app/page.tsx`, find the design imports block (line 22-35) and add `useChaina` to it. Also add the frequency helpers.

```diff
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
+  useChaina,
+  canFire,
+  markFired,
 } from '@/components/design'
```

- [ ] **Step 2: Wrap the header `<Cutting size={92}/>` in a tap-handler**

In the home component body, find the home component's body. Add right after the existing destructuring `const { language, config } = useLanguage()`:

```ts
  const { play } = useChaina()
```

Then locate the existing JSX block around line 176-178:

```tsx
            <div style={{ marginRight: -6, marginTop: -8 }}>
              <Cutting size={92} />
            </div>
```

Replace it with:

```tsx
            <div style={{ marginRight: -6, marginTop: -8 }}>
              <button
                type="button"
                onClick={() => {
                  if (canFire('tap', 'debounce-800ms')) {
                    play('tap')
                    markFired('tap', 'debounce-800ms')
                  }
                }}
                style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}
                aria-label="Chaina says hi"
              >
                <Cutting size={92} />
              </button>
            </div>
```

- [ ] **Step 3: Add the welcomeBack / firstOpenToday / firstEver mount effect**

Find the existing `useEffect` mount block (after the onboarding redirect check). Add this **new** `useEffect` right after the existing mount effect (keeping the existing one untouched):

```tsx
  useEffect(() => {
    if (!isOnboardingComplete()) return
    if (typeof window === 'undefined') return

    const FIRST_EVER_KEY = 'chaina-first-ever-seen'
    const LAST_TS_KEY = 'chaina-last-session-ts'
    const seenFirstEver = localStorage.getItem(FIRST_EVER_KEY) === '1'
    const lastTs = Number(localStorage.getItem(LAST_TS_KEY) || 0)
    const now = Date.now()
    const DAY_MS = 24 * 60 * 60 * 1000

    if (!seenFirstEver) {
      localStorage.setItem(FIRST_EVER_KEY, '1')
      localStorage.setItem(LAST_TS_KEY, String(now))
      // firstEver is fired by onboarding; here we just record and skip.
      return
    }

    // Mutex: welcomeBack OR firstOpenToday, not both
    if (canFire('welcomeBack', 'once-per-session') && canFire('firstOpenToday', 'once-per-session')) {
      const gap = now - lastTs
      if (gap >= DAY_MS) {
        play('welcomeBack')
        markFired('welcomeBack', 'once-per-session')
        markFired('firstOpenToday', 'once-per-session')
      } else {
        play('firstOpenToday')
        markFired('welcomeBack', 'once-per-session')
        markFired('firstOpenToday', 'once-per-session')
      }
    }

    localStorage.setItem(LAST_TS_KEY, String(now))
    // Run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
```

- [ ] **Step 4: Run typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors from this file.

- [ ] **Step 5: Do NOT commit yet** — same atomic commit at end of Task 19.

---

## Task 11: Wire LessonChaiGalli.tsx — replace cute-moments, add idleNudge, phraseStreak, lessonComplete, favoriteSaved

**Files:**
- Modify: `components/design/LessonChaiGalli.tsx`

- [ ] **Step 1: Swap imports**

Replace line 21 `import { useCuteMoments } from '@/components/cute-moments'` with:

```tsx
import { useChaina, canFire, markFired } from '@/components/design'
```

- [ ] **Step 2: Add lessonComplete trigger in `handleMarkComplete`**

Find `handleMarkComplete` (around line 70-86). Add `play('lessonComplete')` immediately after `playSound('levelup')`. The function body becomes:

```tsx
  const { play } = useChaina()

  const handleMarkComplete = () => {
    if (completed) return
    markLessonComplete(lesson.id, config.storagePrefix)
    updateStreak(config.storagePrefix)
    setCompleted(true)
    setCelebrate(true)
    playSound('levelup')
    play('lessonComplete')
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: [COLORS.peach, COLORS.mint, COLORS.lav2, COLORS.butter, COLORS.rose],
      ticks: 90,
      gravity: 1.1,
      scalar: 1,
    })
  }
```

(Add `const { play } = useChaina()` inside the LessonChaiGalli component body — right after `const resume = useMemo(...)`. **Do not** add another `useChaina` call inside `PhraseCard` — pass it down or call the hook again, see Step 3.)

- [ ] **Step 3: Add phraseStreak counter inside `reveal`**

In the LessonChaiGalli body, add a ref to track consecutive reveals. Just after the `const [revealed, setRevealed] = useState(...)` line, add:

```tsx
  const consecutiveRevealsRef = useRef(0)
```

(Import `useRef` from React if not already imported — `import { useEffect, useMemo, useRef, useState } from 'react'`.)

Replace the existing `reveal` function with:

```tsx
  const reveal = () => {
    if (revealed.has(idx)) return
    const next = new Set(revealed)
    next.add(idx)
    setRevealed(next)
    playSound('pop')
    markPhraseViewed(lesson.id, idx, config.storagePrefix)

    consecutiveRevealsRef.current += 1
    if (
      consecutiveRevealsRef.current >= 3 &&
      canFire(`phraseStreak-${lesson.id}`, 'once-per-session')
    ) {
      play('phraseStreak')
      markFired(`phraseStreak-${lesson.id}`, 'once-per-session')
    }
  }
```

Also reset on phrase navigation — change `go` to reset the counter:

```tsx
  const go = (dir: -1 | 1) => {
    const next = idx + dir
    if (next < 0 || next >= total) return
    setIdx(next)
    consecutiveRevealsRef.current = 0
    playSound('swipe')
    markPhraseViewed(lesson.id, next, config.storagePrefix)
    setLastActiveLesson(lesson.id, config.storagePrefix)
  }
```

- [ ] **Step 4: Add idleNudge 25s timer**

In the LessonChaiGalli body, add a useEffect that arms a 25s timer on every relevant interaction:

```tsx
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const arm = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(() => {
        if (canFire('idleNudge', 'once-per-session')) {
          play('idleNudge')
          markFired('idleNudge', 'once-per-session')
        }
      }, 25_000)
    }
    arm()
    const handlers = ['click', 'keydown', 'touchstart'] as const
    handlers.forEach(e => window.addEventListener(e, arm, { passive: true }))
    return () => {
      handlers.forEach(e => window.removeEventListener(e, arm))
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
```

- [ ] **Step 5: Replace favorite cute-moment in PhraseCard**

In the `PhraseCard` component (around line 374), replace:

```tsx
  const { show } = useCuteMoments()
```

with:

```tsx
  const { play } = useChaina()
```

And replace line 394 `if (next) show('⭐', 'Saved!')` with:

```tsx
    if (next && canFire('favoriteSaved', 'debounce-800ms')) {
      play('favoriteSaved')
      markFired('favoriteSaved', 'debounce-800ms')
    }
```

- [ ] **Step 6: Run typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors from this file.

- [ ] **Step 7: Do NOT commit yet** — atomic commit at end of Task 19.

---

## Task 12: Wire app/quiz/page.tsx — correctAnswer / wrongAnswer + streakMilestone

**Files:**
- Modify: `app/quiz/page.tsx`

- [ ] **Step 1: Swap imports**

Replace line 15 `import { useCuteMoments } from '@/components/cute-moments'` with:

```tsx
import { useChaina, canFire, markFired } from '@/components/design'
```

Add to the existing progress import (line 7):

```tsx
import { getProgress, getStreak, getSeenStreakMilestones, markStreakMilestoneSeen, updateStreak } from '@/lib/progress'
```

- [ ] **Step 2: Replace cheer() with play()**

Replace line 29 `const { cheer } = useCuteMoments()` with:

```tsx
  const { play } = useChaina()
```

In `handleSelectAnswer` replace the `if (isCorrect) { playSound('correct'); cheer(); } else { ... }` block (lines 69-87) with:

```tsx
    if (isCorrect) {
      playSound('correct')
      play('correctAnswer')
    } else {
      playSound('wrong')
      play('wrongAnswer')
      const correctAnswer = question.answers.find((a) => a.isCorrect)
      if (selectedAnswer && correctAnswer) {
        addMistake(
          {
            original: selectedAnswer.text,
            correction: correctAnswer.text,
            reason: `Quiz prompt: ${question.prompt}`,
          },
          question.lessonId,
          config.storagePrefix,
          'quiz',
        )
        // First mistake of day
        if (canFire('firstMistake', 'once-per-day')) {
          play('firstMistake')
          markFired('firstMistake', 'once-per-day')
        }
      }
    }
```

- [ ] **Step 3: Add streakMilestone trigger after updateStreak**

Locate the quiz-complete block around line 101-111 where `updateStreak(config.storagePrefix)` is called. Add right after it:

```tsx
        updateStreak(config.storagePrefix)
        const newStreak = getStreak(config.storagePrefix)
        const milestones = [7, 14, 30, 50, 100]
        if (
          milestones.includes(newStreak) &&
          !getSeenStreakMilestones(config.storagePrefix).includes(newStreak)
        ) {
          play('streakMilestone')
          markStreakMilestoneSeen(newStreak, config.storagePrefix)
        }
```

- [ ] **Step 4: Run typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors from this file.

- [ ] **Step 5: Do NOT commit yet** — atomic commit at end of Task 19.

---

## Task 13: Wire app/drill/conjugation/page.tsx

**Files:**
- Modify: `app/drill/conjugation/page.tsx`

- [ ] **Step 1: Swap import**

Replace line 8 `import { useCuteMoments } from '@/components/cute-moments'` with:

```tsx
import { useChaina } from '@/components/design'
```

- [ ] **Step 2: Replace cheer() with play()**

Replace line 61 `const { cheer } = useCuteMoments()` with:

```tsx
  const { play } = useChaina()
```

Replace line 87 `if (isCorrect) cheer()` with:

```tsx
    if (isCorrect) play('conjugationCorrect')
```

- [ ] **Step 3: Run typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors from this file.

- [ ] **Step 4: Do NOT commit yet** — atomic commit at end of Task 19.

---

## Task 14: Wire app/mistakes/page.tsx

**Files:**
- Modify: `app/mistakes/page.tsx`

- [ ] **Step 1: Swap import**

Replace line 17 `import { useCuteMoments } from '@/components/cute-moments'` with:

```tsx
import { useChaina } from '@/components/design'
```

- [ ] **Step 2: Replace cheer() with play()**

Replace line 560 `const { cheer } = useCuteMoments()` with:

```tsx
  const { play } = useChaina()
```

Replace line 569 `cheer()` with:

```tsx
      play('drillGotIt')
```

- [ ] **Step 3: Run typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors from this file.

- [ ] **Step 4: Do NOT commit yet** — atomic commit at end of Task 19.

---

## Task 15: Wire app/practice/[id]/page.tsx — firstMistake + streakMilestone

**Files:**
- Modify: `app/practice/[id]/page.tsx`

- [ ] **Step 1: Add imports**

At the top of the file, add:

```tsx
import { useChaina, canFire, markFired } from '@/components/design'
import { getStreak, getSeenStreakMilestones, markStreakMilestoneSeen } from '@/lib/progress'
```

(Note: `updateStreak` is already imported on line 10. Just add `getStreak`, `getSeenStreakMilestones`, `markStreakMilestoneSeen` to that existing import.)

- [ ] **Step 2: Get the play function**

Inside the component body, alongside the existing `const { config } = useLanguage()` (or similar destructuring near the top):

```tsx
  const { play } = useChaina()
```

- [ ] **Step 3: Trigger firstMistake after addMistake**

Around line 230, the existing `addMistake(...)` call inside `handleAssistantReply`. Add right after it (inside the `if (reply.correction)` block):

```tsx
        if (canFire('firstMistake', 'once-per-day')) {
          play('firstMistake')
          markFired('firstMistake', 'once-per-day')
        }
```

- [ ] **Step 4: Trigger streakMilestone after updateStreak (line 302)**

Add right after the existing `updateStreak(config.storagePrefix)` at line 302:

```tsx
    const newStreak = getStreak(config.storagePrefix)
    const milestones = [7, 14, 30, 50, 100]
    if (
      milestones.includes(newStreak) &&
      !getSeenStreakMilestones(config.storagePrefix).includes(newStreak)
    ) {
      play('streakMilestone')
      markStreakMilestoneSeen(newStreak, config.storagePrefix)
    }
```

- [ ] **Step 5: Run typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors from this file.

- [ ] **Step 6: Do NOT commit yet** — atomic commit at end of Task 19.

---

## Task 16: Wire layout-shell.tsx — sessionEnd on visibility hidden

**Files:**
- Modify: `components/layout-shell.tsx`

- [ ] **Step 1: Add imports and chaina hook**

Add to imports:

```tsx
import { useChaina, canFire, markFired } from '@/components/design'
```

Inside the `LayoutShell` body, add `const { play } = useChaina()` alongside the existing `const { config } = useLanguage()` line.

- [ ] **Step 2: Add session-start ref + sessionEnd trigger**

The existing `useEffect` block has the `handleVisibility` function. Modify it to also handle sessionEnd:

```tsx
  useEffect(() => {
    registerServiceWorker()
    maybeShowReminderOnOpen(config.storagePrefix)

    // Record session start
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('chaina-session-start-ts', String(Date.now()))
      } catch {}
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        fireOneTimeTestNotification()
        maybeFireRandomNudge(config.storagePrefix)

        // Chaina sessionEnd: only if session was ≥5min
        try {
          const startTs = Number(sessionStorage.getItem('chaina-session-start-ts') || 0)
          const FIVE_MIN = 5 * 60 * 1000
          if (
            startTs &&
            Date.now() - startTs >= FIVE_MIN &&
            canFire('sessionEnd', 'once-per-session')
          ) {
            play('sessionEnd')
            markFired('sessionEnd', 'once-per-session')
          }
        } catch {}
      } else if (document.visibilityState === 'visible') {
        maybeShowReminderOnOpen(config.storagePrefix)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    const timer = setTimeout(() => {
      if (shouldShowNotificationPrompt()) {
        setShowNotificationPrompt(true)
      }
    }, 30000)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      clearTimeout(timer)
    }
  }, [config.storagePrefix, play])
```

- [ ] **Step 3: Run typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors from this file.

- [ ] **Step 4: Do NOT commit yet** — atomic commit at end of Task 19.

---

## Task 17: Wire app/onboarding/page.tsx — firstEver

**Files:**
- Modify: `app/onboarding/page.tsx`

- [ ] **Step 1: Open the file and locate the mount effect**

Run: `head -40 app/onboarding/page.tsx`

Identify the existing `useEffect` mount block where the welcome step renders.

- [ ] **Step 2: Add the firstEver trigger**

Add at the top of imports:

```tsx
import { useChaina } from '@/components/design'
```

In the component body, add:

```tsx
  const { play } = useChaina()
```

Add a mount effect that fires firstEver once (gated by `chaina-first-ever-seen` localStorage flag):

```tsx
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem('chaina-first-ever-seen') === '1') return
    play('firstEver')
    localStorage.setItem('chaina-first-ever-seen', '1')
    // Reset the last-session timestamp so home doesn't fire welcomeBack right after.
    localStorage.setItem('chaina-last-session-ts', String(Date.now()))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
```

- [ ] **Step 3: Run typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors from this file.

- [ ] **Step 4: Do NOT commit yet** — atomic commit at end of Task 19.

---

## Task 18: Update lesson-chai-galli.test.tsx mock

**Files:**
- Modify: `__tests__/components/lesson-chai-galli.test.tsx`

- [ ] **Step 1: Read existing mock setup**

Run: `head -40 __tests__/components/lesson-chai-galli.test.tsx`

Identify the existing `vi.mock('@/components/cute-moments', ...)` block.

- [ ] **Step 2: Replace the mock**

Replace any `vi.mock('@/components/cute-moments', ...)` block with mocks for the new APIs. Use the standard pattern from existing tests:

```tsx
vi.mock('@/components/design', async () => {
  const actual = await vi.importActual<typeof import('@/components/design')>('@/components/design')
  return {
    ...actual,
    useChaina: () => ({ play: vi.fn(), stop: vi.fn() }),
    canFire: () => false,
    markFired: () => {},
  }
})
```

(Keep the existing `framer-motion`, `next/navigation`, `next/link`, and language-context mocks as-is.)

- [ ] **Step 3: Run the test**

Run: `npx vitest run __tests__/components/lesson-chai-galli.test.tsx`
Expected: tests pass.

- [ ] **Step 4: Do NOT commit yet** — atomic commit at end of Task 19.

---

## Task 19: Delete cute-moments.tsx + final atomic commit

**Files:**
- Delete: `components/cute-moments.tsx`

- [ ] **Step 1: Verify no stale imports remain**

Run: `grep -rn 'cute-moments\|useCuteMoments\|CuteMomentsProvider' --include='*.ts' --include='*.tsx' .`
Expected: zero results (the only matches should have been removed by Tasks 9-18).

If any remain, fix them before deleting.

- [ ] **Step 2: Delete the file**

Run: `git rm components/cute-moments.tsx`

- [ ] **Step 3: Run the full test suite**

Run: `npx vitest run`
Expected: all tests pass.

- [ ] **Step 4: Run the typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 5: Commit the integration work (tasks 9-19) as one atomic change**

```bash
git add app/layout.tsx app/page.tsx app/quiz/page.tsx app/drill/conjugation/page.tsx app/mistakes/page.tsx app/practice/\[id\]/page.tsx app/onboarding/page.tsx components/layout-shell.tsx components/design/LessonChaiGalli.tsx __tests__/components/lesson-chai-galli.test.tsx
git commit -m "feat(chaina): replace cute-moments with Chaina moment triggers across app"
```

(`git rm` already staged the deletion; the commit picks it up.)

---

## Task 20: Add ElevenLabs voice generation script

**Files:**
- Create: `scripts/generate-chaina-voices.mjs`
- Create: `public/chaina/.gitkeep`
- Modify: `package.json`

- [ ] **Step 1: Copy the generation script**

Copy `/tmp/hindi_app_2/mascot_moments/generate-voices.mjs` to `scripts/generate-chaina-voices.mjs`.

Two adjustments from the original:
1. The script reads `moments.js` to extract LINES. Update the import path resolution so it can read our TS module instead. Replace the `loadLines()` function with:

```js
function loadLines() {
  const path = join(PROJECT_ROOT, 'components', 'design', 'moments.ts');
  const src = readFileSync(path, 'utf8');
  // Extract the LINES const literal from the TS source via regex — avoids
  // pulling in a TS compiler just for this dev script.
  const linesMatch = src.match(/const LINES: Record<string, Line\[\]> = (\{[\s\S]*?\n\})/);
  if (!linesMatch) throw new Error('Could not find LINES literal in moments.ts');
  // eslint-disable-next-line no-new-func
  const LINES = new Function(`return ${linesMatch[1]}`)();
  const momentsMatch = src.match(/export const MOMENTS: Record<string, Moment> = (\{[\s\S]*?\n\});/);
  if (!momentsMatch) throw new Error('Could not find MOMENTS literal in moments.ts');
  // Crude TS→JS pass: strip TS type-only bits we don't need to evaluate the
  // moment configs. We only care about `voice` and `lines` per moment for the
  // generator, so we resolve `LINES.foo` references manually.
  const moments = {};
  const keyRe = /(\w+):\s*\{([\s\S]*?lines:\s*LINES\.(\w+),[\s\S]*?)\n\s*\},/g;
  let m;
  while ((m = keyRe.exec(momentsMatch[1])) !== null) {
    const key = m[1];
    const linesKey = m[3];
    const voice = /voice:\s*true/.test(m[2]);
    moments[key] = { voice, lines: LINES[linesKey] || [] };
  }
  return { MOMENTS: moments, LINES };
}
```

2. The output path is correct (`PROJECT_ROOT/public/chaina`).

Final file content (full file):

```js
// generate-chaina-voices.mjs
// One-shot Node script: reads components/design/moments.ts and generates one
// MP3 per line via ElevenLabs. Result: public/chaina/<momentKey>-<idx>.mp3
//
// Usage:
//   1. Get an API key: https://elevenlabs.io → Profile → API Keys
//   2. (optional) Pick a voice: https://elevenlabs.io/voice-library
//   3. From repo root:
//        ELEVENLABS_API_KEY=sk_... node scripts/generate-chaina-voices.mjs
//   4. Files land in public/chaina/. Commit them.
//
// Re-running is idempotent: existing files are skipped unless you pass --force.

import { readFileSync, mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const OUT_DIR = join(PROJECT_ROOT, 'public', 'chaina');

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error('Set ELEVENLABS_API_KEY first. Get one at https://elevenlabs.io/profile.');
  process.exit(1);
}

const VOICE_ID = process.env.CHAINA_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';
const MODEL = 'eleven_multilingual_v2';
const VOICE_SETTINGS = {
  stability: 0.55,
  similarity_boost: 0.85,
  style: 0.45,
  use_speaker_boost: true,
};
const FORCE = process.argv.includes('--force');

function loadLines() {
  const path = join(PROJECT_ROOT, 'components', 'design', 'moments.ts');
  const src = readFileSync(path, 'utf8');
  const linesMatch = src.match(/const LINES: Record<string, Line\[\]> = (\{[\s\S]*?\n\});/);
  if (!linesMatch) throw new Error('Could not find LINES literal in moments.ts');
  // eslint-disable-next-line no-new-func
  const LINES = new Function(`return ${linesMatch[1]}`)();
  const momentsMatch = src.match(/export const MOMENTS: Record<string, Moment> = (\{[\s\S]*?\n\});/);
  if (!momentsMatch) throw new Error('Could not find MOMENTS literal in moments.ts');
  const moments = {};
  const keyRe = /(\w+):\s*\{([\s\S]*?lines:\s*LINES\.(\w+),[\s\S]*?)\n\s*\},/g;
  let mm;
  while ((mm = keyRe.exec(momentsMatch[1])) !== null) {
    const key = mm[1];
    const linesKey = mm[3];
    const voice = /voice:\s*true/.test(mm[2]);
    moments[key] = { voice, lines: LINES[linesKey] || [] };
  }
  return { MOMENTS: moments, LINES };
}

async function tts(text) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: VOICE_SETTINGS,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${body}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  return buf;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const { MOMENTS } = loadLines();

  let generated = 0, skipped = 0, failed = 0;

  for (const [key, cfg] of Object.entries(MOMENTS)) {
    if (!cfg.voice) {
      console.log(`· skip ${key} (voice: false)`);
      continue;
    }
    for (let idx = 0; idx < cfg.lines.length; idx++) {
      const line = cfg.lines[idx];
      if (!line.speak) continue;
      const outPath = join(OUT_DIR, `${key}-${idx}.mp3`);
      if (existsSync(outPath) && !FORCE) {
        skipped++;
        console.log(`✓ have ${key}-${idx}.mp3`);
        continue;
      }
      try {
        process.stdout.write(`→ ${key}-${idx} "${line.speak}" ... `);
        const buf = await tts(line.speak);
        writeFileSync(outPath, buf);
        generated++;
        console.log(`(${buf.length} bytes)`);
      } catch (e) {
        failed++;
        console.error(`FAIL ${key}-${idx}:`, e.message);
      }
    }
  }

  console.log(`\nDone. generated=${generated} skipped=${skipped} failed=${failed}`);
  console.log(`Files: ${OUT_DIR}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Create empty public/chaina/.gitkeep**

```bash
mkdir -p public/chaina
touch public/chaina/.gitkeep
```

- [ ] **Step 3: Add npm script**

Edit `package.json`. Inside `"scripts"`, add a `voices` entry:

```json
    "test:run": "vitest run",
    "voices": "node scripts/generate-chaina-voices.mjs"
```

Mind the trailing comma in the previous line.

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-chaina-voices.mjs public/chaina/.gitkeep package.json
git commit -m "chore(chaina): add ElevenLabs voice-generation script (not run)"
```

---

## Task 21: Final QA + push

- [ ] **Step 1: Run the full test suite one more time**

Run: `npx vitest run`
Expected: all tests pass — no skipped, no failures.

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 3: Boot dev server**

Run: `npm run dev`
Open the local URL.

- [ ] **Step 4: Manual QA checklist**

Walk through these and confirm each works (note: no MP3s in `public/chaina/` so voice goes through Web Speech):

  - [ ] Tap the home-header Chaina → wobble + speech bubble + voice
  - [ ] Open quiz, answer correctly → top-right Chaina with happy mood + voice "Bilkul sahi"
  - [ ] Answer wrong → top-right Chaina with sympathy mood + voice "Koi baat nahin"
  - [ ] Complete a lesson → center Chaina excited + confetti + voice "Wah, shabash"
  - [ ] Star a phrase → bottom-right Chaina wink + "saved ⭐" bubble (silent)
  - [ ] Sit idle on a lesson for 25s → Chaina peeks from bottom-edge sleepy (silent)
  - [ ] Reveal 3 phrases in a row → inline Chaina happy bubble (silent)
  - [ ] Conjugation drill correct → top-right Chaina happy (silent)
  - [ ] Mistakes drill "got it" → inline Chaina (silent)
  - [ ] Background app (Cmd+Tab away on Mac, or send to background on iOS) after 5+ min → sessionEnd
  - [ ] Reload tab → if >24h since last visit, welcomeBack; else firstOpenToday
  - [ ] Verify no double-celebration (cute-moments emoji popup should never appear)
  - [ ] Toggle mute pill on home → Chaina voice silenced; visual moments still play
  - [ ] Verify `bottom-nav` and `daily-review-popup` are not visually blocked by Chaina (Chaina z-index 30, BottomNav floating at bottom — check on small viewport)

- [ ] **Step 5: Commit any small QA fixes**

If any manual tweaks needed (z-index, anchor positions, etc.), commit each with a focused message.

- [ ] **Step 6: Push the branch**

```bash
git push -u origin claude/mascot-design-impl-IseIB
```

If the push fails due to a network error, retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s).

---

## Self-review checklist (for the implementing engineer)

After all 21 tasks complete, sanity-check:

- [ ] All 14 moments in `MOMENTS` are reachable from at least one trigger site
- [ ] `cute-moments.tsx` is deleted; `grep -rn cute-moments` returns nothing
- [ ] `npx vitest run` is green
- [ ] `npx tsc --noEmit` is green
- [ ] The dev server runs and the manual QA above passes
- [ ] No new untracked files except `public/chaina/` (empty) and the spec/plan docs
- [ ] The branch is pushed
