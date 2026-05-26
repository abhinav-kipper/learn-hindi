#!/usr/bin/env node
// scripts/lint-design-strict.mjs
// AST-based allow-list lint. Slower than the block-list. Runs nightly.
// Emits a JSON report at e2e/design-lint-report.json.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';

// @babel/traverse default-export interop
const traverse = _traverse.default ?? _traverse;

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Property names we check
const COLOR_PROPS = new Set(['color', 'backgroundColor', 'background', 'borderColor', 'fill', 'stroke']);
const SHADOW_PROPS = new Set(['boxShadow']);
const BORDER_PROPS = new Set(['border', 'borderTop', 'borderBottom', 'borderLeft', 'borderRight']);
const RADIUS_PROPS = new Set(['borderRadius']);
const FONT_PROPS = new Set(['fontFamily']);

// Literal values always allowed
const COLOR_LITERAL_ALLOWLIST = new Set(['transparent', 'inherit', 'currentColor', 'none', '#fff', '#ffffff', '#000', '#000000']);

function checkProperty(propName, value, file, line, hits) {
  if (typeof value !== 'string') return;

  if (COLOR_PROPS.has(propName)) {
    if (COLOR_LITERAL_ALLOWLIST.has(value.toLowerCase())) return;
    if (/^#[0-9a-fA-F]{3,8}$/.test(value)) {
      hits.push({ file, line, rule: 'strict-color', prop: propName, value });
    }
  }

  if (SHADOW_PROPS.has(propName)) {
    if (value === 'none') return;
    hits.push({ file, line, rule: 'strict-shadow', prop: propName, value });
  }

  if (BORDER_PROPS.has(propName)) {
    if (value === 'none' || value === '0') return;
    hits.push({ file, line, rule: 'strict-border', prop: propName, value });
  }

  if (RADIUS_PROPS.has(propName)) {
    const TOKEN_RADII = new Set(['14', '18', '22', '36', '99']);
    if (TOKEN_RADII.has(value)) return;
    hits.push({ file, line, rule: 'strict-radius', prop: propName, value });
  }

  if (FONT_PROPS.has(propName)) {
    if (value.includes('var(--font-')) return;
    hits.push({ file, line, rule: 'strict-font', prop: propName, value });
  }
}

function lintFile(file) {
  const abs = resolve(ROOT, file);
  const source = readFileSync(abs, 'utf8');
  const hits = [];

  let ast;
  try {
    ast = parse(source, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      errorRecovery: true,
    });
  } catch (e) {
    hits.push({ file, line: 1, rule: 'parse-error', prop: '', value: String(e).slice(0, 100) });
    return hits;
  }

  traverse(ast, {
    ObjectProperty(path) {
      const { node } = path;
      const name =
        node.key.type === 'Identifier' ? node.key.name :
        node.key.type === 'StringLiteral' ? node.key.value :
        null;
      if (!name) return;

      if (node.value.type === 'StringLiteral') {
        checkProperty(name, node.value.value, file, node.loc?.start.line ?? 0, hits);
      } else if (node.value.type === 'TemplateLiteral' && node.value.expressions.length === 0) {
        checkProperty(name, node.value.quasis[0].value.cooked, file, node.loc?.start.line ?? 0, hits);
      }
    },
  });

  return hits;
}

function listFiles() {
  const out = execSync('git ls-files app components', { cwd: ROOT }).toString();
  return out
    .split('\n')
    .filter((f) => /\.(ts|tsx)$/.test(f))
    .filter((f) => !f.startsWith('__tests__/'))
    .filter((f) => !f.endsWith('components/design/tokens.ts'));
}

function main() {
  const files = listFiles();
  const allHits = [];
  for (const file of files) {
    const hits = lintFile(file);
    allHits.push(...hits);
  }

  // Strip @design-allow lines
  const finalHits = allHits.filter((h) => {
    const abs = resolve(ROOT, h.file);
    const lines = readFileSync(abs, 'utf8').split('\n');
    return !(lines[h.line - 1] ?? '').includes('@design-allow');
  });

  const outDir = join(ROOT, 'e2e');
  mkdirSync(outDir, { recursive: true });
  const reportPath = join(outDir, 'design-lint-report.json');
  writeFileSync(reportPath, JSON.stringify({ generatedAt: new Date().toISOString(), hits: finalHits }, null, 2));

  console.log(`lint-design-strict: ${finalHits.length} violation(s) across ${files.length} files`);
  console.log(`Report: ${reportPath}`);

  if (process.argv.includes('--fail') && finalHits.length > 0) {
    process.exit(1);
  }
}

main();
