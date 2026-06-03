# Audit: dutch-phone-basics

**File:** content/dutch/lessons/19-phone-basics.json
**Audit date:** 2026-06-03
**Total fixes applied:** 1
**Items not applied:** 0

## Fixes applied

### Accuracy (1 item)

1. **Where:** field `skill_breakdown[1].more_examples[2].hindi`
   **Was:** `Je verbreekt steeds. Zal ik opnieuw bellen?`
   **Now:** `Je valt steeds weg. Zal ik opnieuw bellen?`
   **Why:** `verbreken` ("to break/sever a connection") is transitive in Dutch — it takes an object (`de verbinding verbreken`). Using it intransitively as a calque of English "you keep cutting out" (`je verbreekt steeds`) is not idiomatic Dutch. Replaced with `je valt steeds weg`, which reuses the lesson's own taught verb `wegvallen` (introduced in phrase 7, "Je valt weg") and is the natural phrasing native speakers use for a dropping line. English gloss unchanged.

## Focus-point verification (all correct, no change needed)

- **"Met [naam]" convention** — Correctly taught throughout: phrase 1 (`Met Anna.`), grammar_note[0], culture_notes[0], skill_breakdown[0]. The point that you say your OWN name when answering (not "hallo") is explained accurately and emphasized as the key takeaway. The business variant `u spreekt met Mirjam de Boer` is also correct.
- **"Spreek ik met Sanne?"** — Correct V2 word order, correct meaning ("am I speaking to..."). Phrase 2 + grammar_note[2].
- **"Kan ik Sanne spreken?"** — Correct; infinitive `spreken` at clause end after modal `kan`. The `iemand spreken` register note is accurate.
- **"Een moment, ik verbind u door / ik geef je door"** — Both forms correct. Separable verbs `doorverbinden` / `doorgeven` split correctly (`ik verbind u door`, `ik geef je door`). Register split (formal `u` vs informal `je`) is right.
- **"Hij is er niet"** — Covered as `Ze is er nu niet` (phrase 5); `er niet zijn` glossed correctly as "to not be there / not be available."
- **"Kan ik een bericht achterlaten?"** — Correct. `achterlaten` correctly described as separable (`ik laat een bericht achter`).
- **"Ik bel je terug" (terugbellen separable)** — Correct in phrases 6, 7 and grammar_note[1]. Split (`ik bel je terug`) and joined infinitive after `te` (`terug te bellen`) both shown accurately.
- **"Je valt weg / Ik versta je slecht"** — Correct. `wegvallen` splits (`je valt weg`); the `verstaan` (hear/catch words) vs `begrijpen` (understand meaning) distinction is taught correctly in phrase 7 and grammar_note[4].
- **"Tot horens / Doei"** — Correct. `tot horens` accurately glossed as a phone-specific sign-off, with the more common `Doei!` / `Dag!` / `Tot snel!` alternatives noted.
- **Register consistency** — Consistent. Informal `je` and formal `u` are each used in appropriate contexts and the je/u choice is explicitly addressed in grammar_note[3]. The practice_prompt stays in `je`.
- **Pronunciation (syllable-stress)** — Hyphenated syllables with CAPS on the stressed beat throughout; stress placement checked and correct (e.g. `mo-MENT`, `te-RUCH`, `ver-STAA`, `ACH-ter-LAA-ten`). The `ch`/`CH` convention for Dutch g/ch is consistent with the rest of the Sounds course.
- **culture_notes** — Accurate: name-answer convention, voicemail brevity norm, phone appointments for huisarts/gemeente, Dutch directness (reason first, small talk after). Terms (`de voicemail`, `huisarts`, `gemeentehuis`) correct.
- **Schema / references** — JSON valid; all required fields present; `references[]` non-empty and vetted (Naar Nederland, TaalCompleet A1, Taalthuis.nl — all genuine NT2 resources). No em-dashes or arrows.

## Style

No style fixes needed — prose is tight, no AI clichés, voice matches (directive practice_prompt, concrete context notes, in-character).

## Lint

- `node scripts/lint-content.mjs` → clean (no new violations)
- `node scripts/lint-quality.mjs` → clean (references vetted, jargon glossed)
