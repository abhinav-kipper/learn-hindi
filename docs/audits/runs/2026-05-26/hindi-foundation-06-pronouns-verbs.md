# Audit: hindi-foundation-06-pronouns-verbs

**File:** content/foundations/06-pronouns-verbs.json
**Audit date:** 2026-05-27
**Total fixes applied:** 6
**Items not applied:** 6

## Fixes applied

### Accuracy (6 items)

1. **Where:** field `theory.sections[1].table.rows[8]` (Subject pronoun grid)
   **Was:** `["we", "those / they (far)", "plural of woh"]`
   **Now:** `["ve", "those / they (far)", "plural of woh"]`
   **Why:** The plural of `woh` is `ve` (sometimes written `vo`), not `we`. `we` is English for first-person plural and equates to Hindi `hum`. The typo was directly teaching learners a non-existent Hindi pronoun and creating cross-language confusion in a pronoun grid.

2. **Where:** field `theory.sections[2].table.rows[7]` (Present-habitual: karna across all pronouns)
   **Was:** `["ye / we", "karte / karti", "hain"]`
   **Now:** `["ye / ve", "karte / karti", "hain"]`
   **Why:** Same typo carried into the verb-agreement table — the row is meant to cover plural-nearby (`ye`) and plural-far (`ve`) third-person pronouns.

3. **Where:** field `theory.sections[2].quick_check.explanation`
   **Was:** `... aap/hum/ye/we→hain.`
   **Now:** `... aap/hum/ye/ve→hain.`
   **Why:** Same typo carried into the explanation text. Fixed alongside the two table fixes so the chapter is internally consistent.

4. **Where:** field `skill_breakdown[0].explanation`
   **Was:** `... aap+hain, wo+hai (sg) / hain (pl), ham+hain. ...`
   **Now:** `... aap+hain, woh+hai (sg) / hain (pl), hum+hain. ...`
   **Why:** Within-file romanization consistency. Every other reference in this foundation (phrases, grammar_notes, tables, callouts, practice_prompt, quick_checks) uses `woh` and `hum`. The single `wo`/`ham` slip in this skill_breakdown sentence was the only inconsistent spelling in the file.

5. **Where:** field `skill_breakdown[0].more_examples[3].hindi`
   **Was:** `wo school mein hai`
   **Now:** `woh school mein hai`
   **Why:** Same within-file consistency fix — align with the file's standard `woh` spelling.

6. **Where:** field `skill_breakdown[2].more_examples[2].hindi` and `[3].hindi`
   **Was:** `wo Hindi bol raha hai` / `wo Hindi bol rahi hai`
   **Now:** `woh Hindi bol raha hai` / `woh Hindi bol rahi hai`
   **Why:** Same within-file consistency fix.

## Items not applied (6)

1. **Where:** field `phrases[6].hindi` (`aap baitho / tum baitho / tu baith`)
   **Issue:** The standard polite imperative for `aap` is `baithiye` (with `-iye`), not `baitho` (which is the `tum` form). The phrase as written says "AAP" + the `tum`-imperative ending, which is the very register-mismatch the chapter teaches against. The context field even notes "aap baithiye = very polite" without flagging that "aap baitho" itself is the mismatched form.
   **Suggested fix:** Change `aap baitho` → `aap baithiye` so the example demonstrates the correct register pairing.
   **Why not applied:** Colloquial Delhi/UP Hindi does use `aap baitho` as a soft-polite middle register, especially in family contexts (younger relatives addressing slightly-older relatives). It's not unambiguously wrong — confidence below 80% that the author didn't intend to capture that colloquial form. Flagging for author review.

2. **Where:** field `phrases[3].context` (`mera (my-masc), meri (my-fem), mere (my-plural)`)
   **Issue:** `mere` is masculine plural OR masculine oblique singular, not "my-plural" in general. Feminine plural of `mera` remains `meri` (same form as feminine singular). The note as written suggests `mere` covers all plurals.
   **Suggested fix:** Change to `mere (my-masc-plural OR oblique)` or add "masculine plural" explicitly.
   **Why not applied:** Pedagogical-meaning change — the simplification may be intentional at this level (foundation 06 hasn't introduced oblique case yet, and the chapter focuses on subject pronouns + agreement). Flagging for author review.

3. **Where:** field `phrases[7].hindi` (`mujhe lagta hai ki woh nahi aayega`) and pronunciation `MUJH-e LAG-ta hai ki WOH na-HI aa-YE-ga`
   **Issue:** Standard romanization is `nahin` (with nasalization), and Snell & Weightman uses `nahīn`. Stripping the final nasal can blur the distinction between `nahi` and the homophone-ish `nai` (new).
   **Suggested fix:** Normalize to `nahin` throughout the chapter.
   **Why not applied:** Both `nahi` and `nahin` co-occur across the codebase (lessons 02, 03, 04, 05, foundation 04 use `nahin`; foundation 06 and lesson 05's drill page use `nahi`). Per rubric §2.4, debated romanizations are skip-list; this is one of them. Flagging only.

4. **Where:** field `grammar_notes[4]` (Oblique case rule)
   **Issue:** "Oblique case (before postpositions): main→mujh, tu→tujh, woh→us, hum→hum." omits `tum→tum`, `aap→aap`, `yeh→is`, `ye→in`, `ve→un` — and the rule "Add -e/-ko for 'to': mujhe, tujhe" conflates the dative case with oblique formation (`mujhe` is `mujh + ko`-equivalent, not "oblique + e").
   **Suggested fix:** Either expand the grid to all pronouns or add a "(simplified — see expanded table in lesson)" note. Or split oblique-stem rule from dative-formation rule.
   **Why not applied:** Pedagogical-meaning change >20% uncertainty — the current line may be a deliberate beginner-simplification of a topic the chapter is intentionally not unpacking (the chapter focuses on subject pronouns + verb agreement, not the oblique system). Flagging for author review.

5. **Where:** field `phrases[5].context` and `theory.sections[1].quick_check.explanation`
   **Issue:** Both state Hindi 3rd-person distinguishes only proximity (yeh vs woh), but the `jaate hain` line at `phrases[5]` glosses the plural form as flatly "they". In real Hindi, `woh jaate hain` is also the polite/respectful singular ("he/she goes — politely") — same form, different reading. The current gloss may under-prepare learners for the politeness reading.
   **Suggested fix:** Add to context: `jaate hain = they OR he/she-respectful (same form serves both)`.
   **Why not applied:** Adds a layer the chapter hasn't introduced yet (honorific plurality) and may overload phrase 5. Flagging for author review.

6. **Where:** field `phrases[*].pronunciation` (multiple — e.g. `MUJH-e`, `TE-ra`, `BHAI`, `na-HI`)
   **Issue:** CAPS prosody placement varies by sentence position and doesn't always match standard lexical stress in isolation (e.g. `na-HI` puts the beat on the second syllable; in isolation `nahi` is first-syllable-stressed).
   **Suggested fix:** None.
   **Why not applied:** Per CONTENT_RUBRIC §1.3 and §2.4 skip-list, prosodic CAPS is intentional sentence-level stress, not lexical stress, across all 19 Hindi files. Verified non-issue in 2026-05-26 audit notes.
