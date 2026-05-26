/**
 * Moment registry — every Chaina appearance the app can trigger.
 * Pure data + a small line picker. No React.
 *
 * Voice strategy:
 *   - voice: true   → on play, MomentStage calls chainaVoice.play(key, idx, line.speak).
 *                     chainaVoice tries /chaina/<key>-<idx>.mp3 first, falls back to
 *                     window.speechSynthesis with the speak string.
 *   - voice: false  → silent moment (idleNudge, phraseStreak, favoriteSaved,
 *                     conjugationCorrect, drillGotIt) — don't startle / interrupt.
 */

import type { CuttingMood } from './Cutting';

export type MomentAnchor =
  | 'center'
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-edge'
  | 'inline-right'
  | 'inplace'
  | 'walk';

export type BubbleTail = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
export type BubbleSide = 'left' | 'right';

export interface Line {
  main: string;
  caption?: string;
  speak: string;
}

export interface Moment {
  label: string;
  when: string;
  anchor: MomentAnchor;
  enter: string;
  enterMs: number;
  holdMs: number;
  exit: string;
  exitMs: number;
  mood: CuttingMood;
  moodAnim?: string;
  bubbleTail: BubbleTail;
  bubbleSide: BubbleSide;
  voice: boolean;
  lines: Line[];
  sizePct: number;
}

