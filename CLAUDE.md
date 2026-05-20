@AGENTS.md

# Bolna Seekho — Hindi Learning App

## Project Overview
A PWA for learning conversational/colloquial Hindi (romanized, no Devanagari). Built for one user initially, scalable later.

**Live:** https://hindi-app.vercel.app
**Deploy:** `vercel --prod --yes` (uses pnpm)

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
vercel --prod --yes
```

## Environment Variables
- `GOOGLE_GENERATIVE_AI_API_KEY` — Gemini API key (set in .env.local locally, Vercel env for prod)

## Known Quirks
- Vercel CLI spams `ECONNRESET` errors from a broken plugin — ignore them
- Must use pnpm for Vercel deploys (npm install crashes on their infra)
- `ai` SDK v6 has no `useChat` hook export — custom implementation in practice page
- Node 20.x pinned in engines (Vercel compatibility)
