# Audit: dutch-first-words

**File:** content/dutch/lessons/12-first-words.json
**Audit date:** 2026-06-03
**Total fixes applied:** 1
**Items not applied:** 1

## Fixes applied

### Accuracy (1 item)

1. **Where:** `phrases[1].pronunciation` (`Goedenavond` segment)
   **Was:** `CHOO-de-na-FONT.`
   **Now:** `CHOO-de-NA-vont.`
   **Why:** Two corrections. (a) Stress was on the wrong syllable: `goedenavond` = *goeden-avond*, and the spoken beat falls on the first syllable of "avond" (NA), not on the final `-vond`. (b) The `v` in "avond" stays a soft /v/ at the syllable onset, so "vont" is closer than "FONT" (the final `d` does devoice to "t", which the new form keeps). The other two segments (`CHOO-de-MOR-chen` / `CHOO-de-MI-dach`) were already correct.

## Items not applied (1)

1. **Where:** `grammar_notes[1]`
   **Issue:** The contraction etymology is stated as "'Als-je-belieft' contracts to 'alsjeblieft'; 'als-u-belieft' contracts to 'alstublieft'." The fuller historical source is *als het u belieft* / *als het je belieft* ("if it pleases you"), so the gloss drops the "het" element.
   **Suggested fix:** Either leave as-is (it's a serviceable learner mnemonic, not presented as strict etymology) or expand to "from *als het u belieft* (if it pleases you)".
   **Why not applied:** Pedagogical-meaning call. The simplified form is a deliberate beginner mnemonic and is not factually false about how the modern word is built/pronounced; expanding it risks over-loading an A1 survival lesson with etymology. Flagging for the author's preference rather than rewriting unilaterally.

## Verified correct (no change needed)

- **Register consistency:** every paired phrase keeps je/u clean within each variant (`Kunt u dat herhalen?` vs `Kun je dat herhalen?`, `Spreekt u Engels?` vs `Spreek je Engels?`, `Dank je wel` vs `Dank u wel`, `Alsjeblieft` vs `Alstublieft`). No mid-phrase mixing.
- **Verb -t drop:** `spreek je` / `kun je` correctly drop the `-t` after a following `je`; `spreekt u` / `kunt u` keep it. Confirmed in both phrases and `grammar_notes[2]`.
- **Spelling:** hallo, hoi, dag, goedemorgen, goedemiddag, goedenavond, alsjeblieft, alstublieft, dank je wel, dank u wel, graag gedaan, sorry, pardon, ja, nee, tot ziens, doei, langzamer, herhalen, begrijp/snap all spelled correctly.
- **Guttural g:** pronunciation fields render Dutch `g`/`ch` as `CH` (`HA-loh`/`DACH`, `CHOO-`, `CHRAACH`, `be-CHRAYP`) consistently.
- **`ik snap/begrijp het niet`:** both keep the obligatory `het` object; the practice prompt even targets dropping it as a correction beat ("dropping 'het' in 'ik begrijp niet'").
- **`Wat betekent dat?` / `Hoe zeg je ... in het Nederlands?`** type clarification phrases (in skill_breakdown examples) grammatically sound.
- **Culture notes:** handshake-on-first-meeting + three-cheek-kiss for friends, Dutch directness framing, register-laddering with "doei", and the "trying Dutch earns a warmer reply" point are all accurate about Dutch etiquette.
- **References:** DUO oefenen.nl, TaalCompleet A1, Naar Nederland — all on the vetted list.
- **Lint:** `lint-content.mjs` and `lint-quality.mjs` both pass; JSON valid; no em-dashes/arrows.
