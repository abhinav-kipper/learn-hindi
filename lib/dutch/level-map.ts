export type Level = 'A1' | 'A2' | 'B1'

export const ALL_LEVELS: Level[] = ['A1', 'A2', 'B1']

const LEVEL_MAP: Record<string, Level> = {
  'supermarket':    'A1',
  'introductions':  'A1',
  'cafe':           'A1',
  'doctor':         'A2',
  'transport':      'A2',
  'numbers':        'A1',
  'pronunciation':  'A1',
  'present-tense':  'A1',
  'de-het':         'A1',
  'word-order':     'A2',
  'past-tense':     'A2',
  'modals':         'A2',
}

export function getLevel(id: string): Level {
  return LEVEL_MAP[id] ?? 'A1'
}

export function getItemsByLevel(level: Level): string[] {
  return Object.entries(LEVEL_MAP)
    .filter(([, lvl]) => lvl === level)
    .map(([id]) => id)
}
