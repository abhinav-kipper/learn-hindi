/**
 * One-time migration for the Dutch foundation ID rename (2026-11-07).
 *
 * Seven Dutch foundations shipped with bare IDs (`questions`, `negation`, ...)
 * instead of the `dutch-` prefixed form every other Dutch unit uses. One of
 * them, `questions`, collided head-on with the Hindi `questions` foundation:
 * `getUniversalLessonById` checks Hindi first, so opening the Dutch "Asking
 * Questions" chapter rendered the Hindi lesson instead.
 *
 * The JSON IDs are now all `dutch-` prefixed. This remaps any progress a user
 * already recorded under the old bare IDs so nothing is lost. It is idempotent
 * and only ever touches the `dutch` storage prefix.
 */

/** old bare ID → new `dutch-` prefixed ID */
export const DUTCH_ID_RENAMES: Record<string, string> = {
  'pronouns-zijn-hebben': 'dutch-pronouns-zijn-hebben',
  questions: 'dutch-questions',
  negation: 'dutch-negation',
  'simple-sentences': 'dutch-simple-sentences',
  connectors: 'dutch-connectors',
  future: 'dutch-future',
  comparatives: 'dutch-comparatives',
}

const FLAG = 'dutch-foundation-id-migration-v1'

/** Rewrite the keys/members of one stored blob. Returns null when unchanged. */
function remap(raw: string | null): string | null {
  if (!raw) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  let touched = false
  const rename = (id: string): string => {
    const next = DUTCH_ID_RENAMES[id]
    if (next) {
      touched = true
      return next
    }
    return id
  }

  if (Array.isArray(parsed)) {
    // A plain array of IDs (studied sets, read sets).
    const next = parsed.map((v) => (typeof v === 'string' ? rename(v) : v))
    return touched ? JSON.stringify(next) : null
  }

  if (typeof parsed === 'object' && parsed !== null) {
    const obj = parsed as Record<string, unknown>

    // Progress object: an array of IDs plus an ID-keyed timestamp map.
    if (Array.isArray(obj.completedLessons)) {
      obj.completedLessons = (obj.completedLessons as unknown[]).map((v) =>
        typeof v === 'string' ? rename(v) : v
      )
    }
    if (obj.lessonCompletedAt && typeof obj.lessonCompletedAt === 'object') {
      const src = obj.lessonCompletedAt as Record<string, unknown>
      const out: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(src)) out[rename(k)] = v
      obj.lessonCompletedAt = out
    }

    // Otherwise a flat ID-keyed map (phrase progress, scores).
    if (!Array.isArray(obj.completedLessons) && !obj.lessonCompletedAt) {
      const out: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(obj)) out[rename(k)] = v
      return touched ? JSON.stringify(out) : null
    }

    return touched ? JSON.stringify(obj) : null
  }

  return null
}

/**
 * Remap Dutch progress written under the old bare foundation IDs. Safe to call
 * on every mount: it runs once, then short-circuits on a localStorage flag.
 */
export function migrateDutchFoundationIds(): void {
  if (typeof window === 'undefined') return
  try {
    if (localStorage.getItem(FLAG) === '1') return

    const keys = [
      'dutch-progress',
      'dutch-phrase-progress',
      'dutch-quiz-scores',
      'dutch-last-active-lesson',
    ]

    for (const key of keys) {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      // `last-active-lesson` holds a bare ID string, not JSON.
      if (key === 'dutch-last-active-lesson' && !raw.startsWith('{') && !raw.startsWith('[')) {
        const next = DUTCH_ID_RENAMES[raw.replace(/^"|"$/g, '')]
        if (next) localStorage.setItem(key, next)
        continue
      }
      const next = remap(raw)
      if (next !== null) localStorage.setItem(key, next)
    }

    localStorage.setItem(FLAG, '1')
  } catch {
    // localStorage unavailable (private mode, blocked). Nothing to migrate.
  }
}
