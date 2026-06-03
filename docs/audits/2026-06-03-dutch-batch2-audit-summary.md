# Audit summary — Dutch ground-up Batch 2 (7 new units)

**Date:** 2026-06-03
**Rubric:** `docs/audits/CONTENT_RUBRIC.md` v1.0
**Scope:** the 7 Batch 2 units (3 foundations + 4 situations).
**Method:** 7 parallel Opus subagents, accuracy-first auto-apply.
**Per-file reports:** `docs/audits/runs/2026-06-03/`

## Outcome

- **7 accuracy/style fixes** across 3 files. **2 items flagged.** **4 units clean.**
- All units pass `lint:content`, `lint:quality`, `tsc`, `vitest`, `next build`.

## Fixes

| Unit | Fixes | What |
|---|---|---|
| `connectors` | 0 | Clean. want (V2) vs omdat (verb-final) verified in every example; all quick_checks correct. |
| `future` | 0 | Clean. present+time word / gaan+inf / zullen+inf (zal/zult/zal/zullen) all correct. |
| `comparatives` | 0 | Clean. -er/dan, -st, all four irregulars, even...als verified. (1 flagged.) |
| `dutch-making-plans` | 3 | Corrected the `afspreken` separable-verb description (prefix stays attached in the infinitive, splits only as the finite verb); rewrote a muddled je/jou note; stress-casing. |
| `dutch-asking-directions` | 0 | Clean. u register, direction words, imperatives all correct. |
| `dutch-restaurant` | 3 | `opties` pronunciation `OP-tees` → `OP-sees` (Dutch -tie = /si/); `SMAAAKT` typo → `SMAAKT`; stress-casing. |
| `dutch-phone-basics` | 1 | **Idiom fix:** `Je verbreekt steeds` → `Je valt steeds weg` (`verbreken` is transitive — you break *a connection*; the lesson's own `wegvallen` is the idiomatic intransitive). |

## Flagged (not applied)

1. **`comparatives` → `grammar_notes[4]`** — the "-r adjectives use meer/meest" wording is loose (the cleaner rule is -r → -der, e.g. `duurder`; meer/meest is mainly for long adjectives/participles). Defensible as hedged; left for review.
2. **`dutch-making-plans` → `phrases[4]`** "Past zaterdag je?" — `passen` for "suit a schedule" is colloquial vs the more exam-standard `schikken`/`uitkomen`. Current casual Dutch, A2 non-exam, so left as-is; flagged.

## Read

The grammar held up well, especially the foundations (connectors and future clean on the trickiest points — want/omdat word order and the three future forms). The substantive catches were idiomatic: the non-transitive `verbreken` misuse and the `afspreken` separable-verb explanation. The 7 Batch 2 units are now audited.
