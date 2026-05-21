/**
 * Mistake collection: surface corrections the tutor gives in practice so the
 * learner can review them later. Mistakes are extracted from a structured
 * tag the system prompts ask the model to emit:
 *
 *   [[CORRECTION: original="X" correct="Y" reason="Z"]]
 *
 * The tag is stripped from the displayed message and the parsed correction
 * is persisted under `{prefix}-mistakes`.
 */

export interface Mistake {
  id: string
  original: string
  correction: string
  reason: string
  lessonId: string
  timestamp: string
}

function storageKey(prefix: string): string {
  return `${prefix}-mistakes`
}

// Tolerant of single or double quotes and a missing `reason=` (only original
// and correct are mandatory). Multiple tags per message are supported.
const TAG_RE = /\[\[CORRECTION:\s*original=["']([^"']+)["']\s+correct=["']([^"']+)["'](?:\s+reason=["']([^"']*)["'])?\s*\]\]/g

export interface ExtractedMistake {
  original: string
  correction: string
  reason: string
}

/**
 * Extract corrections from a message and return the stripped message plus
 * any corrections found. Returns the original message unchanged if no tag
 * is present.
 */
export function extractCorrections(content: string): {
  cleaned: string
  corrections: ExtractedMistake[]
} {
  const corrections: ExtractedMistake[] = []
  TAG_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = TAG_RE.exec(content)) !== null) {
    corrections.push({
      original: match[1].trim(),
      correction: match[2].trim(),
      reason: (match[3] ?? '').trim(),
    })
  }
  const cleaned = content.replace(TAG_RE, '').replace(/\n{3,}/g, '\n\n').trim()
  return { cleaned: cleaned.length > 0 ? cleaned : content, corrections }
}

export function getMistakes(prefix = 'hindi'): Mistake[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(storageKey(prefix))
  if (!stored) return []
  try {
    return JSON.parse(stored) as Mistake[]
  } catch {
    return []
  }
}

function saveMistakes(mistakes: Mistake[], prefix: string): void {
  if (typeof window === 'undefined') return
  // Cap at 200 most-recent so storage doesn't grow unboundedly.
  const trimmed = mistakes.slice(-200)
  localStorage.setItem(storageKey(prefix), JSON.stringify(trimmed))
}

export function addMistake(
  extracted: ExtractedMistake,
  lessonId: string,
  prefix = 'hindi',
): void {
  if (typeof window === 'undefined') return
  if (!extracted.original || !extracted.correction) return
  const mistakes = getMistakes(prefix)
  mistakes.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    original: extracted.original,
    correction: extracted.correction,
    reason: extracted.reason,
    lessonId,
    timestamp: new Date().toISOString(),
  })
  saveMistakes(mistakes, prefix)
}

export function deleteMistake(id: string, prefix = 'hindi'): void {
  const mistakes = getMistakes(prefix)
  saveMistakes(mistakes.filter(m => m.id !== id), prefix)
}

export function clearMistakes(prefix = 'hindi'): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(storageKey(prefix))
}
