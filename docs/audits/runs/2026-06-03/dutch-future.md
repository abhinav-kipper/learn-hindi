# Audit: dutch-future

**File:** content/dutch/foundations/13-future.json
**Audit date:** 2026-06-03
**Total fixes applied:** 0
**Items not applied:** 0

## Clean

Verified against the rubric (accuracy-first) and the focus areas. No accuracy
or style fixes needed.

### Verification notes

- **Present tense + time word as default future.** Correctly taught as the
  most common form. Examples are sound: `Ik werk morgen tot vijf uur`,
  `Volgende week ga ik op vakantie` (verb-second after fronted time phrase),
  `Ik bel je later`, `De trein vertrekt om acht uur`.
- **gaan + infinitive.** `gaan` conjugation correct (ik ga, jij gaat, hij/zij/het
  gaat, wij/jullie/zij gaan). Infinitive consistently placed at clause end across
  all phrases, skill_breakdown examples, and theory examples (`Ik ga vanavond
  koken`, `We gaan volgend jaar verhuizen`, `Ik ga koffie drinken`, `Wat ga jij
  doen?`). Object correctly sits between the two verbs.
- **zullen + infinitive.** Conjugation correct everywhere: `ik zal`, `jij zult`
  (with `jij zal` noted as casual variant), `hij/zij/het zal`, `wij/jullie/zij
  zullen`. Infinitive at clause end (`doen`, `helpen`, `regenen`, `bellen`,
  `opendoen`, `zijn`). Three uses (promise / offer / prediction) all accurate.
  The `zou` past form is correctly flagged as out-of-scope.
- **quick_check correct_index values.** All four correct:
  - Section 1: index 1 = `Ik werk morgen.` (correct; option 2 `Ik ga morgen te
    werken` is wrong Dutch, no `te` after `gaan`).
  - Section 2: index 1 = `Ik ga vanavond koken.` (correct; infinitive at end).
  - Section 3: index 2 = `jij zult (or zal)` (correct).
  - Section 4: index 2 = `Zal ik jouw tas dragen?` (correct for an offer).
- **Pronunciation.** Syllable-stress format with hyphens + CAPS stress throughout.
  Dutch guttural `g` rendered as `gh` consistently; `ui` approximated as `how`;
  `vakantie` -tie as `-see`; all reasonable English-anchor approximations.
- **References vetted.** dutchgrammar.com (Bieneke Berendsen), Donaldson's
  *Dutch: A Comprehensive Grammar* (Routledge), and TaalCompleet A2 are all real,
  authoritative NT2 sources.
- **Structural / style.** Valid JSON, all required fields present, no em-dashes
  or arrows, "infinitive" glossed as "the base or dictionary form of the verb",
  no AI clichés. `lint-content.mjs` and `lint-quality.mjs` both pass clean.
