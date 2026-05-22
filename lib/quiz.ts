import { QuizQuestion, QuizAnswer, QuizType } from '@/types/quiz'
import { getAllContent } from '@/lib/lessons'
import { Phrase } from '@/types/lesson'
import { getExploredVocabWords, VocabWord } from '@/lib/vocabulary'

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function randomId(): string {
  return Math.random().toString(36).substring(2, 10)
}

function pickRandom<T>(arr: T[], count: number, exclude?: T[]): T[] {
  const filtered = exclude ? arr.filter(item => !exclude.includes(item)) : arr
  return shuffle(filtered).slice(0, count)
}

interface PhraseTarget {
  source: 'phrase'
  hindi: string
  english: string
  context: string
  lessonId: string
  phraseIndex: number
}

interface VocabTarget {
  source: 'vocab'
  hindi: string
  english: string
  context: string
  lessonId: string
  phraseIndex: number
}

type Target = PhraseTarget | VocabTarget

function phrasesToTargets(lessonIds?: string[], language = 'hindi'): PhraseTarget[] {
  let lessons = getAllContent()
  // Lazy-load Dutch content when needed (avoids circular imports at module init)
  if (language === 'dutch') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getDutchAllContent } = require('@/lib/dutch/lessons')
    lessons = getDutchAllContent()
  }
  const filtered = lessonIds ? lessons.filter(l => lessonIds.includes(l.id)) : lessons
  const targets: PhraseTarget[] = []
  for (const lesson of filtered) {
    lesson.phrases.forEach((phrase: Phrase, index: number) => {
      targets.push({
        source: 'phrase',
        hindi: phrase.hindi,
        english: phrase.english,
        context: phrase.context,
        lessonId: lesson.id,
        phraseIndex: index,
      })
    })
  }
  return targets
}

function vocabToTargets(prefix = 'hindi'): VocabTarget[] {
  let explored: VocabWord[]
  if (prefix === 'dutch') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getDutchExploredVocabWords } = require('@/lib/dutch/vocabulary')
    explored = getDutchExploredVocabWords()
  } else {
    explored = getExploredVocabWords()
  }
  return explored.map((word: VocabWord) => ({
    source: 'vocab' as const,
    hindi: word.hindi,
    english: word.english,
    context: word.example,
    lessonId: 'vocab',
    phraseIndex: -1,
  }))
}

function generateTranslateToEnglish(target: Target, pool: Target[]): QuizQuestion {
  const wrong = pickRandom(pool, 3, [target])
  const answers: QuizAnswer[] = shuffle([
    { id: randomId(), text: target.english, isCorrect: true },
    ...wrong.map(p => ({ id: randomId(), text: p.english, isCorrect: false })),
  ])
  return {
    id: randomId(),
    type: 'translate-to-english',
    prompt: target.hindi,
    subPrompt: 'What does this mean in English?',
    answers,
    lessonId: target.lessonId,
    phraseIndex: target.phraseIndex,
    source: target.source,
  }
}

function generateTranslateToHindi(target: Target, pool: Target[]): QuizQuestion {
  const wrong = pickRandom(pool, 3, [target])
  const answers: QuizAnswer[] = shuffle([
    { id: randomId(), text: target.hindi, isCorrect: true },
    ...wrong.map(p => ({ id: randomId(), text: p.hindi, isCorrect: false })),
  ])
  return {
    id: randomId(),
    type: 'translate-to-hindi',
    prompt: target.english,
    subPrompt: 'How do you say this?',
    answers,
    lessonId: target.lessonId,
    phraseIndex: target.phraseIndex,
    source: target.source,
  }
}

function generateFillInBlank(target: PhraseTarget, allPhrases: PhraseTarget[]): QuizQuestion {
  const words = target.hindi.split(' ')
  if (words.length < 2) {
    return generateTranslateToEnglish(target, allPhrases)
  }
  const blankIndex = Math.floor(Math.random() * words.length)
  const correctWord = words[blankIndex]
  const blankedPhrase = words.map((w, i) => (i === blankIndex ? '___' : w)).join(' ')

  const otherWords = allPhrases
    .flatMap(p => p.hindi.split(' '))
    .filter(w => w !== correctWord && w.length > 1)
  const wrongWords = pickRandom([...new Set(otherWords)], 3)

  const answers: QuizAnswer[] = shuffle([
    { id: randomId(), text: correctWord, isCorrect: true },
    ...wrongWords.map(w => ({ id: randomId(), text: w, isCorrect: false })),
  ])
  return {
    id: randomId(),
    type: 'fill-in-blank',
    prompt: blankedPhrase,
    subPrompt: `Fill in the blank: "${target.english}"`,
    answers,
    lessonId: target.lessonId,
    phraseIndex: target.phraseIndex,
    source: 'phrase',
  }
}

