// Service Worker for Bolna Seekho - Hindi Learning App
// Handles push notifications and daily reminders

const CACHE_NAME = 'bolna-seekho-v1'

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: 'Time to practice your Hindi! Keep your streak alive.',
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: 'daily-reminder',
    renotify: true,
    actions: [
      { action: 'open', title: 'Start Learning' },
      { action: 'dismiss', title: 'Later' },
    ],
  }

  event.waitUntil(
    self.registration.showNotification('Bolna Seekho', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') return

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing window if available
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow('/')
    })
  )
})

// Message event - receive messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_REMINDER') {
    const delay = event.data.delay || 24 * 60 * 60 * 1000 // Default 24 hours

    setTimeout(() => {
      self.registration.showNotification('Bolna Seekho', {
        body: 'Your daily Hindi practice is waiting! Keep your streak going.',
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: 'daily-reminder',
        renotify: true,
        actions: [
          { action: 'open', title: 'Start Learning' },
          { action: 'dismiss', title: 'Later' },
        ],
      })
    }, delay)
  }
})
