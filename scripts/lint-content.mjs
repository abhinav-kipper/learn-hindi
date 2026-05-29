// Content "copy lint" — a deterministic style gate so all learner-facing content
// stays consistent and non-AI. Runs in CI alongside the design lint.
//
// Scans every string in content/**/*.json for:
//   • em-dashes (—) and spaced en-dashes used as em-dashes  → use commas / periods
//   • arrows in prose (→, ⟶, ➔, ->)                          → use words or slashes
//   • a tight list of high-confidence AI-cliché phrases
//
// These characters/phrases should never appear in our content (romanization uses
// plain hyphens; the UI adds any functional arrows itself), so the checks are
// low-false-positive. Exit 1 on any violation.
//
//   node scripts/lint-content.mjs           # report + fail on violations
//   node scripts/lint-content.mjs --fix     # auto-fix the mechanical ones (—, arrows)

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT = resolve(ROOT, 'content')
const FIX = process.argv.includes('--fix')

// High-confidence AI clichés (word-boundary, case-insensitive). Kept tight to
// avoid flagging the app's legitimately casual voice.
const CLICHES = [
  'delve', 'tapestry', 'treasure trove', 'testament to', 'look no further',
  'unleash', 'supercharge', 'game-changer', 'plethora', 'a myriad',
  'realm of', 'in the world of', 'navigating the world', 'boasts',
  "let's dive in", 'dive right in', 'in conclusion', 'furthermore', 'moreover',
  'needless to say', 'rest assured', 'elevate your', 'unlock the power',
]
const clicheRe = new RegExp(`\\b(${CLICHES.map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'i')

function jsonFiles(dir) {
  const out = []
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) out.push(...jsonFiles(p))
    else if (e.endsWith('.json')) out.push(p)
  }
  return out
}

/** Walk a parsed JSON value, calling fn(stringValue, path) for every string. */
function walk(node, path, fn) {
  if (typeof node === 'string') return fn(node, path)
  if (Array.isArray(node)) return node.forEach((v, i) => walk(v, `${path}[${i}]`, fn))
  if (node && typeof node === 'object') for (const k of Object.keys(node)) walk(node[k], path ? `${path}.${k}` : k, fn)
}

function checkString(s) {
  const issues = []
  if (/—/.test(s)) issues.push('em-dash (—)')
  if (/\s–\s/.test(s)) issues.push('spaced en-dash (–) used as em-dash')
  if (/→|⟶|➔|(^|\s)->(\s|$)/.test(s)) issues.push('arrow (→ / ->)')
  const cm = clicheRe.exec(s)
  if (cm) issues.push(`AI cliché "${cm[1]}"`)
  return issues
}

function fixString(s) {
  return s
    .replace(/\s*—\s*/g, ', ')
    .replace(/\s–\s/g, ', ')
    .replace(/\s*(→|⟶|➔)\s*/g, ' / ')
    .replace(/(^|\s)->(\s|$)/g, '$1 / $2')
    .replace(/,\s*,/g, ',')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

let violations = 0
let fixedFiles = 0
const rel = (p) => p.slice(ROOT.length + 1)

for (const file of jsonFiles(CONTENT)) {
  const raw = readFileSync(file, 'utf8')
  let data
  try { data = JSON.parse(raw) } catch (e) { console.error(`✗ ${rel(file)}: invalid JSON — ${e.message}`); violations++; continue }

  if (FIX) {
    // Only auto-fix the mechanical char issues (em-dash / en-dash / arrows),
    // never clichés (those need a human rewrite).
    let changed = false
    const fixWalk = (node) => {
      if (Array.isArray(node)) return node.map(fixWalk)
      if (node && typeof node === 'object') { for (const k of Object.keys(node)) node[k] = fixWalk(node[k]); return node }
      if (typeof node === 'string' && /[—→⟶➔]|\s–\s|(^|\s)->(\s|$)/.test(node)) {
        const f = fixString(node); if (f !== node) changed = true; return f
      }
      return node
    }
    fixWalk(data)
    if (changed) { writeFileSync(file, JSON.stringify(data, null, 2) + '\n'); fixedFiles++; console.log(`  fixed ${rel(file)}`) }
    continue
  }

  walk(data, '', (s, path) => {
    const issues = checkString(s)
    if (issues.length) {
      violations++
      console.error(`✗ ${rel(file)} → ${path}: ${issues.join('; ')}\n    "${s.slice(0, 90)}${s.length > 90 ? '…' : ''}"`)
    }
  })
}

if (FIX) {
  console.log(`\nlint-content --fix: updated ${fixedFiles} file(s). Re-run without --fix to verify + catch any clichés.`)
  process.exit(0)
}

if (violations) {
  console.error(`\n✗ lint-content: ${violations} issue(s). Use commas/periods (no em-dashes), words/slashes (no arrows), and rewrite clichés. Auto-fix the mechanical ones with: node scripts/lint-content.mjs --fix`)
  process.exit(1)
}
console.log('✓ lint-content: all content clean (no em-dashes, arrows, or clichés).')
