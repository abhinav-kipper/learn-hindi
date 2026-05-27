# Audit: dutch-foundation-06-past-tense

**File:** content/dutch/foundations/06-past-tense.json
**Audit date:** 2026-05-27
**Total fixes applied:** 3
**Items not applied:** 2

## Fixes applied

### Accuracy (3 items)

1. **Where:** field `theory.sections[0].examples[0]`
   **Was:** `"Ik heb gisteren naar Amsterdam gegaan." ... "English instinct = simple past. Dutch reflex = perfect (heb + gegaan)."`
   **Now:** `"Ik ben gisteren naar Amsterdam gegaan." ... "English instinct = simple past. Dutch reflex = perfect — and `gaan` takes `zijn`, not `hebben`, because it's a motion verb (ben + gegaan)."`
   **Why:** Critical grammar error. `gaan` is a motion verb and takes `zijn` as its perfect-tense auxiliary. The original example used `heb`, directly contradicting the lesson's own central rule (and the warning callout in section 2 calling `Ik heb gegaan` "WRONG"). The corrected version also turns the example into a teaching moment by explicitly flagging the auxiliary choice.

2. **Where:** field `phrases[1].context`
   **Was:** `"... 'Leven' stem = 'leef' → 'f' is in 't kofschip' → 'geleefd'... wait, 'f' IS in kofschip → 'geleefd'? No: 'leven' → stem 'leef' → but original last letter of root is 'v' (leven), and 'v' is NOT in kofschip → 'geleefd'."`
   **Now:** `"... Watch out for verbs with v/z in the infinitive: 'leven' → underlying stem ends in 'v' (NOT in kofschip) → 'geleefd' (spelled with -d, even though the stem surfaces as 'leef'). Use the consonant in the infinitive, not the devoiced spelling."`
   **Why:** The original context contained an in-line self-correcting reasoning monologue ("...wait, ... No: ...") — clearly an authoring artifact, not finished prose. It also risks confusing learners about whether `f` triggers kofschip. The replacement states the correct rule cleanly: use the underlying consonant from the infinitive (v/z), not the devoiced surface form (f/s). This matches `grammar_notes[0]`.

3. **Where:** field `phrases[0].pronunciation`
   **Was:** `"... yay hept ge-AY-ten ..."`
   **Now:** `"... yay hept ge-GAY-ten ..."`
   **Why:** `gegeten` has two `g`s — the unstressed prefix `ge-` and the stressed stem `GAY-ten` (with the same /ɣ/ consonant rendered "g"). The original dropped the stem's initial consonant entirely, suggesting the participle starts with a vowel sound. Aligns with the rendering of `ge-WERKT`, `ge-SPAYLT`, `ge-LOH-pen` elsewhere in the same line.

## Items not applied (2)

1. **Where:** field `theory.sections[2].body`
   **Issue:** Lists `vallen` (fall) and `zwemmen` (swim) under "MOTION with a destination," but `vallen` is more naturally a change-of-state verb and `zwemmen` only takes `zijn` when a destination is present. The motion-vs-state-change taxonomy is slightly conflated.
   **Suggested fix:** Move `vallen` into the change-of-state list, or restructure the prose to make the destination condition clearer for verbs that can go either way (lopen/rijden/zwemmen with destination → zijn; without → hebben).
   **Why not applied:** The skill_breakdown[1] explanation already makes this distinction cleanly ("lopen + destination = zijn / no destination = hebben") with concrete examples, and the section's own callout, table, and quick_check all reinforce the practical takeaway without introducing errors. A rewrite of the body prose is a pedagogical-meaning judgment call (taxonomy framing) better left to the author — confidence below 80% that the suggested phrasing is preferred over the current "rule of thumb plus examples" approach.

2. **Where:** field `phrases[6].pronunciation`
   **Issue:** `ooit` and `nooit` rendered as `OHT` / `NOHT` collapses the diphthong /oːi/ into a single mora, losing the glide. A closer rendering would be `OH-it` / `NOH-it`.
   **Suggested fix:** `"... ik hep NOH-it NAY-der-lants ge-LAYRD. hep YAY OH-it in am-ster-DAM ge-WOHND?"`
   **Why not applied:** The file's pronunciation style is loosely phonetic, not IPA, and other diphthongs in the file are similarly compressed (e.g. `aangekomen` → `AAN-ge-KOH-men` without marking `aa` as long-low). Bumping just these two would be inconsistent with the file's overall granularity. Calling this a stylistic choice, not a clear bug.
