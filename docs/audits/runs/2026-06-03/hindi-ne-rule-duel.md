# Audit: content/games/hindi/ne-rule.json (Ne or No Ne duel)

Date: 2026-06-03
Reference: Snell & Weightman *Teach Yourself Hindi* (ergative `ne` construction), McGregor *Outline of Hindi Grammar*.

## Rule under test
In the perfective past, **transitive** verbs require the agent to take `ne`
(answer `left`). **Intransitive** verbs take no `ne` (answer `right`). The
classic transitive-looking exceptions **bolna, laana, bhoolna** take **NO
ne** despite having a notional object.

## Scope
- 30 rounds drawn from 52 items, plus `left`/`right` bullet sets and the `tip`.
- Verified for every item: (1) sentence is past/perfective, (2) verb
  transitivity, (3) `answer` matches the rule incl. the three exceptions,
  (4) verb agreement and single-vowel romanization.

## Findings

### Corrections (5)

All four `NO ne` exception items for laana/bolna/bhoolna were authored with
the subject still in the **ne form** (`tumne`/`maine`), which directly
contradicts the answer they teach (`right` = no ne) and is ungrammatical:
with these verbs the agent must stay bare and the verb agrees with the
subject. Fixed the subject + verb agreement and clarified each `explain`.

| # | Verb | was | now |
|---|------|-----|-----|
| bolna item | bolna (exception) | `tumne sach bola` | `tum sach bole` |
| laana item | laana (exception) | `maine chaabi laayi` | `main chaabi laayi` |
| bhoolna item | bhoolna (exception) | `tumne mera naam bhoola` | `tum mera naam bhoole` |
| laana item | laana (exception) | `tumne paani laaya` | `tum paani laaye` |

`explain` for each of the above also updated to state explicitly that the
subject stays bare (e.g. "the subject stays tum (not tumne) and the verb
agrees with it").

Romanization normalization (1):

| # | was | now |
|---|-----|-----|
| gaana item | `usne gana gaaya` | `usne gaana gaaya` (long `aa` root; matches the `gaana` spelling used elsewhere in the file) |

### Removals (0)

No items removed. Every prompt is a genuine past/perfective sentence and,
after the corrections above, every `answer` matches the ergative rule.

### Verified correct (no change)

- Transitive `left` items (khaana, padhna, peena, likhna, dekhna, sunna,
  karna, banaana, kholna, poochna, chalaana, khareedna, jeetna, bhejna,
  kaatna, dhona, seekhna, uthaana, kar liya compound) all correctly take
  `ne`, with object-gender agreement intact (`roti khaayi`, `paani piya`,
  `chai banayi`, `kitaab padhi`, `film dekhi`, `sabzi kaati`, `chitthi
  bheji`, `mez uthayi`, `kapde dhoye`).
- Intransitive `right` items (jaana, sona, rona, baithna, uthna, girna,
  daudna, pahunchna, hansna, lautna, letna, naachna, ghabraana, milna,
  chalna, jaagna, rukna, aana) all correctly take no `ne` with
  subject agreement.
- `milna` ("to meet", with `se`) correctly treated as intransitive (no ne).
- The two exception items already authored with a bare subject
  (`main yeh kitaab laaya`, `main pata bhool gaya`) were already correct.

### Bullets + tip

- `left` bullets: transitive-takes-ne, object test, compound inheritance,
  and **object-agreement** example (`maine roti khaayi`, `maine paani
  piya`) all correct.
- `right` bullets: intransitive-no-ne, no-object test, the three liars
  (`woh bola`, `main laaya`, `main bhool gaya` shown bare), subject
  agreement all correct.
- `tip`: accurate (read the verb, object test, three liars bola/laaya/
  bhoola). No change.

## Result
5 corrections, 0 removals. JSON valid; `node scripts/lint-content.mjs` clean.
