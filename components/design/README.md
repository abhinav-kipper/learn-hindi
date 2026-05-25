# Chai Galli — design system quick reference

This is the design system used across every screen of Bolna Seekho. If
you're building a new screen or component, **import everything from
`@/components/design`** — never reach into individual files.

```ts
import {
  Sticker, Tag, Cutting, HeaderBand, MotifIcon, MarigoldStrip,
  StreakChip, Confetti, DottedBg, LessonStickerCard, LessonChaiGalli,
  ChaiGalliChatMessage, TypingDots,
  COLORS, FONTS, RADIUS, SHADOW, BORDER,
  paletteToBg, paletteToMotifBg, deriveLessonStyle,
} from '@/components/design'
```

For the canonical token reference (every color hex, every animation
timing), see `../../design_handoff_chai_galli/DESIGN_SYSTEM.md` in the
repo root.

---

## The signature recipe

**Every clickable surface uses the same recipe:**

```ts
border: 2.5px solid #36281e                      // ink — never pure black
box-shadow: 4px 4px 0 #36281e                    // offset, no blur, no rgba
border-radius: 22 (sticker) | 99 (pill) | 18 (small) | 36 (sheet)
```

Pressed state: `translate(2px, 2px)` + shadow shrinks to `2px 2px 0`.
Selected state (onboarding picks): `translate(-2px, -2px)` + shadow grows to `6px 6px 0`.

**Don't use soft `rgba` shadows. Don't use Inter / Geist. Don't use accent
colors that aren't in the palette.** These four rules are the whole signature.

The `<Sticker>` primitive handles all three states automatically — use it
for every clickable surface. Don't roll your own bordered cards.

---

## Page recipe

Every full-page surface follows this skeleton:

```tsx
'use client'
import { motion } from 'framer-motion'
import { Sticker, Tag, Cutting, DottedBg, COLORS, FONTS, BORDER, SHADOW }
  from '@/components/design'

export default function MyPage() {
  return (
    <div style={{ position: 'relative', minHeight: '100dvh', background: COLORS.lav, paddingBottom: 110 }}>
      <DottedBg />

      {/* HEADER BAND — spring-in from top */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        style={{
          position: 'relative',
          padding: '50px 20px 18px',
          background: COLORS.peach, // per-route, see table below
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
          borderBottom: BORDER.sticker,
          boxShadow: SHADOW.headerBand,
          zIndex: 2,
        }}
      >
        {/* back button on left (40x40 white pill), Cutting on right */}
        {/* Tag + title underneath */}
      </motion.div>

      {/* Body — stagger entrance for list items */}
      <div style={{ padding: '16px 20px 0', maxWidth: 480, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 240, damping: 22 }}
          >
            <Sticker color={...} radius={22} padding={14} onClick={...}>
              ...
            </Sticker>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
```

---

## Per-route header background

Use the route's canonical bg color so the visual rhythm is consistent.
(Copied from the spec; deviating is a regression.)

| Route | Header bg | Mood |
|---|---|---|
| `/` (home) | `linear-gradient(180deg, #ffc9a8 → #ffe1cf)` (peach gradient) | warm welcome |
| `/lessons/[id]` | matches lesson palette via `deriveLessonStyle(lesson.id, idx)` | contextual |
| `/lessons/[id]` celebration | `linear-gradient(180deg, COLORS.peach → COLORS.mint2)` | celebratory |
| `/practice/[id]` | `COLORS.butter` | conversational |
| `/quiz` | `COLORS.mint` | focused |
| `/quiz` results | `COLORS.mint` | accomplishment |
| `/progress` | `COLORS.lav2` | reflective |
| `/mistakes` | `COLORS.redBg` | flagged |
| `/favorites` | `COLORS.butter` | warm-saved |
| `/vocabulary` | `COLORS.mint` | structured |
| `/vocabulary/[category]` | palette per category (see source) | varied |
| `/drill/conjugation` picker | `COLORS.lav2` | neutral |
| `/drill/conjugation` active | per tense: `COLORS.mint` (present) / `COLORS.peach` (past) / `COLORS.lav2` (future) | contextual |
| `/onboarding` | `linear-gradient(180deg, COLORS.peach → COLORS.butter)` | welcoming |

