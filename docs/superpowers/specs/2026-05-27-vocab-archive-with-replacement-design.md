# Vocab archive with replacement — design

**Date:** 2026-05-27
**Status:** Brainstormed, design approved, plan TBD
**Track:** Hindi vocabulary (Dutch lifts later for free)

## Problem

The user's partner (the app's primary learner) already knows many of the 100 vocab words in `content/vocabulary.json`. The existing per-category page (`/vocabulary/[category]`) renders all 15-20 words in a single vertical list, and a right-swipe today just sorts the card to the bottom with a mint tint — it doesn't hide it. There's no way to declare a word "done, don't show me this again," and there's no mechanism for the pool to deepen as known words drain away. The category-explored counter ("16 / 100") creeps up on tap-flip, but the deck never *feels* fresher.

The result: an advanced learner sees mostly noise. Cards she knows by heart take up screen real estate next to the handful she doesn't, and the swipe gesture doesn't get her closer to "new things to learn."

## Goal

Add an **archive** primitive that actually hides known words from the active deck, and pair it with a **content-pool expansion** so when she archives, a fresh unarchived word slides in to take its place. The replacement is the emotional payoff — the reason to swipe.

## Non-goals (deferred)

- Lesson-level archive. Easy lessons are a real pain too, but the data primitive shipped here will lift to lessons later. Out of scope for this ship.
- Bulk-archive triage screen (tap a grid of words to archive 30 at once). Possible follow-up if the swipe-archive rate is too slow in practice.
- Swipe-to-restore from the archived fold. Restore is tap-only — accidental re-archive is a worse failure than an extra tap.
- New vocab categories. The existing 6 (everyday / emotions / food / people / time / actions) stay.
- Spaced-repetition reordering inside the deck. v1 surfaces words in JSON order.
- Dutch vocab. The data model is per-language ready, but the content gen targets Hindi only in this ship.
- Stats/streak changes. Archived ≠ learned; the existing `phrasesLearned` / streak / daily-goal logic is untouched.

## The user experience

Visiting `/vocabulary/[category]` she sees the same category page she sees today — header band, category title, progress bar — but the body is now a **capped list of 10 unarchived words**, drawn from the category's pool. A small "deck health" pill in the header reads `🃏 38 fresh · 12 archived`, where the two numbers update live.

She can swipe any visible card:

- **Right-swipe → archive.** The card collapse-fades out over ~250ms. The next unarchived word from the pool slides in at the bottom of the visible list with a soft spring (also ~250ms). The deck-health pill ticks: `37 fresh · 13 archived`. Sound: existing `correct` chime.
- **Left-swipe → review.** Card stays in place but gets a butter tint and a `↺` corner tag. Daily-review popup still surfaces it. No state change for the cap or pool.
- **Tap → flip** to reveal the example sentence (unchanged from today).

Below the visible list, a fold sits collapsed by default:

```
─────────────────────────────
✓ 13 archived       tap to show ▾
─────────────────────────────
```

Tap to expand → flat list of archived cards in muted cream styling (~0.75 opacity), each with a small `↺ restore` pill in the top-right corner. Tap restore → card moves back into the pool but does not auto-insert into the visible list (avoids jarring mid-session reappearance). The pool count ticks up by one; the visible list shifts on the next archive.

When the pool is fully archived (visible list length === 0):

```
🎉 all done in this category!
   ${archivedCount} words archived — nice work
   [show archived ▾]   [other categories →]
```

The `/vocabulary` home page (the category grid) gains a per-category archive count in the subtitle line: `16/100 explored · 12 ✓` (the ✓ is a small mint chip). No layout change.

## Architecture

### Data model

Add one new localStorage key per language:

```
${prefix}-vocab-archived → JSON array of hindi strings
```

Three states going forward (per word, per language):

- **active** — default. In the pool, eligible for the visible list.
- **archived** — in `${prefix}-vocab-archived`. Hidden from the active deck. Visible only via the archived fold.
- **review** — in `vocab-review` (global today; remains global for v1 to avoid touching the daily-review popup). Stays in the active deck with a butter tint.

The legacy global `vocab-known` set is retained read-only for backward compatibility and **one-time migration**: on first read of the new category page (per language), every word in `vocab-known` for the current language's categories gets copied into `${prefix}-vocab-archived` and then the legacy `vocab-known` entries for those words are left in place (do not destructively wipe — other code paths may still read them; the migration is additive).

The existing `${prefix}-vocab-learned` (per-language, per-category counter that powers "16/100 explored") is untouched. Archive is a UX preference, not a learning event.

### Modules

| File | Change |
|------|--------|
| `lib/vocab-archive.ts` | **NEW.** `getArchived(prefix)`, `addArchived(prefix, hindi)`, `removeArchived(prefix, hindi)`, `isArchived(prefix, hindi)`, `migrateLegacyKnown(prefix)`. Pure localStorage I/O, no UI imports. Test-driven. |
| `lib/vocab-review.ts` | Untouched. Daily-review popup still reads from `vocab-review`. |
| `lib/vocabulary.ts` | No interface change. New content lands by extending `content/vocabulary.json` in place. |
| `app/vocabulary/[category]/page.tsx` | Major refactor. Cap visible list at 10. Filter by `!isArchived(prefix, w.hindi)`. Slide-in animation for the next-from-pool card. Archive on right-swipe writes to `vocab-archived`. Archived fold + restore at the bottom. "All done!" empty state. |
| `app/vocabulary/page.tsx` | Add a per-category archive count chip in the subtitle line. Reads `getArchived(prefix)` and intersects with each category's word list. |
| `scripts/generate-vocab.mjs` | **NEW.** Drafts ~35 new words per category via Gemini, outputs `content/vocabulary-draft.json` for user review. Modeled on `scripts/generate-lesson.mjs`. |
| `content/vocabulary.json` | Expanded from 100 → ~300 words after the draft is reviewed and merged. |

