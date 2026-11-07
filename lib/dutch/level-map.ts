export type Level = 'A1' | 'A2' | 'B1'

export const ALL_LEVELS: Level[] = ['A1', 'A2', 'B1']

const LEVEL_MAP: Record<string, Level> = {
  // Ground-up conversational starters (A1)
  'dutch-first-words':       'A1',
  'dutch-small-talk':        'A1',
  'dutch-family-home':       'A1',
  'dutch-daily-routine':     'A1',
  'dutch-asking-directions': 'A1',
  'dutch-phone-basics':      'A1',
  'dutch-making-plans':      'A2',

  // Existing Dutch conversational lessons (ID = JSON `id` field, dutch- prefixed)
  'dutch-supermarket':    'A1',
  'dutch-introductions':  'A1',
  'dutch-cafe':           'A1',
  'dutch-doctor':         'A1',
  'dutch-transport':      'A1',
  'dutch-restaurant':     'A2',

  // Exam-targeted lessons (A2)
  'dutch-gemeente':         'A2',
  'dutch-housing-problem':  'A2',
  'dutch-bank':             'A2',

  // Exam-targeted lessons (B1)
  'dutch-huisarts-call':   'B1',
  'dutch-job-interview':   'B1',
  'dutch-primary-school':  'B1',

  // Foundations. Keys MUST be the exact `id` field of the foundation JSON,
  // which is `dutch-` prefixed for every one of them. Bare keys silently never
  // match, so the stage bars count items that can never complete.
  // `__tests__/lib/dutch-content-ids.test.ts` guards this.
  'dutch-pronouns-zijn-hebben': 'A1',
  'dutch-numbers':           'A1',
  'dutch-pronunciation':     'A1',
  'dutch-present-tense':     'A1',
  'dutch-questions':         'A1',
  'dutch-negation':          'A1',
  'dutch-simple-sentences':  'A1',
  'dutch-de-het':            'A1',
  'dutch-word-order':        'A2',
  'dutch-connectors':        'A2',
  'dutch-past-tense':        'A2',
  'dutch-future':            'A2',
  'dutch-modals':            'A2',
  'dutch-comparatives':      'A2',
}

export function getLevel(id: string): Level {
  return LEVEL_MAP[id] ?? 'A1'
}

export function getItemsByLevel(level: Level): string[] {
  return Object.entries(LEVEL_MAP)
    .filter(([, lvl]) => lvl === level)
    .map(([id]) => id)
}
