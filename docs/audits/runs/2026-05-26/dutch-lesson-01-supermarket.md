# Audit: dutch-lesson-01-supermarket

**File:** content/dutch/lessons/01-supermarket.json
**Audit date:** 2026-05-26
**Total fixes applied:** 1
**Items not applied:** 4

## Fixes applied

### Accuracy (1 item)

1. **Where:** field `phrases[6].pronunciation`
   **Was:** `ek-su-ZAYR, ik ZOOK de... AF-day-ling. KUNT u may HEL-pen?`
   **Now:** `eks-kuu-ZAYR, ik ZOOK de... AF-day-ling. KUNT u may HEL-pen?`
   **Why:** "Excuseer" is /ɛks.kyˈzeːr/ — the original rendering dropped the "k" of the "ex-" onset and replaced the front-rounded "uu" /y/ with a schwa-ish "u". The corrected form better cues a learner to the actual sounds (eks-kuu-ZAYR).

## Items not applied (4)

1. **Where:** top-level — missing `references[]`
   **Issue:** Rubric §1.6 lists `references[]` as required for lessons. This file has none. However, the older casual Dutch A1 lessons (01–05) all lack it, while only the newer exam-targeted ones (06–11) include it.
   **Suggested fix:** Add a `references[]` array citing the source materials used to author the lesson (e.g. Albert Heijn shop-language guides, an A1 Dutch coursebook).
   **Why not applied:** This is a consistent authorial pattern across the older Dutch lessons — likely a deliberate scoping decision (casual lessons unsourced, exam-targeted ones sourced). Not a clear-confidence fix to introduce one-off here.

2. **Where:** field `phrases[1].pronunciation`
   **Issue:** `byo-LOH-gi-se MELK` for "biologische melk". The Dutch "g" in "-gische" is a fricative /ɣ/ or /x/, not a stop /g/. Most of the rest of this lesson renders it as "ch" (e.g. `wisselgeld` → `WIS-sel-chelt`).
   **Suggested fix:** `bee-oh-LOH-ghee-se` or `bee-oh-LOH-khi-se MELK`.
   **Why not applied:** Romanization style for soft Dutch "g" varies across the codebase; this would be a pedagogical-meaning nudge with <80% confidence on the exact preferred form. Flagging for the author.

3. **Where:** field `phrases[2].pronunciation`
   **Issue:** `HOO-feel KOST dit?` — "Hoeveel" is /ˈɦuː.veːl/. The "v" is voiced; "feel" reads as English "feel" rather than the Dutch vowel /eː/.
   **Suggested fix:** `HOO-vayl KOST dit?` to better cue both the voiced v and the /eː/ vowel.
   **Why not applied:** Borderline — Dutch "v" devoices in some positions and learners often hear it as "f". The current form is intelligible. Romanization-debate adjacent.

4. **Where:** field `phrases[3].pronunciation`
   **Issue:** `MACH ik uhn TAS-ye?` — the Dutch diminutive "-je" is /jə/ or /ʃə/. "ye" reads as English /ji/, which mis-cues the schwa.
   **Suggested fix:** `MACH ik uhn TAS-yuh?` (or `TASH-uh` if the lesson author prefers the /ʃə/ allophone).
   **Why not applied:** The schwa-at-end-of-syllable convention is not enforced consistently across other Dutch files; this is a stylistic call best left to the author.
