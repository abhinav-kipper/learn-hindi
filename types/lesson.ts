export interface Phrase {
  hindi: string
  english: string
  context: string
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
}
