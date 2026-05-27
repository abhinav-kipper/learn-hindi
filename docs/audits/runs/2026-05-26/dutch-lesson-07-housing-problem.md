# Audit: dutch-lesson-07-housing-problem

**File:** content/dutch/lessons/07-housing-problem.json
**Audit date:** 2026-05-27
**Total fixes applied:** 1
**Items not applied:** 3

## Fixes applied

### Accuracy (1 item)

1. **Where:** field `skill_breakdown[0].more_examples[4].hindi`
   **Was:** `"Er loopt water onder de keuken door."`
   **Now:** `"Er loopt water onder de keukenvloer door."`
   **Why:** Dutch/English mismatch. English gloss is "Water is leaking under the kitchen floor" but the Dutch lacks any word for "floor" (vloer). `onder de keuken door` literally = "underneath the kitchen (through)", which is unidiomatic on its own — a Dutch speaker would name the surface (`keukenvloer`, `tegels`, `kast`). Adding `keukenvloer` matches the English gloss exactly and produces natural Dutch. Per §1.4 ("Examples actually demonstrate the rule being taught") and §1.2 (Dutch grammar / idiomaticity).

## Items not applied (3)

1. **Where:** field `phrases[2].hindi`
   **Issue:** Word order `"Het is kapot gegaan gisternacht"` places the time adverb after the past participle. More natural Dutch is `"Het is gisternacht kapot gegaan"` (time before past participle per TMP / mid-field rules) or fronted `"Gisternacht is het kapot gegaan"`. The current form is acceptable as an afterthought in spoken phone-call register, marked by the dash that follows.
   **Suggested fix:** Move `gisternacht` before `kapot gegaan`, or front it: `"Gisternacht is het kapot gegaan — plotseling stopte het gewoon."`
   **Why not applied:** Deliberate authorial choice — the dash-and-elaboration cadence reads as natural spoken Dutch where time can be tacked on as clarification. Confidence <80% the original is wrong.

2. **Where:** field `grammar_notes[0]`
   **Issue:** `kapot gaan` is described as a separable verb. Strictly, `kapot` is more a predicative complement than a true separable prefix, though dictionaries (Van Dale) do list `kapotgaan` as separable.
   **Suggested fix:** Could rephrase as "Verb-particle construction 'kapot gaan'..." for stricter accuracy.
   **Why not applied:** Pedagogical-meaning change; the dictionary treatment supports the lesson's framing, and the simplification is useful at A2.

3. **Where:** `phrases[*].pronunciation` (e.g. `HEUR-der`, `HEUR-ko-mi-see` for the Dutch `uu` /y/, `mon-TUR` for `eu` /øː/)
   **Issue:** Anglicized approximations that conflate Dutch `uu` and `eu` (both rendered as `EUR`/`UR`) and use `CH` for both /x/ and /ɣ/. Phonetically imprecise.
   **Suggested fix:** Could use IPA or differentiate `uu` (`EW`/`U`) from `eu` (`UR`/`EU`).
   **Why not applied:** Deliberate authorial choice — the entire Dutch corpus uses the same English-reader-friendly approximation system; changing one file would break consistency. The §1.3 audit note on prosodic stress format extends to this transliteration convention.

## Notes from the pass

- All 10 phrases use formal `u`/`uw` register consistently — no `je`/`u` cross-contamination.
- V2 respected throughout main clauses; subordinate-clause-verb-final rule respected in `Als de monteur niet komt, moet ik...` (main clause inverts after fronted subordinate) and the `om...te + infinitive` construction in phrase 5 puts `repareren` correctly at the end.
- Perfect-tense auxiliary `zijn` correctly used with `gaan` (`Het is kapot gegaan`) — change-of-state verb per §1.2.
- Article gender correct: `de verwarming`, `het raam`, `de monteur`, `de boiler`, `de cv-ketel`, `de Huurcommissie`.
- Adjective endings correct: `kleine kinderen` (`-e` on de-word plural), `warm water` (no `-e` on het-word indefinite mass), `vreemd geluid` (no `-e` on `een + het-word`).
- Cultural / factual claims accurate: 24-hour urgent-repair window, Huurcommissie / Huurteam / Juridisch Loket roles, woningcorporatie storingsdienst, NL technician morning (8–12) / afternoon (12–17) windows.
- All structural fields present: `id`, `title`, `situation`, `skills`, `phrases`, `grammar_notes`, `culture_notes`, `skill_breakdown` (3 entries matching declared skills), `practice_prompt`, `references` (2 entries, non-empty), `level` (A2), `exam_targeted` (true).
- JSON parses successfully after edits.
- Practice prompt is in directive system-prompt voice with formal `u` instruction and a concrete opener line.
- No AI-cliché openers, no throat-clearing, no padded explanations in context fields or grammar notes.
