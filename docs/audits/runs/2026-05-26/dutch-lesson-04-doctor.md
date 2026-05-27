# Audit: dutch-lesson-04-doctor

**File:** content/dutch/lessons/04-doctor.json
**Audit date:** 2026-05-27
**Total fixes applied:** 1
**Items not applied:** 2

## Fixes applied

### Accuracy (1 item)

1. **Where:** field `practice_prompt` (verbatim opener line)
   **Was:** `"Goedendag, kom u maar binnen. Wat is er aan de hand?"`
   **Now:** `"Goedendag, komt u maar binnen. Wat is er aan de hand?"`
   **Why:** Dutch verb-form / register fix. In standard Netherlandic Dutch the polite invitation uses the indicative `u`-form `komt u (binnen)`, not the bare imperative stem `kom`. Since this prompt drives the AI-tutor for Inburgering exam prep and the prompt itself instructs the tutor to use formal `u` throughout, the verbatim opener must be grammatically correct formal Dutch (rubric 1.2 — Dutch grammar / register consistency).

### Style (0 items)

None applied. AI-cliché openers, throat-clearing, and tautologies are absent across phrases, grammar_notes, culture_notes, skill_breakdown, and the practice_prompt. Pronunciation field formatting (CAPS = sentence stress) is consistent and intentional per the rubric audit notes.

## Items not applied (2)

1. **Where:** field `phrases[0].pronunciation` — `"BOWK"` for `buik`
   **Issue:** `buik` /bœyk/ has the Dutch diphthong `ui`, which is notoriously hard to ASCII-approximate. `BOWK` reads closer to English "bowk" / `/baʊk/` than to the actual sound; alternatives like `BOYK` or `BOEYK` exist in pronunciation-guide conventions but each has trade-offs.
   **Suggested fix:** Possibly `BOYK` or `BUYK` to nudge readers off the English `ow` reading.
   **Why not applied:** Romanization of Dutch `ui` is an unresolved/debated ASCII choice — no single form is canonically right and the rest of the file is internally consistent in its approximations (e.g. `mayn` for `mijn`, `schray-ven` for `schrijven`). Falls into the debated-romanization bucket per rubric 2.4.

2. **Where:** field `phrases[0].pronunciation` — `"RUCH"` for `rug`
   **Issue:** Dutch `g` is /ɣ/ or /x/ (depending on regional accent). `RUCH` is a reasonable ASCII pick (matches the `CH` pattern used in the file for `g`/`ch` sounds, e.g. `CHOOT`, `CHAACH`, `DACH`), but the bare-vowel `U` in `RUCH` may read as English `/ʌ/` rather than Dutch short `/ʏ/`.
   **Suggested fix:** Possibly `RUECH` or leave as is.
   **Why not applied:** Same debated-romanization category — the file's `U`-as-Dutch-short-u convention is applied consistently (`KUNT`, `RUST`, `BUIK`). Changing one without a global rule would create inconsistency. Authorial choice, rubric 2.4.
