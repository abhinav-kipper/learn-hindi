import { QuizQuestion, QuizAnswer, QuizType } from '@/types/quiz'
import { getAllContent } from '@/lib/lessons'
import { Phrase } from '@/types/lesson'

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

interface PhraseWithMeta {
  phrase: Phrase
  lessonId: string
  phraseIndex: number
}

function getAllPhrases(lessonIds?: string[]): PhraseWithMeta[] {
  const lessons = getAllContent()
  const filtered = lessonIds
    ? lessons.filter(l => lessonIds.includes(l.id))
    : lessons

  const phrases: PhraseWithMeta[] = []
  for (const lesson of filtered) {
    lesson.phrases.forEach((phrase, index) => {
      phrases.push({ phrase, lessonId: lesson.id, phraseIndex: index })
    })
  }
  return phrases
}

function generateTranslateToEnglish(target: PhraseWithMeta, allPhrases: PhraseWithMeta[]): QuizQuestion {
  const wrongPhrases = pickRandom(allPhrases, 3, [target])
  const answers: QuizAnswer[] = shuffle([
    { id: randomId(), text: target.phrase.english, isCorrect: true },
    ...wrongPhrases.map(p => ({ id: randomId(), text: p.phrase.english, isCorrect: false })),
  ])

  return {
    id: randomId(),
    type: 'translate-to-english',
    prompt: target.phrase.hindi,
    subPrompt: 'What does this mean in English?',
    answers,
    lessonId: target.lessonId,
    phraseIndex: target.phraseIndex,
  }
}

function generateTranslateToHindi(target: PhraseWithMeta, allPhrases: PhraseWithMeta[]): QuizQuestion {
  const wrongPhrases = pickRandom(allPhrases, 3, [target])
  const answers: QuizAnswer[] = shuffle([
    { id: randomId(), text: target.phrase.hindi, isCorrect: true },
    ...wrongPhrases.map(p => ({ id: randomId(), text: p.phrase.hindi, isCorrect: false })),
  ])

  return {
    id: randomId(),
    type: 'translate-to-hindi',
    prompt: target.phrase.english,
    subPrompt: 'How do you say this in Hindi?',
    answers,
    lessonId: target.lessonId,
    phraseIndex: target.phraseIndex,
  }
}

function generateFillInBlank(target: PhraseWithMeta, allPhrases: PhraseWithMeta[]): QuizQuestion {
  const words = target.phrase.hindi.split(' ')
  if (words.length < 2) {
    return generateTranslateToEnglish(target, allPhrases)
  }

  const blankIndex = Math.floor(Math.random() * words.length)
  const correctWord = words[blankIndex]
  const blankedPhrase = words.map((w, i) => i === blankIndex ? '___' : w).join(' ')

  const otherWords = allPhrases
    .flatMap(p => p.phrase.hindi.split(' '))
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
    subPrompt: `Fill in the blank: "${target.phrase.english}"`,
    answers,
    lessonId: target.lessonId,
    phraseIndex: target.phraseIndex,
  }
}

function generateContextMatch(target: PhraseWithMeta, allPhrases: PhraseWithMeta[]): QuizQuestion {
  const wrongPhrases = pickRandom(allPhrases, 3, [target])
  const answers: QuizAnswer[] = shuffle([
    { id: randomId(), text: target.phrase.hindi, isCorrect: true },
    ...wrongPhrases.map(p => ({ id: randomId(), text: p.phrase.hindi, isCorrect: false })),
  ])

  return {
    id: randomId(),
    type: 'context-match',
    prompt: target.phrase.context,
    subPrompt: 'Which phrase fits this situation?',
    answers,
    lessonId: target.lessonId,
    phraseIndex: target.phraseIndex,
  }
}

const quizGenerators: Record<QuizType, (target: PhraseWithMeta, all: PhraseWithMeta[]) => QuizQuestion> = {
  'translate-to-english': generateTranslateToEnglish,
  'translate-to-hindi': generateTranslateToHindi,
  'fill-in-blank': generateFillInBlank,
  'context-match': generateContextMatch,
}

const quizTypes: QuizType[] = ['translate-to-english', 'translate-to-hindi', 'fill-in-blank', 'context-match']

export function generateQuiz(lessonIds: string[], count: number): QuizQuestion[] {
  const allPhrases = getAllPhrases()
  const targetPhrases = getAllPhrases(lessonIds)

  if (targetPhrases.length === 0) return []

  const selected = shuffle(targetPhrases).slice(0, count)
  const questions: QuizQuestion[] = selected.map(target => {
    const type = quizTypes[Math.floor(Math.random() * quizTypes.length)]
    return quizGenerators[type](target, allPhrases)
  })

  return questions
}

// Store quiz scores in localStorage
const QUIZ_SCORES_KEY = 'hindi-quiz-scores'

export interface QuizScore {
  score: number
  total: number
  date: string
  lessonIds: string[]
}

export function saveQuizScore(score: number, total: number, lessonIds: string[]): void {
  if (typeof window === 'undefined') return
  const scores = getQuizScores()
  scores.push({ score, total, date: new Date().toISOString(), lessonIds })
  // Keep only last 50 scores
  const trimmed = scores.slice(-50)
  localStorage.setItem(QUIZ_SCORES_KEY, JSON.stringify(trimmed))
}

export function getQuizScores(): QuizScore[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(QUIZ_SCORES_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored) as QuizScore[]
  } catch {
    return []
  }
}

export function getAverageQuizScore(): number {
  const scores = getQuizScores()
  if (scores.length === 0) return 0
  const total = scores.reduce((sum, s) => sum + (s.score / s.total) * 100, 0)
  return Math.round(total / scores.length)
}
