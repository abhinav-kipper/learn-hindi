# Audit: hindi-foundation-04-future-tense

**File:** content/foundations/04-future-tense.json
**Audit date:** 2026-05-26
**Total fixes applied:** 4
**Items not applied:** 3

## Fixes applied

### Accuracy (4 items)

1. **Where:** field `skill_breakdown[0].more_examples[1].hindi`
   **Was:** `wo dilli jaayega`
   **Now:** `woh dilli jaayega`
   **Why:** Pronoun consistency. The file uses `woh` throughout (phrases, grammar_notes, theory, table); `wo` was a stray short form. Aligns with §1.3 register/style consistency.

2. **Where:** field `skill_breakdown[0].more_examples[2].hindi`
   **Was:** `ham agle saal milenge`
   **Now:** `hum agle saal milenge`
   **Why:** Pronoun consistency. The file uses `hum` throughout the rest of the document. Brings romanization in line with the phrases table and theory section.

3. **Where:** field `skill_breakdown[1].more_examples[3].hindi`
   **Was:** `ham sabko milkar kaam karna padega`
   **Now:** `hum sabko milkar kaam karna padega`
   **Why:** Same `ham` → `hum` consistency fix.

4. **Where:** field `grammar_notes[1]`
   **Was:** `'jaana'→root 'jaa': jaunga, jayega, jaoge, jayenge. 'khaana'→root 'kha': khaunga, khayega, khaoge, khayenge`
   **Now:** `'jaana'→root 'jaa': jaaunga, jaayega, jaaoge, jaayenge. 'khaana'→root 'khaa': khaaunga, khaayega, khaaoge, khaayenge`
   **Why:** The note itself declares the root as `jaa` / `khaa` (long-aa), then immediately renders the conjugated forms with a short `ja`/`kha`. The rest of the file consistently uses the long-aa forms (`aaunga`, `khaaunga`, `aayenge`, `jaayenge` in theory examples, phrases, and skill_breakdown). Fixing the inconsistency so the rule and the demonstration match.

## Items not applied (3)

1. **Where:** field `grammar_notes[3]`
   **Issue:** Lists `houngi` as "I-fem will be" form of `hona`. The conventional written form is `hoongi` (or `hungi` in single-vowel style). `houngi` is a literal additive `ho` + `ungi` construction which matches the lesson's rule but is non-standard orthography. Also: the masculine first-person form (`hounga`/`hoonga`) is missing.
   **Suggested fix:** Either change to `hoongi` (and add `hoonga`) for the conventional written form, or keep `houngi` if you're committing to the strictly additive teaching model. Add the masculine first-person form for parity.
   **Why not applied:** Pedagogical-meaning choice — the lesson teaches root+ending as fully additive, and `houngi` is internally consistent with that model. <80% confident the author wants the conventional form over the rule-consistent form.

2. **Where:** field `practice_prompt`
   **Issue:** Opens with `chaliye future tense practice karte hain` — a first-person plural ("let's") opener. Per rubric §2.3, practice prompts should be directive ("You are X..."), not "let's".
   **Suggested fix:** Reframe the opener as a directive instruction the tutor speaks to the student (e.g., `aaiye future tense practice karein` or just `chaliye, pehla sawal`).
   **Why not applied:** The `chaliye ... karte hain` opener is in-voice for the AI tutor character (it's what the tutor says to the student, not how the prompt instructs the AI). Looks like a deliberate authorial choice for warmth. Per §3, skip when the issue could be a deliberate voice/register choice.

3. **Where:** field `phrases[7].pronunciation`
   **Issue:** `MAIN ab-HI aa-TA hoon` — stresses the second syllable of `abhi`. In isolation `abhi` is typically stressed on the first syllable (`AB-hi`).
   **Suggested fix:** `MAIN AB-hi aa-TA hoon` if lexical stress is desired.
   **Why not applied:** Per CONTENT.md Audit Notes (2026-05-26) and rubric §1.3, CAPS marks prosodic sentence-level stress, not lexical word stress. Skipping — intentional, not a bug.
