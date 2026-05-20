export interface Progress {
  completedLessons: string[]
  currentStreak: number
  lastActiveDate: string
  practiceSessionCount: number
}

const STORAGE_KEY = 'hindi-progress'

function defaultProgress(): Progress {
  return {
    completedLessons: [],
    currentStreak: 0,
    lastActiveDate: '',
    practiceSessionCount: 0,
  }
}

export function getProgress(): Progress {
  if (typeof window === 'undefined') return defaultProgress()
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return defaultProgress()
  try {
    return JSON.parse(stored) as Progress
  } catch {
    return defaultProgress()
  }
}

function saveProgress(progress: Progress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function markLessonComplete(lessonId: string): void {
  const progress = getProgress()
  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId)
    saveProgress(progress)
  }
}

export function isLessonComplete(lessonId: string): boolean {
  return getProgress().completedLessons.includes(lessonId)
}

export function incrementPracticeCount(): void {
  const progress = getProgress()
  progress.practiceSessionCount += 1
  saveProgress(progress)
}

export function updateStreak(): void {
  const progress = getProgress()
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
  saveProgress(progress)
}

export function getStreak(): number {
  return getProgress().currentStreak
}
