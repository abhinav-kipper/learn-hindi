# Content Quality Audit + Improver — Design

**Status:** approved 2026-05-26
**Repo:** `abhinav-kipper/learn-hindi`

## 1. Goal

Audit + improve all in-app content (lessons / foundations / stories / KNM / Lezen / vocab) for accuracy first and writing quality second. Build a reusable slash-command + rubric so future content can be audited the same way. Auto-apply all fixes in this first pass; subsequent runs can choose report-only if needed.

## 2. Decisions

| Decision | Choice |
|---|---|
| Build target | Reusable slash command (`/audit-content`) + standalone rubric + dispatcher script. Re-runnable as content grows. |
| Edit mode (this run) | Auto-apply all fixes the subagents identify with high confidence. Skip "report only" mode for the inaugural run — user explicitly requested auto-approve. |
| Scope (this run) | ALL 140+ content files: 19 Hindi lessons/foundations + 18 Dutch lessons/foundations + 3 Hindi stories + 100 KNM questions (audited as 6 category-batches) + 10 Lezen texts + 1 vocab file ≈ 51 audit units. |
| Rubric weight | Accuracy-first (Hindi/Dutch grammar, pedagogical correctness, cultural factuality, romanization, rule precision). Style as bonus (AI-cliché removal, tightening prose, real-voice not robot-voice). |
| Dispatch pattern | Parallel Opus subagents per audit unit. Controller manages batching (~10-12 per dispatch message). |
| Output | Per-file fixes applied via Edit; per-file report markdown saved to `docs/audits/runs/2026-05-26/<file-id>.md`; master summary `docs/audits/2026-05-26-audit-summary.md` aggregates findings + lists what changed. |
| Commits | One batch commit per dispatch group (controller-managed). |

## 3. The Rubric (`docs/audits/CONTENT_RUBRIC.md`)

Single source of truth for every audit. Subagents read it verbatim. Sections:

### 3.1 ACCURACY (primary axis — fix on sight)

**Hindi/Dutch grammar:**
- Sentence-level correctness (verb agreement, gender, register consistency)
- Pronunciation guide accuracy (syllable stress matches actual stress)
- Romanization conforms to project style guide (CONTENT.md): single-vowel endings (`karta` not `kartaa`), `chh` for छ, ASCII only

**Pedagogical accuracy:**
- Grammar rules stated correctly, no misleading oversimplifications
- Exceptions noted when relevant
- Examples actually demonstrate the rule
- Tense/gender/register agreement examples are themselves correct
- Cross-references to other foundations are accurate

**Cultural / factual:**
- Place names, official terms (gemeente, BSN, Inburgering, lakh/crore) used correctly
- No stereotypes; no factual errors about Indian or Dutch life
- Religious/sociolinguistic claims accurate (e.g., `tu` for deities, dialect notes)

**Schema / structural:**
- JSON parses
- Required fields present (id, title, phrases, etc.)
- references[] non-empty for foundations
- Field types correct

### 3.2 STYLE (secondary — fix when egregious)

