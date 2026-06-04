# Audit: content/games/hindi/sentence-builder.json

Date: 2026-06-03
File: `content/games/hindi/sentence-builder.json`
Scope: Hindi sentence-building game (scramble-and-rebuild). Every item must be (a) grammatical Hindi, (b) have ONE clear canonical word order (SOV, postposition right after its noun, verb last, no floating interjections/vocatives), (c) have an accurate English translation, (d) use single-vowel CONTENT.md romanization with clean space-separated tokens.

## Summary

- Items checked: 36 (12 easy / 12 medium / 12 hard)
- Corrections: 5
- Removed / reworded for ambiguity: 1 reworded (no removals)
- Items per level after audit: easy 12, medium 12, hard 12 (all well above the 4-per-round minimum)
- `node scripts/lint-content.mjs`: clean

No item had a free / dual-natural word order serious enough to require removal. All sentences are single clean clauses with the verb last and postpositions seated correctly. One medium item carried two competing time words (a reorder hazard) and was reworded to a single canonical time phrase.

## Corrections (was -> now)

1. Romanization (read/study verb). Existing repo content uses `padh*` overwhelmingly (`padhti`, `padhta`, `padhna`...), not `parh*`.
   - easy: `woh kitaab parhti hai` -> `woh kitaab padhti hai` ("She reads a book")
   - hard: `woh apne kamre mein baithkar kitaab parhta hai` -> `... kitaab padhta hai`

2. Romanization (letter). Repo convention is `chitthi` (9 occurrences), not `chithi`.
   - medium: `woh apne papa ko chithi likhta hai` -> `woh apne papa ko chitthi likhta hai`

3. Grammar (missing possessive postposition). "clean the house" = `ghar ki safai karna`; the original omitted `ki`. Also dropped the redundant double time-marker (`har itwar ko`) and trimmed length so the token count stays in the hard band.
   - hard: `main har itwar ko apne ghar safai karta hoon` -> `main itwar ko ghar ki safai karta hoon` (English adjusted to "I clean the house on Sunday").

## Reworded for word-order ambiguity

4. The medium item `main roz shaam ko mandir jaata hoon` stacked two competing time expressions (`roz` = daily, `shaam ko` = in the evening). These can be reordered relative to each other, so a valid rebuild could be marked wrong. Reworded to a single, canonical time phrase that has one natural slot.
   - `main roz shaam ko mandir jaata hoon` -> `main har shaam mandir jaata hoon` ("I go to the temple every evening", male speaker)

## Verified clean (no change)

- All 12 easy items: standard SOV, gender on the verb matches the stated speaker gender (peeti/seekhti/so jaati = female; banata/rehta/ja raha = male), `hoon`/`hai`/`hain` agreement correct.
- Medium time/manner items (`har subah doodh peeta`, `raat ko jaldi so jaati`, `roz subah chai banati`): the time phrase sits at the front and the pre-verb manner adverb (`jaldi`) sits right before the verb, a fixed canonical order, not a free one.
- Hard conjunctive-participle items (`subah uthkar ... peeta`, `kamre mein baithkar ... padhta`) and place/manner chains (`office se ghar paidal aata`, `chhutti mein pahaadon par ghoomne jaate`): single clean order, postpositions seated on their nouns, verb last.
- All `apna`/`apni`/`apne` agreements and ko/se/mein/par/ke saath/ke liye/ke baad postpositions are correct and immediately follow their noun.
