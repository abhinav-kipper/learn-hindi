# /audit-content — Content Quality Audit

Runs a content quality audit + auto-improvement pass on app content. Dispatches parallel Opus subagents (one per file), each reads the rubric, applies high-confidence fixes inline, and writes a per-file report. Controller aggregates into a master summary and commits the changes.

## Usage

```
/audit-content                  # audit everything (~57 units across both languages)
/audit-content lessons          # audit just situation lessons
/audit-content foundations      # audit just foundations
/audit-content stories          # audit just stories
/audit-content knm              # audit KNM (split into 6 category batches)
/audit-content lezen            # audit Lezen texts (10 units)
/audit-content vocab            # audit vocabulary file
/audit-content <file-id>        # audit a single unit (id from `--list`)
```

## What to do when this command is invoked

1. **Determine the run date** in YYYY-MM-DD (today).
2. **Read the rubric** at `docs/audits/CONTENT_RUBRIC.md` (so you can answer if a subagent reports a gap).
3. **Compute the audit unit list** by running:

   ```bash
   node scripts/audit-content.mjs --list --scope=<scope>
   ```

   Parse the JSON output. Each unit has `id`, `path`, `kind`, `language`, and possibly `category`/`textId`.

4. **For each unit, build its subagent prompt** by running:

   ```bash
   node scripts/audit-content.mjs --build-prompt=<unit-id> --date=<run-date>
   ```

   The script returns a complete, self-contained prompt referencing the rubric and the target file.

5. **Dispatch Opus subagents in parallel batches**. Cap each batch at ~10-12 subagents (one Agent tool use per unit, all in one assistant message). Use `subagent_type: "general-purpose"` and `model: "opus"`. Wait for the batch to complete before dispatching the next batch.

6. **After each batch completes**: run validation:

   ```bash
   npx tsc --noEmit
   node scripts/lint-design.mjs
   # JSON parse check per touched file is already done by the subagents
   ```

   If validation fails, identify which subagent's changes broke it and roll back via `git checkout content/<file>`. Don't proceed to next batch until clean.

7. **After each batch completes + validates**: batch-commit:

   ```bash
   git add docs/audits/runs/<run-date>/ <files-modified-by-this-batch>
   git commit -m "audit(content): apply batch N fixes via Opus subagents"
   ```

8. **After ALL batches complete**: aggregate the reports:

   ```bash
   node scripts/audit-content.mjs --aggregate=<run-date>
   ```

   This writes `docs/audits/<run-date>-audit-summary.md`. Commit it:

   ```bash
   git add docs/audits/<run-date>-audit-summary.md
   git commit -m "audit(content): write master summary for <run-date> run"
   git push origin main
   ```

9. **Report to user**: headline stats from the summary (files audited, fixes applied, items skipped/needing review), with the summary path linked.

## Auto-apply policy (this command)

This command runs in **auto-apply mode** by default. Subagents fix everything they're confident about. Items they skip appear in their per-file reports under "Items not applied" — these are surfaced in the master summary for user review.

## Notes

- Subagent dispatch is parallel within a batch but batches run sequentially (controller manages between-batch validation + commits).
- KNM audits are split by category (6 batches not 1) since 100 questions in one file would saturate subagent context.
- Lezen audits are split by individual text (10 subagents, each scoped to one text).
- If a subagent reports BLOCKED or returns malformed output, re-dispatch just that single subagent with the same prompt.
- The audit can be re-run later as content drifts; reports overwrite the prior run's directory if the same date is used (rare; usually different dates).
