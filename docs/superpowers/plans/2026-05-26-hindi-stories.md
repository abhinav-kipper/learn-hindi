# Hindi Stories — Chai Galli Motion-Comics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship 3 short illustrated Hindi stories (~5 panels each) on a new `/stories/[id]` route, surfaced as a new section on the Hindi home above the Situations/Foundations tab pill. Pure consumption: tap-through panels, English-reveal on tap, per-panel browser-TTS. No quiz.

**Architecture:** New content type alongside lessons + foundations + vocab. Story = ordered list of Panels; each Panel renders a Scene (composed SVG background) + dialogue/narration in a Chai Galli text card. Three new SVG character primitives (Nani, Customer, Shopkeeper) join the existing Cutting mascot. Progress tracked in a new `lib/stories-progress.ts` (storage key `learn-hindi:hindi-stories-read`). Hindi-only for MVP.

**Tech Stack:** Next.js 16 App Router, TypeScript, JSON content, Framer Motion (already in project) for panel transitions + character entrances, browser TTS via existing `lib/speech.ts`, Chai Galli design system via `@/components/design` barrel.

**Spec:** `docs/superpowers/specs/2026-05-26-hindi-stories-design.md`
**Repo:** `abhinav-kipper/learn-hindi`, branch: `main` (user authorized).

---

## Critical context for the implementer

**Read these before starting:**
- `components/design/Cutting.tsx` — the gold-standard reference for new character SVGs (viewBox 120x144, line weight, palette, idle animation). New characters must match its style.
- `components/design/tokens.ts` — `COLORS` (ink/peach/butter/mint/lav/orange + variants), `BORDER.sticker` (2.5px solid ink), `SHADOW.sticker` (4px 4px 0 ink). White literal pattern: `const W = '#fff' // @design-allow: white literal`.
- `components/design/animations.css` — existing keyframes (`blink`, `float-y`, `happy-hop`, `pop-in`).
- `components/design/LessonChaiGalli.tsx` — reference for reveal-zone pattern and TTS button styling.
- `lib/speech.ts` — `speak(text, locale, onEnd)` for browser TTS. Hindi locale is `'hi-IN'`.

**Schema reminder** (from spec):

```ts
export type SceneId = 'chai-stall' | 'bazaar' | 'nani-house' | 'narrator-card'
export type SpeakerPosition = 'left' | 'right' | 'center'

export interface Panel {
  scene: SceneId
  hindi: string
  english: string
  speaker?: string
  speaker_position?: SpeakerPosition
  pronunciation?: string
}

export interface Story {
  id: string
  title: string
  description: string
  panels: Panel[]
  level?: 'A1' | 'A2' | 'B1'
  skill_tags?: string[]
}
```

---

## Task 1: `Story` type + loader + 3 story JSONs

**Files:**
- Create: `types/story.ts`
- Create: `content/stories/01-chai-stall.json`
- Create: `content/stories/02-lost-in-bazaar.json`
- Create: `content/stories/03-sunday-with-nani.json`
- Create: `lib/stories.ts`
- Create: `lib/stories.test.ts`

- [ ] **Step 1: Create `types/story.ts`**

```ts
export type SceneId = 'chai-stall' | 'bazaar' | 'nani-house' | 'narrator-card'

export type SpeakerPosition = 'left' | 'right' | 'center'

export interface Panel {
  scene: SceneId
  hindi: string
  english: string
  speaker?: string
  speaker_position?: SpeakerPosition
  pronunciation?: string
}

export interface Story {
  id: string
  title: string
  description: string
  panels: Panel[]
  level?: 'A1' | 'A2' | 'B1'
  skill_tags?: string[]
}
```

- [ ] **Step 2: Create `content/stories/01-chai-stall.json`**

```json
{
  "id": "chai-stall",
  "title": "The Chai Stall",
  "description": "First chai with Cutting.",
  "level": "A1",
  "skill_tags": ["greetings", "ordering food", "introductions"],
  "panels": [
    {
      "scene": "chai-stall",
      "speaker": "narrator",
      "speaker_position": "center",
      "hindi": "Cutting din ke pehle grahak ka intezaar kar raha hai.",
      "english": "Cutting is waiting for the day's first customer.",
      "pronunciation": "CUT-ting din ke PEH-le GRAH-ak ka in-te-ZAAR kar ra-HA hai"
    },
    {
      "scene": "chai-stall",
      "speaker": "customer",
      "speaker_position": "left",
      "hindi": "Do chai dena, bhaiya. Ek meri aur ek aapki.",
      "english": "Two chais please. One for me and one for you.",
      "pronunciation": "DO chai DE-na, BHAI-ya. EK ME-ri aur EK AAP-ki"
    },
    {
      "scene": "chai-stall",
      "speaker": "cutting",
      "speaker_position": "right",
      "hindi": "Arrey wah! Mere liye bhi? Bahut shukriya, dost!",
      "english": "Wow! For me too? Thanks a lot, friend!",
      "pronunciation": "a-REY WAH! ME-re li-YE bhi? ba-HUT shuk-RI-ya, DOST"
    },
    {
      "scene": "chai-stall",
      "speaker": "customer",
      "speaker_position": "left",
      "hindi": "Tumhara naam kya hai?",
      "english": "What's your name?",
      "pronunciation": "tum-HAA-ra NAAM kya hai"
    },
    {
      "scene": "chai-stall",
      "speaker": "cutting",
      "speaker_position": "right",
      "hindi": "Main Cutting hoon. Half-chai bechta hoon, full-friendship deta hoon.",
      "english": "I'm Cutting. I sell half-chai, I give full-friendship.",
      "pronunciation": "MAIN CUT-ting hoon. HAALF-chai BECH-ta hoon, FULL-friend-ship DE-ta hoon"
    }
  ]
}
```

- [ ] **Step 3: Create `content/stories/02-lost-in-bazaar.json`**

