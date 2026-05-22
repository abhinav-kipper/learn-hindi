// Service Worker for Bolna Seekho - Hindi Learning App
// Handles the notification click action and any future server-side push events.
// Daily reminders are fired directly from the page via the Notification API
// (more reliable than SW setTimeout, which is killed when the SW goes idle).

// Install / activate — take control immediately
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

// Push event — placeholder for future server-side push support
self.addEventListener('push', (event) => {
  const body = event.data?.text() ?? 'Time to practice! Keep your streak alive.'
  event.waitUntil(
    self.registration.showNotification('Bolna Seekho 🙏', {
      body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: 'daily-reminder',
      renotify: true,
      actions: [
        { action: 'open', title: 'Start Learning' },
        { action: 'dismiss', title: 'Later' },
      ],
    })
  )
})

// Notification click — focus the app or open a new window
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      return self.clients.openWindow('/')
    })
  )
})
