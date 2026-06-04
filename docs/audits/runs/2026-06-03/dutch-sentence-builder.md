# Audit: content/games/dutch/sentence-builder.json

Date: 2026-06-04
File: `content/games/dutch/sentence-builder.json`
Items checked: 36 (12 easy, 12 medium, 12 hard)

The game scrambles the Dutch sentence (stored in the `hindi` field for legacy
reasons) and the player taps the words back into the canonical order to match
the English prompt. Every item was checked for: (1) Dutch grammar, (2) a single
canonical word order, (3) accurate/natural English, (4) clean space-separated
tokens, (5) word count matching the difficulty tier.

## Result

No corrections required. All 36 items are grammatically correct, have a single
clear canonical order, accurate English, clean tokens, and tier-appropriate
word counts. The file was already accuracy-clean.

## What was verified per item

### Grammar (V2 + verb-final placement)
- V2 holds in every main clause (subject first, finite verb second). No
  fronted-inversion sentences that would force a non-subject-first rebuild.
- Separable verbs split with the prefix at the end: `sta ... op` (opstaan),
  `belt ... op` (opbellen), `ruimen ... op` (opruimen), `staat ... op`.
- Perfect tense uses the right auxiliary with the past participle at the end:
  hebben for `gelezen`, `gesloten`, `gegeten`, `gewerkt`, `gewandeld`,
  `geschreven`, `gelaten`; zijn for `gegaan` (movement to a goal).
- Participle forms correct, including irregulars: `gelezen`, `gesloten`
  (sluiten), `geschreven`, `gegeten`, `gelaten`, `gegaan`; regular `gewerkt`
  and `gewandeld` follow the kofschip rule (stem ends voiceless k / unvoiced
  context, takes -t / -d correctly).
- Modal + infinitive and gaan + infinitive land the infinitive at the end:
  `willen ... drinken`, `gaat ... kopen`, `moet ... maken`, `kan ... zwemmen`,
  `wil ... kopen`, `willen ... kijken`, `moet ... gaan`, `kan ... komen`,
  `wil ... zoeken`, `gaat ... brengen`.
- One subordinate clause (`... omdat ik ziek ben`) has the finite verb correctly
  in final position; the order is fixed, so the rebuild is unambiguous.

### Single canonical order
- Sentences with two adverbials follow the standard time-manner-place ordering
  (`gisteren een brief`, `gisteren in het park`, `de hele dag hard`,
  `vanavond niet`), which gives each a clearly dominant single rebuild.
- No floating vocatives, no stray words, single clean clause throughout.

### English
- All English translations are accurate and natural (e.g. simple present
  rendered as English progressive where idiomatic: "is sleeping now",
  "am working today"; perfect vs simple past handled sensibly).

### Tokens and word counts
- Every word is a clean space-separated token; no commas or punctuation inside
  the Dutch strings.
- Word counts match tiers: easy 3-4, medium 5-6, hard 6-7. At least 4 items per
  level (12 / 12 / 12).

## Tally
- Corrections (was/now): 0
- Reworded or removed: 0

## Lint
`node scripts/lint-content.mjs` -> clean (no em-dashes, arrows, or cliches).