```json
{
  "id": "lost-in-bazaar",
  "title": "Lost in the Bazaar",
  "description": "Three shopkeepers, three different answers.",
  "level": "A2",
  "skill_tags": ["directions", "navigation", "polite asking"],
  "panels": [
    {
      "scene": "bazaar",
      "speaker": "narrator",
      "speaker_position": "center",
      "hindi": "Maya hotel Surya dhoond rahi hai. Usse koi pata nahi hai kahaan hai.",
      "english": "Maya is looking for the Hotel Surya. She has no idea where it is.",
      "pronunciation": "MA-ya ho-TEL SUR-ya DHOOND ra-HI hai. US-se KOI PA-ta na-HI hai ka-HAAN hai"
    },
    {
      "scene": "bazaar",
      "speaker": "shopkeeper1",
      "speaker_position": "left",
      "hindi": "Seedha jaao, phir left. Bilkul saamne hai.",
      "english": "Go straight, then left. It's right in front.",
      "pronunciation": "SEE-dha jaao, PHIR left. BIL-kul SAAM-ne hai"
    },
    {
      "scene": "bazaar",
      "speaker": "shopkeeper2",
      "speaker_position": "right",
      "hindi": "Arrey nahi! Right le lo. Main bhi wahaan jaata hoon.",
      "english": "Oh no! Take a right. I go there too.",
      "pronunciation": "a-REY na-HI! Right le LO. MAIN bhi wa-HAAN JAA-ta hoon"
    },
    {
      "scene": "bazaar",
      "speaker": "child",
      "speaker_position": "center",
      "hindi": "Auntie, mere papa wahaan kaam karte hain. Main le chalti hoon.",
      "english": "Auntie, my papa works there. I'll take you.",
      "pronunciation": "AUN-tie, ME-re PA-pa wa-HAAN KAAM KAR-te hain. MAIN le CHAL-ti hoon"
    },
    {
      "scene": "bazaar",
      "speaker": "narrator",
      "speaker_position": "center",
      "hindi": "Maya ab parivar ka hissa hai.",
      "english": "Maya is now part of the family.",
      "pronunciation": "MA-ya ab pa-ri-VAAR ka HIS-sa hai"
    }
  ]
}
```

- [ ] **Step 4: Create `content/stories/03-sunday-with-nani.json`**

```json
{
  "id": "sunday-with-nani",
  "title": "Sunday with Nani",
  "description": "Lunch with grandmother.",
  "level": "A2",
  "skill_tags": ["family terms", "hospitality", "food"],
  "panels": [
    {
      "scene": "nani-house",
      "speaker": "cutting",
      "speaker_position": "center",
      "hindi": "Nani ji, namaste! Main aapse milne aaya hoon.",
      "english": "Nani-ji, hello! I came to meet you.",
      "pronunciation": "NA-ni ji, na-mas-TE! MAIN AAP-se MIL-ne AA-ya hoon"
    },
    {
      "scene": "nani-house",
      "speaker": "nani",
      "speaker_position": "left",
      "hindi": "Arrey beta! Aa gaya tu? Joote yahin utaar de. Haath dho le.",
      "english": "Oh child! You came? Take your shoes off here. Wash your hands.",
      "pronunciation": "a-REY BE-ta! AA ga-YA tu? JOO-te ya-HIN u-TAAR de. HAATH DHO le"
    },
    {
      "scene": "nani-house",
      "speaker": "nani",
      "speaker_position": "left",
      "hindi": "Tu toh bahut patla ho gaya hai. Yeh poori, yeh sabzi, aur thoda halwa bhi.",
      "english": "You've gotten so thin. Have this poori, this sabzi, and a bit of halwa too.",
      "pronunciation": "TU toh ba-HUT PAT-la HO ga-ya hai. YEH POO-ri, YEH SAB-zi, aur THO-da HAL-wa bhi"
    },
    {
      "scene": "nani-house",
      "speaker": "cutting",
      "speaker_position": "right",
      "hindi": "Nani, bas! Bahut khaa liya. Pet bhar gaya.",
      "english": "Nani, enough! I've eaten a lot. My stomach is full.",
      "pronunciation": "NA-ni, BAS! ba-HUT KHAA li-YA. PET BHAR ga-ya"
    },
    {
      "scene": "nani-house",
      "speaker": "nani",
      "speaker_position": "left",
      "hindi": "Yeh dabba le ja. Ghar pe khaayega kal.",
      "english": "Take this tiffin. You'll eat it at home tomorrow.",
      "pronunciation": "YEH DAB-ba LE ja. GHAR pe KHAA-ye-ga KAL"
    }
  ]
}
```

- [ ] **Step 5: Write `lib/stories.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { getAllStories, getStoryById } from './stories'

describe('lib/stories', () => {
  it('loads all 3 stories', () => {
    const stories = getAllStories()
    expect(stories).toHaveLength(3)
    expect(stories.map(s => s.id)).toEqual([
      'chai-stall',
      'lost-in-bazaar',
      'sunday-with-nani',
    ])
  })

  it('returns a story by id', () => {
    const chai = getStoryById('chai-stall')
    expect(chai).toBeDefined()
    expect(chai?.title).toBe('The Chai Stall')
    expect(chai?.panels).toHaveLength(5)
  })

  it('returns undefined for unknown id', () => {
    expect(getStoryById('does-not-exist')).toBeUndefined()
  })

  it('every story has exactly 5 panels with required fields', () => {
    for (const story of getAllStories()) {
      expect(story.panels).toHaveLength(5)
      for (const panel of story.panels) {
        expect(panel.scene).toBeTruthy()
        expect(panel.hindi).toBeTruthy()
        expect(panel.english).toBeTruthy()
      }
    }
  })
})
```

- [ ] **Step 6: Verify test fails**

```bash
npx vitest run lib/stories.test.ts
```
Expected: FAIL (lib/stories.ts doesn't exist yet).

- [ ] **Step 7: Create `lib/stories.ts`**

```ts
import type { Story } from '@/types/story'

import chaiStall from '@/content/stories/01-chai-stall.json'
import lostInBazaar from '@/content/stories/02-lost-in-bazaar.json'
import sundayWithNani from '@/content/stories/03-sunday-with-nani.json'

const stories: Story[] = [
  chaiStall as Story,
  lostInBazaar as Story,
  sundayWithNani as Story,
]

export function getAllStories(): Story[] {
  return stories
}

export function getStoryById(id: string): Story | undefined {
  return stories.find(s => s.id === id)
}
```

- [ ] **Step 8: Verify tests pass + tsc clean**

```bash
npx vitest run lib/stories.test.ts
npx tsc --noEmit
```

Both clean.

- [ ] **Step 9: Commit**

```bash
git add types/story.ts content/stories/ lib/stories.ts lib/stories.test.ts
git commit -m "feat(stories): add Story type + 3 stories + loader"
```

---

## Task 2: `lib/stories-progress.ts` with tests

**Files:**
- Create: `lib/stories-progress.test.ts`
- Create: `lib/stories-progress.ts`

- [ ] **Step 1: Write `lib/stories-progress.test.ts`**

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import {
  markStoryRead,
  isStoryRead,
  getStoriesRead,
  getStoriesReadCount,
  STORIES_READ_KEY,
} from './stories-progress'

describe('lib/stories-progress', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('STORIES_READ_KEY is namespaced under learn-hindi', () => {
    expect(STORIES_READ_KEY).toBe('learn-hindi:hindi-stories-read')
  })

  it('isStoryRead returns false when nothing stored', () => {
    expect(isStoryRead('chai-stall')).toBe(false)
  })

  it('markStoryRead persists the ID and isStoryRead returns true after', () => {
    markStoryRead('chai-stall')
    expect(isStoryRead('chai-stall')).toBe(true)
  })

  it('markStoryRead is idempotent — calling twice does not duplicate', () => {
    markStoryRead('chai-stall')
    markStoryRead('chai-stall')
    expect(getStoriesRead()).toEqual(['chai-stall'])
  })

  it('multiple stories tracked independently', () => {
    markStoryRead('chai-stall')
    markStoryRead('sunday-with-nani')
    const all = getStoriesRead()
    expect(all).toContain('chai-stall')
    expect(all).toContain('sunday-with-nani')
    expect(all).not.toContain('lost-in-bazaar')
  })

  it('getStoriesReadCount returns the count', () => {
    expect(getStoriesReadCount()).toBe(0)
    markStoryRead('chai-stall')
    expect(getStoriesReadCount()).toBe(1)
    markStoryRead('lost-in-bazaar')
    expect(getStoriesReadCount()).toBe(2)
  })

  it('survives malformed localStorage data — falls back to empty', () => {
    localStorage.setItem(STORIES_READ_KEY, 'not-json{{{')
    expect(getStoriesRead()).toEqual([])
    expect(isStoryRead('chai-stall')).toBe(false)
  })
})
```

- [ ] **Step 2: Verify test fails**

```bash
npx vitest run lib/stories-progress.test.ts
```
Expected: FAIL (file doesn't exist).

- [ ] **Step 3: Create `lib/stories-progress.ts`**

```ts
export const STORIES_READ_KEY = 'learn-hindi:hindi-stories-read'

