# Audit summary — Dutch ground-up Batch 1 (8 new A1 units)

**Date:** 2026-06-03
**Rubric:** `docs/audits/CONTENT_RUBRIC.md` v1.0
**Scope:** the 8 new conversational A1 units (4 foundations + 4 situations) added in the Dutch ground-up Batch 1.
**Method:** 8 parallel Opus subagents, one per unit, accuracy-first auto-apply.
**Per-file reports:** `docs/audits/runs/2026-06-03/`

## Outcome

- **6 accuracy fixes applied** across 4 files.
- **1 item flagged** for review (no pedagogical-meaning fixes auto-applied).
- **4 units clean** (no changes).
- All units pass `lint:content`, `lint:quality`, `tsc`, and JSON validation.

## Fixes applied

| Unit | Fixes | What |
|---|---|---|
| `dutch-pronouns-zijn-hebben` | 0 | Clean. zijn/hebben tables, je/jij/u register, all quick_checks verified. |
| `dutch-questions` | 2 | `een` pronunciation fixed from stressed numeral `ayn` to schwa `un`; removed a stray `doe/` token in a `kom je` gloss. |
| `dutch-negation` | 0 | Clean. geen vs niet, niet placement, all quick_checks verified. |
| `dutch-simple-sentences` | 0 | Clean. V2, inversion (`Vandaag werk ik`), er is/er zijn; consistent with the A2 word-order chapter. |
| `dutch-first-words` | 1 | `Goedenavond` stress corrected to `CHOO-de-NA-vont` (stress on *avond*, and `v` not `F`). |
| `dutch-small-talk` | 1 | **Real error:** a grammar note wrongly said you "must use *jou*, not *je*" after a preposition; both `met je` and `met jou` are valid (jou = stressed form). Rewritten. |
| `dutch-family-home` | 1 | `vriendin` stress corrected to `vreen-DIN` (final-syllable stress, which is what distinguishes it from `vriend`). |
| `dutch-daily-routine` | 1 | **Real error:** separable-verb example `aankleden` showed `(sta aan)` — a copy-paste slip from `opstaan`; corrected to `kleed ... aan`, and normalized the gap notation across all three examples. |

## Items flagged (not applied)

1. **`dutch-first-words` → `grammar_notes[1]`** — the `alsjeblieft`/`alstublieft` gloss simplifies the etymology (drops the *het* in *als het u belieft*). Serviceable A1 mnemonic; left to the author rather than loading an A1 survival lesson with etymology.

## Read

The Dutch grammar held up well — the two substantive catches (the `aankleden` separable-verb slip and the incorrect `jou`/`je` rule) are exactly the kind of subtle error a copy-style lint can't see, which is why the accuracy rubric pass matters. Pronunciation-stress was the most common small fix. No structural/schema issues; references all on the vetted allowlist.
