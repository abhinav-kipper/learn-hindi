import { describe, it, expect, beforeEach } from 'vitest'
import {
  getClips,
  getClipById,
  getClipsByTier,
  buildAudioScript,
  drawMockSet,
  scoreMockAttempt,
  saveMockAttempt,
  getMockHistory,
  markClipStudied,
  isStudied,
  getStudiedCount,
  PASS_THRESHOLD,
  MOCK_SIZE,
  QUESTIONS_PER_CLIP,
  type LuisterClip,
} from './luisteren'

beforeEach(() => {
  localStorage.clear()
})

describe('luisteren content', () => {
  it('loads at least 10 clips', () => {
    expect(getClips().length).toBeGreaterThanOrEqual(10)
  })

  it('every clip is well-formed: id, tier, format, lines, 4 bilingual questions', () => {
    for (const c of getClips()) {
      expect(c.id).toMatch(/^luister-\d{3}$/)
      expect(['A1', 'A2', 'B1']).toContain(c.tier)
      expect(['monologue', 'dialogue']).toContain(c.format)
      expect(c.title_nl.length).toBeGreaterThan(0)
      expect(c.title_en.length).toBeGreaterThan(0)
      expect(c.lines.length).toBeGreaterThan(0)
      for (const l of c.lines) {
        expect(l.nl.length).toBeGreaterThan(0)
        expect(l.en.length).toBeGreaterThan(0)
      }
      expect(c.questions.length).toBe(QUESTIONS_PER_CLIP)
      for (const q of c.questions) {
        expect(['hoofdgedachte', 'detail', 'woordbetekenis', 'gevolg']).toContain(q.type)
        expect(q.options_nl.length).toBe(4)
        expect(q.options_en.length).toBe(4)
        expect(q.correct_index).toBeGreaterThanOrEqual(0)
        expect(q.correct_index).toBeLessThanOrEqual(3)
        expect(q.explanation_en.length).toBeGreaterThan(0)
      }
    }
  })

  it('dialogue clips label their speakers', () => {
    for (const c of getClips().filter((c) => c.format === 'dialogue')) {
      expect(c.lines.every((l) => typeof l.speaker === 'string' && l.speaker.length > 0)).toBe(true)
    }
  })

  it('clip ids are unique', () => {
    const ids = getClips().map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('covers all three tiers', () => {
    expect(getClipsByTier('A1').length).toBeGreaterThan(0)
    expect(getClipsByTier('A2').length).toBeGreaterThan(0)
    expect(getClipsByTier('B1').length).toBeGreaterThan(0)
  })
})

describe('luisteren helpers', () => {
  it('getClipById finds by id', () => {
    const first = getClips()[0]
    expect(getClipById(first.id)?.id).toBe(first.id)
    expect(getClipById('nope-000')).toBeUndefined()
  })

  it('buildAudioScript joins lines without speaker labels', () => {
    const clip: LuisterClip = {
      id: 'luister-999',
      tier: 'A1',
      topic: 'test',
      format: 'dialogue',
      title_nl: 't',
      title_en: 't',
      lines: [
        { speaker: 'A', nl: 'Hallo.', en: 'Hello.' },
        { speaker: 'B', nl: 'Goedemorgen.', en: 'Good morning.' },
      ],
      questions: [],
    }
    expect(buildAudioScript(clip)).toBe('Hallo. Goedemorgen.')
    expect(buildAudioScript(clip)).not.toContain('A:')
  })

  it('drawMockSet returns MOCK_SIZE clips', () => {
    expect(drawMockSet().length).toBe(MOCK_SIZE)
  })
})

describe('luisteren scoring', () => {
  it('scores a perfect attempt as passed', () => {
    const clips = getClips().slice(0, 2)
    const answers = clips.flatMap((c) => c.questions.map((q) => q.correct_index))
    const r = scoreMockAttempt(clips, answers)
    expect(r.score).toBe(r.total)
    expect(r.passed).toBe(true)
  })

  it('fails an all-wrong attempt', () => {
    const clips = getClips().slice(0, 2)
    const answers = clips.flatMap((c) =>
      c.questions.map((q) => ((q.correct_index + 1) % 4) as 0 | 1 | 2 | 3),
    )
    const r = scoreMockAttempt(clips, answers)
    expect(r.score).toBe(0)
    expect(r.passed).toBe(false)
  })

  it('PASS_THRESHOLD is 0.8', () => {
    expect(PASS_THRESHOLD).toBe(0.8)
  })
})

describe('luisteren progress tracking', () => {
  it('markClipStudied + isStudied + getStudiedCount', () => {
    expect(getStudiedCount()).toBe(0)
    markClipStudied('luister-001')
    markClipStudied('luister-001')
    markClipStudied('luister-002')
    expect(isStudied('luister-001')).toBe(true)
    expect(isStudied('luister-003')).toBe(false)
    expect(getStudiedCount()).toBe(2)
  })

  it('mock attempts persist most-recent-first', () => {
    saveMockAttempt({ ts: 1, score: 16, total: 20, passed: true, clip_ids: ['a'] })
    saveMockAttempt({ ts: 2, score: 10, total: 20, passed: false, clip_ids: ['b'] })
    const h = getMockHistory()
    expect(h.length).toBe(2)
    expect(h[0].ts).toBe(2)
  })

  it('getMockHistory returns [] on corrupt JSON', () => {
    localStorage.setItem('dutch-luisteren-mock-attempts', 'broken{')
    expect(getMockHistory()).toEqual([])
  })
})
