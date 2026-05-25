/**
 * Frequency-cap helpers for Chaina moments. Keeps moments from spamming.
 *
 * Modes:
 *   once-per-session  → sessionStorage flag, cleared on tab close
 *   once-per-day      → localStorage with toDateString, resets at local midnight
 *   debounce-800ms    → localStorage with timestamp, 800ms minimum gap
 *
 * Usage:
 *   if (canFire('phraseStreak', 'once-per-session')) {
 *     play('phraseStreak')
 *     markFired('phraseStreak', 'once-per-session')
 *   }
 */

export type FreqMode = 'once-per-session' | 'once-per-day' | 'debounce-800ms';

const k = (s: string) => `chaina-freq-${s}`;
const today = () => new Date().toDateString();

export function canFire(key: string, mode: FreqMode): boolean {
  if (typeof window === 'undefined') return false;
  switch (mode) {
    case 'once-per-day': {
      const last = localStorage.getItem(k(key));
      return last !== today();
    }
    case 'debounce-800ms': {
      const last = localStorage.getItem(k(key));
      if (!last) return true;
      return Date.now() - Number(last) > 800;
    }
    case 'once-per-session': {
      return !sessionStorage.getItem(k(key));
    }
  }
}

export function markFired(key: string, mode: FreqMode): void {
  if (typeof window === 'undefined') return;
  switch (mode) {
    case 'once-per-day':
      localStorage.setItem(k(key), today());
      break;
    case 'debounce-800ms':
      localStorage.setItem(k(key), String(Date.now()));
      break;
    case 'once-per-session':
      sessionStorage.setItem(k(key), '1');
      break;
  }
}
