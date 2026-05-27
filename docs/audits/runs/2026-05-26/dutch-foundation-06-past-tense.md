# Audit: dutch-foundation-06-past-tense

**File:** content/dutch/foundations/06-past-tense.json
**Audit date:** 2026-05-27
**Total fixes applied:** 4
**Items not applied:** 3

> Note: a prior audit pass on this file (dated 2026-05-27, same run-date directory) already corrected three items: the `Ik ben gisteren naar Amsterdam gegaan` example in `theory.sections[0].examples[0]`, the cleaned-up `phrases[1].context` kofschip explanation, and the `ge-GAY-ten` pronunciation in `phrases[0]`. This re-audit picks up further accuracy issues that pass left in place.

## Fixes applied

### Accuracy (4 items)

1. **Where:** field `skill_breakdown[1].explanation` (hebben vs zijn selection)
   **Was:** "Use zijn for: (1) movement verbs with a destination — gaan, komen, rijden, lopen, vliegen, zwemmen. (2) state change — worden, blijven, zijn, vallen, groeien, sterven. Use hebben for everything else."
   **Now:** "...(2) state change — worden, vallen, groeien, sterven. Plus two key exceptions that also take zijn: blijven (stay) and zijn itself (geweest). Use hebben for everything else."
   **Why:** `blijven` (to stay) and `zijn` (to be) are not state-change verbs — `blijven` is literally the opposite of change, and `zijn` is a stative copula. They take `zijn` as auxiliary by lexical convention, not by category membership. Listing them under "state change" misteaches the rule.

2. **Where:** field `grammar_notes[1]`
   **Was:** "Zijn-verbs rule of thumb: intransitive verbs of movement (gaan, komen, rijden, lopen) AND state change (worden, blijven, zijn) take zijn..."
   **Now:** "Zijn-verbs rule of thumb: intransitive verbs of movement with a destination (gaan, komen, rijden, lopen) AND state change (worden, sterven, vallen) take zijn. Two key exceptions also take zijn: blijven (stay) and zijn itself (geweest)..."
   **Why:** Same mis-categorization as above. Also added the "with a destination" qualifier to the movement clause — `skill_breakdown[1]` already enforces this with the `Ik heb een uur gelopen` example, but the grammar_notes rule of thumb was previously silent on it.

3. **Where:** field `theory.sections[2].body` (Hebben vs zijn section)
   **Was:** "...verbs of MOTION with a destination (`gaan` go, `komen` come, `lopen` walk, `vallen` fall, `zwemmen` swim) and verbs of CHANGE OF STATE (`worden` become, `sterven` die, `opstaan` get up, `blijven` stay)..."
   **Now:** "...verbs of MOTION with a destination (`gaan` go, `komen` come, `lopen` walk, `zwemmen` swim) and verbs of CHANGE OF STATE (`worden` become, `sterven` die, `vallen` fall, `opstaan` get up). Two key exceptions also take zijn: `blijven` (stay) and `zijn` itself (`geweest`)."
   **Why:** Parallels fixes 1 and 2. Also moved `vallen` from the motion list to state-change (a fall is more a change-of-state than a destination-bound motion) so the two categories are coherent.

4. **Where:** field `phrases[2].context`
   **Was:** "CRITICAL: use 'zijn' (not 'hebben') for verbs of movement or state change: gaan (go), komen (come), zijn (be), worden (become), rijden (ride/drive), vallen (fall), sterven (die), opstaan (get up)"
   **Now:** "CRITICAL: use 'zijn' (not 'hebben') for verbs of movement or state change: gaan (go), komen (come), worden (become), rijden (ride/drive), vallen (fall), sterven (die), opstaan (get up). Plus two exceptions: zijn (be) → geweest, and blijven (stay) → gebleven."
   **Why:** `zijn` was sitting inside a "movement or state change" set where it doesn't fit; surfacing it as a flagged exception keeps the rule honest across all four mentions in the file (phrase context, grammar_notes, skill_breakdown, theory).

## Items not applied (3)

1. **Where:** field `phrases[0]` — "Wij hebben gelopen. (We walked.)"
   **Issue:** `lopen` is taught as a zijn-verb in later sections, but it correctly takes `hebben` when there's no destination (duration walking). Beginners reading this in the very first phrase — before the destination-vs-no-destination nuance is introduced — may absorb "lopen always uses hebben."
   **Suggested fix:** Either swap `gelopen` for a clearly hebben-only verb (e.g. `geslapen` → "We slept") or change to `Wij zijn naar huis gelopen` with a destination to match the dominant rule taught first.
   **Why not applied:** Pedagogical-meaning change; <80% confident the author didn't deliberately seed this contrast so that `skill_breakdown[1]`'s `Ik heb een uur gelopen` example lands later. Flagging for review.

2. **Where:** field `phrases[0].pronunciation` — "ge-SPAYLT" for `gespeeld`
   **Issue:** The past participle of `spelen` is spelled `gespeeld` (-d), but the pronunciation gloss ends in -T. This is technically correct due to Dutch final-devoicing (word-final `d` → [t] phonetically), but a learner just told to "use kofschip to decide -t vs -d" may infer that `spelen` is a kofschip-ending verb when it isn't.
   **Suggested fix:** Render as `ge-SPAYLD` (preserves the spelling cue, still phonetically defensible), or add a parenthetical reminding the reader that final-d sounds like [t].
   **Why not applied:** Likely a deliberate authorial choice — the codebase's pronunciation glosses render surface phonetics (per CONTENT.md Audit Notes). <80% confident the fix improves teaching rather than diverging from house style.

3. **Where:** field `phrases[1].pronunciation` — "tay, kaa, ef, es, CHAY, pay" for Dutch letter names t/k/f/s/ch/p
   **Issue:** Dutch letter names: t≈tee, k=kaa, f=ef, s=es, p=pee. The romanizations `tay` and `pay` use the English long-a vowel rather than the long-e vowel of the Dutch letter. `CHAY` for the `ch` digraph is also unusual since `ch` isn't a single alphabet letter you spell out by name in Dutch.
   **Suggested fix:** "tee, kaa, ef, es, CHEE, pee" — closer to the actual Dutch letter names and consistent with house pronunciation conventions for long-e vowels.
   **Why not applied:** This straddles accuracy and house-style for the pronunciation field. <80% confident; flagging for the author to confirm whether `tay/pay` is a deliberate English-reader-friendly approximation.
