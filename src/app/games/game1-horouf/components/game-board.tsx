'use client'

import { useEffect, useState } from 'react'
import type { HoroufGameState, TeamId } from '../types'
import { playRoundWinSound } from '../utils/sounds'
import HexGrid from './hex-grid'
import ControlPanel from './control-panel'

interface GameBoardProps {
  gameState: HoroufGameState
  onSelectCell: (cellId: string) => void
  onShowAnswer: () => void
  onNewQuestion: () => void
  onAwardPoint: (teamId: TeamId) => void
  onAdvanceFromWinReveal: () => void
}

export default function GameBoard({
  gameState,
  onSelectCell,
  onShowAnswer,
  onNewQuestion,
  onAwardPoint,
  onAdvanceFromWinReveal,
}: GameBoardProps) {
  const { teams, gridSize, currentRound, phase } = gameState
  const round = currentRound!
  const isWinReveal = phase === 'win-reveal'

  const [flashOpacity, setFlashOpacity] = useState(0)

  const winnerTeam = round.winner ? teams.find((t) => t.id === round.winner) : null
  const winnerColor = winnerTeam?.color ?? '#E8A838'

  useEffect(() => {
    if (!isWinReveal) return
    playRoundWinSound()
    const flashTimer = setTimeout(() => setFlashOpacity(0.2), 0)
    const fadeTimer = setTimeout(() => setFlashOpacity(0), 200)
    const advanceTimer = setTimeout(onAdvanceFromWinReveal, 3000)
    return () => {
      clearTimeout(flashTimer)
      clearTimeout(fadeTimer)
      clearTimeout(advanceTimer)
    }
  }, [isWinReveal, onAdvanceFromWinReveal])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg-primary">
      {/* Win flash overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-40 transition-opacity duration-200"
        style={{ backgroundColor: winnerColor, opacity: flashOpacity }}
      />

      {/* First child renders on RIGHT in RTL flex-row */}
      <div className="w-[360px] shrink-0 h-full">
        <ControlPanel
          roundNumber={round.roundNumber}
          currentCell={round.currentCell}
          currentQuestion={round.currentQuestion}
          isLoadingQuestion={round.isLoadingQuestion}
          showAnswer={round.showAnswer}
          teams={teams}
          onShowAnswer={onShowAnswer}
          onNewQuestion={onNewQuestion}
          onAwardPoint={onAwardPoint}
        />
      </div>

      {/* Second child renders on LEFT in RTL */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* ── Full-panel corner triangles ─────────────────────────────────
            team1 connects top↔bottom  →  top + bottom triangles
            team2 connects left↔right  →  right + left triangles      */}
        <div
          className="absolute inset-0 opacity-50"
          style={{ clipPath: 'polygon(100% 0%, 100% 100%, 50% 50%)', backgroundColor: teams[1].color }}
        />
        <div
          className="absolute inset-0 opacity-50"
          style={{ clipPath: 'polygon(0% 0%, 0% 100%, 50% 50%)', backgroundColor: teams[1].color }}
        />
        <div
          className="absolute inset-0 opacity-50"
          style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 50%)', backgroundColor: teams[0].color }}
        />
        <div
          className="absolute inset-0 opacity-50"
          style={{ clipPath: 'polygon(0% 100%, 100% 100%, 50% 50%)', backgroundColor: teams[0].color }}
        />
        <div className="relative z-10">
          <HexGrid
            grid={round.grid}
            gridSize={gridSize}
            teams={teams}
            onCellClick={onSelectCell}
            isWinReveal={isWinReveal}
            winningPath={round.winningPath}
          />
        </div>
      </div>
    </div>
  )
}