const LINES: Record<string, Line[]> = {
  firstEver: [
    { main: 'Hi, I’m Chaina!', caption: 'your chai-buddy', speak: 'Hi, I am Chaina, your chai buddy.' },
  ],
  welcomeBack: [
    { main: 'arrey! kahan the?', caption: 'missed you, dost', speak: 'Arrey, kahan the? Missed you, dost.' },
    { main: 'chai’s getting cold!', caption: 'kab aaoge?', speak: 'Chai is getting cold. Kab aaoge?' },
    { main: 'hey, missed you', caption: 'wapas aa gaye', speak: 'Hey, missed you.' },
  ],
  firstOpenToday: [
    { main: 'namaste, dost ☸', speak: 'Namaste, dost.' },
    { main: 'shubh prabhat!', caption: 'chalo, shuru karein?', speak: 'Shubh prabhat. Chalo, shuru karein?' },
    { main: 'aaj kya seekhenge?', speak: 'Aaj kya seekhenge?' },
  ],
  phraseStreak: [
    { main: 'shabash!', speak: 'Shabash!' },
    { main: 'wah! kya baat', caption: 'on fire', speak: 'Wah, kya baat!' },
    { main: 'ekdum sahi', caption: 'keep going', speak: 'Ekdum sahi.' },
  ],
  correctAnswer: [
    { main: 'bilkul sahi!', speak: 'Bilkul sahi!' },
    { main: 'ekdum perfect', speak: 'Ekdum perfect.' },
    { main: 'kya baat hai', caption: 'aisi hi chalo', speak: 'Kya baat hai!' },
  ],
  wrongAnswer: [
    { main: 'koi baat nahin', caption: 'we’ll get it', speak: 'Koi baat nahin.' },
    { main: 'arrey, almost!', caption: 'thoda aur try karo', speak: 'Arrey, almost! Thoda aur try karo.' },
    { main: 'no worries, dost', speak: 'No worries, dost.' },
  ],
  lessonComplete: [
    { main: 'wah! shabash ✨', caption: 'chapter done!', speak: 'Wah, shabash! Chapter done.' },
    { main: 'kya baat hai!', caption: 'aage badho', speak: 'Kya baat hai. Aage badho.' },
  ],
  streakMilestone: [
    { main: '🔥 streak!', caption: 'mehnat rang laayi', speak: 'Streak! Mehnat rang laayi.' },
    { main: 'streak strong, dost', caption: 'aise hi chalte raho', speak: 'Streak strong, dost. Aise hi chalte raho.' },
  ],
  idleNudge: [
    { main: 'kya soch rahe ho?', caption: 'chalo, ek aur phrase', speak: 'Kya soch rahe ho?' },
    { main: 'thoda focus, dost', speak: 'Thoda focus, dost.' },
    { main: 'main yahaan hoon', caption: 'whenever you’re ready', speak: 'Main yahan hoon.' },
  ],
  firstMistake: [
    { main: 'saved for later', caption: 'drill karenge baad mein', speak: 'Saved for later. Drill karenge baad mein.' },
  ],
  sessionEnd: [
    { main: 'phir milte hain!', caption: 'kal milte hain', speak: 'Phir milte hain!' },
    { main: 'tata, dost ✌', caption: 'don’t forget tomorrow', speak: 'Tata, dost.' },
  ],
  tap: [
    { main: 'haan? kya hua', speak: 'Haan, kya hua?' },
    { main: 'oye!', speak: 'Oye!' },
    { main: 'chai garam hai ☕', speak: 'Chai garam hai.' },
    { main: 'bolo, dost', speak: 'Bolo, dost.' },
    { main: 'I’m Chaina!', caption: 'nice to meet you', speak: 'I am Chaina. Nice to meet you.' },
  ],
  favoriteSaved: [
    { main: 'saved ⭐', caption: 'yaad rahega', speak: 'Saved.' },
    { main: 'star added', speak: 'Star added.' },
  ],
  conjugationCorrect: [
    { main: 'sahi!', speak: 'Sahi.' },
    { main: 'ekdum theek', speak: 'Ekdum theek.' },
  ],
  drillGotIt: [
    { main: 'got it!', speak: 'Got it.' },
    { main: 'pakka', caption: 'yaad rahega', speak: 'Pakka.' },
  ],
  newContent: [
    { main: 'arrey! naye lessons aaye hain', caption: 'try karke dekho ✨', speak: 'Arrey, naye lessons aaye hain. Try karke dekho.' },
    { main: 'kuch naya hai!',                  caption: 'check karo 👋',     speak: 'Kuch naya hai. Check karo.' },
    { main: 'naya content unlocked',           caption: 'mazaa aayega',     speak: 'Naya content unlocked. Mazaa aayega.' },
  ],
  knmAttemptComplete: [
    { main: 'goed bezig!',  caption: 'oefenen blijft loon',  speak: 'Goed bezig! Oefenen blijft loon.' },
    { main: 'niet slecht',  caption: 'volgende keer beter',  speak: 'Niet slecht. Volgende keer beter.' },
  ],
  knmPassed: [
    { main: 'Geslaagd! 🎉', caption: 'goed gedaan!',         speak: 'Geslaagd! Goed gedaan!' },
    { main: 'top!',          caption: 'examen-klaar',         speak: 'Top! Examen klaar.' },
  ],
  a2Milestone: [
    { main: 'A2 bereikt!',   caption: 'door naar B1, of examen?', speak: 'A2 bereikt! Door naar B1, of examen?' },
  ],
  lezenStudyDone: [
    { main: 'tekst gelezen!', caption: 'doorgaan',     speak: 'Tekst gelezen! Doorgaan.' },
    { main: 'mooi gedaan',     caption: 'nog een tekst', speak: 'Mooi gedaan. Nog een tekst.' },
  ],
  lezenMockPassed: [
    { main: 'lezen geslaagd!',  caption: 'lekker bezig',   speak: 'Lezen geslaagd! Lekker bezig.' },
    { main: 'top, Lezen pass!', caption: 'B1 dichterbij',  speak: 'Top, Lezen pass. B1 dichterbij.' },
  ],
};

