import { ChaiStallScene } from './ChaiStallScene'
import { BazaarScene } from './BazaarScene'
import { NaniHouseScene } from './NaniHouseScene'
import { NarratorCard } from './NarratorCard'
import type { SceneId } from '@/types/story'

export const SCENES: Record<SceneId, React.ComponentType> = {
  'chai-stall': ChaiStallScene,
  bazaar: BazaarScene,
  'nani-house': NaniHouseScene,
  'narrator-card': NarratorCard,
}

export { ChaiStallScene, BazaarScene, NaniHouseScene, NarratorCard }
