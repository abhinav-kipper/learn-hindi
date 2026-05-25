# Design Lock-in Pipeline — Spec

**Status:** approved 2026-05-25
**Repo:** `abhinav-kipper/learn-hindi`
**Branch (TBD at impl time):** `feature/design-lock-in`

## 1. Scope

Establish a 3-layer enforcement system so future feature work in `learn-hindi` cannot drift from the Chai Galli design language without an explicit, reviewer-visible decision:

1. **Visual regression** — Playwright snapshots of the 5 high-traffic routes (8 baselines covering fresh + mid-progress states). Pixel drift > 0.5% fails CI.
2. **Block-list lint** — fast regex check in CI that rejects raw hex / soft shadows / non-token values / unauthorized UI library imports.
3. **Allow-list lint** — slower AST check that runs nightly; enforces tokens-only usage and opens a GitHub issue on drift (non-blocking).
4. **Component gallery** — in-app `/_dev/components` page showing every Chai Galli primitive with all variants.
5. **`DESIGN.md`** — explicit rules contract, referenced from `CLAUDE.md` as STRICT-MODE.

Together: detection catches drift, prevention makes the rules so explicit they're hard to violate.

## 2. Decisions (settled in brainstorming)

| Decision | Choice |
|---|---|
| Three layers (visual / lint / gallery) | All three |
| Snapshot scope | Big 5 only (home, lesson, practice, quiz, progress) × 2 seed states |
| Lint flavor | Block-list in CI (blocking) + allow-list nightly (soft signal) |
| Gallery URL | `/_dev/components`, no env gate, always available |
| Rules-file location | New `DESIGN.md` at repo root, referenced from `CLAUDE.md` |
| Snapshot tool | Playwright |
| Pixel diff tolerance | 0.5% |
| Viewport | 390×844 (iPhone 14 — the primary target device) |

## 3. File layout

### New files

| Path | Purpose |
|---|---|
| `DESIGN.md` | The contract. Palette tokens, font roles, sticker/shadow/border recipes, anchor system, motif rules, "what NOT to do", tooling pointers. ~300 lines. |
| `e2e/visual.spec.ts` | Playwright tests — 9 snapshots covering Big 5 × seed states. |
| `e2e/playwright.config.ts` | Playwright config: 0.5% pixel tolerance, viewport 390×844, base URL `http://localhost:3000`. |
| `e2e/seeds/fresh.json` | localStorage fixture: onboarded but no progress. |
| `e2e/seeds/mid-progress.json` | localStorage fixture: 3 lessons complete, 7-day streak, ~20 phrases learned, 1 mistake recorded. |
| `e2e/screenshots/` | Baseline PNGs (committed). `*.diff.png` outputs gitignored. |
| `scripts/lint-design.mjs` | Block-list regex lint. CLI: exits non-zero on violations. |
| `scripts/lint-design-strict.mjs` | Allow-list AST lint using `@babel/parser` + `@babel/traverse`. Emits a JSON report. |
| `app/_dev/components/page.tsx` | Gallery page. Sections per primitive with all variants + import/usage code blocks. |
| `app/_dev/layout.tsx` | Minimal layout — no BottomNav, no ChainaProvider, dotted-bg only — so the gallery doesn't fire moments or trigger app side effects. |
| `.github/workflows/visual.yml` | Playwright CI workflow. Runs on PRs + push to main. Uploads diff artifacts on failure. |
| `.github/workflows/design-strict.yml` | Nightly cron for the allow-list lint. Opens a GitHub issue on new violations. |

### Modified files

| Path | Change |
|---|---|
| `CLAUDE.md` | Add a top-of-file `STRICT-MODE` block: "Before writing or modifying any UI component, read `DESIGN.md`. Run `npm run lint:design` before committing. The component gallery at `/_dev/components` is the authoritative reference for every primitive." |
| `package.json` | New scripts: `lint:design`, `lint:design:strict`, `test:visual`, `test:visual:update`. New devDeps: `@playwright/test`, `@babel/parser`, `@babel/traverse`. |
| `.github/workflows/ci.yml` | Add `npm run lint:design` step (blocking, fast). |
| `.gitignore` | Add `e2e/screenshots/**/*.diff.png` and Playwright artifacts. |

### Deleted files

None.

## 4. Layer details

### Layer 1 — Block-list lint (`scripts/lint-design.mjs`)

**Scope:** `app/**/*.{ts,tsx}`, `components/**/*.{ts,tsx}`. **Excluded:** `components/design/tokens.ts`, `__tests__/`, anything in `node_modules`.

**Rules (regex-based):**

