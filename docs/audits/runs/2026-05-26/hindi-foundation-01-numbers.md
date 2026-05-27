# Audit: hindi-foundation-01-numbers

**File:** content/foundations/01-numbers.json
**Audit date:** 2026-05-27
**Total fixes applied:** 1
**Items not applied:** 5

## Fixes applied

### Accuracy (1 item)

1. **Where:** field `skill_breakdown[2].explanation` (Ordinals)
   **Was:** `chauthaa (fourth), paanchvaan (fifth)`
   **Now:** `chautha (fourth), paanchvaan (fifth)`
   **Why:** Single-vowel ending per rubric §1.3 — `chauthaa` → `chautha`. Matches the file's own style elsewhere (`pehla`, `dusra`, `tisra` all use single-vowel endings in the same line). `paanchvaan` left untouched: `-vaan` is the standard ordinal suffix where the `aa` is a genuine long vowel (debated romanization, per §2.4 skip-list).

## Items not applied (5)

1. **Where:** field `skill_breakdown[2].explanation` (Ordinals rule)
   **Issue:** Pedagogical inaccuracy. The text says "After third, just attach '-vaan' to the cardinal: chautha (fourth), paanchvaan (fifth)." But `chautha` (चौथा) is itself irregular — it does NOT use the `-vaan` suffix. The `-vaan` rule actually kicks in from 5th onwards (paanchvaan, chhevaan, saatvaan...). Listing `chautha` as the first example of the `-vaan` rule contradicts the rule.
   **Suggested fix:** Either drop `chautha` from the rule-example list and move it to the irregular set with pehla/dusra/tisra (i.e., 1st-4th are irregular, `-vaan` starts at 5th), or rephrase: "After fourth, attach '-vaan' to the cardinal: paanchvaan (fifth), chhevaan (sixth)..."
   **Why not applied:** Pedagogical-meaning change touching the rule's scope. Flagging for author review per rubric §3.

2. **Where:** field `phrases[2].hindi` / `phrases[3].hindi` vs `theory.sections[1].table.rows` (Teen number romanization)
   **Issue:** Internal inconsistency. Phrase list uses `gyarah, atharah, unnis` (shorter medial vowels) while the theory table uses `gyaarah, athaarah, unnees` (longer). Both forms appear in the codebase generally, but within this single file the learner sees both spellings of the same word.
   **Suggested fix:** Pick one. The theory-table forms (`gyaarah`, `athaarah`, `unnees`) are closer to standard Devanagari long-vowel mappings (ग्यारह, अठारह, उन्नीस); the phrase-list forms are tighter. Recommend aligning phrases to theory.
   **Why not applied:** Debated medial-vowel romanization per rubric §2.4 / §3 skip list. The rubric's single-vowel rule is for endings (kartaa → karta), not medial `aa` in number stems.

3. **Where:** field `phrases[7].pronunciation` and several others
   **Issue:** Prosodic stress placement (e.g., `TEEN ba-JE MIL-te hain`, `EK GHAN-ta mein AA jau-NGA`, `KIT-ne ka hai? — PAANCH sau ru-PA-ye`) doesn't always match canonical lexical stress in isolation — `ba-JE` rather than the more usual `BA-je`, `jau-NGA` rather than `JA-un-ga`, etc.
   **Suggested fix:** None — verified intentional per CONTENT.md audit notes (sentence-level prosody, not lexical stress, is what the CAPS marks).
   **Why not applied:** Per rubric §1.3 and §2.4 skip-list, prosodic CAPS is intentional across all 19 Hindi files.

4. **Where:** field `phrases[4].hindi` / `phrases[4].english`
   **Issue:** The decade list deliberately skips 70 — hindi reads `tees, chaalees, pachaas, saath, assi, nabbe, sau` mapped to `30, 40, 50, 60, 80, 90, 100`. The context line acknowledges this: "Note: 70 is 'sattar', we skipped it above." Skipping a decade in a counting drill is unusual.
   **Suggested fix:** Include `sattar` in the list (rendering `tees, chaalees, pachaas, saath, sattar, assi, nabbe, sau` → `30, 40, 50, 60, 70, 80, 90, 100`) and drop the "we skipped it" caveat. The theory section already lists all eight decade words including sattar.
   **Why not applied:** Looks like a deliberate authorial choice (the gap is called out explicitly in context). Flagging for review per rubric §3 — author may have skipped it for pacing reasons in the phrase card.

5. **Where:** field `theory.sections[0].cutting_intro`
   **Issue:** Opens with "Let's start at the top." The rubric §2.1 lists "Let's dive in!" / "Let's explore" as AI-cliché openers to strip. "Let's start at the top" is in the same family.
   **Suggested fix:** Rephrase to a direct Cutting voice opener, e.g. "These ten are the building blocks — once they're in your head, everything else stacks on top." (i.e., delete the opener sentence, lead with the substantive line).
   **Why not applied:** Cutting-voice cutting_intro is allowed to be conversational per §2.3, and "Let's start at the top" is closer to direct framing than the banned "Let's dive in" / "Welcome to your journey." Borderline — flagging rather than auto-applying.