function read(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORIES_READ_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

function write(ids: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORIES_READ_KEY, JSON.stringify(ids))
}

export function getStoriesRead(): string[] {
  return read()
}

export function isStoryRead(id: string): boolean {
  return read().includes(id)
}

export function markStoryRead(id: string): void {
  const ids = read()
  if (ids.includes(id)) return
  write([...ids, id])
}

export function getStoriesReadCount(): number {
  return read().length
}
```

- [ ] **Step 4: Verify tests pass**

```bash
npx vitest run lib/stories-progress.test.ts
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add lib/stories-progress.ts lib/stories-progress.test.ts
git commit -m "feat(stories): add stories-progress lib with TDD'd persistence"
```

---

## Task 3: Three new character SVGs in Chai Galli style

**Files:**
- Create: `components/stories/characters/Nani.tsx`
- Create: `components/stories/characters/Customer.tsx`
- Create: `components/stories/characters/Shopkeeper.tsx`

Style reference: `components/design/Cutting.tsx`. Each character is a 120x144 viewBox SVG with:
- 2.5px ink stroke (matches `BORDER.sticker`)
- Round head, simple shapes
- Subtle idle animation (re-use existing `blink` keyframe from `animations.css`)
- Solid flat-color body in 2-3 colors from `COLORS` palette
- Two-pixel offset hard shadow on body (via SVG filter or stacked shape)

- [ ] **Step 1: Create `components/stories/characters/Nani.tsx`**

```tsx
'use client'

import { COLORS } from '@/components/design/tokens'

const W = '#fff' // @design-allow: white literal

type NaniProps = {
  size?: number
  style?: React.CSSProperties
}

/**
 * Nani — a sari-wearing grandmother sticker character in Chai Galli style.
 * Round head, white hair bun, round glasses, peach-orange sari, hands resting
 * over a steel dabba. Eyes blink via existing `blink` keyframe.
 */
export function Nani({ size = 110, style }: NaniProps) {
  return (
    <div style={{ width: size, height: size * 1.2, position: 'relative', ...style }}>
      <svg viewBox="0 0 120 144" width="100%" height="100%" style={{ overflow: 'visible' }}>
        {/* Hair bun (back) */}
        <circle cx="60" cy="20" r="13" fill={W} stroke={COLORS.ink} strokeWidth="2.5" />

        {/* Body — sari draped */}
        <path
          d="M 30 80 Q 30 60, 50 56 L 70 56 Q 90 60, 90 80 L 92 130 Q 90 138, 60 138 Q 30 138, 28 130 Z"
          fill={COLORS.peach}
          stroke={COLORS.ink}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Sari edge accent */}
        <path
          d="M 30 80 Q 36 78, 60 82 Q 84 78, 90 80"
          fill="none"
          stroke={COLORS.orange}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Head */}
        <circle cx="60" cy="42" r="22" fill={COLORS.peach2} stroke={COLORS.ink} strokeWidth="2.5" />

        {/* Glasses */}
        <circle cx="52" cy="42" r="5" fill={W} stroke={COLORS.ink} strokeWidth="2" />
        <circle cx="68" cy="42" r="5" fill={W} stroke={COLORS.ink} strokeWidth="2" />
        <line x1="57" y1="42" x2="63" y2="42" stroke={COLORS.ink} strokeWidth="2" />

        {/* Eyes (behind glasses) */}
        <ellipse cx="52" cy="42" rx="1.6" ry="2.4" fill={COLORS.ink} style={{ transformOrigin: '52px 42px', animation: 'blink 4s ease-in-out infinite' }} />
        <ellipse cx="68" cy="42" rx="1.6" ry="2.4" fill={COLORS.ink} style={{ transformOrigin: '68px 42px', animation: 'blink 4s ease-in-out infinite' }} />

        {/* Bindi */}
        <circle cx="60" cy="28" r="2.2" fill={COLORS.orange} />

        {/* Smile */}
        <path d="M 52 52 Q 60 58, 68 52" stroke={COLORS.ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Dabba (steel tiffin) — held at waist */}
        <rect x="44" y="100" width="32" height="18" rx="3" fill={COLORS.lav2} stroke={COLORS.ink} strokeWidth="2.5" />
        <rect x="48" y="96" width="24" height="5" rx="1.5" fill={COLORS.lav2} stroke={COLORS.ink} strokeWidth="2.5" />

        {/* Hands resting on dabba */}
        <circle cx="42" cy="106" r="6" fill={COLORS.peach2} stroke={COLORS.ink} strokeWidth="2.5" />
        <circle cx="78" cy="106" r="6" fill={COLORS.peach2} stroke={COLORS.ink} strokeWidth="2.5" />
      </svg>
    </div>
  )
}
```

- [ ] **Step 2: Create `components/stories/characters/Customer.tsx`**

```tsx
'use client'

import { COLORS } from '@/components/design/tokens'

const W = '#fff' // @design-allow: white literal

type CustomerProps = {
  size?: number
  shirtColor?: string  // defaults to mint; pass COLORS.peach for Maya in Story 2 to differentiate
  style?: React.CSSProperties
}

/**
 * Customer — a generic humanoid sticker character. Round head, short stylized
 * hair, simple shirt (color via prop), neutral-friendly face. Used as the
 * chai-stall customer in Story 1 and as Maya the protagonist in Story 2.
 */
