# Audit: hindi-foundation-08-compound-verbs

**File:** content/foundations/08-compound-verbs.json
**Audit date:** 2026-05-27
**Total fixes applied:** 2
**Items not applied:** 5

## Fixes applied

### Accuracy (2 items)

1. **Where:** field `grammar_notes[4]`
   **Was:** `"'jaa jaana' (go): used with motion or change-of-state verbs to mark completion. 'so jaana' (fall asleep), 'pahunch jaana' (arrive)."`
   **Now:** `"'jaana' (go) as auxiliary: used with motion or change-of-state verbs to mark completion. 'so jaana' (fall asleep), 'pahunch jaana' (arrive)."`
   **Why:** `jaa jaana` literally means "go go" and is not a real compound construction. The auxiliary is `jaana` attached to other V1 stems (so jaana, pahunch jaana). The label was misleading — the other parallel labels (`le lena`, `de dena`) are legitimate self-pairing compounds (lena+lena, dena+dena), but `jaa jaana` is not idiomatic Hindi and was never used in the actual examples below. The theory section already uses just `jaana` correctly throughout.

2. **Where:** field `skill_breakdown[2].skill` and `skill_breakdown[2].explanation`
   **Was:** `skill: "kar dena / jaa jaana / ho jaana"` with explanation `"'jaa jaana' = go (motion / state-completion)..."`
   **Now:** `skill: "kar dena / jaana (as aux) / ho jaana"` with explanation `"'jaana' (as auxiliary) = motion / state-completion..."`
   **Why:** Same fix as above — the auxiliary `jaana` does not pair with itself. Aligned with grammar_notes and the theory body which both use `jaana` as the auxiliary name.

## Items not applied (5)

1. **Where:** field `phrases[1].pronunciation` (`MAIN yeh KAAM kar DOON-gi`) and similar `hoon` / `DOON` formations across other phrases
   **Issue:** Double-vowel `OO` in pronunciation field — rubric 1.3 says `karunga` not `karoongaa`.
   **Suggested fix:** Could be tightened to `DUN-gi` / `hun`.
   **Why not applied:** The `hindi` field uses the correct single-vowel form (`dungi`, `hoon` as-is is consistent codebase usage). The pronunciation field follows the prosodic-stress format which CONTENT.md Audit Notes (2026-05-26) explicitly mark as intentional: "The format is consistent across all 19 Hindi files... intentional. No normalization pass needed." Skipping per debated-romanization carve-out.

2. **Where:** field `phrases[2].hindi` and `pronunciation` (`kitaab` / `ki-TAAB`)
   **Issue:** `kitaab` could be `kitab` per rubric 1.3 ("aa only when ambiguity matters").
   **Suggested fix:** Standardize to `kitab`.
   **Why not applied:** `kitaab` (book) is a widely-accepted alternate spelling in romanized Hindi and consistent with how the codebase represents the long-`aa` in this word. Debated-romanization carve-out per rubric §3.

3. **Where:** field `theory.sections[0].callout.body` ("V1 is always the stem...")
   **Issue:** Slight pedagogical oversimplification — `lagna` actually takes the V1 in oblique-infinitive form (e.g. `rone lagi`), not the bare stem. `theory.sections[2].examples[2].breakdown` correctly notes this for `lagna`, contradicting the earlier blanket claim.
   **Suggested fix:** Reword to "V1 is in stem form for most auxiliaries (lena/dena/jaana/daalna); `lagna` takes the oblique infinitive."
   **Why not applied:** Pedagogical-meaning change; introduces a new caveat early that may overload a beginner. The current sequencing (assert general rule, then note the lagna exception in its own section) is a defensible teaching choice. Flagging for user review.

4. **Where:** field `theory.sections[1].body` (`Maine usse paani pila diya`)
   **Issue:** Indirect object marker `usse` vs `use` (`us-ko`). Both are heard in spoken Hindi for "to him/her" with `pilana`, but `use` may be more standard for the dative/recipient role.
   **Suggested fix:** Possibly `Maine use paani pila diya` or `Maine usko paani pila diya`.
   **Why not applied:** Debated grammar — `usse paani pila diya` is widely attested in spoken Hindi (especially with causative verbs where the agent of the embedded action takes `se`/`ko` variably). Confidence <80%.

5. **Where:** field `theory.sections[1].table.rows[2]` (`peena (drink)` → `pila dena — give a drink to / make someone drink`)
   **Issue:** Row pairs `pee lena` (drink, intransitive aux pairing) against `pila dena` (causative `pilana` + `dena`) — mixing two different verb stems in the same row breaks the "base verb + aux" pattern the table is teaching.
   **Suggested fix:** Either drop the row, or change to `pee dena — drink it (for/on behalf of someone)` to keep the V1 consistent.
   **Why not applied:** Deliberate authorial choice — `pila dena` is the actually-useful real-world phrase (giving someone a drink), whereas `pee dena` is rarely used. The pragmatic value likely outweighs the pattern-purity cost. Flagging for user review.
