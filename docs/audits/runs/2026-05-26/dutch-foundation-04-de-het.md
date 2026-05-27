# Audit: dutch-foundation-04-de-het

**File:** content/dutch/foundations/04-de-het.json
**Audit date:** 2026-05-26
**Total fixes applied:** 4
**Items not applied:** 2

## Fixes applied

### Accuracy (3 items)

1. **Where:** field `phrases[5].hindi` + `phrases[5].context` + `phrases[5].pronunciation`
   **Was:** `"Dit is de man. Dat is het huis. Dit zijn de kinderen. Is dit jouw boek?"` with context stating `"'dit' with het-words singular, 'dat' with de-words singular"`
   **Now:** `"Deze man is groot. Dit huis is mooi. Dit zijn de kinderen. Is dit jouw boek?"` with context clarifying `"'deze/die' (this/that) with de-words singular, 'dit/dat' with het-words singular"` and noting the dit-is/dat-is copular exception.
   **Why:** The original context contained a factual error — `dat` does NOT pair with de-words; `die` pairs with de-words (as the theory section below correctly states). The example sentences used the copular `Dit is X` / `Dat is X` pattern, which defaults to dit/dat regardless of X's gender — these were technically correct but misleading as illustrations of the rule. Replaced with attributive examples (`Deze man`, `Dit huis`) that actually demonstrate the gender-tracking rule, and added a clarifying note about the copular default so learners aren't confused when they hear `Dit is de man` later.

2. **Where:** field `theory.sections[1].body` ("Patterns that help (not rules)")
   **Was:** `"Country and language names are usually het (het Nederlands, het Duits)."`
   **Now:** `"Language names take het (het Nederlands, het Duits, het Engels). Country names usually take no article at all in normal use (Nederland, Duitsland)."`
   **Why:** Factual error — the cited examples (`het Nederlands`, `het Duits`) are LANGUAGE names, not country names. Country names like `Nederland` and `Duitsland` typically take no article in standard Dutch use. Conflating the two would teach learners to say things like `het Nederland`, which is wrong.

3. **Where:** field `theory.sections[1].table.rows[6]`
   **Was:** `["language / country name", "het", "het Nederlands, het Engels"]`
   **Now:** `["language name", "het", "het Nederlands, het Engels, het Duits"]`
   **Why:** Same factual error as item 2 — table row conflated language and country names. Removed "country name" from the row label since the examples are all languages; added a third language example.

### Style / pronunciation (1 item)

1. **Where:** field `phrases[6].pronunciation`
   **Was:** `"... ons LANT, yul-YE STAT"`
   **Now:** `"... ons LANT, YUL-ee STAT"`
   **Why:** Stress on `jullie` falls on the first syllable in standard Dutch (/ˈjʏli/). The previous rendering `yul-YE` (a) stressed the wrong syllable and (b) rendered the unstressed -ie as English "YE" (/jeɪ/) which an English-speaking learner would mispronounce. `YUL-ee` puts the stress on the correct syllable and uses the more natural English approximation for /i/.

## Items not applied (2)

1. **Where:** field `phrases[1].pronunciation` — `"het MAY-sye"` for `meisje`
   **Issue:** The `-sye` rendering for `-sje` is awkward — English readers would pronounce it like `/saɪ/`. The actual sound is closer to `/ʃə/` or `/sjə/` (a soft palatalized cluster), better rendered as `MAYS-yuh` or `MEYS-yuh`.
   **Suggested fix:** Change to `"het MAYS-yuh"`.
   **Why not applied:** Confidence below 80% on the best ASCII transliteration — `-sje` is genuinely hard to capture in English-letter approximation, and the chosen form may have been a deliberate authorial choice for visual simplicity. Worth flagging for human review and consistency with other Dutch content files that contain `-sje` diminutives.

2. **Where:** field `phrases[0].pronunciation` — `"de OW-toh"` for `auto`
   **Issue:** Dutch `au` is closer to `/ɑu̯/` (like "ow" in "now") but the rendering combines `OW` + `-toh`. The `-o` of `auto` is a short `/oː/`, not the diphthong `/oʊ/` that `toh` evokes for English readers. Minor.
   **Suggested fix:** Possibly `"de OW-toe"` or `"de OW-to"`.
   **Why not applied:** Low-confidence stylistic call; the existing form is acceptable and consistent with other Dutch files in the repo that use `-toh` for short Dutch /oː/. Skipping to preserve cross-file consistency until a unified pronunciation pass is run.