export function Customer({ size = 110, shirtColor = COLORS.mint, style }: CustomerProps) {
  return (
    <div style={{ width: size, height: size * 1.2, position: 'relative', ...style }}>
      <svg viewBox="0 0 120 144" width="100%" height="100%" style={{ overflow: 'visible' }}>
        {/* Body — shirt */}
        <path
          d="M 32 84 Q 32 64, 50 60 L 70 60 Q 88 64, 88 84 L 90 132 Q 88 138, 60 138 Q 32 138, 30 132 Z"
          fill={shirtColor}
          stroke={COLORS.ink}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Collar */}
        <path d="M 50 60 L 60 70 L 70 60" fill="none" stroke={COLORS.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Head */}
        <circle cx="60" cy="40" r="22" fill={COLORS.peach2} stroke={COLORS.ink} strokeWidth="2.5" />

        {/* Hair (short, stylized) */}
        <path
          d="M 38 36 Q 40 22, 60 18 Q 80 22, 82 36 Q 78 30, 60 30 Q 42 30, 38 36 Z"
          fill={COLORS.ink}
          stroke={COLORS.ink}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Eyes */}
        <ellipse cx="52" cy="42" rx="2" ry="2.8" fill={COLORS.ink} style={{ transformOrigin: '52px 42px', animation: 'blink 3.5s ease-in-out infinite' }} />
        <ellipse cx="68" cy="42" rx="2" ry="2.8" fill={COLORS.ink} style={{ transformOrigin: '68px 42px', animation: 'blink 3.5s ease-in-out infinite' }} />

        {/* Eyebrows */}
        <line x1="48" y1="36" x2="56" y2="36" stroke={COLORS.ink} strokeWidth="2" strokeLinecap="round" />
        <line x1="64" y1="36" x2="72" y2="36" stroke={COLORS.ink} strokeWidth="2" strokeLinecap="round" />

        {/* Smile */}
        <path d="M 54 50 Q 60 56, 66 50" stroke={COLORS.ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Hands */}
        <circle cx="34" cy="100" r="6" fill={COLORS.peach2} stroke={COLORS.ink} strokeWidth="2.5" />
        <circle cx="86" cy="100" r="6" fill={COLORS.peach2} stroke={COLORS.ink} strokeWidth="2.5" />
      </svg>
    </div>
  )
}
```

- [ ] **Step 3: Create `components/stories/characters/Shopkeeper.tsx`**

```tsx
'use client'

import { COLORS } from '@/components/design/tokens'

const W = '#fff' // @design-allow: white literal

type ShopkeeperProps = {
  size?: number
  shirtColor?: string   // peach or butter for the two Story-2 shopkeeper variants
  accentColor?: string  // mint or lav for the prop crate behind
  style?: React.CSSProperties
}

/**
 * Shopkeeper — humanoid with mustache, slight portly proportions, and a
 * small crate prop suggesting a market stall. Rendered twice in Story 2 with
 * different palettes via props for visual distinction.
 */
export function Shopkeeper({
  size = 110,
  shirtColor = COLORS.peach,
  accentColor = COLORS.mint,
  style,
}: ShopkeeperProps) {
  return (
    <div style={{ width: size, height: size * 1.2, position: 'relative', ...style }}>
      <svg viewBox="0 0 120 144" width="100%" height="100%" style={{ overflow: 'visible' }}>
        {/* Crate prop (back) */}
        <rect x="86" y="106" width="22" height="28" rx="2" fill={accentColor} stroke={COLORS.ink} strokeWidth="2.5" />
        <line x1="86" y1="115" x2="108" y2="115" stroke={COLORS.ink} strokeWidth="2" />

        {/* Body — kurta */}
        <path
          d="M 26 86 Q 26 64, 48 58 L 72 58 Q 94 64, 94 86 L 96 134 Q 94 140, 60 140 Q 26 140, 24 134 Z"
          fill={shirtColor}
          stroke={COLORS.ink}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Head — slightly larger */}
        <circle cx="60" cy="40" r="24" fill={COLORS.peach2} stroke={COLORS.ink} strokeWidth="2.5" />

        {/* Hair (back) */}
        <path d="M 38 30 Q 60 14, 82 30 Q 78 24, 60 22 Q 42 24, 38 30 Z" fill={COLORS.ink} />

        {/* Eyes */}
        <ellipse cx="51" cy="40" rx="2.2" ry="3" fill={COLORS.ink} style={{ transformOrigin: '51px 40px', animation: 'blink 4.5s ease-in-out infinite' }} />
        <ellipse cx="69" cy="40" rx="2.2" ry="3" fill={COLORS.ink} style={{ transformOrigin: '69px 40px', animation: 'blink 4.5s ease-in-out infinite' }} />

        {/* Mustache — signature Chai-Galli shopkeeper trait */}
        <path d="M 46 54 Q 52 50, 60 54 Q 68 50, 74 54 Q 68 58, 60 56 Q 52 58, 46 54 Z" fill={COLORS.ink} stroke={COLORS.ink} strokeWidth="1.5" />

        {/* Smile under mustache */}
        <path d="M 54 60 Q 60 64, 66 60" stroke={COLORS.ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Hands */}
        <circle cx="28" cy="104" r="6.5" fill={COLORS.peach2} stroke={COLORS.ink} strokeWidth="2.5" />
        <circle cx="80" cy="106" r="6.5" fill={COLORS.peach2} stroke={COLORS.ink} strokeWidth="2.5" />
      </svg>
    </div>
  )
}
```

- [ ] **Step 4: Verify all 3 components compile**

```bash
npx tsc --noEmit
node scripts/lint-design.mjs
```

`lint-design` must be clean — no raw hex literals outside `@design-allow` comments, all colors via `COLORS.*`.

- [ ] **Step 5: Commit**

```bash
git add components/stories/characters/
git commit -m "feat(stories): add Nani + Customer + Shopkeeper character SVGs"
```

---

## Task 4: Four scene components (backgrounds)

**Files:**
- Create: `components/stories/scenes/ChaiStallScene.tsx`
- Create: `components/stories/scenes/BazaarScene.tsx`
- Create: `components/stories/scenes/NaniHouseScene.tsx`
- Create: `components/stories/scenes/NarratorCard.tsx`
- Create: `components/stories/scenes/index.ts`

Each scene is a self-contained SVG-backed `<div>` that fills its parent (illustrated background). Characters are layered on top by the StoryReader, not by the scene itself. Scenes are pure backgrounds + scene props.

- [ ] **Step 1: Create `components/stories/scenes/ChaiStallScene.tsx`**

```tsx
'use client'

import { COLORS } from '@/components/design/tokens'

const W = '#fff' // @design-allow: white literal

/**
 * Chai stall scene — peach-gradient sky, dusty road, wooden chai cart with
 * brass pot and steam. Characters sit on top via the StoryReader.
 */
