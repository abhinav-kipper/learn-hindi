#!/usr/bin/env node
/**
 * Content Quality Audit dispatcher.
 *
 * Lists audit units, builds per-unit prompts injecting the rubric, and aggregates
 * per-file reports into a master summary. The actual Opus subagent dispatch
 * happens via Claude Code's Agent tool in chat — this script provides the
 * deterministic plumbing.
 *
 * Usage:
 *   node scripts/audit-content.mjs --list [--scope=all|lessons|foundations|stories|knm|lezen|vocab]
 *   node scripts/audit-content.mjs --build-prompt=<unit-id>
 *   node scripts/audit-content.mjs --aggregate=<YYYY-MM-DD>
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPO_ROOT = path.resolve(__dirname, '..')
const RUBRIC_PATH = 'docs/audits/CONTENT_RUBRIC.md'

// ---------- Audit unit discovery ----------

function listHindiLessons() {
  const dir = path.join(REPO_ROOT, 'content/lessons')
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => ({
    id: `hindi-lesson-${f.replace('.json', '')}`,
    path: `content/lessons/${f}`,
    kind: 'lesson',
    language: 'hindi',
  }))
}

function listHindiFoundations() {
  const dir = path.join(REPO_ROOT, 'content/foundations')
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => ({
    id: `hindi-foundation-${f.replace('.json', '')}`,
    path: `content/foundations/${f}`,
    kind: 'foundation',
    language: 'hindi',
  }))
}

function listHindiStories() {
  const dir = path.join(REPO_ROOT, 'content/stories')
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => ({
    id: `hindi-story-${f.replace('.json', '')}`,
    path: `content/stories/${f}`,
    kind: 'story',
    language: 'hindi',
  }))
}

function listDutchLessons() {
  const dir = path.join(REPO_ROOT, 'content/dutch/lessons')
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => ({
    id: `dutch-lesson-${f.replace('.json', '')}`,
    path: `content/dutch/lessons/${f}`,
    kind: 'lesson',
    language: 'dutch',
  }))
}

function listDutchFoundations() {
  const dir = path.join(REPO_ROOT, 'content/dutch/foundations')
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => ({
    id: `dutch-foundation-${f.replace('.json', '')}`,
    path: `content/dutch/foundations/${f}`,
    kind: 'foundation',
    language: 'dutch',
  }))
}

function listDutchKnm() {
  const p = 'content/dutch/knm.json'
  if (!fs.existsSync(path.join(REPO_ROOT, p))) return []
  // KNM: split into 6 category-batches
  return [
    'Politics & Constitution',
    'Work & Income',
    'Education & Children',
    'Housing',
    'Healthcare',
    'History & Geography',
  ].map(cat => ({
    id: `dutch-knm-${cat.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '')}`,
    path: p,
    kind: 'knm-batch',
    language: 'dutch',
    category: cat,
  }))
}

function listDutchLezen() {
  const p = 'content/dutch/lezen.json'
  if (!fs.existsSync(path.join(REPO_ROOT, p))) return []
  const data = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, p), 'utf8'))
  const texts = Array.isArray(data) ? data : data.texts || []
  return texts.map((t, i) => ({
    id: `dutch-lezen-${t.id || `text-${i}`}`,
    path: p,
    kind: 'lezen-text',
    language: 'dutch',
    textId: t.id || `text-${i}`,
  }))
}

function listHindiVocab() {
  const p = 'content/vocabulary.json'
  if (!fs.existsSync(path.join(REPO_ROOT, p))) return []
  return [{
    id: 'hindi-vocabulary',
    path: p,
    kind: 'vocabulary',
    language: 'hindi',
  }]
}

export function listAuditUnits(scope = 'all') {
  const all = [
    ...listHindiLessons(),
    ...listHindiFoundations(),
    ...listHindiStories(),
    ...listDutchLessons(),
    ...listDutchFoundations(),
    ...listDutchKnm(),
    ...listDutchLezen(),
    ...listHindiVocab(),
  ]
  if (scope === 'all') return all
  if (scope === 'lessons') return all.filter(u => u.kind === 'lesson')
  if (scope === 'foundations') return all.filter(u => u.kind === 'foundation')
  if (scope === 'stories') return all.filter(u => u.kind === 'story')
  if (scope === 'knm') return all.filter(u => u.kind === 'knm-batch')
  if (scope === 'lezen') return all.filter(u => u.kind === 'lezen-text')
  if (scope === 'vocab') return all.filter(u => u.kind === 'vocabulary')
  // Else treat as a specific id
  return all.filter(u => u.id === scope || u.id.endsWith(scope))
}

// ---------- Prompt building ----------

export function buildPrompt(unit, runDate) {
  const reportPath = `docs/audits/runs/${runDate}/${unit.id}.md`
  const kindGuidance = kindSpecificGuidance(unit)
  return `You are auditing ONE content file for quality. Apply all clear-confidence fixes. Report items you don't apply.

Working dir: \`/home/user/learn-hindi\`, branch: \`main\`.

## Step 1: Read the rubric (your audit checklist)

\`\`\`
Read ${RUBRIC_PATH}
\`\`\`

## Step 2: Read the target

\`\`\`
Read ${unit.path}
\`\`\`

${kindGuidance}

## Step 3: Audit + fix

Apply EVERY accuracy/structural fix you're confident about, and every style fix where the improvement is clear (AI-cliché removal, redundant phrase cuts, romanization typos). Use the \`Edit\` tool — surgical edits, one field at a time.

**Skip** (and report instead) when:
- The fix would change pedagogical meaning AND you're under 80% sure of the correct direction
- The fix touches a romanization form the rubric flags as debated
- The "issue" looks like deliberate authorial choice (regional dialect, intentional voice)

## Step 4: Verify the file still parses

\`\`\`bash
node -e "JSON.parse(require('fs').readFileSync('${unit.path}','utf8')); console.log('parsed OK')"
\`\`\`

If it doesn't parse, your last Edit broke the JSON — undo until it parses.

## Step 5: Write your report

Write a markdown file at \`${reportPath}\` matching the format in section 4 of the rubric. Header includes file path, audit date (${runDate}), total fixes applied, items not applied. Sections: Fixes applied (with Accuracy / Style sub-headers), Items not applied (if any). If clean, just say "## Clean".

## Step 6: Report back

Status (DONE / BLOCKED), counts: fixes-applied / items-skipped, biggest accuracy concern if any. Do NOT commit — controller batch-commits.`
}

function kindSpecificGuidance(unit) {
  if (unit.kind === 'knm-batch') {
    return `## Scope (KNM batch)

This is a category-batch audit. The file contains 100 questions; you only audit the questions in category \`${unit.category}\` (typically 15-20 questions). Apply fixes only to those questions; leave the rest untouched. Read the whole file first to find your category's question indices.`
  }
  if (unit.kind === 'lezen-text') {
    return `## Scope (Lezen text)

The file contains 10 texts; audit only the text with id \`${unit.textId}\` and its associated questions. Apply fixes inside that text's nested object only. Leave other texts untouched.`
  }
  return ''
}

// ---------- Aggregation ----------

export function loadReports(runDate) {
  const dir = path.join(REPO_ROOT, `docs/audits/runs/${runDate}`)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => ({
      file: f,
      path: `docs/audits/runs/${runDate}/${f}`,
      content: fs.readFileSync(path.join(dir, f), 'utf8'),
    }))
}

export function writeSummary(reports, runDate) {
  const out = []
  out.push(`# Content Audit Summary — ${runDate}\n`)
  out.push(`**Total files audited:** ${reports.length}\n`)
  out.push('---\n')

  const cleanFiles = []
  const filesWithFixes = []
  const filesWithSkips = []

  for (const r of reports) {
    const fixesMatch = r.content.match(/\*\*Total fixes applied:\*\*\s*(\d+)/i)
    const skipsMatch = r.content.match(/\*\*Items not applied:\*\*\s*(\d+)/i)
    const fixes = fixesMatch ? parseInt(fixesMatch[1], 10) : 0
    const skips = skipsMatch ? parseInt(skipsMatch[1], 10) : 0
    if (fixes === 0 && skips === 0) cleanFiles.push(r.file)
    else {
      if (fixes > 0) filesWithFixes.push({ file: r.file, fixes })
      if (skips > 0) filesWithSkips.push({ file: r.file, skips })
    }
  }

  out.push(`## Headline\n`)
  out.push(`- Files audited: ${reports.length}`)
  out.push(`- Files with fixes applied: ${filesWithFixes.length} (total ${filesWithFixes.reduce((s, x) => s + x.fixes, 0)} fixes)`)
  out.push(`- Files with skipped items (need user review): ${filesWithSkips.length} (total ${filesWithSkips.reduce((s, x) => s + x.skips, 0)} skipped)`)
  out.push(`- Clean files (no fixes, no skips): ${cleanFiles.length}\n`)

  if (filesWithSkips.length > 0) {
    out.push(`## ⚠️ Items needing user review\n`)
    for (const s of filesWithSkips) {
      out.push(`- [${s.file}](./runs/${runDate}/${s.file}) — ${s.skips} skipped item${s.skips > 1 ? 's' : ''}`)
    }
    out.push('')
  }

  if (filesWithFixes.length > 0) {
    out.push(`## Files with fixes applied\n`)
    for (const f of filesWithFixes) {
      out.push(`- [${f.file}](./runs/${runDate}/${f.file}) — ${f.fixes} fix${f.fixes > 1 ? 'es' : ''}`)
    }
    out.push('')
  }

  if (cleanFiles.length > 0) {
    out.push(`## Clean files\n`)
    for (const f of cleanFiles) {
      out.push(`- ${f}`)
    }
    out.push('')
  }

  const summaryPath = path.join(REPO_ROOT, `docs/audits/${runDate}-audit-summary.md`)
  fs.writeFileSync(summaryPath, out.join('\n'))
  return summaryPath
}

// ---------- CLI ----------

function main() {
  const args = Object.fromEntries(
    process.argv.slice(2).map(a => {
      const m = a.match(/^--([^=]+)(?:=(.*))?$/)
      return m ? [m[1], m[2] ?? true] : [a, true]
    }),
  )

  if (args.list) {
    const units = listAuditUnits(args.scope || 'all')
    console.log(JSON.stringify(units, null, 2))
    console.log(`\nTotal units: ${units.length}`)
    return
  }

  if (args['build-prompt']) {
    const runDate = args.date || new Date().toISOString().slice(0, 10)
    const id = args['build-prompt']
    const unit = listAuditUnits('all').find(u => u.id === id || u.id.endsWith(id))
    if (!unit) {
      console.error(`No audit unit found for id: ${id}`)
      process.exit(1)
    }
    console.log(buildPrompt(unit, runDate))
    return
  }

  if (args.aggregate) {
    const runDate = args.aggregate === true ? new Date().toISOString().slice(0, 10) : args.aggregate
    const reports = loadReports(runDate)
    if (reports.length === 0) {
      console.error(`No reports found for run date ${runDate}`)
      process.exit(1)
    }
    const out = writeSummary(reports, runDate)
    console.log(`Summary written: ${out}`)
    console.log(`Reports aggregated: ${reports.length}`)
    return
  }

  console.error(`Usage:
  node scripts/audit-content.mjs --list [--scope=all|lessons|foundations|stories|knm|lezen|vocab]
  node scripts/audit-content.mjs --build-prompt=<unit-id> [--date=YYYY-MM-DD]
  node scripts/audit-content.mjs --aggregate=YYYY-MM-DD`)
  process.exit(1)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
