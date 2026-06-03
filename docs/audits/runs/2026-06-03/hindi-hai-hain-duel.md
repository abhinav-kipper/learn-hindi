# Audit: content/games/hindi/hai-hain.json

Date: 2026-06-03
Game: Hai or Hain duel (left = HAI / singular plain, right = HAIN / plural or respectful)

## Rule recap
- `hai` = 3rd-person singular, plain (woh ladka, yeh kitaab, Raj, ek kutta).
- `hain` = plural (ve log, do bachche, yeh kitaaben, mere dost) AND respectful singular (aap, Sharma ji, papa ji, elders).
- Number/respect must be unambiguous in each prompt.
- No subject that takes hoon (main) or ho (tum).

## Method
Checked all 50 items on three axes: (1) prompt number/respect unambiguous, (2) answer matches the rule, (3) no main/tum subjects. Verified bullets, tip, and single-vowel romanization.

## Findings

### Corrections (4)
The four flagged items all involved **number-invariant masculine nouns** (`phool`, `seb`, `aam`) where the singular and plural direct-case forms are identical. Paired with `yeh`/`ye`, the number was genuinely ambiguous, violating rule 1. Worse, `yeh phool` (answer left/singular) and `ye phool` (answer right/plural) were the *same noun with opposite answers*, so a learner could be marked wrong on an undecidable prompt. Fixed by disambiguating with an explicit numeral/quantifier:

1. `yeh phool` (left, "this flower") -> `ek phool` ("one flower"). `phool` does not inflect for number; `ek` forces singular. Explain updated.
2. `yeh seb` (left, "this apple") -> `ek seb` ("one apple"). Same invariant-noun issue; `ek` forces singular.
3. `ye phool` (right, "these flowers") -> `paanch phool` ("five flowers"). Removes the direct collision with the former `yeh phool` and forces plural with a numeral.
4. `yeh aam` (right, "these mangoes") -> `paanch aam` ("five mangoes"). `aam` is number-invariant; `paanch` forces plural.

### Removed (0)
No items removed. All four ambiguous prompts were repairable in place by adding a numeral/quantifier, so the item count stays at 50 (rounds 30).

## Verified clean (no change)
- **All answer tags are correct.** Every left item is a plain singular (woh ladka, yeh kitaab, ek kutta, Raj, Mira, etc.); every right item is either plural (ve log, do bachche, mere dost, teen kursiyan, bahut log) or respectful singular (aap, papa ji, Sharma ji, guru ji, dada ji, doctor sahab, pradhan ji). No tag teaches agreement backwards.
- **No hoon/ho subjects.** No `main` or `tum` anywhere; `aap` is correctly on the hain side.
- **Invariant nouns that stay unambiguous via a number marker** were left as-is and confirmed correct: `mere dost` / `char dost` (plural via possessive/numeral), `humare padosi` (plural via `humare`), `ve student` (plural via `ve`), `yeh saamaan` (mass noun -> hai), `woh aadmi` / `yeh shahar` (singular via woh/yeh vs the ve/ye plural convention the deck uses consistently).
- **Bullets, tip, romanization** all accurate and in single-vowel CONTENT.md style (hai/hain/ji/sahab/kitaaben/behnein/kursiyan). No Devanagari, em-dashes, arrows, or cliches.

## Validation
- `node -e JSON.parse(...)` -> valid JSON.
- `node scripts/lint-content.mjs` -> clean (no em-dashes, arrows, or cliches).

## Summary
4 corrections, 0 removed.
