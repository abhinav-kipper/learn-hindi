@AGENTS.md

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

### Deploy
```bash
git add <changed files>
git commit -m "description"
git push origin main   # triggers Vercel auto-deploy via GitHub integration
```

## Environment Variables
- `GOOGLE_GENERATIVE_AI_API_KEY` — Gemini API key (set in .env.local locally, Vercel env for prod)

## Current App State (updated 2026-05-22)

### Pages

| Path | Purpose |
|------|---------|
| `/` | Home — "Hi, {name}" title, daily-goal bar ("0 of 5 min today"), streak chip with milestone celebrations, search+mute pill, Continue CTA, Situations/Foundations tabs, lesson cards (collapsed for completed, with "Nd ago" stamps) |
| `/lessons/[id]` | Lesson flow: intro → swipeable phrase carousel (favorite star, grammar/culture popups) → CTA with confetti + 🏆 cute-moment + `levelup` sound on Mark Complete |
| `/practice/[id]` | AI chat (custom `useChat`, streaming text). Tutor emits `[[CORRECTION: original="…" correct="…" reason="…"]]` tags, stripped from UI and saved as mistakes |
| `/quiz` | Multiple-choice quiz. Wrong answers logged as mistakes. Correct answers fire `cheer()` |
| `/progress` | Streak hero + 2x2 stats grid + 3-col tools row (Mistakes / Saved / Drill) + Lessons card with collapsible "N completed" fold + Recent activity |
| `/mistakes` | List grouped by lesson with delete/clear-all. "Drill (N)" button opens a flashcard bottom-sheet that shuffles + tracks "Got it!" / "Still learning" |
| `/favorites` | List of starred phrases, grouped by lesson, with ReadAloudButton + remove |
| `/vocabulary` | Per-category vocab with swipe-to-mark known/review |
| `/drill/conjugation` | Verb drill — pick 1 of 5 verbs × 3 tenses, get multiple-choice cards. Note for transitive past (ergative/ne construction) |
| `/onboarding` | Name, daily goal (min/day), reason (family/bollywood/moving/curious) |

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

### Components (selected)

| File | What it does |
|------|--------------|
| `cute-moments.tsx` | **Global popup system.** `CuteMomentsProvider` mounts once in `app/layout.tsx`. `useCuteMoments()` returns `{ show(emoji, text?), cheer() }`. `cheer()` picks a random Hindi+English encouragement (Shabash!, Bahut accha!, Wah!, Nice!, etc.). Springs in from screen-center, emoji wobbles, holds ~1.6s. 1.2s cooldown prevents stacking |
| `search-overlay.tsx` | Full-screen search modal triggered from the home magnifying-glass icon. Indexes lessons + phrases + vocab (language-aware: Hindi or Dutch). Locks body scroll, restores focus on close, Esc to dismiss |
| `streak-counter.tsx` | Flame chip. Fires confetti + `streak` sound + popover badge at exact milestones 7/14/30/100 (uses `s === m`, not `s >= m`). Marks milestones as seen so they don't re-fire |
| `lesson-card.tsx` | Lesson card with expanded + collapsed states. Collapsed pill shows "today / yesterday / Nd ago / 1 week ago / Nw ago" via `daysAgoLabel` (compares ISO strings as UTC midnights, timezone-safe) |
| `lesson-flow/section-phrases.tsx` | Swipeable phrase carousel. Favorite-star, grammar/culture matched by keyword. Random `cheer()` 30% of reveals |
| `lesson-flow/section-cta.tsx` | Mark-Complete CTA — confetti, `levelup` sound, `show('🏆', 'Lesson complete!')` |
| `daily-review-popup.tsx` | Bottom-sheet, fires every 24h after first lesson complete, mixes vocab + lesson phrases through SRS |
| `feature-tooltip.tsx` | One-time tooltips dismissed via localStorage |
| `notification-prompt.tsx`, `install-prompt.tsx` | Push + PWA install |
| `read-aloud-button.tsx`, `voice-button.tsx` | TTS / STT controls |

### Cute Moments triggers (where `cheer()` / `show()` is called)
Only fire on **genuine accomplishments**, not passive actions. Revealing a translation isn't a win — earlier we tried celebrating phrase reveals and the popups felt out of place ("Kya baat!" on a passive tap). Stick to:
- Star a favorite — `show('⭐', 'Saved!')`
- Correct quiz answer — `cheer()`
- Correct conjugation drill — `cheer()`
- "Got it!" in mistakes drill — `cheer()`
- Lesson complete — `show('🏆', 'Lesson complete!')` alongside confetti

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

### Recent feature work log

**2026-05-22 wave (current session)**
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
- canvas-confetti is dynamic-imported in `streak-counter.tsx` (SSR-safe) but statically imported in `section-cta.tsx` (already client component)

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
1. **CI — GitHub Actions** — Run `eslint + tsc --noEmit + vitest run` on every push to `main` and on PRs.
   Gate merges on green. Prevents broken builds reaching Vercel prod.

2. **Vercel preview deploys** — Link the GitHub repo to Vercel so every branch/PR gets
   a preview URL automatically. Costs nothing; saves manual `vercel --prod` for testing branches.

### Medium priority
3. **AI session startup: print failing tests** — Add a SessionStart hook:
   `npx vitest run --reporter=dot 2>&1 | tail -5`
   So sessions start with instant awareness of any broken state.

4. **Prettier with `--check` in CI** — Add `prettier --check .` to the CI workflow.
   Keeps diffs clean and prevents whitespace noise in PRs.

### Low priority
5. **Practice page `useChat` hook tests** — Extract `useChat` into its own file
   (`lib/use-chat.ts`) so it can be unit-tested with mocked `fetch`. Currently
   embedded in the page component. Key cases: rate-limit 429 handling, retry logic,
   initial greeting on mount.

6. **More component coverage** — `section-cta.tsx` (mark-complete flow),
   `section-phrases.tsx` (reveal/conceal), `streak-counter.tsx` (milestone badge).
