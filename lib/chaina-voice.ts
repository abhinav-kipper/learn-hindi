/**
 * Chaina's voice — prefers pre-recorded clips, falls back to
 * window.speechSynthesis. SSR-safe (all window/localStorage access guarded).
 *
 * Architecture:
 *   1. Each line in moments.ts has a stable key + idx + speak string.
 *   2. Optionally pre-generate one mp3 per line via scripts/generate-audio.mjs
 *      (ElevenLabs) into:
 *        /public/chaina/<momentKey>-<idx>.mp3      ← Chaina, locale 'hi'
 *        /public/stroopwafel/<momentKey>-<idx>.mp3 ← Mr. Stroopwafel, locale 'nl'
 *   3. chainaVoice.play(momentKey, idx, fallbackText, locale) tries the clip
 *      first. If it 404s (or no clips shipped) it falls back to Google TTS,
 *      then to speechSynthesis.
 *
 * Mute keys:
 *   bolna-seekho-muted  ← existing global SFX mute (also silences voice)
 *   chaina-voice-muted  ← reserved for future fine-grained toggle
 */

/** A ~1-sample silent WAV, used to unlock HTML audio on first user gesture. */
function buildSilentWav(): string {
  if (typeof window === 'undefined' || typeof btoa === 'undefined') return '';
  const sr = 8000, samples = 1;
  const buf = new ArrayBuffer(44 + samples * 2);
  const dv = new DataView(buf);
  const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); dv.setUint32(4, 36 + samples * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
  dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
  dv.setUint32(24, sr, true); dv.setUint32(28, sr * 2, true); dv.setUint16(32, 2, true);
  dv.setUint16(34, 16, true); w(36, 'data'); dv.setUint32(40, samples * 2, true);
  let bin = ''; const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return 'data:audio/wav;base64,' + btoa(bin);
}

/** Number of non-verbal bark clips generated per mascot (bark-0..N-1.mp3). */
const BARK_COUNT = 4;

const PREFERRED_NAMES = [
  'Lekha', 'Veena', 'Rishi', 'Microsoft Heera',
  'Google हिन्दी',
  'Samantha', 'Karen', 'Tessa', 'Google UK English Female',
];

type SpeakOpts = {
  pitch?: number;
  rate?: number;
  volume?: number;
  lang?: string;
  voiceName?: string;
};

class ChainaVoice {
  private voices: SpeechSynthesisVoice[] = [];
  private picked: SpeechSynthesisVoice | null = null;
  private muted = false;
  private clipBase = '/chaina';
  private stroopwafelBase = '/stroopwafel';
  private audio: HTMLAudioElement | null = null;
  private missing = new Set<string>();
  private initialized = false;
  private primed = false;

  /**
   * Unlock HTML audio under the browser autoplay policy. Mascot voices fire
   * from a timer (200ms after the bubble appears) or on mount — i.e. outside a
   * direct user gesture — so iOS Safari / Chrome block `audio.play()` and the
   * voice goes silent. Calling this from the first real user gesture plays a
   * silent clip, granting the document permission for later programmatic plays.
   * Idempotent; only the first call does work.
   */
  prime(): void {
    if (this.primed || typeof window === 'undefined') return;
    this.primed = true;
    try {
      const a = new Audio(buildSilentWav());
      a.volume = 0;
      const p = a.play();
      if (p && typeof p.then === 'function') p.then(() => { try { a.pause(); } catch {} }).catch(() => {});
    } catch {}
  }

