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
app/                    → Pages (dashboard, lessons/[id], practice/[id], api/chat)
components/             → UI components (lesson-card, phrase-card, skill-breakdown, chat-message, etc.)
lib/                    → Utilities (progress.ts, lessons.ts, system-prompt.ts)
content/lessons/        → 6 JSON lesson files
types/                  → TypeScript interfaces
public/                 → PWA manifest, icon.svg
```

## Common Tasks

### Add a new lesson
1. Create `content/lessons/07-topic-name.json` (follow existing lesson structure)
2. Import and add to array in `lib/lessons.ts`

### Modify AI behavior
Edit `lib/system-prompt.ts` — the `buildSystemPrompt()` function generates the system prompt from lesson data.

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

## Current App State (deep map — updated 2026-05-21)

**Pages**
- `/` Home: greeting, streak chip, mute, "Continue" CTA, Situations/Foundations tabs, lesson cards (collapsed for completed)
- `/lessons/[id]` Lesson flow: intro → swipeable phrases → CTA. Confetti + `levelup` sound on Mark Complete
- `/practice/[id]` AI chat (custom `useChat`, streaming text). Tutor emits `[[CORRECTION: original="…" correct="…" reason="…"]]` tags, stripped from UI and saved as mistakes
- `/quiz` Multiple-choice quiz. Wrong answers also get logged as mistakes
- `/progress` Stats dashboard: streak with 7-day calendar, phrases learned, practice count, quiz avg, lesson %, recent activity (last 5 quiz/review)
- `/mistakes` Read-only list grouped by lesson, with delete + clear-all
- `/vocabulary` Per-category vocab with swipe-to-mark known/review
- `/onboarding` Name, daily goal, reason (family/bollywood/moving/curious)

**Libraries already built**
- `lib/progress.ts` — completedLessons, currentStreak, lastActiveDate, practiceSessionCount
- `lib/phrase-progress.ts` — per-phrase viewed indices, `getLessonPercent`, `computeLessonResume`
- `lib/review.ts` — **full SM-2 lite SRS** (interval, easeFactor, nextReviewAt). Powers daily review popup
- `lib/mistakes.ts` — `[[CORRECTION:]]` extraction, capped at 200, source = 'practice' | 'quiz'
- `lib/vocab-review.ts` — separate known/review sets for vocab swipe UI
- `lib/personalization.ts` — onboarding reason reorders Hindi lessons (family/bollywood/moving/curious)
- `lib/sounds.ts` — 8 generative Web Audio sounds (tap, correct, wrong, complete, swipe, streak, levelup, pop). Mute toggle persisted
- `lib/last-active-lesson.ts` — powers Continue CTA
- `lib/quiz.ts` — quiz scores, average

**Components already built**
- `daily-review-popup.tsx` — bottom-sheet, fires every 24h after first lesson complete, mixes vocab + lesson phrases through SRS
- `streak-counter.tsx` — chip with flame, updates streak on mount (no milestone celebration yet)
- `feature-tooltip.tsx` — one-time tooltip system (uses localStorage to dismiss)
- `notification-prompt.tsx`, `install-prompt.tsx` — push + PWA install
- `lesson-flow/section-cta.tsx` — has confetti + `levelup` on complete already
- `voice-button.tsx`, `read-aloud-button.tsx`, `lib/speech.ts` — TTS playback

**Gaps worth filling**
- Streak chip shows number but no milestone badge / celebration at 7/14/30/100 days
- `practiceSessionCount` is incremented but never visualized as today's daily-goal progress (the 5-min goal is just text)
- Mistakes page is read-only — mistakes are the highest-value content but never get drilled. SRS infrastructure (`review.ts`) exists, mistakes don't plug into it
- Collapsed lesson card only shows the title — no "last practiced X days ago" or practice count for completed lessons
- No total-XP arc or level — `phrasesLearned` is just a stat tile

## Known Quirks
- Vercel CLI spams `ECONNRESET` errors from a broken plugin — ignore them
- Must use pnpm for Vercel deploys (npm install crashes on their infra)
- `ai` SDK v6 has no `useChat` hook export — custom implementation in practice page
- Node 20.x pinned in engines (Vercel compatibility)
