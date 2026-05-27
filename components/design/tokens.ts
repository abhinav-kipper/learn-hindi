// Chai Galli — design tokens. Single source of truth for colors, fonts,
// shadows, borders, and palette → motif/bg mappings used across the redesign.

export const COLORS = {
  ink: '#36281e',
  ink60: '#5b4839',
  ink45: '#8a6a4a',

  cream: '#fff3cf',
  creamBg: '#fbf5e8',

  lav: '#ebe2f6',
  lav2: '#d6c8ec',

  peach: '#ffc9a8',
  peach2: '#ffe1cf',
  orange: '#f0701a',
  orange2: '#ff9b5a',

  pink: '#d63f8b',
  pink2: '#f37bb1',

  mint: '#b8e0c8',
  mint2: '#d6efde',
  teal: '#2f7d7d',
  green: '#3aa66a',

  butter: '#fde9a8',

  rose: '#f6b6c0',
  redBg: '#ffd6d6',
  red: '#e85a5a',
} as const

export const FONTS = {
  display: 'var(--font-bricolage), system-ui, sans-serif',
  body: 'var(--font-nunito), system-ui, sans-serif',
  tag: 'var(--font-mochiy), system-ui, sans-serif',
  script: 'var(--font-caveat), cursive',
} as const

export const RADIUS = {
  pill: 99,
  sheet: 36,
  lg: 22,
  md: 18,
  sm: 14,
} as const

export const SHADOW = {
  sticker: `4px 4px 0 ${COLORS.ink}`,
  stickerPressed: `2px 2px 0 ${COLORS.ink}`,
  stickerSelected: `6px 6px 0 ${COLORS.ink}`,
  chip: `3px 3px 0 ${COLORS.ink}`,
  headerBand: `0 4px 0 ${COLORS.ink}`,
  sheet: `0 -6px 0 ${COLORS.ink}`,
} as const

export const BORDER = {
  sticker: `2.5px solid ${COLORS.ink}`,
  stickerDashed: `2.5px dashed ${COLORS.ink}`,
  thin: `1.8px solid ${COLORS.ink}`,
  hairline: `1px dashed ${COLORS.ink}33`,
} as const

export type Palette = 'mint' | 'peach' | 'butter' | 'lav'

export const paletteToBg = (p: Palette): string =>
  ({ mint: COLORS.mint, peach: COLORS.peach, butter: COLORS.butter, lav: COLORS.lav2 }[p])

export const paletteToMotifBg = (p: Palette): string =>
  ({ mint: COLORS.teal, peach: COLORS.orange, butter: '#d4a44a', lav: '#7a5da8' }[p])

export type MotifKind = 'marigold' | 'auto' | 'chai' | 'film' | 'phone' | 'map'

// Derive a stable palette + motif for a lesson by id. Keeps colors consistent
// across renders without storing them on the JSON content.
export function deriveLessonStyle(id: string, index: number): { palette: Palette; motif: MotifKind } {
  const palettes: Palette[] = ['peach', 'mint', 'butter', 'lav']
  const motifByKeyword: Record<string, MotifKind> = {
    greet: 'marigold',
    auto: 'auto',
    rickshaw: 'auto',
    food: 'chai',
    chai: 'chai',
    order: 'chai',
    opinion: 'film',
    bollywood: 'film',
    plan: 'phone',
    phone: 'phone',
    direction: 'map',
    map: 'map',
    home: 'marigold',
    visit: 'marigold',
  }
  const lowerId = id.toLowerCase()
  let motif: MotifKind = 'marigold'
  for (const [key, m] of Object.entries(motifByKeyword)) {
    if (lowerId.includes(key)) {
      motif = m
      break
    }
  }
  // Fallback motif cycle if no keyword matches
  if (motif === 'marigold' && !lowerId.match(/greet|home|visit/)) {
    const fallback: MotifKind[] = ['marigold', 'auto', 'chai', 'film', 'phone', 'map']
    motif = fallback[index % fallback.length]
  }
  return { palette: palettes[index % palettes.length], motif }
}
