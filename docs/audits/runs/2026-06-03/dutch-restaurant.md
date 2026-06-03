# Audit: dutch-restaurant

**File:** content/dutch/lessons/18-restaurant.json
**Audit date:** 2026-06-03
**Total fixes applied:** 3
**Items not applied:** 0

## Fixes applied

### Accuracy (2 items)

1. **Where:** field `phrases[6].pronunciation` (`Ik ben vegetariër. Zijn er vegetarische opties?`)
   **Was:** `... vey-che-ta-REE-se OP-tees?`
   **Now:** `... vey-che-ta-REE-se OP-sees?`
   **Why:** Dutch `-tie(s)` is pronounced /(t)si/, so `opties` is roughly "OP-sees", not "OP-tees". The `ti`-before-`e` → /si/ sound was missed.

2. **Where:** field `phrases[8].pronunciation` (`Het smaakt heerlijk.`)
   **Was:** `het SMAAAKT HAYR-luk.`
   **Now:** `het SMAAKT HAYR-luk.`
   **Why:** Triple-A typo. `smaakt` has the long vowel written `aa`; the syllable-stress form should be `SMAAKT`.

### Style (1 item)

1. **Where:** field `phrases[3].pronunciation` (`Wat kunt u aanbevelen?`)
   **Was:** `wat KUNt u AAN-be-VAY-len?`
   **Now:** `wat KUNT u AAN-be-VAY-len?`
   **Why:** Inconsistent casing inside the stressed syllable (`KUNt`); CAPS the whole stressed syllable per the pronunciation-field convention.

## Verified correct (no change needed)

- **Formal `u` register** consistent across all phrases, grammar_notes, and the practice_prompt (`alstublieft`, `kunt u`, `op uw naam`). Matches house-service register.
- **Focus phrases** all accurate: `Ik wil graag ... reserveren` (modal-frame, infinitive at clause end), `Mogen we de menukaart, alstublieft?` (idiomatic elision of `hebben`, intended per brief), `Wat kunt u aanbevelen?`, `Voor mij de soep` (`de soep`), `Ik ben vegetariër` (umlaut ë present and correct), `Ik ben allergisch voor noten`, `De rekening, alstublieft` (`de rekening`, de-word), `Kan ik pinnen?`.
- **Article/agreement/word order:** `de biefstuk`, `de soep`, `de rekening`, `de menukaart` all correct de-words; `dit gerecht`/`het gerecht`, `veganistische gerechten`, `vegetarische opties` agreement correct. V2 and infinitive-final order correct throughout (`Kan ik de biefstuk medium-rare krijgen?`, `wat beveelt u aan?` separable split correct).
- **Separable verb** `aanbevelen` explained and split correctly (`beveelt u aan` in main clause, stays whole after `kunt u`).
- **culture_notes** all factually accurate: tipping by rounding up / ~10% generous / not obligatory; `pinnen` as the norm with contactless/Apple/Google Pay and some cash-only spots; early dinner (18:00, fills 18:00–19:30); `kraanwater` not always free, `bruiswater`/`plat water` terms correct.
- **references** vetted (Naar Nederland, TaalCompleet A2, learndutch.org) — all real NT2 sources.

## Lint

- `node scripts/lint-content.mjs` — clean (no em-dashes, arrows, clichés).
- `node scripts/lint-quality.mjs` — clean (references vetted, jargon glossed).
- JSON parses.
