# Audit: dutch-comparatives

**File:** content/dutch/foundations/14-comparatives.json
**Audit date:** 2026-06-03
**Total fixes applied:** 0
**Items not applied:** 1

## Verification summary

All focus areas verified accurate:

- **Comparative -er + dan:** `groot` -> `groter`, `klein` -> `kleiner`, `mooi` -> `mooier`, plus `dan` (not `als`) for 'than' all correct. The tip callout correctly notes `als` is heard casually but `dan` is the written standard.
- **Spelling tweaks:** `duur` -> `duurder` (long-vowel -r adds -der), `vies` -> `viezer` (s->z between vowels, ie retained), `dik` -> `dikker` (short vowel, doubled consonant), `oud` -> `ouder`, `groot` -> `groter` (open-syllable single o) all correct.
- **Superlative:** predicate `het grootst` / `het kortst` and attributive `de grootste stad` / `het kleinste kind` both correct; article-follows-gender note accurate (`stad` is a de-word).
- **Irregular four (all verified):** `goed` -> `beter`/`best`, `veel` -> `meer`/`meest`, `graag` -> `liever`/`liefst`, `weinig` -> `minder`/`minst`. All four correct in body, table, examples, and skill_breakdown.
- **even ... als = as ... as:** adjective stays in plain form (no -er) correct; the "don't add -er" warning is accurate.
- **All four quick_check.correct_index correct:**
  - "faster than" -> idx 1 `sneller dan` (correct)
  - "the biggest city" -> idx 1 `de grootste stad` (correct)
  - comparative of `goed` -> idx 1 `beter` (correct)
  - "as tall as Piet" -> idx 2 `even lang als Piet` (correct)
- **Pronunciation (syllable-stress):** all 8 phrase fields reviewed; Dutch g/ch rendered as CH/CHR (CHROH-ter, DAA-chen, CHIS-te-ren), long vowels and stress placement plausible (DUUR-der, BAY-ter, LEE-ver, AY-ven, MOH-ist). No corrections needed.

Structural: JSON parses, all required fields present, `references[]` non-empty and vetted (dutchgrammar.com, Donaldson Comprehensive Grammar, TaalCompleet A2 — all legitimate), comparative/superlative glossed in plain words ("the -er or 'more' form", "the -st or 'most' form"). No em-dashes or arrows. Both `lint-content.mjs` and `lint-quality.mjs` pass clean.

## Items not applied (1)

1. **Where:** `grammar_notes[4]` ("Long adjectives and many ending in -r use 'meer' / 'meest' ...")
   **Issue:** Slightly imprecise framing. The cleaner rule is that adjectives ending in **-r** take **-der** for the comparative (e.g. `duurder`, `lekkerder`, `verder`), which the file itself demonstrates with `duurder`; the "meer / meest" route is mainly for *long* adjectives and past participles (e.g. `meer interessant`), not specifically short -r adjectives. The note's example (`interessant`) is in fact a long adjective, so the worked example is right; only the "-r" wording is loose.
   **Suggested fix:** Reword to "Long adjectives and past participles use 'meer' / 'meest' instead of -er / -st (`meer interessant`). Most short adjectives ending in -r take `-der` instead (`duurder`, `lekkerder`)."
   **Why not applied:** Pedagogical-meaning change; the note is hedged ("many ... where that sounds more natural") and its example is correct, so it is defensible as-is. Flagging for user review rather than rewriting unilaterally.
