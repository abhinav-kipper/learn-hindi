// scripts/lint-design-core.ts
// Pure functions, no I/O. Imported by lint-design.mjs (the CLI) and by tests.

const FORBIDDEN_IMPORTS = [
  '@mui/',
  '@chakra-ui/',
  'react-bootstrap',
  '@radix-ui/',
  'antd',
  'tailwind-styled-components',
];

const ALLOWED_BORDER_WIDTHS = new Set(['0', 'none', '2.5px', '1.8px', '1px']);

export interface LintHit {
  file: string;
  line: number;
  rule: string;
  snippet: string;
}

export function lintSource(file: string, source: string): LintHit[] {
  const hits: LintHit[] = [];
  const lines = source.split('\n');

  const isTokensFile = file.endsWith('components/design/tokens.ts');

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1;
    const line = lines[i];
    if (line.includes('@design-allow')) continue;

    if (!isTokensFile) {
      const hexMatch = line.match(/#[0-9a-fA-F]{3,8}\b/);
      if (hexMatch) {
        hits.push({ file, line: lineNo, rule: 'raw-hex', snippet: hexMatch[0] });
      }
    }

    const shadowMatch = line.match(/box[Ss]hadow:\s*['"`]\s*(?:-?\d+(?:\.\d+)?(?:px)?)\s+(?:-?\d+(?:\.\d+)?(?:px)?)\s+(\d+(?:\.\d+)?(?:px)?)/);
    if (shadowMatch && parseFloat(shadowMatch[1]) !== 0) {
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
