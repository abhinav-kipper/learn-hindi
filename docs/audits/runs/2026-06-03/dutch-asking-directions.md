# Audit: dutch-asking-directions

**File:** content/dutch/lessons/17-asking-directions.json
**Audit date:** 2026-06-03
**Total fixes applied:** 0
**Items not applied:** 0

## Clean

No accuracy, style, or structural fixes needed. The lesson passed every focus check:

- **Formal `u` register** is consistent throughout (stranger context). Phrases, grammar notes, skill breakdowns, practice prompt, and closing all keep `u` / `uw` / `Dank u wel`. The one note about `je` being acceptable for student-age strangers is correctly framed as the exception, with `u` stated as never wrong.
- **Opener** `Pardon, mag ik u iets vragen?` is correct and idiomatic.
- **`Waar is het station?`** and the swap-in places (`de Albert Heijn`, `het gemeentehuis`, `het postkantoor`, `de apotheek`) all carry the correct articles.
- **`Hoe kom ik bij ...?`** is correctly inverted (V2: question word first, finite verb `kom` second). The `bij` (named places) vs `op` (streets) distinction is accurate.
- **`Is het ver?` / `Is het dichtbij?`** opposite pair correct; `vlakbij` and `een eindje lopen` glossed accurately.
- **Direction words** `rechtdoor`, `linksaf`, `rechtsaf`, `de eerste/tweede straat`, `naast`, `tegenover`, `op de hoek` are all spelled correctly and glossed with the right meanings (`tegenover` = opposite/across from; `naast` = next to; `op de hoek` = on the corner).
- **Imperatives** `Ga rechtdoor`, `Sla linksaf`, `Sla rechtsaf`, `Neem de eerste straat links` are correct command forms; the grammar note that no `-t`/ending is added for singular `you` commands is right.
- **`Kunt u het op de kaart aanwijzen?`** correct, with an accurate note that `aanwijzen` is separable (prefix `aan` to clause end in the infinitive after the modal `kunt`).
- **Pronunciation** fields use consistent syllable-stress with CAPS on the stressed syllable, matching Dutch prosody (`bib-lee-oh-TAYK` final stress for `bibliotheek`; `op de HOOK`; `de TWAY-de straat`; `sta-SYON` final stress). Guttural `g`/`ch` rendered as `ch`/`ch` (`mach ik`, `cha rechtdoor`, `DACH`).
- **Grammar notes** are accurate: V2 explained correctly, imperative formation correct, prepositions-of-place note correctly states Dutch nouns no longer inflect for case.
- **Culture notes** are factual: cycling-first layout and fietspaden, Google Maps being unremarkable and unrude, Amsterdam canal-ring confusion, directness/helpfulness toward strangers. `te voet` (on foot) used correctly.
- **Schema:** valid JSON, all required fields present, `references[]` non-empty and vetted (Naar Nederland, TaalCompleet A1, Bart de Pau / learndutch.org), `level: A1`, `exam_targeted: false`. No em-dashes or arrows.

Linters: `lint-content` and `lint-quality` both pass clean.