### Animation choreography (one archive event)

1. User releases the swipe with `info.offset.x > 80` or velocity > 500.
2. Card's `motion.div` exits via height-collapse + fade (250ms ease-out). Same frame, `addArchived(prefix, hindi)` is called.
3. The visible-list memo re-computes: pool = `category.words.filter(!archived)`, slice to first 10. The 10th slot now references a new word.
4. The new bottom card enters with `initial={{ y: 12, opacity: 0 }}` → `animate={{ y: 0, opacity: 1 }}` with spring transition.
5. Deck-health pill numbers animate (count-up / count-down). Existing `playSound('correct')` fires once.

### Performance

The category page already renders all 15-20 words today without trouble. With the pool expanded to ~50 per category and the visible cap at 10, render cost goes *down*. The archived fold is collapsed by default, so the ~40 archived cards are not in the DOM until expanded.

### Content pipeline

`scripts/generate-vocab.mjs` runs locally with `GOOGLE_GENERATIVE_AI_API_KEY`:

```
node scripts/generate-vocab.mjs --category food --count 35
```

For each category:
- Reads `content/vocabulary.json` to extract existing `hindi` headwords (avoid duplicates).
- Prompts Gemini with: target category, count, the style guide from `CONTENT.md` (romanization rules: `chh` not `cc`, single-vowel endings like `karta` not `kartaa`, no Devanagari, A1-A2 difficulty), and the existing words to exclude.
- Validates the response against a Zod schema matching the existing `VocabWord` shape (`hindi` / `pronunciation` / `english` / `example` / `type`).
- Appends to `content/vocabulary-draft.json` (or a per-category draft).
- User runs the audit-style review pass: read, accept/reject/edit, manually merge into `content/vocabulary.json`.

Not a recurring cron — one-shot for the bulk seed. If we want a continuous trickle later, that's a follow-up.

### Failure modes + edge cases

- **Pool < cap.** If category has 7 unarchived words, the visible list is 7, no slide-in waiting. "All done!" state appears when 0.
- **Restore after empty state.** If she restores a word from the fold while the empty state is showing, the empty state replaces itself with the now-1-card visible list.
- **Swipe race.** If she archives two cards in rapid succession, both animations can overlap; state writes are serial via `addArchived`. The visible-list memo recomputes from `vocab-archived` after each write, so the final visible 10 are correct even if intermediate frames show transient counts.
- **localStorage corruption.** `getArchived` catches `JSON.parse` errors and returns `[]`. Same pattern as every other lib in `lib/`.
- **Migration runs twice.** Idempotent — the existing per-language archive set is the source of truth, and `addArchived` no-ops on duplicates.
- **Gemini draft has duplicates with existing words.** The script's exclusion list catches most; the user's review pass catches the rest.

## Testing

- `lib/vocab-archive.test.ts` — unit tests for get/add/remove/isArchived, migration idempotency, JSON corruption fallback, per-language isolation.
- No automated visual-regression for the category page in v1 (existing Big-5 list doesn't include vocab routes). Manual QA on the swipe + slide-in animation.
- `npx vitest run` must stay green.
- `npm run lint:design` must stay green (palette tokens only, no soft shadows).

## Rollout

Two visible shipments inside one feature track. They can ship in either order, but pair best together:

1. **Code change** — list-page refactor with archive set, cap, slide-in, fold, restore, migration. Archive immediately works on the existing 100-word pool, so the feature is usable on day one.
2. **Content gen** — `scripts/generate-vocab.mjs` + user review pass + the merged expansion landing in `content/vocabulary.json`. The deck "gets deeper."

Code first means the partner can start archiving today's known words right away; content second is the "deck got deeper" follow-up.

## Open questions deferred to plan

- Exact slide-in spring stiffness/damping values — picked during implementation, tuned by feel.
- Whether the deck-health pill animates the count-down with a soft tick or just snaps. Implementation decision.
- Exact prompt phrasing for `scripts/generate-vocab.mjs` — drafted during implementation, refined after first run.
- Whether the empty-state CTA "other categories →" goes to `/vocabulary` (the grid) or to the next unfinished category. Default: `/vocabulary` (simpler).

## Future extensions (not in this ship)

- Lift the same archive primitive to lessons. `${prefix}-lessons-archived` set, archived lessons hidden from the home list, fold below with restore.
- Bulk-archive triage screen for power users — a grid of all 50 words in a category, tap-to-archive multi-select, hit "archive selected" once.
- Smart reordering — surface words she's left-swiped (review) more often once she's archived a chunk.
- Periodic content-gen cron — weekly trickle of 5-10 new words per category via the same Gemini script, opened as a PR for review.
- Dutch vocab expansion using the same `scripts/generate-vocab.mjs` pipeline with the Dutch style guide.
