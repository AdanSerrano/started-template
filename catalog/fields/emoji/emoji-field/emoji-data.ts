import {
  Clock,
  Coffee,
  Flag,
  Hash,
  Heart,
  Leaf,
  Smile,
  Star,
} from 'lucide-react'
import {
  ACTIVITIES_EMOJIS,
  TRAVEL_EMOJIS,
  SYMBOLS_EMOJIS,
} from './emoji-activities'
import { NATURE_EMOJIS, FOOD_EMOJIS } from './emoji-nature'
import { SMILEYS_EMOJIS, LOVE_EMOJIS } from './emoji-smileys'

export interface EmojiCategory {
  id: string
  name: string
  icon: React.ElementType
  emojis: string[]
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'recent',
    name: 'Recent',
    icon: Clock,
    emojis: [],
  },
  {
    id: 'smileys',
    name: 'Smileys',
    icon: Smile,
    emojis: SMILEYS_EMOJIS,
  },
  {
    id: 'love',
    name: 'Love',
    icon: Heart,
    emojis: LOVE_EMOJIS,
  },
  {
    id: 'nature',
    name: 'Nature',
    icon: Leaf,
    emojis: NATURE_EMOJIS,
  },
  {
    id: 'food',
    name: 'Food',
    icon: Coffee,
    emojis: FOOD_EMOJIS,
  },
  {
    id: 'activities',
    name: 'Activities',
    icon: Star,
    emojis: ACTIVITIES_EMOJIS,
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: Flag,
    emojis: TRAVEL_EMOJIS,
  },
  {
    id: 'symbols',
    name: 'Symbols',
    icon: Hash,
    emojis: SYMBOLS_EMOJIS,
  },
]
