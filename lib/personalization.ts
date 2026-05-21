/**
 * Personalization derived from the onboarding `reason` field.
 *
 * Keeps reason → lesson priority + display chip + system-prompt copy
 * in one place so all consumers stay in sync.
 */

import type { Lesson } from '@/types/lesson'

export interface ReasonInfo {
  emoji: string
  label: string
  /** Brief description used in the AI system prompt to give the tutor context. */
  context: string
  /** Hindi lesson IDs to boost to the front of the situations list, in order. */
  hindiPriority: string[]
}

const REASONS: Record<string, ReasonInfo> = {
  family: {
    emoji: '👨‍👩‍👧',
    label: 'For family chats',
    context: 'is learning Hindi to talk with a partner or family who speak Hindi',
    hindiPriority: ['greetings', 'making-plans', 'expressing-opinions'],
  },
  bollywood: {
    emoji: '🎬',
    label: 'Bollywood-curious',
    context: 'is learning Hindi mainly to enjoy Bollywood films and music',
    hindiPriority: ['expressing-opinions', 'making-plans', 'greetings'],
  },
  moving: {
    emoji: '✈️',
    label: 'Moving to India',
    context: 'is preparing to move to India and needs practical day-to-day Hindi',
    hindiPriority: ['auto-negotiation', 'giving-directions', 'ordering-food'],
  },
  curious: {
    emoji: '🤷',
    label: 'Just curious',
    context: 'is exploring Hindi out of personal curiosity, no specific goal',
    hindiPriority: [],
  },
}

export function getReasonInfo(reason: string): ReasonInfo | null {
  if (!reason) return null
  return REASONS[reason] ?? null
}

/**
 * Reorder a list of lessons so the reason's priority IDs come first (in the
 * given order), with the remaining lessons preserved in their original order.
 * If reason has no priority list (or is unknown), returns the lessons unchanged.
 */
export function reorderLessonsByReason<T extends Pick<Lesson, 'id'>>(
  lessons: T[],
  reason: string,
): T[] {
  const info = getReasonInfo(reason)
  if (!info || info.hindiPriority.length === 0) return lessons

  const priorityIndex = new Map<string, number>()
  info.hindiPriority.forEach((id, i) => priorityIndex.set(id, i))

  const promoted: T[] = []
  const rest: T[] = []
  for (const lesson of lessons) {
    if (priorityIndex.has(lesson.id)) promoted.push(lesson)
    else rest.push(lesson)
  }
  promoted.sort((a, b) => (priorityIndex.get(a.id)! - priorityIndex.get(b.id)!))
  return [...promoted, ...rest]
}
