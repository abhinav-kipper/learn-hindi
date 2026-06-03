# Audit: dutch-negation

**File:** content/dutch/foundations/10-negation.json
**Audit date:** 2026-06-03
**Total fixes applied:** 0
**Items not applied:** 0

## Clean

This foundation is accurate, well-placed, and stylistically tight. No accuracy
or style fixes needed; nothing flagged for pedagogical review.

### Verification notes (audit focus areas)

- **`geen` for indefinite / article-less nouns** — Correct throughout:
  `geen geld`, `geen auto`, `er is geen brood`, `geen tijd`, `geen kinderen`,
  `geen broer`, `geen probleem`, `geen koffie`. The "`geen` swallows the
  article + negation, never `niet een`" rule is stated correctly and the
  warning callout reinforces it.
- **`niet` for verbs / adjectives / definite nouns / prep phrases** — Correct:
  `Ik werk niet` (verb), `Het is niet duur` (adjective), `Ik ken die man niet`
  (definite noun via `die`), `Ik ga niet naar huis` (prep phrase). The "definite
  noun = de/het/die/deze/possessive" signal is taught accurately.
- **`niet` placement** — Every example places `niet` correctly: end of clause
  for whole-action negation (`Ik werk niet`, `Ik begrijp het niet`,
  `Ik ken die man niet`), and directly before the targeted adjective / place /
  time (`niet duur`, `niet hier`, `niet in Amsterdam`, `niet vandaag`). The
  note callout's `Ik zie hem niet vandaag` (niet after definite object, before
  time word) is correct word order.
- **Decision rule** — "Am I negating an indefinite or article-less noun? Yes ->
  geen; no -> niet" is stated correctly and the examples demonstrate it; the
  decision table maps cleanly to the rule.
- **`nee` vs `niet`/`geen`** — Distinction is accurate: `nee` is the
  answer-word only, never an in-sentence negator (`Nee, ik heb geen tijd`, not
  `Nee, ik heb nee tijd`). Phrase 8 models `Nee, dank je. Ik wil geen koffie`
  correctly (answer `nee` + in-sentence `geen`).
- **quick_check.correct_index** — All four quick-checks have `correct_index: 1`,
  and option[1] is the correct sentence in each case (`Ik heb geen geld`,
  `Het is niet duur`, niet at the end, `Ik ken die man niet`). All verified.
- **Pronunciation** — Syllable-stress / prosodic-CAPS format is consistent.
  Guttural `g` rendered as "ch" (chayn / CHELT / CHA / KOH-fee), final
  devoicing reflected (`heb` -> "hep", `geld` -> "chelt", `brood` -> "broht"),
  `w` -> "v" (`werk` -> "verk", `wil` -> "vil"), `nee` -> "nay", `je` -> "ye",
  `huis` -> "hows", `die` -> "dee". All reasonable approximations.
- **Schema / structural** — JSON parses; required fields present; 4 theory
  sections each with heading + body + cutting_intro + quick_check + (table or
  examples) + callout; `references[]` non-empty and all on the vetted list
  (Donaldson, dutchgrammar.com, Naar Nederland).
- **CI gates** — `node scripts/lint-content.mjs` and
  `node scripts/lint-quality.mjs` both pass clean (no em-dashes, arrows,
  clichés; references vetted; jargon glossed).
