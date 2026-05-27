# Audit: dutch-foundation-01-numbers

**File:** content/dutch/foundations/01-numbers.json
**Audit date:** 2026-05-26
**Total fixes applied:** 2
**Items not applied:** 4

## Fixes applied

### Accuracy (2 items)

1. **Where:** field `phrases[2].pronunciation` (days-of-week)
   **Was:** `MAAN-dach, DINS-dach, WOENS-dach, DON-der-dach, VRAY-dach, ZAA-ter-dach, ZON-dach`
   **Now:** `MAAN-dach, DINS-dach, WOONS-dach, DON-der-dach, VRAY-dach, ZAA-ter-dach, ZON-dach`
   **Why:** Dutch digraph `oe` is /uː/ (English "oo"), so `woensdag` is pronounced `WOONS-dach`, not `WOENS-dach`. The latter just transliterates the spelling. The body theory section in this same file already gives the correct `WOONS-dach` rendering ("roughly `WOONS-dach`"), so the phrase pronunciation field was the inconsistent one.

2. **Where:** field `phrases[2].context` (days-of-week)
   **Was:** `"... 'Woensdag' (Wednesday) is tricky — it's WOENS-dach. ..."`
   **Now:** `"... 'Woensdag' (Wednesday) is tricky — the 'oe' sounds like English 'oo', so it's WOONS-dach. ..."`
   **Why:** Same fix as #1, plus a one-line explanation of why so the learner understands the `oe` digraph rule (small pedagogical add, no meaning change).

## Items not applied (4)

1. **Where:** `phrases[3].pronunciation` (months)
   **Issue:** `januari` rendered as `ya-new-AA-ri`. The Dutch `u` is the front-rounded vowel /y/ (like German `ü`), which the syllable `new` approximates poorly. `februari` has the same issue (`feb-ru-AA-ri`).
   **Suggested fix:** Replace with a syllable that hints at the rounded vowel, e.g. `ya-NWAH-ri` or `ya-noo-AA-ri`.
   **Why not applied:** All ASCII transliterations of Dutch `u` are lossy; the existing form is a documented compromise across the codebase. Changing it here would diverge from sibling pronunciation fields elsewhere. Defer to a separate Dutch-romanization style pass.

2. **Where:** `theory.sections[0].body` ("vijf rhymes with `safe`") vs `phrases[0].context` ("vijf sounds like vayf")
   **Issue:** `vijf` is /ʋɛi̯f/. "Rhymes with safe" suggests /eɪf/ (slightly too closed); "fife" /aɪf/ is a closer English-rhyme. Internal voice is mostly consistent but `safe` is a mild approximation.
   **Suggested fix:** Change `safe` to `fife` in the theory body.
   **Why not applied:** The Dutch `ij`/`ei` diphthong is acknowledged as a tricky English-rhyme target (lives between /eɪ/ and /aɪ/); "safe" is a defensible regional approximation, especially for Randstad speech. <80% confidence the change is unambiguously better.

3. **Where:** `phrases[3].pronunciation` — `mei` rendered as `may`
   **Issue:** `mei` is /mɛi̯/, sounding closer to English "my" than "may" (which is /meɪ/).
   **Suggested fix:** `MY` (caps) instead of `may`.
   **Why not applied:** Same approximation question as #2 — the `ei` digraph lives between /eɪ/ and /aɪ/, and "may" preserves the spelling correspondence for the learner. Pedagogical trade-off, not a clear-confidence fix.

4. **Where:** `practice_prompt`
   **Issue:** Opens with "Goedendag! Laten we beginnen met cijfers." `Laten we` ("Let's") is the kind of throat-clearing the rubric §2.1 flags in English.
   **Suggested fix:** Replace with a directive opener like "We beginnen met cijfers." or "Eerste vraag:".
   **Why not applied:** The line is in-character Dutch dialogue spoken by the AI tutor at the start of a session (not English meta-instructions to the model). `Laten we beginnen met...` is the conventional Dutch teacher opening — stripping it would make the tutor sound clinical. The rubric's anti-`Let's` rule targets English authorial voice, not Dutch in-character utterance.

## Notes

- V2 rule, separable verbs, perfect-tense auxiliaries, and kofschip were checked across all body prose and phrase examples — nothing this foundation covers triggers those rules (no perfect-tense or subordinate-clause sentences appear in the content).
- `de`/`het` agreement verified on the two articles in `phrases`: `In welk jaar?` (jaar = het-word → `welk`, correct), `Welke datum?` (datum = de-word → `welke`, correct).
- Compound-number grammar (`eenentwintig`, `vijfenveertig`, `negenennegentig`, `tweeduizend zesentwintig`) all correct.
- `tachtig` (80) irregularity correctly noted.
- Time-telling `half drie` = 2:30 logic consistent throughout — including the trickier `vijf voor half vier` (3:25) and `vijf over half vier` (3:35) edge cases. All correct.
- All four `quick_check.correct_index` values verified against the option text.
- `tweeduizend drieëntwintig` (2023) and `tweeduizend zesentwintig` (2026) use the correct diaeresis on the second `e` of `drieën` — preserved.
