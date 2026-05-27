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
content/lessons/        → 10 Hindi situation JSON files (A1-A2)
content/foundations/    → 9 Hindi foundation JSON files (A1-A2)
content/vocabulary.json → 100 words in 6 categories
content/dutch/lessons/  → 11 Dutch lesson JSONs (5 A1 casual + 6 A2/B1 exam-targeted)
content/dutch/foundations/ → 7 Dutch foundation JSONs
content/dutch/knm.json  → 100 KNM exam questions (bilingual, 6 categories)
content/dutch/lezen.json → 10 Lezen B1-prep reading texts (bilingual, 40 MCQs)
content/stories/        → 3 Hindi story JSONs (Chai Galli motion-comics)
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

## Current App State (updated 2026-05-26, Dutch exam-prep track shipped)

The app now serves two distinct learning goals:
- **Hindi** — conversational/colloquial Hindi via 10 situational lessons + 9 grammar foundations + 100-word vocab. Casual learning, no exam.
- **Dutch** — focused prep for the **Inburgeringsexamen B1 + KNM** (the Dutch civic-integration exam HSM holders take to naturalize). Dutch home reoriented as: Goal banner → 3-stage path (A1/A2/B1) → 5 exam-skill modules (KNM live, Reading live, Listening/Writing/Speaking soon) → Exam scenarios (6 lessons, A2/B1) → casual Lessons & Grammar.

