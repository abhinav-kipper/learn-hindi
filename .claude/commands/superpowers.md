# /superpowers — Brainstorm next small meaningful feature

Use this to generate a focused list of quick-win feature ideas grounded in the actual codebase state.

## What to do

1. **Read the codebase state** — scan CLAUDE.md, skim `app/page.tsx`, `components/`, `lib/progress.ts`, and `lib/phrase-progress.ts` to understand what already exists. Do not suggest things that are already built.

2. **Brainstorm 5 ideas** using these constraints:
   - **Small** — one dev session, touches ≤3 files
   - **Meaningful** — improves the learning loop, motivation, or delight
   - **Quick** — no new dependencies, no backend, no DB
   - Leverage existing utilities (progress, streaks, phrase-progress, personalization, sounds, framer-motion) — the infrastructure is already there

3. **For each idea output:**
   - One-line title
   - What it does for the user (1 sentence)
   - Which existing file/function it builds on
   - Rough effort: S / M

4. **Pick your top recommendation** and say why in one sentence.

5. **Ask the user which one to ship** — then immediately run `/ship <idea>` on their answer.
