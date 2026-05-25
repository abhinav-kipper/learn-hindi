# Design Lock-in Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lock in the Chai Galli design language so future feature work can't drift without a reviewer-visible decision — via Playwright visual regression, a block-list lint in CI, an allow-list lint as a nightly soft signal, an in-app component gallery, and a `DESIGN.md` contract.

**Architecture:** Three enforcement layers (visual snapshots, regex lint, AST lint) + two reference surfaces (in-app gallery, `DESIGN.md`). All tied together via npm scripts and GitHub Actions workflows. The `DESIGN.md` contract is the single source of truth; CLAUDE.md is updated to direct future agents to read it before any UI work.

**Tech Stack:** Playwright (visual snapshots), `@babel/parser` + `@babel/traverse` (AST lint), Node.js (lint scripts), GitHub Actions (CI). Package manager: pnpm.

**Spec:** `docs/superpowers/specs/2026-05-25-design-lock-in-pipeline-design.md`
**Repo:** `abhinav-kipper/learn-hindi`
**Branch (suggested):** `feature/design-lock-in`

---

## Reference paths

- `components/design/tokens.ts` — palette, font, shadow, border, radius tokens
- `components/design/` — Chai Galli primitives (Sticker, Tag, Cutting, SpeechBubble, etc.)
- `.github/workflows/ci.yml` — existing CI (eslint + tsc + vitest)
- `package.json` — uses pnpm, but scripts run via `npx` for tool binaries

Existing devDeps include `vitest`, `@testing-library/react`. We'll add `@playwright/test`, `@babel/parser`, `@babel/traverse`, plus `@babel/types` for traverse helpers.

---

## Task 1: Install deps + add npm scripts + .gitignore

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Add Playwright and Babel deps**

Run from `/home/user/learn-hindi`:

```bash
pnpm add -D @playwright/test @babel/parser @babel/traverse @babel/types @types/babel__traverse
pnpm exec playwright install chromium
```

Expected: `package.json` gets new entries under devDependencies. Chromium binary downloads to local Playwright cache.

- [ ] **Step 2: Add npm scripts**

Open `package.json` and replace the `"scripts"` block. Current state:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest",
    "test:run": "vitest run",
    "voices": "node scripts/generate-chaina-voices.mjs"
  },
```

Change to:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "lint:design": "node scripts/lint-design.mjs",
    "lint:design:strict": "node scripts/lint-design-strict.mjs",
    "test": "vitest",
    "test:run": "vitest run",
    "test:visual": "playwright test",
    "test:visual:update": "playwright test --update-snapshots",
    "voices": "node scripts/generate-chaina-voices.mjs"
  },
```

- [ ] **Step 3: Update .gitignore**

Append to `.gitignore`:

```
# Playwright outputs
test-results/
playwright-report/
e2e/screenshots/**/*-diff.png
e2e/screenshots/**/*-actual.png
e2e/design-lint-report.json
```

- [ ] **Step 4: Verify install + tsc clean**

```bash
npx tsc --noEmit
```

Expected: no output (clean).

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml .gitignore
git commit -m "chore(design): add Playwright + Babel deps, design-lint scripts"
```

---

## Task 2: Write DESIGN.md

**Files:**
- Create: `DESIGN.md`

- [ ] **Step 1: Write the file**

Create `/home/user/learn-hindi/DESIGN.md` with this exact content:

````markdown
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
````

- [ ] **Step 2: Commit**

```bash
git add DESIGN.md
git commit -m "docs(design): add DESIGN.md — the Chai Galli design contract"
```

---

## Task 3: Add STRICT-MODE block to CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add the strict-mode block**

Open `CLAUDE.md`. Find the very top of the file (the `@AGENTS.md` line is line 1 currently). Insert a new STRICT-MODE block between line 1 and the existing `# Bolna Seekho — Hindi Learning App` heading (currently line 3).

The before/after:

```diff
 @AGENTS.md

+## STRICT-MODE — UI changes
+
+Before writing or modifying any UI component:
+
+1. Read `DESIGN.md` at repo root.
+2. Visit `/_dev/components` in dev to see existing primitives.
+3. Run `npm run lint:design` before committing.
+4. If your change touches a Big-5 route (home / lesson / practice / quiz / progress) the visual-regression check will run on your PR. Update baselines via `npm run test:visual:update` if the change is intentional.
+
+The lint enforces: palette tokens only (no raw hex), no soft shadows (no blur), only approved border widths, only approved UI libraries.
+
 # Bolna Seekho — Hindi Learning App
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude): add STRICT-MODE block linking to DESIGN.md"
```

---

## Task 4: Add `chaina-disabled` flag to MomentStage

**Files:**
- Modify: `components/design/MomentStage.tsx`

Why: visual snapshots are non-deterministic if Chaina moments fire during them. A localStorage flag set by snapshot seeds disables `play()` entirely.

- [ ] **Step 1: Add the disable guard**

In `components/design/MomentStage.tsx`, find the `play` callback inside `ChainaProvider`. It looks like:

```tsx
  const play = useCallback((key: string) => {
    const cfg = MOMENTS[key]
    if (!cfg) return
    clearTimers()
    const { line, idx } = pickLine(key)
    setActive({ key, line, idx, phase: 'enter' })
    ...
```

Modify to bail out early when the flag is set:

```tsx
  const play = useCallback((key: string) => {
    const cfg = MOMENTS[key]
    if (!cfg) return
    // Snapshot/test escape hatch — set in e2e seeds.
    if (typeof window !== 'undefined' && localStorage.getItem('chaina-disabled') === '1') return
    clearTimers()
    const { line, idx } = pickLine(key)
    setActive({ key, line, idx, phase: 'enter' })
    ...
```

(Insert the guard immediately after the `if (!cfg) return` line.)

- [ ] **Step 2: Verify tests + tsc still clean**

```bash
npx vitest run
npx tsc --noEmit
```

Expected: 201/201 still pass, tsc clean.

- [ ] **Step 3: Commit**

```bash
git add components/design/MomentStage.tsx
git commit -m "feat(chaina): chaina-disabled localStorage flag to mute moments (for snapshots)"
```

---

## Task 5: Build the block-list lint script (with tests)