All UI/labels are English; Dutch only appears in (a) content being learned (KNM questions, Lezen texts, lesson phrases), (b) Chaina's voice lines (she speaks Dutch in the Dutch track, Hinglish in the Hindi track), (c) italic Dutch-skill-name subtitles for exposure.

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
| `/dutch/knm` | KNM module home (Dutch exam track). 6 category cards (Politics/Work/Education/Housing/Healthcare/History) with English label + Dutch subtitle. Orange "Start drill" Cutting CTA. Bilingual study cards (Dutch question + English subtitle + correct-answer mint highlight + English explanation + "Mark as learned" toggle). Past-attempts fold. |
| `/dutch/knm/drill` | KNM 30-question mock. Dutch-only (no English crutch — exam-realistic). Sticker option picker w/ correct/wrong reveal. Pass at ≥80% (24/30) → Chaina `knmPassed` moment + Confetti + levelup sound. Fail → `knmAttemptComplete` encouragement. Attempt saved to `dutch-knm-attempts`. |
| `/dutch/lezen` | Lezen (Reading) module home. 3 tier sections (Beginner A1 / Elementary A2 / Intermediate B1) collapsible with A1 open by default. Orange "Start timed mock" CTA (25-min, 5 texts, 20 Qs, Dutch-only). Past-mocks fold. |
| `/dutch/lezen/[textId]` | Single Lezen text study mode. Dutch body w/ "Show English translation" toggle → mint sticker reveals `body_en`. Bilingual question cards (4 per text, types: hoofdgedachte/detail/woordbetekenis/gevolg). Mark-as-studied → Chaina `lezenStudyDone` + persist to `dutch-lezen-studied`. |
| `/dutch/lezen/mock` | 25-min timed Lezen drill (Dutch-only). 5 random texts × 4 Qs = 20 questions. Live timer pill goes pink under 5 min. Auto-advance 1.5s after answer reveal. Pass ≥16/20 → `lezenMockPassed` + Confetti. Save to `dutch-lezen-mock-attempts`. |
| `/stories/[id]` | Single Hindi story — tap-through 5-panel Chai Galli motion-comic. Each panel: scene background (composed SVG: ChaiStall / Bazaar / NaniHouse / NarratorCard) + character w/ idle motion (Cutting / Nani / Customer / Shopkeeper) + dialogue Sticker w/ syllable-stress pronunciation hint + 🔊 hear-it (browser TTS, hi-IN) + tap-to-reveal English (lavender → mint reveal-zone). Framer Motion slide-in panel transitions. Last panel marks story-read in `learn-hindi:hindi-stories-read` + fires Confetti + "✓ read more stories" CTA back to home. |

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
| `stories.ts` | Loader for the 3 Hindi story JSONs in `content/stories/`. `getAllStories()` + `getStoryById(id)`. TDD'd, 4 tests. |
| `stories-progress.ts` | Read-state tracking for Hindi stories. Storage key `learn-hindi:hindi-stories-read` (JSON array of read story IDs). TDD'd, 7 tests. |
| `seen-lessons.ts` | localStorage-backed Set tracking which lessons a user has seen (per-language). `initBaseline()` silent-tags existing IDs on first detection so the popup never false-fires; `getUnseenIds()`, `markAsSeen()`, `hasBeenSeen()`, `unseeIds()`. TDD'd, 9 tests. |
| `dutch/lessons.ts`, `dutch/foundations.ts` | Parallel loaders for Dutch content (11 lessons + 7 foundations). `getDutchAllContent()` returns both combined for cross-module use (e.g. search). |
| `dutch/knm.ts` | KNM loader + `drawDrillSet(30)` (Fisher-Yates) + `scoreAttempt()` (80% pass) + attempt history (capped at 50) + per-question studied tracking. TDD'd, 12 tests. |
| `dutch/lezen.ts` | Same shape as `knm.ts` for the Lezen module — `drawMockSet(5)`, 20-Q scoring, 25-min `MOCK_TIMER_MS` constant, studied set. TDD'd, 12 tests. |
| `dutch/exam-target.ts` | User preference `'a2' \| 'b1'` for exam-target level (default B1). Surfaced as toggle in Dutch welcome modal. |
| `dutch/level-map.ts` | Lookup table tagging every Dutch content ID with `A1` / `A2` / `B1`. Powers the 3-stage progress bars on the Dutch home. Keys use the `dutch-` prefixed form to match lesson JSON IDs (fixed 2026-05-26 — pre-existing bug had bare keys that never matched). |

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
| `design/MomentStage.tsx` | **Chaina moments system.** `ChainaProvider` mounts once in `app/layout.tsx`. `useChaina()` returns `{ play(key), stop() }`. **21 moments** registered in `moments.ts` (welcomeBack/correctAnswer/lessonComplete/streakMilestone/newContent/knmAttemptComplete/knmPassed/lezenStudyDone/lezenMockPassed/a2Milestone/etc). Each moment fires `<Cutting>` + `<SpeechBubble>` w/ animations, plus voice via `chainaVoice.play()` (MP3 → speechSynthesis fallback). Frequency caps in `chainaFrequency.ts`. |
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
- New content available — `play('newContent')` from home mount when `getUnseenIds()` returns >0 (once-per-session)
- KNM mock complete (failed) — `play('knmAttemptComplete')` from `/dutch/knm/drill` (debounce-800ms). Encouraging tone, not celebratory
- KNM mock passed — `play('knmPassed')` from `/dutch/knm/drill` on ≥80% score (debounce-800ms). Celebratory + voice
- A2 stage milestone — `play('a2Milestone')` fires from `app/page.tsx` when every `getItemsByLevel('A1')` ID is complete in Dutch progress. Gated by `chaina-a2-milestone-fired` localStorage flag (once-ever). Catches up users who passed A1 before the trigger existed.
- Lezen text studied — `play('lezenStudyDone')` from `/dutch/lezen/[textId]` on "Mark as studied" tap (debounce-800ms)
- Lezen mock passed — `play('lezenMockPassed')` from `/dutch/lezen/mock` on ≥80% score (debounce-800ms). Celebratory + voice

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
- `chaina-a2-milestone-fired` — set to `'1'` after `a2Milestone` Chaina moment fires once. Permanent milestone, never re-fires.
- `${prefix}-daily-goal-fired:YYYY-MM-DD` — set to `'1'` after the daily-goal Chaina moment + Confetti burst fires for that calendar day. Once per day per language.
- `learn-hindi:hindi-stories-read` — JSON array of story IDs the user has finished reading. Powers the read-check sticker on each StoryCard + the "N of 3 read" pill on the Hindi home Stories section header.
- `chaina-session-start-ts` (sessionStorage) — session start for sessionEnd 5min threshold

