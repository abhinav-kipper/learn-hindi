# Audit: hindi-foundation-06-pronouns-verbs

**File:** content/foundations/06-pronouns-verbs.json
**Audit date:** 2026-05-27
**Total fixes applied:** 3
**Items not applied:** 4

## Fixes applied

### Accuracy (3 items)

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

## Items not applied (4)

1. **Where:** field `phrases[7].hindi` (`mujhe lagta hai ki woh nahi aayega`) and pronunciation `MUJH-e LAG-ta hai ki WOH na-HI aa-YE-ga`
   **Issue:** Standard romanization is `nahin` (with nasalization), and Snell & Weightman uses `nahīn`. Stripping the final nasal can blur the distinction between `nahi` and the homophone-ish `nai` (new).
   **Suggested fix:** Normalize to `nahin` throughout the chapter.
   **Why not applied:** Both `nahi` and `nahin` co-occur across the codebase (lessons 02, 03, 04, 05, foundation 04 use `nahin`; foundation 06 and lesson 05's drill page use `nahi`). Per rubric §2.4, debated romanizations are skip-list; this is one of them. Flagging only.

2. **Where:** field `grammar_notes[4]` (Oblique case rule)
   **Issue:** "Oblique case (before postpositions): main→mujh, tu→tujh, woh→us, hum→hum." omits `tum→tum`, `aap→aap`, `yeh→is`, `ye→in`, `ve→un` — and the rule "Add -e/-ko for 'to': mujhe, tujhe" conflates the dative case with oblique formation (`mujhe` is `mujh + ko`-equivalent, not "oblique + e").
   **Suggested fix:** Either expand the grid to all pronouns or add a "(simplified — see expanded table in lesson)" note. Or split oblique-stem rule from dative-formation rule.
   **Why not applied:** Pedagogical-meaning change >20% uncertainty — the current line may be a deliberate beginner-simplification of a topic the chapter is intentionally not unpacking (the chapter focuses on subject pronouns + verb agreement, not the oblique system). Flagging for author review.

3. **Where:** field `phrases[5].context` and `theory.sections[1].quick_check.explanation`
   **Issue:** Both state Hindi 3rd-person distinguishes only proximity (yeh vs woh), but the `jaate hain` line at `phrases[5]` glosses the plural form as flatly "they". In real Hindi, `woh jaate hain` is also the polite/respectful singular ("he/she goes — politely") — same form, different reading. The current gloss may under-prepare learners for the politeness reading.
   **Suggested fix:** Add to context: `jaate hain = they OR he/she-respectful (same form serves both)`.
   **Why not applied:** Adds a layer the chapter hasn't introduced yet (honorific plurality) and may overload phrase 5. Flagging for author review.

4. **Where:** field `phrases[*].pronunciation` (multiple — e.g. `MUJH-e`, `TE-ra`, `BHAI`, `na-HI`)
   **Issue:** CAPS prosody placement varies by sentence position and doesn't always match standard lexical stress in isolation (e.g. `na-HI` puts the beat on the second syllable; in isolation `nahi` is first-syllable-stressed).
   **Suggested fix:** None.
   **Why not applied:** Per CONTENT_RUBRIC §1.3 and §2.4 skip-list, prosodic CAPS is intentional sentence-level stress, not lexical stress, across all 19 Hindi files. Verified non-issue in 2026-05-26 audit notes.