export function ChaiStallScene() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 16 }}>
      <svg viewBox="0 0 400 240" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        {/* Sky — peach gradient */}
        <defs>
          <linearGradient id="sky-chai" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.peach2} />
            <stop offset="100%" stopColor={COLORS.butter} />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="400" height="240" fill="url(#sky-chai)" />

        {/* Distant hills */}
        <path d="M 0 160 Q 80 130, 160 150 Q 240 130, 320 145 L 400 140 L 400 240 L 0 240 Z" fill={COLORS.lav2} opacity="0.6" />

        {/* Road */}
        <rect x="0" y="200" width="400" height="40" fill={COLORS.peach2} />
        <path d="M 0 200 L 400 200" stroke={COLORS.ink} strokeWidth="2" />

        {/* Chai cart (left side, decorative) */}
        <rect x="40" y="160" width="80" height="50" rx="4" fill={COLORS.orange2} stroke={COLORS.ink} strokeWidth="2.5" />
        <rect x="40" y="155" width="80" height="10" fill={COLORS.orange} stroke={COLORS.ink} strokeWidth="2.5" />
        {/* Chai pot */}
        <ellipse cx="80" cy="148" rx="14" ry="8" fill={COLORS.ink} />
        <path d="M 68 148 Q 80 138, 92 148" fill="none" stroke={COLORS.ink} strokeWidth="2.5" />
        {/* Steam */}
        <path d="M 80 138 Q 76 130, 80 122 Q 84 116, 80 110" fill="none" stroke={W} strokeWidth="3" strokeLinecap="round" opacity="0.7" style={{ transformOrigin: '80px 130px', animation: 'float-y 2.6s ease-in-out infinite' }} />

        {/* Cart wheels */}
        <circle cx="55" cy="215" r="8" fill={COLORS.ink} />
        <circle cx="105" cy="215" r="8" fill={COLORS.ink} />
      </svg>
    </div>
  )
}
```

- [ ] **Step 2: Create `components/stories/scenes/BazaarScene.tsx`**

```tsx
'use client'

import { COLORS } from '@/components/design/tokens'

const W = '#fff' // @design-allow: white literal

/**
 * Bazaar scene — colorful market street with hanging marigold strings,
 * row of stalls in butter / mint / peach panels, distant temple silhouette.
 */
export function BazaarScene() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 16 }}>
      <svg viewBox="0 0 400 240" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        {/* Sky */}
        <rect x="0" y="0" width="400" height="160" fill={COLORS.butter} />

        {/* Distant temple silhouette */}
        <path d="M 280 160 L 280 110 L 290 100 L 300 110 L 300 160 Z" fill={COLORS.lav2} opacity="0.7" />
        <circle cx="290" cy="96" r="4" fill={COLORS.lav2} opacity="0.7" />

        {/* Stalls row */}
        <rect x="0" y="120" width="100" height="80" fill={COLORS.peach2} stroke={COLORS.ink} strokeWidth="2.5" />
        <rect x="100" y="120" width="100" height="80" fill={COLORS.mint2} stroke={COLORS.ink} strokeWidth="2.5" />
        <rect x="200" y="120" width="100" height="80" fill={COLORS.lav2} stroke={COLORS.ink} strokeWidth="2.5" />
        <rect x="300" y="120" width="100" height="80" fill={COLORS.peach2} stroke={COLORS.ink} strokeWidth="2.5" />

        {/* Stall awnings (striped) */}
        <rect x="0" y="120" width="100" height="14" fill={COLORS.orange} />
        <rect x="100" y="120" width="100" height="14" fill={COLORS.mint} />
        <rect x="200" y="120" width="100" height="14" fill={COLORS.lav} />
        <rect x="300" y="120" width="100" height="14" fill={COLORS.orange} />

        {/* Hanging marigold strings (top) */}
        <path d="M 0 30 Q 100 50, 200 30 Q 300 50, 400 30" fill="none" stroke={COLORS.orange} strokeWidth="3" />
        {[20, 60, 100, 140, 180, 220, 260, 300, 340, 380].map(x => (
          <circle key={x} cx={x} cy={36 + (x % 60 > 30 ? 4 : 0)} r="5" fill={COLORS.orange} stroke={COLORS.ink} strokeWidth="1.5" />
        ))}

        {/* Ground */}
        <rect x="0" y="200" width="400" height="40" fill={COLORS.cream} />
      </svg>
    </div>
  )
}
```

- [ ] **Step 3: Create `components/stories/scenes/NaniHouseScene.tsx`**

```tsx
'use client'

import { COLORS } from '@/components/design/tokens'

const W = '#fff' // @design-allow: white literal

/**
 * Nani's house — interior scene with warm peach walls, a window with sunlight,
 * a low wooden table laden with steel plates and a glass tumbler.
 */
export function NaniHouseScene() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 16 }}>
      <svg viewBox="0 0 400 240" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        {/* Wall */}
        <rect x="0" y="0" width="400" height="170" fill={COLORS.peach2} />

        {/* Window (left) */}
        <rect x="40" y="40" width="80" height="60" fill={COLORS.butter} stroke={COLORS.ink} strokeWidth="2.5" />
        <line x1="80" y1="40" x2="80" y2="100" stroke={COLORS.ink} strokeWidth="2" />
        <line x1="40" y1="70" x2="120" y2="70" stroke={COLORS.ink} strokeWidth="2" />
        {/* Sun rays through window */}
        <path d="M 130 50 L 170 90 L 130 130 Z" fill={COLORS.butter} opacity="0.4" />

        {/* Floor — wood-tone */}
        <rect x="0" y="170" width="400" height="70" fill={COLORS.orange2} opacity="0.5" />
        <line x1="0" y1="170" x2="400" y2="170" stroke={COLORS.ink} strokeWidth="2.5" />

        {/* Low table */}
        <rect x="230" y="160" width="140" height="20" fill={COLORS.orange2} stroke={COLORS.ink} strokeWidth="2.5" />
        <rect x="240" y="180" width="6" height="20" fill={COLORS.orange2} stroke={COLORS.ink} strokeWidth="2.5" />
        <rect x="354" y="180" width="6" height="20" fill={COLORS.orange2} stroke={COLORS.ink} strokeWidth="2.5" />

        {/* Steel plate with food */}
        <ellipse cx="280" cy="160" rx="20" ry="5" fill={COLORS.lav2} stroke={COLORS.ink} strokeWidth="2" />
        <circle cx="275" cy="156" r="4" fill={COLORS.orange} stroke={COLORS.ink} strokeWidth="1.5" />
        <circle cx="285" cy="156" r="4" fill={COLORS.mint} stroke={COLORS.ink} strokeWidth="1.5" />

        {/* Glass tumbler */}
        <rect x="330" y="148" width="10" height="14" fill={COLORS.lav2} stroke={COLORS.ink} strokeWidth="1.5" />

        {/* Wall decoration — small framed picture */}
        <rect x="260" y="50" width="40" height="50" fill={COLORS.mint2} stroke={COLORS.ink} strokeWidth="2.5" />
      </svg>
    </div>
  )
}
```

- [ ] **Step 4: Create `components/stories/scenes/NarratorCard.tsx`**

```tsx
'use client'

import { COLORS } from '@/components/design/tokens'