**De-AI the voice:**
- Strip openers like "Let's dive in!", "Welcome to your journey", "Get ready to explore"
- Strip filler hedges: "It's important to note that", "It's worth mentioning", "Of course", "Essentially", "As we explore"
- Cut explanation tautologies: "X means X" without adding info
- Cut over-explanation of obvious concepts (don't say "Hindi is a language spoken in India" in a lesson titled "Hindi Numbers")

**Tighten prose:**
- Remove redundant sentences
- Cut throat-clearing ("That said,", "On the other hand,", "Now that we've covered this,")
- Replace abstract phrasing with concrete: "Numbers behave irregularly" → "11 through 19 are each unique"
- One thought per sentence; resist comma-spliced run-ons

**Voice match:**
- Cutting's voice in chapter intros: friendly, conversational, never starchy
- Body prose: precise, teacher-like, not chatty
- Practice prompts: directive ("You are X..."), no first-person plural ("Let's")
- Vocab definitions: tight, no padding

### 3.3 AUTO-APPLY vs SKIP

Subagents apply ALL fixes they identify with confidence. They skip only when:
- The fix would change pedagogical meaning AND they're <80% sure of the correct direction
- The fix touches romanization on a debated form (e.g., `chahiye` vs `chaahiye` — both are seen)
- The fix would shorten a foundation lesson's theory below useful explanatory length

Skipped items still appear in the per-file report under "Items not applied" with a brief why.

### 3.4 Output format per subagent

Each subagent writes a report at `docs/audits/runs/2026-05-26/<file-id>.md`:

```markdown
# Audit: <file-id>

**File:** path/to/file.json
**Audit date:** 2026-05-26
**Auditor model:** Opus 4.7
**Total fixes applied:** N
**Items not applied:** M

## Fixes applied

### Accuracy (N items)
1. **Where:** field `phrases[3].pronunciation`
   **Was:** `KARTAA hoon`
   **Now:** `kar-TA hoon`
   **Why:** Romanization style guide requires single-vowel endings; `KARTAA` was double-vowel.

### Style (N items)
1. **Where:** field `theory.intro`
   **Was:** "Let's dive into the world of Hindi numbers..."
   **Now:** "Hindi numbers look chaotic until..."
   **Why:** AI-cliché opener replaced with direct framing.

## Items not applied

1. **Where:** field `grammar_notes[2]`
   **Issue:** Possible oversimplification — claim "all -aa nouns are masculine" but examples include `bhaasha` (fem -aa).
   **Suggested fix:** Add qualifier "in most native nouns" or move bhaasha to exception list.
   **Why not applied:** Pedagogical-meaning change; flagging for user review.
```

## 4. The Dispatcher (`scripts/audit-content.mjs`)

Helper script. Functions:
- `listContentFiles({ scope })` — returns the list of audit units for a given scope:
  - `'all'` (default for this run)
  - `'lessons'`
  - `'foundations'`
  - `'stories'`
  - `'knm'`
  - `'lezen'`
  - `'vocab'`
  - `'<file-id>'` (single file)
- `buildPrompt(unit)` — generates the Opus subagent prompt for one audit unit (injects the rubric + target file path + report-output path).
- `loadReports(date)` — reads all per-file reports from `docs/audits/runs/<date>/` and aggregates into a summary.
- `writeSummary(reports, date)` — writes the master `docs/audits/<date>-audit-summary.md`.

Used by the slash command. Standalone runnable for testing: `node scripts/audit-content.mjs --scope=lessons --list` prints the file list; `--build-prompt=<file-id>` prints the prompt to stdout.

## 5. The Slash Command (`.claude/commands/audit-content.md`)

A slash-command spec for Claude Code. When user types `/audit-content` (or `/audit-content lessons`), Claude:
1. Reads `docs/audits/CONTENT_RUBRIC.md`
2. Runs `node scripts/audit-content.mjs --scope=<scope> --list` to get the file list
3. Dispatches Opus subagents in parallel batches of ~10
4. Each subagent runs its audit, applies fixes via Edit, writes its report
5. Controller runs `node scripts/audit-content.mjs --aggregate=<date>` to build the summary
6. Controller batch-commits the auto-applied changes per dispatch batch
7. Controller pushes after all batches complete
8. Reports the summary URL + headline stats to the user

The command can take args: `/audit-content` (all), `/audit-content lessons`, `/audit-content 06-gemeente`, etc.

## 6. KNM batching (special case)

KNM has 100 questions in one big JSON. Auditing as 1 unit would saturate the subagent context. Split into 6 category-batches (Politics, Work, Education, Housing, Healthcare, History) — each subagent audits ~15-17 questions, fixes inline, reports.

The dispatcher computes the category groups + provides the start/end indices in the prompt.

## 7. Files

### New
| Path | Responsibility |
|---|---|
| `docs/audits/CONTENT_RUBRIC.md` | The rubric (sections 3.1-3.4) |
| `scripts/audit-content.mjs` | Dispatcher / file-list / prompt-template / aggregator |
| `.claude/commands/audit-content.md` | Slash-command spec |
| `docs/audits/runs/2026-05-26/<file-id>.md` × ~51 | Per-file reports (generated) |
| `docs/audits/2026-05-26-audit-summary.md` | Master summary (generated) |

### Modified during this run
- Up to 140 content JSON files — auto-applied fixes (typos, romanization, AI cliché removal, JSON shape, etc.)

### Docs
- `CLAUDE.md` — new entry for the audit command + rubric pointer

## 8. Validation

- After each dispatch batch: `npx tsc --noEmit`, `npx vitest run`, `node scripts/lint-design.mjs` — all must pass before committing the batch
- JSON parse check on every modified file (subagent + controller both verify)
- The master summary is the deliverable artifact — user can audit the audit

## 9. Out of scope

- Cross-file consistency checks (each subagent only sees its own file + rubric)
- Audio recording / pronunciation actual-voice verification
- CI integration (could add later)
- Phase 2 / 3 audits scheduled — once the tool exists, user re-runs when content drifts
- New content authoring (this is audit + improve, not new content)

## 10. Risks

- **Auto-apply bypass** — subagent may over-edit and dull the voice. Mitigation: rubric explicitly says "skip if pedagogical-meaning change"; user has session history (git revert per commit if a batch goes wrong)
- **Native-speaker concerns** — LLM can audit grammar but won't catch subtle native-speaker red flags. The audit is "good enough" not "publication-ready"; user has final review via the summary doc
- **Batch failures** — if a single subagent fails mid-batch, controller re-dispatches just that one
- **Rubric drift** — rubric may need updates as the audit progresses; first run codifies the rubric, future runs benefit from the lessons

## 11. Out of scope for this single spec

The audit doesn't include:
- Rewriting practice_prompts (just did that — 29 lessons completed)
- Building new lessons or theory chapters
- Cross-language consistency (Hindi and Dutch terminologies)

These can be follow-up specs if needed.
