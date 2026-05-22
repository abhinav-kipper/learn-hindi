import { getProgress } from '@/lib/progress'

const NOTIFICATION_PREF_KEY = 'hindi-notification-pref'
const lastShownKey = (prefix: string) => `${prefix}-last-notification-shown`

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
      return true
    }
    return false
  } catch {
    return false
  }
}

/**
 * Check on every app open / tab focus whether a reminder should fire.
 * Conditions: permission granted, not yet practiced today, past 10am local time,
 * and we haven't already shown a notification today.
 *
 * This is more reliable than scheduling via setTimeout in a service worker,
 * because SWs are killed by the browser when idle and lose their timers.
 */
export function maybeShowReminderOnOpen(storagePrefix: string): void {
  if (typeof window === 'undefined') return
  if (Notification.permission !== 'granted') return
  if (getNotificationPreference() !== 'enabled') return

  const todayUtc = new Date().toISOString().split('T')[0]

  // Don't double-notify on the same day
  if (localStorage.getItem(lastShownKey(storagePrefix)) === todayUtc) return

  // User already practiced today — no reminder needed
  const progress = getProgress(storagePrefix)
  if (progress.lastActiveDate === todayUtc) return

  // Only remind after 10am local time so we're not annoying at 6am
  if (new Date().getHours() < 10) return

  const isHindi = storagePrefix === 'hindi'
  const body = isHindi
    ? "You haven't practiced Hindi yet today. Keep your streak alive!"
    : 'Je hebt vandaag nog geen Nederlands geoefend. Houd je reeks gaande!'

  localStorage.setItem(lastShownKey(storagePrefix), todayUtc)

  new Notification('Bolna Seekho 🙏', {
    body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: 'daily-reminder',
  })
}

export function shouldShowNotificationPrompt(): boolean {
  if (!isNotificationSupported()) return false
  if (getNotificationPreference() !== 'unset') return false
  return true
}
