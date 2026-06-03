export type Level = 'A1' | 'A2' | 'B1'

export const ALL_LEVELS: Level[] = ['A1', 'A2', 'B1']

const LEVEL_MAP: Record<string, Level> = {
  // Ground-up conversational starters (A1)
  'dutch-first-words':    'A1',
  'dutch-small-talk':     'A1',
  'dutch-family-home':    'A1',
  'dutch-daily-routine':  'A1',

  // Existing Dutch conversational lessons (ID = JSON `id` field, dutch- prefixed)
  'dutch-supermarket':    'A1',
  'dutch-introductions':  'A1',
  'dutch-cafe':           'A1',
  'dutch-doctor':         'A1',
  'dutch-transport':      'A1',

  // New exam-targeted lessons (A2)
  'dutch-gemeente':         'A2',
  'dutch-housing-problem':  'A2',
  'dutch-bank':             'A2',

  // New exam-targeted lessons (B1)
  'dutch-huisarts-call':   'B1',
  'dutch-job-interview':   'B1',
  'dutch-primary-school':  'B1',

  // Foundations (IDs here are bare — foundation JSONs use raw IDs)
  'pronouns-zijn-hebben': 'A1',
  'numbers':        'A1',
  'pronunciation':  'A1',
  'present-tense':  'A1',
  'questions':      'A1',
  'negation':       'A1',
  'simple-sentences': 'A1',
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
