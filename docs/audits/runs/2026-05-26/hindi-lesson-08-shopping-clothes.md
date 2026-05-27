# Audit: hindi-lesson-08-shopping-clothes

**File:** content/lessons/08-shopping-clothes.json
**Audit date:** 2026-05-26
**Total fixes applied:** 1
**Items not applied:** 4

## Fixes applied

### Accuracy (1 item)

1. **Where:** field `grammar_notes[1]`
   **Was:** `"Compound verbs of completion: 'le lena' (take up), 'de dena' (give over), 'kar dena' (do over). The second verb adds politeness/finality"`
   **Now:** `"Compound verbs of completion: 'le lena' (take, with finality), 'de dena' (give, hand over), 'kar dena' (do, get it done). The second verb adds politeness/finality"`
   **Why:** English gloss "do over" means "redo" — wrong meaning for `kar dena`, which conveys completion/finality, not repetition. "take up" and "give over" were also loose; revised glosses better signal the completion-compound function rather than implying directional particles.

### Style (0 items)

None applied — prose is tight and on-voice throughout. No AI-cliché openers, no throat-clearing, no tautologies detected.

## Items not applied (4)

1. **Where:** field `phrases[4].context` (`"yeh chhota hai mujhe..."`)
   **Issue:** Speaker is female (cf. `dungi`, `leti hoon` in phrases 7 and 8) and `kameez` is feminine, so strict agreement would yield `chhoti`/`badi`. The phrase uses masculine forms with a context note explaining "yeh refers to the size, not the garment."
   **Suggested fix:** Either (a) switch the phrase to feminine agreement (`yeh chhoti hai mujhe, ek size badi dikhaiye`) to match the established female-speaker thread, or (b) leave with the existing rationale.
   **Why not applied:** Deliberate authorial pedagogical choice — the context note explicitly teaches the "size-as-abstract-masculine" pattern, which is real in colloquial speech. Flipping to feminine would erase a useful nuance. <80% confident the change improves pedagogy.

2. **Where:** field `practice_prompt` (markup price)
   **Issue:** Prompt instructs shopkeeper to "Quote 20-40% above a fair price" but `culture_notes[0]` says "Starting bid: 40-50% of asked price" — implying the asked price runs ~100-150% above fair, not 20-40%. The two numbers contradict.
   **Suggested fix:** Change practice_prompt to "Quote 80-120% above a fair price" (or similar) so the customer's 40-50% counter-bid aligns with the cultural norm taught in culture_notes.
   **Why not applied:** Pedagogical-meaning change touching practice-tutor behavior — needs author review to confirm which side (markup percentage vs. starting-bid percentage) should anchor.

3. **Where:** field `grammar_notes[3]`
   **Issue:** "Future tense feminine: '-ungi/-egi/-engi' for first/second/third person" oversimplifies — `-ungi` is 1st-sg only; `-egi` covers `tu`/`yeh`/`woh` (2nd-sg casual + 3rd-sg); `-engi` covers `tum`/`aap`/plurals. Mapping isn't strictly first/second/third person.
   **Suggested fix:** Reword to "Future tense feminine endings: `-ungi` (main), `-egi` (tu/yeh/woh), `-engi` (tum/aap/plural)."
   **Why not applied:** Pedagogical-meaning change; author may have chosen the simplified frame deliberately for a beginner lesson. Borderline confidence.

4. **Where:** field `phrases[5].pronunciation` and `phrases[6].pronunciation`
   **Issue:** `meh-NGA` (mehnga) and `na-HI` (nahi) place CAPS stress on the second syllable where canonical lexical stress is typically first-syllable.
   **Suggested fix:** None — per CONTENT.md Audit Notes, pronunciation field is sentence-prosodic not lexical, and these reflect the spoken beat of the phrase.
   **Why not applied:** Confirmed intentional per the 2026-05-26 audit notes — prosodic stress, not a bug.
