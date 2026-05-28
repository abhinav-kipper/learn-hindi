import { ChaiStallScene } from './ChaiStallScene'
import { BazaarScene } from './BazaarScene'
import { NaniHouseScene } from './NaniHouseScene'
import { NarratorCard } from './NarratorCard'
import { DiwaliRooftopScene } from './DiwaliRooftopScene'
import { ClinicScene } from './ClinicScene'
import type { SceneId } from '@/types/story'

export const SCENES: Record<SceneId, React.ComponentType> = {
  'chai-stall': ChaiStallScene,
  bazaar: BazaarScene,
  'nani-house': NaniHouseScene,
  'narrator-card': NarratorCard,
  'diwali-rooftop': DiwaliRooftopScene,
  clinic: ClinicScene,
}

export { ChaiStallScene, BazaarScene, NaniHouseScene, NarratorCard, DiwaliRooftopScene, ClinicScene }
