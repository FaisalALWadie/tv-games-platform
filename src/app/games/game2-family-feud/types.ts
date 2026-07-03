export interface GameSettings {
  team1MaxPlayers: number
  team2MaxPlayers: number
  team1Name: string
  team2Name: string
  totalRounds: number
}

export const DEFAULT_SETTINGS: GameSettings = {
  team1MaxPlayers: 4,
  team2MaxPlayers: 4,
  team1Name: 'الفريق الأول',
  team2Name: 'الفريق الثاني',
  totalRounds: 10,
}

export interface Answer {
  text: string
  points: number
  revealed: boolean
  aliases?: string[]
}

export interface Question {
  id: string
  text: string
  answers: Answer[]
}

export interface FFPlayer {
  id: string
  socketId: string
  name: string
  teamId: 1 | 2
  isConnected: boolean
}

export interface Team {
  id: 1 | 2
  name: string
  maxPlayers: number
  score: number
  mistakes: number
  isLockedOut: boolean
}

export interface BuzzerState {
  buzzedPlayerId: string | null     // socket ID
  buzzedPlayerName: string | null
  buzzedTeamId: 1 | 2 | null
}

export type GameStatus = 'waiting' | 'playing' | 'question_end' | 'game_over'

export interface FFGameState {
  roomCode: string
  hostSocketId: string
  players: FFPlayer[]
  teams: { 1: Team; 2: Team }
  settings: GameSettings
  questions: Question[]
  questionIndex: number
  status: GameStatus
  buzzer: BuzzerState
  winner?: 1 | 2
}

export interface RoomStatePayload {
  roomCode: string
  players: FFPlayer[]
  teams: { 1: Team; 2: Team }
  settings: GameSettings
  questionIndex: number
  question: Question | null
  status: GameStatus
  buzzer: BuzzerState
  winner?: 1 | 2
}

export interface AnswerResultPayload {
  playerId: string
  playerName: string
  teamId: 1 | 2 | null
  correct: boolean
  answerIndex?: number
  points?: number
}
