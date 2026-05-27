# Audit: hindi-foundation-07-noun-gender

**File:** content/foundations/07-noun-gender.json
**Audit date:** 2026-05-27
**Total fixes applied:** 3
**Items not applied:** 5

## Fixes applied

### Accuracy (3 items)

1. **Where:** field `practice_prompt` (translation drill example) — applied in prior 2026-05-27 run
   **Was:** `user supplies \`woh acchhi hai\` with the right match`
   **Now:** `user supplies \`woh acchi hai\` with the right match`
   **Why:** Typo — every other occurrence in this file and across the codebase romanizes अच्छी as `acchi` (`mera bhai accha hai, meri behen acchi hai`, table row `accha → acchi → acche`, lesson 04, etc.). The lone `acchhi` in the practice prompt would teach the tutor model an inconsistent form, undermining the very agreement drill it's meant to power.

2. **Where:** field `theory.sections[1].table.rows[2]` ("Spot the pattern from the ending" — Sanskrit-origin row) — applied in prior 2026-05-27 run
   **Was:** `["-a (Sanskrit-origin)", "feminine", "bhasha, seva, katha"]`
   **Now:** `["-aa (Sanskrit-origin)", "feminine", "bhasha, seva, katha"]`
   **Why:** The Sanskrit-origin feminine class (भाषा, सेवा, कथा) ends in long ā, not short a — same Devanagari ending as `ladka` (लड़का, masc) in row 1. Labeling them `-a` collapses the contrast the chart is built to teach: that two visually-identical `-aa` endings split between masc (row 1, native) and fem (row 3, Sanskrit). The design spec (`docs/superpowers/specs/2026-05-26-foundation-theory-chapters-design.md`) explicitly uses `-aa from Sanskrit` for this row. Examples kept in the file's existing single-final-vowel romanization (`bhasha`, not `bhaasha`) to stay consistent with `ladka`/`kamra`/`samosa` in row 1.

3. **Where:** field `phrases[9].hindi` — adjective spelling
   **Was:** `achche dost milte hain mushkil se`
   **Now:** `acche dost milte hain mushkil se`
   **Why:** Romanization consistency. Every other occurrence of अच्छे/अच्छा/अच्छी in this file uses the `acch-` stem (`accha`, `acchi`, `acche` — see grammar_notes[3], theory.sections[2].body, theory.sections[0].examples, the quick_check options, and phrases[1]). The lone `achche` here breaks the convention and contradicts the file's own pronunciation field (`ac-CHE DOST...`), which clearly maps to `acche`, not `achche`. No pedagogical-meaning change; pure typo fix.

## Items not applied (5)

1. **Where:** field `grammar_notes[0]` and `theory.sections[0].body` — terms `pulling` / `striling` / `stri-ling`
   **Issue:** Inconsistent hyphenation: `grammar_notes[0]` writes `stri-ling` (hyphenated), but `theory.sections[0].body` writes `striling` (unhyphenated) for the same Hindi grammar term स्त्रीलिंग. Also `pulling` (पुल्लिंग) collides visually with the English verb "pulling" and may confuse beginners.
   **Suggested fix:** Pick one form (`striling` is the conventional single-token romanization) and use throughout. Optionally annotate `pulling (lit. 'masculine-gender')` once on first mention to defuse the English-homograph trap.
   **Why not applied:** Spelling/hyphenation choice is a borderline-debated romanization preference and the author may have a stylistic reason; per rubric §3 (debated romanization → skip). Flagging for author review.

2. **Where:** field `theory.sections[1].table.rows[0]` — "-aa or consonant → masculine"
   **Issue:** Conflates two very different ending classes. `-aa` endings are mostly masculine (good rule), but consonant endings split roughly 50/50 between masc and fem — `aurat`, `kitaab`, `cheez`, `raat`, `mez`, `sadak` are all consonant-ending feminines, and the file itself lists several in `grammar_notes[2]` and `skill_breakdown[0].more_examples`. The callout immediately below partially walks this back ("`kitaab` ends in a consonant but is feminine"), but the row remains misleading at a glance.
   **Suggested fix:** Either split into two rows (`-aa → masculine`, `consonant → varies — memorize`) or move "consonant" entirely into the "irregular" row.
   **Why not applied:** Pedagogical-meaning change. The author may have deliberately grouped consonants under "masculine" as a "best first guess" heuristic (the section claims patterns are ~75% accurate). Splitting the row reframes the lesson. <80% confidence on direction. Flagging for author review.

3. **Where:** field `phrases[5]` — `mere paas do bhai aur ek behen hai`
   **Issue:** The subject "do bhai aur ek behen" is plural (3 people total), so canonical agreement is `hain`, not `hai`. The context note acknowledges this is contested ("the older convention takes masculine — both are heard"), but the chosen form lands on the colloquial side without flagging it as colloquial.
   **Suggested fix:** Either change to `hain` (formally correct) and adjust the context note, or keep `hai` but mark the context note more clearly ("colloquial agreement-with-nearest; formal would be `hain`").
   **Why not applied:** This is the deliberate authorial choice already disclaimed in context ("Don't overthink"). Both forms are heard in spoken Hindi. Per rubric §3, skipping author-chosen variation.

4. **Where:** field `grammar_notes[4]` — `mere parents` example
   **Issue:** Mixes English plural (`parents`) into a Hindi possessive demonstration. Native Hindi would be `mere maa-baap` or `mere maata-pita`. Using an English loanword inside the rule-illustration line is structurally awkward inside a chapter teaching native gender rules.
   **Suggested fix:** Replace with `mere maa-baap` or `mere bachche` (my kids) — both native plurals that cleanly illustrate `mere + plural-owned`.
   **Why not applied:** Code-mixing English nouns with Hindi possessives is widespread in spoken Indian-English and may be a deliberate naturalism choice — the loanwords section later in the chapter actively teaches this pattern. Pedagogical-meaning change <80% confident. Flagging.

5. **Where:** field `phrases[*].pronunciation` (CAPS-stress placement)
   **Issue:** Standard rubric note — CAPS prosody in pronunciation fields varies by sentence position and doesn't always match isolated-word lexical stress.
   **Suggested fix:** None.
   **Why not applied:** Per CONTENT_RUBRIC §1.3 / §2.4 skip-list and CLAUDE.md "Audit notes (2026-05-26)": prosodic CAPS is intentional sentence-level stress, consistent across all 19 Hindi files. Verified non-issue.
