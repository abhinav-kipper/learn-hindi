# Audit: dutch-daily-routine

**File:** content/dutch/lessons/15-daily-routine.json
**Audit date:** 2026-06-03
**Total fixes applied:** 1
**Items not applied:** 0

## Fixes applied

### Accuracy (1 item)

1. **Where:** field `grammar_notes[0]` (separable-verb examples)
   **Was:** `Common daily-routine examples: 'aankleden' (sta aan), 'thuiskomen' (kom thuis), 'aankloppen' (klop aan).`
   **Now:** `Common daily-routine examples: 'aankleden' (kleed ... aan), 'thuiskomen' (kom ... thuis), 'aankloppen' (klop ... aan).`
   **Why:** `aankleden` does not split into "sta aan" — that split form belongs to `opstaan` (a copy-paste slip). The correct detached form of `aankleden` is `kleed ... aan` (e.g. "Ik kleed me aan"). Also added the `...` gap notation to all three so the prefix-detachment pattern (base verb in position 2, prefix to clause end) is shown consistently with how `opstaan` was illustrated in the same note.

## Verification notes (no change needed)

All unit-specific focus items verified correct:

- **opstaan:** `Ik sta om zeven uur op.` — `sta` in position 2, `op` at clause end. Correct.
- **Time-of-day apostrophe-s:** `'s ochtends`, `'s middags`, `'s avonds`, `'s nachts` all correct (grammar note correctly explains the apostrophe as the old genitive `des`).
- **Inversion after fronted time word (V2):** `'s Ochtends ga ik`, `'s Middags eet ik`, `'s Avonds kook ik` — all verb-second, never `'s avonds ik kook`. Skill-breakdown examples (`'s Ochtends douche ik altijd`, `Om half acht vertrek ik`, `'s Nachts slaap ik`) also invert correctly.
- **Frequency adverbs:** `Ik drink altijd koffie...`, `Ze kookt nooit...`, `Ik fiets vaak...`, `Wij gaan soms...` — adverb after the conjugated verb. Correct.
- **Set phrases:** `Ik werk van negen tot vijf`, `Ik ga om elf uur naar bed`, `Ik kook het eten` — all correct.
- **ontbijten:** correctly described as not separable (inseparable `ont-` prefix); `meestal` placement after verb correct.
- **half tien = 9:30:** explained correctly (the half-hour looks back at the next hour).
- **Culture notes** (early dinner 17:30-18:30, koffie break, bread lunch, agenda culture): accurate for Dutch life.
- **References:** all three (Nederlands in gang, Taalthuis.nl, dutchgrammar.com) are on the vetted list.
- **Pronunciation fields:** prosodic syllable-stress format consistent; guttural `g`/`ch` rendered as "ch", devoiced `v` as "f", `ij` as "ay". Acceptable as prosodic hints (not lexical IPA) per audit notes.

## Items not applied (0)

None. The one frequency-adverb simplification ("right after the conjugated verb" — technically the adverb follows the subject in inversion, e.g. `'s Ochtends douche ik altijd`) was judged correct as stated for subject-first sentences, and the lesson's own examples already demonstrate both word orders correctly. No flag warranted.

## Lint status

- `node scripts/lint-content.mjs` — clean (no em-dashes, arrows, or clichés).
- `node scripts/lint-quality.mjs` — clean (references vetted, jargon glossed).
- JSON parses.
