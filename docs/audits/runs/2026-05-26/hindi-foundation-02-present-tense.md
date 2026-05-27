# Audit: hindi-foundation-02-present-tense

**File:** content/foundations/02-present-tense.json
**Audit date:** 2026-05-26
**Total fixes applied:** 2
**Items not applied:** 4

## Fixes applied

### Accuracy (1 item)

1. **Where:** field `skill_breakdown[2].explanation`
   **Was:** `'yeh ladki accchi hai'`
   **Now:** `'yeh ladki acchi hai'`
   **Why:** Typo — three `c`s instead of two. Every other instance of this adjective in the codebase (vocabulary.json, lessons 01/04, foundation 07, etc.) uses `acchi`. Clear spelling error.

### Style (1 item)

1. **Where:** field `skill_breakdown[1].more_examples[2].hindi`
   **Was:** `"ham TV dekh rahe hain"`
   **Now:** `"hum TV dekh rahe hain"`
   **Why:** Internal consistency. The rest of the file uses `hum` consistently (phrase 5, table rows, callouts, and the other two skill_breakdown sections). `hum` is also the dominant convention across the codebase (~41 occurrences vs ~11 for `ham`). The lone `ham` here was an inconsistency, not an intentional dialect choice.

## Items not applied (4)

1. **Where:** field `skill_breakdown[*].more_examples` — pronouns `wo` vs `woh`
   **Issue:** The file's main `phrases[]` use `woh` (phrases 2, 4, 8 plus theory tables), but `skill_breakdown[0]` and `skill_breakdown[1]` examples use `wo`.
   **Suggested fix:** Standardize on one spelling within the file.
   **Why not applied:** `wo` vs `woh` is a debated romanization — both forms appear throughout the codebase (`woh` in phrases, `wo` in some breakdowns and other foundation files). Per rubric §2.4, debated romanizations are skipped. Flagging for editorial decision.

2. **Where:** field `skill_breakdown[*]` and `theory.sections[3].examples` — `bachhe` spelling
   **Issue:** `bachhe` (children) is non-standard — the Devanagari is बच्चे which is more commonly romanized `bacche` or `bachche`.
   **Suggested fix:** Pick `bacche` (matches vocabulary.json) or `bachche` (matches foundation 05).
   **Why not applied:** The codebase is split: `bachhe` appears in foundation 08 too, `bachche` in foundation 05, `bacche` in vocabulary.json. Debated romanization per §2.4; would require a project-wide standardization pass, not a single-file fix.

3. **Where:** field `phrases[8].pronunciation` (and skill_breakdown peeti/peete forms)
   **Issue:** `PEE-te` uses long `ee` for the verb root पी; rubric §1.3 prefers single-vowel where unambiguous, but the long `ee` is widely used for this root in the codebase.
   **Suggested fix:** Possibly normalize to `pi-te`/`pi-ti` to match other single-vowel preferences (`karta`, `gaya`).
   **Why not applied:** The root पी genuinely has a long ī sound; `pee` carries pronunciation information `pi` would lose. Debated romanization area — flagging only.

4. **Where:** field `theory.sections[3].body`
   **Issue:** Says "feminine plural subjects keep the singular feminine form... there's no logical rule, it's just historical." Pedagogically this is a slight simplification — the form is actually the same because Hindi feminine `-i` plural for these verb adjectives doesn't take a separate `-ī̃` nasalized form when followed by a plural auxiliary; the nasalization shifts onto the auxiliary `hain`.
   **Suggested fix:** Possibly add "the nasalization shifts onto the auxiliary `hain`" as a one-line linguistic note.
   **Why not applied:** Pedagogical-meaning change at <80% confidence — the simplification ("just memorize it") may be deliberate for A1/A2 learners. Adding the nasalization detail could overwhelm at this level. Flagging for author review.
