# Per-language theme + mascot — design

**Date:** 2026-05-27
**Status:** Brainstormed, design approved, plan TBD
**Track:** Visual identity / Chai Galli design system

## Problem

The app currently uses one visual identity for both learning tracks: orange as the brand-primary accent and Cutting (the chai-cup mascot) at every header. That's fine when the user is studying Hindi — chai + saffron is on-brand for Indian street vibe — but Dutch deserves its own visual identity. Orange already happens to be the Dutch national color (King's Day, the national football team, the royal house), so the orange should stay there. Hindi needs a different primary, and Dutch needs a different mascot. The two tracks should feel like two distinct rooms in the same house.

## Goal

Split brand identity across the two language tracks:

- **Hindi:** new primary color (Holi pink / magenta), mascot stays as **Cutting** (chai cup)
- **Dutch:** primary stays orange (national color), mascot becomes **Mr. Stroopwafels** (caramel-waffle cookie with handlebar mustache + round sunglasses)

The split is implemented via a small `useTheme()` hook + a `<Mascot>` wrapper component. Both honor the Chai Galli design rules (2.5px ink border, hard 4px offset shadow, sticker palette, inline SVG, no soft shadows).

## Non-goals (deferred)

- Per-language lesson palette tiles — `peach`/`mint`/`butter`/`lav` stay as per-card identity, not brand
- Per-language motif tile colors — the rickshaw, marigold, chai-cup, film, phone, map icon tiles stay saffron/teal/butter/lav regardless of active language (these encode Indian-ness)
- Status semantics — `green = correct/done`, `red = wrong/danger`, `butter = needs review` stay constant across both languages
- Cutting visual redesign — Cutting stays exactly as is; Mr. Stroopwafels is brand new and parallel
- New Chaina voice files — audio remains unchanged; only the visible mascot at moment-stage swaps for Dutch
- Onboarding flow restyling — still Cutting-centric during the initial 5-slide flow; mascot swap kicks in once the user lands on the language-aware home

## The user experience

**Hindi user opens the app.** Header bands use `theme.primary = COLORS.pink`. The streak chip is a pink-flame chip (still 🔥 emoji — fire reads orange in any case, but the surrounding chip background is pink). Daily-goal bar gradient runs pink2 → pink. Active-tab cream pill and "let's start" / "next →" CTAs are pink. Cutting (chai cup) mascot greets her at every header just like today.

**She toggles language to Dutch** (via Settings or the bottom-nav flag). Same routes, same components, but the theme resolves differently: brand-primary returns to orange (orange2 → orange gradient on the daily-goal bar, orange CTAs, orange streak chip). The mascot in every header swaps to Mr. Stroopwafels — a round caramel-bronze cookie with a 4×4 ink-bordered waffle-cell grid across his body, a thin darker-brown caramel sliver peeking out the bottom edge, a cream face panel where two round black sunglasses sit (with a tiny cream sparkle dot in each lens), and a thick black handlebar mustache between the sunglasses and his mouth.

Both mascots support the same mood prop set as Cutting today (`idle | happy | wave | sympathy | wink | excited | sleepy`). Mr. Stroopwafel's mood expressions:

