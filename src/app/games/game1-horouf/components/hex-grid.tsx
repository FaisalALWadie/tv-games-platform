'use client'

import type { GridSize, HexCell, TeamConfig, TeamId } from '../types'
import HexCellComponent from './hex-cell'

const DIMS: Record<GridSize, { w: number; h: number; gap: number }> = {
  4: { w: 100, h: 112, gap: 4 },
  5: { w: 90, h: 100, gap: 4 },
  6: { w: 75, h: 86, gap: 4 },
}

// Extra space around the grid so the corner triangles are visible
const PAD = 28

interface HexGridProps {
  grid: HexCell[][]
  gridSize: GridSize
  teams: [TeamConfig, TeamConfig]
  onCellClick: (cellId: string) => void
  isWinReveal?: boolean
  winningPath?: string[]
}

export default function HexGrid({ grid, gridSize, teams, onCellClick, isWinReveal = false, winningPath = [] }: HexGridProps) {
  const { w, h, gap } = DIMS[gridSize]
  const N = gridSize
  const hSpacing = w + gap
  const vSpacing = Math.round(h * 0.75 + gap * 0.5)
  const rowOffset = hSpacing / 2

  const totalWidth = (N - 1) * hSpacing + (N - 1) * rowOffset + w
  const totalHeight = (N - 1) * vSpacing + h

  const containerW = totalWidth + PAD * 2
  const containerH = totalHeight + PAD * 2

  const teamColorMap = Object.fromEntries(teams.map((t) => [t.id, t.color])) as Record<TeamId, string>

  return (
    <div className="relative select-none" style={{ width: containerW, height: containerH }}>

      {/* ── Hex cells ───────────────────────────────────────────────── */}
      <div className="absolute" style={{ top: PAD, left: PAD, width: totalWidth, height: totalHeight }}>
        {grid.map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            const x = colIdx * hSpacing + (N - 1 - rowIdx) * rowOffset
            const y = rowIdx * vSpacing
            return (
              <div key={cell.id} className="absolute" style={{ left: x, top: y }}>
                <HexCellComponent
                  cell={cell}
                  teamColor={cell.owner ? teamColorMap[cell.owner] : null}
                  gridSize={gridSize}
                  onClick={onCellClick}
                  isWinReveal={isWinReveal}
                  isWinningCell={winningPath.includes(cell.id)}
                />
              </div>
            )
          })
        )}
      </div>

    </div>
  )
}