1. **Raw hex outside tokens** — `/#[0-9a-fA-F]{3,8}/` matches that are not on the same line as a `// @design-allow: <reason>` comment fail. Allowlist exception: the `components/design/tokens.ts` file itself.
2. **Soft shadow** — `/box-?shadow:[^;]*\sblur\s/` OR `/boxShadow:\s*['"`][^'"`]+\d+px\s+\d+px\s+\d+px\s/` (3rd value = blur, must be 0). Fail.
3. **Non-standard border width** — `/border:\s*['"`]?(?!0|none|inherit)(?!2\.5px|1\.8px|1px\b)\d+(\.\d+)?px/` Fail unless on `@design-allow` line.
4. **Unauthorized UI library imports** — explicit deny-list: `@mui/*`, `@chakra-ui/*`, `react-bootstrap`, `tailwind-styled-components`, `@radix-ui/*` (except `react-slot` if already used), `antd`. Anything imported from these → fail.
5. **`fontFamily` not using token** — `/fontFamily:\s*['"`](?!var\(--font-)/` Fail unless on `@design-allow` line.

**Output:** `file:line:rule  description  matched-snippet`. Exit code 1 on any hit.

**Performance:** Pure regex, no AST. Should run in <2s on the current codebase.

### Layer 2 — Allow-list lint (`scripts/lint-design-strict.mjs`)

**Scope:** Same as Layer 1.

**Approach:** Use `@babel/parser` to parse TSX, `@babel/traverse` to walk JSX attributes + object expressions. For every CSS-style property value:
- `color`, `backgroundColor`, `background` → must resolve to a `COLORS.*` token reference, or `'transparent'`, `'inherit'`, `'currentColor'`, `'#fff'`, `'#000'`.
- `border`, `borderTop/Left/Right/Bottom` → must reference `BORDER.*`.
- `boxShadow` → must reference `SHADOW.*` OR be literally `'none'`.
- `borderRadius` → must reference `RADIUS.*` OR be a numeric literal that matches a token value.
- `fontFamily` → must reference `FONTS.*`.

**Exceptions:** `// @design-allow: <reason>` on the property line (same as Layer 1) skips the check for that property.

**Output:** JSON report at `e2e/design-lint-report.json`. New violations vs. last nightly run → open a GitHub issue listing them. No CI blocking.

**Performance:** Slower (AST walk on ~50 files). Acceptable for a nightly run.

### Layer 3 — Visual regression (Playwright)

**Snapshot matrix (9 PNGs):**

| Route | Fresh user | Mid-progress |
|---|---|---|
| `/` | ✓ | ✓ |
| `/lessons/01-greetings` | ✓ | ✓ |
| `/practice/01-greetings` | ✓ | — |
| `/quiz` | — | ✓ |
| `/progress` | ✓ | ✓ |

= 8 baselines (home×2 + lesson×2 + practice×1 + quiz×1 + progress×2).

**Test flow per snapshot:**
1. Launch `npm run dev` once at suite start (Playwright `webServer` config).
2. Seed localStorage from the appropriate fixture before `page.goto()`.
3. Navigate to the route.
4. `await page.waitForLoadState('networkidle')` + 500ms settle for animations.
5. Disable Chaina moments via a query param `?chaina=off` (or set a localStorage flag the app reads — see "Implementation notes" below) — moments are non-deterministic and would cause spurious diffs.
6. `await expect(page).toHaveScreenshot('<route>-<state>.png', { maxDiffPixelRatio: 0.005 })`.

**Mid-progress fixture details:**
- `hindi-progress`: completedLessons=['01-greetings','02-auto-negotiation','03-ordering-food'], currentStreak=7, lastActiveDate=today, lessonCompletedAt: {...}, seenStreakMilestones=[7]
- `hindi-phrase-progress`: {01-greetings: {0,1,2,3}, 02-auto-negotiation: {0,1}, ...}
- `hindi-quiz-scores`: one entry with score 8/10
- `hindi-mistakes`: one mistake
- `hindi-user-profile`: name="Test", gender="female", dailyGoal=5, onboardingComplete=true
- `chaina-first-ever-seen`: '1' (so onboarding moment doesn't fire)

**Updating baselines:**
- `npm run test:visual:update` — runs Playwright with `--update-snapshots`. Generates a diff PR for review.

**CI flow:**
- On PR: run Playwright. If any snapshot fails, upload `e2e/screenshots/*-actual.png` + `*-diff.png` as artifacts. Reviewer eyeballs, either updates the baseline (commit) or fixes the regression.
- On push to main: re-baseline if needed (manual `test:visual:update` then commit).

### Layer 4 — Component gallery (`app/_dev/components/page.tsx`)

**Sections** (in order, each rendered as a labeled card on the page):

1. **Palette** — every `COLORS.*` token shown as a swatch with hex code + name.
2. **Fonts** — 4 sample strings, one per FONT role, with the variable name.
3. **Sticker** — default, dashed, selected (lifted), each color background.
4. **Tag** — default, custom bg/color, all 4 motif palettes.
5. **HeaderBand** — fresh render.
6. **Cutting** — all 7 moods (idle/happy/wave/sympathy/wink/excited/sleepy) side-by-side at size 110. Plus one at size 170 for celebration scale.
7. **MotifIcon** — all 6 kinds (marigold/auto/chai/film/phone/map) each at 64px.
8. **MarigoldStrip** — the wobbling divider.
9. **StreakChip** — at 1/7/14/30/100 day values.
10. **Confetti** — toggle button to fire, since it's transient.
11. **DottedBg** — section with opacity 0.35 (default) and 0.7.
12. **SpeechBubble** — default, with caption, all 4 tail positions.
13. **MomentStage primitives** — static rendering of one moment (no animation), one bubble with caption.
14. **Buttons** — primary (orange), secondary (cream), success (green), danger (red), all in lowercase Bricolage 800.
15. **LessonStickerCard** — one example with each palette × motif combo.
16. **NavButton** — prev/next/disabled states.

Each section: a labeled `<details>` card (collapsed by default to keep page short). Inside: the rendered component + a `<pre>` block with the literal JSX used to render it.

**Layout:** Single column, max-width 480px (matches mobile-first). Header: "Chai Galli component gallery" + "rules: see /DESIGN.md".

**Routing:** Lives under `app/_dev/components/page.tsx`. Always reachable in dev and production. No env gate (single-user app — security-by-obscurity is sufficient). Excluded from sitemap by virtue of the `_dev` prefix convention.

### Layer 5 — `DESIGN.md`

**Outline:**

1. **One-line summary** — "Chai Galli is sticker-pack Indian-bazaar; everything is offset-shadow-no-blur on solid colors."
2. **Palette** — table of every COLORS token + its semantic role.
3. **Fonts** — 4 font roles, what each is for.
4. **The Sticker Recipe** — exact CSS: 2.5px ink border, 4px 4px 0 ink shadow (no blur, no rgba). Hard rules.
5. **Radii** — pill 99, sheet 36, lg 22, md 18, sm 14.
6. **Borders** — sticker 2.5px, thin 1.8px, hairline 1px dashed at 33% opacity. No other widths.
7. **Anchors (Chaina moments)** — 9 named positions, where they apply.
8. **Motif system** — 6 lesson icons, palette pairings.
9. **Animations** — list of approved keyframes from `animations.css` and `cutting-animations.css`. No CSS transitions without an approved keyframe.
10. **What NOT to do** — soft shadows (no blur), raw hex outside tokens, MUI/Bootstrap, gradient backgrounds outside the peach→butter onboarding gradient, pastel mid-saturation, lowercase forced via `textTransform: 'lowercase'` is mandatory on every button.
11. **Workflow** — link to the gallery; commands: `npm run lint:design`, `npm run test:visual`, `npm run test:visual:update`. Reference: "for every new primitive, add a gallery entry before merging."

CLAUDE.md prepends:

```
## STRICT-MODE — UI changes

Before writing or modifying any UI component:
1. Read DESIGN.md
2. Visit /_dev/components in dev to see existing primitives
3. Run `npm run lint:design` before committing
4. If your change touches a Big-5 route (home / lesson / practice / quiz / progress) the visual-regression check will run on your PR
```

## 5. Migration / baseline

The codebase wasn't built under this enforcement. First-pass migration:

1. Run `npm run lint:design` once → catalog all hits.
2. For each hit, either:
   - Replace the literal with a token (preferred).
   - Move the literal into `tokens.ts` if it's a new design value.
   - Add `// @design-allow: <reason>` on the same line if the deviation is intentional (e.g. the chai liquid hex in `Cutting.tsx`).
3. Re-run until clean.
4. Commit the migration as a single PR ("chore: migrate to design lock-in baseline").
5. From then on, the lint blocks all new violations.

Same approach for the strict (Layer 2) lint, run separately.

For visual snapshots: generate the 9 baselines once after the gallery + seeds are in place, commit them. Subsequent PRs diff against these.

## 6. Out of scope

- Tailwind class linting (this app uses inline styles + token objects)
- Accessibility audits (separate skill)
- Performance budgets (separate concern)
- Dutch/Hindi content audits (already handled in lesson JSON review)
- Storybook (the gallery is sufficient; Storybook would be heavier)
- Cross-browser snapshots (single-target: mobile Safari / Chrome; Playwright Chromium baseline is enough)

## 7. Cost estimate

- Setup work: ~5 hours of agent work (DESIGN.md, gallery page, both lint scripts, Playwright config + seeds, CI workflows, baseline screenshots).
- Migration cleanup: ~30-60 min (cataloging + fixing/annotating existing violations).
- Ongoing PR overhead: +2 min CI time per PR (Playwright). Block-list lint <2s.

## 8. Open questions

None — all decisions settled in brainstorming.

## 9. Implementation notes (carried over for the plan)

- Playwright `webServer` should start `npm run dev`, wait for `http://localhost:3000` to be 200.
- To disable Chaina moments during snapshot runs, add a localStorage flag `chaina-disabled` that `MomentStage` checks at the start of `play()`. Seeds set this flag to `'1'`.
- The `e2e/` directory is excluded from `tsc --noEmit` (the test files use Playwright globals).
- The `_dev` route prefix should also be excluded from the PWA's service-worker pre-cache.
- The gallery page imports from `@/components/design` only — it's the regression check that the barrel exposes everything.
