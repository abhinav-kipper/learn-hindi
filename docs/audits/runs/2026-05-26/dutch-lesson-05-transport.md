# Audit: dutch-lesson-05-transport

**File:** content/dutch/lessons/05-transport.json
**Audit date:** 2026-05-26
**Total fixes applied:** 1
**Items not applied:** 3

## Fixes applied

### Accuracy (1 item)

1. **Where:** field `phrases[3].pronunciation`
   **Was:** `is DIT de YOW-ste TRAM voor het RAYKS-mu-SAY-um?`
   **Now:** `is DIT de YOW-ste TRAM voor het RAYKS-mu-ZAY-um?`
   **Why:** Dutch "museum" /myˈzeː.ʏm/ has a voiced /z/ in the second syllable, not /s/. The English-style "SAY" misleads learners into devoicing the s. "ZAY" matches the Dutch pronunciation.

### Style (0 items)

None.

### Structural (0 items)

None — JSON parses, schema is complete, all required fields present (id, title, situation, skills, phrases, grammar_notes, culture_notes, skill_breakdown, practice_prompt, level, exam_targeted).

## Items not applied (3)

1. **Where:** field `phrases[4].pronunciation` (and similar separable-verb infinitives elsewhere)
   **Issue:** `OH-ver-STAP-pen` for "overstappen" places primary stress on the second element; in Dutch separable verbs the prefix usually carries primary stress (`OH-ver-stap-pen`).
   **Suggested fix:** Move CAPS to the prefix: `OH-ver-stap-pen`.
   **Why not applied:** Per CONTENT.md audit notes, the pronunciation field encodes sentence-level prosodic stress, not lexical stress. The author may have intentionally placed beat on the stem to match the spoken rhythm of the full question. Pedagogical-meaning change, <80% confident — flag for review.

2. **Where:** field `phrases[0].pronunciation`
   **Issue:** `re-TOUR` for "retour" — Dutch pronunciation is closer to "ruh-TOOR" (the "ou" is /uː/, not the English diphthong /aʊ/). "TOUR" risks an English-flavoured read.
   **Suggested fix:** `ruh-TOOR`.
   **Why not applied:** Romanization of foreign-loan vowels in the pronunciation field is a debated style call — the file consistently uses English-orthography approximations ("TOUR", "RAYS", "BLEEFT") and changing this one breaks that internal consistency. Flag for a wider romanization-style decision rather than a one-off fix.

3. **Where:** field `phrases[6].pronunciation`
   **Issue:** `HOO-feel` for "hoeveel" represents the /v/ as voiceless /f/. Dutch "v" in "veel" is typically voiced /v/, so "HOO-vayl" would be more accurate.
   **Suggested fix:** `HOO-vayl`.
   **Why not applied:** Many Northern Dutch speakers do devoice initial /v/ to [f] in casual speech, so "HOO-feel" is defensible as a realistic phonetic transcription. Debated regional/phonetic choice — skip per rubric §3.