function generateContextMatch(target: Target, pool: Target[]): QuizQuestion {
  const wrong = pickRandom(pool, 3, [target])
  const answers: QuizAnswer[] = shuffle([
    { id: randomId(), text: target.hindi, isCorrect: true },
    ...wrong.map(p => ({ id: randomId(), text: p.hindi, isCorrect: false })),
  ])
  return {
    id: randomId(),
    type: 'context-match',
    prompt: target.context,
    subPrompt: 'Which phrase fits this situation?',
    answers,
    lessonId: target.lessonId,
    phraseIndex: target.phraseIndex,
    source: target.source,
  }
}

const phraseQuizTypes: QuizType[] = ['translate-to-english', 'translate-to-hindi', 'fill-in-blank', 'context-match']
const vocabQuizTypes: QuizType[] = ['translate-to-english', 'translate-to-hindi', 'context-match']

function makePhraseQuestion(target: PhraseTarget, pool: PhraseTarget[]): QuizQuestion {
  const type = phraseQuizTypes[Math.floor(Math.random() * phraseQuizTypes.length)]
  switch (type) {
    case 'translate-to-english': return generateTranslateToEnglish(target, pool)
    case 'translate-to-hindi': return generateTranslateToHindi(target, pool)
    case 'fill-in-blank': return generateFillInBlank(target, pool)
    case 'context-match': return generateContextMatch(target, pool)
  }
}

function makeVocabQuestion(target: VocabTarget, pool: VocabTarget[]): QuizQuestion {
  const type = vocabQuizTypes[Math.floor(Math.random() * vocabQuizTypes.length)]
  switch (type) {
    case 'translate-to-english': return generateTranslateToEnglish(target, pool)
    case 'translate-to-hindi': return generateTranslateToHindi(target, pool)
    case 'context-match': return generateContextMatch(target, pool)
    default: return generateTranslateToEnglish(target, pool)
  }
}

export function generateQuiz(lessonIds: string[], count: number, language = 'hindi'): QuizQuestion[] {
  const phraseTargets = phrasesToTargets(lessonIds, language)
  if (phraseTargets.length === 0) return []

  const vocabTargets = vocabToTargets(language)
  const canMixVocab = vocabTargets.length >= 4

  let vocabCount = canMixVocab ? Math.round(count * 0.3) : 0
  vocabCount = Math.min(vocabCount, vocabTargets.length)
  const phraseCount = count - vocabCount

  const allPhrasePool = phrasesToTargets(undefined, language)

  const selectedPhrases = shuffle(phraseTargets).slice(0, phraseCount)
  const selectedVocab = shuffle(vocabTargets).slice(0, vocabCount)

  const phraseQuestions = selectedPhrases.map(t => makePhraseQuestion(t, allPhrasePool))
  const vocabQuestions = selectedVocab.map(t => makeVocabQuestion(t, vocabTargets))

  return shuffle([...phraseQuestions, ...vocabQuestions])
}

export interface QuizScore {
  score: number
  total: number
  date: string
  lessonIds: string[]
}

function quizScoresKey(prefix: string): string {
  return `${prefix}-quiz-scores`
}

export function saveQuizScore(score: number, total: number, lessonIds: string[], prefix = 'hindi'): void {
  if (typeof window === 'undefined') return
  const scores = getQuizScores(prefix)
  scores.push({ score, total, date: new Date().toISOString(), lessonIds })
  const trimmed = scores.slice(-50)
  localStorage.setItem(quizScoresKey(prefix), JSON.stringify(trimmed))
}

export function getQuizScores(prefix = 'hindi'): QuizScore[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(quizScoresKey(prefix))
  if (!stored) return []
  try {
    return JSON.parse(stored) as QuizScore[]
  } catch {
    return []
  }
}

export function getAverageQuizScore(prefix = 'hindi'): number {
  const scores = getQuizScores(prefix)
  if (scores.length === 0) return 0
  const total = scores.reduce((sum, s) => sum + (s.score / s.total) * 100, 0)
  return Math.round(total / scores.length)
}
