export interface UserProfile {
  name: string
  reason: string
  dailyGoal: number // minutes
  onboardingComplete: boolean
  tooltipsShown: {
    home: boolean
    lesson: boolean
    practice: boolean
    quiz: boolean
    review: boolean
  }
}

const STORAGE_KEY = 'hindi-user-profile'

function defaultProfile(): UserProfile {
  return {
    name: '',
    reason: '',
    dailyGoal: 5,
    onboardingComplete: false,
    tooltipsShown: {
      home: false,
      lesson: false,
      practice: false,
      quiz: false,
      review: false,
    },
  }
}

export function getUserProfile(): UserProfile {
  if (typeof window === 'undefined') return defaultProfile()
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return defaultProfile()
  try {
    return { ...defaultProfile(), ...JSON.parse(stored) }
  } catch {
    return defaultProfile()
  }
}

export function saveUserProfile(profile: Partial<UserProfile>): void {
  if (typeof window === 'undefined') return
  const current = getUserProfile()
  const updated = { ...current, ...profile }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function isOnboardingComplete(): boolean {
  return getUserProfile().onboardingComplete
}

export function markTooltipShown(page: string): void {
  const profile = getUserProfile()
  const tooltipsShown = { ...profile.tooltipsShown, [page]: true }
  saveUserProfile({ tooltipsShown })
}

export function hasSeenTooltip(page: string): boolean {
  const profile = getUserProfile()
  return (profile.tooltipsShown as Record<string, boolean>)[page] ?? false
}
