export interface Phrase {
  hindi: string
  english: string
  context: string
  pronunciation: string  // stress marks and syllable hints, e.g. "a-REY, kya HAAL hai?"
}

export interface SkillExample {
  hindi: string
  english: string
}

export interface SkillBreakdown {
  skill: string
  explanation: string
  more_examples: SkillExample[]
}

export interface TheoryTable {
  caption?: string
  columns: string[]
  rows: string[][]
}

export interface TheoryExample {
  hindi: string
  english: string
  breakdown?: string
}

export type CalloutTone = 'tip' | 'warning' | 'note'

export interface TheoryCallout {
  tone: CalloutTone
  body: string
}

export interface QuickCheck {
  question: string
  options: string[]
  correct_index: number
  explanation?: string
}

export interface TheorySection {
  heading: string
  body: string  // multi-paragraph prose split on \n\n
  table?: TheoryTable
  examples?: TheoryExample[]
  callout?: TheoryCallout
  cutting_intro?: string    // 1-sentence opener spoken by Cutting on this page
  quick_check?: QuickCheck  // optional gate question — must be answered correctly to advance
}

export interface Theory {
  intro: string
  sections: TheorySection[]
  wrap_up?: string
}

export interface Lesson {
  id: string
  title: string
  situation: string
  skills: string[]
  phrases: Phrase[]
  grammar_notes: string[]
  culture_notes: string[]
  skill_breakdown: SkillBreakdown[]
  practice_prompt: string
  references?: string[]
  level?: 'A1' | 'A2' | 'B1'
  exam_targeted?: boolean
  theory?: Theory
}
