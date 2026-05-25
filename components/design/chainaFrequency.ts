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

const k = (s: string, mode: FreqMode) => `chaina-freq-${mode}-${s}`;
const today = () => new Date().toDateString();

export function canFire(key: string, mode: FreqMode): boolean {
  if (typeof window === 'undefined') return false;
  switch (mode) {
    case 'once-per-day': {
      const last = localStorage.getItem(k(key, mode));
      return last !== today();
    }
    case 'debounce-800ms': {
      const last = localStorage.getItem(k(key, mode));
      if (!last) return true;
      const ts = Number(last);
      if (Number.isNaN(ts)) return true; // corrupt value → treat as never fired
      return Date.now() - ts > 800;
    }
    case 'once-per-session': {
      return !sessionStorage.getItem(k(key, mode));
    }
  }
}

export function markFired(key: string, mode: FreqMode): void {
  if (typeof window === 'undefined') return;
  switch (mode) {
    case 'once-per-day':
      localStorage.setItem(k(key, mode), today());
      break;
    case 'debounce-800ms':
      localStorage.setItem(k(key, mode), String(Date.now()));
      break;
    case 'once-per-session':
      sessionStorage.setItem(k(key, mode), '1');
      break;
  }
}
