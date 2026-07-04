export type TabooPhase = 'lobby' | 'playing' | 'turn_end' | 'finished'

export type TabooDifficulty = 'Easy' | 'Medium' | 'Hard'

export interface TabooCard {
  id: number
  targetWord: string
  tabooWords: string[]
  difficulty: TabooDifficulty
}

export interface TabooPlayer {
  id: string
  socketId: string
  name: string   // = team name (used as unique identifier)
  score: number
  colorIndex: number
}

export interface TabooSettings {
  totalRounds: number
  difficulty: TabooDifficulty
}

export const DEFAULT_TABOO_SETTINGS: TabooSettings = {
  totalRounds: 3,
  difficulty: 'Medium',
}

export interface TabooStatePayload {
  roomCode: string
  phase: TabooPhase
  settings: TabooSettings
  players: TabooPlayer[]
  currentTurnIndex: number
  totalTurns: number
  turnScore: number
  winner: string | null
}

export const PLAYER_COLOR_CLASSES = [
  { bg: 'bg-red-500',    phoneBg: 'bg-red-600',    text: 'text-red-400',    border: 'border-red-500',    btnHover: 'hover:bg-red-500'    },
  { bg: 'bg-blue-500',   phoneBg: 'bg-blue-600',   text: 'text-blue-400',   border: 'border-blue-500',   btnHover: 'hover:bg-blue-500'   },
  { bg: 'bg-green-500',  phoneBg: 'bg-green-600',  text: 'text-green-400',  border: 'border-green-500',  btnHover: 'hover:bg-green-500'  },
  { bg: 'bg-yellow-400', phoneBg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-400', btnHover: 'hover:bg-yellow-400' },
  { bg: 'bg-purple-500', phoneBg: 'bg-purple-600', text: 'text-purple-400', border: 'border-purple-500', btnHover: 'hover:bg-purple-500' },
  { bg: 'bg-pink-500',   phoneBg: 'bg-pink-600',   text: 'text-pink-400',   border: 'border-pink-500',   btnHover: 'hover:bg-pink-500'   },
  { bg: 'bg-orange-500', phoneBg: 'bg-orange-600', text: 'text-orange-400', border: 'border-orange-500', btnHover: 'hover:bg-orange-500' },
  { bg: 'bg-teal-500',   phoneBg: 'bg-teal-600',   text: 'text-teal-400',   border: 'border-teal-500',   btnHover: 'hover:bg-teal-500'   },
]
