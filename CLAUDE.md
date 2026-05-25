@AGENTS.md

## STRICT-MODE — UI changes

Before writing or modifying any UI component:

1. Read `DESIGN.md` at repo root.
2. Visit `/_dev/components` in dev to see existing primitives.
3. Run `npm run lint:design` before committing.
4. If your change touches a Big-5 route (home / lesson / practice / quiz / progress) the visual-regression check will run on your PR. Update baselines via `npm run test:visual:update` if the change is intentional.

The lint enforces: palette tokens only (no raw hex), no soft shadows (no blur), only approved border widths, only approved UI libraries.

# Bolna Seekho — Hindi Learning App

## Project Overview
A PWA for learning conversational/colloquial Hindi (romanized, no Devanagari). Built for one user initially, scalable later.

**Live:** https://hindi-app.vercel.app
**Deploy:** push to `main` — GitHub is connected to Vercel, auto-deploys on every push. Do NOT run `vercel --prod` manually.

**Content map:** see `CONTENT.md` for the full inventory of lessons/foundations/vocab, schema, style guide, and known content issues. Read it before editing any `content/*.json` file.

## Tech Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Framer Motion (animations)
- Google Gemini API (`gemini-2.5-flash`) via Vercel AI SDK (`ai` + `@ai-sdk/google`)
- localStorage for progress (no DB, no auth)
- PWA (manifest + iOS install prompt)
- Deployed on Vercel (pnpm)

## Key Architecture Decisions
- **No `@ai-sdk/react`** — custom `useChat` hook in `app/practice/[id]/page.tsx` reads plain text streams from `toTextStreamResponse()`
- **No database** — progress stored in localStorage (single user)
- **Content as JSON** — lessons in `content/lessons/*.json`, loaded via `lib/lessons.ts`
- **AI route** — `app/api/chat/route.ts` proxies to Gemini with lesson-aware system prompt

## File Structure
```
app/                    → Pages (see "Pages" below)
components/             → UI components
lib/                    → Utilities (see "Libraries" below)
content/lessons/        → 7 situation JSON files
content/foundations/    → 7 foundation JSON files
content/vocabulary.json → 100 words in 6 categories
content/dutch/          → Dutch lessons + foundations (separate language)
types/                  → TypeScript interfaces
public/                 → PWA manifest, icon.svg
```

## Common Tasks

### Add a new lesson
1. Create `content/lessons/NN-topic-name.json` (follow existing lesson structure, see CONTENT.md for schema)
2. Import and add to array in `lib/lessons.ts`
3. Update CONTENT.md inventory table

### Auto-generated weekly lesson
The cron in `.github/workflows/generate-content.yml` fires every Monday
9am UTC and does step 1-2 above automatically using Gemini, then opens
a PR for review. Pops the next topic from `content/lesson-queue.json`.
On failure (queue empty, schema fail, etc.) opens a GitHub issue instead.

To trigger manually: GitHub → Actions → "generate-content" → Run workflow
(optionally pass a topic id to override the queue order). To test locally:
`GOOGLE_GENERATIVE_AI_API_KEY=… node scripts/generate-lesson.mjs --dry-run`.

### Modify AI behavior
Edit `lib/system-prompt.ts` — `buildSystemPrompt()` generates the system prompt from lesson data.

### Run locally
```bash
npm run dev          # needs .env.local with GOOGLE_GENERATIVE_AI_API_KEY
```

### Run tests
```bash
npx vitest run
```

### Deploy / Ship
Vercel auto-deploys on every push to `main` via the GitHub integration —
**no Vercel CLI needed** (and `vercel --prod` will fail in cloud sessions
that have no Vercel auth token).

**Shipping a feature branch:**
```bash
npx vitest run                    # 1. tests must pass first
git checkout main && git pull
git merge <feature-branch> --no-ff -m "Merge: <summary>"
git push origin main              # 2. Vercel auto-deploys
```
Resolve any merge conflicts, re-run `npx vitest run` and `npx tsc --noEmit`
before pushing.

