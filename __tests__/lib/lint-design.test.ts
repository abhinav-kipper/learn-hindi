import { describe, it, expect } from 'vitest'
import { lintSource } from '@/scripts/lint-design-core'

describe('lintSource (block-list)', () => {
  it('flags raw hex colors outside tokens.ts', () => {
    const hits = lintSource('components/Foo.tsx', "const c = '#abc123'")
    expect(hits.map(h => h.rule)).toContain('raw-hex')
  })

  it('does not flag hex on a @design-allow line', () => {
    const hits = lintSource('components/Foo.tsx', "const c = '#abc123' // @design-allow: brand color")
    expect(hits.map(h => h.rule)).not.toContain('raw-hex')
  })

  it('does not flag hex in tokens.ts itself', () => {
    const hits = lintSource('components/design/tokens.ts', "ink: '#36281e'")
    expect(hits.map(h => h.rule)).not.toContain('raw-hex')
  })

  it('flags soft box-shadow (blur > 0)', () => {
    const hits = lintSource('components/Foo.tsx', "boxShadow: '0 4px 10px rgba(0,0,0,0.1)'")
    expect(hits.map(h => h.rule)).toContain('soft-shadow')
  })

  it('does not flag offset-only shadow (blur = 0)', () => {
    const hits = lintSource('components/Foo.tsx', "boxShadow: '4px 4px 0 #36281e'")
    expect(hits.map(h => h.rule)).not.toContain('soft-shadow')
  })

  it('flags non-standard border width', () => {
    const hits = lintSource('components/Foo.tsx', "border: '3px solid red'")
    expect(hits.map(h => h.rule)).toContain('bad-border')
  })

  it('does not flag 2.5px border', () => {
    const hits = lintSource('components/Foo.tsx', "border: '2.5px solid #36281e'")
    expect(hits.map(h => h.rule)).not.toContain('bad-border')
  })

  it('flags forbidden UI library imports', () => {
    const hits = lintSource('app/page.tsx', "import { Button } from '@mui/material'")
    expect(hits.map(h => h.rule)).toContain('forbidden-import')
  })

  it('does not flag in-repo design imports', () => {
    const hits = lintSource('app/page.tsx', "import { Sticker } from '@/components/design'")
    expect(hits.map(h => h.rule)).not.toContain('forbidden-import')
  })

  it('flags fontFamily without var(--font-*)', () => {
    const hits = lintSource('components/Foo.tsx', "fontFamily: 'Arial'")
    expect(hits.map(h => h.rule)).toContain('bad-font')
  })

  it('does not flag fontFamily using var(--font-*)', () => {
    const hits = lintSource('components/Foo.tsx', "fontFamily: 'var(--font-bricolage)'")
    expect(hits.map(h => h.rule)).not.toContain('bad-font')
  })

  it('returns file + line + rule + snippet for each hit', () => {
    const src = "const a = 1\nconst b = '#abc123'\nconst c = 2"
    const hits = lintSource('components/Foo.tsx', src)
    const hit = hits.find(h => h.rule === 'raw-hex')
    expect(hit).toBeDefined()
    expect(hit!.line).toBe(2)
    expect(hit!.file).toBe('components/Foo.tsx')
  })
})
