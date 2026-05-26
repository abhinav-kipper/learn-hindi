# Loose-End Cleanup — Spec

**Status:** approved 2026-05-26
**Repo:** `abhinav-kipper/learn-hindi`

## 1. Scope

Three small fixes that close out open items from earlier today's wave:

1. Wire the `a2Milestone` Chaina moment trigger (registered but never called).
2. Fix a duplicated line in `CLAUDE.md` (lines 320-321 — identical Time-of-day greeting bullet).
3. Strike two phantom entries from `CLAUDE.md` "Open gaps" — Hindi pronunciation inconsistency and grammar-placement audit, both verified non-issues by audit.

Explicitly out of scope: Hindi pronunciation normalization (intentional prosodic modeling, not a bug), phrase context rewrites (heuristic flagged 21 of 336 phrases but all are legitimate on inspection), demo-reset block removal (user opted out), `as any` cleanup (already typed cleanly).

## 2. Decisions

| Decision | Choice |
|---|---|
| `a2Milestone` firing cadence | Once-ever, gated by dedicated localStorage flag `chaina-a2-milestone-fired` (not via the rotating `canFire`/`markFired` modes — semantically a permanent milestone, not a per-session/day cap) |
| `a2Milestone` trigger location | New `useEffect` in `app/page.tsx`, deps `[language, completedCount, play]` so it re-evaluates as the user completes lessons during a session |
| A1 completion check | All `getItemsByLevel('A1')` items must satisfy `isLessonComplete(id, 'dutch')`. Empty A1 list short-circuits to no-fire. |
| Number of commits | Two commits — feature commit for the trigger, docs commit for CLAUDE.md cleanup |
| Tests | No new tests required — the trigger is straightforward and gated by existing primitives. A component test would require mocking localStorage + level-map + isLessonComplete; the cost/value isn't worth it for ~10 lines of trigger code. |

## 3. Implementation outline

### 3.1 `app/page.tsx`

Add a new `useEffect` near the existing mount-side effects (around line 147 where the chaina greeting/welcomeBack logic lives). The effect:

```ts
useEffect(() => {
  if (language !== 'dutch') return
  if (typeof window === 'undefined') return
  if (localStorage.getItem('chaina-a2-milestone-fired') === '1') return

  const a1Ids = getItemsByLevel('A1')
  if (a1Ids.length === 0) return
  const a1Done = a1Ids.filter(id => isLessonComplete(id, 'dutch')).length
  if (a1Done < a1Ids.length) return

  play('a2Milestone')
  localStorage.setItem('chaina-a2-milestone-fired', '1')
}, [language, completedCount, play])
```

`getItemsByLevel` is already imported (line 24 — verified by the system reminder earlier this session).
`isLessonComplete` is already imported (line 10).
`play` comes from `useChaina()` already destructured at line 51.

### 3.2 `CLAUDE.md` — dup line

Delete the second copy of:
```
- Time-of-day greeting tried, then removed (cluttered top bar). Replaced with `Hi, {name}`.
```
at line 321. Keep line 320.

### 3.3 `CLAUDE.md` — phantom gaps

In the "Open gaps (worth revisiting)" section, remove these two entries from the "Still open" list:

- ~~Pronunciation field formatting inconsistent across older Hindi lesson JSONs~~
- Grammar-placement claim (not currently in the file but implied by the user's mental model)

Add a new sub-section after the open-gaps list:

```markdown
### Audit notes (2026-05-26)

Items previously flagged as gaps but verified non-issues during the loose-end cleanup session:

- **Hindi pronunciation field formatting is intentionally prosodic, not lexical.** CAPS marks sentence-level stress (where the spoken beat falls in the phrase), not the canonical lexical stress of each word in isolation. So `yaar` appears lowercase as a soft sentence-end softener but `YAAR` when it's a stressed exclamation. The format is consistent across all 19 Hindi files (10 situations + 9 foundations) and intentional. No normalization pass needed.
- **Phrase `context` fields align with phrase content.** A 336-phrase heuristic audit across all 30 lessons (Hindi + Dutch) flagged 21 phrases for review; on manual inspection all are legitimate — the `context` explains the phrase's strategic or grammatical purpose without redundant lexical repetition. No rewrites needed.

Add new findings here when verified, so future sessions don't chase the same phantoms.
```

Add the new storage key to the storage-keys section:

```markdown
- `chaina-a2-milestone-fired` — set to `'1'` after `a2Milestone` Chaina moment fires once (permanent milestone, never re-fires)
```

Update the existing "a2Milestone — placeholder, trigger not yet wired into home" entry in the Chaina moment triggers section to say it IS wired (with the gating logic).

## 4. Files touched

| Path | Change |
|---|---|
| `app/page.tsx` | New `useEffect` (~12 lines including imports check) |
| `CLAUDE.md` | Delete dup line; rewrite phantom-gap entries; add storage key entry; update chaina-trigger note |

## 5. Validation

- `npx tsc --noEmit` clean
- `npx vitest run` — 258/258 still pass
- `node scripts/lint-design.mjs` — clean
- Manual smoke: open Dutch home, set localStorage to mark all 5 A1 lessons complete (`learn-hindi:dutch:progress` payload, completedLessons array contains all `dutch-` A1 IDs). Reload Dutch home; `a2Milestone` Chaina moment fires; localStorage shows `chaina-a2-milestone-fired=1`. Reload again; does NOT re-fire.

## 6. Out of scope

- Hindi pronunciation normalization — phantom, prosodic
- Phrase context rewrites — phantom, content is high quality
- Demo-reset block removal — user opted out
- Additional Chaina moment wiring beyond a2Milestone
- New tests — the change is too small and gated by existing primitives

## 7. Risks

- The trigger fires inside a `useEffect` with deps `[language, completedCount, play]` — `completedCount` updates as the user completes lessons (from the existing `setCompletedCount(progress.completedLessons.length)` in the main mount effect). The Chaina trigger should fire when the user crosses the threshold, not on every re-render. Mitigation: the early-return on the localStorage flag handles re-fires.
- If the user has already passed A1 in a prior session without this trigger existing, the moment will fire on their NEXT Dutch home visit (one-time catch-up). This is the desired behavior, but should be noted in case it surprises power users.

## 8. Open questions

None.