**CI gate:** `.github/workflows/ci.yml` runs `tsc --noEmit` + `vitest run`
on every push and PR. A red ❌ on the commit means the build will break
in prod — fix before the next deploy. ESLint is not in CI yet (pre-existing
violations need cleanup first — backlog #1b).

**Direct commit to main** (for solo hotfixes): same flow, just commit on `main` and push.

## Environment Variables
- `GOOGLE_GENERATIVE_AI_API_KEY` — Gemini API key (set in .env.local locally, Vercel env for prod)

## Current App State (updated 2026-05-25, Chai Galli redesign complete)

### Visual: Chai Galli design system

All UI uses the **Chai Galli** sticker-pack visual language. See
`components/design/README.md` for the full reference (palette, fonts,
header bg per route, motif mapping, etc.).

**Single rule:** import everything from `@/components/design` — never
reach into individual primitive files. Tokens live in
`components/design/tokens.ts`.

**Hard-shadow recipe:** 2.5px ink border + `4px 4px 0 #36281e` offset
shadow (no blur, no rgba). This is the signature — don't introduce soft
shadows anywhere.

**Fonts** (already wired in `app/layout.tsx` via next/font):
- `var(--font-bricolage)` — display, all headings + buttons
- `var(--font-nunito)` — body
- `var(--font-mochiy)` — uppercase tags (use the `<Tag>` primitive)
- `var(--font-caveat)` — handwritten accents

### Pages

| Path | Purpose |
|------|---------|
| `/` | Home — peach gradient header band w/ Cutting mascot, search+mute pill, animated streak chip, daily-goal bar fills 0→pct, marigold divider, Continue rickshaw-chip, Situations/Foundations tab pill (sliding cream indicator via Framer `layoutId`), staggered lesson sticker list |
| `/lessons/[id]` | Single-page lesson view: palette-matched header w/ chapter tag + title + 3 skill chips, segmented per-phrase progress, phrase Sticker w/ ⭐ star, hindi headline, butter pronunciation pill, lavender→mint reveal-zone, "hear it" TTS, prev/next, "mark chapter complete". On complete → full celebration screen w/ confetti + expanding rings + happy-hop Cutting + 3-up stat stickers + practice CTA |
| `/practice/[id]` | AI chat. Butter header w/ happy Cutting + hands-free/reset/finish toolbar pills. Mint scenario sticker w/ chai motif. AI bubbles = white stickers w/ teal Cutting avatar; user bubbles = peach stickers; correction stickers = butter w/ dashed border. Bottom input bar: orange mic pill + white text input pill + green send. Tutor reply tagged `[[CORRECTION: original="…" correct="…" reason="…"]]` saved as mistake |
| `/quiz` | Mint header, per-question segmented progress, question sticker (orange "question N of N" tag + "what does this mean?" + Hindi headline + butter 📢 hear-it on translate-to-english questions), 4 colored option stickers with ink letter columns (A/B/C/D). Picked-wrong shakes + filled red w/ ✕; correct fills mint w/ ✓; unpicked-wrong fades to 0.55. Auto-advance after 1.2s. |
| `/progress` | Lavender header. Streak hero: float-y orange tile + flame-flicker 🔥 + count-up day number + 7-day calendar w/ active(orange ✓)/pending(dashed)/inactive. 2×2 stat tiles (phrases/practice/quiz-avg/lessons), 3-col tools (mistakes/saved/drill), lesson groups w/ animated progress bars + "N completed" fold, recent-activity sticker |
| `/mistakes` | Red-bg header. Drill-all orange CTA w/ wobble 🎯, mistake groups (palette+motif derived per lesson) w/ source chip (quiz/practice), strikethrough → green correct, delete buttons. Drill bottom-sheet: butter bg w/ drag handle, sliding cards, mint correct-answer card w/ TTS + reason, still-learning/got-it pair |
| `/favorites` | Butter header. Grouped sticker lists w/ inline TTS play/stop button per row (orange when speaking), ⭐ remove |
| `/vocabulary` | Mint header. Overall progress sticker w/ animated fill, 2-col category grid w/ motif tile + animated progress bar |
| `/vocabulary/[category]` | Palette-matched header. Swipeable word cards: card tilts -3°/+3° as you drag, behind-card "✓ KNOWN" (mint right) and "REVIEW ↺" (butter left) indicators fade in. Card bg shifts white → mint2 (known) → butter (review). Tap-flip reveals mint example card. TTS play button. |
| `/drill/conjugation` | Lavender header on picker. Sliding tense pill (present/past/future, `layoutId`). Verb stickers w/ ink number column + bobbing arrow. Active drill: header bg changes per tense (mint/peach/lav). Mascot reacts happy on correct. 🪢 ne tag + warning for transitive past. Done screen w/ confetti + happy-hop Cutting on ≥80% |
| `/onboarding` | 5-slide flow on peach→butter gradient. Progress pills (current = 28px ink). Slides: namaste welcome w/ 170px Cutting → 3 how-it-works stickers → name + reason 2×2 picker (selected lift via Sticker `selected` prop) → daily-goal vertical stack → ready w/ happy-hop Cutting + confetti |

### Libraries (`lib/`)

| File | What it does |
|------|--------------|
| `progress.ts` | `completedLessons`, `lessonCompletedAt[id]→ISO`, `currentStreak`, `lastActiveDate`, `practiceSessionCount`, `todaySessions`+`todaySessionsDate`, `seenStreakMilestones[]`. Streak math is UTC-midnight-based (DST-safe). `updateStreak` clears seenStreakMilestones when streak breaks |
| `phrase-progress.ts` | Per-phrase viewed indices, `getLessonPercent`, `computeLessonResume` |
| `review.ts` | **Full SM-2 lite SRS** (interval, easeFactor, nextReviewAt). Powers daily review popup |
| `mistakes.ts` | `[[CORRECTION:]]` extraction, capped at 200, source = 'practice' \| 'quiz' |
| `vocab-review.ts` | Separate known/review sets for vocab swipe UI |
| `personalization.ts` | Onboarding reason reorders Hindi lessons (family/bollywood/moving/curious) |
| `sounds.ts` | 8 generative Web Audio sounds (tap/correct/wrong/complete/swipe/streak/levelup/pop). **Cute Duolingo-style palette** — sine+triangle waves, major-interval chimes, pitch glides via `playGlide` helper. Vibration patterns paired per sound. Mute toggle persisted in `bolna-seekho-muted` |
| `last-active-lesson.ts` | Powers Continue CTA on home |
| `quiz.ts` | Quiz scores, average |
| `favorites.ts` | Star phrases — `toggleFavorite`, `isFavorite`, `getFavorites`. Key `${lessonId}::${hindi}` |
| `conjugations.ts` | 5 verbs (hona/jaana/karna/aana/bolna) × 3 tenses (present/past/future), used by `/drill/conjugation`. Romanization follows CONTENT.md style (single-vowel endings: `karta`, `karunga`, `tha`) |
| `speech.ts` | Browser TTS / STT — ReadAloudButton + voice input |

### Components

**Design primitives** (`components/design/`) — all Chai Galli surfaces compose
from these. Always import via the barrel `@/components/design`.

| File | What it does |
|------|--------------|
| `tokens.ts` | `COLORS`, `FONTS`, `RADIUS`, `SHADOW`, `BORDER` constants. `paletteToBg(p)`, `paletteToMotifBg(p)`, `deriveLessonStyle(id, idx)` helpers |
| `Sticker.tsx` | The foundational offset-shadow card. Props: `color`, `radius`, `padding`, `dashed`, `selected` (lifts), `onClick` (press feedback). Use this for every clickable surface. |
| `Tag.tsx` | Mochiy Pop One uppercase pill. Default ink-on-cream; pass `bg`/`color`/`border` for variants |
| `HeaderBand.tsx` | Re-usable peach-gradient hero band (back button + Cutting + tag + title). Not always used — most pages roll their own header inline because per-route bg colors differ |
| `Cutting.tsx` | The chai-cup mascot SVG. `size` + `mood` ('idle' \| 'happy'). Steam swirls float, eyes blink, on 'happy' mouth opens with tongue |
| `MotifIcon.tsx` | 6 lesson icons (`marigold`, `auto`, `chai`, `film`, `phone`, `map`). Drop inside a colored circle tile |
| `MarigoldStrip.tsx` | Wobbling flower divider (used between home header and content) |
| `StreakChip.tsx` | Orange flame-flicker streak count chip |
| `Confetti.tsx` | Pure-CSS confetti rain. Parent must be `position: relative; overflow: hidden`. Pair with `playSound('levelup')` |
| `DottedBg.tsx` | Lavender dotted-pattern absolute layer behind page content |
| `SfxIndicator.tsx` | Debug bubble that listens to `bs-sfx` CustomEvent — optional dev overlay |
| `LessonStickerCard.tsx` | The home-lesson card (used on `/`). Derives palette + motif from lesson id |
| `LessonChaiGalli.tsx` | The full `/lessons/[id]` flow — phrase carousel + celebration |
| `ChaiGalliChatMessage.tsx` | Practice chat bubbles (AI w/ avatar tail, user, correction stickers, TypingDots) |
| `animations.css` | All keyframes: `float-y`, `blink`, `flame-flicker`, `happy-hop`, `confetti-fall`, `ring-grow`, `wobble-z`, `pop-in`, `glow-pulse` |

**Page-level components** (`components/`):

| File | What it does |
|------|--------------|
| `bottom-nav.tsx` | Floating white sticker pill at the bottom of all non-fullscreen pages. Active-tab cream pill slides via Framer `layoutId`. Hidden on `/lessons/*`, `/practice/*`, `/onboarding`. |
| `design/MomentStage.tsx` | **Chaina moments system.** `ChainaProvider` mounts once in `app/layout.tsx`. `useChaina()` returns `{ play(key), stop() }`. 15 moments registered in `moments.ts` (welcomeBack/correctAnswer/lessonComplete/streakMilestone/etc). Each moment fires `<Cutting>` + `<SpeechBubble>` w/ animations, plus voice via `chainaVoice.play()` (MP3 → speechSynthesis fallback). Frequency caps in `chainaFrequency.ts`. |
| `search-overlay.tsx` | Full-screen search modal triggered from the home magnifying-glass. Language-aware index. Locks body scroll, restores focus on close, Esc to dismiss |
| `daily-review-popup.tsx` | Butter bottom-sheet w/ Cutting, fires every 24h after first lesson complete. Mixes vocab + lesson phrases through SRS |
| `feature-tooltip.tsx` | One-time tooltips (Chai Galli white sticker + orange CTA + cream halo spotlight), dismissed via localStorage |
| `dutch-welcome-modal.tsx` | First-time-only Dutch onboarding card |
| `notification-prompt.tsx` | Daily-reminder opt-in butter sticker |
| `install-prompt.tsx` | iOS PWA install hint peach sticker |
| `layout-shell.tsx` | Mounts BottomNav, NotificationPrompt, DailyReviewPopup. Wires notification reminders (`maybeFireRandomNudge`, `maybeShowReminderOnOpen`) on visibility events |
| `voice-button.tsx` | Mic button (Chai Galli orange pill, red + pulse when listening). STT via `lib/speech.ts` |
| `quiz/quiz-card.tsx`, `quiz/quiz-results.tsx` | Quiz question + results screens. Use design primitives. |

### Chaina moment triggers (where `play(key)` is called)
Fire on real beats only — accomplishments, retention nudges, character touch points. Frequency-capped via `canFire`/`markFired`.
- Home header tap — `play('tap')` (debounce-800ms)
- Welcome back / first open today — fired from `app/page.tsx` mount (mutex, once-per-session)
- Correct/wrong quiz — `play('correctAnswer')` / `play('wrongAnswer')`
- First mistake of day — `play('firstMistake')` (once-per-day, fires from quiz/practice)
- Conjugation drill correct — `play('conjugationCorrect')`
- Mistakes drill "got it" — `play('drillGotIt')`
- Star a phrase — `play('favoriteSaved')` (debounce-800ms)
- Lesson complete — `play('lessonComplete')` alongside confetti
- 3 consecutive phrase reveals — `play('phraseStreak')` (once-per-lesson-session)
- 25s idle on lesson — `play('idleNudge')` (once-per-session)
- Streak crosses 7/14/30/50/100 — `play('streakMilestone')` (gated by `seenStreakMilestones`)
- App backgrounded after 5+ min — `play('sessionEnd')` (once-per-session)
- First ever launch — `play('firstEver')` from `/onboarding` mount (once-ever)

### Storage keys (localStorage)

All keyed by language prefix (`hindi` or `dutch`). Format `${prefix}-{name}`:
- `${prefix}-progress` — Progress object
- `${prefix}-phrase-progress` — viewed phrases per lesson
- `${prefix}-mistakes` — Mistake[]
- `${prefix}-favorites` — FavoritePhrase[]
- `${prefix}-quiz-scores`
- `${prefix}-review-sessions`
- `${prefix}-vocab-learned`
- `${prefix}-last-active-lesson`
- `${prefix}-home-tab` — restores Situations vs Foundations
- `bolna-seekho-muted` (global, not prefixed) — sound mute toggle
- `bolna-seekho-onboarding` (global) — user profile
- `chaina-first-ever-seen` — set to '1' after firstEver fires once
- `chaina-last-session-ts` — timestamp for welcomeBack/firstOpenToday discrimination
- `chaina-voice-muted` — reserved future fine-grained Chaina mute (read but not yet UI-toggled)
- `chaina-freq-<mode>-<key>` — frequency cap state per moment
- `chaina-session-start-ts` (sessionStorage) — session start for sessionEnd 5min threshold

### Recent feature work log

**2026-05-25 wave — Chai Galli redesign (complete)**
- New visual direction: sticker-pack Indian-bazaar style with chai-cup
  mascot "Cutting". Replaces every previous surface across all 11 routes.
- Design system in `components/design/` (Sticker, Cutting, MotifIcon,
  StreakChip, Tag, HeaderBand, MarigoldStrip, Confetti, DottedBg,
  LessonStickerCard, LessonChaiGalli, ChaiGalliChatMessage, tokens.ts,
  animations.css). Import via barrel `@/components/design`.
- Fonts swapped to Bricolage Grotesque (display) + Nunito (body) +
  Mochiy Pop One (tags) + Caveat (handwritten).
- Background → lavender (#ebe2f6) with dotted overlay everywhere.
- Pre-existing notification + iOS PWA fix retained.
- Old components removed: `components/lesson-flow/*`, `lesson-card`,
  `chat-message`, `streak-counter`, `read-aloud-button` (TTS now inline
  per page via `lib/speech.ts`).
- CI wired: `.github/workflows/ci.yml` runs tsc + vitest on push and PR.

**2026-05-22 wave**
- Time-of-day greeting tried, then removed (cluttered top bar). Replaced with `Hi, {name}`.
- Time-of-day greeting tried, then removed (cluttered top bar). Replaced with `Hi, {name}`.
- Top bar: search+mute now grouped in a single pill; streak chip alongside. Onboarding-reason chip removed.
- Daily goal bar clarifies unit: `0 of 5 min today`
- Progress page reorganized: 3-col tools grid (Mistakes/Saved/Drill), lesson sections fold completed entries behind `N completed` expander, tighter stat labels, auto-`streak` sound on visit removed
- Sounds: full Duolingo-style refresh — soft pitch glides, major-interval chimes, no harsh waveforms, added `playGlide` helper
- **Cute Moments** system added — Duolingo-style popup. Only fires on accomplishments (correct answers, lesson complete, favorite saved) — initial phrase-reveal hook was removed because "Kya baat!" on a passive translation tap felt wrong
- Conjugation drill data corrected to single-vowel romanization (`karta`/`karti`/`gaya`, not `kartaa`/`kartee`/`gayaa`)
- Streak milestone math fixed to `s === m` (won't retroactively celebrate 7-day for an already-30-day user)
- Search overlay made language-aware (Dutch users no longer see Hindi lessons in search)
- `daysAgoLabel` rewritten to compare ISO date strings instead of mixing local/UTC Date objects
- Various accessibility fixes: search overlay locks body scroll, restores focus on close, Esc handler only registered while open

**2026-05-21 wave**
- Lessons 07 (home visit) + Foundation 07 (noun gender) — added `references?: string[]` field on Lesson type, cited Snell & Weightman + McGregor + Afroz Taj
- Haptic feedback wired into every `playSound()` call
- Phrase favorites/star + `/favorites` page
- Drill-my-mistakes flashcard overlay on `/mistakes`
- `CONTENT.md` created as content map

### Open gaps (worth revisiting)

- **Foundations 02-06 have empty `skill_breakdown: []`** — `07-noun-gender` is the template
- **No XP / leveling arc** — `phrasesLearned` is just a stat tile, no progression visual
- **No A1/A2/B1 markers** on lessons
- **No audio assets** — only browser TTS
- **Pronunciation field formatting inconsistent across lesson JSONs** (CAPS-stress vs hyphen-syllables)
- **Conjugation drill is verb-by-verb** — no mixed-verb sets, no spaced-repetition wiring

## Known Quirks
- Vercel CLI spams `ECONNRESET` errors from a broken plugin — ignore them
- Must use pnpm for Vercel deploys (npm install crashes on their infra)
- `ai` SDK v6 has no `useChat` hook export — custom implementation in practice page
- Node 20.x pinned in engines (Vercel compatibility)
- `next/navigation` `useRouter` only — App Router, not pages-dir
- `canvas-confetti` is imported synchronously in client components (LessonChaiGalli, quiz-results, practice page) — fine since they're all `'use client'`
- TTS via `/api/tts` returns 502 in dev sandboxes without internet — the `speak()` function transparently falls back to browser `speechSynthesis`

## Testing
Tests live in `__tests__/` — two directories:
- `lib/` — unit tests for all utility functions (localStorage mocked via `Object.defineProperty`)
- `components/` — React component tests using `@testing-library/react` + `jest-dom`

Mocking conventions for component tests:
- `framer-motion` → stub `motion.div` as plain `<div>` stripping animation props; `AnimatePresence` as fragment
- `next/navigation` → `useRouter: () => ({ push: mockPush })`
- `next/link` → render as `<a href={href}>`
- `@/lib/language-context` → `useLanguage: () => ({ language: 'hindi', config: { storagePrefix: 'hindi' } })`

Run tests: `npx vitest run` (or `npx vitest` for watch mode)

## Backlog (not yet implemented)

### High priority
1. **Vercel preview deploys** — Link the GitHub repo to Vercel so every PR
   gets a preview URL automatically. Costs nothing; saves needing the CLI.

### Medium priority
2. **Practice `useChat` hook tests** — Extract `useChat` from
   `app/practice/[id]/page.tsx` into `lib/use-chat.ts` so it can be
   unit-tested with mocked `fetch`. Key cases: rate-limit 429 handling,
   retry logic, initial greeting on mount, persistence.

3. **Prettier with `--check` in CI** — Add `prettier --check .` to the CI
   workflow. Keeps diffs clean and prevents whitespace noise in PRs.

4. **SessionStart hook for AI sessions** — A `.claude/settings.json` hook
   that runs `npx vitest run --reporter=dot 2>&1 | tail -5` on session
   start so each session begins with instant awareness of any broken state.

### Low priority
5. **More component coverage** — `LessonChaiGalli` celebration view,
   `ChaiGalliChatMessage` correction sticker, `bottom-nav` active-tab
   animation. Existing coverage is in `__tests__/components/`.

6. **Visual regression** — Playwright screenshots committed to repo, diffed
   on every PR. Add as an `e2e/` suite once we settle on a baseline.