export const MOMENTS: Record<string, Moment> = {
  firstEver: {
    label: 'First ever launch',
    when: 'Brand-new install',
    anchor: 'center',
    enter: 'bubble-pop', enterMs: 700, holdMs: 3200, exit: 'dismiss-down', exitMs: 600,
    mood: 'wave', moodAnim: 'wave-tilt 1.2s ease-in-out 2',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.firstEver, sizePct: 0.45,
  },
  welcomeBack: {
    label: 'Welcome back', when: '≥24h since last session',
    anchor: 'bottom-right',
    enter: 'peek-up-right', enterMs: 700, holdMs: 3400, exit: 'dismiss-down', exitMs: 600,
    mood: 'wave', moodAnim: 'wave-tilt 1.2s ease-in-out 2',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.welcomeBack, sizePct: 0.34,
  },
  firstOpenToday: {
    label: 'First open today', when: 'Same calendar day',
    anchor: 'bottom-right',
    enter: 'peek-up-right', enterMs: 600, holdMs: 1800, exit: 'dismiss-down', exitMs: 500,
    mood: 'idle', moodAnim: 'float-y 2.6s ease-in-out infinite',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.firstOpenToday, sizePct: 0.30,
  },
  phraseStreak: {
    label: 'Phrase streak', when: '3 consecutive phrase reveals',
    anchor: 'inline-right',
    enter: 'peek-up-right', enterMs: 500, holdMs: 1400, exit: 'dismiss-down', exitMs: 400,
    mood: 'happy', moodAnim: 'happy-hop 1.4s ease-in-out 1',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: false, lines: LINES.phraseStreak, sizePct: 0.24,
  },
  correctAnswer: {
    label: 'Quiz correct', when: 'User picks correct quiz option',
    anchor: 'top-right',
    enter: 'peek-down', enterMs: 500, holdMs: 1500, exit: 'dismiss-down', exitMs: 400,
    mood: 'happy', moodAnim: 'happy-hop 1.4s ease-in-out 1',
    bubbleTail: 'top-right', bubbleSide: 'left',
    voice: true, lines: LINES.correctAnswer, sizePct: 0.26,
  },
  wrongAnswer: {
    label: 'Quiz wrong', when: 'User picks wrong quiz option',
    anchor: 'top-right',
    enter: 'peek-down', enterMs: 500, holdMs: 2000, exit: 'dismiss-down', exitMs: 400,
    mood: 'sympathy', moodAnim: 'sympathy-nod 1.6s ease-in-out 1',
    bubbleTail: 'top-right', bubbleSide: 'left',
    voice: true, lines: LINES.wrongAnswer, sizePct: 0.26,
  },
  lessonComplete: {
    label: 'Lesson complete', when: 'User taps "mark chapter complete"',
    anchor: 'center',
    enter: 'bubble-pop', enterMs: 600, holdMs: 2200, exit: 'dismiss-down', exitMs: 600,
    mood: 'excited', moodAnim: 'happy-hop 1.4s ease-in-out infinite',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.lessonComplete, sizePct: 0.55,
  },
  streakMilestone: {
    label: 'Streak milestone', when: 'Streak crosses 7/14/30/50/100',
    anchor: 'walk',
    // walk-across is self-terminating; total duration is enterMs alone.
    enter: 'walk-across', enterMs: 4200, holdMs: 0, exit: 'walk-across', exitMs: 0,
    mood: 'excited', moodAnim: 'wobble-z 1.0s ease-in-out infinite',
    bubbleTail: 'bottom-left', bubbleSide: 'right',
    voice: true, lines: LINES.streakMilestone, sizePct: 0.32,
  },
  idleNudge: {
    label: 'Idle nudge', when: '25s no input on lesson/practice',
    anchor: 'bottom-edge',
    enter: 'idle-peek', enterMs: 800, holdMs: 2800, exit: 'dismiss-down', exitMs: 500,
    mood: 'sleepy', moodAnim: 'float-y 3s ease-in-out infinite',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: false, lines: LINES.idleNudge, sizePct: 0.32,
  },
  firstMistake: {
    label: 'First mistake of day', when: 'First [[CORRECTION]] today',
    anchor: 'bottom-right',
    enter: 'peek-up-right', enterMs: 600, holdMs: 2000, exit: 'dismiss-down', exitMs: 500,
    mood: 'wink', moodAnim: 'float-y 2.6s ease-in-out infinite',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.firstMistake, sizePct: 0.28,
  },
  sessionEnd: {
    label: 'Session end', when: 'Backgrounded after 5+ min',
    anchor: 'bottom-right',
    enter: 'peek-up-right', enterMs: 600, holdMs: 2200, exit: 'dismiss-down', exitMs: 600,
    mood: 'wave', moodAnim: 'wave-tilt 1.2s ease-in-out 2',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.sessionEnd, sizePct: 0.30,
  },
  tap: {
    label: 'Tap on Chaina', when: 'User pokes a persistent Chaina',
    anchor: 'inplace',
    enter: 'poke-wobble', enterMs: 700, holdMs: 1300, exit: 'bubble-fade', exitMs: 300,
    mood: 'happy', moodAnim: 'poke-wobble 0.7s ease-in-out 1',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.tap, sizePct: 0.24,
  },
  favoriteSaved: {
    label: 'Favorite saved', when: 'User stars a phrase',
    anchor: 'bottom-right',
    enter: 'peek-up-right', enterMs: 500, holdMs: 1400, exit: 'dismiss-down', exitMs: 400,
    mood: 'wink', moodAnim: 'float-y 2.6s ease-in-out infinite',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: false, lines: LINES.favoriteSaved, sizePct: 0.24,
  },
  conjugationCorrect: {
    label: 'Conjugation drill correct', when: 'Correct conjugation pick',
    anchor: 'top-right',
    enter: 'peek-down', enterMs: 500, holdMs: 1400, exit: 'dismiss-down', exitMs: 400,
    mood: 'happy', moodAnim: 'happy-hop 1.4s ease-in-out 1',
    bubbleTail: 'top-right', bubbleSide: 'left',
    voice: false, lines: LINES.conjugationCorrect, sizePct: 0.24,
  },
  drillGotIt: {
    label: 'Mistakes drill got it', when: 'User taps "got it" in drill',
    anchor: 'inline-right',
    enter: 'peek-up-right', enterMs: 500, holdMs: 1400, exit: 'dismiss-down', exitMs: 400,
    mood: 'happy', moodAnim: 'happy-hop 1.4s ease-in-out 1',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: false, lines: LINES.drillGotIt, sizePct: 0.24,
  },
  newContent: {
    label: 'New content available',
    when: 'New lessons added since last detection',
    anchor: 'bottom-right',
    enter: 'peek-up-right', enterMs: 700, holdMs: 3400, exit: 'dismiss-down', exitMs: 600,
    mood: 'wave', moodAnim: 'wave-tilt 1.2s ease-in-out 2',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.newContent, sizePct: 0.34,
  },
  knmAttemptComplete: {
    label: 'KNM attempt complete (under pass threshold)',
    when: 'KNM drill finishes with score <80%',
    anchor: 'bottom-right',
    enter: 'peek-up-right', enterMs: 700, holdMs: 3400, exit: 'dismiss-down', exitMs: 600,
    mood: 'wave', moodAnim: 'wave-tilt 1.2s ease-in-out 2',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.knmAttemptComplete, sizePct: 0.34,
  },
  knmPassed: {
    label: 'KNM passed (>=80%)',
    when: 'KNM drill finishes with score >=80%',
    anchor: 'center',
    enter: 'bubble-pop', enterMs: 700, holdMs: 3400, exit: 'dismiss-down', exitMs: 600,
    mood: 'happy', moodAnim: 'happy-hop 0.6s ease-in-out 2',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.knmPassed, sizePct: 0.45,
  },
  a2Milestone: {
    label: 'A2 stage complete',
    when: 'A1 completion crosses 100% (Dutch home detection)',
    anchor: 'center',
    enter: 'bubble-pop', enterMs: 700, holdMs: 4200, exit: 'dismiss-down', exitMs: 600,
    mood: 'wave', moodAnim: 'wave-tilt 1.2s ease-in-out 2',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.a2Milestone, sizePct: 0.45,
  },
  lezenStudyDone: {
    label: 'Lezen text studied',
    when: 'User marks a Lezen text as studied',
    anchor: 'bottom-right',
    enter: 'peek-up-right', enterMs: 700, holdMs: 3000, exit: 'dismiss-down', exitMs: 500,
    mood: 'wave', moodAnim: 'wave-tilt 1.2s ease-in-out 2',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.lezenStudyDone, sizePct: 0.32,
  },
  lezenMockPassed: {
    label: 'Lezen mock passed (>=80%)',
    when: 'Lezen timed mock finishes with score >=80%',
    anchor: 'center',
    enter: 'bubble-pop', enterMs: 700, holdMs: 3400, exit: 'dismiss-down', exitMs: 600,
    mood: 'happy', moodAnim: 'happy-hop 0.6s ease-in-out 2',
    bubbleTail: 'bottom-right', bubbleSide: 'left',
    voice: true, lines: LINES.lezenMockPassed, sizePct: 0.45,
  },
};

const _lastLine: Record<string, number> = {};

export function resetPickLineHistory(): void {
  for (const k of Object.keys(_lastLine)) delete _lastLine[k];
}

export function pickLine(momentKey: string): { line: Line; idx: number } {
  const cfg = MOMENTS[momentKey];
  if (!cfg) throw new Error(`Unknown moment: ${momentKey}`);
  const lines = cfg.lines;
  if (lines.length === 1) return { line: lines[0], idx: 0 };
  let i = Math.floor(Math.random() * lines.length);
  if (i === _lastLine[momentKey]) {
    i = (i + 1) % lines.length;
  }
  _lastLine[momentKey] = i;
  return { line: lines[i], idx: i };
}

export type MomentKey = keyof typeof MOMENTS;
