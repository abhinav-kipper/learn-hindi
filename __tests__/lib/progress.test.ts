import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getProgress,
  markLessonComplete,
  isLessonComplete,
  updateStreak,
  getStreak,
} from '@/lib/progress'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

describe('progress', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getProgress', () => {
    it('returns default progress when nothing stored', () => {
      const progress = getProgress()
      expect(progress.completedLessons).toEqual([])
      expect(progress.currentStreak).toBe(0)
      expect(progress.practiceSessionCount).toBe(0)
    })

    it('returns stored progress', () => {
      localStorage.setItem('hindi-progress', JSON.stringify({
        completedLessons: ['greetings'],
        currentStreak: 2,
        lastActiveDate: '2026-05-19',
        practiceSessionCount: 3,
      }))
      const progress = getProgress()
      expect(progress.completedLessons).toEqual(['greetings'])
      expect(progress.currentStreak).toBe(2)
    })
  })

  describe('markLessonComplete', () => {
    it('adds lesson to completed list', () => {
      markLessonComplete('greetings')
      const progress = getProgress()
      expect(progress.completedLessons).toContain('greetings')
    })

    it('does not duplicate lessons', () => {
      markLessonComplete('greetings')
      markLessonComplete('greetings')
      const progress = getProgress()
      expect(progress.completedLessons.filter(l => l === 'greetings')).toHaveLength(1)
    })
  })

  describe('isLessonComplete', () => {
    it('returns false for incomplete lesson', () => {
      expect(isLessonComplete('greetings')).toBe(false)
    })

    it('returns true for completed lesson', () => {
      markLessonComplete('greetings')
      expect(isLessonComplete('greetings')).toBe(true)
    })
  })

  describe('updateStreak', () => {
    it('starts streak at 1 on first use', () => {
      updateStreak()
      expect(getStreak()).toBe(1)
    })

    it('increments streak on consecutive days', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      localStorage.setItem('hindi-progress', JSON.stringify({
        completedLessons: [],
        currentStreak: 3,
        lastActiveDate: yesterday.toISOString().split('T')[0],
        practiceSessionCount: 0,
      }))
      updateStreak()
      expect(getStreak()).toBe(4)
    })

    it('resets streak if more than 1 day gap', () => {
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      localStorage.setItem('hindi-progress', JSON.stringify({
        completedLessons: [],
        currentStreak: 5,
        lastActiveDate: threeDaysAgo.toISOString().split('T')[0],
        practiceSessionCount: 0,
      }))
      updateStreak()
      expect(getStreak()).toBe(1)
    })

    it('does not increment if already active today', () => {
      const today = new Date().toISOString().split('T')[0]
      localStorage.setItem('hindi-progress', JSON.stringify({
        completedLessons: [],
        currentStreak: 3,
        lastActiveDate: today,
        practiceSessionCount: 0,
      }))
      updateStreak()
      expect(getStreak()).toBe(3)
    })
  })
})
