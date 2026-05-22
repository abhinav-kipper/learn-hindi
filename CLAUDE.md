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
