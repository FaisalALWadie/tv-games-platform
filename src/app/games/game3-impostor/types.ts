export type ImpPhase =
  | 'lobby'
  | 'word_reveal'
  | 'discussion'
  | 'voting'
  | 'reveal'
  | 'game_over'

export interface ImpSettings {
  maxPlayers: number
  numImpostors: number
  timePerRound: number
  totalRounds: number
  categoryId: string
}

export const DEFAULT_IMP_SETTINGS: ImpSettings = {
  maxPlayers: 8,
  numImpostors: 1,
  timePerRound: 60,
  totalRounds: 5,
  categoryId: 'objects',
}

export interface ImpPlayer {
  id: string
  socketId: string
  name: string
  isEliminated: boolean
  hasVoted: boolean
}

export interface ImpVoteResult {
  eliminatedName: string
  wasImpostor: boolean
  voteCounts: Record<string, number>
  secretWord: string
  categoryName: string
}

export interface ImpStatePayload {
  roomCode: string
  phase: ImpPhase
  settings: ImpSettings
  players: ImpPlayer[]
  currentRound: number
  currentCategoryName: string
  votes: Record<string, string>
  scores: { innocents: number; impostors: number }
  voteResult: ImpVoteResult | null
  winner: 'innocents' | 'impostors' | null
  timerStartedAt: number | null
  revealedImpostorNames: string[]
}

export interface ImpWordPayload {
  word: string | null
  isImpostor: boolean
  categoryName: string
  roundNumber: number
}
