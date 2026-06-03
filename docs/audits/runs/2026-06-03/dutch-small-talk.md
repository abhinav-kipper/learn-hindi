# Audit: dutch-small-talk

**File:** content/dutch/lessons/13-small-talk.json
**Audit date:** 2026-06-03
**Total fixes applied:** 1
**Items not applied:** 0

## Fixes applied

### Accuracy (1 item)

1. **Where:** field `grammar_notes[3]` (the `'Jou' vs 'jij/je'` note)
   **Was:** "after a preposition ('met jou', 'voor jou', 'bij jou') you must use the stressed object form 'jou', not 'je'. So: 'Hoe gaat het met jou?' not 'met je' when you want to emphasize the 'you'."
   **Now:** "'jij' is the subject form ('jij komt' / you come), while after a preposition you use the object form, either unstressed 'je' or stressed 'jou' ('met je', 'voor jou', 'bij jou'). Both 'met je' and 'met jou' are correct; pick the stressed 'jou' when you want to put weight on the 'you', as in 'Goed, en met jou?' bouncing the question back."
   **Why:** The original "you must use 'jou', not 'je'" is inaccurate as an absolute rule and self-contradicting: unstressed `je` after a preposition is fully grammatical, and the lesson's own phrase 1 ("Hoe gaat het met **je**?") uses it. The corrected note distinguishes the `jij` subject form from the `je`/`jou` object pair and states that both `met je` and `met jou` are correct, with `jou` reserved for emphasis. This aligns the note with the lesson's own phrases and with standard Dutch usage (dutchgrammar.com personal-pronoun tables).

## Accuracy verifications (no change needed)

The unit-specific focus points all check out:

- **"Hoe gaat het (met je/u)?", "Goed, en met jou?", "Het gaat wel"** — all correct. `met je` (unstressed) and `met jou` (stressed object) both valid; note now states this. No "met jij" anywhere.
- **Weather with `het` as subject** — `Het regent`, `Het is koud/warm/zonnig/winderig`, `Wat een rotweer`, `Het waait hard`, `Het is bewolkt`, all show correct `het` + verb / `het is` + adjective agreement (3rd-person singular). `grammar_notes[0]` correctly explains the dummy weather subject.
- **Tag words `hè` / `toch`** — used naturally in phrases ("Lekker weer, hè?") and accurately explained in `grammar_notes[1]`, including the firmer-agreement nuance of `toch` ("Je komt toch?").
- **"Wat ga je dit weekend doen?"** — `gaan + infinitive` with `doen` at clause end; `grammar_notes[4]` correct.
- **"Heb je een fijn weekend gehad?"** — perfect tense `hebben + gehad` correct; participle `gehad` correct.
- **Pronunciation syllable-stress format** — all 10 phrases plus skill examples follow the CAPS-stressed-syllable convention. Guttural `g`/`ch` rendered as CH (gaat→CHAAT, regent→RAY-chent, gehad→che-HAT), Dutch `w`→V, `oe`→OO. Consistent and prosodically sound.
- **Culture notes** — `gezellig`, weather-as-icebreaker, brevity of Dutch small talk, and privacy boundaries all factually accurate. No drift.
- **References** — all three (Bart de Pau/learndutch.org, Taalunie/CEFR, TaalCompleet A1) are on the vetted list.

## Items not applied (0)

None. No pedagogical-meaning judgment calls were required.

## Lint status

- `node scripts/lint-content.mjs` — clean (no em-dashes, arrows, or clichés).
- `node scripts/lint-quality.mjs` — clean (references vetted, jargon glossed).
- JSON valid.