---

## Lesson palette + motif mapping

`deriveLessonStyle(lessonId, index)` returns `{ palette, motif }`:

- **Palette** cycles by index: `peach → mint → butter → lav`
- **Motif** keyword-matches on the id: `greet/home/visit → marigold`,
  `auto/rickshaw → auto`, `food/chai/order → chai`, `opinion/bollywood →
  film`, `plan/phone → phone`, `direction/map → map`. Falls back to a cycle.

```tsx
const { palette, motif } = deriveLessonStyle(lesson.id, index)
const bg = paletteToBg(palette)       // mint/peach/butter/lav fill
const motifBg = paletteToMotifBg(palette)  // teal/orange/butter-dark/purple
```

---

## Motion conventions

- **Header band**: `initial={{ y: -16 }}` spring 220/24
- **Continue chips & primary CTAs**: `initial={{ y: 16 }}` spring 240/22, delay 0.1-0.15
- **Sticker list items**: stagger via `delay: 0.1 + i * 0.06`, spring 240/22
- **Tab pills**: shared `layoutId` on the active background — slides between tabs
- **Reveal-zones**: `transition: 'all 0.3s'` from lavender → mint2
- **Mascot moods**: `idle` (default, blinks every 5.2s), `happy` (open mouth + tongue, often paired with `animation: 'happy-hop 1.4s ease-in-out infinite'` on the parent)
- **Confetti**: parent must be `position: relative; overflow: hidden`
- **Bottom sheets**: `initial={{ y: '100%' }}` spring damping 30 stiffness 300

All keyframes (float-y, blink, flame-flicker, happy-hop, wobble-z,
confetti-fall, ring-grow, pop-in, glow-pulse) live in `animations.css`,
imported once in `app/layout.tsx`. Reference them by name; don't add new
keyframes unless adding a new motion idea.

---

## Sound + haptic mapping

Every interaction fires both a sound and a vibration via
`playSound(name)` from `lib/sounds.ts`:

| Trigger | Sound | When |
|---|---|---|
| Click any clickable Sticker | `tap` | every press |
| Tap to open a lesson | `pop` | navigation to deeper view |
| Swipe phrase / change page | `swipe` | navigation |
| Star a favorite | `pop` | save action |
| Correct answer | `correct` + `cheer()` | quiz, drill, mistakes drill |
| Wrong answer | `wrong` | quiz, drill |
| Reveal translation | `pop` | reveal-zone tap |
| Mark complete / quiz finish | `levelup` + `cheer()` if good | end-of-flow celebration |

---

## Don'ts (the things that break the look)

- ❌ Don't introduce new accent colors. Pick from `COLORS`.
- ❌ Don't use Tailwind utility classes for backgrounds/borders/shadows on Chai Galli surfaces. Use the inline style props on `<Sticker>` instead — the recipe is tight.
- ❌ Don't reach into individual primitive files (`Sticker.tsx` etc.). Always import via `@/components/design`.
- ❌ Don't import old deleted components (`lesson-card`, `streak-counter`, `chat-message`, `lesson-flow/*`, `read-aloud-button`). They're gone.
- ❌ Don't add a soft drop shadow. Only the 4px hard offset.
- ❌ Don't put Mira (Direction A's peacock) anywhere — Cutting only.
- ❌ Don't add Devanagari script — keep romanization per CONTENT.md.

---

## Adding a new screen

1. Start from the page recipe above.
2. Pick a header bg from the route table (or invent one if it's a genuinely new section type, then add to the table here).
3. Compose with `Sticker`, `Tag`, `Cutting`, `MotifIcon` — don't roll your own bordered card.
4. Add motion: header slide-in + stagger on list items at minimum.
5. Wire `playSound('tap')` on every clickable, `playSound('pop')` on navigation.
6. If celebrating an accomplishment, fire `play('correctAnswer' | 'lessonComplete' | ...)` from `useChaina()` for character moments — see `moments.ts` for the 15-moment registry. Maybe pair with confetti via `<Confetti active />` (parent must be `relative; overflow: hidden`).
7. Test with Playwright: render the page, click through, assert zero console errors.
