# Audit: dutch-foundation-02-pronunciation

**File:** content/dutch/foundations/02-pronunciation.json
**Audit date:** 2026-05-27
**Total fixes applied:** 2
**Items not applied:** 6

## Fixes applied

### Accuracy (2 items)

1. **Where:** field `phrases[1].pronunciation`
   **Was:** `"hows (rounded), BOW-tun (rounded), owt (rounded), zowt (rounded)"`
   **Now:** `"hows (rounded), BOW-tun (rounded), owt (rounded), zowt (rounded), bowt (rounded), down (rounded)"`
   **Why:** Structural mismatch — the `hindi` field lists six words (`huis, buiten, uit, Zuid, buit, duin`) but only four pronunciations were given. Added the missing renderings for `buit` (`bowt` with rounded ui) and `duin` (`down` with rounded ui), matching the existing `ui ≈ rounded "ow"` rendering convention used elsewhere in the same row.

2. **Where:** field `phrases[5].pronunciation`
   **Was:** `"dur (rounded lips), nus (rounded), ay-ROH-pa, DUR-run (rounded), NUS-zun (rounded)"`
   **Now:** `"dur (rounded lips), nus (rounded), uh-ROH-pa (rounded eu-), DUR-run (rounded), NUH-zun (rounded)"`
   **Why:** Two factual errors in a row teaching the `eu` sound.
   - `Europa` in Dutch is /øːˈroːpaː/ — the first syllable is the rounded `eu` sound, not the `ij/ei` "ay" diphthong. Rendering it `ay-ROH-pa` contradicts the lesson's own teaching that the `eu` is foreign to English; replaced with `uh-ROH-pa (rounded eu-)` to match the `dur`/`nus`/`DUR-run` family above and below it.
   - `neuzen` is /ˈnøːzə(n)/ — the middle consonant is /z/ (intervocalic, stays voiced) and the stressed vowel is the rounded `eu`. Rendering it `NUS-zun` was wrong on two counts (introduced a phantom /s/ and stripped the rounded vowel marker). Replaced with `NUH-zun (rounded)` consistent with the singular `nus (rounded)` directly preceding it.

## Items not applied (6)

1. **Where:** field `grammar_notes[0]`
   **Issue:** Calls the Dutch g/ch a "voiced velar fricative". Northern Standard Dutch is typically voiceless /x/ (or uvular /χ/); voiced /ɣ/ is the southern/Belgian variant. The current wording is the historical/southern phonemic label.
   **Suggested fix:** Either drop "voiced" or expand to "voiced in the south, voiceless in the north".
   **Why not applied:** Both labels appear in mainstream Dutch-language references; the note already discusses regional variation in the next sentence. <80% confident the rewrite is unambiguously better, and the change touches phonological terminology where the author may have made a deliberate simplification.

2. **Where:** field `grammar_notes[3]`
   **Issue:** Says "'Z' at start often sounds like 's': 'zee' sounds like 'say'". `zee` is /zeː/ in standard Dutch — pronounced "zay", not "say". Northern speakers do partially devoice initial /z/, but rendering it as a plain English "say" is misleading for a learner.
   **Suggested fix:** Change `'zee' sounds like 'say'` to `'zee' sounds like 'zay' (with a partially devoiced z in northern accents)`.
   **Why not applied:** Borderline pedagogical-meaning change — author may have deliberately simplified to highlight the s/z merger learners hear from northern speakers. Flagging for review.

3. **Where:** field `phrases[3].pronunciation` for `oog`
   **Issue:** Rendered as `ohch`. Dutch `oog` is /oːx/ — the `oo` is the long Dutch /oː/, which is closer to the vowel in English "boat" than to a pure "oh". The current `ohch` reading is reasonable but slightly off; the final-/g/-devoices-to-/x/ component is the more important thing being taught and is correctly rendered as `ch`.
   **Suggested fix:** Could be tightened to `ohkh` or `oh-ch` for clarity, but neither is unambiguously better.
   **Why not applied:** Existing rendering is defensible; rewriting risks breaking the convention used in the rest of the file (`broht`, `roht`, `ohk`).

4. **Where:** field `phrases[2].pronunciation` for `wijn`
   **Issue:** Rendered as `vayn`. Northern Dutch `w` is closer to /ʋ/ (a labio-dental approximant somewhere between English `v` and `w`); Belgian/southern Dutch is closer to English `w`. Rendering it as `vayn` picks one regional variant.
   **Suggested fix:** Note the regional split, or render as `wayn` for clarity.
   **Why not applied:** The `v`-like northern rendering is the standard one taught to learners aiming at Standard Dutch (the file's apparent target). Deliberate authorial choice.

5. **Where:** field `theory.sections[0].cutting_intro` and `theory.sections[1].cutting_intro` etc.
   **Issue:** Multiple `cutting_intro` blocks open with "Welcome!" / "Let's..." constructions, which the rubric §2.1 flags as AI-cliché openers ("Welcome to your journey", "Let's dive in").
   **Suggested fix:** Replace with more direct framings ("The most famous Dutch sound is the rasping g — it comes from..." etc.).
   **Why not applied:** Per rubric §2.3, `cutting_intro` is explicitly Cutting's friendly conversational voice and the "Let's" / "Welcome" registers are within that voice's normal range. The rubric-cited clichés are stronger ("Let's dive in!", "Welcome to your journey") — bare "Welcome!" and "Let's go through them" are borderline. <80% confident on direction.

6. **Where:** field `theory.sections[1].quick_check.options[1]` and `phrases[2].context`
   **Issue:** The file teaches `ij/ei` as "like English `ay` in `say`" but the Standard Dutch realization is /ɛi/ (closer to English "eye" / "ay" in "play" but starting more open). Rendering it as `ay` is a common ESL simplification; rendering it as `eye` (used in the options text) is closer phonetically. The file uses both at different points.
   **Suggested fix:** Pick one convention and apply it consistently.
   **Why not applied:** This is a debated romanization choice (rubric §2.4 skip list calls out debated forms). The author appears to deliberately straddle both renderings to give learners two reference points.