/**
 * Narrator card — neutral title-card style backdrop for narration panels.
 * Lavender dotted backdrop matching the rest-of-app aesthetic.
 */
export function NarratorCard() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 16,
        background: COLORS.lav,
        backgroundImage: `radial-gradient(circle at 1px 1px, ${COLORS.lav2} 1px, transparent 0)`,
        backgroundSize: '12px 12px',
      }}
    />
  )
}
```

- [ ] **Step 5: Create `components/stories/scenes/index.ts`**

```ts
import { ChaiStallScene } from './ChaiStallScene'
import { BazaarScene } from './BazaarScene'
import { NaniHouseScene } from './NaniHouseScene'
import { NarratorCard } from './NarratorCard'
import type { SceneId } from '@/types/story'

export const SCENES: Record<SceneId, React.ComponentType> = {
  'chai-stall': ChaiStallScene,
  bazaar: BazaarScene,
  'nani-house': NaniHouseScene,
  'narrator-card': NarratorCard,
}

export { ChaiStallScene, BazaarScene, NaniHouseScene, NarratorCard }
```

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit
node scripts/lint-design.mjs
```

- [ ] **Step 7: Commit**

```bash
git add components/stories/scenes/
git commit -m "feat(stories): add 4 scene background components"
```

---

## Task 5: `StoryCard` component for the Hindi home

**Files:**
- Create: `components/stories/StoryCard.tsx`

Modeled on `components/design/LessonStickerCard.tsx`. Smaller, with read-check sticker.

- [ ] **Step 1: Create `components/stories/StoryCard.tsx`**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sticker, COLORS, FONTS } from '@/components/design'
import { isStoryRead } from '@/lib/stories-progress'
import { playSound } from '@/lib/sounds'
import type { Story } from '@/types/story'

const W = '#fff' // @design-allow: white literal

type StoryCardProps = {
  story: Story
  index: number
}

const PALETTE_ROTATION = [COLORS.peach2, COLORS.butter, COLORS.mint2] as const

export function StoryCard({ story, index }: StoryCardProps) {
  const router = useRouter()
  const [read, setRead] = useState(false)
  const bg = PALETTE_ROTATION[index % PALETTE_ROTATION.length]

  useEffect(() => {
    setRead(isStoryRead(story.id))
  }, [story.id])

  const open = () => {
    playSound('tap')
    router.push(`/stories/${story.id}`)
  }

  return (
    <Sticker color={bg} onClick={open} radius={18} padding={14}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 18,
              color: COLORS.ink,
              lineHeight: 1.15,
              marginBottom: 4,
            }}
          >
            {story.title}
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink60, lineHeight: 1.3 }}>
            {story.description}
          </div>
        </div>
        {read && (
          <div
            aria-label="Read"
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              background: COLORS.mint,
              border: `2.5px solid ${COLORS.ink}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 14,
              color: COLORS.ink,
              flexShrink: 0,
            }}
          >
            ✓
          </div>
        )}
      </div>
    </Sticker>
  )
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
node scripts/lint-design.mjs
```

- [ ] **Step 3: Commit**

```bash
git add components/stories/StoryCard.tsx
git commit -m "feat(stories): add StoryCard component for Hindi home"
```

---

## Task 6: `StoryReader` component (the big one)

**Files:**
- Create: `components/stories/StoryReader.tsx`

This is the per-panel tap-through reader. Manages panel index, English-reveal state, TTS playback, story-complete celebration.

- [ ] **Step 1: Create `components/stories/StoryReader.tsx`**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sticker,
  Cutting,
  Confetti,
  COLORS,
  FONTS,
  BORDER,
  SHADOW,
} from '@/components/design'
import { SCENES } from './scenes'
import { Nani } from './characters/Nani'
import { Customer } from './characters/Customer'
import { Shopkeeper } from './characters/Shopkeeper'
import { markStoryRead } from '@/lib/stories-progress'
import { speak } from '@/lib/speech'
import { playSound } from '@/lib/sounds'
import type { Story, Panel } from '@/types/story'

const W = '#fff' // @design-allow: white literal

type StoryReaderProps = { story: Story }

export function StoryReader({ story }: StoryReaderProps) {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [englishRevealed, setEnglishRevealed] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [completed, setCompleted] = useState(false)

  const panel = story.panels[index]
  const isLast = index === story.panels.length - 1

  useEffect(() => {
    setEnglishRevealed(false)
  }, [index])

  useEffect(() => {
    if (isLast && !completed) {
      setCompleted(true)
      markStoryRead(story.id)
      playSound('complete')
    }
  }, [isLast, completed, story.id])

  const next = () => {
    if (index < story.panels.length - 1) {
      playSound('swipe')
      setIndex(index + 1)
    } else {
      playSound('tap')
      router.push('/')
    }
  }

  const prev = () => {
    if (index > 0) {
      playSound('swipe')
      setIndex(index - 1)
    }
  }

  const playTts = () => {
    if (speaking) return
    setSpeaking(true)
    speak(panel.hindi, 'hi-IN', () => setSpeaking(false))
  }

  const SceneComponent = SCENES[panel.scene]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.lav,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Top bar: back + progress */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px 8px',
          maxWidth: 480,
          width: '100%',
          margin: '0 auto',
        }}
      >
        <button
          onClick={() => {
            playSound('tap')
            router.push('/')
          }}
          aria-label="Back to home"
          style={{
            background: W,
            border: BORDER.sticker,
            boxShadow: SHADOW.chip,
            borderRadius: 999,
            padding: '6px 14px',
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 14,
            color: COLORS.ink,
            cursor: 'pointer',
          }}
        >
          ◀ Back
        </button>
        <div
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 12,
            color: COLORS.ink60,
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          Panel {index + 1} of {story.panels.length}
        </div>
      </div>

      {/* Scene area */}
      <div
        style={{
          flex: '0 0 auto',
          padding: '0 16px',
          maxWidth: 480,
          width: '100%',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            position: 'relative',
            height: 240,
            borderRadius: 18,
            border: BORDER.sticker,
            boxShadow: SHADOW.sticker,
            overflow: 'hidden',
            background: COLORS.creamBg,
          }}
        >
          <SceneComponent />

          {/* Character layer */}
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent:
                  panel.speaker_position === 'left'
                    ? 'flex-start'
                    : panel.speaker_position === 'right'
                    ? 'flex-end'
                    : 'center',
                padding: '0 18px 8px',
                pointerEvents: 'none',
              }}
            >
              <CharacterFor speaker={panel.speaker} storyId={story.id} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Text card */}
      <div
        style={{
          flex: 1,
          padding: '18px 16px',
          maxWidth: 480,
          width: '100%',
          margin: '0 auto',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <Sticker color={W} radius={18} padding={16}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <button
                  onClick={playTts}
                  disabled={speaking}
                  aria-label="Hear it"
                  style={{
                    background: speaking ? COLORS.orange : COLORS.butter,
                    border: BORDER.sticker,
                    boxShadow: SHADOW.chip,
                    borderRadius: 999,
                    padding: '6px 12px',
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 13,
                    color: COLORS.ink,
                    cursor: speaking ? 'default' : 'pointer',
                  }}
                >
                  🔊 hear it
                </button>
                <button
                  onClick={() => setEnglishRevealed(true)}
                  aria-label="Show English"
                  style={{
                    background: englishRevealed ? COLORS.mint : COLORS.peach,
                    border: BORDER.sticker,
                    boxShadow: SHADOW.chip,
                    borderRadius: 999,
                    padding: '6px 12px',
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 13,
                    color: COLORS.ink,
                    cursor: 'pointer',
                  }}
                >
                  {englishRevealed ? '✓ shown' : 'Show English'}
                </button>
              </div>

              <div
                style={{
                  fontFamily: FONTS.display,
                  fontWeight: 700,
                  fontSize: 22,
                  color: COLORS.ink,
                  lineHeight: 1.3,
                  marginBottom: 12,
                }}
              >
                {panel.hindi}
              </div>

              {panel.pronunciation && (
                <div
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 13,
                    color: COLORS.ink45,
                    fontStyle: 'italic',
                    marginBottom: 12,
                  }}
                >
                  {panel.pronunciation}
                </div>
              )}

              <motion.div
                initial={false}
                animate={{
                  background: englishRevealed ? COLORS.mint2 : COLORS.lav2,
                  borderColor: COLORS.ink,
                }}
                onClick={() => setEnglishRevealed(true)}
                role={englishRevealed ? undefined : 'button'}
                tabIndex={englishRevealed ? undefined : 0}
                style={{
                  border: BORDER.stickerDashed,
                  borderRadius: 12,
                  padding: '12px 14px',
                  cursor: englishRevealed ? 'default' : 'pointer',
                  fontFamily: FONTS.body,
                  fontSize: 15,
                  color: COLORS.ink,
                  minHeight: 40,
                }}
              >
                {englishRevealed ? panel.english : 'Tap to reveal English'}
              </motion.div>
            </Sticker>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 18,
            gap: 10,
          }}
        >
          <button
            onClick={prev}
            disabled={index === 0}
            aria-label="Previous panel"
            style={{
              background: index === 0 ? COLORS.peach2 : W,
              border: BORDER.sticker,
              boxShadow: index === 0 ? 'none' : SHADOW.chip,
              borderRadius: 999,
              padding: '10px 18px',
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 14,
              color: COLORS.ink,
              opacity: index === 0 ? 0.4 : 1,
              cursor: index === 0 ? 'default' : 'pointer',
            }}
          >
            ◀ prev
          </button>
          <button
            onClick={next}
            aria-label={isLast ? 'Finish story' : 'Next panel'}
            style={{
              background: isLast ? COLORS.mint : COLORS.orange,
              border: BORDER.sticker,
              boxShadow: SHADOW.chip,
              borderRadius: 999,
              padding: '10px 22px',
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 15,
              color: isLast ? COLORS.ink : W,
              cursor: 'pointer',
            }}
          >
            {isLast ? '✓ read more stories' : 'next ▶'}
          </button>
        </div>
      </div>

      {/* Completion confetti overlay */}
      {completed && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
          <Confetti />
        </div>
      )}
    </div>
  )
}

