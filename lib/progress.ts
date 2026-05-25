export interface Progress {
  completedLessons: string[]
  lessonCompletedAt: Record<string, string>  // lessonId → ISO date
  currentStreak: number
  lastActiveDate: string
  practiceSessionCount: number
  todaySessions: number
  todaySessionsDate: string
  seenStreakMilestones: number[]
  /** Total ms the app has been visible/active today. Used by the daily-goal minute meter. */
  todayActiveMs: number
  /** ISO date the todayActiveMs value applies to. Stale dates → counter resets to 0. */
  todayActiveDate: string
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
    todayActiveMs: 0,
    todayActiveDate: '',
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

/**
 * Accrue active-time toward today's daily-goal minute meter. Auto-resets the
 * counter when the stored date rolls over. Caller is the layout-shell tick
 * (every 30s while document.visibilityState === 'visible').
 */
export function addTodayActiveMs(ms: number, prefix = 'hindi'): void {
  if (typeof window === 'undefined' || ms <= 0) return
  const progress = getProgress(prefix)
  const today = todayISO()
  if (progress.todayActiveDate !== today) {
    progress.todayActiveMs = ms
    progress.todayActiveDate = today
  } else {
    progress.todayActiveMs = (progress.todayActiveMs ?? 0) + ms
  }
  saveProgress(progress, prefix)
}

/** Today's active minutes (rounded down). Auto-zeroed across midnight. */
export function getTodayActiveMinutes(prefix = 'hindi'): number {
  const progress = getProgress(prefix)
  if (progress.todayActiveDate !== todayISO()) return 0
  return Math.floor((progress.todayActiveMs ?? 0) / 60_000)
}

export function updateStreak(prefix = 'hindi'): void {
  const progress = getProgress(prefix)
  const today = todayISO()

  if (progress.lastActiveDate === today) return

  if (progress.lastActiveDate) {
    const lastActive = Date.parse(progress.lastActiveDate + 'T00:00:00Z')
    const now = Date.parse(today + 'T00:00:00Z')
    const diffDays = Math.round((now - lastActive) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      progress.currentStreak += 1
    } else {
      progress.currentStreak = 1
      // Streak broken — let milestones celebrate again on the rebuild
      progress.seenStreakMilestones = []
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
