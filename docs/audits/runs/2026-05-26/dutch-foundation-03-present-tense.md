# Audit: dutch-foundation-03-present-tense

**File:** content/dutch/foundations/03-present-tense.json
**Audit date:** 2026-05-26
**Total fixes applied:** 1
**Items not applied:** 4

## Fixes applied

### Accuracy (1 item)

1. **Where:** field `culture_notes[2]`
   **Was:** `"The verb 'zijn' also means 'their' — 'hun' is also their but used differently. This trips up learners"`
   **Now:** `"The word 'zijn' is both the verb 'to be' AND the possessive 'his' — 'zijn boek' = 'his book'. The possessive 'their' is 'hun'. Context tells them apart"`
   **Why:** Factual error. `zijn` as a possessive means "his" (third-person singular masculine/neuter), not "their". `hun` is the third-person plural possessive ("their"). The original note was confusingly worded and pedagogically wrong — it would have planted a misconception in learners. High-confidence Dutch-grammar correction (rubric §1.2 / §1.5 — official terms/grammar).

## Items not applied (4)

1. **Where:** field `phrases[1].context`
   **Issue:** Says "When the stem ends in 'v' or 'z', it reverts to 'f' or 's' for ik/jij/hij". The framing is slightly imprecise — the stem itself ends in `f`/`s` (because Dutch doesn't allow final `v`/`z`), so all singular forms (built off the stem) carry the devoiced consonant. The plural reverts to the infinitive spelling where `v`/`z` are word-internal. Saying it "reverts for ik/jij/hij" mixes cause and effect.
   **Suggested fix:** Rephrase as "Dutch doesn't allow final `v` or `z` — so the stem itself devoices: `leven` → stem `leef`. Plurals (`wij leven`) keep `v`/`z` because they're no longer word-final."
   **Why not applied:** The current wording is functionally correct in effect (the learner gets the right forms) and is consistent with the more accurate theory section later in the same file (`theory.sections[3]`). Rewriting risks creating tension between the phrase context and the theory body. Pedagogical-meaning change <80% confidence — flagging for author review.

2. **Where:** field `theory.sections[1].table` — `u` ending
   **Issue:** Table groups `jij / u` as both taking `-t`. Standard formal Dutch indeed gives `u werkt`, `u bent`, but with `hebben` both `u hebt` and `u heeft` are accepted (the table elsewhere shows only `u hebt`). Pedagogically simplified.
   **Suggested fix:** Either add a footnote that `u heeft` is also correct (more formal/older), or accept the simplification.
   **Why not applied:** The simplification is reasonable for an A1 learner — exposing the `u hebt`/`u heeft` variation would muddy the rhythm-of-three teaching. Likely deliberate authorial choice.

3. **Where:** field `culture_notes[0]`
   **Issue:** "Dutch has two forms of 'you': 'jij/je' (informal) and 'u' (formal)" — omits `jullie` (plural you).
   **Suggested fix:** Add: "Plural 'you' is `jullie` (informal). `u` covers both singular and plural in formal register."
   **Why not applied:** The lesson is scoped to singular forms in this culture note; `jullie` appears in all the conjugation tables. Adding a culture note about plural would be additive content, not a fix. Flagging only.

4. **Where:** field `phrases[5].pronunciation`
   **Issue:** `hep YAY tayt?` — the `hep` correctly shows the final-devoicing of `heb` → /hɛp/, but a learner reading raw `hep` might not realize the spelling is `heb`. The rest of the file shows the spelled form (e.g. `HEB-ben`, `ik HEB`).
   **Suggested fix:** Possibly use `heb YAY tayt?` to match orthography even though /b/ devoices to [p] in word-final position. Or add a parenthetical pronunciation note.
   **Why not applied:** Pronunciation field policy elsewhere in the codebase reflects actual phonetic realization (cf. rubric §1.3 audit notes — prosodic, not lexical). The /p/ realization is genuinely what's pronounced. Debated style choice — flagging only.
