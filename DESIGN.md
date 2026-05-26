# Chai Galli — Design Contract

> **Read this before writing or modifying any UI component.**
>
> Live reference: visit `/_dev/components` in the running app to see every primitive with all variants.
> Enforcement: `npm run lint:design` (block-list, runs in CI) + `npm run lint:design:strict` (allow-list, nightly).

## One-line summary

Chai Galli is sticker-pack Indian-bazaar. **Everything is offset-shadow-no-blur on solid colors.** No gradients (except the onboarding peach→butter), no soft shadows, no rounded translucent overlays.

## Palette

All color values come from `COLORS` in `components/design/tokens.ts`. Hardcoded hex codes outside that file fail the block-list lint.

| Token | Hex | Role |
|---|---|---|
| `ink` | `#36281e` | All borders, all body text, all foregrounds |
| `ink60` | `#5b4839` | Secondary text |
| `ink45` | `#8a6a4a` | Tertiary / caption text (handwritten Caveat) |
| `cream` | `#fff3cf` | Active-tab pill, on-ink contrast surface |
| `creamBg` | `#fbf5e8` | Sticker fills |
| `lav` | `#ebe2f6` | Page background (default) |
| `lav2` | `#d6c8ec` | Lavender palette accents |
| `peach` | `#ffc9a8` | Home/welcoming surfaces |
| `peach2` | `#ffe1cf` | Peach palette accents |
| `orange` | `#f0701a` | Primary CTA, streak chip |
| `orange2` | `#ff9b5a` | Orange palette accents |
| `mint` | `#b8e0c8` | Active tab indicator candidate, success states |
| `mint2` | `#d6efde` | Mint palette accents |
| `teal` | `#2f7d7d` | Mint palette motif circles |
| `green` | `#3aa66a` | Mark-complete CTA |
| `butter` | `#fde9a8` | Butter palette / TTS pills |
| `rose` | `#f6b6c0` | Cheek blush, soft accents |
| `redBg` | `#ffd6d6` | Wrong-answer background |
| `red` | `#e85a5a` | Wrong-answer fill |

## Fonts

Four roles, all configured in `app/layout.tsx` via `next/font/google`. Reference via `FONTS` in `tokens.ts`. **Never** write a `fontFamily` string that doesn't go through `var(--font-*)`.

| Role | CSS variable | Use for |
|---|---|---|
| display | `var(--font-bricolage)` | Headings, all buttons, page titles |
| body | `var(--font-nunito)` | Default body text, sticker content |
| tag | `var(--font-mochiy)` | Uppercase pill tags (use the `<Tag>` primitive) |
| script | `var(--font-caveat)` | Handwritten accents, captions |

## The Sticker Recipe (signature)

This is the heart of the design language. Every clickable surface composes from `<Sticker>`. The exact recipe — non-negotiable:

```css
border: 2.5px solid #36281e;     /* BORDER.sticker */
box-shadow: 4px 4px 0 #36281e;   /* SHADOW.sticker — NO blur, NO rgba */
border-radius: 18px;             /* RADIUS.md (default) */
background: <solid color from palette>;
```

When pressed: shadow tightens to `2px 2px 0 #36281e` (`SHADOW.stickerPressed`).
When selected: shadow grows to `6px 6px 0 #36281e` and the sticker lifts via `transform: translate(-2px, -2px)` (`SHADOW.stickerSelected`).

## Radii

Only these:

| Token | Value | Use |
|---|---|---|
| `RADIUS.pill` | 99 | Buttons, chips, tabs |
| `RADIUS.sheet` | 36 | Bottom sheets, header bands |
| `RADIUS.lg` | 22 | Large stickers |
| `RADIUS.md` | 18 | Default sticker, speech bubbles |
| `RADIUS.sm` | 14 | Small tags, dense surfaces |

## Borders

Only three widths exist:

