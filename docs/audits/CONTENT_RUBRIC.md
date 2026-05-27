# Content Quality Audit Rubric

**Version:** 1.0
**Last updated:** 2026-05-26

This rubric defines what subagents audit when they run a content quality check. Subagents read this file verbatim on every run.

## Quick reference

| Axis | Priority | Action |
|---|---|---|
| Accuracy (grammar, rules, facts) | **Primary — fix on sight** | Auto-apply |
| Style (tightness, voice, no AI-cliché) | Secondary — fix when egregious | Auto-apply |
| Structural (schema, JSON) | Catch + fix | Auto-apply |
| Pedagogical-meaning changes | Flag, don't apply | Report only |

---

## 1. ACCURACY (primary)

Apply these fixes immediately when found.

### 1.1 Hindi grammar

- Verb agreement matches subject gender + number
- `ne` rule applied correctly (transitive past → subject takes `ne` → verb agrees with object)
- Postposition usage correct (`mein` for in/inside, `par` for on/at, `se` for from/with, `ko` for to/at)
- Oblique case shift on `-aa` nouns before postpositions (`ladka` → `ladke ko`)
- Adjective-noun gender + number agreement (`-aa` adjectives shift; non-`-aa` don't)
- Pronoun-verb-auxiliary chain consistent (main → hoon, tu → hai, tum → ho, aap → hain)
- Register consistency within a phrase / paragraph (don't mix `aap` and `tu` to the same person mid-sentence)

### 1.2 Dutch grammar

- V2 rule respected (finite verb is the second element)
- Separable verbs: prefix detaches in main clause, stays attached in modals/perfect
- Subordinate clauses: verb goes to end after `omdat`/`als`/`dat`/`wanneer`/`terwijl`
- `de`/`het` article correct (~75% de, ~25% het; diminutives `-je` always het; plural always de)
- Adjective-ending: `-e` except `een + het-word` ("een mooi boek", "een mooie tafel")
- Perfect tense auxiliary: `hebben` for most verbs, `zijn` for motion + change of state (gaan/komen/lopen/vallen/worden)
- Past-participle formation: `ge-` + stem + `-t/-d/-en` with kofschip rule for `-t/-d`
- Modal + infinitive: infinitive at clause end

### 1.3 Romanization & pronunciation (Hindi)

- ASCII only — no Devanagari script
- Single-vowel endings: `karta` not `kartaa`, `karunga` not `karoongaa`, `gaya` not `gayaa`
- `chh` for छ (`chhat` not `cchat` not `chat`), `dh` for ध, `th` for थ
- `aa` only when ambiguity matters (`haan` yes vs `han`)
- Pronunciation field: SYLLABLE-stress format with hyphens between syllables, CAPS on stressed syllable (`BA-zaar ja-NA hai`)
- Pronunciation reflects actual sentence prosody (CAPS marks where the spoken beat falls — see CONTENT.md Audit Notes for confirmation this is intentional, not a bug)

### 1.4 Pedagogical accuracy

- Grammar rules stated correctly without misleading oversimplifications
- Exceptions noted when relevant (e.g., for "all `-aa` nouns are masculine", flag exceptions like `bhaasha`)
- Examples actually demonstrate the rule being taught
- Cross-references to other foundations/chapters are accurate
- Theory `quick_check` `correct_index` actually matches the correct option
- `examples[].breakdown` (when present) accurately describes the grammar at work

### 1.5 Cultural / factual

- Place names spelled correctly (Lucknow, Mumbai, Amsterdam, Utrecht, Den Haag)
- Official terms used correctly:
  - Hindi: BSN, lakh, crore, paani, chai, bhaiya, yaar
  - Dutch: gemeente, BSN, DigiD, OV-chipkaart, huisarts, basisschool, kofschip
- No factual errors about Indian or Dutch life (price ranges, distances, processes)
- Religious/sociolinguistic claims accurate (e.g., `tu` for deities, mother addressing child as `tum` not `aap`)
- Currency: rupaye for Hindi content, euro for Dutch

### 1.6 Schema / structural

- JSON parses
- Required fields present (id, title, phrases, etc.)
- `references[]` non-empty for foundations and lessons
- Field types correct (strings vs arrays vs objects)
- Lesson IDs match file naming convention
- Story panels: each has `scene`, `hindi`, `english`
- Theory sections: each has `heading`, `body`, `cutting_intro`, `quick_check`, plus at least one of (table | examples | callout)

---

## 2. STYLE (secondary)

Fix when clearly improving the prose without changing meaning.

### 2.1 De-AI the voice

Strip these openers and phrases — they're AI tells:

- "Let's dive in!" / "Let's explore" / "Welcome to your journey"
- "Get ready to..." / "Prepare to..."
- "It's important to note that"
- "It's worth mentioning that"
- "Of course," (when used as throat-clearing)
- "Essentially,"
- "As we explore this concept"
- "In the world of..."
- "When it comes to..."
- "At the end of the day..."
- "Without further ado"

Strip explanation tautologies:
- "X means X" without adding new info
- Restating the heading in the first sentence ("In this section on numbers, we'll learn about numbers...")
- Over-explanation of obvious concepts in the lesson's own subject area

### 2.2 Tighten prose

- Cut throat-clearing: "That said,", "On the other hand,", "Now that we've covered this,"
- Replace abstract phrasing with concrete:
  - "Numbers behave irregularly" → "11 through 19 are each unique"
  - "There are challenges to overcome" → "The `ne` rule is the hardest part"
- One thought per sentence; resist comma-spliced run-ons
- Cut redundant qualifiers ("really very important" → "important")
- Remove sentences that exist only to bridge between paragraphs

### 2.3 Voice match

- **Chapter intros (`theory.intro` / `cutting_intro`):** Cutting's voice — friendly, conversational, direct, never starchy. Like a knowledgeable friend at a tea stall, not a textbook.
- **Theory body:** Precise teacher-voice. Not chatty, not lecturey. Active verbs.
- **Practice prompts:** Directive ("You are X..."). No first-person plural ("Let's..."). System-prompt voice for the AI, not user-facing.
- **Vocabulary definitions:** Tight, no padding.
- **Story dialogue:** In-character (chai stall vendor sounds like a chai stall vendor, not a narrator).

### 2.4 Romanization style (auto-apply for clear cases)

Apply when the existing form is clearly off-style:
- `kartaa` / `karoongaa` style → `karta` / `karunga`
- `cchat` → `chhat`
- Anything in Devanagari → romanize per style guide

Skip (these are debated):
- `chahiye` vs `chaahiye` — both are seen in the codebase
- `paanch` vs `panch` — context-dependent
- Case-sensitive prosodic stress in pronunciation field — INTENTIONAL per audit notes

---

## 3. AUTO-APPLY vs SKIP

Subagents apply ALL fixes they're confident about. Skip and report-only when:

- The fix would change pedagogical meaning AND the subagent is <80% sure of the correct direction
- The fix touches a debated romanization form (see 2.4 skip list)
- The fix would shorten a foundation lesson's theory below useful explanatory length (theory chapters need ~3-5 sub-sections of substance)
- The "issue" is a stylistic choice the author may have made deliberately (e.g., a particular Cutting greeting, a regional dialect choice)

Skipped items appear in the per-file report under "Items not applied" with a brief why.

---

## 4. Output format

Each subagent writes a per-file report at `docs/audits/runs/<date>/<file-id>.md`:

```markdown
# Audit: <file-id>

**File:** path/to/file.json
**Audit date:** <YYYY-MM-DD>
**Total fixes applied:** N
**Items not applied:** M

## Fixes applied

### Accuracy (N items)

1. **Where:** field `phrases[3].pronunciation`
   **Was:** `KARTAA hoon`
   **Now:** `kar-TA hoon`
   **Why:** Single-vowel ending per style guide.

### Style (N items)

1. **Where:** field `theory.intro`
   **Was:** "Let's dive into..."
   **Now:** "Hindi numbers look..."
   **Why:** AI-cliché replaced with direct framing.

## Items not applied (M)

1. **Where:** field `grammar_notes[2]`
   **Issue:** Possible oversimplification — "all `-aa` nouns masc" but `bhaasha` (fem) exists.
   **Suggested fix:** Add qualifier "in most native nouns" or move `bhaasha` to exception list.
   **Why not applied:** Pedagogical-meaning change; flagging for user review.
```

If no fixes and no items skipped, the report contains only the header + a `## Clean` line.

---

## 5. Version history

- **1.0 (2026-05-26):** Initial rubric. Locked accuracy-first + auto-apply-style policy for the inaugural audit run.
