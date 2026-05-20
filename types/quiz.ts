export type QuizType = 'translate-to-english' | 'translate-to-hindi' | 'fill-in-blank' | 'context-match'

export interface QuizAnswer {
  id: string
  text: string
  isCorrect: boolean
}

export interface QuizQuestion {
  id: string
  type: QuizType
  prompt: string
  subPrompt?: string
  answers: QuizAnswer[]
  lessonId: string
  phraseIndex: number
}

export interface QuizResult {
  questionId: string
  selectedAnswerId: string
  isCorrect: boolean
}

export interface QuizSession {
  questions: QuizQuestion[]
  results: QuizResult[]
  score: number
  completedAt: string
}
