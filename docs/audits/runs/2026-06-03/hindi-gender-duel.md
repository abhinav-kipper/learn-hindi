# Accuracy audit: content/games/hindi/gender-duel.json

Date: 2026-06-03
Scope: Verify every `items[].answer` matches the noun's standard Hindi grammatical gender, plus the `hint`/`explain` text and the `left.bullets` / `right.bullets` / `tip` rules.
References used: Snell & Weightman (Teach Yourself Hindi), McGregor's Outline of Hindi Grammar, Oxford Hindi-English Dictionary (McGregor).

## Result summary

- Items checked: 52
- Gender corrections: 0
- Items removed: 0
- Bullet / tip fixes: 0

All genders, meanings, and explanation text verified correct. The file was not modified. `node scripts/lint-content.mjs` reports clean.

## Per-item verification

| # | prompt | hint | answer | standard gender | verdict |
|---|--------|------|--------|-----------------|---------|
| 1 | ghar | house/home | left (M) | M | OK |
| 2 | kitaab | book | right (F) | F | OK |
| 3 | kursi | chair | right (F) | F | OK |
| 4 | paani | water | left (M) | M | OK (classic -ii exception) |
| 5 | ladka | boy | left (M) | M | OK |
| 6 | ladki | girl | right (F) | F | OK |
| 7 | roti | flatbread | right (F) | F | OK |
| 8 | chai | tea | right (F) | F | OK |
| 9 | gaadi | car/vehicle | right (F) | F | OK |
| 10 | sadak | road | right (F) | F | OK |
| 11 | raat | night | right (F) | F | OK |
| 12 | kaam | work | left (M) | M | OK |
| 13 | darwaza | door | left (M) | M | OK |
| 14 | mez | table | right (F) | F | OK (Persian-origin, feminine) |
| 15 | khidki | window | right (F) | F | OK |
| 16 | paisa | money | left (M) | M | OK |
| 17 | doodh | milk | left (M) | M | OK |
| 18 | naukri | job | right (F) | F | OK |
| 19 | baat | matter/talk | right (F) | F | OK |
| 20 | ped | tree | left (M) | M | OK |
| 21 | phal | fruit | left (M) | M | OK |
| 22 | haath | hand | left (M) | M | OK |
| 23 | aankh | eye | right (F) | F | OK |
| 24 | naam | name | left (M) | M | OK |
| 25 | din | day | left (M) | M | OK |
| 26 | saal | year | left (M) | M | OK |
| 27 | ungli | finger | right (F) | F | OK |
| 28 | ghadi | watch/clock | right (F) | F | OK |
| 29 | chabi | key | right (F) | F | OK |
| 30 | bhasha | language | right (F) | F | OK (Sanskrit -aa feminine) |
| 31 | aadmi | man | left (M) | M | OK (famous -ii exception) |
| 32 | aurat | woman | right (F) | F | OK |
| 33 | kamra | room | left (M) | M | OK |
| 34 | samosa | samosa | left (M) | M | OK |
| 35 | raasta | way/path | left (M) | M | OK |
| 36 | dukaan | shop | right (F) | F | OK |
| 37 | bus | bus | right (F) | F | OK (loanword, tracks gaadi) |
| 38 | phone | phone | left (M) | M | OK (loanword default M) |
| 39 | kitab | book (variant) | right (F) | F | OK (spelling variant of kitaab) |
| 40 | behen | sister | right (F) | F | OK |
| 41 | bhai | brother | left (M) | M | OK |
| 42 | khaana | food/meal | left (M) | M | OK |
| 43 | sabzi | vegetable | right (F) | F | OK |
| 44 | machhli | fish | right (F) | F | OK |
| 45 | kutta | dog | left (M) | M | OK |
| 46 | billi | cat | right (F) | F | OK |
| 47 | phool | flower | left (M) | M | OK (consonant-ending masculine) |
| 48 | nadi | river | right (F) | F | OK |
| 49 | samay | time | left (M) | M | OK |
| 50 | khushi | happiness | right (F) | F | OK |
| 51 | pyaar | love | left (M) | M | OK |
| 52 | shahar | city | left (M) | M | OK |

## Notes on commonly mis-gendered items (spot-checked closely)

- **phool** (flower) M, not F: confirmed masculine. Correct.
- **din** M, **saal** M, **samay** M, **pyaar** M: all correctly masculine.
- **mez** F, **sadak** F, **dukaan** F, **aurat** F, **kitaab** F, **raat** F, **baat** F: consonant-ending feminines, all correct.
- **paani** M and **aadmi** M: the two standard -ii masculine exceptions, both correct.
- **phone**: English loanword. Conventionally masculine (matches the loanword-default-to-masculine rule); stable enough to keep as M, not removed.
- **kitab** vs **kitaab**: same word, two romanizations, both answered F. Redundant but not an accuracy error and gender is not disputed, so left in place per the "remove only for disputed gender" policy.

## Bullets / tip verification

- `tip`: -aa usually M, -ii usually F, ~75% reliable, learn paani (M) and chai (F) by heart. Accurate.
- `left.bullets`:
  - -aa usually masculine (ladka, kamra, raasta, samosa). Correct.
  - English loanwords default masculine (phone, scooter, computer). Correct.
  - -ii masculine exceptions paani, aadmi, ghee. Correct (ghee is masculine).
  - consonant-ending masculines ghar, naam, din, haath, kaam, ped. Correct.
- `right.bullets`:
  - -ii usually feminine (kursi, gaadi, roti, ghadi). Correct.
  - Sanskrit -aa flips feminine (bhasha, seva, katha). Correct (seva F, katha F).
  - consonant-ending feminines kitaab, raat, baat, mez. Correct.
  - vehicles/most foods-drinks lean feminine (chai, bus, gaadi). Correct as a soft heuristic.

No corrections required to bullets or tip.