| Token | Value | Use |
|---|---|---|
| `BORDER.sticker` | `2.5px solid #36281e` | All sticker surfaces |
| `BORDER.thin` | `1.8px solid #36281e` | Inline highlights, tail strokes |
| `BORDER.hairline` | `1px dashed #36281e33` | Section dividers |
| `BORDER.stickerDashed` | `2.5px dashed #36281e` | Hint/empty-state stickers |

## Shadows

Only these. **No CSS shadow may include a blur value other than 0.** Soft shadows are forbidden.

| Token | Value |
|---|---|
| `SHADOW.sticker` | `4px 4px 0 #36281e` |
| `SHADOW.stickerPressed` | `2px 2px 0 #36281e` |
| `SHADOW.stickerSelected` | `6px 6px 0 #36281e` |
| `SHADOW.chip` | `3px 3px 0 #36281e` |
| `SHADOW.headerBand` | `0 4px 0 #36281e` |
| `SHADOW.sheet` | `0 -6px 0 #36281e` |

## Chaina anchors

The mascot moment system supports 9 anchors. See `components/design/moments.ts` for the registry; see `components/design/MomentStage.tsx` for the positioning logic. Use existing anchors; don't add new ones without updating both the registry and the stage.

## Motif system

6 lesson icons (`MotifIcon` kinds): `marigold`, `auto`, `chai`, `film`, `phone`, `map`. Palette pairings derived via `deriveLessonStyle(id, idx)` in `tokens.ts`. Add a new motif only by:

1. Adding it to the `MotifKind` union in `tokens.ts`.
2. Adding the SVG to `MotifIcon.tsx`.
3. Adding a keyword mapping in `deriveLessonStyle`.
4. Adding the new motif to the `/_dev/components` gallery.

## Animations

All approved keyframes live in `components/design/animations.css` and `components/design/cutting-animations.css`. Don't introduce new `@keyframes` without adding it to one of those two files. Don't write inline CSS animations with non-approved names.

CSS `transition`s of opacity / transform / color / background are fine.

## What NOT to do

These will fail the lint or look wrong:

- ❌ Raw hex codes (e.g. `color: '#abc123'`) outside `tokens.ts`. Use a `COLORS.*` reference. (Use `// @design-allow: <reason>` on the same line only for justified exceptions, e.g. the chai-liquid color in `Cutting.tsx`.)
- ❌ Soft `box-shadow` with blur > 0 (e.g. `0 4px 10px rgba(0,0,0,0.1)`). Use `SHADOW.*`.
- ❌ Border widths other than 2.5px / 1.8px / 1px / 0 / none.
- ❌ Importing from `@mui/*`, `@chakra-ui/*`, `react-bootstrap`, `@radix-ui/*`, `antd`, `tailwind-styled-components`. The in-repo design system is the only UI library.
- ❌ `fontFamily` strings that don't go through `var(--font-*)`.
- ❌ Pastel mid-saturation colors (the palette tokens are the only colors that exist).
- ❌ Gradient backgrounds anywhere except the onboarding peach→butter gradient.
- ❌ Lowercase enforcement missing on buttons. Every button has `textTransform: 'lowercase'`.

## Workflow

| Command | What it does |
|---|---|
| `npm run lint:design` | Fast block-list lint. Runs in CI on every PR; blocks merge on violations. |
| `npm run lint:design:strict` | Slower AST allow-list lint. Runs nightly; opens a GitHub issue on new violations. Non-blocking. |
| `npm run test:visual` | Playwright snapshot tests. Runs in CI; fails on pixel drift > 0.5%. |
| `npm run test:visual:update` | Regenerates baseline screenshots. Run when an intentional visual change ships. |
| Visit `/_dev/components` | The component gallery — every primitive with all variants and usage examples. |

## For every new primitive

1. Add it to `components/design/` and export from `components/design/index.ts`.
2. Add it to the gallery at `app/_dev/components/page.tsx` with all variants.
3. If it introduces a new token (color, shadow, etc.) it goes into `tokens.ts` first.
4. Run `npm run lint:design` before committing.
5. If your change touches a Big-5 route (home / lesson / practice / quiz / progress), update visual baselines via `npm run test:visual:update` and commit the new screenshots alongside your code change.
