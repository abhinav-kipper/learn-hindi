# Audit: content/games/dutch/hebben-zijn.json

Date: 2026-06-03
Scope: Dutch perfect-tense auxiliary duel (hebben vs zijn). Player sees an infinitive and picks the perfect-tense helper verb. `answer: "left"` = hebben, `answer: "right"` = zijn. A wrong tag is harmful, so each verb's standard auxiliary was checked and ambiguous (both-aux) verbs were removed.

## Summary

- **Corrections (wrong `answer` fixed): 0**
- **Removed (ambiguous, takes both aux): 1** — `vliegen`
- Items before: 50. Items after: 49.
- JSON valid. `node scripts/lint-content.mjs` clean (no em-dashes, arrows, clichés).
- `rounds` stays 30 (drawn from the 49-item pool), so removing one item does not break the game.

## Removal: vliegen

`vliegen` ("to fly") is one of the flagged motion verbs that takes **both** auxiliaries depending on whether a destination is expressed:
- `ik heb gevlogen` (the activity of flying, hebben)
- `ik ben naar Spanje gevlogen` (motion to a destination, zijn)

The instructions list `vliegen` explicitly among the ambiguous verbs to remove (alongside wandelen, fietsen, lopen, zwemmen, rijden, beginnen, vergeten, stoppen). Teaching it as zijn-only would mislabel the very common `ik heb gevlogen` usage. Removed.

The other flagged ambiguous verbs (wandelen, fietsen, lopen, zwemmen, rijden, beginnen, vergeten, stoppen) were **not present** in the file, so no further removals were needed.

## Per-item verification (49 remaining items)

All `answer` tags match the verb's standard perfect auxiliary. No corrections required.

### zijn (answer "right") — all correct
- Motion to a destination: `gaan`, `komen`, `vertrekken`, `aankomen`.
- Change of state: `worden`, `vallen`, `sterven`, `groeien`, `stijgen`, `dalen`, `opstaan`, `slagen` (succeed/pass), `ontstaan`, `verdwijnen`, `gebeuren`.
- Motion + change of residence: `verhuizen` (`wij zijn verhuisd`).
- Fixed exceptions: `blijven` (`ben gebleven`), `zijn` itself (`ben geweest`).

Spot-checks: `stijgen`/`dalen` (price rise/fall = change of state, zijn) correct; `groeien` (zijn) correct; `verhuizen` standard is `is verhuisd` (zijn) correct; `zijn` → `geweest` correct.

### hebben (answer "left") — all correct
Transitive / activity / state verbs: `eten`, `drinken`, `kopen`, `lezen`, `schrijven`, `werken`, `maken`, `zien`, `spelen`, `koken`, `betalen`, `helpen`, `geven`, `slapen`, `kennen`, `doen`, `luisteren`, `vragen`, `nemen`, `kijken`, `wachten`, `leren`, `wonen`, `bellen`, `lachen`, `huilen`, `zoeken`, `vinden`, `studeren`, `schilderen`, `antwoorden`.

Spot-checks on potential traps:
- `wonen` (to live/reside) — state, takes hebben (`heb gewoond`). Correct (not motion).
- `slapen`, `wachten` — activities, hebben. Correct (no destination).
- `kennen` — state, hebben (`heb gekend`). Correct.
- `lachen` — `heb gelachen` correct.

## Other surfaces

- **Spelling**: all infinitives and all past participles in the `hint` fields spelled correctly (e.g. `gegaan`, `gedronken`, `geworden`, `gevallen`, `geschreven`, `gestorven`, `opgestaan`, `vertrokken`, `aangekomen`, `verhuisd`, `verdwenen`, `gestegen`, `gedaald`, `geslaagd`, `ontstaan`, `geweest`).
- **left/right bullets**: accurate. hebben bullets cover most/activity/transitive verbs + the "when in doubt pick hebben" heuristic; zijn bullets cover motion, change of state, and the fixed exceptions. No factual errors.
- **tip**: accurate framing (move-to-a-place / change-of-state -> zijn; else hebben). No em-dashes, arrows, or clichés.
- **lint-content**: clean.
