# Audit: dutch-family-home

**File:** content/dutch/lessons/14-family-home.json
**Audit date:** 2026-06-03
**Total fixes applied:** 1
**Items not applied:** 0

## Fixes applied

### Accuracy (1 item)

1. **Where:** field `phrases[3].pronunciation` (the "Ik woon samen met mijn vriendin" phrase)
   **Was:** `ik WOHN SAA-men met mayn VREEN-din. we WOH-nen al VAYF yaar SAA-men.`
   **Now:** `ik WOHN SAA-men met mayn vreen-DIN. we WOH-nen al VAYF yaar SAA-men.`
   **Why:** Dutch `vriendin` (girlfriend / female friend) is stressed on the **final** syllable (vrien-DÍN), which is exactly what distinguishes it from `vriend`. The old form stressed the first syllable (`VREEN-din`), reversing the actual prosody. Confirmed against dutchgrammar.com forum + general Dutch stress references. Only the stress marker moved; the vowel rendering (`vreen` = /i/ "ee") is unchanged.

## Verification

Checked and confirmed accurate (no change needed):

- **Family vocab spelling + gender:** `de moeder/vader/broer/zus/man/vrouw`, `het kind` / `de kinderen`, `de ouders`, `de opa/oma`, `de zoon/dochter` — none mis-spelled or mis-gendered in the file.
- **de/het articles:** `het centrum`, `het appartement`, `het huis` all correct, including the `een huis of een appartement` indefinite forms and `in het centrum`.
- **Grammar:** `Ik heb twee kinderen`, `Heb je broers of zussen?`, `Ik ben getrouwd`, `Ik woon in Utrecht`, `Ik woon samen met mijn vrouw/vriendin`, `Woon je in het centrum?`, `Hoe oud zijn je kinderen?` — all grammatically sound (`hebben` for possession, `zijn` for age, `wonen + in`, possessives `mijn/je/uw`). The `grammar_notes` `hebben`-vs-`zijn` and `je`/`jouw`/`uw` explanations are correct.
- **Culture notes:** `samenwonen` framing, smaller family norm, and Dutch directness about personal questions are all accurate and current.
- **Pronunciation format:** SYLLABLE-stress with hyphens + CAPS throughout. The varying `ui` renderings (`HOYS` vs `BOW-ten`) are rough English approximations of /œy/, consistent with the prosodic-approximation style documented in CONTENT.md audit notes — not flagged.
- **References:** all three (`Nederlands in gang`, `TaalCompleet A1`, `Naar Nederland`) are on the vetted source list.
- **Style:** no AI-cliché openers, no em-dashes, no arrows, no jargon left unglossed.

## Linters

- `node scripts/lint-content.mjs` → clean
- `node scripts/lint-quality.mjs` → clean
- JSON parses.
