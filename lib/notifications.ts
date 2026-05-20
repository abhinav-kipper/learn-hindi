const NOTIFICATION_PREF_KEY = 'hindi-notification-pref'
const LAST_REMINDER_KEY = 'hindi-last-reminder-scheduled'

export function isNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'Notification' in window && 'serviceWorker' in navigator
}

export function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
}

export function getNotificationPreference(): 'enabled' | 'disabled' | 'unset' {
  if (typeof window === 'undefined') return 'unset'
  const pref = localStorage.getItem(NOTIFICATION_PREF_KEY)
  if (pref === 'enabled') return 'enabled'
  if (pref === 'disabled') return 'disabled'
  return 'unset'
}

export function setNotificationPreference(pref: 'enabled' | 'disabled'): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(NOTIFICATION_PREF_KEY, pref)
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null
  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    return registration
  } catch (error) {
    console.error('Service worker registration failed:', error)
    return null
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false

  try {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      setNotificationPreference('enabled')
      await scheduleLocalReminder()
      return true
    }
    return false
  } catch {
    return false
  }
}

export async function scheduleLocalReminder(): Promise<void> {
  if (typeof window === 'undefined') return
  if (!('serviceWorker' in navigator)) return

  const registration = await navigator.serviceWorker.ready

  // Calculate time until 10am tomorrow
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)
  const delay = tomorrow.getTime() - now.getTime()

  // Send message to service worker to schedule notification
  if (registration.active) {
    registration.active.postMessage({
      type: 'SCHEDULE_REMINDER',
      delay,
    })
    localStorage.setItem(LAST_REMINDER_KEY, new Date().toISOString())
  }
}

export function shouldShowNotificationPrompt(): boolean {
  if (!isNotificationSupported()) return false
  if (getNotificationPreference() !== 'unset') return false
  // Only show in standalone mode for iOS compatibility
  // But also show on desktop browsers
  return true
}
