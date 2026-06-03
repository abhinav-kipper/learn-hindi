# Audit: content/games/dutch/de-het.json (de/het Duel)

**Date:** 2026-06-03
**Scope:** Accuracy audit of every noun in the Dutch de/het duel. The game shows a bare noun; the player taps DE (`answer: "left"`) or HET (`answer: "right"`). A wrong tag teaches the wrong article, so every item was verified against standard Dutch (Van Dale / standard dictionaries).

## Result

- **Corrections: 0**
- **Removed: 0**
- **Items audited: 55** (declared `rounds: 30`, drawn from the 55-item pool)

Every noun's article and `answer` mapping (left = de, right = het) is correct. No items have a genuinely variable article, so none were removed.

## Per-item verification

All 55 items confirmed correct:

| Noun | Correct article | `answer` | OK |
|------|-----------------|----------|----|
| huis | het | right | ✓ |
| man | de | left | ✓ |
| vrouw | de | left | ✓ |
| kind | het | right | ✓ |
| boek | het | right | ✓ |
| tafel | de | left | ✓ |
| stoel | de | left | ✓ |
| water | het | right | ✓ |
| auto | de | left | ✓ |
| fiets | de | left | ✓ |
| geld | het | right | ✓ |
| jaar | het | right | ✓ |
| week | de | left | ✓ |
| maand | de | left | ✓ |
| dag | de | left | ✓ |
| huisje | het | right | ✓ (diminutive) |
| meisje | het | right | ✓ (diminutive) |
| brood | het | right | ✓ |
| koffie | de | left | ✓ |
| melk | de | left | ✓ |
| appel | de | left | ✓ |
| ei | het | right | ✓ (plural de eieren) |
| kaas | de | left | ✓ |
| school | de | left | ✓ |
| straat | de | left | ✓ |
| winkel | de | left | ✓ |
| stad | de | left | ✓ |
| dorp | het | right | ✓ |
| land | het | right | ✓ |
| station | het | right | ✓ |
| trein | de | left | ✓ |
| huisarts | de | left | ✓ (profession) |
| ziekenhuis | het | right | ✓ (-huis) |
| paspoort | het | right | ✓ |
| formulier | het | right | ✓ |
| brief | de | left | ✓ |
| krant | de | left | ✓ |
| probleem | het | right | ✓ |
| vraag | de | left | ✓ |
| woning | de | left | ✓ (-ing) |
| vrijheid | de | left | ✓ (-heid) |
| gebouw | het | right | ✓ (ge-) |
| gezin | het | right | ✓ (ge-) |
| werk | het | right | ✓ |
| baan | de | left | ✓ |
| hand | de | left | ✓ |
| oog | het | right | ✓ (plural de ogen) |
| deur | de | left | ✓ |
| bed | het | right | ✓ |
| weer | het | right | ✓ (weather) |
| telefoon | de | left | ✓ |
| hond | de | left | ✓ |
| kat | de | left | ✓ |
| boom | de | left | ✓ |
| kopje | het | right | ✓ (diminutive) |

## Trap checks

- **Diminutives (-je) always het:** huisje, meisje, kopje all tagged `right`. Correct. `het meisje` explicitly noted as het despite referring to a girl.
- **Core het-words present and correct:** huis, boek, kind, water, geld, jaar, brood, ei, dorp, land, station, ziekenhuis, paspoort, formulier, probleem, werk, oog, bed, gebouw, gezin.
- **de-words for professions:** huisarts tagged `de`. Correct.
- **de-words ending -heid/-ing/-tie:** vrijheid (-heid), woning (-ing) tagged `de`. Correct. The -tie/-ie examples live in the rule bullets (informatie), not as items.
- **Cross-references in explanations checked:** het antwoord (referenced in `vraag`), de kinderen (kind), de eieren (ei), de ogen (oog), het raam (deur), het hoofd / het been (hand), het bier (koffie/melk) all accurate.

## Bullets, tip, spelling

- All Dutch spelling correct (huisje, meisje, vrijheid, gebouw, ziekenhuis, etc.).
- Rule bullets accurate: -ing/-heid/-tie/-ie/-schap as de; ge-/be-/ver-/ont- and -um/-ment as het; diminutives het; professions/fruits/trees de.
- Tip ("roughly 7 out of 10 nouns are de") is the standard heuristic and accurate.
- No em-dashes, arrows, or AI clichés.

## Lint

`node scripts/lint-content.mjs` runs clean:

```
✓ lint-content: all content clean (no em-dashes, arrows, or clichés).
```

JSON validated (parses cleanly, 55 items).
