#!/usr/bin/env node
// scripts/lint-design.mjs
// Inlines the same logic as scripts/lint-design-core.ts for direct Node execution
// (avoids needing a TS toolchain at lint time). Keep the two in sync — vitest
// covers the core; this script is the CLI face.

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const FORBIDDEN_IMPORTS = [
  '@mui/',
  '@chakra-ui/',
  'react-bootstrap',
  '@radix-ui/',
  'antd',
  'tailwind-styled-components',
];

const ALLOWED_BORDER_WIDTHS = new Set(['0', 'none', '2.5px', '1.8px', '1px']);

function lintSource(file, source) {
  const hits = [];
  const lines = source.split('\n');
  const isTokensFile = file.endsWith('components/design/tokens.ts');

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1;
    const line = lines[i];
    if (line.includes('@design-allow')) continue;

    if (!isTokensFile) {
      const hexMatch = line.match(/#[0-9a-fA-F]{3,8}\b/);
      if (hexMatch) hits.push({ file, line: lineNo, rule: 'raw-hex', snippet: hexMatch[0] });
    }

    // Match 3-value shadows where each value can be bare 0 or <num>px (negatives ok).
    // 3rd value is blur — must be 0 (parsed) for the shadow to be Chai-Galli-compliant.
    const shadowMatch = line.match(/\bbox-?[sS]hadow:\s*['"`][^'"`]*?(-?\d+(?:\.\d+)?(?:px)?)\s+(-?\d+(?:\.\d+)?(?:px)?)\s+(\d+(?:\.\d+)?)(?:px)?\b/);
    if (shadowMatch && parseFloat(shadowMatch[3]) !== 0) {
      hits.push({ file, line: lineNo, rule: 'soft-shadow', snippet: shadowMatch[0] });
    }

    const borderMatch = line.match(/\bborder(?:Top|Bottom|Left|Right)?:\s*['"`]?(?:(?:0|none|inherit|currentColor)|(\d+(?:\.\d+)?(?:px|em|rem)?))\b/);
    if (borderMatch && borderMatch[1] && !ALLOWED_BORDER_WIDTHS.has(borderMatch[1])) {
      hits.push({ file, line: lineNo, rule: 'bad-border', snippet: borderMatch[0] });
    }

    const importMatch = line.match(/from\s+['"`]([^'"`]+)['"`]/);
    if (importMatch) {
      const src = importMatch[1];
      if (FORBIDDEN_IMPORTS.some((f) => src === f.replace(/\/$/, '') || src.startsWith(f))) {
        hits.push({ file, line: lineNo, rule: 'forbidden-import', snippet: importMatch[0] });
      }
    }

    const fontMatch = line.match(/fontFamily:\s*['"`]([^'"`]+)['"`]/);
    if (fontMatch && !fontMatch[1].includes('var(--font-')) {
      hits.push({ file, line: lineNo, rule: 'bad-font', snippet: fontMatch[0] });
    }
  }

  return hits;
}

function listFiles() {
  const out = execSync('git ls-files app components', { cwd: ROOT }).toString();
  return out
    .split('\n')
    .filter((f) => /\.(ts|tsx)$/.test(f))
    .filter((f) => !f.startsWith('__tests__/'));
}

function main() {
  const files = listFiles();
  const allHits = [];
  for (const rel of files) {
    const abs = resolve(ROOT, rel);
    const src = readFileSync(abs, 'utf8');
    const hits = lintSource(rel, src);
    allHits.push(...hits);
  }

  if (allHits.length === 0) {
    console.log(`✓ lint-design: ${files.length} files clean`);
    process.exit(0);
  }

  console.error(`✗ lint-design: ${allHits.length} violation(s) in ${new Set(allHits.map((h) => h.file)).size} file(s)\n`);
  for (const hit of allHits) {
    console.error(`  ${hit.file}:${hit.line}  ${hit.rule}  ${hit.snippet}`);
  }
  console.error(`\nAllow individual lines via a // @design-allow: <reason> comment on the same line.`);
  process.exit(1);
}

main();
