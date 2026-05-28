# New Hindi stories + collapsible Stories section — design

**Date:** 2026-05-27
**Status:** Built + shipped
**Track:** Hindi stories (Chai Galli motion-comics)

## Goal

1. Add 2 new A2 stories (cute, not-too-basic, fill practical gaps): **Diwali Night** (festival) and **At the Doctor** (health), each with its own new scene.
2. Make the home Stories section tidier: read/done stories collapse behind a fold, unread stay visible.

## Approved decisions

- **Art scope:** each new story gets its own new scene background (2 new scenes), plus 1 new character (Doctor).
- **Stories:** Diwali Night + At the Doctor.
- **Collapse model:** read stories tuck into a `✓ N read ▾` fold (collapsed by default); unread render as cards. Mirrors the Progress page's completed-lessons fold.

## What was built

### Content + art

- **2 scenes** (`components/stories/scenes/`, Chai Galli SVG, palette tokens + `@design-allow` for the few non-token art colors): `DiwaliRooftopScene` (indigo night sky, marigold toran, glowing diyas on a parapet, distant skyline, firework burst) and `ClinicScene` (mint walls, exam bed, wall chart with a medical cross, wall clock, cabinet). `SceneId` union extended `+ 'diwali-rooftop' | 'clinic'`; both registered in `scenes/index.ts`.
- **1 character** (`Doctor.tsx`): white coat + stethoscope + teal top. Diwali reuses Cutting + Nani + Customer. `CharacterFor` in `StoryReader` maps `speaker === 'doctor'`.
- **2 story JSONs** (`content/stories/04-diwali-night.json`, `05-at-the-doctor.json`), 5 panels each, A2, bilingual + syllable-stress pronunciation + skill_tags. Registered in `lib/stories.ts` (3 → 5). Diwali teaches festival greetings / family / gifting; Doctor teaches health vocab / symptoms / `aap`-register imperatives, ending on the proverb "aaram sabse achhi dawa hai".

### Collapse UI (`app/page.tsx`)

The home Stories section splits the list by read-state (computed post-mount via `getStoriesRead()`, so no SSR/hydration mismatch). Unread stories render as cards. Read stories sit behind a `✓ N read` fold button (default collapsed; `show ▾` / `hide ▴`). The `N of M read` header pill is unchanged. `StoryCard` palette index stays keyed to the story's original position so colors are stable.

## Boundaries

- Hindi-only (Stories are Hindi-scoped); no Dutch impact.
- No completion Chaina moment (consistent with the existing 3 stories).
- Only schema change is the `SceneId` union (+2). `lib/stories.ts` array 3 → 5. Stories loader test updated 3 → 5; full suite 259 passing.
- New SVGs use palette tokens; design-lint clean. Mascot/theme untouched.