  private ensureInit() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;
    if ('speechSynthesis' in window) {
      this.refreshVoices();
      window.speechSynthesis.onvoiceschanged = () => this.refreshVoices();
      setTimeout(() => this.refreshVoices(), 250);
      setTimeout(() => this.refreshVoices(), 1200);
    }
    try {
      this.muted =
        localStorage.getItem('bolna-seekho-muted') === '1' ||
        localStorage.getItem('chaina-voice-muted') === '1';
    } catch {}
  }

  private refreshVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.voices = window.speechSynthesis.getVoices() || [];
    this.picked =
      this.voices.find(v => v.lang && v.lang.toLowerCase().startsWith('hi')) ||
      this.voices.find(v => v.lang === 'en-IN') ||
      PREFERRED_NAMES.map(n => this.voices.find(v => (v.name || '').includes(n))).find(Boolean) ||
      this.voices.find(v => /female|samantha|karen|tessa/i.test(v.name || '')) ||
      null;
  }

  private stopAudio() {
    if (this.audio) {
      try {
        this.audio.onerror = null;
        this.audio.pause();
        this.audio.src = '';
      } catch {}
      this.audio = null;
    }
  }

  private isMutedNow(): boolean {
    if (typeof window === 'undefined') return true;
    try {
      return (
        this.muted ||
        localStorage.getItem('bolna-seekho-muted') === '1' ||
        localStorage.getItem('chaina-voice-muted') === '1'
      );
    } catch {
      return this.muted;
    }
  }

  play(momentKey: string, idx: number, fallbackText?: string, locale: string = 'hi'): void {
    this.ensureInit();
    if (typeof window === 'undefined') return;
    if (this.isMutedNow()) return;
    this.stopAudio();
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
    // Pre-rendered clips: Chaina (hi) under /chaina, Mr. Stroopwafel (nl) under
    // /stroopwafel, both keyed <momentKey>-<idx>.mp3. Any other locale, or a
    // missing clip, falls through to Google TTS.
    const base = locale === 'hi' ? this.clipBase : locale === 'nl' ? this.stroopwafelBase : null;
    if (!base) {
      this.speakGoogle(fallbackText, locale);
      return;
    }
    const url = `${base}/${momentKey}-${idx}.mp3`;
    if (this.missing.has(url)) {
      this.speakGoogle(fallbackText, locale);
      return;
    }
    let audio: HTMLAudioElement;
    try {
      audio = new Audio(url);
    } catch {
      this.missing.add(url);
      this.speakGoogle(fallbackText, locale);
      return;
    }
    audio.volume = 0.95;
    audio.onerror = () => {
      if (this.audio !== audio) return;  // stale handler, ignore
      if (this.missing.has(url)) return; // already handled by .catch()
      this.missing.add(url);
      this.speakGoogle(fallbackText, locale);
    };
    audio.play().catch(() => {
      if (this.audio !== audio) return;  // stale handler, ignore
      if (this.missing.has(url)) return; // already handled by onerror
      this.missing.add(url);
      this.speakGoogle(fallbackText, locale);
    });
    this.audio = audio;
  }

  /**
   * Play a short non-verbal mascot "bark" — a tiny voiced interjection
   * (hmm!, oho!, hè!) that adds personality on light touch points like tapping
   * the mascot. Picks one of BARK_COUNT pre-rendered clips at random:
   *   hi → /chaina/bark-<n>.mp3   nl → /stroopwafel/bark-<n>.mp3
   * Unlike spoken lines there is NO text fallback — barks are wordless, so if
   * no clip is shipped this is simply a silent no-op.
   */
  bark(locale: string = 'hi'): void {
    this.ensureInit();
    if (typeof window === 'undefined') return;
    if (this.isMutedNow()) return;
    const base = locale === 'nl' ? this.stroopwafelBase : this.clipBase;
    const idx = Math.floor(Math.random() * BARK_COUNT);
    const url = `${base}/bark-${idx}.mp3`;
    if (this.missing.has(url)) return;
    this.stopAudio();
    let audio: HTMLAudioElement;
    try {
      audio = new Audio(url);
    } catch {
      this.missing.add(url);
      return;
    }
    audio.volume = 0.85;
    audio.onerror = () => {
      if (this.audio !== audio) return;
      this.missing.add(url);
    };
    audio.play().catch(() => {
      if (this.audio !== audio) return;
      this.missing.add(url);
    });
    this.audio = audio;
  }

  /**
   * Speak via the app's Google Translate TTS proxy (`/api/tts`), the same
   * pipeline lib/speech.ts uses everywhere else. Falls back to the browser
   * speechSynthesis voice only if the proxy is unreachable.
   */
  private speakGoogle(text: string | undefined, locale: string): void {
    if (!text || this.isMutedNow()) return;
    const bcp47 = locale === 'nl' ? 'nl-NL' : 'hi-IN';
    const url = `/api/tts?text=${encodeURIComponent(text.slice(0, 200))}&lang=${locale}`;
    let audio: HTMLAudioElement;
    try {
      audio = new Audio(url);
    } catch {
      this.speak(text, { lang: bcp47 });
      return;
    }
    audio.volume = 0.95;
    audio.onerror = () => {
      if (this.audio !== audio) return;
      this.speak(text, { lang: bcp47 });
    };
    audio.play().catch(() => {
      if (this.audio !== audio) return;
      this.speak(text, { lang: bcp47 });
    });
    this.audio = audio;
  }

  speak(text: string, opts: SpeakOpts = {}): void {
    this.ensureInit();
    if (typeof window === 'undefined') return;
    if (this.isMutedNow() || !text) return;
    if (!('speechSynthesis' in window)) return;
    try { window.speechSynthesis.cancel(); } catch {}
    try {
      // SpeechSynthesisUtterance may be absent in some environments (jsdom).
      // Fall back to a plain object so the speak() call still reaches the API.
      const SsUtterance = typeof SpeechSynthesisUtterance !== 'undefined'
        ? SpeechSynthesisUtterance
        : null;
      const u: SpeechSynthesisUtterance = SsUtterance
        ? new SsUtterance(String(text))
        : ({ text: String(text) } as SpeechSynthesisUtterance);
      u.pitch = opts.pitch ?? 1.7;
      u.rate = opts.rate ?? 0.95;
      u.volume = opts.volume ?? 0.9;
      u.lang = opts.lang ?? (this.picked?.lang) ?? 'en-IN';
      if (opts.voiceName) {
        const named = this.voices.find(v => v.name === opts.voiceName);
        if (named) u.voice = named;
      } else if (this.picked) {
        u.voice = this.picked;
      }
      window.speechSynthesis.speak(u);
    } catch {}
  }

  cancel(): void {
    this.stopAudio();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
  }

  setMuted(b: boolean): void {
    this.muted = !!b;
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('chaina-voice-muted', this.muted ? '1' : '0'); } catch {}
    }
    if (this.muted) this.cancel();
  }

  isMuted(): boolean {
    return this.isMutedNow();
  }

  setClipBase(url: string): void {
    this.clipBase = url.replace(/\/$/, '');
    this.missing.clear();
  }
}

export const chainaVoice = new ChainaVoice();
