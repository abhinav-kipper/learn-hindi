/**
 * Chaina's voice — prefers pre-recorded MP3 clips, falls back to
 * window.speechSynthesis. SSR-safe (all window/localStorage access guarded).
 *
 * Architecture:
 *   1. Each line in moments.ts has a stable key + idx + speak string.
 *   2. Optionally pre-generate one MP3 per line via ElevenLabs into
 *      /public/chaina/<momentKey>-<idx>.mp3 (script in scripts/).
 *   3. chainaVoice.play(momentKey, idx, fallbackText) tries the MP3 first.
 *      If it 404s (or no MP3s shipped), falls back to speechSynthesis.
 *
 * Mute keys:
 *   bolna-seekho-muted  ← existing global SFX mute (also silences voice)
 *   chaina-voice-muted  ← reserved for future fine-grained toggle
 */

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
  private audio: HTMLAudioElement | null = null;
  private missing = new Set<string>();
  private initialized = false;

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

  play(momentKey: string, idx: number, fallbackText?: string): void {
    this.ensureInit();
    if (typeof window === 'undefined') return;
    if (this.isMutedNow()) return;
    this.stopAudio();
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
    const url = `${this.clipBase}/${momentKey}-${idx}.mp3`;
    if (this.missing.has(url)) {
      if (fallbackText) this.speak(fallbackText);
      return;
    }
    let audio: HTMLAudioElement;
    try {
      audio = new Audio(url);
    } catch {
      this.missing.add(url);
      if (fallbackText) this.speak(fallbackText);
      return;
    }
    audio.volume = 0.95;
    audio.onerror = () => {
      if (this.audio !== audio) return;  // stale handler, ignore
      if (this.missing.has(url)) return; // already handled by .catch()
      this.missing.add(url);
      if (fallbackText) this.speak(fallbackText);
    };
    audio.play().catch(() => {
      if (this.audio !== audio) return;  // stale handler, ignore
      if (this.missing.has(url)) return; // already handled by onerror
      this.missing.add(url);
      if (fallbackText) this.speak(fallbackText);
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
