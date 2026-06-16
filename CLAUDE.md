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
- PWA (manifest + iOS install prompt + offline caching service worker; see 2026-06-03 work log)
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
content/dutch/lessons/  → 19 Dutch lesson JSONs (6 A1 conversational + 1 A2 social + 6 errand/casual + 6 A2/B1 exam-targeted)
content/dutch/foundations/ → 14 Dutch foundation JSONs (8 A1 + 6 A2)
content/dutch/knm.json  → 100 KNM exam questions (bilingual, 6 categories)
content/dutch/lezen.json → 10 Lezen B1-prep reading texts (bilingual, 40 MCQs)
content/dutch/pronunciation-course.json → 8-stage from-zero "Sounds" ladder (alphabet→linking)
content/stories/        → 5 Hindi story JSONs (Chai Galli motion-comics)
docs/audits/             → Content audit rubric + per-run reports + master summaries
scripts/audit-content.mjs → Audit dispatcher (lists 57 units, builds per-unit prompts, aggregates reports)
types/                  → TypeScript interfaces
public/                 → PWA manifest, icon.svg
```

## Common Tasks

### Add a new lesson
1. Create `content/lessons/NN-topic-name.json` (follow existing lesson structure, see CONTENT.md for schema)
2. Import and add to array in `lib/lessons.ts`
3. Update CONTENT.md inventory table
4. **Natural voice (REQUIRED for Hindi):** every "hear it" string must play the ElevenLabs **Anika** voice (`ELEVEN_VOICE_HI=RABOvaPec1ymXz02oDQi`), not the robotic TTS fallback. Add a romanized→Devanagari pair for each new spoken string to `content/hi-translit.json`, run `ELEVENLABS_API_KEY=… ELEVEN_VOICE_HI=RABOvaPec1ymXz02oDQi node scripts/generate-audio.mjs` (idempotent), commit the new `public/audio/hi/*.mp3` + updated `content/hi-audio.json`. **Never commit the key.** Verify with `npm run audio:check` (a CI gate). Full reference: `docs/superpowers/specs/2026-06-16-natural-voice-pipeline.md`.

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
plus three content lints on every push and PR:
- `lint:design` — Chai Galli palette/shadow/border rules.
- `lint:content` (`scripts/lint-content.mjs`) — copy style: no em-dashes, no arrows, no AI clichés (scans `content/**` + UI strings in `app/`/`components/`).
- `lint:quality` (`scripts/lint-quality.mjs`) — content **legitimacy + readability**: every lesson must cite ≥1 source from the vetted `KNOWN_SOURCES` allowlist (blocks fabricated/conflated references), and grammar jargon must be glossed in plain words once per file (`auxiliary` → "the helper verb", `infinitive` → "the base or dictionary form", etc. — add new terms to the `JARGON` map). Run `npm run lint:quality` locally before committing content.

A red ❌ on the commit means the build will break in prod — fix before the
next deploy. ESLint runs in CI too (`npx eslint .`).

**Direct commit to main** (for solo hotfixes): same flow, just commit on `main` and push.

## Environment Variables
- `GOOGLE_GENERATIVE_AI_API_KEY` — Gemini API key (set in .env.local locally, Vercel env for prod)
- `ANTHROPIC_API_KEY` — Claude API key, used **only** by `app/api/journal-check/route.ts` (Chai Diary corrections run on Claude Sonnet 4.6 for better Hinglish-intent understanding). If unset, that route falls back to Gemini automatically, so the app still works without it. Set in `.env.local` locally + Vercel env for prod.

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
| `/` | Home — peach gradient header band w/ Cutting mascot, compact search + mute icon buttons + animated streak chip, daily-goal bar fills 0→pct, marigold divider, Continue rickshaw-chip, Talk-to-Chaina card, Situations/Foundations tab pill (sliding cream indicator via Framer `layoutId`), staggered lesson sticker list (completed lessons collapse into a DoneFold). **Decluttered 2026-06-16:** search shrank from a full-width bar to an icon, and the Sounds + Stories sections moved off home into the new `/learn` hub. |
| `/diary` | **Chai Diary** (Hindi-only daily journal). Cool-neutral bg, focused writing screen (nav hidden). Header: back chevron + "Chai Diary" + coral journal-streak chip + segmented "today's page / the diary" + Holi-dots garland. **Today:** ruled cream `PageSurface` (margin rule + punch holes), date header + corner Mascot, the day's prompt (deterministic by date) with "Chaina padhegi" (natural Anika TTS of the Devanagari) + peek (English), a handwriting-face `<textarea>` on ruled lines. Actions: 🔍 check (`/api/journal-check`, **Claude Sonnet 4.6** via `@ai-sdk/anthropic` for Hinglish-intent understanding; falls back to Gemini if `ANTHROPIC_API_KEY` is unset, then to an offline regex pre-check on the client) opens a spring-in modal of gentle fixes; "tuck into the diary →" stamps it done + Confetti, shows Chaina's reaction bubble (mood by sentiment) + "chaina's little notes" fixes (saved as mistakes under `__journal__`). **The diary:** streak card + 21-day cool-mint calendar heatmap + flip-back book of past entries (3D page turn, ribbon bookmark, per-page "translate" reveal). Entries persist per-date, per-language. |
| `/learn` | "Learn" hub (the renamed `words` bottom-nav tab). Themed header band + link cards: Vocabulary (→`/vocabulary`), Sounds (→`/sounds` for Hindi, `/dutch/sounds` for Dutch, w/ `N/M stages`), and (Hindi only) the Stories section (StoryCards + read DoneFold) moved here from home. |
| `/lessons/[id]` | Single-page lesson view: palette-matched header w/ chapter tag + title + 3 skill chips, segmented per-phrase progress, phrase Sticker w/ ⭐ star, hindi headline, butter pronunciation pill, lavender→mint reveal-zone, "hear it" TTS, prev/next, "mark chapter complete". On complete → full celebration screen w/ confetti + expanding rings + happy-hop Cutting + 3-up stat stickers + practice CTA |
| `/practice/[id]` | AI chat. Butter header w/ happy Cutting + hands-free/reset/finish toolbar pills. Mint scenario sticker w/ chai motif. AI bubbles = white stickers w/ teal Cutting avatar; user bubbles = peach stickers; correction stickers = butter w/ dashed border. Bottom input bar: orange mic pill + white text input pill + green send. Tutor reply tagged `[[CORRECTION: original="…" correct="…" reason="…"]]` saved as mistake |
| `/quiz` | Mint header, per-question segmented progress, question sticker (orange "question N of N" tag + "what does this mean?" + Hindi headline + butter 📢 hear-it on translate-to-english questions), 4 colored option stickers with ink letter columns (A/B/C/D). Picked-wrong shakes + filled red w/ ✕; correct fills mint w/ ✓; unpicked-wrong fades to 0.55. Auto-advance after 1.2s. |
| `/progress` | Lavender header. Streak hero: float-y orange tile + flame-flicker 🔥 + count-up day number + 7-day calendar w/ active(orange ✓)/pending(dashed)/inactive. 2×2 stat tiles (phrases/practice/quiz-avg/lessons), 3-col tools (mistakes/saved/drill), lesson groups w/ animated progress bars + "N completed" fold, recent-activity sticker. Gear icon in the header top-right → `/settings` |
| `/settings` | Cream header w/ back button + ⚙ tag + "tinker, tweak" title. White-sticker sections for: daily goal (5/10/15 chips + custom number input), name (text input), gender (2-chip grid), reason (4-chip grid), sound mute (toggle slider), ambient soundscape (toggle slider, opt-in), language (hindi/dutch pill). Red "danger zone" sticker w/ 2-step reset-progress confirm (wipes `${prefix}-*` keys for the current language, keeps profile) |
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
| `/dutch/luisteren` | Luisteren (Listening) module home. 3 tier folds (A1/A2/B1), "Start timed mock" CTA, past-mocks fold. Clip cards: 🔊 + English title + monologue/dialogue label + studied chip. Audio is device TTS reading a Dutch transcript (no native recordings). |
| `/dutch/luisteren/[clipId]` | Single clip study mode. TTS audio player (play/stop/replay, no scrubbing) via `speak(buildAudioScript(clip), 'nl')`. Transcript hidden by default; "show transcript + translation" reveals lines w/ speaker labels + greyed English. 4 bilingual question cards (tap-to-reveal + explanation). Mark-as-studied → `luisterStudyDone` + persist to `dutch-luisteren-studied`. |
| `/dutch/luisteren/mock` | 25-min timed Listening drill (audio-only, no transcript). 5 random clips × 4 Qs = 20 questions. Live timer pill pink under 5 min. Auto-advance 1.5s. Pass ≥16/20 → `luisterMockPassed` + Confetti. Save to `dutch-luisteren-mock-attempts`. |
| `/dutch/sounds` | "Sounds" module home (Dutch from-zero pronunciation). Orange header w/ Mr. Stroopwafel, `N/8 stages` count, and the 8-stage ladder as Stickers: complete (green ✓), unlocked (tappable + progress bar), locked (dimmed + 🔒). Rolling unlock — finishing a stage opens the next two. |
| `/dutch/sounds/[stageId]` | Single pronunciation stage. Mr. Stroopwafel intro bubble + sound-card deck (grapheme + plain hint + anchor word/gloss + 🔊 Google TTS + got-it self-check) + optional minimal-pair ear-quiz + optional blend builder (word assembled part-by-part, each playable). On completion → Confetti + `pronStageDone` Chaina moment + "next stage" CTA. |
| `/stories/[id]` | Single Hindi story — tap-through 5-panel Chai Galli motion-comic. Each panel: scene background (composed SVG: ChaiStall / Bazaar / NaniHouse / NarratorCard) + character w/ idle motion (Cutting / Nani / Customer / Shopkeeper) + dialogue Sticker w/ syllable-stress pronunciation hint + 🔊 hear-it (browser TTS, hi-IN) + tap-to-reveal English (lavender → mint reveal-zone). Framer Motion slide-in panel transitions. Last panel marks story-read in `learn-hindi:hindi-stories-read` + fires Confetti + "✓ read more stories" CTA back to home. |

### Libraries (`lib/`)

| File | What it does |
|------|--------------|
| `progress.ts` | `completedLessons`, `lessonCompletedAt[id]→ISO`, `currentStreak`, `lastActiveDate`, `practiceSessionCount`, `todaySessions`+`todaySessionsDate`, `seenStreakMilestones[]`. Streak math is UTC-midnight-based (DST-safe). `updateStreak` clears seenStreakMilestones when streak breaks |
| `phrase-progress.ts` | Per-phrase viewed indices, `getLessonPercent`, `computeLessonResume` |
| `review.ts` | **Full SM-2 lite SRS** (interval, easeFactor, nextReviewAt). Powers daily review popup |
| `mistakes.ts` | `[[CORRECTION:]]` extraction, capped at 200, source = 'practice' \| 'quiz' |
| `vocab-review.ts` | Separate known/review sets for vocab swipe UI |
| `vocab-archive.ts` | Per-language archived-vocab set. `getArchived/addArchived/removeArchived/isArchived/migrateLegacyKnown`. TDD'd, 15 tests. Powers swipe-right-archive on `/vocabulary/[category]`. |
| `personalization.ts` | Onboarding reason reorders Hindi lessons (family/bollywood/moving/curious) |
| `sounds.ts` | 8 generative Web Audio sounds (tap/correct/wrong/complete/swipe/streak/levelup/pop) — prefers designed ElevenLabs clips (`content/sfx-audio.json` → `public/audio/sfx/`), falls back to the synth. **Cute Duolingo-style palette** — sine+triangle waves, major-interval chimes, pitch glides via `playGlide`. Plus `playCombo(streak)` — escalating pentatonic combo reward (synth-only). Vibration patterns paired per sound. Mute toggle persisted in `bolna-seekho-muted` |
| `ambient.ts` | Faint looping background soundscape per track (chai-stall hum / café terrace). Opt-in, OFF by default (`bolna-seekho-ambient`). `startAmbient(track)`/`stopAmbient()`/`isAmbientOn()`/`setAmbientOn(on,track)`. Fades, loops, respects global mute, starts on a user gesture. Clips at `public/audio/ambient/{hindi,dutch}.mp3`. TDD'd, 5 tests. |
| `journal.ts` | **Chai Diary** engine. 14 curated daily `PROMPTS` (`hi` Devanagari for TTS, `hinglish` shown, `en` peek, `starter`, `tag`). `promptForDate` (deterministic by day-of-year), per-date per-prefix storage (`${prefix}-journal-<YYYY-MM-DD>` → entry/done/reaction/mood/fixes/translation), `getArchive`/`getJournaledDateKeys`/`getJournalStreak`/`getCalendar` derived from real history, and `analyzeEntryOffline` (safe regex fallback that never nitpicks house romanisation). TDD'd, 15 tests. |
| `offline-cache.ts` | PWA offline precache warm-up. `getAllRoutes()` (route list from bundled content), `getAudioUrls(lang)`, `warmOfflineCache({audio,language,onProgress})` (fetches every route doc → `bs-pages-v1`, parses + fetches `/_next/static` assets, optionally all audio → `bs-audio-v1`), `autoWarmOfflineCache(lang)` (once/day background, no audio, data-saver-aware). Cache names mirror `public/sw.js`. TDD'd, 8 tests. |
| `last-active-lesson.ts` | Powers Continue CTA on home |
| `quiz.ts` | Quiz scores, average |
| `favorites.ts` | Star phrases — `toggleFavorite`, `isFavorite`, `getFavorites`. Key `${lessonId}::${hindi}` |
| `conjugations.ts` | 5 verbs (hona/jaana/karna/aana/bolna) × 3 tenses (present/past/future), used by `/drill/conjugation`. Romanization follows CONTENT.md style (single-vowel endings: `karta`, `karunga`, `tha`) |
| `speech.ts` | Browser TTS / STT — ReadAloudButton + voice input |
| `stories.ts` | Loader for the 5 Hindi story JSONs in `content/stories/`. `getAllStories()` + `getStoryById(id)`. TDD'd. |
| `stories-progress.ts` | Read-state tracking for Hindi stories. Storage key `learn-hindi:hindi-stories-read` (JSON array of read story IDs). TDD'd, 7 tests. |
| `seen-lessons.ts` | localStorage-backed Set tracking which lessons a user has seen (per-language). `initBaseline()` silent-tags existing IDs on first detection so the popup never false-fires; `getUnseenIds()`, `markAsSeen()`, `hasBeenSeen()`, `unseeIds()`. TDD'd, 9 tests. |
| `dutch/lessons.ts`, `dutch/foundations.ts` | Parallel loaders for Dutch content (11 lessons + 7 foundations). `getDutchAllContent()` returns both combined for cross-module use (e.g. search). |
| `dutch/pronunciation.ts` | "Sounds" module loader (TDD'd, 9 tests). 8-stage from-zero ladder from `content/dutch/pronunciation-course.json`. `getStages/getStage`, `markCardDone/isCardDone`, `markEarQuizPassed/isEarQuizPassed`, `isStageComplete` (derived), rolling-window `unlockedStageIds`/`isStageUnlocked` (finish → next 2 open), `getStageProgress`/`getCourseProgress`. |
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
| `bottom-nav.tsx` | Floating white sticker pill at the bottom of all non-fullscreen pages. Active-tab cream pill slides via Framer `layoutId`. Hidden on `/lessons/*`, `/practice/*`, `/play/duel/*`, `/onboarding`. Tabs: `home` (`/`), `play` (`/play`, Quizzes + Games), `learn` (`/learn`, Vocabulary + Sounds + Stories hub; was `words`→`/vocabulary`), `diary` (`/diary`, **Hindi-only**, coral book icon, inserted between learn and you), `you` (`/progress`), plus the language-toggle flag. Nav also hides on `/diary`. |
| `design/MomentStage.tsx` | **Chaina moments system.** `ChainaProvider` mounts once in `app/layout.tsx`. `useChaina()` returns `{ play(key), stop() }`. **22 moments** registered in `moments.ts` (welcomeBack/correctAnswer/lessonComplete/streakMilestone/newContent/knmAttemptComplete/knmPassed/lezenStudyDone/lezenMockPassed/a2Milestone/dailyGoalReached/etc). Each moment fires `<Cutting>` + `<SpeechBubble>` w/ animations, plus voice via `chainaVoice.play()` (MP3 → speechSynthesis fallback). Frequency caps in `chainaFrequency.ts`. |
| `search-overlay.tsx` | Full-screen search modal triggered from the home magnifying-glass. Language-aware index. Locks body scroll, restores focus on close, Esc to dismiss |
| `daily-review-popup.tsx` | Butter bottom-sheet w/ Cutting, fires every 24h after first lesson complete. Mixes vocab + lesson phrases through SRS |
| `feature-tooltip.tsx` | One-time tooltips (Chai Galli white sticker + orange CTA + cream halo spotlight), dismissed via localStorage |
| `dutch-welcome-modal.tsx` | First-time-only Dutch onboarding card |
| `notification-prompt.tsx` | Daily-reminder opt-in butter sticker |
| `install-prompt.tsx` | iOS PWA install hint peach sticker |
| `offline-banner.tsx` | Global connectivity status pill. Slides down from the top when the device goes offline ("you're offline — saved lessons still work") + a brief green "back online" confirmation on reconnect. `pointerEvents:none` (never blocks taps), renders only when offline, z-index 80 (below modals/tooltips/gloss popovers). Driven by browser `online`/`offline` events. No network calls. |
| `layout-shell.tsx` | Mounts OfflineBanner, BottomNav, NotificationPrompt, DailyReviewPopup. Wires notification reminders (`maybeFireRandomNudge`, `maybeShowReminderOnOpen`) on visibility events |
| `voice-button.tsx` | Mic button (Chai Galli orange pill, red + pulse when listening). STT via `lib/speech.ts` |
| `quiz/quiz-card.tsx`, `quiz/quiz-results.tsx` | Quiz question + results screens. Use design primitives. |

### Chaina moment triggers (where `play(key)` is called)
Fire on real beats only — accomplishments, retention nudges, character touch points. Frequency-capped via `canFire`/`markFired`.
- Home header tap — `play('tap')` (debounce-800ms)
- Vocab "I know this" right-swipe — `chainaVoice.bark()` (wordless mascot cheer; no Chaina popup on this beat, so no clash)
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
- `${prefix}-vocab-archived` — JSON array of romanized Hindi headwords the user has archived from the vocab category pages. Migrated additively from the legacy global `vocab-known` on first read.
- `${prefix}-last-active-lesson`
- `${prefix}-journal-<YYYY-MM-DD>` — Chai Diary: one entry per date `{ entry, done, ts, reaction, mood, fixes, translation }`. Streak/calendar/archive derived from these. Mistakes from the check save under `lessonId: '__journal__'`.
- `${prefix}-home-tab` — restores Situations vs Foundations
- `bolna-seekho-muted` (global, not prefixed) — sound mute toggle
- `bolna-seekho-ambient` (global) — ambient soundscape on/off (`'1'`/`'0'`, default off). Set via the Settings "ambient" toggle; read by `lib/ambient.ts`.
- `bolna-seekho-onboarding` (global) — user profile
- `chaina-first-ever-seen` — set to '1' after firstEver fires once
- `chaina-last-session-ts` — timestamp for welcomeBack/firstOpenToday discrimination
- `chaina-voice-muted` — reserved future fine-grained Chaina mute (read but not yet UI-toggled)
- `chaina-freq-<mode>-<key>` — frequency cap state per moment
- `chaina-a2-milestone-fired` — set to `'1'` after `a2Milestone` Chaina moment fires once. Permanent milestone, never re-fires.
- `${prefix}-daily-goal-fired:YYYY-MM-DD` — set to `'1'` after the daily-goal Chaina moment + Confetti burst fires for that calendar day. Once per day per language.
- `learn-hindi:hindi-stories-read` — JSON array of story IDs the user has finished reading. Powers the read-check sticker on each StoryCard + the "N of 3 read" pill on the Hindi home Stories section header.
- `${prefix}-daily-goal-fired:YYYY-MM-DD` — set to `'1'` after the daily-goal celebration card + Confetti + Chaina moment fires for that calendar day. Once per day per language. New day = new celebration.
- `${prefix}-progress-lesson-tab` — `'situations' | 'foundations'` for the Progress page tab pill (was added when the page got its single-section toggle).
- `chaina-session-start-ts` (sessionStorage) — session start for sessionEnd 5min threshold

**New-content surfacing (Hindi):**
- `learn-hindi:seen-lesson-ids:hindi` — JSON array of lesson/foundation IDs the user has seen. Silent baseline on first detection (no false-positive popup). Powers the `newContent` Chaina moment + per-card NEW dot via `lib/seen-lessons.ts`.

**Dutch exam-prep keys:**
- `dutch-exam-target` — `'a2' | 'b1'`, default `'b1'`. Toggle in Dutch welcome modal.
- `dutch-knm-learned` — JSON array of question IDs the user has marked as learned in KNM study mode.
- `dutch-knm-attempts` — JSON array of `{ts, score, total, passed}` capped at 50, most-recent-first.
- `dutch-lezen-studied` — JSON array of Lezen text IDs.
- `dutch-lezen-mock-attempts` — same shape as `dutch-knm-attempts`, plus `text_ids: string[]`.
- `dutch-luisteren-studied` — JSON array of Luisteren clip IDs marked studied.
- `dutch-luisteren-mock-attempts` — same shape as the Lezen attempts, plus `clip_ids: string[]`.
- `dutch-pron-cards-done` — JSON array of "Sounds" card ids marked got-it (blend words tracked as `blend:<whole>`).
- `dutch-pron-earquiz-done` — JSON array of "Sounds" stage ids whose ear-quiz passed. Stage completion + the rolling unlock are derived from these two sets.

### Recent feature work log

**2026-06-16 — Chai Diary (daily journal) + home declutter**

A daily journaling feature (design handover from Claude design, recreated in the
codebase). Once a day Chaina asks one warm personal question; the learner writes
a short entry in **romanised Hindi (Hinglish, never Devanagari)**, hears the
prompt in Chaina's natural Anika voice, can peek the English, run a model-backed
**check** for a few gentle fixes, then **tuck the page in**. Past entries live in
a flip-back archive with a cool-mint streak calendar. Hindi-only (prompts are
Hindi). Files: `lib/journal.ts` (engine, TDD'd), `app/api/journal-check/route.ts`
(Gemini `generateObject` → reaction/mood/fixes/translation, offline regex
fallback), `components/journal/JournalScreen.tsx` (the screen), `components/
journal/DiaryHomeCard.tsx` (home "aaj ka sawaal" entry), `app/diary/page.tsx`.
New journal tokens + `HOLI_DOTS` in `tokens.ts`; journal keyframes (`jbar`,
`jspring`, `jstamp`, `book-next/prev`, `galli-bob`, …) in `animations.css`.
Diary tab added to `bottom-nav` (Hindi only); `/diary` precached + nav hidden.
Prompt audio: each prompt's romanized→Devanagari pair added to
`hi-translit.json` and rendered to Anika clips (per the natural-voice pipeline).
Corrections persist as mistakes under `lessonId: '__journal__'`. Storage key
`${prefix}-journal-<YYYY-MM-DD>`. The home was also decluttered just before this
(search→icon, Sounds+Stories→`/learn` hub) so the diary card has a clean lane.


**2026-06-03 — Games: Sentence Builder (Hindi, second game type)**

A second game type beyond duels, in the Play hub: **Sentence Builder** (`/play/sentence/[id]`) — tap scrambled Hindi word-tiles into the correct SOV order to match an English meaning (Hindi word order + postposition placement is the marquee challenge for English speakers). **Creative/progressive difficulty inside one game:** 3 rounds of 4, ramping — round 1 exact tiles, round 2 sneaks in 1 decoy word, round 3 adds 2 decoys (decoys drawn from the rest of the sentence pool).

- Engine `components/games/SentenceBuilderGame.tsx`: intro/how-it-works → 3 rounds → done, the same shell as the duel (round stepper, combo chip, checkpoints, Confetti, mascot, haptics). Tap a tray tile to place it, tap a placed tile to take it back; auto-checks when the answer row fills. Correct → green + combo + the sentence is spoken aloud (`speak(.., 'hi')`); wrong → red shake + shows the right order + logs to the **mistakes** system under `lessonId: 'pronouns-verbs'`.
- Content `content/games/hindi/sentence-builder.json` (36 sentences, 12 easy/medium/hard, curated for a single canonical order, accuracy-audited). Loader `lib/sentence-game.ts` (`getSentenceGames`, `drawSentenceGame` with decoy ramp via `lib/gloss` `words()`, best-score). Types in `types/game.ts`. TDD'd, 5 tests.
- Hub (`/play`) now lists both game types (sentence games + duels) via a shared `GameCard`. Nav hidden on `/play/sentence/*`; route added to the offline precache. Generic enough that more sentence sets drop in via content + a loader entry. **A Dutch set (`sentence-builder-nl`, V2 / participle-at-end / separable-verb order, audit-clean) was added the same day** so Dutch now shows a sentence builder too; `getSentenceGameById` needs unique ids across languages (Hindi `sentence-builder`, Dutch `sentence-builder-nl`).

**2026-06-03 — Games: Play hub + Gender Duel (Hindi)**

Repurposed the bottom-nav **Quiz** tab into a **Play** hub (`/play`) with two sections: **Quizzes** (links to the existing `/quiz`, unchanged) and **Games**. First game: **Duel** — a fast binary-choice game for chronically-confused distinctions (the format from the user's de/het screenshots). First Hindi duel: **Gender Duel** (masculine vs feminine — the direct de/het analog).

- Engine: `components/games/DuelGame.tsx` (intro/rules screen → 30 shuffled rounds → done screen). Reuses Chai Galli primitives, `playCombo(streak)` escalation + flame combo chip, `Confetti` on ≥60%, mascot-happy done screen. Wrong answers log to the **mistakes** system under `lessonId: 'noun-gender'` (source `quiz`) so they're drillable.
- Data: generic `Duel` schema (`types/game.ts`) — `left`/`right` sides + `items[{prompt, answer:'left'|'right', emoji?, hint?, explain?}]`. Content `content/games/hindi/gender-duel.json` (52 nouns, 25 M / 27 F, gender-audited clean). Loader `lib/games.ts` (`getDuels(language)`, `getDuelById`, `drawDuelRound` Fisher-Yates, `getDuelBest`/`recordDuelResult` per-prefix best score). TDD'd, 7 tests.
- Routes: `/play` (hub), `/play/duel/[id]` (fullscreen game, bottom-nav hidden). Bottom-nav `/quiz`→`/play` (label "play", no longer requires a completed lesson). `/play` added to the offline precache route list.
- Generic + reusable: more duels drop in by adding a `content/games/<lang>/*.json` + one loader entry.

**Duel roster (6) + polish (2026-06-03 follow-up):** Hindi: `gender` (M/F), `ne-rule` (ne / no-ne, ergative), `hai-hain` (singular vs plural/respectful), `register` (aap vs tum, politeness; added 2026-06-16, files mistakes under `pronouns-verbs` via the new optional `Duel.mistakeLessonId` field, default `noun-gender`). Dutch: `de-het` (article), `hebben-zijn` (perfect auxiliary). All accuracy-audited (audit caught a serious ne-rule bug: exception items had the subject still in `ne` form; plus hai-hain number-ambiguity + a both-auxiliary Dutch verb removed). Game polish: **3 rounds of 10** with a checkpoint between sets; **resume** from the last completed round (`${prefix}-game-<id>-progress`, offered on the intro as "continue · round X" vs "start over", cleared on finish); a visual **round stepper** (R1/R2/R3 chips, done=✓) replacing the old text; **card vibration + visual reaction** on press (green pop / red shake + tint); **streak juice** (every 5: flash + escalating buzz + Chaina cheer); fuller done celebration.

**2026-06-03 — Content quality CI gate (vetted references + plain-language jargon)**

New `scripts/lint-quality.mjs` (wired into `ci.yml`, `npm run lint:quality`): every learner-facing lesson/foundation must cite ≥1 source from a vetted `KNOWN_SOURCES` allowlist (catches fabricated/conflated citations — e.g. a subagent had attributed the Hindi "Snell & Weightman" author to a Dutch grammar), and grammar jargon must be glossed in plain words once per file (`JARGON` map: `auxiliary`→helper, `infinitive`→base/dictionary form, `diphthong`→sound, `interrogative`→question, `ergative`→doer). Bringing the whole repo green required: fixing the fabricated refs in the 8 new Dutch units, **adding vetted references to 24 older lessons that predated the `references` field**, and glossing `infinitive`/`auxiliary`/`ergative` at first mention across ~12 existing files. To extend: add real sources to `KNOWN_SOURCES`, add jargon pairs to `JARGON`.

**2026-06-03 — Dutch ground-up expansion (Batch 1: 8 conversational A1 units)**

Added a true from-zero on-ramp so the Dutch track grows conversationally before its exam-prep capstone (it previously jumped from the Sounds phonics course straight into errand scenarios + A2 grammar). 4 new foundations + 4 new situational lessons, all A1, conversational-first.

- **Foundations** (full theory chapters, bare ids): `pronouns-zijn-hebben` (pronouns + the two key verbs), `questions` (yes/no inversion incl. the dropped -t with je/jij + question words), `negation` (`geen` vs `niet`), `simple-sentences` (gentle A1 V2 / inversion / `er is`/`er zijn`, a soft preview of the A2 word-order chapter). `lib/dutch/foundations.ts` reordered ground-up: pronouns-zijn-hebben → numbers → pronunciation → present-tense → questions → negation → simple-sentences → de-het → word-order → past-tense → modals (7 → 11 foundations).
- **Situations** (no theory, `exam_targeted:false`): `dutch-first-words` (survival phrases), `dutch-small-talk` (weather/how-are-you), `dutch-family-home`, `dutch-daily-routine`. Prepended before the errand scenarios in `lib/dutch/lessons.ts` (11 → 15 lessons).
- All 8 tagged A1 in `lib/dutch/level-map.ts` (foundations bare ids, lessons `dutch-` ids). Authored via 8 parallel subagents (Opus for the grammar foundations, Sonnet for the conversations), matching the schema/voice and passing the copy lint.
- **Also fixed a latent CI break:** the earlier PWA offline work left two em-dashes (`offline-banner.tsx`, `settings/page.tsx`) that violate `lint:content` (a CI gate) — replaced with commas.

**2026-06-03 — PWA offline: precache warm-up + caching + status banner**

Offline-support wave. Spec at `docs/superpowers/specs/2026-06-03-pwa-offline-design.md`.

*Offline precache warm-up* (`lib/offline-cache.ts`, TDD'd 8 tests). The SW caches lazily (only what you visit), so lessons never opened were unavailable offline ("offline" message / dead buttons from missing chunks). Since the app is a pure client SPA with bundled content, the fix is to proactively download the whole app while online: `warmOfflineCache()` fetches every route's HTML into `bs-pages-v1`, parses each document's `/_next/static` asset URLs and fetches them (SW caches cache-first → fixes hydration/dead-buttons offline), and optionally all "hear it" audio into `bs-audio-v1`. `getAllRoutes()` derives the full route list from bundled content loaders. Deploy-agnostic (no build step), awaitable (real progress). Cache names must stay in sync with `public/sw.js` (`CACHE_VERSION='v1'`). Wired two ways: (a) `autoWarmOfflineCache(lang)` runs once/day in the background from `layout-shell.tsx` (pages+assets, no audio, skips on data-saver), (b) a Settings → **offline** section with a "save everything for offline" button (incl. audio) showing a live progress bar. Offline soft-nav to an uncached route fails the RSC fetch and Next falls back to a hard navigation, which the SW serves from the cached document.

*Offline status banner* (`components/offline-banner.tsx`, mounted in `layout-shell.tsx`, TDD'd 4 tests): a slim pill slides down from the top whenever the device goes offline, plus a brief green "back online" confirmation on reconnect. `pointerEvents:none` so it never blocks taps, renders only when offline (zero footprint online, SSR renders nothing), layered at z-index 80 (below the daily-goal modal z90/91, feature tooltips z100-102, and the gloss popover z81). Pure status indicator — no network calls, no sync.

*PWA offline caching (service worker).* `public/sw.js` was previously notification-only ("does NOT cache network responses"). It now also adds an offline caching layer so the PWA loads and works without internet. No new npm dependency (hand-written SW, Next 16-safe); registration is unchanged (`registerServiceWorker()` in `layout-shell.tsx`).

- **Strategies** (GET only — POST like `/api/chat` is never intercepted):
  - `/_next/static/*` (content-hashed) + `/audio,/chaina,/stroopwafel` (pre-gen mp3s) → **cache-first**.
  - `/api/tts` → **cache-first**, FIFO-capped at `TTS_MAX_ENTRIES` (300). Deterministic per text+lang, so a phrase spoken once works offline after. A miss while offline returns `Response.error()`, which `lib/speech.ts` already degrades to browser `speechSynthesis`.
  - Navigations (HTML) → **network-first** → cached page → `public/offline.html` fallback. Any route visited online becomes available offline.
  - Other same-origin GET (icons, manifest, RSC flight payloads) → **stale-while-revalidate**.
  - `/api/chat`, `/api/pronounce` → **network-only** (real-time Gemini, must stay fresh).
- **Cache versioning:** bump `CACHE_VERSION` in `sw.js` to invalidate all `bs-*` caches on next deploy (cleared in the `activate` handler).
- **Not made offline:** AI practice chat + pronunciation coaching fundamentally need the LLM. They show network errors offline by design (offline.html explains this). Graceful in-app offline-mode UI for those was scoped out.
- New `public/offline.html` (Chai-Galli-styled static fallback). Manifest gained `id`/`scope: "/"`.
- **Progress is local-only — no sync, nothing to flush.** All progress/activity (streak, lesson completion, daily active-minutes ticker, quiz scores, mistakes, favorites, vocab, Dutch attempts, Chaina memory) writes synchronously to `localStorage` regardless of connectivity, so offline progress is committed instantly and never queued or lost — there is no online→offline sync step because there is no server/DB. The SW's Cache API is fully separate from `localStorage`. The (by-design) tradeoff is **no cross-device sync**: progress is per-browser/per-device. Adding multi-device sync would require an account + backend, which the app deliberately doesn't have.

**2026-06-01 wave — Fun-pass: combo escalation + mascot barks + ambient soundscapes**

Three additive audio features layered on the now-shipped ElevenLabs pipeline. All gated by the existing global mute; combo works on pure synth immediately, barks + ambient play once their clips are generated (same generate-then-commit pattern as the voices) and are silent no-ops until then.

- **Combo / streak audio escalation** (`lib/sounds.ts` `playCombo(streak)`). A run of consecutive correct answers climbs a C-major-pentatonic ladder (rising note per correct, sparkle every 5th) — Duolingo combo energy. Pure synth on purpose (pitch is dynamic, can't be a pre-rendered clip). Wired into `/quiz` and `/drill/conjugation`: caller keeps a `combo` counter (reset on wrong / on (re)start); single correct keeps the satisfying reward ding, 2+ escalates.
- **Mascot barks** (`lib/chaina-voice.ts` `bark(locale)`). Tiny wordless voiced interjections (हम्म!, ओहो! / Hè!, Oho!) in each mascot's own voice. Picks one of `BARK_COUNT` (4) random clips: `hi` → `/chaina/bark-<n>.mp3`, `nl` → `/stroopwafel/bark-<n>.mp3`. No text fallback (barks are wordless) → silent if no clip. Wired to the vocab "I know this" right-swipe (`/vocabulary/[category]`) — a positive beat with no Chaina popup, so the bark adds personality without competing with the moment system's voice. (The home-header mascot tap is left as the full `play('tap')` popup + speech line, unchanged.)
- **Ambient soundscapes** (`lib/ambient.ts`). A faint looping background bed per track — chai-stall hum (Hindi) / café terrace (Dutch). **Opt-in, OFF by default**; toggle in `/settings` ("ambient on/off" under the sounds section). Low volume (0.14) with fade in/out, loops, respects the global mute, starts on a user gesture (the toggle tap, or first pointerdown on home). `startAmbient(track)` / `stopAmbient()` / `isAmbientOn()` / `setAmbientOn(on, track)`. Home mounts/stops it per the `language` and keeps it in sync with the home mute pill. Clips: `public/audio/ambient/{hindi,dutch}.mp3`. TDD'd (`__tests__/lib/ambient.test.ts`, 5 tests).
- **Generator** (`scripts/generate-audio.mjs`): new `ELEVEN_AMBIENT=1` flag → 22s loopable soundscapes via the Sound Effects API (`/v1/sound-generation`); barks fold into the existing `ELEVEN_VOICE_HI` / `ELEVEN_VOICE_NL_MASCOT` runs (`BARKS` map → `tts()`). Keep `BARK_COUNT` in `lib/chaina-voice.ts` in sync with the number of `BARKS` lines.

**To generate the new clips** (same pattern as the voices — run locally with a paid key, listen-check, commit the mp3s):
```
ELEVENLABS_API_KEY=… ELEVEN_VOICE_HI=<hindi-female> ELEVEN_VOICE_NL_MASCOT=<dutch-male> \
ELEVEN_AMBIENT=1 node scripts/generate-audio.mjs
```
Commit `public/chaina/bark-*.mp3` + `public/stroopwafel/bark-*.mp3` + `public/audio/ambient/*.mp3`.

**2026-05-29 — ✅ DONE: ElevenLabs natural voices (pipeline shipped + clips generated)**

All app audio can now use natural **ElevenLabs** voices, **pre-generated once** into static mp3s (no runtime cost/latency, offline-capable), with live Google TTS → `speechSynthesis` as the automatic fallback. The pipeline shipped *and* the clips are generated and committed.

**Generator** — `scripts/generate-audio.mjs`, each set gated on its own env var (run any subset):
  - `ELEVEN_VOICE_NL` → Dutch "Sounds" module + Dutch lesson/foundation "hear it" phrases → `public/audio/{sounds,nl}/<hash>.mp3`, manifests `content/dutch/sounds-audio.json` + `content/nl-audio.json`.
  - `ELEVEN_VOICE_HI` → Chaina mascot moment lines (Devanagari-fed for accent) → `public/chaina/<momentKey>-<idx>.mp3`; **plus** Hindi lesson "hear it" phrases → `public/audio/hi/` (`content/hi-audio.json`, needs `content/hi-translit.json`) and the Hindi "Sounds" module → `public/audio/hi-sounds/` (`content/hindi/sounds-audio.json`).
  - `ELEVEN_VOICE_NL_MASCOT` → Mr. Stroopwafel mascot lines (Dutch `LINES_NL` variant where present) → `public/stroopwafel/<momentKey>-<idx>.mp3`.
  - `ELEVEN_SFX=1` → designed UI sound pack (tap/correct/wrong/complete/swipe/streak/levelup/pop) via the Sound Effects API → `public/audio/sfx/<type>.mp3` (`content/sfx-audio.json`). `lib/sounds.ts` prefers these, falls back to the Web-Audio synth.
  - Idempotent (skips existing), `--force` to regenerate. Two ElevenLabs APIs: `/v1/text-to-speech/{voice}` (voices) and `/v1/sound-generation` (SFX + ambient).

**Playback wiring (all with graceful fallback):**
- `lib/speech.ts` — content TTS; prefers a generated clip via the per-language manifests, else `/api/tts` (Google) → `speechSynthesis`.
- `lib/chaina-voice.ts` `play(key, idx, fallbackText, locale)` — `hi` → `/chaina/`, `nl` → `/stroopwafel/`; missing clip → Google TTS → `speechSynthesis`.
- `lib/sounds.ts` — designed SFX clip → synth fallback.

**Status:** clips are generated and committed (≈37 Chaina + 48 Stroopwafel mascot lines, 93 Dutch Sounds, plus Hindi/Dutch lesson + Hindi Sounds + SFX packs). The earlier free-tier proxy blocker was resolved by generating with a paid key. **Security:** the key is used only at generation time — never committed, never shipped (clips are static). Rotate any key pasted into a session.

**2026-05-29 wave — Dutch "Sounds" from-zero pronunciation module**

- New standalone Dutch module teaching pronunciation from absolute zero: an 8-stage ladder (alphabet → short vowels → long vowels/doubling → consonants+twists → guttural g/ch/sch → compound vowels → blending → linking). Spec at `docs/superpowers/specs/2026-05-29-dutch-sounds-pronunciation-design.md`.
- Each sound carries one A0-easy **anchor word** (huis, boek, melk, water…) reused as the Stage 7 blend targets. Three practice modes: listen-&-repeat + got-it self-check (every stage), minimal-pair ear-quiz (TTS a word, pick which you heard), and a sound-by-sound blend builder.
- **Rolling unlock:** completing a stage opens the next two (`order <= maxCompletedOrder + 2`; stages 0,1 open initially). Stage completes when all cards got-it + ear-quiz passed + blend words built.
- `lib/dutch/pronunciation.ts` (TDD'd, 9 tests) + `content/dutch/pronunciation-course.json` (8 stages). Routes `/dutch/sounds` (ladder) + `/dutch/sounds/[stageId]` (stage screen). Audio = Google TTS via `lib/speech.ts` (`speak(word, 'nl')`).
- New `pronStageDone` Chaina moment (Dutch lines) + Confetti on stage completion. A prominent orange "Sounds — learn to speak from zero" card on the Dutch home (after the goal banner, before the path), showing `N/8 stages`.
- **Phase 2 (not built):** each card isolates one sound, so a 🎙 record-and-compare button is a clean per-card drop-in later (Web Speech STT in nl-NL). Phase 1 is TTS/listen/repeat/quiz only. Dutch-only for now.

**2026-05-27 wave — Per-language mascot voice + greeting (bug-fix)**

- **Chaina voice now uses Google TTS.** `lib/chaina-voice.ts` previously fell back to raw browser `speechSynthesis` (basic robotic voice). Its fallback now routes through the app's Google `/api/tts` proxy (same pipeline as `lib/speech.ts`), with browser synth only as a last resort. New `speakGoogle(text, locale)` + a `locale` param on `play()`.
- **Mascot lines are language-aware.** All generic moment lines were Hinglish and fired on both tracks, so Mr. Stroopwafel spoke Chaina's lines ("I am Chaina", "namaste dost", "shabash") on the Dutch track. Added a `LINES_NL` Dutch variant set for the 17 generic moments; `pickLine(key, lang)` serves Dutch lines when `lang === 'dutch'`. Dutch-only moments (knm/lezen/luister/a2) keep their single Dutch `LINES`. `MomentStage` passes the active language + `config.ttsLocale` through (via refs, so the stable `play` callback isn't recreated).
- **"Chaina" pronunciation fix:** spoken strings spell it `Chai na` (display stays `Chaina`) so TTS says "chai-na" not "china".
- **Home greeting tag is themed:** `useTheme()` gained `greetingTag` — Hindi `☼ namaste, dost`, Dutch `☼ hoi, alles goed?`. The home header tag was hardcoded Hindi for both languages.

**2026-05-27 wave — Dutch Luisteren (Listening) module**

- New exam-track module at full Lezen parity: `lib/dutch/luisteren.ts` (loader + `buildAudioScript` + `drawMockSet(5)` + 80%-pass scoring + studied/attempt tracking; TDD'd, 14 tests), `content/dutch/luisteren.json` (10 clips: 4 A1 / 4 A2 / 2 B1, mix of monologues + short dialogues, each with `lines[]` + 4 bilingual MCQs).
- 3 routes: `/dutch/luisteren` (tiered module home), `/dutch/luisteren/[clipId]` (study mode — TTS player + hidden transcript with "show transcript + translation" reveal + question cards + mark-studied), `/dutch/luisteren/mock` (25-min timed, 5 clips audio-only, 20 Qs, ≥80% pass).
- **Audio = TTS** (no native recordings): `speak(buildAudioScript(clip), 'nl')` via `lib/speech.ts`. Play/stop/replay only (no scrubbing). Transcript hidden by default (exam-realistic); revealed transcript labels dialogue speakers + shows greyed English per line.
- 2 new Chaina moments (`luisterStudyDone`, `luisterMockPassed`, Dutch lines). Home "Listening / Luisteren" SkillCard flipped from `soon` to live with a `${studied}/10 studied` count. Storage keys `dutch-luisteren-studied` + `dutch-luisteren-mock-attempts`.

**2026-05-27 wave — Dutch foundation theory upgrade (parity with Hindi)**

- Applied the full Hindi treatment to all 7 Dutch foundations (01-numbers, 02-pronunciation, 03-present-tense, 04-de-het, 05-word-order, 06-past-tense, 07-modals): plain-words-first jargon ("the helper verb (auxiliary)", "the diminutive (the little/cute `-je` form)", "verb-second"), one idea per sentence, dense sentences split into bullet lists, Dutch tokens chipped, key terms bolded, **zero em-dashes**, de-clichéd, varied rhythm. Covered all theory text surfaces: 7 intros + 35 section bodies + 35 cutting_intro bubbles + 7 wrap-ups (84 strings).
- All Dutch grammar + example tokens preserved verbatim (only the English explanatory prose changed): kofschip rule, hebben-vs-zijn, V2 inversion + dropped-`-t`, de/het diminutive rule, half-hour-backwards time, the 21-99 inversion all intact.
- Done directly in-session (no subagents) via one data file + apply script; validated all headings/indices matched, all JSON re-parsed, zero em-dashes. The 16 foundations (9 Hindi + 7 Dutch) now share one readable, de-AI'd voice.

**2026-05-27 wave — Theory prose readability**

- `Paragraph` in `components/lesson/TheoryView.tsx` now parses an inline markdown subset via a pure `renderInline()` helper: `` `token` `` → butter-bg Hindi-token chip (fixes the long-standing literal-backtick bug across all 16 chapters), `**bold**` → bold key term, lines starting with `- ` → grouped bullet list. No schema change — the markup lives in the existing `body` string. Both languages benefit immediately.
- Plain-language rewrite of all 9 Hindi foundation theory bodies (01-numbers … 09-ne-rule): plain-words-first jargon ("the ending (suffix)", "the helper word (auxiliary)"), one idea per sentence, dense "A does X; B does Y" sentences split into bullet lists, every Hindi token chipped, key English terms bolded. `02-present-tense` hand-written as the style exemplar; the other 8 via parallel Sonnet subagents following it. **All grammar preserved** — clarity/delivery pass only, no rule simplified or dropped (ne ergative edge cases, fem-plural irregularity, compound-verb auxiliaries, aap-plural all intact). Only `theory.sections[*].body` touched; cutting_intros, tables, examples, callouts, quick-checks unchanged. The 7 Dutch foundations are deferred to a later pass.

**2026-05-27 wave — Themed home header band**

- Extended `useTheme()` with `bandFrom` / `bandTo` colors. Home page header gradient was previously hardcoded `peach → peach2` for both languages. Now: Hindi → soft `rose (#f6b6c0) → cream (#fff3cf)` (matches Holi pink brand); Dutch → `peach → peach2` (unchanged, fits Dutch orange).
- Only `app/page.tsx` consumes the band tokens — other routes have their own per-page colors (progress=lav, vocab=mint, quiz=mint, lessons=palette-derived) which stay constant across languages.
- Onboarding's peach→butter gradient is unchanged (intentionally Hindi-coded pre-language-pick).

**2026-05-27 wave — Theory recitation + phrase↔theory de-dup audit (16 foundations)**

- TTS "hear it" button added to every theory `ExampleBlock` in `components/lesson/TheoryView.tsx`. Locale-aware via `useLanguage().config.ttsLocale`; uses the existing `lib/speech.ts` (Google `/api/tts` → browser `speechSynthesis` fallback). Applies to all 16 foundations automatically.
- Parallel Sonnet subagent audit across all 16 foundations: each compared `phrases[*].hindi` (Dutch field is also `hindi` for legacy reasons) against every `theory.sections[*].examples[*].hindi`, flagged near-identical pairs, rewrote the **phrase** (not the theory example) for ~25 redundancies total across Hindi 01-numbers, 02-present-tense, 04-future-tense, 05-postpositions, 06-pronouns-verbs, 08-compound-verbs + Dutch 01-numbers, 06-past-tense, 07-modals. Hindi 03-past-tense and others were clean. Each rewrite kept the original pedagogical purpose.

**2026-05-27 wave — Uniform DONE badge on lesson cards**

- `components/design/LessonStickerCard.tsx` previously showed relative-time labels on completed lessons (`✓ done today`, `✓ yesterday`, `✓ 2 days ago`, `✓ last week`, `✓ N wks ago`) — but they made some completed lessons look "stale" next to others. Collapsed to a single `✓ DONE` badge. The completion timestamp is still stored in `progress.lessonCompletedAt`; only the card label is simplified. Recent-activity dates (timeline events on `/progress`) and KNM/Lezen attempt dates kept their relative-time formatting (timeline ≠ completion-state).

**2026-05-27 wave — Settings page + long-press daily-goal shortcut**

- New `/settings` route (`app/settings/page.tsx`) reachable from a gear icon on the `/progress` header. Editable controls: daily goal (5/10/15 preset chips + custom number), name, gender, reason (4-chip grid), sound mute toggle (slider switch), language toggle (hindi/dutch pill), and a 2-step red "reset progress" danger zone that wipes the current language's `${prefix}-*` localStorage keys (preserves the user profile).
- Long-press (500ms) on the home daily-goal pill opens a butter bottom-sheet quick-edit with the 3 presets + a `more settings →` link. Vibration nudge on trigger, Esc/backdrop dismiss.

**2026-05-27 wave — Per-language theme + mascot split**

- New `useTheme()` hook + `<Mascot>` wrapper component (`components/design/theme.ts`, `components/design/Mascot.tsx`). Resolves brand identity from the active language: Hindi → Holi pink (`#d63f8b` / `#f37bb1`) + Cutting; Dutch → orange (national color) + Mr. Stroopwafels.
- New `MrStroopwafel.tsx` mascot: caramel-bronze waffle disc with 4×4 ink-grid crosshatch, cream face panel, round black sunglasses (cream sparkle dots inside), thick ink handlebar mustache, and a thin darker-caramel filling sliver peeking out the bottom edge. Same 7 mood set as Cutting (`idle/happy/wave/sympathy/wink/excited/sleepy`). Sleepy mood gets a floating `Zz` glyph; excited gets lens-starbursts; wink lifts one sunglass to reveal an eye underneath.
- ~40 brand-primary call sites flipped from hardcoded `COLORS.orange*` to `theme.primary*` across home / progress / vocab / quiz / practice / mistakes / drill / settings / favorites / daily-review / voice-button / notification-prompt / layout-shell / feature-tooltip / bottom-nav / story-reader / MomentStage / LessonStickerCard / LessonChaiGalli / TheoryView / quiz-card / quiz-results / ChaiGalliChatMessage / StreakChip.
- Lesson palette tiles, motif backgrounds (rickshaw/marigold/chai/etc.), status semantics (green = correct/done, red = wrong, butter = review), Nani/NaniHouseScene/Cutting illustrations, and the onboarding flow (intentionally Hindi-coded) are unchanged.
- Cutting unchanged; existing imports of `Cutting` swapped to `Mascot` everywhere except `/_dev/components` (which shows both), `onboarding/page.tsx` (intentionally always Cutting), and Hindi story characters (`Cutting` plays the chaiwala — it's a story character, not a brand mascot).

**2026-05-27 wave — Vocab archive with replacement**

- New per-language archive primitive (`lib/vocab-archive.ts`, 15 tests). Right-swipe on a vocab card on `/vocabulary/[category]` now archives instead of just sorting to the bottom — the card collapse-fades out and the next unarchived word from the category pool slides in (visible list capped at 10).
- Header gains a `🃏 N fresh · N archived` deck-health pill. Below the deck, a collapsed-by-default archived fold with tap-to-restore. When a category fully archives, the deck swaps for a celebration empty state with "show archived" + "other categories" CTAs.
- `/vocabulary` grid shows a mint `✓ K` archive-count chip beside each category's word count.
- One-shot `scripts/generate-vocab.mjs` (modeled on `scripts/generate-lesson.mjs`) drafts ~35 new words per category via Gemini, writes to `content/vocabulary-draft.json` for user review. Run per category, merge approved entries into `vocabulary.json`. Target: ~300 total words once all 6 categories are expanded.
- Legacy global `vocab-known` is preserved read-only; migration runs additively on every category page mount (idempotent).

**2026-05-26 wave — Content quality audit + improver tool**

- New reusable audit tool: `docs/audits/CONTENT_RUBRIC.md` (the rubric — accuracy axes for Hindi/Dutch grammar + romanization + pedagogical correctness + cultural facts; style axes for de-AI-ing, tightening, voice match; auto-apply vs report policy), `scripts/audit-content.mjs` (dispatcher — lists 57 audit units, builds per-unit subagent prompts, aggregates reports into a master summary), `docs/audits/COMMAND.md` (slash-command spec for re-runs).
- Ran the inaugural audit on all 57 content units (10 Hindi situations + 11 Dutch lessons + 9 Hindi foundations + 7 Dutch foundations + 3 Hindi stories + 6 KNM category batches + 10 Lezen texts + 1 Hindi vocab) via parallel Opus subagents in batches of ~8-10.
- Outcome: 111 auto-applied fixes across 44 files; 143 items flagged for user review across 47 files; 4 truly clean files. Master summary at `docs/audits/2026-05-26-audit-summary.md`; per-file reports under `docs/audits/runs/2026-05-26/`.
- Critical accuracy bugs caught + fixed: outdated Dutch civic law (KNM healthcare 5-day abortion waiting period — abolished Jan 2023), `zijn` meant "their" instead of "his" in Dutch present-tense culture_notes, demonstratives taught backwards in Dutch de/het lesson, `zullen` conjugation listed as zal/zal/zal (correct: zal/zult/zal), `Europa` mis-transcribed as `ay-ROH-pa` (Dutch `eu` is /øː/) on the very row teaching the eu sound, separable verb `bellen` mis-labeled (should be `opbellen`), Hindi `ke pehle` taught for "before" (Hindi uses `se pehle`), Hindi story used wrong case `usse` (ablative) instead of `use` (dative), Hindi ordinal rule said `chautha` formed by `-vaan` (it's irregular).
- Style fixes throughout: AI cliché openers stripped, romanization normalized across files (`acchhi`→`acchi`, `dusra`→`doosra`, `kartaa`→`karta`, `wo`→`woh`, `ham`→`hum`).

**2026-05-26 wave — Foundation theory chapters (now all 16 foundations)**

- v1 shipped Noun Gender as the pilot. v2 added: paged-deck navigation (one section per page, swipe transitions via Framer Motion AnimatePresence, top progress dots, fixed bottom prev/next nav), Cutting narration in a speech bubble at the top of each section page (1-sentence `cutting_intro` field per section), and quick-check micro-quizzes gating the `next →` button per section (new `quick_check` field with `question` + `options[]` + `correct_index` + optional `explanation`).
- All 16 foundations now have theory chapters: 9 Hindi (numbers, present tense, past tense, future tense, postpositions, pronouns+verbs, noun gender, compound verbs, ne-rule) + 7 Dutch (numbers, pronunciation, present tense, de/het, word order, past tense, modals). 16 chapters × 5 sections = 80 textbook-style sections with intros + bodies + tables/examples/callouts + cutting_intros + quick_checks + wrap-ups.
- Authored via 8 + 7 parallel Opus subagents (~15 chapter authoring runs in two batches).
- UX additions: scroll-to-top on page transition; wrap-up page now offers DUAL CTAs (`try the phrases →` + `or — chat with me to practice 💬` to skip directly to AI practice); celebratory "🎉 shabash!" headline + full-screen Confetti burst on reaching wrap-up; `📖 chapter` button in the phrase-view header lets users revisit the chapter from any phrase.
- Behavior matrix: fresh open → theory; mid-lesson resume → phrases (continue); completed → theory (re-read); manual chapter button → theory from anywhere.
- Schema: `Theory { intro, sections, wrap_up? }`, `TheorySection { heading, body, cutting_intro?, quick_check?, table?, examples?, callout? }`, `QuickCheck { question, options, correct_index, explanation? }`. All optional — lessons without theory keep the legacy phrase-only flow.

**2026-05-26 wave — Practice prompt upgrade (29 lessons)**

- All 10 Hindi situations + 9 Hindi foundations + 5 Dutch casual lessons + 7 Dutch foundations + a refinement pass on the 6 newer Dutch exam-targeted lessons + 2 newer Hindi foundations got their `practice_prompt` upgraded via 29 parallel Opus subagents.
- Old prompts were 30-100 char one-liners (scene descriptions). New prompts are full ~150-200 word tutor/character configs with: explicit AI persona ("You are [role] at [setting]..."), register choice (aap/tum/tu for Hindi; u/je for Dutch) with rationale, verbatim opening line in target language, behavioral guidance grounded in the lesson's actual phrases + grammar, explicit `[[CORRECTION: original="..." correct="..." reason="..."]]` tag format for the practice page's mistake parser, 6-8 turn arc with a natural ending.
- Hindi foundations use a TUTOR persona (drill 1 task at a time, score, give next); Hindi situations + Dutch lessons use CHARACTER personas (auto driver, chaiwala, mother, GP, NS ticket counter, bank teller, etc.).

**2026-05-26 wave — Daily goal celebration + UX fixes**

- Daily goal celebration: when today's active-minutes cross the user's `dailyGoal` (default 5 min), wherever they are in the app: full-screen Confetti + levelup sound + Cutting Chaina moment + a big centered modal card (Cutting 120px excited + "🎉 Daily Goal Done!" 30px orange headline + "wah, shabash dost!" + body interpolating the user's actual goal + "keep going →" orange CTA). Auto-dismiss after 5s; tap backdrop / press Escape / tap CTA all dismiss. Gated once-per-day via `${prefix}-daily-goal-fired:YYYY-MM-DD` localStorage flag. Detection lives in LayoutShell's existing 30s active-tick.
- Bug fixes:
  - Practice page "your scene" card was rendering the raw `practice_prompt` (AI system config visible to users) — swapped to `lesson.situation` (user-facing scene).
  - "chapter complete — practice it now" green sticker was a non-interactive display element — now navigates to `/practice/[id]` on tap.
  - Mark-complete now gated on every phrase being revealed (was tappable on the last phrase even if user skipped through).
  - "DONE · 4D" cryptic badges → readable "✓ done today" / "✓ yesterday" / "✓ 4 days ago" / "✓ last week" / "✓ N wks ago".
  - Progress page: completed lessons render inline with 100% GREEN bars (no longer collapsed), labeled "✓ COMPLETED (N)" + "STILL TO DO (N)" section headers; 0% rows show "not started" italic instead of "0%"; new tab pill toggles between Situations + Foundations to halve the page height.
  - Theory pages: scroll-to-top on page transition (quick-check was at the bottom, leaving users mid-page on the new section).

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
- ~~Theory chapters only on 1 foundation (Noun Gender pilot)~~ — all 16 foundations now have textbook chapters with Cutting narration + quick-checks.
- ~~practice_prompt fields are weak one-liners on most lessons~~ — 29 lessons upgraded to full ~150-200 word AI tutor configs with persona, register, opening line, lesson-vocab integration, and correction tag format.
- ~~No automated content quality check~~ — `/audit-content` tool + rubric + dispatcher shipped (see docs/audits/COMMAND.md). Inaugural run audited all 57 content units, applied 111 fixes, flagged 143 items for review.

Still open:
- **143 audit items flagged for user review** — see `docs/audits/2026-05-26-audit-summary.md`. Mostly pedagogical-meaning calls the subagents declined to make unilaterally (e.g., should "habitual past" example use `theen` or `thi` for fem-plural? Should KNM question simplify constitutional fact for exam-prep purposes?). Triage at user's pace.
- **No XP / leveling arc** — `phrasesLearned` is just a stat tile, no progression visual.
- **No audio assets** — only browser TTS. Native recordings would matter most for Phase 3 Luisteren (Dutch listening drills).
- **Conjugation drill is verb-by-verb** — no mixed-verb sets, no spaced-repetition wiring.
- **Dutch Phase 3-6 still pending:** ~~Luisteren (Listening)~~ shipped 2026-05-27 (TTS-based, full Lezen parity). Schrijven (Writing), Spreken (Speaking), Mock-exam still pending — each gets its own spec → plan → ship cycle.
- **OV-chipkaart references in Lezen text 007** — system is being phased out in favor of OVpay (2023-2025). Naar Nederland A2 still uses this material so the audit flagged but didn't auto-rewrite.
- **KNM date-anchored facts** ("AOW age 67 in 2026", "eigen risico €385", etc.) drift out of date annually. Worth a scheduled re-audit.

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
1. **Cross-device progress sync** (parked 2026-06-03 — design agreed, not built). Today all progress is local-only `localStorage`, so it can silently vanish on browser/iOS data-eviction or when switching devices (this bit the user after the offline-cache work, though caching wasn't the cause — there's just no backup). Add optional sync so progress survives across devices.
   - **Backend:** Supabase (chosen by user). One table e.g. `sync(key text primary key, data jsonb, updated_at timestamptz)`. User sets up the project + adds `SUPABASE_URL` + a service/anon key as Vercel env vars (never commit keys). API route `app/api/sync/route.ts` (GET fetch blob by key, PUT upsert).
   - **Identity: DECISION STILL OPEN.** Recommended = a "sync code" (a generated passphrase like `chai-marigold-otter-37` entered on each device, no email/login; data stored under a hash of the code; pseudonymous). Alternative = real email accounts (heavier, against the no-auth ethos). Confirm before building.
   - **Merge = smart-merge, never last-write-wins:** union of `completedLessons`/favorites/mistakes/seen-lessons/vocab sets, max of streak + counters + `todayActiveMs`, newest-by-timestamp for profile/settings. So neither device loses progress.
   - **Scope:** `lib/sync.ts` (snapshot all `${prefix}-*` + global `hindi-user-profile` keys → blob; restore; merge), `app/api/sync/route.ts` (Supabase), Settings "sync" section (generate/enter code, "Sync now", last-synced time, on/off), auto-sync on app open + on background (`visibilitychange`). TDD the merge logic.
   - **Note:** this is the only real protection against the local-only data-loss risk; everything else (offline cache) is orthogonal.

2. **Vercel preview deploys** — Link the GitHub repo to Vercel so every PR
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
