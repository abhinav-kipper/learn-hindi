import '@testing-library/jest-dom/vitest'

// jsdom does not implement HTMLMediaElement.play/pause — stub them so
// tests that indirectly trigger chainaVoice don't throw.
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  configurable: true,
  writable: true,
  value: () => Promise.resolve(),
})
Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  writable: true,
  value: () => {},
})
