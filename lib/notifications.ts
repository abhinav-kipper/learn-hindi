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
      fireOneTimeTestNotification()
      return true
    }
    return false
  } catch {
    return false
  }
}

const TEST_NOTIFICATION_FIRED_KEY = 'bolna-test-notification-fired-v3'
const RANDOM_NUDGE_KEY = (prefix: string) => `${prefix}-last-random-nudge`
const RANDOM_NUDGE_COOLDOWN_HOURS = 4
const RANDOM_NUDGE_CHANCE = 0.4

const FUN_TEST_MESSAGES = [
  '🙏 Namaste! Notifications are working — your tutor will nudge you daily.',
  '☕ Chai is steeping. Time to learn some Hindi!',
  "Bahut accha! You're all set up 🌟",
  '🎉 Wah! Notifications wired up. Pakka, you got this.',
  'Yaar, kya scene hai? Ready to practice? 😎',
  '🗣️ Bolna seekho — let\'s bolna some Hindi!',
  'Ek baat sun — a fresh day, a fresh streak 🔥',
  "🌸 Aaja, let's roll. Today's lesson is waiting.",
]

const RANDOM_NUDGE_MESSAGES = [
  '☕ Chai break? Practice one Hindi phrase before you go.',
  '🌟 Aaja, ek mini-lesson — just 2 minutes.',
  '🗣️ Bolna seekho — say one Hindi phrase out loud right now!',
  '🎯 Quick win: knock out one practice session today.',
  "🔥 Don't lose your streak — one phrase keeps it alive.",
  '💡 Tip: try thinking in Hindi for the next 30 seconds.',
  '🌸 Aaja yaar — your tutor misses you.',
  '✨ Wah! Time for a quick Hindi moment.',
  '🚀 Ek baat sun — small daily practice beats marathons.',
  '🙏 Namaste! Ready for a tiny dose of Hindi?',
  '🎉 Kya scene hai? Drop in for one phrase.',
  '🌶️ Spice up your day — learn one cheeky Hindi expression.',
]

/**
 * One-shot fun notification to confirm the system is wired up. Fires at most
 * once per browser (tracked in localStorage). Picks a random message from the
 * pool. No-op if permission isn't granted yet.
 *
 * Uses SW showNotification() instead of new Notification() — required for iOS PWAs.
 */
export function fireOneTimeTestNotification(): void {
  if (typeof window === 'undefined') return
  if (Notification.permission !== 'granted') return
  if (localStorage.getItem(TEST_NOTIFICATION_FIRED_KEY) === 'yes') return
  if (!('serviceWorker' in navigator)) return

  const msg = FUN_TEST_MESSAGES[Math.floor(Math.random() * FUN_TEST_MESSAGES.length)]
  localStorage.setItem(TEST_NOTIFICATION_FIRED_KEY, 'yes')

  navigator.serviceWorker.ready.then((reg) =>
    reg.showNotification('Bolna Seekho 🙏', {
      body: msg,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: 'test-notification',
      renotify: true,
    } as NotificationOptions)
  ).catch(() => {/* silently ignore if SW unavailable */})
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

  if (!('serviceWorker' in navigator)) return

  localStorage.setItem(lastShownKey(storagePrefix), todayUtc)

  // Use SW showNotification() — required for iOS PWAs (new Notification() is unsupported there).
  navigator.serviceWorker.ready.then((reg) =>
    reg.showNotification('Bolna Seekho 🙏', {
      body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: 'daily-reminder',
      renotify: true,
    } as NotificationOptions)
  ).catch(() => {/* silently ignore if SW unavailable */})
}

/**
 * Fire a random encouraging nudge when the user backgrounds the app.
 *
 * Firing on `visibilitychange → hidden` (rather than `→ visible`) gives iOS
 * a chance to actually banner the notification — foregrounded PWAs silently
 * deliver notifications to the list without showing a banner.
 *
 * Throttled to at most once per RANDOM_NUDGE_COOLDOWN_HOURS, and only fires
 * with probability RANDOM_NUDGE_CHANCE so we're not predictable/annoying.
 */
export function maybeFireRandomNudge(storagePrefix: string): void {
  if (typeof window === 'undefined') return
  if (Notification.permission !== 'granted') return
  if (getNotificationPreference() !== 'enabled') return
  if (!('serviceWorker' in navigator)) return

  const lastNudge = localStorage.getItem(RANDOM_NUDGE_KEY(storagePrefix))
  if (lastNudge) {
    const elapsedMs = Date.now() - parseInt(lastNudge, 10)
    if (elapsedMs < RANDOM_NUDGE_COOLDOWN_HOURS * 60 * 60 * 1000) return
  }

  if (Math.random() > RANDOM_NUDGE_CHANCE) return

  const msg = RANDOM_NUDGE_MESSAGES[Math.floor(Math.random() * RANDOM_NUDGE_MESSAGES.length)]
  localStorage.setItem(RANDOM_NUDGE_KEY(storagePrefix), String(Date.now()))

  navigator.serviceWorker.ready.then((reg) =>
    reg.showNotification('Bolna Seekho 🙏', {
      body: msg,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: 'random-nudge',
      renotify: true,
    } as NotificationOptions)
  ).catch(() => {/* silently ignore if SW unavailable */})
}

export function shouldShowNotificationPrompt(): boolean {
  if (!isNotificationSupported()) return false
  if (getNotificationPreference() !== 'unset') return false
  return true
}
