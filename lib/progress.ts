export interface Progress {
  completedLessons: string[]
  lessonCompletedAt: Record<string, string>  // lessonId → ISO date
  currentStreak: number
  lastActiveDate: string
  practiceSessionCount: number
  todaySessions: number
  todaySessionsDate: string
  seenStreakMilestones: number[]
}

function storageKey(prefix: string): string {
  return `${prefix}-progress`
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function defaultProgress(): Progress {
  return {
    completedLessons: [],
    lessonCompletedAt: {},
    currentStreak: 0,
    lastActiveDate: '',
    practiceSessionCount: 0,
    todaySessions: 0,
    todaySessionsDate: '',
    seenStreakMilestones: [],
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
  }
  if (!progress.lessonCompletedAt) progress.lessonCompletedAt = {}
  progress.lessonCompletedAt[lessonId] = todayISO()
  saveProgress(progress, prefix)
}

export function getLessonCompletedAt(lessonId: string, prefix = 'hindi'): string | null {
  const p = getProgress(prefix)
  return (p.lessonCompletedAt ?? {})[lessonId] ?? null
}

export function getSeenStreakMilestones(prefix = 'hindi'): number[] {
  return getProgress(prefix).seenStreakMilestones ?? []
}

export function markStreakMilestoneSeen(milestone: number, prefix = 'hindi'): void {
  const progress = getProgress(prefix)
  if (!progress.seenStreakMilestones) progress.seenStreakMilestones = []
  if (!progress.seenStreakMilestones.includes(milestone)) {
    progress.seenStreakMilestones.push(milestone)
    saveProgress(progress, prefix)
  }
}

export function isLessonComplete(lessonId: string, prefix = 'hindi'): boolean {
  return getProgress(prefix).completedLessons.includes(lessonId)
}

export function incrementPracticeCount(prefix = 'hindi'): void {
  const progress = getProgress(prefix)
  const today = todayISO()
  progress.practiceSessionCount += 1
  if (progress.todaySessionsDate !== today) {
    progress.todaySessions = 1
    progress.todaySessionsDate = today
  } else {
    progress.todaySessions += 1
  }
  saveProgress(progress, prefix)
}

/** Today's practice sessions, auto-zeroed if the stored date is stale. */
export function getTodaySessions(prefix = 'hindi'): number {
  const progress = getProgress(prefix)
  if (progress.todaySessionsDate !== todayISO()) return 0
  return progress.todaySessions
}

export function updateStreak(prefix = 'hindi'): void {
  const progress = getProgress(prefix)
  const today = todayISO()

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