function CharacterFor({ speaker, storyId }: { speaker?: string; storyId: string }) {
  const size = 130
  if (!speaker || speaker === 'narrator') return null
  if (speaker === 'cutting') return <Cutting size={size} mood="happy" />
  if (speaker === 'nani') return <Nani size={size} />
  if (speaker === 'customer') {
    const shirtColor = storyId === 'lost-in-bazaar' ? COLORS.peach : COLORS.mint
    return <Customer size={size} shirtColor={shirtColor} />
  }
  if (speaker === 'shopkeeper1') return <Shopkeeper size={size} shirtColor={COLORS.peach} accentColor={COLORS.mint} />
  if (speaker === 'shopkeeper2') return <Shopkeeper size={size} shirtColor={COLORS.butter} accentColor={COLORS.lav} />
  if (speaker === 'child') return <Customer size={Math.round(size * 0.78)} shirtColor={COLORS.butter} />
  return null
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
node scripts/lint-design.mjs
npx vitest run
```

All green.

- [ ] **Step 3: Commit**

```bash
git add components/stories/StoryReader.tsx
git commit -m "feat(stories): add StoryReader with tap-through panels + TTS + completion"
```

---

## Task 7: `/stories/[id]` route

**Files:**
- Create: `app/stories/[id]/page.tsx`

- [ ] **Step 1: Create `app/stories/[id]/page.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { StoryReader } from '@/components/stories/StoryReader'
import { getStoryById } from '@/lib/stories'
import type { Story } from '@/types/story'

export default function StoryPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [story, setStory] = useState<Story | null | undefined>(undefined)

  useEffect(() => {
    if (!params?.id) return
    const found = getStoryById(params.id)
    setStory(found ?? null)
  }, [params?.id])

  if (story === undefined) return null
  if (story === null) {
    return (
      <div style={{ padding: 40, textAlign: 'center', fontFamily: 'system-ui' }}>
        Story not found.{' '}
        <button onClick={() => router.push('/')} style={{ textDecoration: 'underline' }}>
          Back to home
        </button>
      </div>
    )
  }

  return <StoryReader story={story} />
}
```

- [ ] **Step 2: Verify route boots**

```bash
npx tsc --noEmit
npx vitest run
```

All clean.

- [ ] **Step 3: Commit**

```bash
git add app/stories/
git commit -m "feat(stories): add /stories/[id] route"
```

---

## Task 8: Hindi home — insert "Stories" section

**Files:**
- Modify: `app/page.tsx`

Insert a new section between the existing Continue chip and the Situations/Foundations tab pill, scoped to `language === 'hindi'`.

- [ ] **Step 1: Add imports**

In `app/page.tsx`, add to the existing import block:

```ts
import { getAllStories } from '@/lib/stories'
import { getStoriesReadCount } from '@/lib/stories-progress'
import { StoryCard } from '@/components/stories/StoryCard'
```

- [ ] **Step 2: Compute stories list + read count**

Near the top of the `Home()` component, after the existing `lessons` declaration (around line 80-90), add:

```ts
const hindiStories = useMemo(() => (language === 'hindi' ? getAllStories() : []), [language])
const [storiesReadCount, setStoriesReadCount] = useState(0)
useEffect(() => {
  if (language === 'hindi') setStoriesReadCount(getStoriesReadCount())
}, [language])
```

`useMemo` and `useState`/`useEffect` already imported. If `getAllStories` returns an empty array for Dutch, the new section won't render.

- [ ] **Step 3: Insert the "Stories" section JSX**

Locate the tab pill in the JSX (look for `activeTab === 'situations'` or similar — the segment that says "Situations / Foundations"). Insert this block IMMEDIATELY BEFORE the tab pill:

```tsx
{language === 'hindi' && hindiStories.length > 0 && (
  <div
    style={{
      padding: '20px 20px 8px',
      maxWidth: 480,
      margin: '0 auto',
      position: 'relative',
      zIndex: 2,
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 14,
          color: COLORS.ink,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        Stories
      </div>
      <div
        style={{
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 11,
          color: COLORS.ink60,
          background: COLORS.cream,
          border: BORDER.thin,
          padding: '2px 10px',
          borderRadius: 999,
        }}
      >
        {storiesReadCount} of {hindiStories.length} read
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {hindiStories.map((story, i) => (
        <StoryCard key={story.id} story={story} index={i} />
      ))}
    </div>
  </div>
)}
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
npx vitest run
node scripts/lint-design.mjs
```

If `BORDER.thin` isn't imported, ensure it's in the existing barrel import (it is — `BORDER` is destructured at the top of `app/page.tsx`).

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "feat(stories): surface Stories section on Hindi home above tab pill"
```

---

## Task 9: Docs update + final QA + push

**Files:**
- Modify: `CLAUDE.md`
- Modify: `CONTENT.md`

- [ ] **Step 1: Update `CLAUDE.md` File Structure block**

Find the existing block (around line 44-50):

```
content/lessons/        → 10 Hindi situation JSON files (A1-A2)
...
```

Add after the Hindi vocab line:

```
content/stories/        → 3 Hindi story JSONs (Chai Galli motion-comics)
```

- [ ] **Step 2: Add to CLAUDE.md Pages table**

Find the Pages table. Add a new row:

```
| `/stories/[id]` | Single Hindi story — tap-through 5-panel motion-comic with Chai Galli scenes + characters (Cutting / Nani / Customer / Shopkeeper). Each panel: scene background (composed SVG) + character w/ idle motion + speech bubble + tap-to-reveal English + browser-TTS "hear it" + syllable-stress pronunciation hint. Framer Motion slide-in panel transitions. Last panel marks story-read in `learn-hindi:hindi-stories-read` + fires Confetti + "read more stories" CTA. |
```

- [ ] **Step 3: Add to CLAUDE.md Libraries table**

```
| `stories.ts` | Loader for the 3 Hindi story JSONs in `content/stories/`. `getAllStories()` + `getStoryById(id)`. TDD'd, 4 tests. |
| `stories-progress.ts` | Read-state tracking for stories. Storage key `learn-hindi:hindi-stories-read` (JSON array of read story IDs). TDD'd, 7 tests. |
```

- [ ] **Step 4: Add storage key**

In the Storage keys section, under the new-content-surfacing block:

```
- `learn-hindi:hindi-stories-read` — JSON array of story IDs the user has finished reading. Powers the read-check sticker on each StoryCard + the "N of 3 read" pill on the Hindi home Stories section header.
```

- [ ] **Step 5: Add 2026-05-26 wave entry**

At the very top of "Recent feature work log" (above the existing 2026-05-26 wave entry), add a sub-section:

```markdown
**2026-05-26 wave — Hindi Stories (Chai Galli motion-comics)**

- 3 short illustrated Hindi stories (5 panels each): `chai-stall` (A1 — Cutting's origin), `lost-in-bazaar` (A2 — directions comedy-of-helpfulness), `sunday-with-nani` (A2 — grandmother lunch).
- New content type: `Story` interface (`types/story.ts`) parallel to `Lesson`. Each panel has scene + dialogue + speaker + tap-reveal English + TTS pronunciation.
- New SVG character primitives (Chai Galli style): `Nani`, `Customer`, `Shopkeeper`. Cutting reused as chaiwala (Story 1) + customer (Story 3).
- 4 scene background components: `ChaiStallScene`, `BazaarScene`, `NaniHouseScene`, `NarratorCard` (composed inline SVG, no external assets).
- `StoryReader` (`components/stories/StoryReader.tsx`) drives tap-through: Framer Motion `AnimatePresence` slide transitions, per-panel English reveal-zone, browser TTS, completion Confetti.
- New route `/stories/[id]`. New section on Hindi home above the Situations/Foundations tab pill with 3 StoryCards + "N of 3 read" pill.
- `lib/stories-progress.ts` (TDD'd, 7 tests) persists read state to `learn-hindi:hindi-stories-read`.
```

- [ ] **Step 6: Update `CONTENT.md`**

Find the Hindi inventory section. Below the existing Foundations table, add:

```markdown
### Stories (`content/stories/*.json`) — 3 motion-comics
Chai Galli aesthetic illustrated 5-panel stories. Pure consumption (no quiz). Each panel: scene background + character + dialogue + English reveal + browser TTS.

| ID | Title | Tier | Vocab maps to |
|---|---|---|---|
| `chai-stall` | The Chai Stall | A1 | 01-greetings + 03-ordering-food |
| `lost-in-bazaar` | Lost in the Bazaar | A2 | 06-giving-directions |
| `sunday-with-nani` | Sunday with Nani | A2 | 07-home-visit + 10-phone-with-parents |
```

Also update the "Loading" section to add:
```
- `lib/stories.ts` — imports the 3 Hindi story JSONs
- `lib/stories-progress.ts` — Hindi-stories-read tracking
```

- [ ] **Step 7: Final QA**

```bash
npx vitest run            # all green (258 + 4 + 7 = 269 tests expected)
npx tsc --noEmit          # clean
node scripts/lint-design.mjs  # clean
git log --oneline dbe223c..HEAD   # 8-9 new commits
```

- [ ] **Step 8: Commit + push**

```bash
git add CLAUDE.md CONTENT.md
git commit -m "docs: add Hindi Stories to CLAUDE.md + CONTENT.md inventory"
git push origin main
```

---

## Self-review checklist (for the implementing engineer)

- [ ] `types/story.ts` defines Story + Panel + SceneId + SpeakerPosition
- [ ] 3 story JSONs exist with 5 panels each, all required fields present
- [ ] `lib/stories.ts` loads all 3 stories; 4 tests pass
- [ ] `lib/stories-progress.ts` persists to `learn-hindi:hindi-stories-read`; 7 tests pass; handles malformed JSON
- [ ] 3 character SVGs render in Chai Galli style (2.5px stroke, hard shadow, palette from `COLORS`); design-lint clean
- [ ] 4 scene components render valid SVG; design-lint clean
- [ ] StoryCard shows mint check-circle when read; uses palette rotation
- [ ] StoryReader supports tap-next / tap-prev / TTS / English-reveal / completion confetti
- [ ] `/stories/[id]` route renders + handles unknown ID gracefully
- [ ] Hindi home shows Stories section above the tab pill; Dutch home unchanged
- [ ] Tap a card → reader opens; swipe through 5 panels → completion screen → back to home shows mint check on that card
- [ ] All tests green; tsc clean; design-lint clean
- [ ] All 8-9 commits pushed to `main`
