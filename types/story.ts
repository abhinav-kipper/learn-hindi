export type SceneId = 'chai-stall' | 'bazaar' | 'nani-house' | 'narrator-card'

export type SpeakerPosition = 'left' | 'right' | 'center'

export interface Panel {
  scene: SceneId
  hindi: string
  english: string
  speaker?: string
  speaker_position?: SpeakerPosition
  pronunciation?: string
}

export interface Story {
  id: string
  title: string
  description: string
  panels: Panel[]
  level?: 'A1' | 'A2' | 'B1'
  skill_tags?: string[]
}