- `happy`/`excited`: mouth opens, mustache tips tilt up, lens sparkles pop bigger
- `sympathy`: mouth turns down, mustache tips droop slightly
- `wink`: one sunglass lens lifts briefly, revealing a winking eye dot underneath
- `sleepy`: sunglasses slide lower on his face, a `Zzz` floats above
- `idle`: neutral mouth, flat mustache, occasional sparkle twinkle (substitutes for Cutting's blink animation)

## Architecture

### New tokens

`components/design/tokens.ts` gains:

```ts
pink: '#d63f8b',
pink2: '#f37bb1',
```

The existing `green: '#3aa66a'` keeps its semantic "success / done" job — it's deliberately NOT being used as the Hindi primary to avoid clashing with the ✓ DONE bars and quiz-correct fills.

### Theme hook

New file `components/design/theme.ts`:

```ts
import { useLanguage } from '@/lib/language-context'
import { COLORS } from './tokens'
import { Cutting } from './Cutting'
import { MrStroopwafel } from './MrStroopwafel'
import type { ComponentType } from 'react'

export interface Theme {
  primary: string
  primary2: string
  Mascot: ComponentType<MascotProps>
}

export type MascotProps = {
  size?: number
  mood?: 'idle' | 'happy' | 'wave' | 'sympathy' | 'wink' | 'excited' | 'sleepy'
  blink?: boolean
}

export function useTheme(): Theme {
  const { language } = useLanguage()
  if (language === 'dutch') {
    return { primary: COLORS.orange, primary2: COLORS.orange2, Mascot: MrStroopwafel }
  }
  return { primary: COLORS.pink, primary2: COLORS.pink2, Mascot: Cutting }
}
```

Exported from `components/design/index.ts` alongside the existing exports.

### Mascot wrapper

New file `components/design/Mascot.tsx`:

```ts
'use client'

import { useTheme, type MascotProps } from './theme'

export function Mascot(props: MascotProps) {
  const { Mascot: Resolved } = useTheme()
  return <Resolved {...props} />
}
```

This is the single component that every page imports going forward. Existing `<Cutting>` call sites refactor to `<Mascot>`. The Cutting component itself stays untouched and remains importable for the (rare) cases that explicitly want chai-cup regardless of language (e.g., the dev components page that showcases both mascots side by side).

### Mr. Stroopwafels component

New file `components/design/MrStroopwafel.tsx`. Same prop shape and same mood-driven structure as `Cutting.tsx`. Inline SVG composed of:

- Outer body: 2.5px-ink-bordered caramel-bronze disc (color `#c89556` — within the existing warm-earth family, no new palette token required since it's mascot-local).
- Waffle grid: 4×4 inner cells drawn as ink lines forming the crosshatch.
- Caramel filling sliver: darker brown band (`#8a5a2e`) peeking out the bottom edge of the disc, suggesting the gooey middle of a real stroopwafel.
- Cream face panel: a smaller cream-bg circle floating on the front of the waffle (covers a few of the central waffle cells) where the face elements sit — keeps readability against the busy waffle grid.
- Sunglasses: two round ink-frame lenses + ink bridge. Lens fill: solid ink. One small cream sparkle dot per lens.
- Mustache: thick ink-fill handlebar shape below the sunglasses, two curl tips.
- Mouth: same curve set as Cutting (neutral / happy / sad / open) — keyed by `mood`.
- Mood overlays: sparkle dots for `happy`/`excited`, lifted-sunglass + winking eye dot for `wink`, lowered-sunglass + floating `Zzz` for `sleepy`, drooping mustache for `sympathy`.

Hard-shadow recipe is the same as everything else (`4px 4px 0 #36281e`).

### Refactor surface

The 92 `COLORS.orange*` call sites split into two buckets after audit:

- **Brand-primary uses (estimated 30-40):** flip to `theme.primary` / `theme.primary2`. These are the CTAs, streak chip, daily-goal bar gradient, mic button, active-tab pill, "let's start" / "next →" / "got it" buttons, theme-anchor accents on `/quiz` / `/practice` / `/lessons` celebration screens.
- **Lesson palette / motif uses (~50-60):** stay as `COLORS.orange`. These render lesson cards, motif tile fills (rickshaw, marigold), saffron decorative shapes. Per-card identity, not brand.

The audit is a manual one-time pass; the boundary is judged on a per-call-site basis as: "does this orange represent the active accent of the app right now (brand) or the lesson/decoration's identity?"

Every `<Cutting>` call site in `app/` becomes `<Mascot>`. The `_dev/components` showcase page is the only exception (it deliberately renders both for inspection).

`components/design/MomentStage.tsx` (the Chaina moments renderer) currently imports `Cutting` directly — that import flips to `Mascot`. Voice and frequency-cap logic untouched.

### Edge cases

- **`/_dev/components` showcase.** Already imports `Cutting` directly. Updated to ALSO import `MrStroopwafel` and render the two mascots side-by-side with all moods. Allows manual eyeball of the new mascot.
- **Mascot prop forwarding.** `Mascot` forwards `size`, `mood`, `blink` to the resolved component. If Mr. Stroopwafel doesn't blink (sunglasses cover the eyes), the `blink` prop is no-op for him — kept on the API for source-compat.
- **Theme on SSR.** `useLanguage()` reads localStorage on first client render; on the server it defaults to Hindi (the language-context lazy initializer). That means SSR renders Cutting + pink for the first paint, which hydrates correctly once localStorage resolves. The first-paint mismatch only happens for Dutch users; it's a 1-frame flash, identical to how `useLanguage()` already behaves throughout the app.
- **Lint compliance.** The new tokens (`pink`, `pink2`) land in `tokens.ts`. The `#c89556` and `#8a5a2e` colors for the stroopwafel body and filling are mascot-local — they're allowed because `lint:design` permits color literals inside the `components/design/` directory's mascot files (same exception Cutting uses today for its bronze body).

## Testing

- No new unit tests required for `useTheme` (pure read-through hook). One small render test for `Mascot` confirming language → component selection isn't critical but easy: mock `useLanguage`, render `<Mascot />`, assert which inner component appeared.
- No visual regression added yet (the Big-5 routes do have visual-regression baselines per `CLAUDE.md`; this change touches several of them — baselines need to be updated post-merge via `npm run test:visual:update`).
- Manual smoke: open `/_dev/components`, confirm Mr. Stroopwafel renders cleanly across all moods. Toggle language at home, confirm brand-primary swaps from pink to orange and mascot swaps from Cutting to Mr. Stroopwafel everywhere.

## Rollout

One ship, two logical waves inside it:

1. **Foundations:** add tokens, build `MrStroopwafel.tsx`, build `useTheme()` + `<Mascot>` wrapper, expose in barrel, render both mascots on `/_dev/components` for inspection. **No UI flips yet.** App still renders orange + Cutting everywhere.
2. **Migration:** refactor brand-primary `COLORS.orange*` → `theme.primary*` call sites. Refactor `<Cutting>` → `<Mascot>` call sites. Flip `MomentStage` import. App now visibly themed per language.

Either wave can ship to main on its own — wave 1 alone is invisible (foundations only); wave 2 alone would error (no theme to consume). The two waves are sequential, but they CAN be two separate PRs/commits if convenient.

## Out-of-scope follow-ups (worth noting for later)

- Update visual-regression baselines after merge — required for the Big-5 routes (home / lesson / practice / quiz / progress) since several of them visibly change for at least one language.
- Consider whether Mr. Stroopwafels should get his own voice in Chaina moments for Dutch (currently the voice files are reused; he speaks in Cutting's voice). Out of scope for this ship; possible follow-up if the audio feels off.
- Possible Hindi-track copy tweak — the "namaste, dost" header tag continues to feel right against pink; no change planned.
- A "color theme preview" option in `/settings` if we ever add a third language or non-language theme variants. Not needed today.
