# Visual regression — e2e/

Playwright snapshot tests covering the Big 5 routes × 2 seed states (home, lesson, practice, quiz, progress).

## First-time bootstrap (one-off, locally)

The Chromium browser binary is **not** committed to git and isn't reachable from the Claude Code on-the-web environment (allowlist blocks `cdn.playwright.dev`). To generate baseline screenshots:

```bash
# from repo root
pnpm exec playwright install chromium
pnpm run test:visual:update
git add e2e/visual.spec.ts-snapshots/
git commit -m "test(visual): commit baseline screenshots for Big 5 routes"
git push
```

After this one-time step, CI compares all subsequent PRs against the committed baselines.

## Daily workflow

| Situation | What to do |
|---|---|
| Made an intentional visual change to a Big-5 route | Run `pnpm run test:visual:update`, eyeball the new screenshots, commit alongside your code change. |
| CI reports a visual diff you didn't expect | Download the `visual-diff` artifact from the failed workflow run, eyeball the diff PNG. If the change is wanted: re-baseline locally (`--update-snapshots`) and commit. Otherwise: fix the regression in your code. |
| Adding a new Big-5 route | Add a `test(...)` block to `visual.spec.ts`, run `--update-snapshots` to generate the new baseline, commit. |

## Seeds

Snapshots seed `localStorage` from JSON fixtures so each route renders in a known state:

- `seeds/fresh.json` — onboarded user, zero progress, mute on, Chaina disabled
- `seeds/mid-progress.json` — 3 completed lessons, 7-day streak, 1 mistake, 1 quiz score

To add a new seed: drop a JSON file in `seeds/`, register it in `helpers.ts`, use via `seedAndGoto(page, '<name>', '/route')`.

## Why the baselines aren't in git from day one

This was set up in a remote sandbox without browser-binary network access. The very first developer with a local environment runs `--update-snapshots` once, commits the resulting PNGs, and the regression check becomes self-sustaining.
