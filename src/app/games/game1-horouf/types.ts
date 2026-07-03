// All TypeScript types for the حروف (Horouf) hex-grid trivia game.

export type GridSize = 4 | 5 | 6

export type TeamId = 'team1' | 'team2'

export interface HexCell {
  id: string          // format: "r{row}c{col}", e.g. "r0c2"
  row: number
  col: number
  letter: string      // single Arabic letter
  owner: TeamId | null
  isSelected: boolean // host has this cell highlighted
}

export interface TeamConfig {
  id: TeamId
  name: string        // Arabic display name
  color: string       // hex color value, e.g. "#34D399"
  score: number       // rounds won in the current match
}

export interface Question {
  id: string
  letter: string      // Arabic letter that the answer starts with
  text: string        // question text in Arabic
  answer: string      // correct answer in Arabic
}

export type GamePhase =
  | 'setup'
  | 'round-intro'
  | 'playing'
  | 'win-reveal'
  | 'round-end'
  | 'match-end'

// Rounds needed to win the match: 1 = best-of-1, 2 = best-of-3, 3 = best-of-5.
export type RoundsToWin = 1 | 2 | 3

export interface RoundState {
  roundNumber: number          // 1-indexed
  grid: HexCell[][]            // grid[row][col]
  currentCell: HexCell | null  // cell the host has selected
  currentQuestion: Question | null
  isLoadingQuestion: boolean
  showAnswer: boolean
  winner: TeamId | null        // set when a team wins this round
  winningPath: string[]        // cell IDs forming the winning connection
}

export interface HoroufGameState {
  phase: GamePhase
  gridSize: GridSize
  roundsToWin: RoundsToWin
  teams: [TeamConfig, TeamConfig]  // always exactly 2 teams
  currentRound: RoundState | null  // null only during 'setup' phase
  hostName: string
  isMatchWin: boolean              // true when win-reveal follows a match-ending win
}

export interface HoroufSettings {
  gridSize: GridSize
  roundsToWin: RoundsToWin
  hostName: string
  team1Name: string
  team2Name: string
  team1Color: string
  team2Color: string
}
