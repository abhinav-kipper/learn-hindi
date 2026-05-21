# /ship — Think → Code → Deploy

Use this command to take a feature or fix from idea to production in one flow.

## Arguments
`$ARGUMENTS` — describe what to build or fix (e.g. `/ship collapse completed lessons on home screen`)

## Workflow

### 1. Think
Before touching any code:
- Re-read CLAUDE.md for project conventions
- Read every file you'll need to change (use Read, not grep guesses)
- State your plan in 2–3 sentences: what changes, which files, any edge cases
- If something is ambiguous, ask before coding

### 2. Code
- Make the smallest change that solves the problem — no extra abstractions, no speculative refactors
- Edit existing files; don't create new ones unless truly necessary
- No comments unless the WHY is non-obvious
- After editing, re-read changed files to verify correctness

### 3. Deploy
Once the code is right:
```bash
# Stage only the files you changed
git add <specific files>

# Commit with a clear message describing the WHY
git commit -m "short description of what and why"

# Push to main — GitHub → Vercel auto-deploys
git push origin main
```

**Key facts for this repo:**
- GitHub is connected to Vercel — pushing `main` triggers a production deploy automatically
- Do NOT run `vercel --prod --yes` — just push to `main`
- pnpm is required for Vercel (not npm)
- Deploy takes ~1 min; user can watch progress in Vercel dashboard

## Done
Tell the user: what changed, which file(s), and that a deploy was triggered by the push to main.
