export interface Progress {
  completedLessons: string[]
  currentStreak: number
  lastActiveDate: string
  practiceSessionCount: number
}

function storageKey(prefix: string): string {
  return `${prefix}-progress`
}

function defaultProgress(): Progress {
  return {
    completedLessons: [],
    currentStreak: 0,
    lastActiveDate: '',
    practiceSessionCount: 0,
  }
}

export function getProgress(prefix = 'hindi'): Progress {
  if (typeof window === 'undefined') return defaultProgress()
  const stored = localStorage.getItem(storageKey(prefix))
  if (!stored) return defaultProgress()
  try {
    return JSON.parse(stored) as Progress
  } catch {
    return defaultProgress()
  }
}

function saveProgress(progress: Progress, prefix: string): void {
  localStorage.setItem(storageKey(prefix), JSON.stringify(progress))
}

export function markLessonComplete(lessonId: string, prefix = 'hindi'): void {
  const progress = getProgress(prefix)
  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId)
    saveProgress(progress, prefix)
  }
}

export function isLessonComplete(lessonId: string, prefix = 'hindi'): boolean {
  return getProgress(prefix).completedLessons.includes(lessonId)
}

export function incrementPracticeCount(prefix = 'hindi'): void {
  const progress = getProgress(prefix)
  progress.practiceSessionCount += 1
  saveProgress(progress, prefix)
}

export function updateStreak(prefix = 'hindi'): void {
  const progress = getProgress(prefix)
  const today = new Date().toISOString().split('T')[0]

  if (progress.lastActiveDate === today) return

  if (progress.lastActiveDate) {
    const lastActive = new Date(progress.lastActiveDate)
    const now = new Date(today)
    const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      progress.currentStreak += 1
    } else {
      progress.currentStreak = 1
    }
  } else {
    progress.currentStreak = 1
  }

  progress.lastActiveDate = today
  saveProgress(progress, prefix)
}

export function getStreak(prefix = 'hindi'): number {
  return getProgress(prefix).currentStreak
}