**New-content surfacing (Hindi):**
- `learn-hindi:seen-lesson-ids:hindi` — JSON array of lesson/foundation IDs the user has seen. Silent baseline on first detection (no false-positive popup). Powers the `newContent` Chaina moment + per-card NEW dot via `lib/seen-lessons.ts`.
- `learn-hindi:demo-reset:2026-05-26-new-content` — one-shot flag (set to `'1'`) so the manual demo reset (which unsees the 5 newest Hindi additions) runs once per device, not on every load. Safe to remove after the demo has fired.

**Dutch exam-prep keys:**
- `dutch-exam-target` — `'a2' | 'b1'`, default `'b1'`. Toggle in Dutch welcome modal.
- `dutch-knm-learned` — JSON array of question IDs the user has marked as learned in KNM study mode.
- `dutch-knm-attempts` — JSON array of `{ts, score, total, passed}` capped at 50, most-recent-first.
- `dutch-lezen-studied` — JSON array of Lezen text IDs.
- `dutch-lezen-mock-attempts` — same shape as `dutch-knm-attempts`, plus `text_ids: string[]`.

### Recent feature work log

**2026-05-26 wave — Foundation theory chapters (pilot: Noun Gender)**

- New optional `theory` block on the `Lesson` type — turns foundations into real textbook chapters. Schema: `intro` + `sections[]` (heading + multi-paragraph body + optional `TheoryTable` + optional `TheoryExample[]` + optional `TheoryCallout`) + optional `wrap_up`.
- New `components/lesson/TheoryView.tsx` (8 tests) renders the chapter: peach-gradient chapter header with `📖 chapter` tag + lesson title, intro paragraph, sections with display-font headings + body paragraphs + Sticker-wrapped tables (cream header row, alternating W/peach2 body rows) + butter-bg worked-example Stickers with hindi/english/breakdown lines + tone-coded callouts (tip=mint+💡, note=lav+📝, warning=peach+⚠️), wrap-up Sticker, full-width orange CTA "got it — try the phrases →".
- `LessonChaiGalli` opens with TheoryView when `lesson.theory` exists AND the user is fresh (no resume progress, not yet completed). Returning users skip straight to the phrase carousel.
- Pilot content: `07-noun-gender` ships with a 5-section chapter (the two genders, ending patterns, adjective agreement, verb agreement with the `ne` rule preview, gendering English loanwords) + intro + wrap-up. 2 tables, 3 worked-example blocks, 5 callouts.
- Other 8 foundations still use the legacy phrase-only flow until they get the same treatment in a follow-up session.
- Mark-complete is still gated on revealing every phrase (yesterday's fix unchanged). Scrolling through theory alone does not unlock completion.

**2026-05-26 wave — Hindi Stories (Chai Galli motion-comics)**

- 3 short illustrated Hindi stories (5 panels each): `chai-stall` (A1 — Cutting's origin meeting a customer at the chai stall), `lost-in-bazaar` (A2 — directions comedy-of-helpfulness, 3 shopkeepers contradict each other and a child saves the day), `sunday-with-nani` (A2 — grandmother lunch, leave with a steel dabba of leftovers).
- New content type: `Story` interface (`types/story.ts`) parallel to `Lesson`. Each panel has scene + dialogue + speaker + tap-reveal English + browser-TTS pronunciation. Cultural punchline on the last panel of each.
- 3 new SVG character primitives in Chai Galli style: `Nani` (sari, hair bun, glasses, dabba), `Customer` (humanoid, palette-swappable shirt), `Shopkeeper` (mustache, crate prop, two palette variants). Cutting reused as chaiwala (Story 1) and as customer (Story 3).
- 4 scene background components: `ChaiStallScene` (peach sky, chai cart, steam), `BazaarScene` (marigold strings, stall row, temple silhouette), `NaniHouseScene` (interior with window + low table + thali), `NarratorCard` (lavender dotted backdrop for narration panels). All composed inline SVG, no external assets.
- `StoryReader` (`components/stories/StoryReader.tsx`) drives the tap-through: Framer Motion `AnimatePresence` slide-left/right panel transitions, per-panel English reveal-zone (mirrors existing lesson reveal pattern), browser TTS via `lib/speech.ts` (`'hi-IN'`), Confetti on the final panel, marks story-read.
- New route `/stories/[id]`. New "Stories" section on Hindi home above the Situations/Foundations tab pill with 3 StoryCards (palette-rotated peach2 / butter / mint2) + "N of 3 read" pill.
- `lib/stories.ts` (TDD'd, 4 tests) + `lib/stories-progress.ts` (TDD'd, 7 tests) persist read state to `learn-hindi:hindi-stories-read`.
- Hindi-only for MVP. Dutch parallel can come later if engagement is positive. No quiz, no per-word translation popovers, no Chaina moment on completion (all deferred).

**2026-05-26 wave — Dutch exam-prep track + Hindi content expansion + new-content surfacing**

Massive content + feature wave. Eight specs/plans shipped in one session, ~50 commits.

Hindi expansion:
- 3 new situation lessons: `08-shopping-clothes` (Snell & Weightman Ch. 11), `09-doctor-visit` (Snell & Weightman Ch. 14 + Afroz Taj Lesson 9), `10-phone-with-parents` (Afroz Taj Lesson 11). Brought situations 7 → 10.
- 6 foundations backfilled with full skill_breakdowns (01-numbers, 02-present-tense, 03-past-tense, 04-future-tense, 05-postpositions, 06-pronouns-verbs). The 7-foundation gap from CONTENT.md "Open gaps" is now closed.
- 2 new foundations added: `08-compound-verbs` (le/de/kar dena patterns; Snell & Weightman Ch. 13), `09-ne-rule` (ergative-past; Snell & Weightman Ch. 12 + Afroz Taj Lesson 8). Foundations 7 → 9.
- CONTENT.md updated with canonical-sources section (Snell & Weightman, Afroz Taj, McGregor) + new authoring workflow.
- `scripts/generate-lesson.mjs` style guide flipped from `tum`-default to `aap`-default (matches the practice tutor's register policy). `references[]` field now required by the Zod schema.

New-content surfacing for Hindi:
- `lib/seen-lessons.ts` (TDD'd, 9 tests). Tracks which lessons the user has seen via localStorage. Silent-baselines existing IDs on first detection so no false-positive popup.
- New `newContent` Chaina moment fires on home mount when unseen lessons exist (once-per-session cap).
- `LessonStickerCard` gained `isNew?: boolean` prop — renders chai-orange dot in top-right corner. `markAsSeen()` called from card onClick before navigation.
- One-shot demo-reset block in `app/page.tsx` mount effect unsees the 5 newest content adds so the popup fires once for the existing user (gated by `learn-hindi:demo-reset:2026-05-26-new-content` flag). **Remove this block after the demo has been observed.**

Dutch exam-prep track (Inburgeringsexamen B1 + KNM):
- Dutch section pivoted from "casual conversational" to a focused exam-prep frame. Goal banner + 3-stage A1/A2/B1 path + 5 skill-module grid on the Dutch home.
- KNM module (`/dutch/knm/`): 100 original questions across 6 categories, bilingual study mode (Dutch + English subtitles), 30-question Dutch-only timed drill with ≥80% pass threshold.
- Lezen module (`/dutch/lezen/`): 10 reading texts re-tiered 5 A1 + 4 A2 + 1 B1 preview (B1 was originally the only target — too ambitious for A0-A1 starting level). Bilingual study mode, 25-min Dutch-only timed mock.
- 6 exam-targeted scenario lessons added: `dutch-gemeente`, `dutch-housing-problem`, `dutch-bank`, `dutch-huisarts-call`, `dutch-job-interview`, `dutch-primary-school`. Each has 10 phrases + 5 grammar notes + 4 culture notes + 3 skill_breakdowns + a B1-register `practice_prompt` for `/practice/[id]`.
- 6 new Dutch Chaina moments (knmAttemptComplete, knmPassed, a2Milestone, lezenStudyDone, lezenMockPassed). Lines are Dutch ("arrey! nayi... " replaced with Dutch equivalents like "Geslaagd! 🎉").
- `Lesson` type extended with optional `level: 'A1'|'A2'|'B1'` + `exam_targeted?: boolean` fields. All Dutch lessons tagged. Existing 5 conversational marked A1 + exam_targeted=false.
- Welcome modal rewritten with exam-prep mission copy + B1/A2 target toggle (default B1, future-proof for the in-flux naturalization-level requirement).
- `lib/dutch/level-map.ts` bug fix: keys are now `dutch-` prefixed to match lesson JSON IDs. The 3-stage progress bars on Dutch home now actually compute progress correctly (previously they always showed 0/N because the bare-key lookup never matched).

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

Resolved 2026-05-26:
- ~~Foundations 02-06 have empty `skill_breakdown: []`~~ — backfilled with 3 entries each, plus 2 new foundations (compound-verbs, ne-rule). All 9 Hindi foundations now have full skill_breakdowns.
- ~~No A1/A2/B1 markers on lessons~~ — `Lesson` type now has optional `level` field. Dutch lessons all tagged; Hindi lessons untagged (no CEFR system for Hindi).
- ~~`a2Milestone` Chaina moment registered but not triggered~~ — wired into `app/page.tsx` mount effect; fires once when every A1 Dutch item is complete, gated by `chaina-a2-milestone-fired` flag.

Still open:
- **No XP / leveling arc** — `phrasesLearned` is just a stat tile, no progression visual.
- **No audio assets** — only browser TTS. Native recordings would matter most for Phase 3 Luisteren (Dutch listening drills).
- **Conjugation drill is verb-by-verb** — no mixed-verb sets, no spaced-repetition wiring.
- **Dutch Phase 3-6 still pending:** Luisteren (Listening), Schrijven (Writing), Spreken (Speaking), Mock-exam. Each gets its own spec → plan → ship cycle.
- **One-shot demo-reset block in `app/page.tsx` mount effect** unsees 5 Hindi IDs to demo the newContent popup. Remove after observed (flag: `learn-hindi:demo-reset:2026-05-26-new-content`).

### Audit notes (2026-05-26)

Items previously claimed as gaps but verified non-issues during the loose-end cleanup session. Documented here so future sessions don't chase the same phantoms.

- **Hindi pronunciation field formatting is intentionally prosodic, not lexical.** CAPS marks sentence-level stress (where the spoken beat falls in the phrase), not the canonical lexical stress of each word in isolation. So `yaar` appears lowercase as a soft sentence-end softener but `YAAR` when it's a stressed exclamation; `kar-te` appears lowercase as a verb cluster in `mil-te kar-te` rhythm but `KAR-te` when it carries the phrase beat. The format is consistent across all 19 Hindi files (10 situations + 9 foundations) and intentional. No normalization pass needed.
- **Phrase `context` fields align with phrase content.** Heuristic audit across 336 phrases (all 30 lessons, Hindi + Dutch) flagged 21 for keyword-overlap review; on manual inspection all are legitimate — the `context` explains the phrase's strategic or grammatical purpose without redundant lexical repetition (e.g. `chodo, doosra auto dekh leta hoon` → context "The walk-away — most effective negotiation tool" describes the move, not the words). No rewrites needed.

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
