// Games — currently the "Duel": a fast binary-choice game for the distinctions
// learners chronically mix up (Hindi gender, later Dutch de/het, etc.).

export interface DuelItem {
  /** the word/phrase shown on the card */
  prompt: string
  /** which side is correct */
  answer: 'left' | 'right'
  /** optional emoji shown above the prompt */
  emoji?: string
  /** short English meaning */
  hint?: string
  /** 1-sentence why, shown on reveal + saved as a mistake when wrong */
  explain?: string
}

export interface DuelSide {
  /** button label, e.g. "MASCULINE" */
  label: string
  /** rule bullets shown on the intro/rules screen */
  bullets: string[]
}

export interface Duel {
  id: string
  language: 'hindi' | 'dutch'
  title: string
  subtitle: string
  /** the clear instruction shown on every round, e.g. "Does it take 'ne'?" */
  question?: string
  /** friendly tactic shown in the intro tip box */
  tip?: string
  left: DuelSide
  right: DuelSide
  /** how many rounds to draw per play (default 30) */
  rounds?: number
  items: DuelItem[]
}
