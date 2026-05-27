# Audit: hindi-foundation-01-numbers

**File:** content/foundations/01-numbers.json
**Audit date:** 2026-05-27
**Total fixes applied:** 1
**Items not applied:** 4

(Re-audit — builds on the prior 2026-05-27 pass that flagged the ordinals rule. This run applies that fix.)

## Fixes applied

### Accuracy (1 item)

1. **Where:** field `skill_breakdown[2].explanation` ("Ordinals (pehla/dusra/tisra)")
   **Was:** "Ordinals agree with the gender of the noun they modify: pehla/pehli (first M/F), dusra/dusri (second), tisra/tisri (third). After third, just attach '-vaan' to the cardinal: chautha (fourth), paanchvaan (fifth)."
   **Now:** "Ordinals agree with the gender of the noun they modify: pehla/pehli (first M/F), dusra/dusri (second), tisra/tisri (third), chautha/chauthi (fourth). The first four are irregular and must be memorized. From fifth onward, attach '-vaan/-vin' to the cardinal: paanchvaan (fifth), chhathvaan (sixth), saatvaan (seventh)."
   **Why:** Pedagogical accuracy (rubric §1.4). The original rule "attach '-vaan' to the cardinal: chautha (fourth)" was wrong — `chautha` (चौथा) is itself irregular and does NOT take the `-vaan` suffix. The productive `-vaan/-vin` pattern starts at the 5th ordinal. The rewrite groups 1st-4th as irregular (matching how the language actually behaves), adds the feminine `-vin` allomorph so learners know the suffix inflects, and adds two extra correct examples (chhathvaan, saatvaan) to show the productive pattern. >80% confidence — this is the standard rule statement in Snell & Weightman and McGregor.

## Items not applied (4)

1. **Where:** `phrases[2]` / `phrases[3]` vs `theory.sections[1].table.rows` — teen number romanization
   **Issue:** Internal inconsistency between phrase list (`gyarah`, `atharah`, `unnis`) and theory table (`gyaarah`, `athaarah`, `unnees`). Same words, two spellings within one file.
   **Suggested fix:** Unify on the theory-table forms (closer to standard Devanagari long-vowel mappings: ग्यारह, अठारह, उन्नीस).
   **Why not applied:** Debated medial-vowel romanization per rubric §2.4 / §3 skip list. The rubric's single-vowel rule targets endings (`kartaa` → `karta`), not medial `aa` in number stems.

2. **Where:** `phrases[*].pronunciation` — prosodic stress placement
   **Issue:** Stress placement (e.g. `TEEN ba-JE MIL-te hain`, `EK GHAN-ta mein AA jau-NGA`, `KIT-ne ka hai? — PAANCH sau ru-PA-ye`) doesn't always match canonical lexical stress in isolation.
   **Suggested fix:** None — verified intentional per CONTENT.md audit notes (CAPS marks sentence-level prosody, not lexical stress).
   **Why not applied:** Documented author choice per rubric §1.3 and §2.4 skip-list.

3. **Where:** `phrases[4]` — decade list skips 70
   **Issue:** Hindi reads `tees, chaalees, pachaas, saath, assi, nabbe, sau` mapped to `30, 40, 50, 60, 80, 90, 100`, deliberately omitting `sattar` (70). The context line calls this out.
   **Suggested fix:** Include `sattar` so the phrase card shows all eight decades; the theory section already does.
   **Why not applied:** Deliberate authorial pacing choice (explicit caveat in context). Flagging for review per rubric §3.

4. **Where:** `theory.sections[0].cutting_intro` — "Let's start at the top..."
   **Issue:** Opens with a "Let's"-family phrase, near the rubric §2.1 AI-cliché openers.
   **Suggested fix:** Drop the opener; lead with "These ten are the building blocks — once they're in your head, everything else stacks on top."
   **Why not applied:** Borderline — Cutting-voice cutting_intros are explicitly allowed to be conversational (§2.3), and "Let's start at the top" reads as direct framing (not throat-clearing like the banned "Let's dive in" / "Welcome to your journey"). Flagging rather than auto-applying.
