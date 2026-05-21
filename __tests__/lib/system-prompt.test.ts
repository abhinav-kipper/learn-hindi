import { describe, it, expect } from 'vitest'
import { buildSystemPrompt } from '@/lib/system-prompt'
import { Lesson } from '@/types/lesson'

const mockLesson: Lesson = {
  id: 'test',
  title: 'Test Lesson',
  situation: 'Test situation',
  skills: ['test skill'],
  phrases: [
    { hindi: 'namaste', english: 'hello', context: 'greeting', pronunciation: 'na-MAS-te' },
  ],
  grammar_notes: ['test note'],
  culture_notes: [],
  skill_breakdown: [],
  practice_prompt: 'Practice having a conversation about testing.',
}

describe('buildSystemPrompt', () => {
  it('includes the practice prompt from the lesson', () => {
    const result = buildSystemPrompt(mockLesson)
    expect(result).toContain('Practice having a conversation about testing.')
  })

  it('includes key phrases from the lesson', () => {
    const result = buildSystemPrompt(mockLesson)
    expect(result).toContain('namaste')
  })

  it('instructs AI to use romanized Hindi', () => {
    const result = buildSystemPrompt(mockLesson)
    expect(result).toContain('roman')
  })

  it('instructs AI to correct mistakes gently', () => {
    const result = buildSystemPrompt(mockLesson)
    expect(result).toContain('correct')
  })
})