**Files:**
- Create: `scripts/lint-design.mjs`
- Create: `__tests__/lib/lint-design.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/lib/lint-design.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { lintSource, type LintHit } from '@/scripts/lint-design-core'

describe('lintSource (block-list)', () => {
  it('flags raw hex colors outside tokens.ts', () => {
    const hits = lintSource('components/Foo.tsx', "const c = '#abc123'")
    expect(hits.map(h => h.rule)).toContain('raw-hex')
  })

  it('does not flag hex on a @design-allow line', () => {
    const hits = lintSource('components/Foo.tsx', "const c = '#abc123' // @design-allow: brand color")
    expect(hits.map(h => h.rule)).not.toContain('raw-hex')
  })

  it('does not flag hex in tokens.ts itself', () => {
    const hits = lintSource('components/design/tokens.ts', "ink: '#36281e'")
    expect(hits.map(h => h.rule)).not.toContain('raw-hex')
  })

  it('flags soft box-shadow (blur > 0)', () => {
    const hits = lintSource('components/Foo.tsx', "boxShadow: '0 4px 10px rgba(0,0,0,0.1)'")
    expect(hits.map(h => h.rule)).toContain('soft-shadow')
  })

  it('does not flag offset-only shadow (blur = 0)', () => {
    const hits = lintSource('components/Foo.tsx', "boxShadow: '4px 4px 0 #36281e'")
    expect(hits.map(h => h.rule)).not.toContain('soft-shadow')
  })

  it('flags non-standard border width', () => {
    const hits = lintSource('components/Foo.tsx', "border: '3px solid red'")
    expect(hits.map(h => h.rule)).toContain('bad-border')
  })

  it('does not flag 2.5px border', () => {
    const hits = lintSource('components/Foo.tsx', "border: '2.5px solid #36281e'")
    expect(hits.map(h => h.rule)).not.toContain('bad-border')
  })

  it('flags forbidden UI library imports', () => {
    const hits = lintSource('app/page.tsx', "import { Button } from '@mui/material'")
    expect(hits.map(h => h.rule)).toContain('forbidden-import')
  })

  it('does not flag in-repo design imports', () => {
    const hits = lintSource('app/page.tsx', "import { Sticker } from '@/components/design'")
    expect(hits.map(h => h.rule)).not.toContain('forbidden-import')
  })

  it('flags fontFamily without var(--font-*)', () => {
    const hits = lintSource('components/Foo.tsx', "fontFamily: 'Arial'")
    expect(hits.map(h => h.rule)).toContain('bad-font')
  })

  it('does not flag fontFamily using var(--font-*)', () => {
    const hits = lintSource('components/Foo.tsx', "fontFamily: 'var(--font-bricolage)'")
    expect(hits.map(h => h.rule)).not.toContain('bad-font')
  })

  it('returns file + line + rule + snippet for each hit', () => {
    const src = "const a = 1\nconst b = '#abc123'\nconst c = 2"
    const hits = lintSource('components/Foo.tsx', src)
    const hit = hits.find(h => h.rule === 'raw-hex')
    expect(hit).toBeDefined()
    expect(hit!.line).toBe(2)
    expect(hit!.file).toBe('components/Foo.tsx')
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

```bash
npx vitest run __tests__/lib/lint-design.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the core lint logic**

