# Audit: dutch-lesson-02-introductions

**File:** content/dutch/lessons/02-introductions.json
**Audit date:** 2026-05-26
**Total fixes applied:** 2
**Items not applied:** 3

## Fixes applied

### Accuracy (2 items)

1. **Where:** field `skill_breakdown[0].more_examples[1].hindi`
   **Was:** `"Ik stell mezelf even voor."`
   **Now:** `"Ik stel mezelf even voor."`
   **Why:** Dutch first-person singular of `stellen` is `ik stel` (single `l`). `stell` is a typo — the form does not exist in Dutch verb conjugation.

2. **Where:** field `phrases[4].pronunciation`
   **Was:** `"SPRAYK ye ook NAY-der-lants? ik LAYR het NOK. mayn NAY-der-lants is NEET zo CHOOT."`
   **Now:** `"SPRAYK ye ook NAY-der-lants? ik LAYR het NOCH. mayn NAY-der-lants is NEET zo CHOOT."`
   **Why:** Inconsistent romanization of the Dutch soft-G. Every other instance in the file renders Dutch `g`/`ch` as `CH` (CHAAT, CHOOT, CHOW, DACH, NOH-dich, etc.). `NOK` for `nog` reads as a hard /k/ and breaks the file's own convention.

## Items not applied (3)

1. **Where:** field `skill_breakdown[0].more_examples[2]`
   **Issue:** `"Heb jij hier lang gewoond?"` translated as "Have you lived here long?" — for an ongoing-residence question, idiomatic Dutch uses present tense (`Woon je hier al lang?`). The perfect-tense form implies the person no longer lives there.
   **Suggested fix:** Replace with `"Woon je hier al lang?"` or adjust English to "Did you live here long?" if past-tense was intended.
   **Why not applied:** Pedagogical-meaning change. The perfect construction is grammatically valid Dutch, and the author may have intentionally chosen it to demonstrate perfect tense (the practice_prompt explicitly mentions "mixing present and perfect tenses").

2. **Where:** field `phrases[2].pronunciation`
   **Issue:** `"NIOW-we"` for `nieuwe` is a non-standard romanization. Standard Dutch `nieuwe` is closer to `NEE-vuh` or `NYOO-we`.
   **Suggested fix:** `NYOO-we` or `NEE-uw-e`.
   **Why not applied:** Romanization preference call; the existing form does convey the glide. Falls under debated romanization (rubric §2.4 skip list).

3. **Where:** field `phrases[1].pronunciation`
   **Issue:** `"owt"` for `uit` and `"HEER"` for `hier` are rough approximations. Dutch `uit` is closer to `out` (with rounded `oet`), and `hier` is closer to `heer` (correct vowel but no length marker).
   **Suggested fix:** Possibly `"oyt"` for `uit`; `HEER` is actually a reasonable approximation.
   **Why not applied:** Debated romanization; the current forms are consistent with English-speaker phonetic intuition which is likely the target audience. Per rubric §2.4 skip list.
