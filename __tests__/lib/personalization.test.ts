import { describe, it, expect } from 'vitest'
import { getReasonInfo, reorderLessonsByReason } from '@/lib/personalization'

const lessons = [
  { id: 'greetings' },
  { id: 'auto-negotiation' },
  { id: 'ordering-food' },
  { id: 'expressing-opinions' },
  { id: 'making-plans' },
  { id: 'giving-directions' },
]

describe('getReasonInfo', () => {
  it('returns info for known reasons', () => {
    const info = getReasonInfo('bollywood')
    expect(info).not.toBeNull()
    expect(info?.emoji).toBe('🎬')
    expect(info?.hindiPriority).toContain('expressing-opinions')
  })

  it('returns null for empty or unknown reasons', () => {
    expect(getReasonInfo('')).toBeNull()
    expect(getReasonInfo('mars')).toBeNull()
  })
})

describe('reorderLessonsByReason', () => {
  it('promotes priority lessons in the configured order', () => {
    const reordered = reorderLessonsByReason(lessons, 'moving')
    // moving prioritizes: auto-negotiation, giving-directions, ordering-food
    expect(reordered.slice(0, 3).map(l => l.id)).toEqual([
      'auto-negotiation',
      'giving-directions',
      'ordering-food',
    ])
  })

  it('preserves the order of non-priority lessons', () => {
    const reordered = reorderLessonsByReason(lessons, 'family')
    // family prioritizes: greetings, making-plans, expressing-opinions
    // remaining order should be: auto-negotiation, ordering-food, giving-directions
    expect(reordered.slice(3).map(l => l.id)).toEqual([
      'auto-negotiation',
      'ordering-food',
      'giving-directions',
    ])
  })

  it('returns lessons unchanged for empty reason', () => {
    expect(reorderLessonsByReason(lessons, '').map(l => l.id)).toEqual(
      lessons.map(l => l.id),
    )
  })

  it('returns lessons unchanged for curious (no priority list)', () => {
    expect(reorderLessonsByReason(lessons, 'curious').map(l => l.id)).toEqual(
      lessons.map(l => l.id),
    )
  })

  it('does not duplicate lessons', () => {
    const reordered = reorderLessonsByReason(lessons, 'bollywood')
    expect(reordered.length).toBe(lessons.length)
    expect(new Set(reordered.map(l => l.id)).size).toBe(lessons.length)
  })
})