Create `scripts/lint-design-core.mjs` (so it's importable for tests AND callable by the CLI script). Note: vitest can import `.mjs` via the `@/scripts/lint-design-core` alias because tsconfig path mapping is `@/*` → repo root. Verify the tsconfig has this path; if not the test will fail on import — see Step 5.

```js
// scripts/lint-design-core.mjs
// Pure functions, no I/O. Imported by lint-design.mjs (the CLI) and by tests.

const FORBIDDEN_IMPORTS = [
  '@mui/',
  '@chakra-ui/',
  'react-bootstrap',
  '@radix-ui/',
  'antd',
  'tailwind-styled-components',
];

const ALLOWED_BORDER_WIDTHS = new Set(['0', 'none', '2.5px', '1.8px', '1px']);

/**
 * @typedef {Object} LintHit
 * @property {string} file
 * @property {number} line
 * @property {string} rule
 * @property {string} snippet
 */

/**
 * @param {string} file - the file path (used for the report and for tokens.ts exclusion)
 * @param {string} source - the file's source text
 * @returns {LintHit[]}
 */
export function lintSource(file, source) {
  const hits = [];
  const lines = source.split('\n');

  const isTokensFile = file.endsWith('components/design/tokens.ts');

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1;
    const line = lines[i];
    if (line.includes('@design-allow')) continue;

    // Rule 1: raw hex outside tokens.ts
    if (!isTokensFile) {
      const hexMatch = line.match(/#[0-9a-fA-F]{3,8}\b/);
      if (hexMatch) {
        hits.push({ file, line: lineNo, rule: 'raw-hex', snippet: hexMatch[0] });
      }
    }

    // Rule 2: soft box-shadow (3rd numeric value is non-zero = blur)
    const shadowMatch = line.match(/\bbox-?[sS]hadow:\s*['"`][^'"`]*?\b(\d+(?:\.\d+)?px)\s+(\d+(?:\.\d+)?px)\s+(\d+(?:\.\d+)?)(?:px)?\b/);
    if (shadowMatch && shadowMatch[3] !== '0') {
      hits.push({ file, line: lineNo, rule: 'soft-shadow', snippet: shadowMatch[0] });
    }

    // Rule 3: non-standard border width
    const borderMatch = line.match(/\bborder(?:Top|Bottom|Left|Right)?:\s*['"`]?(?:(?:0|none|inherit|currentColor)|(\d+(?:\.\d+)?(?:px|em|rem)?))\b/);
    if (borderMatch && borderMatch[1] && !ALLOWED_BORDER_WIDTHS.has(borderMatch[1])) {
      hits.push({ file, line: lineNo, rule: 'bad-border', snippet: borderMatch[0] });
    }

    // Rule 4: forbidden UI library imports
    const importMatch = line.match(/from\s+['"`]([^'"`]+)['"`]/);
    if (importMatch) {
      const src = importMatch[1];
      if (FORBIDDEN_IMPORTS.some((f) => src === f.replace(/\/$/, '') || src.startsWith(f))) {
        hits.push({ file, line: lineNo, rule: 'forbidden-import', snippet: importMatch[0] });
      }
    }

    // Rule 5: fontFamily not using var(--font-*)
    const fontMatch = line.match(/fontFamily:\s*['"`]([^'"`]+)['"`]/);
    if (fontMatch && !fontMatch[1].includes('var(--font-')) {
      hits.push({ file, line: lineNo, rule: 'bad-font', snippet: fontMatch[0] });
    }
  }

  return hits;
}
```

Now create the CLI wrapper at `scripts/lint-design.mjs`:

```js
#!/usr/bin/env node
// scripts/lint-design.mjs
// Walks app/ and components/, runs lintSource on each .ts/.tsx file,
// prints violations, exits non-zero if any.

import { readFileSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { lintSource } from './lint-design-core.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function listFiles() {
  // Use git ls-files so we don't traverse node_modules / .next / etc.
  const out = execSync('git ls-files app components', { cwd: ROOT }).toString();
  return out
    .split('\n')
    .filter((f) => /\.(ts|tsx)$/.test(f))
    .filter((f) => !f.startsWith('__tests__/'));
}

function main() {
  const files = listFiles();
  const allHits = [];
  for (const rel of files) {
    const abs = resolve(ROOT, rel);
    const src = readFileSync(abs, 'utf8');
    const hits = lintSource(rel, src);
    allHits.push(...hits);
  }

  if (allHits.length === 0) {
    console.log(`✓ lint-design: ${files.length} files clean`);
    process.exit(0);
  }

  console.error(`✗ lint-design: ${allHits.length} violation(s) in ${new Set(allHits.map((h) => h.file)).size} file(s)\n`);
  for (const hit of allHits) {
    console.error(`  ${hit.file}:${hit.line}  ${hit.rule}  ${hit.snippet}`);
  }
  console.error(`\nAllow individual lines via a // @design-allow: <reason> comment on the same line.`);
  process.exit(1);
}

main();
```

- [ ] **Step 4: Create an importable bridge for vitest**

Vitest doesn't import `.mjs` files transparently through TS path mapping. Create a tiny TS bridge at `scripts/lint-design-core.ts` that re-exports from the .mjs module. Actually — the simplest approach is to rename the core to `.ts` and have the CLI script `import` from the compiled .mjs. Skip that complexity: change the core file extension to `.ts`. Recreate it as `scripts/lint-design-core.ts` instead:

Delete `scripts/lint-design-core.mjs` if you created it. Create `scripts/lint-design-core.ts` with the same content but TypeScript syntax:

```ts
// scripts/lint-design-core.ts
// Pure functions, no I/O. Imported by lint-design.mjs (the CLI) and by tests.

const FORBIDDEN_IMPORTS = [
  '@mui/',
  '@chakra-ui/',
  'react-bootstrap',
  '@radix-ui/',
  'antd',
  'tailwind-styled-components',
];

const ALLOWED_BORDER_WIDTHS = new Set(['0', 'none', '2.5px', '1.8px', '1px']);

export interface LintHit {
  file: string;
  line: number;
  rule: string;
  snippet: string;
}

export function lintSource(file: string, source: string): LintHit[] {
  const hits: LintHit[] = [];
  const lines = source.split('\n');

  const isTokensFile = file.endsWith('components/design/tokens.ts');

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1;
    const line = lines[i];
    if (line.includes('@design-allow')) continue;

    if (!isTokensFile) {
      const hexMatch = line.match(/#[0-9a-fA-F]{3,8}\b/);
      if (hexMatch) {
        hits.push({ file, line: lineNo, rule: 'raw-hex', snippet: hexMatch[0] });
      }
    }

    const shadowMatch = line.match(/\bbox-?[sS]hadow:\s*['"`][^'"`]*?\b(\d+(?:\.\d+)?px)\s+(\d+(?:\.\d+)?px)\s+(\d+(?:\.\d+)?)(?:px)?\b/);
    if (shadowMatch && shadowMatch[3] !== '0') {
      hits.push({ file, line: lineNo, rule: 'soft-shadow', snippet: shadowMatch[0] });
    }

    const borderMatch = line.match(/\bborder(?:Top|Bottom|Left|Right)?:\s*['"`]?(?:(?:0|none|inherit|currentColor)|(\d+(?:\.\d+)?(?:px|em|rem)?))\b/);
    if (borderMatch && borderMatch[1] && !ALLOWED_BORDER_WIDTHS.has(borderMatch[1])) {
      hits.push({ file, line: lineNo, rule: 'bad-border', snippet: borderMatch[0] });
    }

    const importMatch = line.match(/from\s+['"`]([^'"`]+)['"`]/);
    if (importMatch) {
      const src = importMatch[1];
      if (FORBIDDEN_IMPORTS.some((f) => src === f.replace(/\/$/, '') || src.startsWith(f))) {
        hits.push({ file, line: lineNo, rule: 'forbidden-import', snippet: importMatch[0] });
      }
    }

    const fontMatch = line.match(/fontFamily:\s*['"`]([^'"`]+)['"`]/);
    if (fontMatch && !fontMatch[1].includes('var(--font-')) {
      hits.push({ file, line: lineNo, rule: 'bad-font', snippet: fontMatch[0] });
    }
  }

  return hits;
}
```

Now the CLI at `scripts/lint-design.mjs` needs to import from a JS file (it's a `.mjs` running directly via Node, no TS toolchain). Use `tsx` or compile inline. Simplest: have the CLI re-implement the function call by spawning a tsx process. Better: ship a tiny `.mjs` shim that duplicates the small core. **Pragmatic choice for this codebase:**

Keep BOTH files in sync:
- `scripts/lint-design-core.ts` — used by vitest
- `scripts/lint-design.mjs` — the CLI, which inlines the same logic in pure JS

Replace the CLI's `import { lintSource } from './lint-design-core.mjs';` line and the file's top section with an inlined copy of the core logic (the function body is ~30 lines). Final `scripts/lint-design.mjs`:

```js
#!/usr/bin/env node
// scripts/lint-design.mjs
// Inlines the same logic as scripts/lint-design-core.ts for direct Node execution
// (avoids needing a TS toolchain at lint time). Keep the two in sync — vitest
// covers the core; this script is the CLI face.

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const FORBIDDEN_IMPORTS = [
  '@mui/',
  '@chakra-ui/',
  'react-bootstrap',
  '@radix-ui/',
  'antd',
  'tailwind-styled-components',
];

const ALLOWED_BORDER_WIDTHS = new Set(['0', 'none', '2.5px', '1.8px', '1px']);

function lintSource(file, source) {
  const hits = [];
  const lines = source.split('\n');
  const isTokensFile = file.endsWith('components/design/tokens.ts');

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1;
    const line = lines[i];
    if (line.includes('@design-allow')) continue;

    if (!isTokensFile) {
      const hexMatch = line.match(/#[0-9a-fA-F]{3,8}\b/);
      if (hexMatch) hits.push({ file, line: lineNo, rule: 'raw-hex', snippet: hexMatch[0] });
    }

    const shadowMatch = line.match(/\bbox-?[sS]hadow:\s*['"`][^'"`]*?\b(\d+(?:\.\d+)?px)\s+(\d+(?:\.\d+)?px)\s+(\d+(?:\.\d+)?)(?:px)?\b/);
    if (shadowMatch && shadowMatch[3] !== '0') {
      hits.push({ file, line: lineNo, rule: 'soft-shadow', snippet: shadowMatch[0] });
    }

    const borderMatch = line.match(/\bborder(?:Top|Bottom|Left|Right)?:\s*['"`]?(?:(?:0|none|inherit|currentColor)|(\d+(?:\.\d+)?(?:px|em|rem)?))\b/);
    if (borderMatch && borderMatch[1] && !ALLOWED_BORDER_WIDTHS.has(borderMatch[1])) {
      hits.push({ file, line: lineNo, rule: 'bad-border', snippet: borderMatch[0] });
    }

    const importMatch = line.match(/from\s+['"`]([^'"`]+)['"`]/);
    if (importMatch) {
      const src = importMatch[1];
      if (FORBIDDEN_IMPORTS.some((f) => src === f.replace(/\/$/, '') || src.startsWith(f))) {
        hits.push({ file, line: lineNo, rule: 'forbidden-import', snippet: importMatch[0] });
      }
    }

    const fontMatch = line.match(/fontFamily:\s*['"`]([^'"`]+)['"`]/);
    if (fontMatch && !fontMatch[1].includes('var(--font-')) {
      hits.push({ file, line: lineNo, rule: 'bad-font', snippet: fontMatch[0] });
    }
  }

  return hits;
}

function listFiles() {
  const out = execSync('git ls-files app components', { cwd: ROOT }).toString();
  return out
    .split('\n')
    .filter((f) => /\.(ts|tsx)$/.test(f))
    .filter((f) => !f.startsWith('__tests__/'));
}

function main() {
  const files = listFiles();
  const allHits = [];
  for (const rel of files) {
    const abs = resolve(ROOT, rel);
    const src = readFileSync(abs, 'utf8');
    const hits = lintSource(rel, src);
    allHits.push(...hits);
  }

  if (allHits.length === 0) {
    console.log(`✓ lint-design: ${files.length} files clean`);
    process.exit(0);
  }

  console.error(`✗ lint-design: ${allHits.length} violation(s) in ${new Set(allHits.map((h) => h.file)).size} file(s)\n`);
  for (const hit of allHits) {
    console.error(`  ${hit.file}:${hit.line}  ${hit.rule}  ${hit.snippet}`);
  }
  console.error(`\nAllow individual lines via a // @design-allow: <reason> comment on the same line.`);
  process.exit(1);
}

main();
```

- [ ] **Step 5: Run the test and confirm it passes**

```bash
npx vitest run __tests__/lib/lint-design.test.ts
```

Expected: 12 tests pass.

If the test fails on the `@/scripts/lint-design-core` import path, check `tsconfig.json` `paths`. If the `@/*` path isn't configured for `scripts/`, change the test import to a relative path: `import { lintSource } from '../../scripts/lint-design-core'`.

- [ ] **Step 6: Run the CLI on the current repo (do NOT fail the task on this step)**

```bash
node scripts/lint-design.mjs
```

Expected: probably **lots** of violations. Don't try to fix them in this task — Task 6 does the baseline cleanup. For this task, just confirm the CLI runs and reports something sensible. Note the count for reference in Task 6.

- [ ] **Step 7: Commit**

```bash
git add scripts/lint-design.mjs scripts/lint-design-core.ts __tests__/lib/lint-design.test.ts
git commit -m "feat(lint): add block-list design lint + tests"
```

---

## Task 6: Baseline cleanup — fix or annotate existing lint violations

**Files:**
- Modify: various, driven by what the lint reports.

- [ ] **Step 1: Run the lint and capture the report**

```bash
node scripts/lint-design.mjs > /tmp/design-lint-report.txt 2>&1; cat /tmp/design-lint-report.txt
```

- [ ] **Step 2: Categorize each violation**

For each line in the report, decide:

- **Fix**: replace the raw value with the appropriate `COLORS.*` / `SHADOW.*` / `BORDER.*` / `RADIUS.*` / `FONTS.*` reference imported from `@/components/design`.
- **Annotate**: if the deviation is intentional (e.g. the chai-liquid color `#a55a36` in `Cutting.tsx`, or `#fff`/`#000` shortcuts), add `// @design-allow: <one-line reason>` on the same line as the violating value.

Reasonable annotations expected (based on this codebase audit):
- `components/design/Cutting.tsx` chai-liquid colors (`#a55a36`, `#7d4226`, `#fff`) — annotate as "anatomy color, not a system token"
- `components/design/SpeechBubble.tsx` tail SVG fills (`#fff`) — annotate as "white SVG fill, kept literal"
- Any `'#fff'` or `'#000'` used for SVG/icon strokes — annotate "primary white/black SVG primitive"

- [ ] **Step 3: Apply edits**

Walk the report and apply Fix or Annotate to each line. There may be 50-100 violations. Group commits by file or by rule for clarity.

- [ ] **Step 4: Re-run the lint until clean**

```bash
node scripts/lint-design.mjs
```

Expected eventually: `✓ lint-design: <N> files clean`.

- [ ] **Step 5: Run the full test suite to confirm no regressions**

```bash
npx vitest run
npx tsc --noEmit
```

Expected: 201/201 pass, tsc clean.

- [ ] **Step 6: Commit the baseline cleanup**

```bash
git add -A
git commit -m "chore(design): baseline cleanup — resolve all block-list lint violations"
```

---

## Task 7: Wire block-list lint into existing CI

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add a lint:design step**

Open `.github/workflows/ci.yml`. Find the existing steps block (around lines 26-40). Add a new step **after** `TypeScript check` and **before** `Tests`:

```yaml
      - name: Design lint (block-list)
        run: node scripts/lint-design.mjs
```

The final steps section should look like:

```yaml
      - name: Lint
        run: npx eslint .

      - name: TypeScript check
        run: npx tsc --noEmit

      - name: Design lint (block-list)
        run: node scripts/lint-design.mjs

      - name: Tests
        run: npx vitest run
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci(design): run block-list design lint on every PR"
```

---

## Task 8: Build the allow-list lint script (AST-based)

**Files:**
- Create: `scripts/lint-design-strict.mjs`

This is the soft, nightly lint. Walks JSX AST + style object expressions. Allows only token references. Outputs a JSON report; doesn't exit non-zero in CI by default.

- [ ] **Step 1: Create the script**

Create `scripts/lint-design-strict.mjs`:

```js
#!/usr/bin/env node
// scripts/lint-design-strict.mjs
// AST-based allow-list lint. Slower than the block-list. Runs nightly.
// Emits a JSON report at e2e/design-lint-report.json.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';

// @babel/traverse default-export interop
const traverse = _traverse.default ?? _traverse;

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Property names we check
const COLOR_PROPS = new Set(['color', 'backgroundColor', 'background', 'borderColor', 'fill', 'stroke']);
const SHADOW_PROPS = new Set(['boxShadow']);
const BORDER_PROPS = new Set(['border', 'borderTop', 'borderBottom', 'borderLeft', 'borderRight']);
const RADIUS_PROPS = new Set(['borderRadius']);
const FONT_PROPS = new Set(['fontFamily']);

// Literal values always allowed
const COLOR_LITERAL_ALLOWLIST = new Set(['transparent', 'inherit', 'currentColor', 'none', '#fff', '#ffffff', '#000', '#000000']);

function checkProperty(propName, value, file, line, hits) {
  // We only check string-literal values for now (the simplest, lowest-noise check).
  // Identifier expressions like `COLORS.ink` are inherently OK.
  if (typeof value !== 'string') return;

  if (COLOR_PROPS.has(propName)) {
    if (COLOR_LITERAL_ALLOWLIST.has(value.toLowerCase())) return;
    if (/^#[0-9a-fA-F]{3,8}$/.test(value)) {
      hits.push({ file, line, rule: 'strict-color', prop: propName, value });
    }
  }

  if (SHADOW_PROPS.has(propName)) {
    if (value === 'none') return;
    // Strict mode: only token-resolved shadows pass. Any literal is a hit.
    hits.push({ file, line, rule: 'strict-shadow', prop: propName, value });
  }

  if (BORDER_PROPS.has(propName)) {
    if (value === 'none' || value === '0') return;
    // Reject any literal — must come from BORDER tokens.
    hits.push({ file, line, rule: 'strict-border', prop: propName, value });
  }

  if (RADIUS_PROPS.has(propName)) {
    // Numbers as strings (e.g. "18") are fine if they match a token value.
    const TOKEN_RADII = new Set(['14', '18', '22', '36', '99']);
    if (TOKEN_RADII.has(value)) return;
    hits.push({ file, line, rule: 'strict-radius', prop: propName, value });
  }

  if (FONT_PROPS.has(propName)) {
    if (value.includes('var(--font-')) return;
    hits.push({ file, line, rule: 'strict-font', prop: propName, value });
  }
}

function lintFile(file) {
  const abs = resolve(ROOT, file);
  const source = readFileSync(abs, 'utf8');
  const hits = [];

  let ast;
  try {
    ast = parse(source, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      errorRecovery: true,
    });
  } catch (e) {
    hits.push({ file, line: 1, rule: 'parse-error', prop: '', value: String(e).slice(0, 100) });
    return hits;
  }

  traverse(ast, {
    ObjectProperty(path) {
      const { node } = path;
      const name =
        node.key.type === 'Identifier' ? node.key.name :
        node.key.type === 'StringLiteral' ? node.key.value :
        null;
      if (!name) return;

      if (node.value.type === 'StringLiteral') {
        checkProperty(name, node.value.value, file, node.loc?.start.line ?? 0, hits);
      } else if (node.value.type === 'TemplateLiteral' && node.value.expressions.length === 0) {
        checkProperty(name, node.value.quasis[0].value.cooked, file, node.loc?.start.line ?? 0, hits);
      }
      // Member expressions (e.g. COLORS.ink) and template literals with
      // interpolations are inherently OK — we trust the developer used tokens.
    },
  });

  return hits;
}

function listFiles() {
  const out = execSync('git ls-files app components', { cwd: ROOT }).toString();
  return out
    .split('\n')
    .filter((f) => /\.(ts|tsx)$/.test(f))
    .filter((f) => !f.startsWith('__tests__/'))
    .filter((f) => !f.endsWith('components/design/tokens.ts'));
}

function main() {
  const files = listFiles();
  const allHits = [];
  for (const file of files) {
    const hits = lintFile(file);
    allHits.push(...hits);
  }

  // Strip @design-allow lines (we read them at file level — simpler than checking on every hit)
  const finalHits = allHits.filter((h) => {
    const abs = resolve(ROOT, h.file);
    const lines = readFileSync(abs, 'utf8').split('\n');
    return !(lines[h.line - 1] ?? '').includes('@design-allow');
  });

  const outDir = join(ROOT, 'e2e');
  mkdirSync(outDir, { recursive: true });
  const reportPath = join(outDir, 'design-lint-report.json');
  writeFileSync(reportPath, JSON.stringify({ generatedAt: new Date().toISOString(), hits: finalHits }, null, 2));

  console.log(`lint-design-strict: ${finalHits.length} violation(s) across ${files.length} files`);
  console.log(`Report: ${reportPath}`);

  // Default: don't fail CI. Pass --fail to invert.
  if (process.argv.includes('--fail') && finalHits.length > 0) {
    process.exit(1);
  }
}

main();
```

- [ ] **Step 2: Run the script once to confirm it works**

```bash
node scripts/lint-design-strict.mjs
```

Expected: prints a count, writes `e2e/design-lint-report.json`. Inspect the report:

```bash
cat e2e/design-lint-report.json | head -30
```

There will likely be hits (the allow-list is stricter than the block-list, and the block-list cleanup in Task 6 didn't address things like `borderRadius: 18` — which IS a token value but our strict check needs to verify literally. That's intended — the nightly issue surfaces these for review over time, not a blocker today).

- [ ] **Step 3: Commit**

```bash
git add scripts/lint-design-strict.mjs
git commit -m "feat(lint): add allow-list design lint (AST-based, nightly)"
```

---

## Task 9: Nightly workflow for the allow-list lint

**Files:**
- Create: `.github/workflows/design-strict.yml`

- [ ] **Step 1: Create the workflow**

Create `.github/workflows/design-strict.yml`:

```yaml
# Allow-list (strict) design lint — runs nightly. Posts a GitHub issue
# listing any new violations vs. last run. Non-blocking.

name: design-strict

on:
  schedule:
    - cron: '0 3 * * *'  # 03:00 UTC daily
  workflow_dispatch:

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Run strict lint
        run: node scripts/lint-design-strict.mjs

      - name: Upload report
        uses: actions/upload-artifact@v4
        with:
          name: design-lint-report
          path: e2e/design-lint-report.json

      - name: Surface as issue if any hits
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('e2e/design-lint-report.json', 'utf8'));
            if (report.hits.length === 0) return;

            const body = [
              `Found **${report.hits.length}** design-strict violation(s) at ${report.generatedAt}.`,
              '',
              'These are non-blocking but should be reviewed. They indicate places using literal CSS values where a token reference would be cleaner.',
              '',
              '| File:Line | Rule | Property | Value |',
              '|---|---|---|---|',
              ...report.hits.slice(0, 50).map(h => `| \`${h.file}:${h.line}\` | ${h.rule} | ${h.prop} | \`${h.value}\` |`),
              report.hits.length > 50 ? `\n_+ ${report.hits.length - 50} more in the report artifact._` : '',
            ].join('\n');

            // De-dupe: if an open issue with the same title exists, comment on it instead.
            const title = 'design-strict drift report';
            const existing = await github.rest.issues.listForRepo({
              owner: context.repo.owner,
              repo: context.repo.repo,
              labels: 'design-drift',
              state: 'open',
            });
            const match = existing.data.find(i => i.title === title);
            if (match) {
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: match.number,
                body,
              });
            } else {
              await github.rest.issues.create({
                owner: context.repo.owner,
                repo: context.repo.repo,
                title,
                labels: ['design-drift'],
                body,
              });
            }
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/design-strict.yml
git commit -m "ci(design): nightly strict-lint that opens a GitHub issue on drift"
```

---

## Task 10: Component gallery — layout + page

**Files:**
- Create: `app/_dev/layout.tsx`
- Create: `app/_dev/components/page.tsx`

- [ ] **Step 1: Create the minimal _dev layout**

The default `app/layout.tsx` mounts `ChainaProvider`, `LayoutShell`, etc. The `_dev` route segment should skip those so the gallery is clean.

Create `app/_dev/layout.tsx`:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chai Galli — Component Gallery',
}

export default function DevLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

This intentionally renders without `<BottomNav>`, without `<ChainaProvider>`, without `<DailyReviewPopup>`. The parent root layout still wraps it in `<html>`/`<body>` and provides font CSS variables.

- [ ] **Step 2: Create the gallery page**

Create `app/_dev/components/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import confetti from 'canvas-confetti'
import {
  Sticker,
  Tag,
  HeaderBand,
  Cutting,
  MotifIcon,
  MarigoldStrip,
  StreakChip,
  DottedBg,
  SpeechBubble,
  LessonStickerCard,
  COLORS,
  FONTS,
  RADIUS,
  SHADOW,
  BORDER,
} from '@/components/design'
import type { CuttingMood, MotifKind } from '@/components/design'
import type { Lesson } from '@/types/lesson'

const MOODS: CuttingMood[] = ['idle', 'happy', 'wave', 'sympathy', 'wink', 'excited', 'sleepy']
const MOTIFS: MotifKind[] = ['marigold', 'auto', 'chai', 'film', 'phone', 'map']

const SAMPLE_LESSON: Lesson = {
  id: 'sample',
  title: 'Sample Lesson',
  situation: 'Sample situation',
  skills: ['skill one', 'skill two'],
  phrases: [],
  grammar_notes: [],
  culture_notes: [],
  skill_breakdown: [],
  practice_prompt: 'Sample',
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <details id={id} style={{ marginBottom: 16 }}>
      <summary
        style={{
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 18,
          color: COLORS.ink,
          textTransform: 'lowercase',
          padding: '8px 0',
          cursor: 'pointer',
        }}
      >
        {title}
      </summary>
      <div style={{ padding: '10px 0 18px' }}>{children}</div>
    </details>
  )
}

export default function GalleryPage() {
  const [fireConfetti, setFireConfetti] = useState(0)

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', background: COLORS.lav }}>
      <DottedBg />
      <main
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 480,
          margin: '0 auto',
          padding: '40px 16px 80px',
        }}
      >
        <h1
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 28,
            color: COLORS.ink,
            textTransform: 'lowercase',
            margin: 0,
          }}
        >
          chai galli — component gallery
        </h1>
        <p
          style={{
            fontFamily: FONTS.body,
            color: COLORS.ink60,
            fontSize: 14,
            marginTop: 6,
          }}
        >
          rules: see <code>/DESIGN.md</code>.
        </p>

        <Section id="palette" title="palette">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {(Object.entries(COLORS) as [string, string][]).map(([name, hex]) => (
              <div key={name} style={{ textAlign: 'center', fontFamily: FONTS.body, fontSize: 11 }}>
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    background: hex,
                    border: BORDER.thin,
                    borderRadius: RADIUS.sm,
                  }}
                />
                <div style={{ marginTop: 4, color: COLORS.ink, fontWeight: 700 }}>{name}</div>
                <div style={{ color: COLORS.ink60 }}>{hex}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="fonts" title="fonts">
          {(Object.entries(FONTS) as [string, string][]).map(([role, family]) => (
            <div key={role} style={{ marginBottom: 10, padding: 12, background: '#fff', border: BORDER.sticker, borderRadius: RADIUS.md, boxShadow: SHADOW.sticker }}>
              <div style={{ fontFamily: FONTS.tag, fontSize: 11, color: COLORS.ink60 }}>{role.toUpperCase()}</div>
              <div style={{ fontFamily: family, fontSize: 18, color: COLORS.ink, marginTop: 4 }}>
                The quick brown fox — namaste dost
              </div>
            </div>
          ))}
        </Section>

        <Section id="sticker" title="Sticker">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Sticker>default sticker</Sticker>
            <Sticker color={COLORS.peach}>peach sticker</Sticker>
            <Sticker color={COLORS.mint}>mint sticker</Sticker>
            <Sticker color={COLORS.butter}>butter sticker</Sticker>
            <Sticker dashed>dashed sticker (hint state)</Sticker>
            <Sticker selected>selected (lifted)</Sticker>
            <Sticker onClick={() => {}}>clickable</Sticker>
          </div>
        </Section>

        <Section id="tag" title="Tag">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <Tag>default</Tag>
            <Tag bg={COLORS.orange} color={COLORS.cream}>orange</Tag>
            <Tag bg={COLORS.mint} color={COLORS.ink}>mint</Tag>
            <Tag bg={COLORS.butter}>butter</Tag>
            <Tag bg={COLORS.lav2}>lavender</Tag>
          </div>
        </Section>

        <Section id="header-band" title="HeaderBand">
          <HeaderBand>
            <Tag>example</Tag>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 22, color: COLORS.ink, marginTop: 6 }}>
              header band sample
            </div>
          </HeaderBand>
        </Section>

        <Section id="cutting" title="Cutting (all 7 moods)">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {MOODS.map((mood) => (
              <div key={mood} style={{ textAlign: 'center', fontFamily: FONTS.tag, fontSize: 10, color: COLORS.ink60 }}>
                <Cutting size={68} mood={mood} blink={false} />
                <div style={{ marginTop: 4 }}>{mood.toUpperCase()}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <Cutting size={170} mood="happy" blink={false} />
            <div style={{ fontFamily: FONTS.tag, fontSize: 10, color: COLORS.ink60, textAlign: 'center' }}>HAPPY @ 170 (celebration scale)</div>
          </div>
        </Section>

        <Section id="motif-icon" title="MotifIcon (all 6 kinds)">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {MOTIFS.map((kind) => (
              <div key={kind} style={{ textAlign: 'center', fontFamily: FONTS.tag, fontSize: 10, color: COLORS.ink60 }}>
                <MotifIcon kind={kind} size={64} />
                <div style={{ marginTop: 4 }}>{kind.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="marigold-strip" title="MarigoldStrip">
          <MarigoldStrip />
        </Section>

        <Section id="streak-chip" title="StreakChip">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[1, 7, 14, 30, 100].map((n) => <StreakChip key={n} count={n} />)}
          </div>
        </Section>

        <Section id="confetti" title="Confetti">
          <button
            onClick={() => {
              setFireConfetti((n) => n + 1)
              confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } })
            }}
            style={{
              padding: '12px 16px',
              background: COLORS.orange,
              color: '#fff',
              border: BORDER.sticker,
              boxShadow: SHADOW.sticker,
              borderRadius: RADIUS.md,
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 14,
              textTransform: 'lowercase',
              cursor: 'pointer',
            }}
          >
            fire confetti
          </button>
          <span style={{ marginLeft: 10, fontFamily: FONTS.body, color: COLORS.ink60, fontSize: 12 }}>
            fired {fireConfetti} time{fireConfetti === 1 ? '' : 's'}
          </span>
        </Section>

        <Section id="dotted-bg" title="DottedBg">
          <div style={{ position: 'relative', height: 80, background: COLORS.lav, border: BORDER.sticker, borderRadius: RADIUS.md, overflow: 'hidden' }}>
            <DottedBg opacity={0.7} />
            <div style={{ position: 'relative', padding: 10, fontFamily: FONTS.body, color: COLORS.ink, zIndex: 1 }}>opacity 0.7 sample</div>
          </div>
        </Section>

        <Section id="speech-bubble" title="SpeechBubble">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingLeft: 20 }}>
            <SpeechBubble tail="bottom-right">default bottom-right</SpeechBubble>
            <SpeechBubble tail="bottom-left" caption="with caption">bottom-left + caption</SpeechBubble>
            <SpeechBubble tail="top-right">top-right tail</SpeechBubble>
            <SpeechBubble tail="top-left">top-left tail</SpeechBubble>
          </div>
        </Section>

        <Section id="lesson-sticker-card" title="LessonStickerCard">
          <LessonStickerCard lesson={SAMPLE_LESSON} index={0} routeBase="lessons" locked={false} />
          <div style={{ marginTop: 10 }}>
            <LessonStickerCard lesson={SAMPLE_LESSON} index={1} routeBase="lessons" locked={true} />
          </div>
        </Section>

        <Section id="buttons" title="Buttons">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'primary (orange)', bg: COLORS.orange, fg: '#fff' },
              { label: 'secondary (cream)', bg: COLORS.cream, fg: COLORS.ink },
              { label: 'success (green)', bg: COLORS.green, fg: '#fff' },
              { label: 'danger (red)', bg: COLORS.red, fg: '#fff' },
            ].map(({ label, bg, fg }) => (
              <button
                key={label}
                style={{
                  padding: '12px 16px',
                  background: bg,
                  color: fg,
                  border: BORDER.sticker,
                  boxShadow: SHADOW.sticker,
                  borderRadius: RADIUS.md,
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 14,
                  textTransform: 'lowercase',
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </Section>
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Run the dev server and visually confirm the gallery loads**

```bash
npm run dev
```

Visit `http://localhost:3000/_dev/components`. Click each `<details>` section open. Confirm:
- Palette renders with all token swatches
- All 7 Cutting moods render
- All 6 MotifIcons render
- Speech bubbles all 4 tail positions
- Buttons render
- Lesson sticker card renders (both locked and unlocked variants)

Kill dev server (Ctrl-C).

- [ ] **Step 4: Verify tests + tsc**

```bash
npx vitest run
npx tsc --noEmit
```

Expected: 201/201 pass, tsc clean.

- [ ] **Step 5: Verify the new lint passes on the new files**

```bash
node scripts/lint-design.mjs
```

Expected: clean. The gallery uses tokens for everything; if anything violates the lint, fix it before committing.

- [ ] **Step 6: Commit**

```bash
git add app/_dev/layout.tsx app/_dev/components/page.tsx
git commit -m "feat(design): add /_dev/components gallery — every primitive with all variants"
```

---

## Task 11: Playwright config + seed fixtures + helpers

**Files:**
- Create: `e2e/playwright.config.ts`
- Create: `e2e/seeds/fresh.json`
- Create: `e2e/seeds/mid-progress.json`
- Create: `e2e/helpers.ts`
- Modify: `tsconfig.json` (exclude `e2e/`)

- [ ] **Step 0: Exclude `e2e/` from the main TS project**

Open `tsconfig.json`. Find the top-level `"exclude"` array (or add one if missing). Add `"e2e"` to it. The Playwright files use globals (`test`, `expect`) from `@playwright/test` that aren't in the main tsconfig's lib set, so we keep them out of `tsc --noEmit`. Playwright runs `.spec.ts` files via its own loader.

If `tsconfig.json` has no `exclude`:

```diff
   "compilerOptions": { ... },
   "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
+  "exclude": ["node_modules", "e2e"]
 }
```

If it already has an exclude, add `"e2e"` to the array.

Verify:
```bash
npx tsc --noEmit
```
Expected: still clean. Now `e2e/*.ts` is invisible to the main TS compile.



- [ ] **Step 1: Create the Playwright config**

Create `e2e/playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  testMatch: /.*\.spec\.ts$/,
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  outputDir: './test-output',
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.005, // 0.5% tolerance
      animations: 'disabled',
    },
  },
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 390, height: 844 }, // iPhone 14 portrait
    deviceScaleFactor: 2,
    locale: 'en-US',
    timezoneId: 'Asia/Kolkata',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 5'] },
    },
  ],
})
```

- [ ] **Step 2: Create the fresh-user seed**

Create `e2e/seeds/fresh.json`:

```json
{
  "hindi-user-profile": {
    "name": "Test",
    "reason": "curious",
    "gender": "female",
    "dailyGoal": 5,
    "onboardingComplete": true,
    "tooltipsShown": { "home": true, "lesson": true, "practice": true, "quiz": true, "review": true }
  },
  "hindi-progress": {
    "completedLessons": [],
    "lessonCompletedAt": {},
    "currentStreak": 0,
    "lastActiveDate": "",
    "practiceSessionCount": 0,
    "todaySessions": 0,
    "todaySessionsDate": "",
    "seenStreakMilestones": [],
    "todayActiveMs": 0,
    "todayActiveDate": ""
  },
  "chaina-first-ever-seen": "1",
  "chaina-disabled": "1",
  "bolna-seekho-muted": "1",
  "hindi-home-tab": "situations"
}
```

- [ ] **Step 3: Create the mid-progress seed**

Create `e2e/seeds/mid-progress.json`:

```json
{
  "hindi-user-profile": {
    "name": "Test",
    "reason": "curious",
    "gender": "female",
    "dailyGoal": 5,
    "onboardingComplete": true,
    "tooltipsShown": { "home": true, "lesson": true, "practice": true, "quiz": true, "review": true }
  },
  "hindi-progress": {
    "completedLessons": ["greetings", "auto-negotiation", "ordering-food"],
    "lessonCompletedAt": {
      "greetings": "2026-05-22",
      "auto-negotiation": "2026-05-23",
      "ordering-food": "2026-05-24"
    },
    "currentStreak": 7,
    "lastActiveDate": "2026-05-25",
    "practiceSessionCount": 5,
    "todaySessions": 2,
    "todaySessionsDate": "2026-05-25",
    "seenStreakMilestones": [7],
    "todayActiveMs": 180000,
    "todayActiveDate": "2026-05-25"
  },
  "hindi-phrase-progress": {
    "greetings": [0, 1, 2, 3, 4, 5, 6, 7, 8],
    "auto-negotiation": [0, 1, 2, 3, 4, 5, 6, 7],
    "ordering-food": [0, 1, 2, 3, 4, 5, 6]
  },
  "hindi-quiz-scores": [{ "score": 8, "total": 10, "lessonIds": ["greetings"], "timestamp": "2026-05-24T10:00:00Z" }],
  "hindi-mistakes": [
    { "id": "x1", "original": "main jaata hain", "correction": "main jaata hoon", "reason": "First person uses 'hoon'", "lessonId": "greetings", "timestamp": "2026-05-24T09:30:00Z", "source": "practice" }
  ],
  "chaina-first-ever-seen": "1",
  "chaina-disabled": "1",
  "bolna-seekho-muted": "1",
  "hindi-home-tab": "situations"
}
```

- [ ] **Step 4: Create the seed helper**

Create `e2e/helpers.ts`:

```ts
import type { Page } from '@playwright/test'
import freshSeed from './seeds/fresh.json'
import midSeed from './seeds/mid-progress.json'

type Seed = 'fresh' | 'mid-progress'

const SEEDS: Record<Seed, Record<string, unknown>> = {
  'fresh': freshSeed,
  'mid-progress': midSeed,
}

/**
 * Seeds localStorage with the named fixture, then reloads the page so the app
 * reads the seeded state on mount.
 */
export async function seedAndGoto(page: Page, seed: Seed, path: string): Promise<void> {
  // We need to set localStorage BEFORE the app mounts. Strategy: navigate to a
  // blank page on the same origin first, set storage, then navigate to the target.
  await page.goto('/_dev/components')
  await page.evaluate((data) => {
    localStorage.clear()
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v))
    }
  }, SEEDS[seed])
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500) // animation settle
}
```

- [ ] **Step 5: Commit**

```bash
git add e2e/
git commit -m "test(visual): add Playwright config + seed fixtures + seedAndGoto helper"
```

---

## Task 12: Write the visual snapshot spec

**Files:**
- Create: `e2e/visual.spec.ts`

- [ ] **Step 1: Write the spec**

Create `e2e/visual.spec.ts`:

```ts
import { test, expect } from '@playwright/test'
import { seedAndGoto } from './helpers'

test.describe('visual regression — Big 5 routes', () => {
  test('home — fresh', async ({ page }) => {
    await seedAndGoto(page, 'fresh', '/')
    await expect(page).toHaveScreenshot('home-fresh.png')
  })

  test('home — mid-progress', async ({ page }) => {
    await seedAndGoto(page, 'mid-progress', '/')
    await expect(page).toHaveScreenshot('home-mid-progress.png')
  })

  test('lesson — fresh', async ({ page }) => {
    await seedAndGoto(page, 'fresh', '/lessons/greetings')
    await expect(page).toHaveScreenshot('lesson-fresh.png')
  })

  test('lesson — mid-progress', async ({ page }) => {
    await seedAndGoto(page, 'mid-progress', '/lessons/greetings')
    await expect(page).toHaveScreenshot('lesson-mid-progress.png')
  })

  test('practice — fresh', async ({ page }) => {
    await seedAndGoto(page, 'fresh', '/practice/greetings')
    await expect(page).toHaveScreenshot('practice-fresh.png')
  })

  test('quiz — mid-progress', async ({ page }) => {
    await seedAndGoto(page, 'mid-progress', '/quiz')
    await expect(page).toHaveScreenshot('quiz-mid-progress.png')
  })

  test('progress — fresh', async ({ page }) => {
    await seedAndGoto(page, 'fresh', '/progress')
    await expect(page).toHaveScreenshot('progress-fresh.png')
  })

  test('progress — mid-progress', async ({ page }) => {
    await seedAndGoto(page, 'mid-progress', '/progress')
    await expect(page).toHaveScreenshot('progress-mid-progress.png')
  })
})
```

- [ ] **Step 2: Confirm Playwright discovers the spec**

```bash
npx playwright test --list --config e2e/playwright.config.ts
```

Expected: 8 tests listed.

- [ ] **Step 3: Commit**

```bash
git add e2e/visual.spec.ts
git commit -m "test(visual): add Big 5 route snapshot specs"
```

---

## Task 13: Generate baseline screenshots + commit

**Files:**
- Add: `e2e/screenshots/*.png` (8 baseline PNGs)

- [ ] **Step 1: Generate baselines**

```bash
npx playwright test --config e2e/playwright.config.ts --update-snapshots
```

This starts the dev server (~30s), seeds and visits each route, captures the screenshot, writes baselines. Playwright will write to `e2e/visual.spec.ts-snapshots/` (or `__screenshots__/` — verify the actual output directory after the first run).

If the test framework writes to a directory other than `e2e/screenshots/`, update the `.gitignore` from Task 1 accordingly. The default output path for Playwright snapshots is `<spec-file>-snapshots/` adjacent to the spec.

- [ ] **Step 2: Verify by re-running (should pass — comparing baselines to themselves)**

```bash
npx playwright test --config e2e/playwright.config.ts
```

Expected: 8 passed.

- [ ] **Step 3: Visually inspect the baselines**

Open each PNG. Confirm each looks like the intended page (no error page, no broken layout). If any look wrong:
- Check the seed data
- Check whether the page expected an auth/onboarding redirect that didn't happen
- Check the wait-for state (may need a longer `waitForTimeout`)

Fix and re-run `--update-snapshots` if needed.

- [ ] **Step 4: Commit baselines**

```bash
git add e2e/visual.spec.ts-snapshots/  # or whatever path Playwright wrote to
git commit -m "test(visual): commit baseline screenshots for Big 5 routes"
```

(If the baseline dir is named differently, adjust the path.)

---

## Task 14: Add visual-regression CI workflow

**Files:**
- Create: `.github/workflows/visual.yml`

- [ ] **Step 1: Create the workflow**

Create `.github/workflows/visual.yml`:

```yaml
# Visual regression — runs Playwright on every PR + push to main.
# Fails on pixel drift > 0.5%. Uploads diff artifacts on failure for review.

name: visual

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  snapshot:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps chromium

      - name: Run visual tests
        run: pnpm exec playwright test --config e2e/playwright.config.ts

      - name: Upload diff artifacts on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: visual-diff
          path: |
            e2e/visual.spec.ts-snapshots/
            test-results/
            playwright-report/
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/visual.yml
git commit -m "ci(visual): run Playwright snapshots on PRs, upload diffs on failure"
```

---

## Task 15: Final QA + push

- [ ] **Step 1: Full local verification**

```bash
npx vitest run
npx tsc --noEmit
node scripts/lint-design.mjs
node scripts/lint-design-strict.mjs
npx playwright test --config e2e/playwright.config.ts
```

Expected:
- vitest: 201+ pass (additional tests added by Task 5 land here)
- tsc: clean
- block-list lint: clean
- strict lint: emits report; non-zero count is OK (issue surfaces these)
- playwright: 8 pass

- [ ] **Step 2: Push the branch**

```bash
git push -u origin <branch-name>
```

If working on main directly, `git push origin main`.

- [ ] **Step 3: Open a PR (if branching)**

Per project convention (CLAUDE.md), this is a solo app — direct push to main is acceptable for hotfixes. For a larger change like this, opening a PR keeps the visual CI workflow on record before merge. Title: "Design lock-in pipeline".

- [ ] **Step 4: Verify CI**

After push, check:
- `ci` workflow: green (eslint + tsc + design-lint + vitest)
- `visual` workflow: green (Playwright passes against committed baselines)

If anything is red, surface the diff artifact, decide whether to update baselines (`--update-snapshots`) or fix the regression.

---

## Self-review checklist (for the implementing engineer)

- [ ] `DESIGN.md` exists at repo root and links from `CLAUDE.md` STRICT-MODE block
- [ ] `/_dev/components` loads in dev and shows all primitives
- [ ] `npm run lint:design` returns clean
- [ ] `npm run lint:design:strict` emits a report
- [ ] `npm run test:visual` passes locally
- [ ] CI workflows green on main
- [ ] No new untracked files except the gallery + baselines
- [ ] All 201 (or more) vitest tests pass
- [ ] `npx tsc --noEmit` clean
