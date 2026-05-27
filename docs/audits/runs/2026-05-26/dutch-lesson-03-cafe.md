# Audit: dutch-lesson-03-cafe

**File:** content/dutch/lessons/03-cafe.json
**Audit date:** 2026-05-26
**Total fixes applied:** 3
**Items not applied:** 3

## Fixes applied

### Accuracy (3 items)

1. **Where:** field `phrases[2].hindi`
   **Was:** `"Heeft u ook appelgebak? Is er een dagsschotel?"`
   **Now:** `"Heeft u ook appelgebak? Is er een dagschotel?"`
   **Why:** `dagsschotel` is a typo. The Dutch word is `dagschotel` (dag + schotel, single `s`). The lesson's own `context` field already spells it correctly as "Dagschotel", and the pronunciation field renders it as `DACH-skoh-tel` (consistent with single-s form).

2. **Where:** field `phrases[0].pronunciation`
   **Was:** `"MACH ik uhn KO-fee, als-tu-BLEEFT? CHAACH uhn kap-pu-CHEE-no."`
   **Now:** `"MACH ik uhn KO-fee, als-tu-BLEEFT? CHRAACH uhn ka-pu-CHEE-no."`
   **Why:** Two issues. (1) `CHAACH` for `graag` omits the `r`; the established convention elsewhere in the Dutch lesson corpus (08-bank.json, 10-job-interview.json) renders `graag` as `CHRAACH`. (2) `kap-pu-CHEE-no` doubles the `p` — Dutch `cappuccino` is pronounced with a single onset `k`, so `ka-pu-CHEE-no` matches the actual syllable structure.

3. **Where:** field `phrases[4].pronunciation`
   **Was:** `"MACH ik de ray-KEN-ing, als-tu-BLEEFT? KUN-nen we AF-ray-ken-en?"`
   **Now:** `"MACH ik de RAY-ke-ning, als-tu-BLEEFT? KUN-nen we AF-ray-ke-nen?"`
   **Why:** Dutch `rekening` has first-syllable lexical stress (/ˈreːkənɪŋ/), so it should be `RAY-ke-ning`, not `ray-KEN-ing`. The compound form in 08-bank.json (`be-TAAL-ray-ke-ning`) treats the `rekening` element as `ray-ke-ning` with no caps, confirming the codebase convention. Also normalized `AF-ray-ken-en` to `AF-ray-ke-nen` for consistent syllabification (rekenen = re-ke-nen).

## Items not applied (3)

1. **Where:** field `phrases[1].pronunciation`
   **Issue:** `"SOW-ker"` for `suiker`. The Dutch `ui` diphthong (/œy/) is closer to `OY` / `OEY` / `AU` than to `OW`. The current form suggests a /sɑʊ/ vowel which is not quite right.
   **Suggested fix:** `SUY-ker` or `SAU-ker` or `SOEY-ker`.
   **Why not applied:** Debated romanization. The `ui` diphthong has no clean English equivalent, and `SOW-ker` is an acceptable phonetic approximation aimed at English-speaker intuition. Falls under rubric §2.4 skip list.

2. **Where:** field `phrases[3].pronunciation`
   **Issue:** `"WY-fy"` for `wifi`. Dutch typically pronounces `wifi` as /ˈʋifi/ or /ˈwifi/ — closer to `WEE-fee` than `WY-fy`.
   **Suggested fix:** `WEE-fee`.
   **Why not applied:** Dutch usage is split — many speakers do say `WY-fy` (English-influenced pronunciation), especially in urban/younger contexts. Both forms are heard in the wild. Debated romanization, leaving author's choice.

3. **Where:** `skill_breakdown` array (count mismatch with `skills`)
   **Issue:** The `skills` array lists 4 skills ("ordering food and drinks", "asking questions about the menu", "getting the bill", "being polite in service situations"), but only one corresponding entry exists in `skill_breakdown`. Other Dutch lessons (e.g. 08-bank.json) have 3+ skill_breakdown entries.
   **Suggested fix:** Add skill_breakdown entries for the remaining 3 skills.
   **Why not applied:** This is a content-completeness pedagogical change, not a correctness fix. The author may have intentionally limited the breakdown depth for an A1-level café lesson. Flagging for review rather than fabricating content.
